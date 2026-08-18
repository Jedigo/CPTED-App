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
│   │   ├── school-zones.ts       # School zone/checklist (10 zones) — single template with band tags, exports ELEMENTARY/MIDDLE/HIGH/COMBINED
│   │   ├── item-guidance.ts      # Residential CPTED guidance per item
│   │   ├── townhome-item-guidance.ts # Townhome CPTED guidance — inherits from ITEM_GUIDANCE + overrides for new items
│   │   ├── worship-item-guidance.ts # Catholic worship CPTED guidance per item
│   │   ├── christian-item-guidance.ts # Christian church CPTED guidance per item
│   │   ├── school-item-guidance.ts # School CPTED guidance — shared across all 4 school types
│   │   ├── item-phases.ts        # Exterior/interior phase classification — INTERIOR_ITEMS set + getItemPhase()
│   │   └── zone-registry.ts      # getZonesForType() / getItemGuidanceForType() / isWorshipType() / isResidentialType() / isSchoolType() dispatcher
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
│   │   ├── ScoreButtons.tsx      # [1][2][3][4][5][N/A] tap targets (non-school types)
│   │   ├── RatingButtons.tsx     # [Yes][No][UTO] tap targets (school types)
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

1. `zones.ts`, `townhome-zones.ts`, `worship-zones.ts`, `christian-zones.ts`, `school-zones.ts`, `commercial-office-zones.ts` are the **source of truth** for checklist content; resolve via `zone-registry.ts`
2. Scoring is **1-5** (not 0-5) — no zero score exists. **EXCEPTION: school property types use a Yes/No/UTO checklist rating** (`ItemScore.score = 'yes' | 'no' | 'uto'`), not numbers. Branch on `isSchoolType()`; numeric helpers guard with `typeof score === 'number'`. See the School Yes/No/UTO section in MEMORY.md.
3. **N/A items excluded** from all score calculations (schools use UTO instead of N/A — no separate N/A flag)
4. Photos stored as **base64 data URL strings** in IndexedDB (NOT Blobs — Safari detaches Blob data from IndexedDB, making it unreadable)
5. PDF must include the **liability waiver verbatim** (see project plan)
6. PWA manifest app name: **"CPTED Assessor"**
7. `property_type` supports `single_family_residential`, `townhome`, `places_of_worship`, `christian_church`, `elementary_school`, `middle_school`, `high_school`, `combined_school`, and `commercial_office` — add new types via zone registry; use `isWorshipType()`, `isResidentialType()`, `isSchoolType()`, and `isCommercialType()` helpers instead of enumerating cases
8. Timestamps: **local time for display**, stored as **ISO 8601 UTC** internally
9. Photo capture should auto-grab **GPS coordinates and timestamp** from device
10. **Version bumps are required** on every commit that changes app functionality. Bump the semver version in both `cpted-assessor/package.json` and the version display in `cpted-assessor/src/pages/Home.tsx`. Use patch for fixes, minor for features, major for breaking changes.
11. **Townhome item text mirrors residential verbatim** where the CPTED concept is identical — this is what makes `duplicate.ts` carry scores and photos cleanly on type conversion. Only genuinely new items (Shared Boundaries zone, peephole, HOA-specific items) diverge.

## Liability Waiver / Disclaimer (Verbatim — Do Not Modify)

Legal-advisor-approved replacement adopted 2026-07-07 (v0.29.1). Source of truth:
`CPTED Approve Disclaimer.docx` (repo root). Two paragraphs — the blank line is a
required paragraph break. Lives in `pdf.ts` and `Summary.tsx` as `LIABILITY_WAIVER`.

