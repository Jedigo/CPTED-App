import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { db } from '../db/database';
import { getZonesForType, getItemGuidanceForType, isWorshipType, isSchoolType, isCommercialType } from '../data/zone-registry';
import {
  getScoreLabel,
  getCompletionCounts,
} from './scoring';
import type {
  Assessment,
  ZoneDefinition,
  ZoneScore,
  ItemScore,
  Photo,
  Recommendation,
  SchoolRating,
} from '../types';
import type { ItemGuidance } from '../data/item-guidance';

// --- Design constants ---
const NAVY = '#1B3A5C';
const MEDIUM_BLUE = '#4A7FB5';
const LIGHT_BLUE = '#D6E8F5';
const WHITE = '#FFFFFF';
const PAGE_MARGIN = 20;
const PAGE_WIDTH = 210; // A4 mm
const CONTENT_WIDTH = PAGE_WIDTH - PAGE_MARGIN * 2;
// Unnumbered front-matter pages before numbering starts: the cover and the
// "Understanding CPTED" intro. Displayed page numbering begins on the TOC.
const FRONT_MATTER_PAGES = 2;

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

// --- School Yes/No/UTO rating color helper (hex for PDF) ---
function getRatingColorHex(rating: SchoolRating): string {
  if (rating === 'yes') return '#16A34A'; // green-600
  if (rating === 'no') return '#DC2626'; // red-600
  return '#6B7280'; // gray-500 (UTO)
}

