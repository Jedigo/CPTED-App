import jsPDF from 'jspdf';
import autoTableModule from 'jspdf-autotable';
const autoTable = autoTableModule.default ?? autoTableModule;
import fs from 'fs/promises';
import { eq } from 'drizzle-orm';
import { db } from '../db/connection.js';
import { assessments, zoneScores, itemScores, photos } from '../db/schema.js';
import { ZONES } from '../data/zones.js';
import { getScoreLabel, getCompletionCounts } from './scoring.js';

// --- Design constants ---
const NAVY = '#1B3A5C';
const MEDIUM_BLUE = '#4A7FB5';
const LIGHT_BLUE = '#D6E8F5';
const WHITE = '#FFFFFF';
const PAGE_MARGIN = 20;
const PAGE_WIDTH = 210; // A4 mm
const CONTENT_WIDTH = PAGE_WIDTH - PAGE_MARGIN * 2;

// --- Types for gathered data ---
type AssessmentRow = typeof assessments.$inferSelect;
type ZoneScoreRow = typeof zoneScores.$inferSelect;
type ItemScoreRow = typeof itemScores.$inferSelect;
type PhotoRow = typeof photos.$inferSelect;

interface PDFData {
  assessment: AssessmentRow;
  zoneScores: ZoneScoreRow[];
  itemScores: ItemScoreRow[];
  photos: PhotoRow[];
  photoBase64Map: Map<string, string>;
}

interface Recommendation {
  description: string;
  priority: string;
  timeline: string;
}

// --- Score color helpers (hex for PDF) ---
function getScoreColorHex(score: number): string {
  if (score < 2) return '#DC2626';
  if (score < 3) return '#EA580C';
  if (score < 4) return '#CA8A04';
  if (score < 5) return '#16A34A';
  return '#059669';
}

function getScoreBgHex(score: number): string {
  if (score < 2) return '#FEF2F2';
  if (score < 3) return '#FFF7ED';
  if (score < 4) return '#FEFCE8';
  if (score < 5) return '#F0FDF4';
  return '#ECFDF5';
}