```
This CPTED assessment has been conducted by the Volusia Sheriff's Office according to
the protocols of the National Institute of Crime Prevention. The information contained
herein is based on guidelines set by the International Society of Crime Prevention
Practitioners, the Florida Crime Prevention Training Institute, and the observations of
the person conducting the survey. The assessment is intended to assist you in improving
the overall level of security only. It is not intended to imply that existing security
or CPTED measures are absolute or perfect. Any decisions based upon this assessment are
solely your responsibility. Accordingly, Volusia Sheriff's Office makes no guarantee and
accepts no liability for any security breaches or crimes after the completion and
submission of the assessment.

All new construction or retrofits should comply with existing building codes, zoning
laws, and fire codes. Prior to installation or modifications the proper licensing and
variances should be obtained and inspections should be conducted by the appropriate
agency.
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
- `files(1)/commercial_office_research_draft.md` — Original research draft for commercial-office property type (11 zones / 152 items). **Shipped as `commercial_office`** in v0.20.0, tuned in v0.22.0–v0.23.2 (now 156 items with grouped sidebar + verification hints). Kept for reference.

## Future Features (Planned)

### Auto-Recommend CPTED Fencing
When rear yard (Zone 4) items related to fencing, visibility, or access control are scored N/A, 1, or 2, the report should automatically recommend a CPTED-approved fence style. Should account for HOA restrictions if noted by the assessor. Fence recommendations should include style guidance (e.g., semi-open designs that balance privacy with natural surveillance).

### Auto-Explain Deficient Findings in Report
For any checklist item scored 1 (Critical) or 2 (Deficient), the PDF report should automatically include:
- **What the standard is** — the CPTED best practice for that item
- **What can be done to improve it** — specific, actionable steps the homeowner can take

This requires building a knowledge base mapping each of the 64 checklist items to its corresponding standard explanation and improvement recommendations — essentially a mini CPTED reference guide embedded in the app.

## Current Status

**`main` is at v0.31.0 — parking-lot light surveys for school assessments (committed 2026-08-18, NOT yet deployed).** The two items left open from the 2026-08-17 session are resolved: the three-corner entry is verified end to end, and the "KML download did nothing" was never a download failure — the files had downloaded all along, and no installed application could open a `.kml`. See the 2026-08-18 session log.

Earlier milestone, v0.29.1 (`d478da8`): the old liability waiver was replaced app-wide (PDF all types + on-screen Summary) with the **legal-advisor-approved disclaimer** — source of truth `CPTED Approve Disclaimer.docx` (repo root, committed) and the "Liability Waiver / Disclaimer" section below. Two paragraphs; render paths handle the break.

School assessments use a **Yes/No/UTO checklist rating** instead of the 1-5 scale (team trained on the National Institute of Crime Prevention school survey: `files(1)/CPTED SCHOOL EVAL.docx`). Schools-only, gated on `isSchoolType()`; all other property types keep 1-5 untouched. Plus a full **PDF report redesign** (applies to all types): formal centered cover (star badge + "Volusia Sheriff's Office" / "Domestic Security Unit" masthead + "Crime Prevention Through Environmental Design Report" + property name/address, navy top/bottom bands, vertically centered between bands, no footer), an "Understanding CPTED" intro page, a page-numbered Table of Contents (numbering starts at the TOC), a red "CONFIDENTIAL" header on every page, and a fixed footer "CPTED Report - Volusia Sheriff's Office". School reports: no aggregate score, recommendations driven by "No" items (uncapped, no auto-generate, single High-Priority toggle), Confidentiality-of-Report section folded onto the waiver page. New star badge logo at `public/logos/volusia_sheriff_badge_star.png`.

**Remaining items / To-Do:**
- **Light surveys:** deploy v0.31.0. Untested on an iPad in the field — GPS corner capture, the share-sheet KML hand-off, and the screenshot upload are all desktop-verified only. Server-side sync and multi-file (>99 reading) imports not built.
- **Remove the 20 out-of-scope items** from the CPTED scope audit (worship 2, christian 3, schools 3, commercial Z11 12) — team decision 2026-05-21, deferred. Full work order: `files(1)/cpted-scope-audit.md`. Then a separate guidance-prose cleanup pass.
- Update server-side zone data + PDF for townhome, worship, Christian church, school, and commercial-office assessments (server still residential-only)
- Voice notes feature (planned)
- Server-side report storage (planned)
- Photo annotation — draw arrows/circles on captured photos to highlight issues
- Replace PWA icon SVG placeholders with proper PNGs
- Fix dark mode for disabled/N/A states (bg-gray-50 not dark-aware)
- Review phase classifications for worship/church items as field usage reveals mis-tags

Git repo initialized. Remote: `https://github.com/Jedigo/CPTED-App.git` (branch: `main`)

