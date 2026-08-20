import { db } from '../db/database';
import type {
  Assessment,
  ZoneScore,
  ItemScore,
  Photo,
  CrimeReport,
  LightSurvey,
  LightReading,
} from '../types';
import { compareRevisions } from './revision';
import type { RemoteRevision, SyncState } from './revision';

const API_BASE = import.meta.env.VITE_API_URL || '';

// --- Pull (server → device) types ---

export interface SyncOptions {
  /** Push anyway, after the user has been shown what they are overwriting. */
  force?: boolean;
}

/**
 * The server's copy moved since this device last synced, so pushing would
 * overwrite someone else's work. Carries the server's side of the story so the
 * caller can name both copies in the warning rather than saying "something
 * changed".
 */
export class DivergedError extends Error {
  // Declared rather than written as constructor parameter properties, which
  // this project's erasableSyntaxOnly setting rejects.
  state: SyncState;
  server: RemoteRevision;

  constructor(state: SyncState, server: RemoteRevision) {
    super('The server copy has changed since this device last synced');
    this.name = 'DivergedError';
    this.state = state;
    this.server = server;
  }
}

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
  // Optional so a client built ahead of the server still compiles; a missing
  // revision reads as 1.
  revision?: number;
  last_edited_by?: string | null;
  last_edited_at?: string | null;
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

export interface SyncProgress {
  current: number;
  total: number;
}

/**
 * Sync an assessment to the server.
 * 1. POST assessment metadata + scores to /api/sync
 * 2. Upload unsynced photos to /api/assessments/:id/photos
 * 3. Mark synced_at in IndexedDB
 */
