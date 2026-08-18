/**
 * Draw the survey grid onto county aerial imagery and hand back a JPEG.
 *
 * This replaces the export-to-Google-Earth-and-screenshot-it round trip. The app
 * already knows the lot geometry and now has the imagery, so the picture the
 * report needs can be produced directly — no second application, no share sheet,
 * no file that has to survive a trip through the Files app.
 */

import type { LightSurvey } from '../types';
import { gridPointLatLng, lotCorners } from './light-geo';
import { buildPointPlan } from './light-grid';
import { bandFor } from './light-stats';
import { latLngToPixel, IMAGERY_CREDIT, type AerialView } from './county-imagery';

export interface GridRenderOptions {
  /** point_index -> footcandles. Empty renders a planning map. */
  values?: Map<number, number>;
  /** Number every point. Defaults on when there are no readings. */
  labelEveryPoint?: boolean;
}

/**
 * Returns a JPEG data URL of the imagery with the lot outline and every reading
 * point drawn on it, plus the credit line burned into the corner so the
 * attribution travels with the picture into the PDF.
 */
export async function renderAerialWithGrid(
  view: AerialView,
  survey: LightSurvey,
  options: GridRenderOptions = {},
): Promise<string> {
  const values = options.values ?? new Map<number, number>();
  const labelEvery = options.labelEveryPoint ?? values.size === 0;

  const img = await loadImage(view.image);
  const canvas = document.createElement('canvas');
  canvas.width = view.widthPx;
  canvas.height = view.heightPx;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not draw the aerial image.');
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  // Lot outline first, so the points sit on top of it.
  const corners = lotCorners(survey);
  if (corners) {
    ctx.beginPath();
    corners.forEach((c, i) => {
      const p = latLngToPixel(view, c);
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 4;
    ctx.stroke();
  }

  const plan = buildPointPlan(survey.cols, survey.rows, survey.skipped_points);
  const skipped = new Set(survey.skipped_points);
  // Scale the markers to the image so a wide lot doesn't render as confetti.
  const radius = Math.max(5, Math.round(view.widthPx / 150));
  ctx.font = `bold ${Math.round(radius * 1.9)}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  for (let p = 1; p <= plan.totalPoints; p++) {
    const ll = gridPointLatLng(survey, p);
    if (!ll) continue;
    const at = latLngToPixel(view, ll);
    const fc = values.get(p);

    ctx.beginPath();
    ctx.arc(at.x, at.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = skipped.has(p)
      ? 'rgba(107,114,128,0.9)'
      : fc === undefined
        ? 'rgba(255,255,255,0.9)'
        : bandFor(fc).bg;
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();

    if (labelEvery && !skipped.has(p)) {
      // Outlined text: a plain fill disappears over pale concrete.
      const label = String(p);
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(0,0,0,0.85)';
      ctx.strokeText(label, at.x, at.y - radius * 2.1);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(label, at.x, at.y - radius * 2.1);
    }
  }

  drawCredit(ctx, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.85);
}

function drawCredit(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const size = Math.max(11, Math.round(w / 90));
  ctx.font = `${size}px system-ui, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'bottom';
  const pad = size * 0.6;
  const text = IMAGERY_CREDIT;
  const width = ctx.measureText(text).width;
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(0, h - size - pad * 2, width + pad * 2, size + pad * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(text, pad, h - pad * 0.6);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not load the aerial image.'));
    img.src = src;
  });
}