## Session Log

### 2026-08-18 — Light Surveys: Google Earth Round Trip, Test Data, Flow Fixes (v0.31.0, COMMITTED)
- **Closed both items left open on 2026-08-17.**
  - **Three-corner entry verified** end to end with a desk-run suite: paste → `parseLatLng` → `deriveRectangle` → patch → grid options → `gridPointLatLng` back on the map. The load-bearing check is the round trip — grid points land back on the pasted corners within a foot, including the fourth corner nobody enters. 448 × 165 ft picks the expected 14×6 @ 35 ft.
  - **The KML download was never broken.** Both of the 2026-08-17 attempts were sitting in `~/Downloads` (10,434 bytes, downloaded twice — the second click because nothing appeared to happen). The failure was the last mile: **a browser cannot render KML**, so "open with Chrome" gives a blank tab or a silent re-download.
- **The whole failure class was the last mile, not the export** — it bit three times in a row: Chrome not rendering KML, then a *stale* Google Earth Web settings toggle ("Turn on KML file import", which existed during rollout and is now gone), then Ubuntu's "open with what?" chooser because nothing is registered for `.kml`. Current Earth Web flow is **New → Open local KML file → Map feature**. In-app help now states all of it, and the download hands over `application/octet-stream` so no handler negotiation happens — nothing opens the file locally, it gets *uploaded*.
- **`parseLatLng` widened** — was decimal-only, which silently rejected two formats a person actually pastes: the Google Maps place card / iOS share sheet DMS (`29°12'40.4"N 81°01'24.4"W`) and degree-symbol decimals (`29.0215° N, 81.0234° W`). Now also handles hemisphere letters (including longitude-first), non-breaking spaces, and the Unicode minus.
- **KML export rebuilt as a filled heat map.** Pins said "a reading happened here"; what the assessor needs is the *shape* of the dark region. One translucent cell per reading, sized to the ground that reading speaks for (midpoints to neighbours, clipped at the lot edge, so a short final row gets a narrow cell) — cells tile the lot exactly, no gaps (which read as phantom dark strips) or overlaps. Folders: *Light levels* / *Reading points* / *Lot boundary*. Legend lives in the document description, since an on-screen legend would need a ScreenOverlay image and therefore a KMZ.
- **Two export flavours, and this is what fixed the confusing order of operations:** the export served two jobs at once while sitting in step 2. Now **step 2 = planning copy** (every point numbered, points folder open, no readings and no `— no reading` noise on the labels — it is the map you use to decide what to mark obstructed) and **step 4 = readings copy** (coloured cells, only the 5 darkest labelled). Step 4 cannot appear before the import, so the ordering explains itself.
- **`downloadKml` is iOS-aware** — `<a download>` on a blob URL is unreliable in iOS Safari and does nothing in a standalone PWA, so iOS routes to the share sheet (`navigator.share` with a `File`, keeping the KML media type so Google Earth is offered), desktop keeps the anchor with `octet-stream`, `window.open` last. A cancelled share is a choice, not a failure — it does not fire a second delivery. **Precautionary: the iPad path was never the one that failed, and is still untested on a device.**
- **Aerial screenshot → PDF.** The app cannot fetch satellite tiles without an API key and billing, so the picture returns the way it left: export → Google Earth → screenshot → upload. New `LightSurvey.aerial_image` (base64 JPEG, 2600px — 1920px does not survive point numbers on a wide lot), rendered as an "Aerial View" section under the drawn Lot Map, aspect preserved, capped at 120mm so it cannot push the Darkest Points table off the page, page-break aware. UI tells the assessor to keep the Google attribution in frame. **Not indexed, so no Dexie migration** — older surveys read `undefined` and render nothing.
- **Step 4 no longer vanishes.** It was gated on `stats`, so a survey with no import showed no Results section and no PDF button, which reads as a removed feature (it was reported as exactly that). Step 4 and the header PDF button now render disabled with "waiting on the meter file".
- **Corner fields reordered** to Start → Short-side → Long-side, so the two adjacent captures happen together and the long side is walked once. Honest caveat recorded in the UI: total distance is close to a wash since the grid walk starts back at point 1, and **device GPS (15–30 ft) on a 150 ft short side is a 10–20% width error — the map route (~3 ft) is roughly ten times better.**
- **Test data generated** — `Light Survey Resources/TEST DATA - Main Lot 90pt.XLS`, a synthetic SDL400 manual-mode export for a 15×6 @ 30 ft grid, byte-shaped like a real one (bare-CR lines, `P<NUL> <NUL>n` positions, zero-padded values, `Ft cd   `). Values come from five poles with inverse-square falloff, giving the instructive verdict: **4.6 fc average (passes 3 fc) but 11.4:1 uniformity (fails 4:1)** — enough light, badly distributed. Verified to import to exactly the values the matching KML was drawn from, so the two views cannot disagree.
- **Deploy safety confirmed:** Dexie v2 is purely additive and `sync.ts` touches only the four original tables, so light surveys never reach the server and existing assessments are untouched by the upgrade.
- 157 automated checks across seven scratch suites (corner entry, coordinate parsing, download delivery, heat-map KML, label modes, meter round trip, aerial PDF layout via real jsPDF). tsc, eslint, and build clean throughout.
- **OPEN:** not deployed; nothing tested on an iPad; a failed lot still does not auto-generate a recommendation; light surveys remain local-only.

