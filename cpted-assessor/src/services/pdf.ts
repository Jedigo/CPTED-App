import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { db } from '../db/database';
import { ZONES } from '../data/zones';
import {
  getScoreLabel,
  getCompletionCounts,
} from './scoring';
import type {
  Assessment,
  ZoneScore,
  ItemScore,
  Photo,
  Recommendation,
} from '../types';

// --- Design constants ---
const NAVY = '#1B3A5C';
const MEDIUM_BLUE = '#4A7FB5';
const LIGHT_BLUE = '#D6E8F5';
const WHITE = '#FFFFFF';
const PAGE_MARGIN = 20;
const PAGE_WIDTH = 210; // A4 mm
const CONTENT_WIDTH = PAGE_WIDTH - PAGE_MARGIN * 2;

// --- Score color helpers (hex for PDF, no Tailwind) ---
function getScoreColorHex(score: number): string {
  if (score < 2) return '#DC2626'; // red-600
  if (score < 3) return '#EA580C'; // orange-600
  if (score < 4) return '#CA8A04'; // yellow-600
  if (score < 5) return '#16A34A'; // green-600
  return '#059669'; // emerald-600
}

function getScoreBgHex(score: number): string {
  if (score < 2) return '#FEF2F2'; // red-50
  if (score < 3) return '#FFF7ED'; // orange-50
  if (score < 4) return '#FEFCE8'; // yellow-50
  if (score < 5) return '#F0FDF4'; // green-50
  return '#ECFDF5'; // emerald-50
}

// --- Blob → base64 ---
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// --- Filename generator ---
function generateFilename(assessment: Assessment): string {
  const addr = assessment.address
    .replace(/[^a-zA-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .substring(0, 40);
  const date = assessment.date_of_assessment || assessment.created_at.slice(0, 10);
  return `CPTED_Assessment_${addr}_${date}.pdf`;
}

// --- Format helpers ---
function formatAssessmentType(type: string): string {
  return type
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function formatTimeOfAssessment(time: string): string {
  return time.charAt(0).toUpperCase() + time.slice(1);
}

function formatDate(isoString: string): string {
  if (!isoString) return 'N/A';
  const d = new Date(isoString);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// --- Data gathering ---
interface PDFData {
  assessment: Assessment;
  zoneScores: ZoneScore[];
  itemScores: ItemScore[];
  photos: Photo[];
  photoBase64Map: Map<string, string>; // photo id → base64
}

async function gatherAssessmentData(assessmentId: string): Promise<PDFData> {
  const [assessment, zoneScores, itemScores, photos] = await Promise.all([
    db.assessments.get(assessmentId),
    db.zone_scores
      .where('assessment_id')
      .equals(assessmentId)
      .sortBy('zone_order'),
    db.item_scores.where('assessment_id').equals(assessmentId).toArray(),
    db.photos.where('assessment_id').equals(assessmentId).toArray(),
  ]);

  if (!assessment) throw new Error('Assessment not found');

  // Convert photo blobs to base64 for embedding
  const photoBase64Map = new Map<string, string>();
  for (const photo of photos) {
    try {
      const b64 = await blobToBase64(photo.blob);
      photoBase64Map.set(photo.id, b64);
    } catch {
      // Skip photos that fail to convert
    }
  }

  return { assessment, zoneScores, itemScores, photos, photoBase64Map };
}

// --- Page helpers ---
function addPageFooter(doc: jsPDF, pageNum: number) {
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(
    'CPTED Residential Assessment Report — Volusia Sheriff\'s Office',
    PAGE_MARGIN,
    pageHeight - 8,
  );
  doc.text(
    `Page ${pageNum}`,
    PAGE_WIDTH - PAGE_MARGIN,
    pageHeight - 8,
    { align: 'right' },
  );
}

function ensureSpace(doc: jsPDF, needed: number, currentY: number): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (currentY + needed > pageHeight - 20) {
    doc.addPage();
    addPageFooter(doc, doc.getNumberOfPages());
    return 20;
  }
  return currentY;
}

// --- Section renderers ---

function renderCoverPage(doc: jsPDF, data: PDFData): void {
  const { assessment } = data;

  // Navy header bar
  doc.setFillColor(NAVY);
  doc.rect(0, 0, PAGE_WIDTH, 60, 'F');

  // Title text
  doc.setTextColor(WHITE);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('CPTED Residential Assessment', PAGE_WIDTH / 2, 25, { align: 'center' });
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Crime Prevention Through Environmental Design', PAGE_WIDTH / 2, 35, {
    align: 'center',
  });
  doc.setFontSize(10);
  doc.text('Volusia Sheriff\'s Office', PAGE_WIDTH / 2, 45, { align: 'center' });

  // Address block
  let y = 75;
  doc.setTextColor(NAVY);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(assessment.address, PAGE_WIDTH / 2, y, { align: 'center' });
  y += 7;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `${assessment.city}, ${assessment.state} ${assessment.zip}`,
    PAGE_WIDTH / 2,
    y,
    { align: 'center' },
  );

  // Metadata grid
  y += 15;
  const leftX = PAGE_MARGIN + 5;
  const rightX = PAGE_WIDTH / 2 + 10;
  const lineHeight = 7;

  const metaItems: [string, string, number][] = [
    ['Homeowner:', assessment.homeowner_name, leftX],
    ['Assessment Date:', formatDate(assessment.date_of_assessment), rightX],
    ['Contact:', assessment.homeowner_contact || 'N/A', leftX],
    ['Assessment Type:', formatAssessmentType(assessment.assessment_type), rightX],
    ['Assessor:', assessment.assessor_name, leftX],
    ['Time:', formatTimeOfAssessment(assessment.time_of_assessment), rightX],
    ['Badge ID:', assessment.assessor_badge_id || 'N/A', leftX],
    ['Weather:', assessment.weather_conditions || 'N/A', rightX],
  ];

  doc.setFontSize(10);
  for (let i = 0; i < metaItems.length; i += 2) {
    const row = Math.floor(i / 2);
    const rowY = y + row * lineHeight;

    for (let j = 0; j < 2 && i + j < metaItems.length; j++) {
      const [label, value, x] = metaItems[i + j];
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(NAVY);
      doc.text(label, x, rowY);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80);
      doc.text(value, x + doc.getTextWidth(label) + 3, rowY);
    }
  }

  // Overall score badge
  y += Math.ceil(metaItems.length / 2) * lineHeight + 15;
  const overall = assessment.overall_score;

  doc.setFillColor(LIGHT_BLUE);
  doc.roundedRect(PAGE_WIDTH / 2 - 40, y, 80, 45, 4, 4, 'F');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(NAVY);
  doc.text('OVERALL SCORE', PAGE_WIDTH / 2, y + 10, { align: 'center' });

  if (overall !== null) {
    doc.setFontSize(28);
    doc.setTextColor(getScoreColorHex(overall));
    doc.text(overall.toFixed(1), PAGE_WIDTH / 2, y + 28, { align: 'center' });
    doc.setFontSize(10);
    doc.text(getScoreLabel(overall), PAGE_WIDTH / 2, y + 38, { align: 'center' });
  } else {
    doc.setFontSize(20);
    doc.setTextColor(150);
    doc.text('N/A', PAGE_WIDTH / 2, y + 30, { align: 'center' });
  }

  addPageFooter(doc, 1);
}

