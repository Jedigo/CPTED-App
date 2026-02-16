import { db } from '../db/database';
import type { Assessment, ZoneScore, ItemScore, Photo } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '';

// --- Pull (server → device) types ---

export interface ServerAssessmentSummary {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  assessor_name: string;
  homeowner_name: string;
  date_of_assessment: string;
  overall_score: number | null;
  status: string;
  created_at: string;
  updated_at: string;
  synced_at: string | null;
}

export interface PullProgress {
  phase: 'metadata' | 'photos' | 'done';
  current: number;
  total: number;
  message: string;
}

export interface PullResult {
  success: boolean;
  assessmentId: string;
  photosDownloaded: number;
}

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

  // Convert base64 data URL (or legacy Blob) to File for upload
  let fileData: Blob;
  if (photo.data) {
    const resp = await fetch(photo.data);
    fileData = await resp.blob();
  } else if (photo.blob) {
    fileData = photo.blob;
  } else {
    return; // No photo data available
  }
  const file = new File([fileData], photo.filename || `${photo.id}.jpg`, {
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

// --- Pull functions (server → device) ---

/**
 * Fetch the list of assessments from the server (lightweight summaries).
 */
export async function fetchServerAssessments(): Promise<ServerAssessmentSummary[]> {
  const res = await fetch(`${API_BASE}/api/assessments`);
  if (!res.ok) throw new Error(`Failed to fetch server assessments: ${res.status}`);
  return res.json();
}

/**
 * Pull a full assessment from the server into local IndexedDB.
 * Downloads metadata, zone_scores, item_scores, then photos sequentially.
 */
export async function pullAssessment(
  id: string,
  onProgress?: (progress: PullProgress) => void,
): Promise<PullResult> {
  // 1. Fetch full assessment (includes zone_scores, item_scores, photo metadata)
  onProgress?.({ phase: 'metadata', current: 0, total: 1, message: 'Downloading assessment data...' });

  const res = await fetch(`${API_BASE}/api/assessments/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch assessment: ${res.status}`);
  const data = await res.json();

  // Extract related data from the response
  const { zone_scores, item_scores, photos: photoMeta, ...assessmentData } = data;

  // 2. Upsert assessment + scores into IndexedDB in a transaction
  onProgress?.({ phase: 'metadata', current: 1, total: 1, message: 'Saving assessment data...' });

  await db.transaction('rw', [db.assessments, db.zone_scores, db.item_scores], async () => {
    // Upsert the assessment
    const assessment: Assessment = {
      ...assessmentData,
      top_recommendations: assessmentData.top_recommendations || [],
      quick_wins: assessmentData.quick_wins || [],
      notes: assessmentData.notes || '',
    };
    await db.assessments.put(assessment);

    // Delete existing zone_scores and item_scores, then bulk insert
    await db.zone_scores.where('assessment_id').equals(id).delete();
    if (zone_scores && zone_scores.length > 0) {
      const zs: ZoneScore[] = zone_scores.map((z: ZoneScore) => ({
        id: z.id,
        assessment_id: z.assessment_id,
        zone_key: z.zone_key,
        zone_name: z.zone_name,
        zone_order: z.zone_order,
        average_score: z.average_score,
        priority_findings: z.priority_findings || '',
        notes: z.notes || '',
        completed: z.completed ?? false,
      }));
      await db.zone_scores.bulkPut(zs);
    }

    await db.item_scores.where('assessment_id').equals(id).delete();
    if (item_scores && item_scores.length > 0) {
      const is: ItemScore[] = item_scores.map((i: ItemScore) => ({
        id: i.id,
        assessment_id: i.assessment_id,
        zone_key: i.zone_key,
        principle: i.principle,
        item_text: i.item_text,
        item_order: i.item_order,
        score: i.score,
        is_na: i.is_na ?? false,
        notes: i.notes || '',
        photo_ids: i.photo_ids || [],
      }));
      await db.item_scores.bulkPut(is);
    }
  });

  // 3. Download photos sequentially
  let photosDownloaded = 0;
  const totalPhotos = photoMeta?.length || 0;

  if (totalPhotos > 0) {
    // Clear existing photos for this assessment first
    await db.photos.where('assessment_id').equals(id).delete();

    for (let i = 0; i < totalPhotos; i++) {
      const meta = photoMeta[i];
      onProgress?.({
        phase: 'photos',
        current: i + 1,
        total: totalPhotos,
        message: `Downloading photo ${i + 1} of ${totalPhotos}...`,
      });

      try {
        const photoRes = await fetch(`${API_BASE}/api/photos/${meta.id}`);
        if (!photoRes.ok) {
          console.warn(`Failed to download photo ${meta.id}: ${photoRes.status}`);
          continue;
        }

        // Convert binary response to base64 data URL
        const blob = await photoRes.blob();
        const dataUrl = await blobToDataUrl(blob);

        const photo: Photo = {
          id: meta.id,
          assessment_id: meta.assessment_id,
          item_score_id: meta.item_score_id || null,
          zone_key: meta.zone_key,
          captured_at: meta.captured_at || new Date().toISOString(),
          data: dataUrl,
          filename: meta.filename || `${meta.id}.jpg`,
          mime_type: meta.mime_type || 'image/jpeg',
          gps_lat: meta.gps_lat ?? null,
          gps_lng: meta.gps_lng ?? null,
          compass_heading: meta.compass_heading ?? null,
          annotation_data: meta.annotation_data ?? null,
          synced: true,
        };

        await db.photos.put(photo);
        photosDownloaded++;
      } catch (err) {
        console.warn(`Failed to download photo ${meta.id}:`, err);
      }
    }
  }

  onProgress?.({ phase: 'done', current: totalPhotos, total: totalPhotos, message: 'Download complete!' });

  return { success: true, assessmentId: id, photosDownloaded };
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