### 2026-08-17 — Parking-Lot Light Surveys, schools only (v0.31.0, built)
- **New feature: parking-lot light surveys** built end to end for school property types — an independent record hung off an assessment (`light_surveys` + `light_readings`, Dexie **v2**, purely additive). Attachable to an already-completed assessment; never touches Yes/No/UTO progress, zone scores, or the report gate. "Light Survey" button appears in the assessment header only when `isSchoolType()`. New routes `/assessment/:id/light` and `/assessment/:id/light/:surveyId`.
- **Source of the method:** the team's NICP instructional booklet — minimum 50 readings per grid; report lowest reading, average, uniformity ratio, lamp/fixture type, meter type; parking-lot target **≈3 fc (30 lux) average and 4:1 uniformity**. Because the standard comes from their own training material it is *cited in the report* (`STANDARD_CITATION`), which resolved the earlier hesitation about asserting paywalled IES values.
- **Reference files** added at repo root in `Light Survey Resources/`: the blank 2002 `VSO Lighting_Survey_Report WITH LINES.doc` (photometric worksheet — sketch box, D-1/D-2/S-1/S-2 pole geometry, Point/Horiz/Vertical N-E-W-S grid) and two real meter exports (`LXB01001.XLS` auto mode, `Test Fail.XLS` manual mode). Extech SDL400 manual: https://www.fondriest.com/pdf/extech_sdl400_manual.pdf
- **Key decisions (and what was rejected):**
  - **Whole-lot uniformity, not per-quadrant.** Quadrant rollups were built, then removed: the heat map locates a dark region better than four averages, and per-quadrant ratios invite mistaking them for the verdict. Demonstrated with real data — a lot reading 26.9:1 overall while three of four quadrants pass 4:1.
  - **Round spacing drives the grid** (10/15/…/50 ft), not equal division of the lot, which produced un-paceable figures like 34.5 ft. Same spacing on both axes ⇒ square cells; a short final row/column is added so the lot edge still gets read. 448×165 ft → every 35 ft → 14×6 = 84 readings.
  - **Three corner coordinates drive the dimensions** (start corner, far end of long side, corner across the short side). Nothing is measured by hand; the third corner also resolves which side the lot lies on, removing a flip toggle. Paste from Google Maps right-click (~1 m) or capture per corner from device GPS (~5–10 m). Corner 3 is *projected* onto the perpendicular so a sloppy click still yields the right width, with a skew warning.
  - **Vertical (N/E/W/S) readings dropped from v1** — the booklet's metric list is horizontal-illuminance only. Data model can hold them later.
  - **Only exterior parking lots.** The school template has no illumination content at all (no `exterior_lighting` zone, no `lighting` principle — its lighting items are about *securing light controls*), so this is net-new ground with nothing to duplicate.
