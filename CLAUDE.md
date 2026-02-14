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
│   │   └── zones.ts              # Zone/checklist definitions (SOURCE OF TRUTH)
│   ├── db/
│   │   └── database.ts           # Dexie.js setup and schema
│   ├── types/
│   │   └── index.ts              # TypeScript interfaces
│   ├── pages/
│   │   ├── Home.tsx              # Assessment list
│   │   ├── NewAssessment.tsx     # Assessment info form
│   │   ├── Assessment.tsx        # Zone navigator (main working screen)
│   │   └── Summary.tsx           # Overall summary + report generation
│   ├── components/
│   │   ├── ZoneSidebar.tsx       # Zone nav with completion indicators
│   │   ├── ZoneView.tsx          # Active zone display
│   │   ├── PrincipleSection.tsx  # Collapsible principle with items
│   │   ├── ChecklistItem.tsx     # Single item: score buttons + photo + notes
│   │   ├── ScoreButtons.tsx      # [1][2][3][4][5][N/A] tap targets
│   │   ├── PhotoCapture.tsx      # Camera integration
│   │   ├── PhotoThumbnail.tsx    # Inline photo display
│   │   └── ZoneSummary.tsx       # Per-zone score summary box
│   ├── services/
│   │   ├── scoring.ts            # Score calculation logic
│   │   ├── pdf.ts                # PDF report generation
│   │   └── photos.ts            # Photo capture, compression, storage
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

## Assessment Zones (7 total, 141 checklist items)

| # | Zone Key | Zone Name | Principles |
|---|----------|-----------|------------|
| 1 | `street_approach` | Street Approach & Address Visibility | Natural Surveillance, Access Control, Territorial Reinforcement, Maintenance & Image |
| 2 | `front_yard` | Front Yard & Primary Entry | Natural Surveillance, Access Control, Territorial Reinforcement, Maintenance & Image |
| 3 | `side_yards` | Side Yards & Pathways | Natural Surveillance, Access Control, Territorial Reinforcement, Maintenance & Image |
| 4 | `rear_yard` | Rear Yard & Back Entry | Natural Surveillance, Access Control, Territorial Reinforcement, Maintenance & Image |
| 5 | `garage_driveway` | Garage & Driveway | Natural Surveillance, Access Control, Territorial Reinforcement, Maintenance & Image |
| 6 | `exterior_lighting` | Exterior Lighting | Natural Surveillance (Lighting Quality), Lighting Controls & Technology, Fixture Types & Glare Assessment, Maintenance & Image |
| 7 | `windows_interior` | Windows & Interior Considerations | Natural Surveillance, Access Control, Security Systems & Technology, Behavioral & Routine Considerations |

The full checklist item text lives in `src/data/zones.ts` and must match the CPTED_Residential_Assessment_Checklist.docx exactly.

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

1. `zones.ts` is the **source of truth** for all checklist content
2. Scoring is **1-5** (not 0-5) — no zero score exists
3. **N/A items excluded** from all score calculations
4. Photos stored as **base64 data URL strings** in IndexedDB (NOT Blobs — Safari detaches Blob data from IndexedDB, making it unreadable)
5. PDF must include the **liability waiver verbatim** (see project plan)
6. PWA manifest app name: **"CPTED Assessor"**
7. `property_type` only implements `single_family_residential` for now — design UI to be expandable
8. Timestamps: **local time for display**, stored as **ISO 8601 UTC** internally
9. Photo capture should auto-grab **GPS coordinates and timestamp** from device

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

## Current Status

**Phase 2 backend deployed. PDF report polished with 7 visual improvements.** Photo storage migrated from Blob to base64 data URLs to fix Safari IndexedDB bug. Known bug: auto-generate recommendations button broken. Redeploy with `./deploy.sh`.

Git repo initialized. Remote: `https://github.com/Jedigo/CPTED-App.git` (branch: `main`)

## Session Log

### 2026-02-12 — Project Setup
- Created CLAUDE.md, `/close-session` global command
- Completed Step 1: Vite + React 19 + TS + Tailwind v4 + PWA scaffolding
- All 4 routes wired, TypeScript types defined, iPad CSS in place, clean build passing

### 2026-02-12 — Steps 2–5
- Step 2: zones.ts with all 7 zones, 141 checklist items
- Step 3: Dexie.js database schema (assessments, zone_scores, item_scores, photos)
- Step 4: NewAssessment form with property/assessor details
- Step 5: Zone navigator — ScoreButtons, ChecklistItem, PrincipleSection, ZoneSummary, ZoneView, ZoneSidebar, Assessment page
- Git repo initialized and pushed to GitHub

