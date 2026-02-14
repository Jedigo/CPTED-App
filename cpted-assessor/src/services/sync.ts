import { db } from '../db/database';
import type { Photo } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '';

export interface SyncResult {
  success: boolean;
  synced_at: string;
  photosUploaded: number;
  error?: string;
}

/**
 * Sync an assessment to the server.
 * 1. POST assessment metadata + scores to /api/sync
 * 2. Upload unsynced photos to /api/assessments/:id/photos
 * 3. Mark synced_at in IndexedDB
 */
export async function syncAssessment(assessmentId: string): Promise<SyncResult> {
  // Gather all data from IndexedDB
  const [assessment, zoneScores, itemScores, photos] = await Promise.all([
    db.assessments.get(assessmentId),
    db.zone_scores.where('assessment_id').equals(assessmentId).toArray(),
    db.item_scores.where('assessment_id').equals(assessmentId).toArray(),
    db.photos.where('assessment_id').equals(assessmentId).toArray(),
  ]);

  if (!assessment) throw new Error('Assessment not found');

  // 1. Sync metadata + scores
  const payload = {
    assessment: {
      ...assessment,
      // Strip blob data from photos in the payload
    },
    zone_scores: zoneScores,
    item_scores: itemScores,
    photos: photos.map(({ blob, ...rest }) => rest),
  };

  const syncRes = await fetch(`${API_BASE}/api/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!syncRes.ok) {
    const errBody = await syncRes.text();
    throw new Error(`Sync failed: ${syncRes.status} ${errBody}`);
  }

  const syncData = await syncRes.json();

  // 2. Upload unsynced photos
  let photosUploaded = 0;
  const unsyncedPhotos = photos.filter((p) => !p.synced);

  for (const photo of unsyncedPhotos) {
    try {
      await uploadPhoto(assessmentId, photo);
      // Mark photo as synced in IndexedDB
      await db.photos.update(photo.id, { synced: true });
      photosUploaded++;
    } catch (err) {
      console.warn(`Failed to upload photo ${photo.id}:`, err);
    }
  }

  // 3. Update assessment synced_at in IndexedDB
  const syncedAt = syncData.synced_at;
  await db.assessments.update(assessmentId, {
    synced_at: syncedAt,
    status: assessment.status === 'completed' ? 'synced' : assessment.status,
    updated_at: new Date().toISOString(),
  });

  return {
    success: true,
    synced_at: syncedAt,
    photosUploaded,
  };
}

async function uploadPhoto(assessmentId: string, photo: Photo): Promise<void> {
  const formData = new FormData();

  // Convert Blob to File for upload
  const file = new File([photo.blob], photo.filename || `${photo.id}.jpg`, {
    type: photo.mime_type || 'image/jpeg',
  });
  formData.append('photo', file);
  formData.append('id', photo.id);
  formData.append('zone_key', photo.zone_key);
  if (photo.item_score_id) formData.append('item_score_id', photo.item_score_id);
  if (photo.captured_at) formData.append('captured_at', photo.captured_at);
  if (photo.gps_lat !== null) formData.append('gps_lat', String(photo.gps_lat));
  if (photo.gps_lng !== null) formData.append('gps_lng', String(photo.gps_lng));
  if (photo.compass_heading !== null)
    formData.append('compass_heading', String(photo.compass_heading));
  if (photo.annotation_data)
    formData.append('annotation_data', JSON.stringify(photo.annotation_data));

  const res = await fetch(`${API_BASE}/api/assessments/${assessmentId}/photos`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`Photo upload failed: ${res.status}`);
  }
}

/**
 * Check if the server is reachable
 */
export async function checkServerHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    return res.ok;
  } catch {
    return false;
  }
}