// --- Filename generator ---
function generateFilename(assessment: Assessment): string {
  const addr = assessment.address
    .replace(/[^a-zA-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .substring(0, 40);
  const date = assessment.date_of_assessment || assessment.created_at.slice(0, 10);
  const typePrefix = isSchoolType(assessment.property_type)
    ? 'CPTED_School'
    : isCommercialType(assessment.property_type)
      ? 'CPTED_CommercialOffice'
      : isWorshipType(assessment.property_type)
        ? 'CPTED_Worship'
        : 'CPTED_Assessment';
  return `${typePrefix}_${addr}_${date}.pdf`;
}

// --- Format helpers ---
function formatDate(isoString: string): string {
  if (!isoString) return 'N/A';
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(isoString);
  const d = dateOnly ? new Date(isoString + 'T00:00:00') : new Date(isoString);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// --- Logo loading (fetches from public/ at PDF generation time) ---
async function loadLogoBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

// --- Data gathering ---
interface PDFData {
  assessment: Assessment;
  zones: ZoneDefinition[];
  itemGuidance: Map<string, ItemGuidance>;
  zoneScores: ZoneScore[];
  itemScores: ItemScore[];
  photos: Photo[];
  badgeLogo: string | null;
}

async function gatherAssessmentData(assessmentId: string): Promise<PDFData> {
  const [assessment, zoneScores, itemScores, photos, badgeLogo] = await Promise.all([
    db.assessments.get(assessmentId),
    db.zone_scores
      .where('assessment_id')
      .equals(assessmentId)
      .sortBy('zone_order'),
    db.item_scores.where('assessment_id').equals(assessmentId).toArray(),
    db.photos.where('assessment_id').equals(assessmentId).toArray(),
    loadLogoBase64('/logos/volusia_sheriff_badge_star.png'),
  ]);

  if (!assessment) throw new Error('Assessment not found');

  const zones = getZonesForType(assessment.property_type);
  const itemGuidance = getItemGuidanceForType(assessment.property_type);

  // Only include photos still referenced by an item_score's photo_ids
  const referencedIds = new Set(itemScores.flatMap((s) => s.photo_ids));
  const validPhotos = photos.filter((p) => referencedIds.has(p.id));

  return { assessment, zones, itemGuidance, zoneScores, itemScores, photos: validPhotos, badgeLogo };
}

// --- Page helpers ---
const FOOTER_TEXT = "CPTED Report - Volusia Sheriff's Office";

// pageNum is the jsPDF page index. Front-matter pages (cover + CPTED intro)
// carry no footer; displayed numbering starts at 1 on the table of contents,
// so we show (pageNum - FRONT_MATTER_PAGES).
function addPageFooter(doc: jsPDF, pageNum: number) {
  if (pageNum <= FRONT_MATTER_PAGES) return;
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(
    FOOTER_TEXT,
    PAGE_MARGIN,
    pageHeight - 8,
  );
  doc.text(
    `Page ${pageNum - FRONT_MATTER_PAGES}`,
    PAGE_WIDTH - PAGE_MARGIN,
    pageHeight - 8,
    { align: 'right' },
  );
}

// Red "CONFIDENTIAL" marking centered at the top of every page except the cover
// (whose navy banner would swallow it). The report contains security-system
// details exempt from public disclosure.
function addConfidentialHeader(doc: jsPDF, pageNum: number) {
  if (pageNum <= 1) return; // skip the cover
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor('#B91C1C'); // red-700
  doc.text('CONFIDENTIAL', PAGE_WIDTH / 2, 8, { align: 'center' });
}

// Footers are stamped in a single final pass in generatePDF, so page-adding
// here doesn't need to footer — it just makes room.
function ensureSpace(doc: jsPDF, needed: number, currentY: number): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (currentY + needed > pageHeight - 20) {
    doc.addPage();
    return 20;
  }
  return currentY;
}

// --- Section renderers ---

// Formal document-style title page (applies to every report type). Kept minimal:
// badge + agency at the top, the CPTED title, and the property/owner name above
// its address. No footer/page number — page numbering starts on the TOC.
function renderCoverPage(doc: jsPDF, data: PDFData): void {
  const { assessment } = data;
  const cx = PAGE_WIDTH / 2;
  const DIV = 52; // half-width of the centered divider lines

  const pageHeight = doc.internal.pageSize.getHeight();

  // Top band — navy, matching the report's section headers
  doc.setFillColor(NAVY);
  doc.rect(0, 0, PAGE_WIDTH, 16, 'F');

  // Vertically center the whole masthead/title/address block in the area between
  // the top and bottom bands. blockHeight sums the vertical advances below.
  const badgeW = 44;
  const badgeH = badgeW * (316 / 342);
  const hasName = !!assessment.homeowner_name;
  const blockHeight =
    (data.badgeLogo ? badgeH : 0) + 12 + 10 + 18 + 9 + 16 + 18 + (hasName ? 6 : 0) + 6;
  let y = 16 + ((pageHeight - 32) - blockHeight) / 2;

  // Badge logo, centered (aspect ratio preserved — the star badge is ~342x316)
  if (data.badgeLogo) {
    try {
      doc.addImage(data.badgeLogo, 'PNG', cx - badgeW / 2, y, badgeW, badgeH);
    } catch { /* skip if logo fails */ }
    y += badgeH + 12;
  } else {
    y += 12;
  }

  // Agency + unit, directly under the badge — the masthead, larger than the
  // CPTED title below it. Unit text shares the navy of the rest of the text.
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(21);
  doc.setTextColor(NAVY);
  doc.text("Volusia Sheriff's Office", cx, y, { align: 'center' });
  y += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(21);
  doc.setTextColor(NAVY);
  doc.text('Domestic Security Unit', cx, y, { align: 'center' });
  y += 18;

  // CPTED report title — same size (21pt) as the masthead above, kept bold.
  // Title case (not all-caps) so it doesn't read visually larger than the
  // mixed-case agency/unit lines above it.
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(21);
  doc.setTextColor(NAVY);
  doc.text('Crime Prevention Through', cx, y, { align: 'center' });
  y += 9;
  doc.text('Environmental Design Report', cx, y, { align: 'center' });
  y += 16;

  // Divider
  doc.setDrawColor(MEDIUM_BLUE);
  doc.setLineWidth(0.4);
  doc.line(cx - DIV, y, cx + DIV, y);
  y += 18;

  // Property/owner name (bold) above the address; address lines uniform & not bold
  doc.setFontSize(13);
  doc.setTextColor(NAVY);
  if (assessment.homeowner_name) {
    doc.setFont('helvetica', 'bold');
    doc.text(assessment.homeowner_name, cx, y, { align: 'center' });
    y += 6;
  }
  doc.setFont('helvetica', 'normal');
  doc.text(assessment.address, cx, y, { align: 'center' });
  y += 6;
  doc.text(`${assessment.city}, ${assessment.state} ${assessment.zip}`, cx, y, { align: 'center' });

  // Bottom band — navy, matching the top band and the report's section headers
  doc.setFillColor(NAVY);
  doc.rect(0, pageHeight - 16, PAGE_WIDTH, 16, 'F');

  // No footer on the cover — page numbering begins on the table of contents.
}

// Brief "what is CPTED" explainer, placed between the cover and the table of
// contents as unnumbered front matter. Mirrors the CPTED Concept framing from
// the Volusia survey (five overlapping strategies).
function renderCptedIntro(doc: jsPDF): void {
  doc.addPage();
  let y = 20;

  // Header bar
  doc.setFillColor(NAVY);
  doc.rect(PAGE_MARGIN, y, CONTENT_WIDTH, 12, 'F');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(WHITE);
  doc.text('Understanding CPTED', PAGE_MARGIN + 4, y + 8);
  y += 22;

  // Intro paragraph
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50);
  const intro =
    'Crime Prevention Through Environmental Design (CPTED) is based on the principle that the proper design and effective use of the built environment can lead to a reduction in both crime and the fear of crime, improving the overall quality of life. Rather than relying on security hardware alone, CPTED uses physical design, landscaping, lighting, and the everyday use of space to discourage offenders while supporting the people who legitimately use a property.';
  const introLines = doc.splitTextToSize(intro, CONTENT_WIDTH);
  doc.text(introLines, PAGE_MARGIN, y);
  y += introLines.length * 5 + 6;

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(NAVY);
  doc.text('A CPTED review considers five overlapping strategies:', PAGE_MARGIN, y);
  y += 8;

  const strategies: [string, string][] = [
    ['Natural Surveillance', 'Designing and maintaining spaces so that people and activity remain easily visible to others.'],
    ['Natural Access Control', 'Using entrances, walkways, fencing, and landscaping to guide movement and control who can enter an area.'],
    ['Territorial Reinforcement', 'Using boundaries, signage, and ownership cues to clearly distinguish private space from public space.'],
    ['Maintenance & Image', 'Keeping a property clean and well maintained as an ongoing expression of active ownership and care.'],
    ['Target Hardening', 'Strengthening physical security through locks, doors, lighting, alarms, cameras, and similar measures.'],
  ];

  for (const [label, desc] of strategies) {
    // Bullet + bold strategy name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(NAVY);
    doc.text(`•  ${label}`, PAGE_MARGIN + 2, y);
    y += 5;
    // Description, indented
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(60);
    const descLines = doc.splitTextToSize(desc, CONTENT_WIDTH - 8);
    doc.text(descLines, PAGE_MARGIN + 7, y);
    y += descLines.length * 4 + 4;
  }

  y += 4;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(80);
  const closing =
    'The findings and recommendations in this report identify opportunities to strengthen these strategies. They are offered as voluntary guidance to help reduce risk and cannot guarantee the prevention of all criminal activity.';
  const closingLines = doc.splitTextToSize(closing, CONTENT_WIDTH);
  doc.text(closingLines, PAGE_MARGIN, y);

  // No footer — this is unnumbered front matter.
}

// School summary: no scores, no averages — a narrative of findings + a plain
// zone index showing completion only. Mirrors the printed Yes/No/UTO form.
function renderSchoolSummaryPage(doc: jsPDF, data: PDFData): void {
  doc.addPage();
  let y = 20;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(NAVY);
  doc.text('Assessment Summary', PAGE_MARGIN, y);
  y += 8;

  const rated = data.itemScores.filter((s) => s.score !== null && !s.is_na);
  const noCount = rated.filter((s) => s.score === 'no').length;
  const utoCount = rated.filter((s) => s.score === 'uto').length;

  const zoneCountWord =
    data.zones.length === 10
      ? 'ten'
      : data.zones.length === 11
        ? 'eleven'
        : String(data.zones.length);

  let narrative = `This assessment evaluated ${data.assessment.address} across ${zoneCountWord} school security zones, covering ${rated.length} checklist item${rated.length === 1 ? '' : 's'} rated Yes, No, or Unable to Observe.`;
  narrative += ` ${noCount} item${noCount === 1 ? ' was' : 's were'} marked "No" and ${noCount === 1 ? 'is' : 'are'} addressed in the zone findings and recommendations that follow.`;
  if (utoCount > 0) {
    narrative += ` ${utoCount} item${utoCount === 1 ? ' was' : 's were'} unable to be observed during the visit.`;
  }

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60);
  const narrativeLines = doc.splitTextToSize(narrative, CONTENT_WIDTH);
  doc.text(narrativeLines, PAGE_MARGIN, y);
  y += narrativeLines.length * 4 + 6;

  doc.setDrawColor(LIGHT_BLUE);
  doc.setLineWidth(0.3);
  doc.line(PAGE_MARGIN, y, PAGE_WIDTH - PAGE_MARGIN, y);
  y += 8;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(NAVY);
  doc.text('Zones', PAGE_MARGIN, y);
  y += 3;

  const zoneRows = data.zones.map((zone) => {
    const zs = data.zoneScores.find((z) => z.zone_key === zone.key);
    const zoneItems = data.itemScores.filter((s) => s.zone_key === zone.key);
    const counts = getCompletionCounts(zoneItems);
    return [
      String(zone.order),
      zone.name,
      `${counts.scored} / ${counts.total}`,
      zs?.completed ? 'Complete' : counts.scored > 0 ? 'Partial' : 'Not Started',
    ];
  });

  autoTable(doc, {
    startY: y,
    head: [['#', 'Zone', 'Items Rated', 'Status']],
    body: zoneRows,
    margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
    theme: 'grid',
    headStyles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 9, textColor: [50, 50, 50] },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 28, halign: 'center' },
      3: { cellWidth: 28, halign: 'center' },
    },
  });

}