- **Two format discoveries that would have silently corrupted results:**
  1. **Manual logging (`SP-t`=0) writes the Place column as the "P-n" memory-position display with embedded NUL padding** (`P\0 \0 1`). Those NULs make every encoding auto-detector guess UTF-16, which is why the file renders as a wall of CJK characters in editors *and* on the laptop — the file is fine. Parser now strips NULs/BOM up front, which also handles a genuinely UTF-16 file.
  2. **Manual-mode `Place` is a memory position, not a counter** — it repeats (re-takes) and skips (positions never stored). The real 50-point test had positions 3 and 4 logged twice and position 31 missing. Mapping by row order would have shifted every later reading and drawn dark spots in the wrong part of the lot. Readings are now matched **by Place value** through the skip-aware walk order, last-wins on re-takes, with missing/duplicate/out-of-range reported at import.
- **PDF:** a "Lighting Measurements" section per lot (particulars, scorecard vs the targets, coverage note, heat map with foot rulers and point numbers, darkest points). Reports with no survey are byte-for-byte unchanged (21 pages vs 23). Also a **standalone lighting-only PDF** (`generateLightSurveyPDF`) from a button on the survey page — cover + measurements + disclaimer, usable before the checklist is finished.
- **KML export** (`light-geo.ts`) writes a Google Earth document — lot outline plus a placemark per grid point, coloured by illuminance band — so the grid can be checked against satellite imagery to scale, with no API key, no billing, and no network at report time. Intended workflow: export before the walk, see which points land on landscape islands, mark them obstructed.
- **Irregular lots:** two/three points place a *rectangle*; islands and notches are handled by the obstructed-point mechanism. Rule of thumb — if skips exceed ~¼ of the grid, split the lot into two surveys instead.
- Wording fix after the ratio direction was misread in testing: the report and UI now spell out "no worse than 4:1 — lower is better" plus a plain-language gloss ("the darkest point is 1/27 of the lot average").
- Verified with 139 automated checks across four scratch suites (parser/grid/stats, manual-mode file, geo/KML, rectangle derivation) run through esbuild, plus a real generated PDF inspected with `pdftotext`/`pdftoppm`. Type-check, lint (0 issues in new files), and build all clean.
- **OPEN — carry into next session:**
  - **The 3-coordinate corner entry has not been tested by the user yet.** It was rebuilt at the end of the session after the original two-point flow "collided with step 1" (it asked for dimensions and then merely cross-checked them). Needs a real desk run: right-click three corners in Google Maps → paste → grid appears.
  - **The first KML download did nothing and is undiagnosed.** Hypotheses to check in order: the button is gated on `hasGeoreference()` so it may not have been visible; `buildGridKml` may have thrown into the `geoError` banner unnoticed; or — most likely if it was tried on iPad — **iOS Safari/standalone PWA does not reliably honour `<a download>` with a blob URL**, which is how `downloadKml()` works. If that's it, the fix is a share-sheet or data-URI route.
  - **Nothing is committed.** Everything is v0.31.0 in the working tree, untracked/modified. `Light Survey Resources/` is untracked — decide whether to track it (useful provenance).
  - Manual-mode logging caps at **99 positions**, so lots needing >99 readings must be split across files; the app warns but doesn't merge multi-file imports.
  - Light surveys are **local-only** — `sync.ts` touches only the four original tables, so nothing reaches the server.
  - Not wired: a failed lot does not auto-generate a recommendation (school recommendations still come only from "No" items).