### 2026-02-14 — Steps 10–12: MVP Complete + PDF Redesign
- Step 10: Verified SW registration + precaching (12 entries), added online/offline indicator to all page headers via `useOnlineStatus` hook
- Step 11: Full Home screen rewrite — assessment list with live queries, filter tabs (All/In Progress/Completed), progress bars, delete with ConfirmDialog modal, Mark Complete/Reopen from card footer
- Step 12: Loading spinners, portrait-responsive sidebar with hamburger toggle, touch feedback (`active:scale`), `aria-label` on icon buttons, `focus-visible` styles
- PDF report redesigned for residents: replaced assessor instructions with resident-friendly zone descriptions, grouped findings as Areas Requiring Attention (1-2) / Meets Basic Standards (3, summarized) / Positive Observations (4-5)
- Score-3 items no longer listed individually unless ≤3 or has assessor notes — shows summary count instead
- Added auto-generate recommendations: analyzes scores to pick top 5 issues and quick wins by severity/principle, editable after generation
- Zone 7 "Next Zone" replaced with "Go to Summary" button
- Fixed PDF bug: item matching used `item_order` (global per zone) instead of `item_text`, causing dashes for all principles after the first
- Created `/close-session` global skill at `~/.claude/skills/close-session/SKILL.md`
- Next: PDF report visual polish (see `~/.claude/projects/.../memory/todo.md`)

### 2026-02-14 — Phase 2 Backend: Build + Deploy
- **All 8 steps implemented:** server scaffolding, DB schema, CRUD, photo upload, sync, server-side PDF, frontend sync UI, Docker + deploy
- Server: Express 5 + TypeScript + Drizzle ORM + PostgreSQL 16, all in `server/` directory
- DB: 5 tables (assessments, zone_scores, item_scores, photos, recommendations) with CASCADE deletes, auto-migrate on startup
- Sync: `POST /api/sync` upserts full payload in a Drizzle transaction, recalculates scores; photos uploaded separately via multipart
- Frontend: new `sync.ts` service, "Sync to Server" button on Summary page, "Synced" status badge on Home cards
- Deploy: `docker-compose.yml` (postgres:16-alpine + Node.js app + nginx:alpine), `deploy.sh` (build locally → rsync → docker compose up)
- Deployed to `cpted-server` VM (Ubuntu 24.04, Tailscale 10.21.1.138) at `~/cpted-app/`
- Fixed: `state` column widened from varchar(2) to varchar(50), sync transaction rewritten to use Drizzle `db.transaction()` instead of manual BEGIN/COMMIT on pool client
- Verified iPad → Tailscale → server sync end-to-end
- Next: commit Phase 2 code, test server-side PDF download, photo sync from iPad

### 2026-02-14 — PDF Report Polish + Photo Storage Fix
- **7 PDF visual improvements** applied to both client (`cpted-assessor/src/services/pdf.ts`) and server (`server/src/services/pdf.ts`):
  1. Removed score legend table from resident-facing report
  2. Added auto-generated executive summary paragraph
  3. Added zone score color bars (horizontal bar chart)
  4. Improved score-3 section → "Opportunities for Enhancement" with intro text, 3-bullet cap
  5. Improved positive observations → grouped by Excellent/Good, inline notes
  6. Photos now 2-per-row with checklist item text captions (no GPS)
  7. Visual polish — accent lines, section dividers, better spacing
- **Fixed Safari IndexedDB Blob bug**: Photos stored as Blobs became unreadable on iPad Safari (FileReader, arrayBuffer(), and createObjectURL+fetch all failed). Migrated photo storage from `blob: Blob` to `data: string` (base64 data URL) — `canvas.toDataURL()` at capture time, stored directly in IndexedDB
- Updated Photo type, `compressImage()`, `savePhoto()`, `PhotoThumbnail`, `PhotoViewer`, `sync.ts`, and `pdf.ts` to use new format with legacy Blob fallback
- Added version indicator (`v0.6.1`) to Home screen footer
- Versions: `cpted-assessor` 0.6.1, `server` 0.1.1
- **Known bug:** Auto-generate recommendations button on Summary page is broken
- Next: fix recommendations bug, add server-side report storage for cross-device access
