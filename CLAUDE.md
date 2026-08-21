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

**`main` is at v0.45.0 — the lighting grid is now walked in the app, and readings can be typed at the point (deployed + pushed 2026-08-21).** Two releases, closing the task the 2026-08-20 night walk raised. **v0.44.0** is a full-screen **walking view** at `/assessment/:id/light/:surveyId/walk`: the county aerial, the lot outline, every point numbered, the current one highlighted, and Previous/Next at 68px. **v0.45.0** adds a **keypad** beside the map — read the meter, type the value, tap Record, and it saves against the point and steps on. The meter-file import is untouched and stays.

**There is no blue dot and there never will be.** The iPads are Wi-Fi-only with no GNSS, so the walk is **tap-to-advance**: the assessor tells the app where they are, not the other way round. This is stated in the code and on the screen so nobody stands in a car park waiting for a fix.

**The walking view works offline because the aerial is carried, not requested.** New `LightSurvey.aerial_base` stores the plain imagery *with* the EPSG:3857 extent it covers, cached automatically when the lot is framed at a desk. It could not reuse `aerial_image`, which is a finished report picture with the grid burned into the pixels and no bounds attached — nothing can be highlighted on it. A survey with no cached picture still walks, on the lot outline, and says so.

**`walk_position` deliberately does not bump the assessment revision.** A bookmark is not content, and seventy taps of Next would otherwise make a walk look like heavy editing and manufacture a sync conflict — the same rule that keeps `persistAllScores()` from bumping. Typed *readings* do bump, because those are real edits.

**The day before, v0.41.2 → v0.43.0.** **v0.41.2** names the standard the light survey is judged against: 3.0 fc and 4:1 are **CPTED crime-prevention levels from NICP training, not code** — and stricter than the code a principal answers to (Florida Building Code 453.10.3.5 asks 1.0 fc for school parking), so a lot can satisfy its code and still read "Below". No arithmetic changed. **v0.42.0** adds per-assessment **revision tracking** for the shared iPads. **v0.43.0** makes the lot rectangle **draggable** on the county aerial.

**Revision tracking exists because `updated_at` could not answer "which copy is newest".** Score taps, item notes and photos changed data *without* bumping it, while *syncing* did bump it, and the server overwrote it with its own clock. Each assessment now carries `revision` (+1 per real edit), the editing device's name, and `synced_revision` — the revision at the last sync, which is what makes genuine conflict detection possible from two integers. Derived recalculations deliberately never bump: `persistAllScores()` runs on mount, so bumping there would make merely *opening* an assessment look like an edit and cry conflict when nothing happened.

**Earlier the same week, v0.41.1 — school reports carry the district's own site-profile page and the crime analysts' PDF.** Two strands in one day. First, three releases off the first night of real light-survey data: the **0.1 fc uniformity floor** (v0.38.0), a **plain-language intro** to the lighting section (v0.39.0), and a **`report_signed_on` field** so a multi-visit assessment isn't signed with its walk date (v0.40.0). Then **report uniformity** (v0.41.x): a **School Profile** page and an **easy crime-analyst PDF upload** whose pages are merged whole into the back of the report.

**`pdf-lib` is now a dependency** — jsPDF builds pages but cannot read them, so merging another unit's PDF needs a second library. It loads on demand as its own chunk, so the app shell is unchanged in size, and it is precached so merging works offline.

The day before, v0.37.0 closed out six releases: the light-survey feature itself (v0.31.0), server sync (v0.32.0), the county-aerial corner picker (v0.33.3), the photo-GPS accuracy gate (v0.34.0), aerial map overscan (v0.35.x), and two passes on grid geometry (v0.36.0, v0.37.0). See the four 2026-08-18 session-log entries.

**The app is now served over HTTPS at `https://cpted-server.tailb4c659.ts.net`** via `tailscale serve`, alongside the original `http://100.91.180.116`, which still works. Both hit the same nginx and database; only browser-local IndexedDB is per-origin, so each iPad must sync on the old URL before moving to the new one. HTTPS was required because **geolocation is blocked on insecure origins** — which had silently disabled every location feature in the app since day one.

Earlier the same day, v0.31.0 — parking-lot light surveys for school assessments. The two items left open from the 2026-08-17 session are resolved: the three-corner entry is verified end to end, and the "KML download did nothing" was never a download failure — the files had downloaded all along, and no installed application could open a `.kml`. See the 2026-08-18 session log.

Earlier milestone, v0.29.1 (`d478da8`): the old liability waiver was replaced app-wide (PDF all types + on-screen Summary) with the **legal-advisor-approved disclaimer** — source of truth `CPTED Approve Disclaimer.docx` (repo root, committed) and the "Liability Waiver / Disclaimer" section below. Two paragraphs; render paths handle the break.

School assessments use a **Yes/No/UTO checklist rating** instead of the 1-5 scale (team trained on the National Institute of Crime Prevention school survey: `files(1)/CPTED SCHOOL EVAL.docx`). Schools-only, gated on `isSchoolType()`; all other property types keep 1-5 untouched. Plus a full **PDF report redesign** (applies to all types): formal centered cover (star badge + "Volusia Sheriff's Office" / "Domestic Security Unit" masthead + "Crime Prevention Through Environmental Design Report" + property name/address, navy top/bottom bands, vertically centered between bands, no footer), an "Understanding CPTED" intro page, a page-numbered Table of Contents (numbering starts at the TOC), a red "CONFIDENTIAL" header on every page, and a fixed footer "CPTED Report - Volusia Sheriff's Office". School reports: no aggregate score, recommendations driven by "No" items (uncapped, no auto-generate, single High-Priority toggle), Confidentiality-of-Report section folded onto the waiver page. New star badge logo at `public/logos/volusia_sheriff_badge_star.png`.