### 2026-08-14 — New Dev PC Setup + Tailscale Key-Expiry Outage (no app code changes)
- **Production outage diagnosed and fixed.** All iPads failed to load the app while Tailscale showed "connected" on each device. Root cause: the **`cpted-server` node key expired** 2026-08-13 20:39 UTC (`tailscale ping` → "peer's node key has expired"; `status --json` → `Expired: true`). Fixed by **disabling key expiry** for `cpted-server` in the Tailscale admin console — no server access needed, node re-registered on its own. Verified after: app HTTP 200, `/api/health` ok, served bundle still v0.30.1. Containers were unaffected — the outage was purely tailnet reachability.
- **Key diagnostic distinction (this is NOT the July iPad bug):** a client showing "connected" only reports its own node's health, and an expired peer still reports `Online: true`, so the server looks healthy in the device list while no peer will route to it. **All devices failing at once ⇒ suspect the server key; a single device failing ⇒ the 2026-07-07 iOS routing fix.** The per-device fix (Reset Network Settings) costs all saved Wi-Fi passwords, so don't reach for it first. Saved as memory `cpted-server-tailscale-key-expiry.md`.
- Tailscale node keys default to **180-day expiry**, so always-on infrastructure silently drops off on a timer. Fixed for `cpted-server`; **`btat-docker` is still exposed to the same cutoff.**
- **New dev PC set up** (`work`, 100.116.37.104): repo cloned to `/home/cigo/cpted_app` at `41f57e5`, `npm install` in both workspaces, `.env` created from `.env.example`. Frontend build clean (PWA SW, 19 precache entries) and server `tsc` clean; dev server verified on `:5173`. Local build output hash matched the deployed bundle exactly — no drift between `main` and production.
- **`.env` was not gitignored** — neither the root nor `server/.gitignore` covered it, so a real `DB_PASSWORD` would have been committed. Added `.env` / `.env.local` to the root `.gitignore`.
- `cpted-assessor/package-lock.json` was stale (recorded `0.5.0` against a `package.json` at `0.30.1`); `npm install` synced it.
- **Doc drift to resolve:** the "Current Status" section above still describes **v0.29.1 / `d478da8`** as latest, but `main` is now **v0.30.1 / `41f57e5`** (sync in-progress + school assessments, faster photo sync) — that release shipped without updating Current Status or adding a session-log entry.
- Note for future reference: the iPadOS path recorded in the 2026-07-07 entry is outdated. Since iPadOS 15 it is **Settings → General → Transfer or Reset iPad → Reset → Reset Network Settings**.

### 2026-07-07 — Legal-Approved Disclaimer + Adam iPad Tailscale Setup (v0.29.1)
- **Disclaimer swap (all property types):** replaced the old liability waiver with the legal-advisor-approved disclaimer (source: `CPTED Approve Disclaimer.docx` at repo root, committed for provenance). Two paragraphs now — both render paths updated: `pdf.ts` `renderLiabilityWaiver` splits `LIABILITY_WAIVER` on the blank line and adds a gap between paragraphs; `Summary.tsx` renders via existing `whitespace-pre-line`. `CLAUDE.md` "Liability Waiver / Disclaimer" section updated as source of truth. Applies to schools too (still folds Confidentiality-of-Report onto the same page). Apostrophes normalized to straight quotes to match codebase style; text otherwise verbatim.
- Bumped 0.29.0 → 0.29.1 (package.json + Home.tsx footer). Build clean (pre-existing lint errors in `Assessment.tsx`/`Home.tsx`/`sync.ts` only, none in touched files). **Deployed via `./deploy.sh`; verified `v0.29.1` string in served JS bundle.** Committed (`d478da8`) and pushed to `main`.
- **Coworker Adam's iPad onboarded to Tailscale + app.** Long troubleshoot: Adam's iPad showed Tailscale connected + server green, but Safari/Chrome timed out. Ruled out (in order): separate-tailnet (re-added under `igogames87@`), device approval, ACL cross-user block, iCloud Private Relay (Chrome failed too), HTTP proxy, VPN conflict, app reinstall, reboot. `tailscale ping` from server → Adam iPad worked **both directions** (direct, 47ms) → proved tunnel healthy; root cause was **iOS not routing browser/app traffic into the tunnel** (wedged VPN route state surviving app reinstall). **Fix: Settings → General → Reset Network Settings.** See new memory `tailscale-ipad-vpn-routing.md`.
- Deferred (unchanged): CPTED scope-audit removals (20 items incl. school Zone 10 "Planning & Drills"). Untracked `logos/image(2).png` still left alone.