// --- Filename generator ---
function generateFilename(assessment: AssessmentRow): string {
  const addr = assessment.address
    .replace(/[^a-zA-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .substring(0, 40);
  const date =
    assessment.date_of_assessment ||
    (assessment.created_at instanceof Date
      ? assessment.created_at.toISOString().slice(0, 10)
      : String(assessment.created_at).slice(0, 10));
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

function formatDate(isoString: string | Date): string {
  if (!isoString) return 'N/A';
  const d = typeof isoString === 'string' ? new Date(isoString) : isoString;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// --- Data gathering (Drizzle queries instead of Dexie) ---
async function gatherAssessmentData(assessmentId: string): Promise<PDFData> {
  const [assessment] = await db
    .select()
    .from(assessments)
    .where(eq(assessments.id, assessmentId));

  if (!assessment) throw new Error('Assessment not found');

  const [zones, items, photoRows] = await Promise.all([
    db
      .select()
      .from(zoneScores)
      .where(eq(zoneScores.assessment_id, assessmentId)),
    db
      .select()
      .from(itemScores)
      .where(eq(itemScores.assessment_id, assessmentId)),
    db
      .select()
      .from(photos)
      .where(eq(photos.assessment_id, assessmentId)),
  ]);

  // Sort zones by zone_order
  zones.sort((a, b) => a.zone_order - b.zone_order);

  // Convert photo files to base64 for embedding
  const photoBase64Map = new Map<string, string>();
  for (const photo of photoRows) {
    try {
      const fileBuffer = await fs.readFile(photo.blob_path);
      const base64 = fileBuffer.toString('base64');
      const mimeType = photo.mime_type || 'image/jpeg';
      photoBase64Map.set(photo.id, `data:${mimeType};base64,${base64}`);
    } catch {
      // Skip photos that fail to read
    }
  }

  return {
    assessment,
    zoneScores: zones,
    itemScores: items,
    photos: photoRows,
    photoBase64Map,
  };
}

// --- Page helpers ---
function addPageFooter(doc: jsPDF, pageNum: number) {
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(
    "CPTED Residential Assessment Report — Volusia Sheriff's Office",
    PAGE_MARGIN,
    pageHeight - 8,
  );
  doc.text(`Page ${pageNum}`, PAGE_WIDTH - PAGE_MARGIN, pageHeight - 8, {
    align: 'right',
  });
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

  doc.setFillColor(NAVY);
  doc.rect(0, 0, PAGE_WIDTH, 60, 'F');

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
  doc.text("Volusia Sheriff's Office", PAGE_WIDTH / 2, 45, { align: 'center' });

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

function renderSummaryPage(doc: jsPDF, data: PDFData): void {
  doc.addPage();
  const pageNum = doc.getNumberOfPages();
  let y = 20;

  // Page title
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(NAVY);
  doc.text('Assessment Summary', PAGE_MARGIN, y);
  y += 8;

  // --- Executive Summary Paragraph ---
  const totalScored = data.itemScores.filter(
    (s) => s.score !== null && !s.is_na,
  ).length;
  const overall = data.assessment.overall_score;
  const attentionItems = data.itemScores.filter(
    (s) => s.score !== null && !s.is_na && s.score! <= 2,
  );
  const strongItems = data.itemScores.filter(
    (s) => s.score !== null && !s.is_na && s.score! >= 4,
  );

  const scoredZones = ZONES.map((zone) => {
    const zs = data.zoneScores.find((z) => z.zone_key === zone.key);
    return { name: zone.name, score: zs?.average_score ?? null };
  }).filter((z): z is { name: string; score: number } => z.score !== null);

  scoredZones.sort((a, b) => a.score - b.score);
  const worstZones = scoredZones.filter((z) => z.score < 3).slice(0, 2);
  const bestZones = scoredZones.filter((z) => z.score >= 4).slice(-2).reverse();

  let narrative = `This assessment evaluated ${data.assessment.address} across seven residential security zones, covering ${totalScored} checklist items.`;
  if (overall !== null) {
    narrative += ` The property received an overall score of ${overall.toFixed(1)} (${getScoreLabel(overall)}).`;
  }
  narrative += ` ${attentionItems.length} item${attentionItems.length === 1 ? ' was' : 's were'} identified as requiring attention, while ${strongItems.length} item${strongItems.length === 1 ? '' : 's'} demonstrated strong security practices.`;
  if (worstZones.length > 0) {
    narrative += ` Key areas of concern were found in ${worstZones.map((z) => z.name).join(' and ')}.`;
  }
  if (bestZones.length > 0) {
    narrative += ` Notable strengths were observed in ${bestZones.map((z) => z.name).join(' and ')}.`;
  }

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60);
  const narrativeLines = doc.splitTextToSize(narrative, CONTENT_WIDTH);
  doc.text(narrativeLines, PAGE_MARGIN, y);
  y += narrativeLines.length * 4 + 6;

  // Horizontal rule
  doc.setDrawColor(LIGHT_BLUE);
  doc.setLineWidth(0.3);
  doc.line(PAGE_MARGIN, y, PAGE_WIDTH - PAGE_MARGIN, y);
  y += 8;

  // --- Zone Score Color Bars ---
  const BAR_MAX_WIDTH = 100;
  const BAR_HEIGHT = 6;
  const BAR_GAP = 5;
  const LABEL_WIDTH = 55;

  for (const zone of ZONES) {
    const zs = data.zoneScores.find((z) => z.zone_key === zone.key);
    const score = zs?.average_score ?? null;

    // Zone name
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(NAVY);
    doc.text(zone.name, PAGE_MARGIN, y + BAR_HEIGHT * 0.7);

    const barX = PAGE_MARGIN + LABEL_WIDTH;

    if (score !== null && score !== undefined) {
      const barWidth = (score / 5) * BAR_MAX_WIDTH;
      doc.setFillColor(getScoreColorHex(score));
      doc.roundedRect(barX, y, barWidth, BAR_HEIGHT, 1.5, 1.5, 'F');

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(getScoreColorHex(score));
      doc.text(score.toFixed(1), barX + BAR_MAX_WIDTH + 5, y + BAR_HEIGHT * 0.75);
    } else {
      // Gray placeholder line
      doc.setDrawColor(200);
      doc.setLineWidth(0.3);
      doc.line(barX, y + BAR_HEIGHT / 2, barX + BAR_MAX_WIDTH, y + BAR_HEIGHT / 2);

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(180);
      doc.text('\u2014', barX + BAR_MAX_WIDTH + 5, y + BAR_HEIGHT * 0.75);
    }

    y += BAR_HEIGHT + BAR_GAP;
  }

  y += 3;

  // Horizontal rule
  doc.setDrawColor(LIGHT_BLUE);
  doc.setLineWidth(0.3);
  doc.line(PAGE_MARGIN, y, PAGE_WIDTH - PAGE_MARGIN, y);
  y += 8;

  // --- Zone Summary Table ---
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(NAVY);
  doc.text('Detailed Zone Summary', PAGE_MARGIN, y);
  y += 3;

  const zoneRows = ZONES.map((zone) => {
    const zs = data.zoneScores.find((z) => z.zone_key === zone.key);
    const zoneItems = data.itemScores.filter((s) => s.zone_key === zone.key);
    const counts = getCompletionCounts(zoneItems);
    const avg = zs?.average_score;
    return [
      String(zone.order),
      zone.name,
      avg !== null && avg !== undefined ? avg.toFixed(1) : '\u2014',
      avg !== null && avg !== undefined ? getScoreLabel(avg) : '\u2014',
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

const ZONE_RESIDENT_DESCRIPTIONS: Record<string, string> = {
  street_approach:
    'This section evaluates how your property appears from the street, including visibility of your address and front entry, and how clearly defined the approach to your home is.',
  front_yard:
    'This section covers your front yard landscaping, porch or entry area, and the main entrance to your home — the areas most visible to neighbors and passersby.',
  side_yards:
    'Side yards connect the front of your property to the back and are often less visible to neighbors. This section reviews the security and visibility of these transitional areas.',
  rear_yard:
    'The rear of the home is typically the most private area. This section evaluates the backyard, rear entry points, fencing, and how well this area can be observed.',
  garage_driveway:
    'This section assesses your driveway, garage, and the transition area between vehicle access and your home, including storage security and visibility.',
  exterior_lighting:
    'Good exterior lighting is one of the most effective security improvements for any home. This section reviews the quality, placement, and coverage of your outdoor lighting.',
  windows_interior:
    "This section covers window security, interior visibility considerations, security systems, and daily routines that affect your home's overall safety profile.",
};

function renderZoneDetails(doc: jsPDF, data: PDFData): void {
  for (const zone of ZONES) {
    doc.addPage();
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
      const scoreText = `${zs.average_score.toFixed(1)} \u2014 ${getScoreLabel(zs.average_score)}`;
      doc.text(scoreText, PAGE_WIDTH - PAGE_MARGIN - 4, y + 8, { align: 'right' });
    }

    // Accent line under header bar
    doc.setDrawColor(NAVY);
    doc.setLineWidth(0.3);
    doc.line(PAGE_MARGIN, y + 12.5, PAGE_WIDTH - PAGE_MARGIN, y + 12.5);
    y += 18;

    // Resident-friendly zone description
    const residentDesc = ZONE_RESIDENT_DESCRIPTIONS[zone.key];
    if (residentDesc) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80);
      const descLines = doc.splitTextToSize(residentDesc, CONTENT_WIDTH);
      doc.text(descLines, PAGE_MARGIN, y);
      y += descLines.length * 4 + 6;
    }

    // Categorize scored items for this zone
    const zoneItems = data.itemScores.filter((s) => s.zone_key === zone.key);
    const concerns = zoneItems.filter(
      (s) => s.score !== null && !s.is_na && s.score! <= 2,
    );
    const improvements = zoneItems.filter(
      (s) => s.score !== null && !s.is_na && s.score === 3,
    );
    const strengths = zoneItems.filter(
      (s) => s.score !== null && !s.is_na && s.score! >= 4,
    );
    const naItems = zoneItems.filter((s) => s.is_na);

    let hasPriorSection = false;

    // --- Areas Requiring Attention (scores 1-2) ---
    if (concerns.length > 0) {
      y = ensureSpace(doc, 25, y);
      doc.setFillColor('#FEF2F2');
      doc.rect(PAGE_MARGIN, y, CONTENT_WIDTH, 8, 'F');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor('#991B1B');
      doc.text('Areas Requiring Attention', PAGE_MARGIN + 3, y + 5.5);
      y += 10;

      const concernRows = concerns
        .sort((a, b) => a.score! - b.score!)
        .map((item) => [item.item_text, getScoreLabel(item.score!), item.notes || '']);

      autoTable(doc, {
        startY: y,
        head: [['Observation', 'Rating', 'Assessor Notes']],
        body: concernRows,
        margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
        theme: 'grid',
        headStyles: {
          fillColor: '#FEE2E2',
          textColor: '#991B1B',
          fontStyle: 'bold',
          fontSize: 8,
        },
        bodyStyles: { fontSize: 8, textColor: [50, 50, 50], cellPadding: 2.5 },
        columnStyles: {
          0: { cellWidth: 'auto' },
          1: { cellWidth: 22, halign: 'center', fontStyle: 'bold' },
          2: { cellWidth: 45, fontSize: 7 },
        },
        didParseCell(hookData) {
          if (hookData.section === 'body' && hookData.column.index === 1) {
            const label = hookData.cell.raw as string;
            if (label === 'Critical') {
              hookData.cell.styles.textColor = getScoreColorHex(1);
            } else if (label === 'Deficient') {
              hookData.cell.styles.textColor = getScoreColorHex(2);
            }
          }
        },
      });

      y =
        (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY +
        8;
      hasPriorSection = true;
    }

    // --- Opportunities for Enhancement (score 3) ---
    if (improvements.length > 0) {
      // Divider between sections
      if (hasPriorSection) {
        doc.setDrawColor(LIGHT_BLUE);
        doc.setLineWidth(0.3);
        doc.line(PAGE_MARGIN + 5, y, PAGE_WIDTH - PAGE_MARGIN - 5, y);
        y += 6;
      }

      y = ensureSpace(doc, 20, y);

      const withNotes = improvements.filter((s) => s.notes.trim());
      const withoutNotes = improvements.filter((s) => !s.notes.trim());

      // Section header
      doc.setFillColor('#FEFCE8');
      doc.rect(PAGE_MARGIN, y, CONTENT_WIDTH, 8, 'F');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor('#854D0E');
      doc.text('Opportunities for Enhancement', PAGE_MARGIN + 3, y + 5.5);
      y += 10;

      // Intro sentence
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(80);
      doc.text(
        'The following items meet basic security standards but present opportunities for enhancement:',
        PAGE_MARGIN + 2,
        y,
      );
      y += 5;

      if (withNotes.length > 0) {
        const noteRows = withNotes.map((item) => [item.item_text, item.notes]);

        autoTable(doc, {
          startY: y,
          head: [['Observation', 'Assessor Notes']],
          body: noteRows,
          margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
          theme: 'grid',
          headStyles: {
            fillColor: '#FEF9C3',
            textColor: '#854D0E',
            fontStyle: 'bold',
            fontSize: 8,
          },
          bodyStyles: { fontSize: 8, textColor: [50, 50, 50], cellPadding: 2.5 },
          columnStyles: {
            0: { cellWidth: 'auto' },
            1: { cellWidth: 45, fontSize: 7 },
          },
        });

        y =
          (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
            .finalY + 3;
      }

      if (withoutNotes.length > 0) {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80);

        // Show up to 3 bullets, then summarize the rest
        const showItems = withoutNotes.slice(0, 3);
        const remainingCount = withoutNotes.length - showItems.length;

        for (const item of showItems) {
          y = ensureSpace(doc, 6, y);
          const bulletText = `\u2022  ${item.item_text}`;
          const lines = doc.splitTextToSize(bulletText, CONTENT_WIDTH - 4);
          doc.text(lines, PAGE_MARGIN + 2, y);
          y += lines.length * 3.5 + 1.5;
        }

        if (remainingCount > 0) {
          doc.setFontSize(8);
          doc.setFont('helvetica', 'italic');
          doc.setTextColor(100);
          doc.text(
            `...and ${remainingCount} more item${remainingCount === 1 ? '' : 's'} meeting basic standards.`,
            PAGE_MARGIN + 6,
            y,
          );
          y += 4;
        }
        y += 4;
      }

      hasPriorSection = true;
    }

    // --- Positive Observations (scores 4-5) ---
    if (strengths.length > 0) {
      // Divider between sections
      if (hasPriorSection) {
        doc.setDrawColor(LIGHT_BLUE);
        doc.setLineWidth(0.3);
        doc.line(PAGE_MARGIN + 5, y, PAGE_WIDTH - PAGE_MARGIN - 5, y);
        y += 6;
      }

      y = ensureSpace(doc, 25, y);
      doc.setFillColor('#F0FDF4');
      doc.rect(PAGE_MARGIN, y, CONTENT_WIDTH, 8, 'F');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor('#166534');
      doc.text(
        `Positive Observations (${strengths.length} item${strengths.length === 1 ? '' : 's'})`,
        PAGE_MARGIN + 3,
        y + 5.5,
      );
      y += 10;

      // Intro sentence
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(80);
      doc.text(
        'Your property demonstrates strong security practices in these areas:',
        PAGE_MARGIN + 2,
        y,
      );
      y += 5;

      // Group Excellent (5) first, then Good (4)
      const excellent = strengths.filter((s) => s.score === 5);
      const good = strengths.filter((s) => s.score === 4);

      for (const group of [
        { items: excellent, label: 'Excellent', score: 5 },
        { items: good, label: 'Good', score: 4 },
      ]) {
        if (group.items.length === 0) continue;

        // Sub-label
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(getScoreColorHex(group.score));
        doc.text(group.label.toUpperCase(), PAGE_MARGIN + 2, y);
        y += 4;

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60);

        for (const item of group.items) {
          y = ensureSpace(doc, 8, y);
          const bulletText = `\u2022  ${item.item_text}`;
          const lines = doc.splitTextToSize(bulletText, CONTENT_WIDTH - 4);
          doc.text(lines, PAGE_MARGIN + 2, y);
          y += lines.length * 3.5 + 1;

          // Show assessor notes inline if present
          if (item.notes.trim()) {
            doc.setFontSize(7);
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(100);
            const noteLines = doc.splitTextToSize(item.notes.trim(), CONTENT_WIDTH - 12);
            doc.text(noteLines, PAGE_MARGIN + 8, y);
            y += noteLines.length * 3 + 1;
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(60);
          }
        }
        y += 2;
      }
    }

    // Summary line if nothing notable
    if (
      concerns.length === 0 &&
      improvements.length === 0 &&
      strengths.length === 0
    ) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(120);
      doc.text('No items have been scored in this zone yet.', PAGE_MARGIN, y);
      y += 8;
    } else if (naItems.length > 0) {
      doc.setFontSize(7);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(140);
      doc.text(
        `${naItems.length} item${naItems.length === 1 ? '' : 's'} marked as not applicable to this property.`,
        PAGE_MARGIN,
        y,
      );
      y += 6;
    }

    // Photos for this zone (2 per row, item text captions)
    const zonePhotos = data.photos.filter((p) => p.zone_key === zone.key);
    if (zonePhotos.length > 0) {
      y = ensureSpace(doc, 65, y);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(NAVY);
      doc.text('Photos', PAGE_MARGIN, y);
      y += 5;

      const photoWidth = (CONTENT_WIDTH - 5) / 2; // 2 per row with gap
      let col = 0;

      for (const photo of zonePhotos) {
        const b64 = data.photoBase64Map.get(photo.id);
        if (!b64) continue;

        y = ensureSpace(doc, 60, y);

        const x = PAGE_MARGIN + col * (photoWidth + 5);
        try {
          doc.addImage(b64, 'JPEG', x, y, photoWidth, photoWidth * 0.75);

          // Caption: item text + timestamp (no GPS)
          doc.setFontSize(6);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(100);
          const captionParts: string[] = [];

          // Look up associated checklist item text
          if (photo.item_score_id) {
            const itemScore = data.itemScores.find(
              (is) => is.id === photo.item_score_id,
            );
            if (itemScore) {
              const itemText =
                itemScore.item_text.length > 80
                  ? itemScore.item_text.substring(0, 77) + '...'
                  : itemScore.item_text;
              captionParts.push(itemText);
            }
          }

          if (photo.captured_at) {
            const capturedDate =
              photo.captured_at instanceof Date
                ? photo.captured_at
                : new Date(photo.captured_at);
            captionParts.push(
              capturedDate.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              }),
            );
          }

          if (captionParts.length > 0) {
            const captionText = captionParts.join(' \u2014 ');
            const captionLines = doc.splitTextToSize(captionText, photoWidth);
            doc.text(captionLines, x, y + photoWidth * 0.75 + 3);
          }
        } catch {
          // Skip photos that fail to render
        }

        col++;
        if (col >= 2) {
          col = 0;
          y += photoWidth * 0.75 + 10;
        }
      }

      if (col > 0) {
        y += photoWidth * 0.75 + 10;
      }
    }

    addPageFooter(doc, doc.getNumberOfPages());
  }
}

function renderRecommendations(doc: jsPDF, data: PDFData): void {
  doc.addPage();
  const pageNum = doc.getNumberOfPages();
  let y = 20;

  doc.setFillColor(NAVY);
  doc.rect(PAGE_MARGIN, y, CONTENT_WIDTH, 12, 'F');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(WHITE);
  doc.text('Recommendations', PAGE_MARGIN + 4, y + 8);
  y += 20;

  const assessment = data.assessment;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(NAVY);
  doc.text('Top Recommendations', PAGE_MARGIN, y);
  y += 7;

  const recs = (assessment.top_recommendations || []) as Recommendation[];
  if (recs.length === 0) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(150);
    doc.text(
      'No recommendations have been added for this assessment.',
      PAGE_MARGIN,
      y,
    );
    y += 10;
  } else {
    for (let i = 0; i < recs.length; i++) {
      y = ensureSpace(doc, 20, y);
      renderRecommendationItem(doc, recs[i], i + 1, y);
      y += 18;
    }
  }

  y = ensureSpace(doc, 25, y);
  y += 5;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(NAVY);
  doc.text('Quick Wins', PAGE_MARGIN, y);
  y += 7;

  const qw = (assessment.quick_wins || []) as Recommendation[];
  if (qw.length === 0) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(150);
    doc.text(
      'No quick wins have been added for this assessment.',
      PAGE_MARGIN,
      y,
    );
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
  doc.setFillColor(NAVY);
  doc.circle(PAGE_MARGIN + 4, y + 2, 3.5, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(WHITE);
  doc.text(String(num), PAGE_MARGIN + 4, y + 3, { align: 'center' });

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

  if (rec.timeline) {
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120);
    doc.text(rec.timeline, badgeX + 20, y + 2);
  }

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50);
  const descLines = doc.splitTextToSize(rec.description, CONTENT_WIDTH - 12);
  doc.text(descLines, PAGE_MARGIN + 12, y + 8);
}