function renderLegendAndSummary(doc: jsPDF, data: PDFData): void {
  doc.addPage();
  const pageNum = doc.getNumberOfPages();
  let y = 20;

  // Scoring legend
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(NAVY);
  doc.text('Scoring Legend', PAGE_MARGIN, y);
  y += 3;

  autoTable(doc, {
    startY: y,
    head: [['Score', 'Label', 'Description']],
    body: [
      ['1', 'Critical', 'Immediate action required — significant vulnerability'],
      ['2', 'Deficient', 'Notable concern — should be addressed promptly'],
      ['3', 'Adequate', 'Meets basic standard but could be improved'],
      ['4', 'Good', 'Above average — minor improvements possible'],
      ['5', 'Excellent', 'Best practice standard met'],
      ['N/A', 'Not Applicable', 'Item does not apply to this property'],
    ],
    margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
    theme: 'grid',
    headStyles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 9, textColor: [50, 50, 50] },
    columnStyles: {
      0: { cellWidth: 15, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 25, fontStyle: 'bold' },
      2: { cellWidth: 'auto' },
    },
    didParseCell(hookData) {
      if (hookData.section === 'body' && hookData.column.index === 0) {
        const val = hookData.cell.raw as string;
        const num = parseInt(val, 10);
        if (!isNaN(num)) {
          hookData.cell.styles.textColor = getScoreColorHex(num);
        }
      }
    },
  });

  // Zone summary table
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(NAVY);
  doc.text('Zone Summary', PAGE_MARGIN, y);
  y += 3;

  const zoneRows = ZONES.map((zone) => {
    const zs = data.zoneScores.find((z) => z.zone_key === zone.key);
    const zoneItems = data.itemScores.filter((s) => s.zone_key === zone.key);
    const counts = getCompletionCounts(zoneItems);
    const avg = zs?.average_score;
    return [
      String(zone.order),
      zone.name,
      avg !== null && avg !== undefined ? avg.toFixed(1) : '—',
      avg !== null && avg !== undefined ? getScoreLabel(avg) : '—',
      `${counts.scored} / ${counts.total}`,
      zs?.completed ? 'Complete' : counts.scored > 0 ? 'Partial' : 'Not Started',
    ];
  });

  autoTable(doc, {
    startY: y,
    head: [['#', 'Zone', 'Score', 'Rating', 'Items', 'Status']],
    body: zoneRows,
    margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
    theme: 'grid',
    headStyles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 9, textColor: [50, 50, 50] },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 18, halign: 'center', fontStyle: 'bold' },
      3: { cellWidth: 22, halign: 'center' },
      4: { cellWidth: 22, halign: 'center' },
      5: { cellWidth: 25, halign: 'center' },
    },
    didParseCell(hookData) {
      if (hookData.section === 'body' && hookData.column.index === 2) {
        const val = parseFloat(hookData.cell.raw as string);
        if (!isNaN(val)) {
          hookData.cell.styles.textColor = getScoreColorHex(val);
        }
      }
      // Color-code row backgrounds
      if (hookData.section === 'body') {
        const raw = hookData.row.raw;
        if (Array.isArray(raw)) {
          const scoreCell = raw[2];
          if (typeof scoreCell === 'string') {
            const val = parseFloat(scoreCell);
            if (!isNaN(val)) {
              hookData.cell.styles.fillColor = getScoreBgHex(val);
            }
          }
        }
      }
    },
  });

  addPageFooter(doc, pageNum);
}