### 2026-06-23 — School Yes/No/UTO Rating + PDF Report Redesign (v0.25.0 → v0.29.0)
- **School rating system (schools only):** replaced 1-5 scoring with **Yes/No/UTO** for the 4 school types, gated on `isSchoolType()`. Widened `ItemScore.score` to `number | SchoolRating | null` (`SchoolRating = 'yes'|'no'|'uto'`); `is_na` stays false for schools (UTO replaces N/A). New `RatingButtons.tsx`; `ChecklistItem` takes `ratingMode` threaded via `ZoneView`/`NightView`/`PrincipleSection`. Rating helpers in `scoring.ts` (`isSchoolRating`, `getRatingLabel/Color/BgColor`); `calculateAverage` made numeric-safe (`typeof score === 'number'`) so schools yield null aggregate without NaN. No migration — old 1-5 school assessments start fresh.
- **Summary (schools):** no overall/zone scores ("Checklist Progress" card + zone completion table), Quick Wins hidden, PDF gate keys off "≥1 rated item" (overall_score always null). **Recommendations reworked (schools):** auto-generate removed, uncapped (no 5 cap), "Top" dropped → just "Recommendations", priority selector → single High-Priority toggle (`highToggleOnly` prop on `RecommendationEditor`; on='high', off='medium').
- **PDF redesign (`pdf.ts`, all property types):** formal centered cover (new star badge, navy top/bottom bands, masthead, vertically centered, no footer); "Understanding CPTED" intro page (unnumbered front matter); page-numbered **Table of Contents** (drawn last via reserved page + `setPage`; numbering starts at TOC via `FRONT_MATTER_PAGES=2` offset); **footers stamped in one final pass** over all pages (fixed missing-page-number bug); red **CONFIDENTIAL** header on every page except cover; fixed footer text "CPTED Report - Volusia Sheriff's Office" (removed `getReportTitle`/`getFooterText`). School zone bodies bucket by rating (No→red findings w/ guidance, UTO→gray, Yes→green compliant); Confidentiality-of-Report section folded onto the waiver page; item text bumped 8pt→10pt for readability.
- Versions: 0.25.0 (rating system) → 0.25.1 (stale night-filter fallback) → 0.26.x (cover+TOC) → 0.27.x (cover polish + new badge) → 0.28.x (recs rework) → 0.29.0 (cover centering, bigger text, footer, CONFIDENTIAL). All deployed via `./deploy.sh`; build + lint clean throughout.
- New file: `cpted-assessor/public/logos/volusia_sheriff_badge_star.png` (source dropped at repo-root `logos/image(2).png`, left untracked).

### 2026-06-03 — PDF Report Date Fix (v0.24.2)
- User reported the 1001 Broadway PDF report showed the assessment date as May 19 (both cover page and signature line) when the stored value was May 20. Same UTC-midnight footgun as v0.24.1 — `new Date("2026-05-20")` parses as UTC, renders as previous day in Eastern time.
- Fix: `formatDate` in `cpted-assessor/src/services/pdf.ts` now detects `YYYY-MM-DD` and appends `T00:00:00` to force local-midnight parsing (same pattern as Home.tsx). Single edit covers both the cover-page Assessment Date (`pdf.ts:259`) and the signature date (`pdf.ts:1116`) since both route through `formatDate`.
- Bumped patch 0.24.1 → 0.24.2 (package.json + Home.tsx footer). Deployed via `./deploy.sh`; build clean, container recreated.
- Note: changes uncommitted at session close. Working tree also still carries the `files(1)/cpted-scope-audit.md` work order from the 2026-05-21 audit (untracked) and the v0.24.1 changes that hadn't been committed yet.