**Remaining items / To-Do:**
- **NEXT UP — walk a real lot at night with the new screen.** Built and deployed 2026-08-21, and it **looks right in the app**, but it has not yet been used to walk a car park in the dark, which is the only thing that can settle it. What to watch, in rough order of likelihood:
  - **Keypad key size and contrast** — roughly 90×68 landscape, 243×60 portrait. Cold hands and no light is the test.
  - **Whether tap-to-advance keeps pace** with actually taking a reading, or whether Record-and-move-on jumps ahead too eagerly.
  - **The 160 ft default zoom** (`DEFAULT_VIEW_FT` in `WalkMap.tsx`), about five cells across. Enough context, or too tight?
  - **Portrait squeezes the map** to ~390px with the keypad up. "Hide keypad" is in the header for anyone logging to the meter card instead.
  - **That the cached aerial is actually there.** Lots plotted before v0.44.0 carry none until step 1 is opened once with a connection. Easy proof of the offline path: load the walk view, turn Wi-Fi off, reopen it — it should look identical.
- **Multi-session meter files are not importable** *(now avoidable — typing readings in the walk view side-steps the card entirely)*. Exiting and re-entering the SDL400's manual mode appends a *second session to the same file*, marked by a repeated header row and restarting at P1. The parser only treats row 0 as a header, so the second one is swallowed as "1 row could not be read" and every session is merged by position number, last-wins — lot 3 silently overwriting lots 1 and 2. Decided 2026-08-18 **not** to build a session picker: it would confuse the other assessors mid-import. Field workaround: copy each lot's file off the card **and delete it from the card** between lots, so each lot gets its own file. Timestamps separate sessions if that is ever missed.
- **Aerial map lag is fixed for short gestures, not long ones** (v0.35.x). A pan inside the fetched margin costs no request at all; a drag past it, or a zoom past the fetched extent, still waits ~0.75 s on the county server. Next lever if it ever matters: the county's **`Aerials/2021_Aerial` is a pre-rendered tile cache** (512px tiles, 55–70 ms each, browser-cacheable) against ~0.7 s per dynamic render on the 2024 imagery — but it is 2021 at 6-inch instead of 2024 at 3-inch, and published in NAD83 Florida East State Plane rather than Web Mercator, so it would need the picker's projection rewritten (which would also remove the documented 0.5% spherical-Mercator error).
- **Light surveys and the aerial picker: still nothing driven by a fingertip.** The v0.43.0 corner drag is sized for one but has only ever been driven by a mouse — `HANDLE_GRAB_PX` (26px) in `AerialCornerPicker.tsx` is the constant to tune after a real session, and the magnifier's placement is the other thing to watch. GPS corner capture, the share-sheet KML hand-off, the screenshot upload, and the whole overscan gesture rework are desktop/headless-verified only. Multi-file (>99 reading) imports still not built.
- **A failed lot still does not auto-generate a recommendation** — school recommendations come only from "No" checklist items, so a lot failing 3 fc or 4:1 has to be written up by hand.
- **The merged-PDF download is untested on a device.** When a crime report is attached the report no longer saves through jsPDF — it goes through the iOS share sheet, because `<a download>` on a blob URL is what broke the KML export. Reports *without* a crime PDF keep the original, field-proven path. First place to look if an iPad refuses to produce a merged report.
- **Deleting an assessment leaves an empty directory** under `/data/crime-reports/<id>/`. The photo code has always done the same, so this is consistent rather than new — one `rmdir` each, whenever it's worth a deploy.
- **`crime_reports.source` is an unused column.** It fed the divider page that was removed in v0.41.1; left in place rather than running a migration on live to tidy a column nothing reads.
- **`Home.tsx` will crash on an assessment whose `overall_score` key is absent** (line ~596: guarded with `!== null`, then `.toFixed(1)`, so `undefined` throws and blanks the home screen). Not reachable through any app path — the field is always written — but it is one word from being safe. Found 2026-08-21 with hand-written test data.
- **A narrow lot is sampled far harder than a wide one, and that is the standard's doing.** The NICP 50-reading floor is an absolute count, not a density, so a 304 × 66 ft lot has exactly one usable grid — 15 ft / 20×4 / **80 readings**, 251 sq ft each — while a 63,420 sq ft lot gets 70 readings at 906 sq ft each. The short side is what forces it: at 20 ft spacing 66 ft fits only 3 rows, giving 45 readings, five under the floor. Raised and **deliberately left alone 2026-08-21**; 15 ft is squarely inside the 10–20 ft consultant convention, so the small lot is the textbook walk and the big ones are the coarse ones. A note explaining *why* only one grid is offered was proposed and declined.
- **Three copies of `formatDate` still carry the same date-only guard** (`Home.tsx`, `pdf.ts`, `ServerAssessmentCard.tsx`). The drift between copies is what produced the 2026-08-19 day-early bug on the Server tab; consolidating them is the actual fix. `pdf.ts` uses a long month format, so a shared helper needs a format argument.
- **A pass/fail verdict can contradict the number printed beside it.** An average of 2.96 fc prints as "3.0 fc" but reads "Below" against the 3.0 target, and the same applies at 4:1. Deliberately left alone on 2026-08-19: judging on the rounded value would flip verdicts on existing reports, which is the team's call, not a silent code change.
- **Remove the 20 out-of-scope items** from the CPTED scope audit (worship 2, christian 3, schools 3, commercial Z11 12) — team decision 2026-05-21, deferred. Full work order: `files(1)/cpted-scope-audit.md`. Then a separate guidance-prose cleanup pass.
- Update server-side zone data + PDF for townhome, worship, Christian church, school, and commercial-office assessments (server still residential-only)
- Light-survey sync is last-write-wins per assessment, like the score tables. Two devices editing lots on the same assessment will clobber each other — fine for one-assessor-per-site, worth revisiting if that changes.
- Voice notes feature (planned)
- Server-side report storage (planned)
- Photo annotation — draw arrows/circles on captured photos to highlight issues
- Replace PWA icon SVG placeholders with proper PNGs
- Fix dark mode for disabled/N/A states (bg-gray-50 not dark-aware)
- Review phase classifications for worship/church items as field usage reveals mis-tags