function renderSummaryPage(doc: jsPDF, data: PDFData): void {
  // Schools use a score-free summary (no overall, no zone averages, no tallies).
  if (isSchoolType(data.assessment.property_type)) {
    renderSchoolSummaryPage(doc, data);
    return;
  }

  doc.addPage();
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
    (s) => typeof s.score === 'number' && !s.is_na && s.score <= 2,
  );
  const strongItems = data.itemScores.filter(
    (s) => typeof s.score === 'number' && !s.is_na && s.score >= 4,
  );

  const scoredZones = data.zones.map((zone) => {
    const zs = data.zoneScores.find((z) => z.zone_key === zone.key);
    return { name: zone.name, score: zs?.average_score ?? null };
  }).filter((z): z is { name: string; score: number } => z.score !== null);

  scoredZones.sort((a, b) => a.score - b.score);
  const worstZones = scoredZones.filter((z) => z.score < 3).slice(0, 2);
  const bestZones = scoredZones.filter((z) => z.score >= 4).slice(-2).reverse();

  const zoneCountWord =
    data.zones.length === 7
      ? 'seven'
      : data.zones.length === 8
        ? 'eight'
        : data.zones.length === 10
          ? 'ten'
          : data.zones.length === 11
            ? 'eleven'
            : String(data.zones.length);
  const typeLabel = isSchoolType(data.assessment.property_type)
    ? 'school security'
    : isCommercialType(data.assessment.property_type)
      ? 'commercial office security'
      : isWorshipType(data.assessment.property_type)
        ? 'facility security'
        : 'residential security';
  let narrative = `This assessment evaluated ${data.assessment.address} across ${zoneCountWord} ${typeLabel} zones, covering ${totalScored} checklist items.`;
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

  for (const zone of data.zones) {
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

  const zoneRows = data.zones.map((zone) => {
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

}

// Resident-friendly zone descriptions (replaces assessor-facing instructions)
const ZONE_RESIDENT_DESCRIPTIONS: Record<string, string> = {
  // Residential
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
    'This section covers window security, interior visibility considerations, security systems, and daily routines that affect your home\'s overall safety profile.',
  // Places of Worship
  perimeter_parking:
    'This section evaluates the property perimeter, signage, parking areas, and how well access points are defined and monitored.',
  building_exterior:
    'This section reviews the building exterior, grounds maintenance, secondary doors, and utility areas for security and visibility.',
  main_entry:
    'This section covers the main entrance experience, greeting areas, and how well visitors are observed and welcomed upon arrival.',
  sanctuary:
    'This section assesses the primary worship space for sight lines, emergency preparedness, and security of sacred objects and clergy areas.',
  fellowship_spaces:
    'This section evaluates fellowship halls, kitchens, and meeting rooms used for community events — focusing on access control and emergency egress.',
  education_children:
    'Children\'s ministry areas require the highest level of access control and supervision. This section reviews check-in systems, classroom security, and child protection policies.',
  admin_support:
    'This section covers administrative offices, financial areas, and IT infrastructure — spaces that contain sensitive information and valuables.',
  lighting_surveillance:
    'Exterior lighting and surveillance systems are critical for places of worship, which are often unoccupied for extended periods. This section reviews coverage and functionality.',
};

// Render inline photos for a specific item (2 per row, compact)
function renderItemPhotos(doc: jsPDF, item: ItemScore, data: PDFData, y: number): number {
  const itemPhotos = data.photos.filter((p) => p.item_score_id === item.id && p.data);
  if (itemPhotos.length === 0) return y;

  const photoWidth = (CONTENT_WIDTH - 10) / 2; // 2 per row with gap
  const photoHeight = photoWidth * 0.65; // slightly shorter aspect ratio for inline
  let col = 0;

  for (const photo of itemPhotos) {
    y = ensureSpace(doc, photoHeight + 5, y);
    const x = PAGE_MARGIN + 3 + col * (photoWidth + 4);
    try {
      doc.addImage(photo.data, 'JPEG', x, y, photoWidth, photoHeight);
    } catch {
      // Skip photos that fail to render
    }
    col++;
    if (col >= 2) {
      col = 0;
      y += photoHeight + 3;
    }
  }
  // Advance past last partial row
  if (col > 0) {
    y += photoHeight + 3;
  }
  return y;
}

// Renders one deficient item as a red "finding" card: item row + rating badge,
// optional assessor note callout, optional CPTED guidance block, inline photos.
// Used for both numeric concerns (1-2) and school "No" items — the badge label
// and color are passed in so the body is identical for both rating systems.
function renderFindingCard(
  doc: jsPDF,
  data: PDFData,
  item: ItemScore,
  y: number,
  ratingLabel: string,
  ratingColorHex: string,
): number {
  const guidance = data.itemGuidance.get(item.item_text);

  // Item text — set size first so wrapping matches the rendered size
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const itemLines = doc.splitTextToSize(item.item_text, CONTENT_WIDTH - 30);
  const itemRowHeight = Math.max(itemLines.length * 4.3 + 5, 12);

  // Estimate total height for the page-break check
  const estimatedHeight =
    itemRowHeight + (item.notes?.trim() ? 16 : 0) + (guidance ? 32 : 0);
  y = ensureSpace(doc, estimatedHeight, y);

  // Item row — light red background
  doc.setFillColor('#FEE2E2');
  doc.roundedRect(PAGE_MARGIN, y, CONTENT_WIDTH, itemRowHeight, 1, 1, 'F');
  doc.setTextColor(50);
  doc.text(itemLines, PAGE_MARGIN + 3, y + 6);

  // Rating badge on right
  const badgeWidth = 20;
  const badgeX = PAGE_WIDTH - PAGE_MARGIN - badgeWidth - 2;
  doc.setFillColor(ratingColorHex);
  doc.roundedRect(badgeX, y + 2, badgeWidth, 5.5, 1, 1, 'F');
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(WHITE);
  doc.text(ratingLabel, badgeX + badgeWidth / 2, y + 5.8, { align: 'center' });

  y += itemRowHeight + 1.5;

  // Assessor notes (if present) — styled as a visible callout
  if (item.notes.trim()) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const noteLines = doc.splitTextToSize(item.notes.trim(), CONTENT_WIDTH - 18);
    const noteBlockHeight = noteLines.length * 3.9 + 7;
    y = ensureSpace(doc, noteBlockHeight, y);

    doc.setFillColor('#FEF3C7'); // amber-100
    doc.roundedRect(PAGE_MARGIN + 3, y, CONTENT_WIDTH - 6, noteBlockHeight, 1, 1, 'F');

    doc.setFillColor('#D97706'); // amber-600
    doc.rect(PAGE_MARGIN + 3, y, 1.5, noteBlockHeight, 'F');

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor('#92400E'); // amber-800
    doc.text('Assessor Note:', PAGE_MARGIN + 8, y + 4.5);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor('#78350F'); // amber-900
    doc.text(noteLines, PAGE_MARGIN + 8, y + 4.5 + 4);

    y += noteBlockHeight + 2;
  }

  // CPTED Guidance block (if found)
  if (guidance) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    const standardLines = doc.splitTextToSize(guidance.standard, CONTENT_WIDTH - 16);
    const improvementLines = doc.splitTextToSize(guidance.improvement, CONTENT_WIDTH - 16);
    const guidanceHeight =
      4 + 4 + standardLines.length * 3.5 + 4 + 4 + improvementLines.length * 3.5 + 4;
    y = ensureSpace(doc, guidanceHeight, y);

    doc.setFillColor('#FFF5F5');
    doc.roundedRect(PAGE_MARGIN + 3, y, CONTENT_WIDTH - 6, guidanceHeight, 1, 1, 'F');

    doc.setFillColor('#DC2626');
    doc.rect(PAGE_MARGIN + 3, y, 1.5, guidanceHeight, 'F');

    let gy = y + 4.5;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor('#991B1B');
    doc.text('CPTED Standard:', PAGE_MARGIN + 8, gy);
    gy += 4;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60);
    doc.text(standardLines, PAGE_MARGIN + 8, gy);
    gy += standardLines.length * 3.5 + 4;

    doc.setFont('helvetica', 'bold');
    doc.setTextColor('#991B1B');
    doc.text('How to Improve:', PAGE_MARGIN + 8, gy);
    gy += 4;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60);
    doc.text(improvementLines, PAGE_MARGIN + 8, gy);

    y += guidanceHeight + 3;
  }

  // Inline photos for this item
  y = renderItemPhotos(doc, item, data, y);

  y += 3; // Gap before next item
  return y;
}

