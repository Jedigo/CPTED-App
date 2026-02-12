import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/database';
import type { Photo } from '../types';

/**
 * Compress an image file by resizing to fit within maxDim and re-encoding as JPEG.
 */
export function compressImage(
  file: File,
  maxDim = 1920,
  quality = 0.8,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;

      // Scale down if either dimension exceeds maxDim
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round(height * (maxDim / width));
          width = maxDim;
        } else {
          width = Math.round(width * (maxDim / height));
          height = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Canvas toBlob returned null'));
          }
        },
        'image/jpeg',
        quality,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Best-effort GPS coordinates from the device. Returns null if unavailable or denied.
 */
export function getGPSCoordinates(): Promise<{ lat: number; lng: number } | null> {
  if (!navigator.geolocation) return Promise.resolve(null);

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 30000 },
    );
  });
}

/**
 * Compress, tag with GPS, store in IndexedDB, and link to the ItemScore.
 */
export async function savePhoto(
  file: File,
  assessmentId: string,
  itemScoreId: string,
  zoneKey: string,
): Promise<string> {
  // Compress and get GPS in parallel
  const [blob, gps] = await Promise.all([
    compressImage(file),
    getGPSCoordinates(),
  ]);

  const photoId = uuidv4();

  const photo: Photo = {
    id: photoId,
    assessment_id: assessmentId,
    item_score_id: itemScoreId,
    zone_key: zoneKey,
    captured_at: new Date().toISOString(),
    blob,
    filename: file.name || `photo_${photoId}.jpg`,
    mime_type: 'image/jpeg',
    gps_lat: gps?.lat ?? null,
    gps_lng: gps?.lng ?? null,
    compass_heading: null,
    annotation_data: null,
    synced: false,
  };

  await db.transaction('rw', db.photos, db.item_scores, async () => {
    await db.photos.add(photo);

    const itemScore = await db.item_scores.get(itemScoreId);
    if (itemScore) {
      await db.item_scores.update(itemScoreId, {
        photo_ids: [...itemScore.photo_ids, photoId],
      });
    }
  });

  return photoId;
}

/**
 * Delete a photo from IndexedDB and remove its reference from the ItemScore.
 */
export async function deletePhoto(
  photoId: string,
  itemScoreId: string,
): Promise<void> {
  await db.transaction('rw', db.photos, db.item_scores, async () => {
    await db.photos.delete(photoId);

    const itemScore = await db.item_scores.get(itemScoreId);
    if (itemScore) {
      await db.item_scores.update(itemScoreId, {
        photo_ids: itemScore.photo_ids.filter((id) => id !== photoId),
      });
    }
  });
}