Git repo initialized. Remote: `https://github.com/Jedigo/CPTED-App.git` (branch: `main`)

## Session Log

### 2026-08-21 — Walking the Grid In-App, Typed Readings (v0.44.0 → v0.45.0, DEPLOYED + PUSHED)

- **Closed the task the 2026-08-20 night walk raised.** The grid was plotted at a desk and then unusable on site: export a KML, open it in Google Earth on a *second* device, or squint at a screenshot. Two questions needed answering on the device doing the walk — where is point 37, and which point am I on — and the answer is now a screen, not a round trip.
- **Asked first, then built both halves.** The open question from last session was whether to also capture readings in the app instead of importing the meter file. The answer was **both**: typing is offered, importing is untouched. Staged as two shippable releases so the navigation half could be field-tested even by someone logging to the SD card as usual.
- **v0.44.0 — the walking view.** New full-screen route reached from a "Walk the grid" button in step 2. Aerial, lot outline, numbered points, current one highlighted at 52px, next one ringed, done ones green, obstructed ones hatched. Pinch and pan, tap any point to jump to it, and a "Back to point N" button once the assessor has panned away. Screen wake lock while it is open, re-taken on `visibilitychange` because iOS drops it on backgrounding.
  - **Tap-to-advance, and it will never be anything else.** The iPads are Wi-Fi-only with no GNSS; the Wi-Fi fix that killed GPS corner capture is just as useless for standing in a parking space. Said in the code *and* on the screen so nobody waits for a blue dot.
  - **The aerial had to be carried, not requested.** New `LightSurvey.aerial_base` — the plain imagery plus the EPSG:3857 extent it covers — cached automatically from the corner picker's existing `onImage` when a lot is framed at a desk. `aerial_image` could not be reused: it is a finished report picture with the grid burned into the pixels and **no bounds attached**, so nothing can be highlighted on it. Two different jobs that happen to both be JPEGs.
  - **Cached on corner-commit and on first sight of a map, never per gesture.** `onImage` fires on every pan settle; writing there would inflate the assessment's revision one gesture at a time. So: written inside `persistCorners` (already an edit), plus a one-shot for surveys plotted before this release, whose corners are already set and would otherwise never cache anything.
  - **Aerial layout is used only when the cached picture actually covers the lot.** A base cached before the corners moved can frame somewhere else entirely, and a map showing the wrong ground is worse than no map — the points would still be drawn, still numbered, still wrong. Otherwise it falls back to the lot outline on a dark ground and says "No aerial cached".
  - **`walk_position` does not bump the revision.** A bookmark is not content; seventy taps of Next would make a walk look like heavy editing and cry conflict at the next sync. Same rule as `persistAllScores()`. Verified: 14 taps, revision unmoved.
  - **Step wording never says left or right.** The app has no idea which way the assessor is facing, so a turn instruction would be a coin flip. Everything is relative to the walk: "30 ft along the row", "End of the row — 30 ft across, then back the other way", and at the start, where point 1 actually stands (half a cell in, which surprises people).
  - **The header shows the reading number and the grid point separately** once anything is marked obstructed. They diverge exactly then, and showing only one of them is how a whole meter file ends up shifted by a position.
- **v0.45.0 — type the reading at the point.** Keypad beside the map in landscape, below it in portrait. Record saves and steps on, because the assessor's next move is to walk anyway and two taps per reading is seventy extra taps a lot.
  - **Its own keypad, not a number input.** The iOS keyboard has keys small enough to mis-hit with cold hands and slides over half the screen — including the map that says which point the reading belongs to.
  - Readings **upsert on `point_index`**, so re-reading overwrites rather than leaving two values for one cell. Footcandles only (the meter is set to Ft cd for the whole survey). `measured_at` from the device clock, which unlike the meter's is actually set. **0.0 records as a real reading** — it is what the v0.38.0 uniformity floor exists for.
  - The current-point marker shows **the point number, never the value**: the number is what answers "which point am I on", and a marker reading "0.0" puts a value where an identity should be. Changed after seeing it on screen.
  - **Import over typed readings: warn, then replace** (chosen over merge or block). Importing already wipes every reading; typed ones exist nowhere else, so it now counts them, names the number, says they are not stored anywhere else, and asks. A survey holding only imported readings is not prompted at all.
  - Keypad visibility lives in `localStorage` — whether an assessor types or uses the card is a habit, not a property of the lot, and it must never count as an edit.