function renderZoneDetails(doc: jsPDF, data: PDFData): void {
  for (const zone of ZONES) {
    doc.addPage();
    const pageNum = doc.getNumberOfPages();
    let y = 15;

    // Zone header bar
    doc.setFillColor(NAVY);
    doc.rect(PAGE_MARGIN, y, CONTENT_WIDTH, 12, 'F');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(WHITE);
    doc.text(`Zone ${zone.order}: ${zone.name}`, PAGE_MARGIN + 4, y + 8);

    // Zone average badge on right side of header
    const zs = data.zoneScores.find((z) => z.zone_key === zone.key);
    if (zs?.average_score !== null && zs?.average_score !== undefined) {
      const scoreText = `${zs.average_score.toFixed(1)} — ${getScoreLabel(zs.average_score)}`;
      doc.text(scoreText, PAGE_WIDTH - PAGE_MARGIN - 4, y + 8, { align: 'right' });
    }
    y += 17;

    // Zone description
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(80);
    const descLines = doc.splitTextToSize(zone.description, CONTENT_WIDTH);
    doc.text(descLines, PAGE_MARGIN, y);
    y += descLines.length * 4 + 5;

    // Principle-by-principle tables
    const zoneItems = data.itemScores.filter((s) => s.zone_key === zone.key);

    for (const principle of zone.principles) {
      y = ensureSpace(doc, 25, y);

      // Principle sub-header
      doc.setFillColor(MEDIUM_BLUE);
      doc.rect(PAGE_MARGIN, y, CONTENT_WIDTH, 8, 'F');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(WHITE);
      doc.text(principle.name, PAGE_MARGIN + 3, y + 5.5);
      y += 10;

      // Items table
      const principleItems = zoneItems.filter(
        (item) => item.principle === principle.key,
      );

      const rows = principle.items.map((itemText, idx) => {
        const item = principleItems.find((pi) => pi.item_order === idx);
        let scoreDisplay = '—';
        if (item) {
          if (item.is_na) scoreDisplay = 'N/A';
          else if (item.score !== null) scoreDisplay = String(item.score);
        }
        const notes = item?.notes || '';
        return [itemText, scoreDisplay, notes];
      });

      autoTable(doc, {
        startY: y,
        head: [['Item', 'Score', 'Notes']],
        body: rows,
        margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
        theme: 'grid',
        headStyles: {
          fillColor: LIGHT_BLUE,
          textColor: NAVY,
          fontStyle: 'bold',
          fontSize: 8,
        },
        bodyStyles: { fontSize: 8, textColor: [50, 50, 50], cellPadding: 2 },
        columnStyles: {
          0: { cellWidth: 'auto' },
          1: { cellWidth: 16, halign: 'center', fontStyle: 'bold' },
          2: { cellWidth: 45, fontSize: 7 },
        },
        didParseCell(hookData) {
          if (hookData.section === 'body' && hookData.column.index === 1) {
            const val = parseInt(hookData.cell.raw as string, 10);
            if (!isNaN(val)) {
              hookData.cell.styles.textColor = getScoreColorHex(val);
            }
          }
        },
      });

      y =
        (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
          .finalY + 5;
    }

    // Photos for this zone
    const zonePhotos = data.photos.filter((p) => p.zone_key === zone.key);
    if (zonePhotos.length > 0) {
      y = ensureSpace(doc, 55, y);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(NAVY);
      doc.text('Photos', PAGE_MARGIN, y);
      y += 5;

      const photoWidth = (CONTENT_WIDTH - 10) / 3; // 3 per row with gaps
      let col = 0;

      for (const photo of zonePhotos) {
        const b64 = data.photoBase64Map.get(photo.id);
        if (!b64) continue;

        y = ensureSpace(doc, 50, y);

        const x = PAGE_MARGIN + col * (photoWidth + 5);
        try {
          doc.addImage(b64, 'JPEG', x, y, photoWidth, photoWidth * 0.75);

          // Caption under photo
          doc.setFontSize(6);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(120);
          const captionParts: string[] = [];
          if (photo.captured_at) {
            captionParts.push(
              new Date(photo.captured_at).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              }),
            );
          }
          if (photo.gps_lat !== null && photo.gps_lng !== null) {
            captionParts.push(
              `${photo.gps_lat.toFixed(4)}, ${photo.gps_lng.toFixed(4)}`,
            );
          }
          if (captionParts.length > 0) {
            doc.text(captionParts.join(' | '), x, y + photoWidth * 0.75 + 3);
          }
        } catch {
          // Skip photos that fail to render
        }

        col++;
        if (col >= 3) {
          col = 0;
          y += photoWidth * 0.75 + 8;
        }
      }

      // If last row wasn't full, advance y
      if (col > 0) {
        y += photoWidth * 0.75 + 8;
      }
    }

    addPageFooter(doc, pageNum);
  }
}

