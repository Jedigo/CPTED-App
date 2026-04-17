# CPTED Assessor — Project Reference

## What This Project Is

A **Progressive Web App (PWA)** for conducting CPTED (Crime Prevention Through Environmental Design) residential site assessments on iPad. Replaces clipboard + camera + notebook with a guided digital walkthrough that scores checklist items, captures photos, and generates professional PDF reports.

**Built for:** Volusia Sheriff's Office field assessors
**Primary device:** iPad (Safari / home screen PWA)
**Must work fully offline** — all data stored locally in IndexedDB

## Phases

- **Phase 1 (MVP — current):** Frontend-only PWA with offline storage and client-side PDF export. No server required.
- **Phase 2 (Future):** Node.js + Express API, PostgreSQL, Docker on Proxmox home server, Nginx reverse proxy, server-side PDF via Puppeteer.

## Tech Stack (Phase 1)

- **React 18+** with **TypeScript** (strict)
- **Vite** for build tooling
- **Tailwind CSS** — mobile-first, iPad-optimized
- **Dexie.js** — IndexedDB wrapper for offline data persistence
- **Workbox** — Service Worker for offline app shell caching
- **jsPDF + html2canvas** OR **@react-pdf/renderer** — client-side PDF generation
- **PWA manifest** — home screen install, splash screen, icons

## Project Structure

```
cpted-assessor/
├── public/
│   ├── manifest.json
│   ├── sw.js
│   ├── icons/
│   └── index.html
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── data/
│   │   ├── zones.ts              # Residential zone/checklist definitions (7 zones, 63 items)
│   │   ├── townhome-zones.ts     # Townhome zone/checklist definitions (7 zones, ~67 items)
│   │   ├── worship-zones.ts      # Catholic worship zone/checklist definitions (8 zones, 70 items)
│   │   ├── christian-zones.ts    # Christian church zone/checklist definitions (8 zones, 84 items)
│   │   ├── item-guidance.ts      # Residential CPTED guidance per item
│   │   ├── townhome-item-guidance.ts # Townhome CPTED guidance — inherits from ITEM_GUIDANCE + overrides for new items
│   │   ├── worship-item-guidance.ts # Catholic worship CPTED guidance per item
│   │   ├── christian-item-guidance.ts # Christian church CPTED guidance per item
│   │   ├── item-phases.ts        # Exterior/interior phase classification — INTERIOR_ITEMS set + getItemPhase()
│   │   └── zone-registry.ts      # getZonesForType() / getItemGuidanceForType() / isWorshipType() / isResidentialType() dispatcher
│   ├── db/
│   │   └── database.ts           # Dexie.js setup and schema
│   ├── types/
│   │   └── index.ts              # TypeScript interfaces
│   ├── pages/
│   │   ├── Home.tsx              # Assessment list
│   │   ├── NewAssessment.tsx     # Assessment info form
│   │   ├── Assessment.tsx        # Zone navigator (main working screen)
│   │   └── Summary.tsx           # Overall summary + report generation
│   ├── contexts/
│   │   └── ThemeContext.tsx       # Dark mode context + provider + useTheme hook
│   ├── components/
│   │   ├── ThemeToggle.tsx        # Sun/moon dark mode toggle button
│   │   ├── ItemPickerModal.tsx   # Pick scored items as recommendations/quick wins
│   │   ├── DuplicateResultDialog.tsx # Post-duplication summary (scores carried, photos re-homed)
│   │   ├── PhotoMoveModal.tsx    # Re-assign a photo to any item in the assessment
│   │   ├── ZoneSidebar.tsx       # Zone nav with completion indicators (phase-aware)
│   │   ├── ZoneView.tsx          # Active zone display (phase-filtered; empty state)
│   │   ├── PrincipleSection.tsx  # Collapsible principle with items
│   │   ├── ChecklistItem.tsx     # Single item: score buttons + photo + notes
│   │   ├── ScoreButtons.tsx      # [1][2][3][4][5][N/A] tap targets
│   │   ├── PhotoCapture.tsx      # Camera integration
│   │   ├── PhotoThumbnail.tsx    # Inline photo display
│   │   ├── PhotoViewer.tsx       # Full-screen photo viewer with Move/Delete actions
│   │   └── ZoneSummary.tsx       # Per-zone score summary box
│   ├── services/
│   │   ├── scoring.ts            # Score calculation logic (getScoreColor, getScoreBgColor)
│   │   ├── pdf.ts                # PDF report generation
│   │   ├── duplicate.ts          # Duplicate assessment across same or different property types
│   │   └── photos.ts            # Photo capture, compression, storage, movePhoto()
│   └── styles/
│       └── globals.css           # Tailwind imports + custom styles
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Design System

### Colors
- **Navy (primary):** `#1B3A5C`
- **Medium Blue:** `#4A7FB5`
- **Light Blue:** `#D6E8F5`