- **Server: migration 0015** adds `aerial_base jsonb` and `walk_position integer`. **The light-survey sync is a delete-then-insert**, so a v0.43.0 iPad would have blanked both just by pushing — the existing values are now read first and carried forward for any key the client did not mention. Same lesson as the v0.40.0 `report_signed_on` wipe, applied a field at a time because a survey is replaced wholesale rather than updated. An explicit `null` still clears.
- **Verified: 121 checks locally, 25 more against the live server.** Headless suites for walk order with skips in both directions, step wording across row turns, and the projection round-tripping onto the cached aerial within 0.05 ft. Real-browser runs against **live county imagery** measured the ground between consecutive taps (30 ft, as designed), tap-to-jump, drag-is-a-pan, tap-on-nothing, the no-imagery fallback, and the import warning declined then accepted. Live round trip confirmed the aerial returns byte-identical with **unrounded** Mercator bounds, and that a stale client cannot wipe it. Database back to 18 assessments / 8 surveys afterwards.
- **Method note, third session running: a test that skips itself proves nothing.** The first tap-to-jump check quietly passed by declaring the target off-screen; rewritten to pick a marker that is genuinely visible. Two other checks failed for the right reason — the map is no longer centred in the *window* once the keypad takes a column, and two `Back` clicks in one frame only move one point.
- **A 500 on the first live push was not a regression:** `city`, `state`, `zip` and `assessor_name` are NOT NULL with no default, and the test payload omitted them. The app always sends them. Worth knowing if anything ever posts a partial assessment.
- Both commits build and type-check standalone (`cff177b`, `5619de5`); the deployed bundle matches the local build by md5 and lint is unchanged from baseline.
- **OPEN:** it **looks right in the app** but has not walked a real lot in the dark — see the NEXT UP item. Also found: `Home.tsx` throws on an assessment whose `overall_score` key is absent, and the NICP 50-reading floor samples a narrow lot roughly 4x harder than a wide one (raised, examined, deliberately left alone).

### 2026-08-20 — CPTED Labelling, Revision Tracking, Draggable Lot Corners (v0.41.2 → v0.43.0, DEPLOYED + PUSHED)

- **Three releases, all deployed and verified against the served bundle by md5.**
- **v0.41.2 — the light survey now says which standard it is judging against.** Prompted by a real question: a school that *looked* well lit still read "Below" on both measures. Checking where 3.0 fc and 4:1 come from: they are **CPTED crime-prevention levels from the team's own NICP training, not a code requirement** — and notably stricter than the codes that actually bind a school. **Florida Building Code 453.10.3.5 asks 1.0 fc average for educational-facility parking**; IES RP-20 asks 1–2.5 fc by activity level. So a lot can comfortably satisfy the code a principal answers to and still sit below the CPTED target, and the report was printing a bare "Target" column and a "Below" verdict with nothing naming the standard.
  - Also established, and worth not re-researching: **no standard sets a required distance between measurement points.** NICP asks for ≥50 readings and no spacing; the VSO 2002 worksheet collects pole height but states no spacing; IES LM-5 (the area-lighting measurement guide) is paywalled *and withdrawn*; zoning ordinances commonly require a 10×10 ft grid but for *design calculations on paper*, not field readings; 10–20 ft intervals is consultant convention. The app's round paceable spacings are defensible — there is nothing to violate. The one honest caveat: a 30 ft grid is coarser than convention, which biases toward **missing dark pockets**, i.e. understating a problem.
  - Labelling only — no arithmetic changed, so existing reports reprint identically.
- **v0.42.0 — revision tracking, because the iPads are shared.** Sync is last-write-wins in both directions and nothing said which copy was current.
  - **`updated_at` could not answer it, and that finding shaped everything.** Score taps, item notes and every photo add/delete/move changed data *without* bumping it; a successful *sync* **did** bump it; and the server overwrote it with its own clock. An assessor could walk an entire site and the timestamp never moved. So the work was not "show a value we have" — it was bookkeeping wired into edit paths that had none.
  - `revision` (+1 per real edit), `last_edited_by`, `last_edited_at`, and **`synced_revision`** — the revision at the last sync. That last one is what makes genuine conflict detection possible from two integers and no content hashing: if both sides moved past the common ancestor, they diverged.
  - **The bump belongs to the user-action layer, never derived recalculation.** `persistAllScores()` runs on mount from both Assessment and Summary, so bumping there would mean merely *opening* an assessment looked like an edit and cried conflict when nobody touched anything. **A warning that fires when nothing happened is worse than no warning** — people learn to tap through it, and then it fails on the one occasion it is right.
  - **No-op guards were mandatory, not polish.** `ChecklistItem` fires `onNotesChange` from `onBlur` on every tab-away whether the text changed or not, and re-tapping a score rewrote it — so without guards, *re-reading* a finished assessment inflated its revision and manufactured a conflict.
  - **No Dexie version bump, deliberately.** IndexedDB stores are schemaless — `.stores()` declares the primary key and indexes only — and none of these fields need an index. An `.upgrade()` that throws leaves `db.open()` rejecting: the app fails to launch, in the field, on a shared iPad, unrecoverably. Existing rows are backfilled by ordinary startup work, and every reader defaults a missing revision to 1. The backfill's `synced_revision = synced_at ? 1 : null` is the load-bearing line — it stops the whole back catalogue reading as diverged on first launch.
  - **Server (migration 0014):** guarded on key presence like `report_signed_on`, but when a pre-feature client omits `revision` the **server increments it itself**. Leaving it put would strand a stale number against changed content and every other device would believe it was up to date — invisible lost work, which is the exact failure the feature exists to prevent. Spurious "server is newer" is the better failure. The `client sent no revision` warning in the container log is the fleet-upgrade progress bar.
  - `last_edited_by` is **`text`, not `varchar(n)`**: a too-long name would abort the whole sync transaction and lose an assessor's real work to protect a label that is only displayed.
  - **Device names are per-origin, and that will bite.** The name lives in `localStorage`, and the app answers on **two origins** (`http://100.91.180.116` and `https://cpted-server.tailb4c659.ts.net`) — so an iPad named on one URL is unnamed on the other, exactly as each origin already has its own IndexedDB. Nothing client-side can fix it; the naming dialog offers the names already seen on the server so it becomes a pick rather than a retype. The real fix, if it matters, is serving from one URL.
  - **The naming prompt was deliberately moved off "first edit".** Asked for on the first edit; built to fire on the **home screen once an unattributed edit exists**, because interrupting someone mid-tap in a dark car park to ask a naming question is the wrong moment and the answer is just as useful when they surface. Declining is always fine — the revision still records, it just says "unnamed iPad". Revisit if the delay proves confusing.