// School (Yes/No/UTO) zone body — No findings (red, with guidance), then an
// Unable-to-Observe list, then compliant items. Keeps the residential card look.
function renderSchoolZoneBody(
  doc: jsPDF,
  data: PDFData,
  zone: ZoneDefinition,
  y: number,
): number {
  const zoneItems = data.itemScores.filter((s) => s.zone_key === zone.key);
  const findings = zoneItems.filter((s) => s.score === 'no');
  const utoItems = zoneItems.filter((s) => s.score === 'uto');
  const compliant = zoneItems.filter((s) => s.score === 'yes');

  let hasPriorSection = false;

  // --- Findings (No) with CPTED guidance ---
  if (findings.length > 0) {
    y = ensureSpace(doc, 25, y);
    doc.setFillColor('#FEF2F2');
    doc.rect(PAGE_MARGIN, y, CONTENT_WIDTH, 8, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor('#991B1B');
    doc.text(
      `Findings — Not Met (${findings.length} item${findings.length === 1 ? '' : 's'})`,
      PAGE_MARGIN + 3,
      y + 5.5,
    );
    y += 12;

    const sorted = [...findings].sort((a, b) => a.item_order - b.item_order);
    for (const item of sorted) {
      y = renderFindingCard(doc, data, item, y, 'No', getRatingColorHex('no'));
    }
    hasPriorSection = true;
  }

  // --- Unable to Observe ---
  if (utoItems.length > 0) {
    if (hasPriorSection) {
      doc.setDrawColor(LIGHT_BLUE);
      doc.setLineWidth(0.3);
      doc.line(PAGE_MARGIN + 5, y, PAGE_WIDTH - PAGE_MARGIN - 5, y);
      y += 6;
    }
    y = ensureSpace(doc, 20, y);
    doc.setFillColor('#F3F4F6'); // gray-100
    doc.rect(PAGE_MARGIN, y, CONTENT_WIDTH, 8, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor('#4B5563'); // gray-600
    doc.text(
      `Unable to Observe (${utoItems.length} item${utoItems.length === 1 ? '' : 's'})`,
      PAGE_MARGIN + 3,
      y + 5.5,
    );
    y += 10;

    for (const item of utoItems.sort((a, b) => a.item_order - b.item_order)) {
      y = ensureSpace(doc, 9, y);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80);
      const lines = doc.splitTextToSize(`•  ${item.item_text}`, CONTENT_WIDTH - 4);
      doc.text(lines, PAGE_MARGIN + 2, y);
      y += lines.length * 4.3 + 1.5;

      if (item.notes.trim()) {
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(120);
        const noteLines = doc.splitTextToSize(`Note: ${item.notes.trim()}`, CONTENT_WIDTH - 12);
        doc.text(noteLines, PAGE_MARGIN + 6, y);
        y += noteLines.length * 3.6 + 1;
      }
      y = renderItemPhotos(doc, item, data, y);
      y += 1;
    }
    hasPriorSection = true;
  }

  // --- Compliant (Yes) ---
  if (compliant.length > 0) {
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
      `Compliant — Standard Met (${compliant.length} item${compliant.length === 1 ? '' : 's'})`,
      PAGE_MARGIN + 3,
      y + 5.5,
    );
    y += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60);
    for (const item of compliant.sort((a, b) => a.item_order - b.item_order)) {
      y = ensureSpace(doc, 9, y);
      const lines = doc.splitTextToSize(`•  ${item.item_text}`, CONTENT_WIDTH - 4);
      doc.text(lines, PAGE_MARGIN + 2, y);
      y += lines.length * 4.3 + 1.5;

      if (item.notes.trim()) {
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(100);
        const noteLines = doc.splitTextToSize(item.notes.trim(), CONTENT_WIDTH - 12);
        doc.text(noteLines, PAGE_MARGIN + 8, y);
        y += noteLines.length * 3.6 + 1;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60);
      }
    }

    // Grouped photos for compliant items at the end of the section
    const compliantPhotos = compliant.flatMap((item) =>
      data.photos.filter((p) => p.item_score_id === item.id && p.data),
    );
    if (compliantPhotos.length > 0) {
      y += 2;
      const photoWidth = (CONTENT_WIDTH - 10) / 2;
      const photoHeight = photoWidth * 0.65;
      let col = 0;
      for (const photo of compliantPhotos) {
        y = ensureSpace(doc, photoHeight + 5, y);
        const x = PAGE_MARGIN + 3 + col * (photoWidth + 4);
        try {
          doc.addImage(photo.data, 'JPEG', x, y, photoWidth, photoHeight);
        } catch {
          // Skip photos that fail to render
        }
        col++;
        if (col >= 2) {
          col = 0;
          y += photoHeight + 3;
        }
      }
      if (col > 0) y += photoHeight + 3;
    }
    hasPriorSection = true;
  }

  if (!hasPriorSection) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(120);
    doc.text('No items have been rated in this zone yet.', PAGE_MARGIN, y);
    y += 8;
  }

  return y;
}