export async function syncAssessment(
  assessmentId: string,
  onProgress?: (progress: SyncProgress) => void,
  options: SyncOptions = {},
): Promise<SyncResult> {
  // Gather all data from IndexedDB
  const [assessment, zoneScores, itemScores, photos, lightSurveys, lightReadings, crimeReports] =
    await Promise.all([
      db.assessments.get(assessmentId),
      db.zone_scores.where('assessment_id').equals(assessmentId).toArray(),
      db.item_scores.where('assessment_id').equals(assessmentId).toArray(),
      db.photos.where('assessment_id').equals(assessmentId).toArray(),
      db.light_surveys.where('assessment_id').equals(assessmentId).toArray(),
      db.light_readings.where('assessment_id').equals(assessmentId).toArray(),
      db.crime_reports.where('assessment_id').equals(assessmentId).toArray(),
    ]);

  if (!assessment) throw new Error('Assessment not found');

  // The revision this push actually carries — captured here, not read back at
  // the end. If the assessor edits while the photos upload, the local revision
  // climbs past this one and the next comparison correctly reads "newer here"
  // instead of claiming the unsent edits reached the server.
  const pushedRevision = assessment.revision ?? 1;

  // Look at the server's copy before overwriting it. This fetch already existed
  // further down to collect the photo ids; it is hoisted so the same response
  // also answers "has someone else changed this since I last synced" — so the
  // round-trip count is unchanged.
  let serverAssessment: (RemoteRevision & { photos?: { id: string }[] }) | null = null;
  try {
    const existingRes = await fetch(`${API_BASE}/api/assessments/${assessmentId}`);
    if (existingRes.ok) serverAssessment = await existingRes.json();
  } catch {
    // Offline or unreachable; the POST below will fail with its own message.
  }

  // Refuse to clobber silently. A push is a wholesale overwrite of the server
  // row, so if the server has moved on since this device last synced, the
  // caller has to say so explicitly.
  if (!options.force && serverAssessment) {
    const state = compareRevisions(assessment, serverAssessment);
    if (state === 'diverged' || state === 'server-ahead') {
      throw new DivergedError(state, serverAssessment);
    }
  }

  // 1. Sync metadata + scores
  const payload = {
    assessment: {
      ...assessment,
      // Strip blob data from photos in the payload
    },
    zone_scores: zoneScores,
    item_scores: itemScores,
    photos: photos.map(({ blob, data, ...rest }) => rest),
    // Light surveys ride along with the assessment rather than getting their own
    // endpoint: they are small, they belong to exactly one assessment, and a lot
    // plotted at the desk is useless until it reaches the iPad. The aerial
    // screenshot goes inline — one image per lot, unlike the dozens of checklist
    // photos that earned a separate upload path.
    light_surveys: lightSurveys,
    light_readings: lightReadings,
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

  // 2. Upload photos the server doesn't have yet. Keyed on the server's photo
  // list (not the local synced flag) so previously failed uploads still retry.
  // From the response fetched above, before the push. If that fetch failed the
  // set stays empty and everything is re-uploaded, which is the old fallback.
  const serverPhotoIds = new Set(
    ((serverAssessment?.photos ?? []) as { id: string }[]).map((p) => p.id),
  );

  let photosUploaded = 0;
  const uploadablePhotos = photos.filter(
    (p) => (p.data || p.blob) && !serverPhotoIds.has(p.id),
  );

  // Photos already on the server count as synced locally
  for (const photo of photos) {
    if (serverPhotoIds.has(photo.id) && !photo.synced) {
      await db.photos.update(photo.id, { synced: true });
    }
  }

  const totalToUpload = uploadablePhotos.length;
  const BATCH_SIZE = 4;
  for (let i = 0; i < uploadablePhotos.length; i += BATCH_SIZE) {
    const batch = uploadablePhotos.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (photo) => {
        try {
          await uploadPhoto(assessmentId, photo);
          // Mark photo as synced in IndexedDB
          await db.photos.update(photo.id, { synced: true });
          photosUploaded++;
          onProgress?.({ current: photosUploaded, total: totalToUpload });
        } catch (err) {
          console.warn(`Failed to upload photo ${photo.id}:`, err);
        }
      }),
    );
  }

  // 3. The analyst's crime PDF. One per assessment and normally well under a
  // megabyte, so no batching — but it goes through its own endpoint rather than
  // the sync payload, for the same reason photos do.
  const crimeReport = crimeReports[0];
  if (crimeReport) {
    try {
      await uploadCrimeReport(assessmentId, crimeReport);
      await db.crime_reports.update(crimeReport.id, { synced: true });
    } catch (err) {
      console.warn(`Failed to upload crime report ${crimeReport.id}:`, err);
    }
  }

  // 4. Record what the server now holds.
  //
  // Deliberately does NOT set updated_at, revision, last_edited_by, or
  // last_edited_at: syncing moves bytes, it does not change them, and the old
  // code's updated_at bump here is exactly why a timestamp could never answer
  // "which copy is newest".
  //
  // synced_revision takes the number the server reports back when it has one,
  // falling back to the number we pushed — they differ only when the server
  // counted the push itself on behalf of a client too old to send one.
  //
  // status is re-read rather than taken from the record captured before the
  // upload: the assessor can hit Mark Complete while photos are still going up,
  // and the old code would write the pre-upload status back over it.
  const syncedAt = syncData.synced_at;
  await db.transaction('rw', db.assessments, async () => {
    const current = await db.assessments.get(assessmentId);
    if (!current) return;
    await db.assessments.update(assessmentId, {
      synced_at: syncedAt,
      synced_revision: typeof syncData.revision === 'number' ? syncData.revision : pushedRevision,
      status: current.status === 'completed' ? 'synced' : current.status,
    });
  });

  return {
    success: true,
    synced_at: syncedAt,
    photosUploaded,
  };
}