- **v0.43.0 — the lot rectangle is draggable on the aerial.** Framing a lot meant tapping three corners with no way to adjust one afterwards. Now: "Draw a box" seeds a rectangle (no blank start state), corners drag to reshape, dragging inside slides the whole lot, dimensions update live, and a **magnifier** follows the drag because a fingertip covers ~44px of imagery worth half a foot per pixel.
  - **Corners are held once a lot has readings**, behind an explicit unlock — every grid point derives from them, and dragging makes accidental damage far easier than tapping did. That hazard already existed unguarded.
  - **Two real bugs surfaced by building it.** (1) The overlay drew a **parallelogram** through the three taps while the grid is laid out on a **rectangle** — square taps hide the difference, shaping by eye would not. It now draws the shape that actually gets walked. (2) **Rotating the long side silently changed the lot's width**, because the perpendicular moved out from under a width point placed against the old one. The width is now carried round with the rotation.
  - **Edits commit on lift, not per frame** — `onChange` writes through to the database and now bumps the assessment revision with it, so a live write per pointer move would be hundreds of both per drag. Confirmed in the browser: six edits produced revision 6.
- **Verified end to end.** ~140 automated checks across five suites, 35 live checks against the production server (including the old-client push, a backward push, and a non-UTC edit time landing as 13:15 UTC rather than truncated to a date), and a **real-browser run against live county imagery** — a corner drag rotated the box onto a row of houses, a body drag preserved 394 × 132 ft exactly, the width handle took it to 394 × 203 with the length untouched, and a drag on a locked corner moved nothing and burned no revision. Migration 0014 confirmed applied on the live database with all 18 existing rows reading revision 1.
- **Method notes worth keeping.** One test was written to assert that the *un-carried* width really does drift — a test that cannot fail is worse than no test, and this is the second session that rule has earned its place. `screenToImagePx` was extracted from the picker specifically so the conversion that decides where a corner lands at half a foot per pixel is testable; getting it wrong is invisible, which is exactly the v0.35.1 bug.
- Committed as three separate releases (`72c8515`, `5864347`, `eee3e4f`). All three touched `Home.tsx` and `package.json`, so intermediate states were reconstructed and **each commit was type-checked and built standalone**; the rebuild from the final committed source reproduces the deployed bundle byte for byte (`ea038e50…`).
- **OPEN:** nothing from today has been used on an iPad. And the field finding that sets the next task — **the Google Earth round trip for the working grid is not practical on a night walk**; see the NEXT UP item in the To-Do.

### 2026-08-19 (later) — School Profile Page, Crime Analyst PDF Merge (v0.41.0 → v0.41.1, DEPLOYED)

- **Driver: report uniformity.** The crime analysts hand over their own PDF of crime data, and the district circulates an approved school site-profile page. Both were arriving as separate documents; the ask was one report.
- **New School Profile page** — the school's roll, built capacity, and staffing, over an overall photo, printed as the **first numbered page** of a school report. Entered from a new **"School Info"** button in the assessment header, schools only, beside "Light Survey". Reachable on assessments that are already finished, which is the point: the profile is collected from the school, not observed on the walk.
  - **Field list and wording come from the district's approved page** (screenshot committed at `files(1)/school-profile-approved-page.png`) and live in `services/school-profile.ts` as **one list driving both the form and the PDF** — two lists would drift, and a report that disagrees with its own entry form is worse than either.
  - **The school name is reused from `homeowner_name`**, which already prints on the cover, so it is never typed twice.
  - **Every value is text, and staff figures are never added together.** The itemised staff on the approved page sums to 73 against a stated total of 180 — the school's own total counts categories the page doesn't itemise, so a computed sum would openly contradict the district's document.
  - **The student-to-teacher ratio *is* derived** (roll ÷ teachers, "22 to 1"), after an initial misread of "no auto math" that made it a typed field. Keyed off the teacher count, not the all-staff total — 180 would give "5 to 1". Missing, zero, or non-numeric inputs print no ratio line at all rather than a divide-by-zero.
  - Blank fields are omitted; an all-blank profile prints no page; non-school types never get one.
- **Crime analyst PDFs are merged in whole**, immediately after the lighting measurements and before the recommendations they inform.
  - **jsPDF cannot read PDFs, only write them**, so the merge is a post-processing pass by **pdf-lib**. Rejected the alternative of rasterising their pages to images: it would turn their text into a picture of text and blur their charts on reprint.
  - **The mechanism that keeps numbering honest:** at generation the report lays down one blank page per analyst page, so every page number and contents entry after the section is already correct before numbering is stamped; the blanks are then swapped for their real pages. Page count is read at upload for exactly this reason.
  - **v0.41.0 shipped with a divider page** — a preamble plus a "Prepared by / Source document / Pages" table. Field feedback was immediate and blunt: it should be the exact PDF and nothing else. **v0.41.1 removed it**, along with the "Prepared by" input that fed it. Their pages now carry no header, no footer, and no furniture of ours. The section is still listed in the Table of Contents, which is our own contents page and the only place it is named.
  - **Their page size is preserved** (Letter against our A4) — asserted per page, since a merge that silently rescaled their charts would otherwise look fine.
- **Storage split on size.** The school profile is small, so it rides the existing sync payload as one `jsonb` blob (migration 0012) with the same key-presence guard as `report_signed_on`. The crime PDF gets **its own upload endpoint and its own disk volume** (migration 0013), mirroring photos — confirmed sub-1 MB in practice, so no chunking, but base64 in a JSON payload would inflate it for nothing.
- **Two bugs worth recording.** Values overprinted their labels on the profile page because the label width was measured *after* switching from bold to normal, and bold is wider — now asserted as contiguous `"Label: value"` in the extracted text. And one merge assertion was written with a trailing `|| true`, so it could never fail; replaced with a real per-page size check. **A test that cannot fail is worse than no test.**
- Verified with 76 automated checks across three suites plus a 16-check round trip against the live server — the analyst PDF returns byte-for-byte (md5), a stale client cannot wipe either the profile or the PDF, replacing the PDF orphans nothing, and deleting the assessment takes the file with it.
- **OPEN:** the merged download has never run on an iPad; empty directories are left behind on delete; `crime_reports.source` is now an unused column.