function renderZoneDetails(doc: jsPDF, data: PDFData, toc: TocEntry[]): void {
  const pt = data.assessment.property_type;
  const school = isSchoolType(pt);
  for (const zone of data.zones) {
    doc.addPage();
    // Record this zone's start page for the table of contents.
    toc.push({ label: `${zone.order}. ${zone.name}`, page: doc.getNumberOfPages(), level: 1 });
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

    // Schools render a Yes/No/UTO body instead of the 1-5 buckets.
    if (school) {
      renderSchoolZoneBody(doc, data, zone, y);
      continue;
    }

    // Categorize scored items for this zone
    const zoneItems = data.itemScores.filter((s) => s.zone_key === zone.key);
    const concerns = zoneItems.filter(
      (s) => typeof s.score === 'number' && !s.is_na && s.score <= 2,
    );
    const improvements = zoneItems.filter(
      (s) => s.score === 3 && !s.is_na,
    );
    const strengths = zoneItems.filter(
      (s) => typeof s.score === 'number' && !s.is_na && s.score >= 4,
    );
    const naItems = zoneItems.filter((s) => s.is_na);

    let hasPriorSection = false;

    // --- Areas Requiring Attention (scores 1-2) with CPTED guidance ---
    if (concerns.length > 0) {
      y = ensureSpace(doc, 25, y);
      doc.setFillColor('#FEF2F2');
      doc.rect(PAGE_MARGIN, y, CONTENT_WIDTH, 8, 'F');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor('#991B1B');
      doc.text('Areas Requiring Attention', PAGE_MARGIN + 3, y + 5.5);
      y += 12;

      const sortedConcerns = [...concerns].sort(
        (a, b) => (a.score as number) - (b.score as number),
      );

      for (const item of sortedConcerns) {
        y = renderFindingCard(
          doc,
          data,
          item,
          y,
          getScoreLabel(item.score as number),
          getScoreColorHex(item.score as number),
        );
      }

      hasPriorSection = true;
    }

    // --- Opportunities for Enhancement (score 3, only if assessor added notes) ---
    const improvementsWithNotes = improvements.filter((s) => s.notes.trim());
    if (improvementsWithNotes.length > 0) {
      // Divider between sections
      if (hasPriorSection) {
        doc.setDrawColor(LIGHT_BLUE);
        doc.setLineWidth(0.3);
        doc.line(PAGE_MARGIN + 5, y, PAGE_WIDTH - PAGE_MARGIN - 5, y);
        y += 6;
      }

      y = ensureSpace(doc, 20, y);

      // Section header
      doc.setFillColor('#FEFCE8');
      doc.rect(PAGE_MARGIN, y, CONTENT_WIDTH, 8, 'F');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor('#854D0E');
      doc.text('Opportunities for Enhancement', PAGE_MARGIN + 3, y + 5.5);
      y += 10;

      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(80);
      doc.text(
        'The following items meet basic standards but could be improved:',
        PAGE_MARGIN + 2,
        y,
      );
      y += 5;

      for (const item of improvementsWithNotes) {
        y = ensureSpace(doc, 14, y);

        // Item text
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(50);
        const itemLines = doc.splitTextToSize(`\u2022  ${item.item_text}`, CONTENT_WIDTH - 4);
        doc.text(itemLines, PAGE_MARGIN + 2, y);
        y += itemLines.length * 3.5 + 1;

        // Assessor note
        if (item.notes.trim()) {
          doc.setFontSize(7);
          doc.setFont('helvetica', 'italic');
          doc.setTextColor('#854D0E');
          const noteLines = doc.splitTextToSize(`Note: ${item.notes.trim()}`, CONTENT_WIDTH - 12);
          doc.text(noteLines, PAGE_MARGIN + 6, y);
          y += noteLines.length * 3 + 2;
        }

        // Inline photos for this item
        y = renderItemPhotos(doc, item, data, y);

        y += 2;
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
      const strengthsIntro = isSchoolType(pt)
        ? 'This school demonstrates strong security practices in these areas:'
        : isCommercialType(pt)
          ? 'This facility demonstrates strong security practices in these areas:'
          : isWorshipType(pt)
            ? 'Your facility demonstrates strong security practices in these areas:'
            : 'Your property demonstrates strong security practices in these areas:';
      doc.text(strengthsIntro, PAGE_MARGIN + 2, y);
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

      // Grouped photos for all positive items at the end of the section
      const strengthPhotos = strengths.flatMap((item) =>
        data.photos.filter((p) => p.item_score_id === item.id && p.data),
      );
      if (strengthPhotos.length > 0) {
        y += 2;
        const photoWidth = (CONTENT_WIDTH - 10) / 2;
        const photoHeight = photoWidth * 0.65;
        let col = 0;

        for (const photo of strengthPhotos) {
          y = ensureSpace(doc, photoHeight + 5, y);
          const x = PAGE_MARGIN + 3 + col * (photoWidth + 4);
          try {
            doc.addImage(photo.data, 'JPEG', x, y, photoWidth, photoHeight);
          } catch {
            // Skip photos that fail to render
          }
          col++;
          if (col >= 2) {
            col = 0;
            y += photoHeight + 3;
          }
        }
        if (col > 0) {
          y += photoHeight + 3;
        }
      }
    }

    // Summary line if nothing notable
    if (concerns.length === 0 && improvements.length === 0 && strengths.length === 0) {
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
        `${naItems.length} item${naItems.length === 1 ? '' : 's'} marked as not applicable to this ${isSchoolType(pt) ? 'school' : isCommercialType(pt) ? 'facility' : isWorshipType(pt) ? 'facility' : 'property'}.`,
        PAGE_MARGIN,
        y,
      );
      y += 6;
    }
  }
}

