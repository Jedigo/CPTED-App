import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/database';
import { touchAssessment, touchAssessmentForItem } from './touch';
import type { Photo } from '../types';

/**
 * Compress an image file by resizing to fit within maxDim and re-encoding as JPEG.
 * Returns a base64 data URL string.
 */
export function compressImage(
  file: File,
  maxDim = 1920,
  quality = 0.8,
): Promise<string> {
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
      resolve(canvas.toDataURL('image/jpeg', quality));
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Worst fix, in metres, we are willing to record on a photo.
 *
 * The field iPads are Wi-Fi-only: they have no GNSS receiver, so a "location"
 * is a lookup of the surrounding Wi-Fi networks. Tethered to a phone hotspot in
 * a parking lot — a network with no fixed position in Apple's database — the
 * device falls back to a coarse network/IP-level guess and reports it with the
 * same confident shape as a real fix. A photo in a Sheriff's Office report
 * geotagged to the wrong parcel is worse than one with no geotag at all, so a
 * fix this loose is discarded rather than stored.
 *
 * 30 m is roughly a residential lot width: closer than this identifies the
 * property, looser than this could name the neighbour's.
 */
export const GPS_ACCURACY_LIMIT_M = 30;

export interface GPSFix {
  lat: number;
  lng: number;
  /** Radius of 95% confidence in metres, as reported by the device. */
  accuracy: number;
}

/**
 * Best-effort GPS coordinates from the device. Returns null if unavailable,
 * denied, or too imprecise to attribute to a property (see
 * GPS_ACCURACY_LIMIT_M).
 *
 * Note this only works on a secure origin — over plain http the browser
 * rejects the request outright, which is what silently disabled photo
 * geotagging before the app moved to https.
 */
export function getGPSCoordinates(): Promise<GPSFix | null> {
  if (!navigator.geolocation) return Promise.resolve(null);

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        // A device that cannot state its accuracy cannot be trusted to be
        // accurate. Treat a missing figure as a failed fix.
        if (typeof accuracy !== 'number' || !Number.isFinite(accuracy)) {
          resolve(null);
          return;
        }
        if (accuracy > GPS_ACCURACY_LIMIT_M) {
          console.warn(
            `Discarding photo GPS: accuracy ${Math.round(accuracy)}m exceeds ` +
              `the ${GPS_ACCURACY_LIMIT_M}m limit.`,
          );
          resolve(null);
          return;
        }

        resolve({ lat: latitude, lng: longitude, accuracy });
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
  const [data, gps] = await Promise.all([
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
    data,
    filename: file.name || `photo_${photoId}.jpg`,
    mime_type: 'image/jpeg',
    gps_lat: gps?.lat ?? null,
    gps_lng: gps?.lng ?? null,
    gps_accuracy_m: gps?.accuracy ?? null,
    compass_heading: null,
    annotation_data: null,
    synced: false,
  };

  // db.assessments joins the scope so touchAssessment can run inside — Dexie
  // rejects a nested transaction touching a table the outer scope omits.
  await db.transaction('rw', db.photos, db.item_scores, db.assessments, async () => {
    await db.photos.add(photo);

    const itemScore = await db.item_scores.get(itemScoreId);
    if (itemScore) {
      await db.item_scores.update(itemScoreId, {
        photo_ids: [...itemScore.photo_ids, photoId],
      });
    }

    await touchAssessment(assessmentId);
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
  await db.transaction('rw', db.photos, db.item_scores, db.assessments, async () => {
    await db.photos.delete(photoId);

    const itemScore = await db.item_scores.get(itemScoreId);
    if (itemScore) {
      await db.item_scores.update(itemScoreId, {
        photo_ids: itemScore.photo_ids.filter((id) => id !== photoId),
      });
    }

    await touchAssessmentForItem(itemScoreId);
  });
}

/**
 * Move a photo from one ItemScore to another (possibly in a different zone).
 * Updates the photo record and both item_scores' photo_ids arrays atomically.
 */
export async function movePhoto(
  photoId: string,
  fromItemScoreId: string,
  toItemScoreId: string,
  toZoneKey: string,
): Promise<void> {
  if (fromItemScoreId === toItemScoreId) return;

  await db.transaction('rw', db.photos, db.item_scores, db.assessments, async () => {
    await db.photos.update(photoId, {
      item_score_id: toItemScoreId,
      zone_key: toZoneKey,
      synced: false,
    });

    const fromItem = await db.item_scores.get(fromItemScoreId);
    if (fromItem) {
      await db.item_scores.update(fromItemScoreId, {
        photo_ids: fromItem.photo_ids.filter((id) => id !== photoId),
      });
    }

    const toItem = await db.item_scores.get(toItemScoreId);
    if (toItem && !toItem.photo_ids.includes(photoId)) {
      await db.item_scores.update(toItemScoreId, {
        photo_ids: [...toItem.photo_ids, photoId],
      });
    }

    await touchAssessmentForItem(toItemScoreId);
  });
}