### 2026-08-19 — Uniformity Floor, Report Intro, Signature Date (v0.38.0 → v0.40.0, DEPLOYED + PUSHED)

- **First night of real meter data drove all three releases.** The lighting survey worked in the field; what came back were three complaints about how the results *read*.
- **A 0.0 fc reading no longer voids the uniformity ratio (v0.38.0).** The report printed "undefined" for exactly the lots that are failing worst. The team's instruction was to use 0.1 regardless, and **the meter is what justifies it**: the Extech SDL400 resolves footcandles to 0.1 fc (datasheet, and its logs carry one decimal), so a logged 0.0 means "below what this instrument can read", not "no light".
  - **Checked against the literature, and the honest answer is that no published standard states the 0.1 substitution.** IES RP-20 sets avg:min 4:1 for parking and a 0.2 fc minimum — it assumes a real minimum and never contemplates a zero. So the report *explains* the floor instead of asserting it, and notes the direction: the true darkest reading lies in [0, 0.1), so the real ratio can only be **worse** than the one printed.
  - A logged 0.0 now displays as **"< 0.1 fc"** everywhere — printing "0.0 fc" claims precision the meter does not have. A lot where *every* point reads below the floor still gets no ratio, because flooring 0.0/0.1 would print a flattering "0.0:1 meets" on the darkest lot possible.
  - **Known consequence:** a dim-but-even lot can now *pass* uniformity while failing the 3 fc average. That is mathematically right — uniformly dark is uniform — and the average line carries the failure.
- **The "odd blank space" before the heat map was an orphaned heading, not spacing.** Only the heading's own height was reserved, so the map measured itself and broke to the next page, stranding "Lot Map" over a blank one. Heading and map are now reserved together; renamed "Lot Map — Measured Footcandles". Reproduced first, then fixed, then asserted across 8 grid shapes.
- **Found while verifying that: the map's foot rulers were wrong on every v0.37.0 grid.** They read 0, 30, 60… while centre-of-cell readings actually sit half a spacing in, and they **contradicted the darkest-points table on the same page**, which had it right. Both now derive from `pointPosition()`, so they agree by construction.
- **The lighting section now opens with a plain-language box (v0.39.0)** — what was done, what a footcandle is, and why evenness matters as much as quantity. The report goes to principals and facilities directors who have no reason to know any of it, and without it the section is a wall of numbers. Printed **once per report**, on the first lot only.
- **The signature date is now its own field (v0.40.0).** It came from `date_of_assessment` while the label already said "Date Prepared" — the code had been claiming one thing and showing another. It breaks the moment an assessment spans visits, which this one did: **part 1 in July, the other two halves in August, three visits total.**
  - `report_signed_on`, date-only, optional. Stamped with today the first time the report is generated *or* marked complete, then never again; editable in Edit Info. The stamp lives in the PDF generator, not the button handlers, so a report cannot be produced without one. Label is now **"Date Signed"**.
  - Optional is what protects the back catalogue: every assessment predating the field falls back to `date_of_assessment`, so reprints are unchanged. **Visit dates stay out of scope** — no range, no list; that concept does not exist in the data model and would have been built from scratch.
  - `varchar(10)` text, never a timestamp (migration 0011), and the "today" helper is local-calendar, not `toISOString()` — the Auckland test run shows UTC returning *yesterday's* date. Same footgun as the v0.24.1/v0.24.2 report-date bugs.
- **Verification caught a data-loss bug that testing-by-inspection would have missed.** A PWA older than v0.40.0 omits the new key entirely, and the server read that as "clear it" — so **a colleague syncing from a stale iPad would have silently wiped a signed date off the server**. The column is now only touched when the device actually sends the key, and clearing the field sends an explicit `null` so a deliberate clear still propagates. Exactly the guard `light_surveys` needed in v0.32.0. It shipped in the first deploy of the evening and was fixed and redeployed within minutes.
- **Also fixed, same class of bug:** `ServerAssessmentCard` had its own `formatDate` without the local-midnight guard, so the **Server tab rendered every assessment a day early in Eastern** — beside the local tab, which showed it correctly. Folded into v0.40.0 rather than given its own version.
- **Method note: every bug this session was reproduced before it was fixed.** The orphan heading, the day-early date, and the sync wipe were each demonstrated failing first — the sync bug only surfaced because the round-trip test asserted the stale-client case against the live server rather than assuming it.
- Committed as **three separate releases** (`5eb7a44`, `d6a3275`, `491989a`) and pushed. All three versions had edited `pdf.ts`, so intermediate states were reconstructed and **each commit was type-checked standalone in a throwaway worktree**; the rebuild from the committed source produces the same bundle hash as the file served in production.
- ~60 new automated checks (statistics, PDF layout, timezone behaviour across four zones, live sync round trip), plus migration 0011 confirmed on the live database — 18 assessments, 0 with a signed date, as intended.
- **OPEN:** none of tonight's work has been seen on an iPad — the meter data was real, the new report layout and the Edit Info field are desktop-verified only. `CLAUDE.md` drift is now cleared, but the three `formatDate` copies remain.

### 2026-08-18 (night) — Photo GPS Gate, Aerial Overscan, Centred Grid Cells (v0.34.0 → v0.37.0, DEPLOYED)