### UI Rules
- iPad-optimized — design primarily for **landscape**, support portrait
- **Large touch targets** — minimum 44px tap areas
- Score buttons must be prominent and easy to hit in the field
- Minimal typing — tap-based scoring, optional text notes, photo capture via device camera
- Dark navy + light blue color scheme matching report branding

### Screen Flow
```
Home Screen (Assessment List)
  → [+ New Assessment] → Assessment Info Form
  → [Existing Assessment] → Zone Navigator

Assessment Info Form
  → [Start Assessment] → Zone Navigator

Zone Navigator (main working screen)
  ├── Zone sidebar/tabs (1-7) with completion indicators
  ├── Active zone: description, principle sections (collapsible)
  │   ├── Item text + Score buttons [1][2][3][4][5][N/A]
  │   ├── [Photo] button → camera capture
  │   ├── [Note] button → text input
  │   └── Photo thumbnails
  ├── Zone Summary box (auto-calculated)
  └── [← Previous Zone] [Next Zone →]

Assessment Summary Screen
  ├── Score table by zone
  ├── Top 5 Recommendations (text + priority + timeline)
  ├── Quick Wins list
  ├── Liability waiver (pre-filled, read-only)
  ├── [Generate PDF Report]
  └── [Mark Complete]
```

## Data Model

All IDs use **UUIDs**. IndexedDB structure mirrors future PostgreSQL schema.

### Key Tables / Object Stores
- **assessments** — property info, assessor info, conditions, overall score, recommendations (JSON), status
- **zone_scores** — per-zone averages, priority findings, completion status
- **item_scores** — individual checklist item scores (1-5 or N/A), notes, photo references
- **photos** — blob storage, GPS coordinates, timestamps, zone/item associations
- **recommendations** — embedded as JSON in assessments for Phase 1

### Dexie.js Schema
```javascript
const db = new Dexie('CPTEDAssessments');
db.version(1).stores({
  assessments: 'id, status, created_at, address',
  zone_scores: 'id, assessment_id, zone_key',
  item_scores: 'id, assessment_id, [zone_key+principle]',
  photos: 'id, assessment_id, item_score_id, zone_key',
});
```

## Assessment Zones (7 total, 63 checklist items)

| # | Zone Key | Zone Name | Principles |
|---|----------|-----------|------------|
| 1 | `street_approach` | Street Approach & Address Visibility | Natural Surveillance, Access Control, Territorial Reinforcement, Maintenance & Image |
| 2 | `front_yard` | Front Yard & Primary Entry | Natural Surveillance, Access Control, Territorial Reinforcement, Maintenance & Image |
| 3 | `side_yards` | Side Yards & Pathways | Natural Surveillance, Access Control, Territorial Reinforcement, Maintenance & Image |
| 4 | `rear_yard` | Rear Yard & Back Entry | Natural Surveillance, Access Control, Territorial Reinforcement, Maintenance & Image |
| 5 | `garage_driveway` | Garage & Driveway | Natural Surveillance, Access Control, Territorial Reinforcement, Maintenance & Image |
| 6 | `exterior_lighting` | Exterior Lighting | Lighting Coverage, Maintenance & Image |
| 7 | `windows_interior` | Windows & Interior Considerations | Natural Surveillance, Access Control, Security Systems & Technology, Behavioral & Routine Considerations |

The full checklist item text lives in `src/data/zones.ts`. Trimmed from 141 to 63 items in v0.8.0 to match typical PD assessment length (30-75 items).

## Scoring System

| Score | Label | Description |
|-------|-------|-------------|
| 1 | Critical | Immediate action required — significant vulnerability |
| 2 | Deficient | Notable concern — should be addressed promptly |
| 3 | Adequate | Meets basic standard but could be improved |
| 4 | Good | Above average — minor improvements possible |
| 5 | Excellent | Best practice standard met |
| N/A | Not Applicable | Item does not apply to this property |

### Calculation Rules
- **Scoring uses 1-5 only. There is no zero score.**
- **N/A items are excluded from ALL score calculations**
- **Principle score** = average of scored items within that principle for a zone
- **Zone score** = average of all scored items within the zone
- **Overall score** = average of all zone scores (equal weight, not weighted)

## Critical Rules