function renderQuickWinItem(doc: jsPDF, item: Recommendation, y: number): void {
  doc.setFillColor(MEDIUM_BLUE);
  doc.circle(PAGE_MARGIN + 3, y + 2, 1.5, 'F');

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(MEDIUM_BLUE);
  doc.text(`[${item.priority.toUpperCase()}]`, PAGE_MARGIN + 8, y + 3);

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

  doc.setFillColor(NAVY);
  doc.rect(PAGE_MARGIN, y, CONTENT_WIDTH, 12, 'F');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(WHITE);
  doc.text('Liability Waiver & Acknowledgment', PAGE_MARGIN + 4, y + 8);
  y += 22;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50);
  const waiverLines = doc.splitTextToSize(LIABILITY_WAIVER, CONTENT_WIDTH);
  doc.text(waiverLines, PAGE_MARGIN, y);
  y += waiverLines.length * 5 + 20;

  const lineWidth = 70;
  const sigY = y;
  const leftSig = PAGE_MARGIN;
  const rightSig = PAGE_WIDTH / 2 + 10;

  doc.setDrawColor(NAVY);
  doc.setLineWidth(0.3);

  doc.line(leftSig, sigY, leftSig + lineWidth, sigY);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(NAVY);
  doc.text('Assessor Signature', leftSig, sigY + 5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text(data.assessment.assessor_name, leftSig, sigY + 10);

  doc.line(rightSig, sigY, rightSig + lineWidth, sigY);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(NAVY);
  doc.text('Date', rightSig, sigY + 5);

  const ownerSigY = sigY + 25;
  doc.line(leftSig, ownerSigY, leftSig + lineWidth, ownerSigY);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(NAVY);
  doc.text('Homeowner Signature', leftSig, ownerSigY + 5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text(data.assessment.homeowner_name, leftSig, ownerSigY + 10);

  doc.line(rightSig, ownerSigY, rightSig + lineWidth, ownerSigY);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(NAVY);
  doc.text('Date', rightSig, ownerSigY + 5);

  addPageFooter(doc, pageNum);
}

// --- Main exports ---

export async function generatePDFBuffer(assessmentId: string): Promise<{
  buffer: ArrayBuffer;
  filename: string;
}> {
  const data = await gatherAssessmentData(assessmentId);

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  renderCoverPage(doc, data);
  renderSummaryPage(doc, data);
  renderZoneDetails(doc, data);
  renderRecommendations(doc, data);
  renderLiabilityWaiver(doc, data);

  return {
    buffer: doc.output('arraybuffer'),
    filename: generateFilename(data.assessment),
  };
}