function renderRecommendations(doc: jsPDF, data: PDFData): void {
  doc.addPage();
  const pageNum = doc.getNumberOfPages();
  let y = 20;

  // Header
  doc.setFillColor(NAVY);
  doc.rect(PAGE_MARGIN, y, CONTENT_WIDTH, 12, 'F');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(WHITE);
  doc.text('Recommendations', PAGE_MARGIN + 4, y + 8);
  y += 20;

  // Top Recommendations
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(NAVY);
  doc.text('Top Recommendations', PAGE_MARGIN, y);
  y += 7;

  const recs = data.assessment.top_recommendations || [];
  if (recs.length === 0) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(150);
    doc.text('No recommendations have been added for this assessment.', PAGE_MARGIN, y);
    y += 10;
  } else {
    for (let i = 0; i < recs.length; i++) {
      y = ensureSpace(doc, 20, y);
      const rec = recs[i];
      renderRecommendationItem(doc, rec, i + 1, y);
      y += 18;
    }
  }

  // Quick Wins
  y = ensureSpace(doc, 25, y);
  y += 5;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(NAVY);
  doc.text('Quick Wins', PAGE_MARGIN, y);
  y += 7;

  const qw = data.assessment.quick_wins || [];
  if (qw.length === 0) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(150);
    doc.text('No quick wins have been added for this assessment.', PAGE_MARGIN, y);
  } else {
    for (const item of qw) {
      y = ensureSpace(doc, 15, y);
      renderQuickWinItem(doc, item, y);
      y += 12;
    }
  }

  addPageFooter(doc, pageNum);
}