1. `zones.ts`, `townhome-zones.ts`, `worship-zones.ts`, `christian-zones.ts` are the **source of truth** for checklist content; resolve via `zone-registry.ts`
2. Scoring is **1-5** (not 0-5) — no zero score exists
3. **N/A items excluded** from all score calculations
4. Photos stored as **base64 data URL strings** in IndexedDB (NOT Blobs — Safari detaches Blob data from IndexedDB, making it unreadable)
5. PDF must include the **liability waiver verbatim** (see project plan)
6. PWA manifest app name: **"CPTED Assessor"**
7. `property_type` supports `single_family_residential`, `townhome`, `places_of_worship`, and `christian_church` — add new types via zone registry; use `isWorshipType()` helper for worship/church logic and `isResidentialType()` for residential-style logic
8. Timestamps: **local time for display**, stored as **ISO 8601 UTC** internally
9. Photo capture should auto-grab **GPS coordinates and timestamp** from device
10. **Version bumps are required** on every commit that changes app functionality. Bump the semver version in both `cpted-assessor/package.json` and the version display in `cpted-assessor/src/pages/Home.tsx`. Use patch for fixes, minor for features, major for breaking changes.
11. **Townhome item text mirrors residential verbatim** where the CPTED concept is identical — this is what makes `duplicate.ts` carry scores and photos cleanly on type conversion. Only genuinely new items (Shared Boundaries zone, peephole, HOA-specific items) diverge.

## Liability Waiver (Verbatim — Do Not Modify)

```
This CPTED assessment is provided solely for informational and preventative purposes.
The observations and recommendations included in this report are offered as voluntary
guidance and do not constitute mandated safety requirements, building code standards,
or legal directives. The implementation of any recommendations is entirely at the
discretion of the property owner and should be undertaken only with appropriate
professional consultation when necessary. The Volusia Sheriff's Office, its employees,
agents, and representatives make no warranties, guarantees, or assurances regarding
the effectiveness of any recommended security measures. Crime prevention strategies
reduce risk but cannot completely eliminate the possibility of criminal activity. By
accepting this report, the property owner acknowledges that the Volusia Sheriff's
Office shall not be held liable for any actions taken or not taken based on the
information provided, nor for any damages, losses, or incidents that may occur on or
near the property following this assessment.
```

## MVP Build Order

1. Project scaffolding — Vite + React + TypeScript + Tailwind + PWA manifest
2. Zone data file — port all 141 checklist items into `zones.ts`
3. Database setup — Dexie.js with all object stores
4. Assessment info form — create new assessment with property details
5. Zone navigator + checklist UI — main working screen with score buttons
6. Photo capture — camera integration with IndexedDB blob storage
7. Score calculations — auto-calculate zone and overall scores
8. Assessment summary screen — recommendations, quick wins
9. PDF report generation — client-side PDF matching the docx format
10. Service Worker — offline caching for full offline support
11. Home screen — assessment list with status indicators
12. Polish — iPad-optimize touch targets, test in Safari, PWA install flow

## Commands

```bash
# Development
npm run dev           # Start Vite dev server
npm run build         # Production build
npm run preview       # Preview production build
npm run lint          # Run linter
npm run type-check    # TypeScript type checking
```

## Reference Files

- `files(1)/CPTED_App_Project_Plan.md` — Full project plan with complete zone data, API endpoints, Docker config
- `files(1)/CPTED_Residential_Assessment_Checklist.docx` — Original checklist document (PDF report must match this format)

## Future Features (Planned)

### Auto-Recommend CPTED Fencing
When rear yard (Zone 4) items related to fencing, visibility, or access control are scored N/A, 1, or 2, the report should automatically recommend a CPTED-approved fence style. Should account for HOA restrictions if noted by the assessor. Fence recommendations should include style guidance (e.g., semi-open designs that balance privacy with natural surveillance).

### Auto-Explain Deficient Findings in Report
For any checklist item scored 1 (Critical) or 2 (Deficient), the PDF report should automatically include:
- **What the standard is** — the CPTED best practice for that item
- **What can be done to improve it** — specific, actionable steps the homeowner can take

This requires building a knowledge base mapping each of the 64 checklist items to its corresponding standard explanation and improvement recommendations — essentially a mini CPTED reference guide embedded in the app.

## Current Status

**v0.18.1 deployed.** Townhome property type (7 zones, ~67 items) + generic `Duplicate` button that carries scores and photos across a residential↔townhome conversion via item-text match and zone remap. Photo move feature (re-assign any photo to any item). Exterior/Interior walkthrough phase filter in the Assessment screen (persisted in localStorage). Summary zone rows use colored badge pills instead of row tints. Redeploy with `./deploy.sh`.