function renderRecommendations(doc: jsPDF, data: PDFData): void {
  const school = isSchoolType(data.assessment.property_type);
  doc.addPage();
  let y = 20;

  // Header
  doc.setFillColor(NAVY);
  doc.rect(PAGE_MARGIN, y, CONTENT_WIDTH, 12, 'F');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(WHITE);
  doc.text('Recommendations', PAGE_MARGIN + 4, y + 8);
  y += 20;

  // Non-schools keep the "Top Recommendations" sub-heading; schools list them
  // directly under the header (the header already reads "Recommendations").
  if (!school) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(NAVY);
    doc.text('Top Recommendations', PAGE_MARGIN, y);
    y += 7;
  }

  const recs = data.assessment.top_recommendations || [];
  if (recs.length === 0) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(150);
    doc.text('No recommendations have been added for this assessment.', PAGE_MARGIN, y);
    y += 10;
  } else {
    for (let i = 0; i < recs.length; i++) {
      const rec = recs[i];
      // Pre-calculate height for ensureSpace
      doc.setFontSize(9);
      const preCalcLines = doc.splitTextToSize(rec.description, CONTENT_WIDTH - 12);
      const itemHeight = 8 + preCalcLines.length * 4 + 4;
      y = ensureSpace(doc, itemHeight, y);
      const actualHeight = renderRecommendationItem(doc, rec, i + 1, y, school);
      y += actualHeight;
    }
  }

  // Quick Wins — not used for school (Yes/No/UTO) assessments
  if (!isSchoolType(data.assessment.property_type)) {
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
        // Pre-calculate height for ensureSpace
        doc.setFontSize(9);
        const preCalcLines = doc.splitTextToSize(item.description, CONTENT_WIDTH - 30);
        const itemHeight = preCalcLines.length * 4 + 6;
        y = ensureSpace(doc, itemHeight, y);
        const actualHeight = renderQuickWinItem(doc, item, y);
        y += actualHeight;
      }
    }
  }

}