function renderRecommendationItem(
  doc: jsPDF,
  rec: Recommendation,
  num: number,
  y: number,
): void {
  // Number circle
  doc.setFillColor(NAVY);
  doc.circle(PAGE_MARGIN + 4, y + 2, 3.5, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(WHITE);
  doc.text(String(num), PAGE_MARGIN + 4, y + 3, { align: 'center' });

  // Priority badge
  const priorityColors: Record<string, string> = {
    high: '#DC2626',
    medium: '#CA8A04',
    low: '#16A34A',
  };
  const badgeX = PAGE_MARGIN + 12;
  const badgeColor = priorityColors[rec.priority] || '#6B7280';
  doc.setFillColor(badgeColor);
  doc.roundedRect(badgeX, y - 2, 16, 6, 1, 1, 'F');
  doc.setFontSize(6);
  doc.setTextColor(WHITE);
  doc.text(rec.priority.toUpperCase(), badgeX + 8, y + 2, { align: 'center' });

  // Timeline
  if (rec.timeline) {
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120);
    doc.text(rec.timeline, badgeX + 20, y + 2);
  }

  // Description
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50);
  const descLines = doc.splitTextToSize(rec.description, CONTENT_WIDTH - 12);
  doc.text(descLines, PAGE_MARGIN + 12, y + 8);
}

function renderQuickWinItem(doc: jsPDF, item: Recommendation, y: number): void {
  // Bullet
  doc.setFillColor(MEDIUM_BLUE);
  doc.circle(PAGE_MARGIN + 3, y + 2, 1.5, 'F');

  // Priority
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(MEDIUM_BLUE);
  doc.text(`[${item.priority.toUpperCase()}]`, PAGE_MARGIN + 8, y + 3);

  // Description
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50);
  const descLines = doc.splitTextToSize(item.description, CONTENT_WIDTH - 30);
  doc.text(descLines, PAGE_MARGIN + 28, y + 3);
}

const LIABILITY_WAIVER = `This CPTED assessment is provided solely for informational and preventative purposes. The observations and recommendations included in this report are offered as voluntary guidance and do not constitute mandated safety requirements, building code standards, or legal directives. The implementation of any recommendations is entirely at the discretion of the property owner and should be undertaken only with appropriate professional consultation when necessary. The Volusia Sheriff's Office, its employees, agents, and representatives make no warranties, guarantees, or assurances regarding the effectiveness of any recommended security measures. Crime prevention strategies reduce risk but cannot completely eliminate the possibility of criminal activity. By accepting this report, the property owner acknowledges that the Volusia Sheriff's Office shall not be held liable for any actions taken or not taken based on the information provided, nor for any damages, losses, or incidents that may occur on or near the property following this assessment.`;

function renderLiabilityWaiver(doc: jsPDF, data: PDFData): void {
  doc.addPage();
  const pageNum = doc.getNumberOfPages();
  let y = 20;

  // Header
  doc.setFillColor(NAVY);
  doc.rect(PAGE_MARGIN, y, CONTENT_WIDTH, 12, 'F');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(WHITE);
  doc.text('Liability Waiver & Acknowledgment', PAGE_MARGIN + 4, y + 8);
  y += 22;

  // Waiver text
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50);
  const waiverLines = doc.splitTextToSize(LIABILITY_WAIVER, CONTENT_WIDTH);
  doc.text(waiverLines, PAGE_MARGIN, y);
  y += waiverLines.length * 5 + 20;

  // Signature lines
  const lineWidth = 70;
  const sigY = y;
  const leftSig = PAGE_MARGIN;
  const rightSig = PAGE_WIDTH / 2 + 10;

  doc.setDrawColor(NAVY);
  doc.setLineWidth(0.3);

  // Assessor signature
  doc.line(leftSig, sigY, leftSig + lineWidth, sigY);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(NAVY);
  doc.text('Assessor Signature', leftSig, sigY + 5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text(data.assessment.assessor_name, leftSig, sigY + 10);

  // Assessor date
  doc.line(rightSig, sigY, rightSig + lineWidth, sigY);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(NAVY);
  doc.text('Date', rightSig, sigY + 5);

  // Homeowner signature
  const ownerSigY = sigY + 25;
  doc.line(leftSig, ownerSigY, leftSig + lineWidth, ownerSigY);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(NAVY);
  doc.text('Homeowner Signature', leftSig, ownerSigY + 5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text(data.assessment.homeowner_name, leftSig, ownerSigY + 10);

  // Homeowner date
  doc.line(rightSig, ownerSigY, rightSig + lineWidth, ownerSigY);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(NAVY);
  doc.text('Date', rightSig, ownerSigY + 5);

  addPageFooter(doc, pageNum);
}

// --- Main export ---
export async function generatePDF(assessmentId: string): Promise<void> {
  const data = await gatherAssessmentData(assessmentId);

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  renderCoverPage(doc, data);
  renderLegendAndSummary(doc, data);
  renderZoneDetails(doc, data);
  renderRecommendations(doc, data);
  renderLiabilityWaiver(doc, data);

  // Trigger download
  doc.save(generateFilename(data.assessment));
}