**Remaining items / To-Do:**
- Update server-side zone data + PDF for townhome, worship, and Christian church assessments (server still residential-only)
- Voice notes feature (planned)
- Server-side report storage (planned)
- Photo annotation — draw arrows/circles on captured photos to highlight issues
- Replace PWA icon SVG placeholders with proper PNGs
- Fix dark mode for disabled/N/A states (bg-gray-50 not dark-aware)
- Review phase classifications for worship/church items as field usage reveals mis-tags

Git repo initialized. Remote: `https://github.com/Jedigo/CPTED-App.git` (branch: `main`)

## Session Log

### 2026-02-26 — Places of Worship Assessment Type
- Added `places_of_worship` PropertyType with 8 zones (70 checklist items) including Catholic-specific items (sacristy, tabernacle, altar/chancel)
- Created zone registry architecture: `zone-registry.ts` dispatches zones and item guidance by property type
- New files: `worship-zones.ts`, `worship-item-guidance.ts`, `zone-registry.ts`
- Modified 9 files: types, NewAssessment (property type dropdown + dynamic labels), Assessment, ZoneSidebar (zones prop), Summary, recommendations (propertyType param, fence skip for non-residential), pdf (dynamic titles/footer/labels/descriptions), Home (property type badge)
- Added `contact_phone` field to Assessment type, form, and PDF
- Fixed race condition: worship assessments stuck on loading spinner because zones defaulted to residential before assessment loaded
- Version: 0.12.0

### 2026-02-26 — Item Picker for Manual Recommendations/Quick Wins
- Added "Pick from Items" button to RecommendationEditor — opens modal showing all scored checklist items grouped by zone
- Created `ItemPickerModal.tsx` with score badges, duplicate detection ("Added" badge), slot limit enforcement, collapsible zones
- Exported `ScoredItemContext`, `getItemContext`, `buildDescription`, `getPriority` from `recommendations.ts` for reuse
- Modified `RecommendationEditor.tsx` (new props: `itemScores`, `propertyType`) and `Summary.tsx` (passes props through)
- Version: 0.14.0

### 2026-03-30 — Christian Church Assessment Type + Score Readability Fix
- Added `christian_church` PropertyType with 8 zones, 84 items — sourced from CISA, Sheepdog Church Security, Tri-Rivers Baptist, Church Production Magazine
- Key differences from Catholic: stage/platform, sound booth/AV, baptistry, gymnasium, cafe/bookstore, youth ministry wing
- Created `isWorshipType()` helper to share form/PDF logic between both worship types; renamed Catholic label to "Places of Worship (Catholic)"
- Fixed Summary page score readability: separated `getScoreRowBgColor` (subtle 50% opacity tints for table rows) from `getScoreBgColor` (100-level tints for badge pills); added brighter dark-mode score text colors in globals.css
- Version: 0.15.1

### 2026-04-17 — Townhome Type + Duplicate/Move Photos + Walkthrough Phase Filter
- Added `townhome` PropertyType with 7 zones, ~67 items. New "Shared Boundaries" zone replaces Side Yards for attached housing (shared walls, breezeways, HOA utilities). Townhome item text mirrors residential verbatim where CPTED concept is identical so duplicate carries state cleanly. New files: `townhome-zones.ts`, `townhome-item-guidance.ts`; added `isResidentialType()` helper.
- Built `services/duplicate.ts` — clones an assessment with new UUIDs, matches items by `zone_key+principle+item_text` with a residential↔townhome zone remap. Unmatched photos fall back to the first item in the mapped target zone (no photo loss). `DuplicateResultDialog.tsx` shows stats + re-homed photos list. Generic "Duplicate" button on Home (originally "Duplicate as Townhome", widened for re-assessment/fix use cases).
- Added `PhotoMoveModal.tsx` + `movePhoto()` service. "Move to…" button in PhotoViewer re-assigns any photo to any item in the assessment — the correct fix for photos that landed in a fallback zone after duplication.
- Added exterior/interior walkthrough phase filter. `item-phases.ts` classifies each item text via an `INTERIOR_ITEMS` Set + `getItemPhase()` helper. Three-way toggle in the Assessment main area drives `ZoneView` item visibility and `ZoneSidebar` completion dots. Persisted in `localStorage('cpted-phase-filter')`.
- Replaced Summary zone-row tint with a colored badge pill for the Avg Score cell; removed unused `getScoreRowBgColor` from `scoring.ts`.
- Versions shipped: 0.16.0, 0.16.1, 0.16.2, 0.17.0, 0.18.0, 0.18.1