### 2026-05-21 — CPTED Scope Audit (no code changes)
- The team decided to revert from the hybrid CPTED + target-hardening approach to **strictly CPTED** content — liability driver: assessors hold the **Florida Attorney General's Office CPTED Practitioner designation**, a narrow CPTED-specific credential. Recommending outside it is an attack surface.
- Ran a parallel multi-agent audit tagging all **594 checklist items** across all 6 templates against the Crowe three-form CPTED taxonomy. Result: **531 clean in-scope, 33 borderline (keep/reframe), 10 school statutory (keep), 20 out of scope**. 95% already defensible CPTED — a wholesale revert would be wrong; the fix is surgical.
- Key doctrinal point: strict CPTED is NOT "natural strategies only" — access control and surveillance each have *mechanical* (locks, CCTV, card access) and *organized* (guards, visitor mgmt) forms. Locks/CCTV/lighting/fencing are all in scope. The genuinely out-of-scope content is all **emergency management** (plans, drills, training, response teams).
- **Decision: remove the 20 out-of-scope items** — concentrated in 3 hotspots: commercial Zone 11 "Workplace Violence & Active-Threat Readiness" (12), worship/christian "Target Hardening & Emergency Preparedness" principle (5), school Zone 10 "Planning & Drills" (3). Deferred — not started this session.
- Full work order with exact item text + implementation notes: `files(1)/cpted-scope-audit.md`.
- Data correction discovered during audit: townhome template is **71 items**, not the "~67" previously recorded.

### 2026-05-19 — Commercial Audit Refinements (v0.23.3 → v0.24.1) + Dashboard Date Fix
- Field-driven audit pass on the commercial template ahead of tomorrow's (2026-05-20) Volusia insurance HQ walkthrough. Five findings collected in `files(1)/commercial-audit-followups.md` during the audit, then batched as v0.24.0; date-bug follow-up shipped as v0.24.1.
- **v0.23.3** — Lighting items hidden from Exterior/Interior tabs entirely; scored only from Night Walkthrough. `phaseFilteredScores` in `Assessment.tsx` adds `!isNightItem(s)` to the exterior/interior filter path; same change applied to the commercial grouped-sidebar's per-section item count.
- **v0.23.4–v0.23.5** — Plain-language replacements for parking jargon. "Stall striping..." → "Painted parking space lines, directional arrows, and curb markings..."; "visitor stalls" / "damaged stalls" / "Reserve stalls" → "...parking spaces". Touches 3 zone-file items + 3 guidance-Map keys + body text in two improvement strings.
- **v0.24.0 (batched five findings):**
  1. Dropped duplicate "Painted parking space lines..." item from Z2 Territorial Reinforcement (overlapped the Maintenance & Image item) — parking_pedestrian now 17 items.
  2. Re-tagged "Ground-floor windows are not obstructed by interior signs..." to interior (mirrored/tinted glazing makes exterior view unreliable) + added a VERIFICATION_HINTS entry.
  3. Added missing 2'/6' landscape rule to Z3 Natural Surveillance — was in Z1/Z2 but absent from the dedicated landscaping zone. grounds_outdoor now 12 items.
  4. Plain-language MDF/IDF: "Main and floor-level telecom/network closets (often labeled MDF and IDF)..." — covers 2 scoring items + the Z9 description, with matching `INTERIOR_ITEMS` keys synced.
  5. `isNightItem` now returns false for any item in `INTERIOR_ITEMS` — Z7 stairwell + floor-lobby lighting moves back to the Interior walk. (The v0.23.3 change had accidentally hidden them from both tabs.)
- **v0.24.1** — Home.tsx dashboard list was displaying `created_at` (system timestamp) instead of `date_of_assessment` (the field set in Edit Info). Also added local-midnight parsing in `formatDate` so `YYYY-MM-DD` date-only strings don't render a day early in Eastern time. NOTE: this version's changes (package.json + Home.tsx) were not yet committed at session close — `git status` showed them unstaged.
- Net item count unchanged at 156 (dropped 1, added 1). Audit follow-ups file at `files(1)/commercial-audit-followups.md` is the working-record of the audit and was applied verbatim in v0.24.0.
- Versions shipped: 0.23.3, 0.23.4, 0.23.5, 0.24.0, 0.24.1.

