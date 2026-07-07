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

**v0.29.1 deployed + committed/pushed (`d478da8`).** Latest change: the old liability waiver was replaced app-wide (PDF all types + on-screen Summary) with the **legal-advisor-approved disclaimer** — source of truth `CPTED Approve Disclaimer.docx` (repo root, committed) and the "Liability Waiver / Disclaimer" section below. Two paragraphs; render paths handle the break.

School assessments use a **Yes/No/UTO checklist rating** instead of the 1-5 scale (team trained on the National Institute of Crime Prevention school survey: `files(1)/CPTED SCHOOL EVAL.docx`). Schools-only, gated on `isSchoolType()`; all other property types keep 1-5 untouched. Plus a full **PDF report redesign** (applies to all types): formal centered cover (star badge + "Volusia Sheriff's Office" / "Domestic Security Unit" masthead + "Crime Prevention Through Environmental Design Report" + property name/address, navy top/bottom bands, vertically centered between bands, no footer), an "Understanding CPTED" intro page, a page-numbered Table of Contents (numbering starts at the TOC), a red "CONFIDENTIAL" header on every page, and a fixed footer "CPTED Report - Volusia Sheriff's Office". School reports: no aggregate score, recommendations driven by "No" items (uncapped, no auto-generate, single High-Priority toggle), Confidentiality-of-Report section folded onto the waiver page. New star badge logo at `public/logos/volusia_sheriff_badge_star.png`.

**Remaining items / To-Do:**
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