- **Photo GPS is now gated on accuracy (v0.34.0).** The URGENT item from the evening session, built: a fix is stored only when the device reports accuracy within **30 m** (`GPS_ACCURACY_LIMIT_M`, roughly a residential lot width — closer identifies the property, looser could name the neighbour's). A device reporting no accuracy figure, `NaN`, or `Infinity` is treated as a *failed* fix, not a good one. When a fix is kept, its accuracy is stored beside it in a new `gps_accuracy_m` field, so any coordinate in the database carries the number that justified keeping it. **Expect no geotags at all on the Wi-Fi-only iPads — that is the intended outcome.**
- **Found on the way: `photos.gps_lat`/`gps_lng` were `real`.** float4 holds ~7 significant digits; a latitude needs 9, so every coordinate would have been silently rounded by up to a metre — the same bug fixed for `light_surveys` in migration 0007, missed for photos. Widened to `double precision` in migration 0009. Lossless, confirmed against the live database first: **1,066 photos, 0 with GPS**, because geolocation never worked.
- **Aerial map lag was measured, not guessed (v0.35.0).** A 1200×900 request to the county server takes 0.72–0.96 s, of which **0.69–0.93 s is time to first byte** — the 115 KB transfers in ~30 ms. The wait is the server rendering on demand (`cacheType: None` on the 2024 imagery), so no client-side work could touch it; the request had to come off the gesture path. Cost model: **~0.2 s fixed + ~0.3 s per megapixel**, so 4× the pixels costs only ~2.4× the time — which is what makes a margin affordable.
  - The picker now fetches **twice the ground at twice the pixels** (feet-per-pixel unchanged) and displays the middle window. Centre and span became the only state, with the visible window derived from them, so a pan moves that window over pixels already held and a zoom resizes it — both pure arithmetic. The replacement is fetched behind an image that is still correct.
  - `cropView` hands the report exactly the framed window, so the wider fetch never makes the lot print smaller than it was framed.
- **v0.35.0 shipped a regression, reported from the field as the map "snapping back to the original spot" (fixed in v0.35.1).** When a drag targets ground outside the fetched image the window can only slide as far as the image goes — but the finger transform was dropped on lift, so the view sprang back, and against the edge it could not move at all. The pre-overscan code deliberately *held* that transform until the replacement arrived; that hold is restored, and a gesture now commits instantly only when the fetched image actually covers where it is going. Foreground fetches also skip the margin (~0.75 s against ~2.5 s), so a long drag is back to its old latency.
- **That chase surfaced a worse, pre-existing bug: a tap while a gesture was held landed in the wrong place, silently.** During the wait the picture is offset or scaled from where the coordinate maths puts it, so a corner could be placed hundreds of feet off with nothing looking wrong — the exact failure the picker exists to prevent. Now compensated. It predates overscan; the old code held the transform too.
  - **Lesson recorded: geometry assertions passed while the map was visibly broken.** What caught both bugs was measuring *the ground under the screen centre before and after each drag* in a real headless browser against the live county server — 120 px moves 90 ft, 520 px moves 390 ft, where the 520 px drag had moved 0 ft.
- **Grid geometry, two passes.** First (v0.36.0) the recommendation stopped chasing a target count of 82 readings blind and started preferring grids that divide the lot evenly. Then the real complaint surfaced — **half-width cells down two sides in Google Earth** — and the cause was the method itself: readings sat on grid *intersections* starting at the corner, so the outermost ones owned half a cell (the far sides looked normal because they absorbed the leftover strip), quietly giving edge readings half the weight in the average.
  - **v0.37.0 tiles the lot in identical squares and reads the centre of each**, which is what the photometric method does. Verified by reading cell polygons back out of generated KML: every cell 30 × 30 ft, no half cells anywhere.
  - Three deliberate consequences: **the walk now starts half a step in from the start corner** (15 ft at 30 ft spacing) and the on-screen guidance says so in feet; centre placement gives one fewer reading per axis, so holding the 50-reading floor moved the **Main lot from 40 ft / 12 × 5 / 60 readings to 30 ft / 14 × 5 / 70**; and the strip past the last whole cell is left unread rather than given a narrow cell, stated per option in the picker.
  - **Surveys already walked keep their geometry.** New `grid_origin` field ('center' / 'edge', absent = edge) records the layout a survey was built with and syncs both ways (migration 0010), because silently shifting an existing survey's points would misplace real readings.
- **SDL400 manual-mode file behaviour settled from the hardware, not the manual.** The manual documents new-file creation only for *automatic* logging, so a live test was run: exiting and re-entering manual mode **appends a second session to the same file** with a repeated header row, restarting at P1 (`Light Survey Resources/Meter Double Test.XLS`). So the meter can hold several lots a night — but the importer merges them, and **copying the file off does not reset the card**, so each lot's file must also be *deleted* from the card. Decided not to build a session picker (see To-Do).
- Six deploys, each verified in the served bundle plus a live-database check of every migration. ~3,100 automated checks across the night's suites; both workspaces type-check and build clean throughout (the two pre-existing `sync.ts:87` lint errors remain, on a line nothing touched).

### 2026-08-18 (evening) — HTTPS, Wi-Fi-Only iPads, County Aerial Corner Picker (v0.32.1 → v0.33.3, DEPLOYED)
- **Field testing on the iPad drove everything in this entry.** Three findings in sequence, each invalidating a previous assumption.
- **Google Earth Web does not run in iOS Safari.** The "Open Google Earth" button pointed the iPad at a page that cannot load; installing the Google Earth *app* is what worked. On iOS the app now offers only "Send the map to Google Earth" (share sheet) and says the app is required and that saving to Files just buries the file. Desktop keeps the two-step download → website flow. (v0.32.1)
- **Geolocation was blocked app-wide by the insecure origin.** The GPS button errored instantly with no permission prompt — not a GPS problem, a `http://` problem. Proven by the database: **1,066 photos, zero with GPS coordinates.** Photo geotagging had never worked in production.
  - Fixed by enabling tailnet HTTPS certificates and running `sudo tailscale serve --bg --https=443 http://localhost:80` **on the server** (first attempt configured the laptop instead — `serve` always configures the machine it runs on). Let's Encrypt cert, valid, auto-renewing, nothing exposed publicly. Old HTTP URL deliberately left running so devices can migrate at their own pace.
  - **Cert renewal is another silent timed dependency**, like the node-key expiry that caused the August outage: if the HTTPS URL fails months from now while HTTP still works, check the cert first.
- **The iPads are Wi-Fi-only, so they have no GNSS receiver at all.** Location comes from Wi-Fi lookup, and in the field they tether to a phone hotspot — a network with no fixed position in Apple's database. Accuracy was far too poor to place a corner, as predicted (150 ft short side, 15–30 ft error = 10–20% width error). The GPS button now displays the accuracy the browser reports and warns above 5 m rather than handing over a bad corner silently. (v0.32.2)
- **That killed the desk-only workaround too:** only one assessor has tailnet access from a PC. So corner-picking had to work on an iPad, without GPS.
- **Solution: tap the corners on Volusia County's own aerial imagery** (`maps5.vcgov.org`, public ArcGIS, no key/account/billing, CORS open). 3-inch orthoimagery flown Jan 2024 — the painted stall stripes are legible. The county geocoder resolves the assessment's stored address (scored 100 on real school addresses). A tap converts through the exact inverse of the server's projection, giving roughly **half a foot per pixel** — about two orders of magnitude better than the device fix. (v0.33.0)
  - **Imagery choice was a licensing decision as much as a technical one.** The picture is embedded in a report distributed to schools and property owners, which is redistribution; county imagery is public record and this is a county agency, so nothing needs licensing. Google/Esri terms would not permit it.
  - **Validated against ground truth:** the desk-plotted Main lot corners were overlaid on the real imagery and landed exactly on the lot, with all 90 grid points on pavement.
  - Known imprecision, documented in code: EPSG:3857 is spherical while `light-geo` is ellipsoidal, so a view requested as 600 ft is really 600 ± 3 ft. **Corner accuracy is unaffected** — only a scale-bar reading.
- **The grid is now drawn onto that imagery in-app for the report**, retiring the export-KML → Google Earth → screenshot → upload round trip that cost most of an afternoon to debug. New `aerial_credit` field (schema, migration 0008, sync both ways) carries attribution with the image so the report credits whichever source produced it. The manual screenshot upload survives as a fallback.
- **Gesture work (v0.33.1–v0.33.3):** drag and pinch now transform the image live and hold position until the sharp replacement arrives. Two distinct snap-back bugs fixed — zoom cleared its scale *before* fetching, and pan committed the new image one render before clearing the offset. Pinch zooms about the pinched point rather than recentring on it, so a corner near the screen edge does not get yanked to the middle.
- **KML export kept**, now with two flavours: a planning copy numbering every point (labels stripped of the pointless "— no reading") and a readings copy labelling only the darkest five.
- **Deferred deliberately:** ~0.5 s lag remains on each gesture while the county server renders. Overscan or neighbour-prefetch is the next lever; judged good enough for a v1 field pass.
- Verified with 49 new automated checks (projection round trips, zoom arithmetic, focus-preserving zoom) on top of the existing suites; client and server type-check, lint, and build clean; migration 0008 confirmed applied on the live database.

### 2026-08-18 (later) — Light-Survey Server Sync (v0.32.0, DEPLOYED)
- **Light surveys now reach the server**, which is what makes desk-plotted grids usable in the field — the gap that prompted it: "otherwise there's no point plotting on desktop if I can't use it".
- **Two new Postgres tables** (`light_surveys`, `light_readings`), both cascading from the assessment. Migrations `0006` (create) and `0007` (coordinates to double precision). `CREATE TABLE IF NOT EXISTS` only — no existing table is altered.
- **Carried on the existing `/api/sync` payload** rather than new endpoints: a survey belongs to exactly one assessment, the records are small, and "Sync" keeps meaning one thing. `GET /api/assessments/:id` returns both arrays. The aerial screenshot goes inline (one per lot), unlike checklist photos which earned a separate upload path.
- **Caught in review before testing: `real` is the wrong type for a coordinate.** float4 holds ~7 significant digits, a latitude needs 9, so `29.2668112` would have been silently rounded by up to a metre — on the order of the map accuracy the whole three-corner method depends on, and it would have shifted every derived grid point. Fixed to `double precision` in migration 0007; the round-trip test now asserts exact equality, not approximate.
- **Date-only fields (`surveyed_at`, `meter_calibrated_on`) are stored as text, deliberately.** Putting a date-only value through a timestamp column round-trips it as UTC midnight, which renders as the previous day in Eastern — the same footgun behind the v0.24.1 and v0.24.2 report-date bugs. Asserted in the test.
- **Deletion is guarded in both directions.** The server clears its copy only when the client actually sends a `light_surveys` key (an older PWA omits it entirely, and treating that as "delete" would wipe surveys because one iPad hadn't updated); the client clears its copy only when the server actually returns the key (mirror image). Both are covered by tests.
- **Verified against the live server** with a throwaway assessment: push → pull → field-by-field compare (corners exact to the digit, skip list, aerial image, all 90 readings, meter place) → re-push for idempotency → an old-client push that must not wipe → cascade delete. 42 checks, all passing, and the database was confirmed back to 17 assessments / 0 surveys afterwards.
- Local Docker needs sudo on the `work` PC, so there was no local Postgres to test against first — hence testing against production with a self-cleaning record.

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