/** Sends the analyst's PDF through its own endpoint. */
async function uploadCrimeReport(assessmentId: string, report: CrimeReport): Promise<void> {
  const formData = new FormData();
  const file = new File([dataUrlToBlob(report.data)], report.filename || `${report.id}.pdf`, {
    type: 'application/pdf',
  });
  formData.append('report', file);
  formData.append('id', report.id);
  formData.append('page_count', String(report.page_count));
  formData.append('uploaded_at', report.uploaded_at);

  const res = await fetch(`${API_BASE}/api/assessments/${assessmentId}/crime-report`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error(`Crime report upload failed: ${res.status}`);
}

async function uploadPhoto(assessmentId: string, photo: Photo): Promise<void> {
  const formData = new FormData();

  // Convert base64 data URL (or legacy Blob) to File for upload
  let fileData: Blob;
  if (photo.data) {
    fileData = dataUrlToBlob(photo.data);
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
  if (photo.gps_accuracy_m != null)
    formData.append('gps_accuracy_m', String(photo.gps_accuracy_m));
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
  const {
    zone_scores,
    item_scores,
    photos: photoMeta,
    light_surveys,
    light_readings,
    crime_reports,
    ...assessmentData
  } = data;

  // 2. Upsert assessment + scores into IndexedDB in a transaction
  onProgress?.({ phase: 'metadata', current: 1, total: 1, message: 'Saving assessment data...' });

  const pullTables = [
    db.assessments,
    db.zone_scores,
    db.item_scores,
    db.light_surveys,
    db.light_readings,
  ];

  await db.transaction('rw', pullTables, async () => {
    // Upsert the assessment
    // A pull makes this device an exact copy of the server, so the server's
    // revision becomes both the local revision AND the new common ancestor.
    // Never the local revision + 1: a pull is not an edit by this device, and
    // stamping it as one would leave the freshly-downloaded copy claiming to be
    // ahead of the very server it came from.
    //
    // The ?? fallbacks cover a client running against a server that has not
    // been upgraded yet: the pull yields revision 1 / ancestor 1, which reads
    // as in sync and then bumps normally on the first local edit.
    const serverRevision = assessmentData.revision ?? 1;
    const assessment: Assessment = {
      ...assessmentData,
      top_recommendations: assessmentData.top_recommendations || [],
      quick_wins: assessmentData.quick_wins || [],
      notes: assessmentData.notes || '',
      assessor_signature: assessmentData.assessor_signature || null,
      revision: serverRevision,
      synced_revision: serverRevision,
      last_edited_by: assessmentData.last_edited_by ?? null,
      last_edited_at: assessmentData.last_edited_at ?? null,
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

    // Light surveys. Only touched when the server actually reported the key —
    // a server predating light-survey sync omits it, and clearing the local
    // copy on its say-so would delete a grid the assessor plotted here.
    if (Array.isArray(light_surveys)) {
      await db.light_readings.where('assessment_id').equals(id).delete();
      await db.light_surveys.where('assessment_id').equals(id).delete();

      if (light_surveys.length > 0) {
        await db.light_surveys.bulkPut(
          light_surveys.map((ls: LightSurvey) => ({
            ...ls,
            skipped_points: ls.skipped_points || [],
            observers: ls.observers || '',
            weather: ls.weather || '',
            lamp_type: ls.lamp_type || '',
            fixture_type: ls.fixture_type || '',
            meter_type: ls.meter_type || '',
            meter_calibrated_on: ls.meter_calibrated_on || '',
            notes: ls.notes || '',
            aerial_image: ls.aerial_image ?? null,
            aerial_credit: ls.aerial_credit ?? null,
            grid_flipped: ls.grid_flipped ?? false,
            grid_origin: ls.grid_origin ?? 'edge',
            unit: ls.unit || 'fc',
          })),
        );
      }
      if (Array.isArray(light_readings) && light_readings.length > 0) {
        await db.light_readings.bulkPut(light_readings as LightReading[]);
      }
    }
  });

  // 3. The analyst's crime PDF, fetched from its own endpoint like a photo.
  // Guarded on the key being present, the same way light surveys are: a server
  // predating this feature omits it, and clearing the local copy on that basis
  // would throw away a PDF this device holds and the server never saw.
  if (Array.isArray(crime_reports)) {
    await db.crime_reports.where('assessment_id').equals(id).delete();

    const meta = crime_reports[0];
    if (meta) {
      try {
        const res = await fetch(`${API_BASE}/api/assessments/${id}/crime-report`);
        if (res.ok) {
          const blob = await res.blob();
          await db.crime_reports.put({
            id: meta.id,
            assessment_id: id,
            filename: meta.filename || 'crime-analysis.pdf',
            data: await blobToDataUrl(blob),
            size_bytes: meta.size_bytes ?? blob.size,
            page_count: meta.page_count ?? 0,
            uploaded_at: meta.uploaded_at || new Date().toISOString(),
            synced: true,
          });
        }
      } catch (err) {
        console.warn('Failed to download crime report:', err);
      }
    }
  }

  // 4. Download photos sequentially
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
          gps_accuracy_m: meta.gps_accuracy_m ?? null,
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

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)?.[1] || 'image/jpeg';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