function renderRecommendationItem(
  doc: jsPDF,
  rec: Recommendation,
  num: number,
  y: number,
  school = false,
): number {
  // Number circle
  doc.setFillColor(NAVY);
  doc.circle(PAGE_MARGIN + 4, y + 2, 3.5, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(WHITE);
  doc.text(String(num), PAGE_MARGIN + 4, y + 3, { align: 'center' });

  // Priority badge. Schools: only the high-priority items are badged ("HIGH
  // PRIORITY") — the rest carry no badge, since being listed already means it's a
  // priority. Other report types keep the High/Medium/Low colored badge.
  const showBadge = !school || rec.priority === 'high';
  if (showBadge) {
    let label: string;
    let badgeColor: string;
    if (school) {
      label = 'HIGH PRIORITY';
      badgeColor = '#DC2626';
    } else {
      const priorityColors: Record<string, string> = {
        high: '#DC2626',
        medium: '#CA8A04',
        low: '#16A34A',
      };
      badgeColor = priorityColors[rec.priority] || '#6B7280';
      label = rec.priority.toUpperCase();
    }
    const badgeX = PAGE_MARGIN + 12;
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    const badgeW = Math.max(16, doc.getTextWidth(label) + 5);
    doc.setFillColor(badgeColor);
    doc.roundedRect(badgeX, y - 2, badgeW, 6, 1, 1, 'F');
    doc.setTextColor(WHITE);
    doc.text(label, badgeX + badgeW / 2, y + 2, { align: 'center' });
  }

  // Description
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50);
  const descLines = doc.splitTextToSize(rec.description, CONTENT_WIDTH - 12);
  doc.text(descLines, PAGE_MARGIN + 12, y + 8);

  // Return total height: 8 (top padding to text start) + text lines + 4 bottom padding
  return 8 + descLines.length * 4 + 4;
}

function renderQuickWinItem(doc: jsPDF, item: Recommendation, y: number): number {
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

  // Return total height: text lines + padding
  return descLines.length * 4 + 4;
}

const LIABILITY_WAIVER = `This CPTED assessment is provided solely for informational and preventative purposes. The observations and recommendations included in this report are offered as voluntary guidance and do not constitute mandated safety requirements, building code standards, or legal directives. The implementation of any recommendations is entirely at the discretion of the property owner and should be undertaken only with appropriate professional consultation when necessary. The Volusia Sheriff's Office, its employees, agents, and representatives make no warranties, guarantees, or assurances regarding the effectiveness of any recommended security measures. Crime prevention strategies reduce risk but cannot completely eliminate the possibility of criminal activity. By accepting this report, the property owner acknowledges that the Volusia Sheriff's Office shall not be held liable for any actions taken or not taken based on the information provided, nor for any damages, losses, or incidents that may occur on or near the property following this assessment.`;

// Verbatim Confidentiality-of-Report section from the Volusia school CPTED
// survey — cites the Florida public-records security-system exemption. Rendered
// on the same page as the liability waiver for school reports.
const CONFIDENTIALITY_TEXT = `Security systems; records and meetings exempt from public access or disclosure.—Information relating to the security systems for any property owned by or leased to the state or any of its political subdivisions, and information relating to the security systems for any privately owned or leased property which is in the possession of any agency including all records, information, photographs, audio and visual presentations, schematic diagrams, surveys, recommendations, or consultations or portions thereof relating directly to or revealing such systems or information, and all meetings relating directly to or that would reveal such systems or information may be confidential and exempt from public access or disclosure. Please review local statutes to insure confidentiality.`;

function renderLiabilityWaiver(doc: jsPDF, data: PDFData): void {
  doc.addPage();
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
  y += waiverLines.length * 5;

  // Confidentiality of Report — folded onto this same page for school reports.
  if (isSchoolType(data.assessment.property_type)) {
    y += 10;
    doc.setFillColor(NAVY);
    doc.rect(PAGE_MARGIN, y, CONTENT_WIDTH, 9, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(WHITE);
    doc.text('Confidentiality of Report', PAGE_MARGIN + 4, y + 6);
    y += 13;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50);
    const confLines = doc.splitTextToSize(CONFIDENTIALITY_TEXT, CONTENT_WIDTH);
    doc.text(confLines, PAGE_MARGIN, y);
    y += confLines.length * 4;
  }

  y += 20;

  // Assessor signature section
  const lineWidth = 70;
  const leftSig = PAGE_MARGIN;
  const rightSig = PAGE_WIDTH / 2 + 10;

  doc.setDrawColor(NAVY);
  doc.setLineWidth(0.3);

  // Render signature image above the line
  const sig = data.assessment.assessor_signature;
  if (sig) {
    try {
      doc.addImage(sig, 'PNG', leftSig, y - 18, 55, 15);
    } catch {
      // Skip if signature image fails
    }
  }

  // Date value above the line
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50);
  doc.text(formatDate(data.assessment.date_of_assessment), rightSig, y - 3);

  // Signature and date lines
  doc.line(leftSig, y, leftSig + lineWidth, y);
  doc.line(rightSig, y, rightSig + lineWidth, y);

  // Labels below the lines
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(NAVY);
  doc.text('Assessor Signature', leftSig, y + 5);
  doc.text('Date Prepared', rightSig, y + 5);

  // Assessor info below label — name, badge, and CPTED designation (moved here
  // from the cover so "prepared by / date" all live with the signature).
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text(data.assessment.assessor_name, leftSig, y + 10);
  let infoY = y + 14;
  if (data.assessment.assessor_badge_id) {
    doc.text(`Badge: ${data.assessment.assessor_badge_id}`, leftSig, infoY);
    infoY += 4;
  }
  doc.setFontSize(7);
  doc.setTextColor(120);
  doc.text("Florida Attorney General's Office — CPTED Practitioner", leftSig, infoY);

}

// --- Table of contents ---
interface TocEntry {
  label: string;
  page: number;
  level: number; // 0 = top-level section, 1 = sub-item (zone)
}

// Fills the reserved TOC page (drawn last, once every section's page is known).
function renderTableOfContents(
  doc: jsPDF,
  tocPage: number,
  entries: TocEntry[],
): void {
  doc.setPage(tocPage);
  let y = 20;

  // Header bar
  doc.setFillColor(NAVY);
  doc.rect(PAGE_MARGIN, y, CONTENT_WIDTH, 12, 'F');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(WHITE);
  doc.text('Table of Contents', PAGE_MARGIN + 4, y + 8);
  y += 22;

  for (const entry of entries) {
    const indent = entry.level === 0 ? 0 : 6;
    const labelX = PAGE_MARGIN + indent;
    // entry.page is the jsPDF page index; displayed numbering starts at 1 on the
    // TOC, matching the footers (page index - FRONT_MATTER_PAGES).
    const pageStr = String(entry.page - FRONT_MATTER_PAGES);

    doc.setFontSize(entry.level === 0 ? 11 : 9.5);
    doc.setFont('helvetica', entry.level === 0 ? 'bold' : 'normal');
    doc.setTextColor(entry.level === 0 ? NAVY : '#374151');

    doc.text(entry.label, labelX, y);
    doc.text(pageStr, PAGE_WIDTH - PAGE_MARGIN, y, { align: 'right' });

    // Dotted leader between label and page number
    const labelW = doc.getTextWidth(entry.label);
    const pageW = doc.getTextWidth(pageStr);
    const dotsStart = labelX + labelW + 2;
    const dotsEnd = PAGE_WIDTH - PAGE_MARGIN - pageW - 2;
    if (dotsEnd > dotsStart) {
      doc.setDrawColor(180);
      doc.setLineWidth(0.2);
      doc.setLineDashPattern([0.4, 1], 0);
      doc.line(dotsStart, y - 0.8, dotsEnd, y - 0.8);
      doc.setLineDashPattern([], 0);
    }

    y += entry.level === 0 ? 8 : 6;
  }
}

// --- Main export ---
export async function generatePDF(assessmentId: string): Promise<void> {
  const data = await gatherAssessmentData(assessmentId);

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pt = data.assessment.property_type;
  const toc: TocEntry[] = [];

  // Front matter: page 1 cover, page 2 CPTED intro (both unnumbered). Page 3 is
  // reserved for the table of contents — drawn last, once every section's start
  // page is known (jsPDF keeps all pages in memory, so we setPage() back to it).
  // Reserving it up front means all content page numbers already account for it.
  renderCoverPage(doc, data);
  renderCptedIntro(doc);
  doc.addPage();
  const tocPage = doc.getNumberOfPages();

  toc.push({ label: 'Assessment Summary', page: doc.getNumberOfPages() + 1, level: 0 });
  renderSummaryPage(doc, data);

  renderZoneDetails(doc, data, toc); // pushes one entry per zone

  toc.push({ label: 'Recommendations', page: doc.getNumberOfPages() + 1, level: 0 });
  renderRecommendations(doc, data);

  // Liability waiver + signature, with the Confidentiality of Report section
  // folded onto the same page for schools.
  const waiverPage = doc.getNumberOfPages() + 1;
  toc.push({ label: 'Liability Waiver & Acknowledgment', page: waiverPage, level: 0 });
  if (isSchoolType(pt)) {
    toc.push({ label: 'Confidentiality of Report', page: waiverPage, level: 1 });
  }
  renderLiabilityWaiver(doc, data);

  // Fill the reserved TOC page now that all page numbers are settled.
  renderTableOfContents(doc, tocPage, toc);

  // Stamp footers + the red CONFIDENTIAL header on every page in one final pass.
  // Doing it here (rather than per-section) guarantees every page is covered
  // exactly once — multi-page sections and autoTable overflow no longer slip
  // through. The cover (page 1) is skipped by both helpers' guards.
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addPageFooter(doc, i);
    addConfidentialHeader(doc, i);
  }

  // Trigger download
  doc.save(generateFilename(data.assessment));
}
