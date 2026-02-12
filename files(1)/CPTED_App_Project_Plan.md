# CPTED Assessment App — Project Plan & Claude Code Handoff

## Project Overview

Build a **Progressive Web App (PWA)** for conducting CPTED (Crime Prevention Through Environmental Design) residential site assessments on an iPad. The app replaces clipboard + camera + notebook with a guided digital walkthrough that scores checklist items, captures photos, and generates professional PDF reports.

**Phase 1 (MVP):** Frontend-only PWA with offline storage and PDF export
**Phase 2 (Future):** Backend API + PostgreSQL on Proxmox for sync, archival, and multi-device support

---

## Target Platform & Deployment

- **Primary device:** iPad (Safari / home screen PWA)
- **Must work fully offline** — all data stored locally in IndexedDB until sync is available
- **Phase 1 hosting:** Static files served from any web server (or even localhost for testing)
- **Phase 2 hosting:** Docker containers on Proxmox home server (Node.js API + PostgreSQL + Nginx reverse proxy)

---

## Tech Stack

### Frontend (Phase 1 — MVP)
- **React 18+** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling (mobile-first, iPad-optimized)
- **Dexie.js** — IndexedDB wrapper for offline data persistence
- **Workbox** — Service Worker for offline app shell caching
- **jsPDF + html2canvas** OR **@react-pdf/renderer** — client-side PDF generation
- **PWA manifest** — home screen install, splash screen, icons

### Backend (Phase 2 — Future, but schema designed now)
- **Node.js + Express** API
- **PostgreSQL** database
- **Docker + Docker Compose** on Proxmox
- **Nginx** reverse proxy with SSL
- **MinIO or local disk** for photo storage
- **Puppeteer** for server-side PDF generation (higher quality)

---

## Data Model / Schema

Design this now so the IndexedDB structure mirrors the future PostgreSQL schema. All IDs use UUIDs.

### Tables / Object Stores

```
assessments
├── id: UUID (primary key)
├── created_at: timestamp
├── updated_at: timestamp
├── status: enum ['in_progress', 'completed', 'synced']
├── property_type: enum ['single_family_residential']  // expandable later
├── address: string
├── city: string
├── state: string
├── zip: string
├── homeowner_name: string
├── homeowner_contact: string (phone/email)
├── assessor_name: string
├── assessor_badge_id: string (optional)
├── assessment_type: enum ['initial', 'follow_up', 're_assessment']
├── weather_conditions: string
├── time_of_assessment: enum ['daytime', 'nighttime', 'both']
├── date_of_assessment: date
├── overall_score: float (calculated)
├── top_recommendations: JSON array (see structure below)
├── quick_wins: JSON array (see structure below)
├── notes: text (general assessment notes)
└── synced_at: timestamp (null until synced)

zone_scores
├── id: UUID
├── assessment_id: UUID (foreign key)
├── zone_key: string (e.g., 'street_approach', 'front_yard', etc.)
├── zone_name: string
├── zone_order: integer (1-7)
├── average_score: float (calculated)
├── priority_findings: text
├── notes: text
└── completed: boolean

item_scores
├── id: UUID
├── assessment_id: UUID (foreign key)
├── zone_key: string
├── principle: string (e.g., 'natural_surveillance', 'access_control', etc.)
├── item_text: string
├── item_order: integer
├── score: integer (1-5) or null
├── is_na: boolean (default false)
├── notes: text
└── photo_ids: JSON array of UUID references

photos
├── id: UUID
├── assessment_id: UUID (foreign key)
├── item_score_id: UUID (foreign key, nullable — can be general zone photo)
├── zone_key: string
├── captured_at: timestamp
├── blob: Blob (stored in IndexedDB for Phase 1)
├── filename: string
├── mime_type: string
├── gps_lat: float (optional, from device)
├── gps_lng: float (optional, from device)
├── compass_heading: float (optional)
├── annotation_data: JSON (optional — for future drawn annotations)
└── synced: boolean

recommendations (embedded as JSON in assessments for Phase 1, separate table Phase 2)
├── id: UUID
├── assessment_id: UUID
├── order: integer (1-5)
├── description: text
├── priority: enum ['high', 'medium', 'low']
├── timeline: string
└── type: enum ['recommendation', 'quick_win']
```

### Zone Keys & Definitions

These map directly to the checklist document:

```javascript
const ZONES = [
  {
    key: 'street_approach',
    name: 'Street Approach & Address Visibility',
    order: 1,
    description: 'Assess the property as you approach from the street, simulating the perspective of both a visitor and a potential offender.',
    principles: [
      {
        key: 'natural_surveillance',
        name: 'Natural Surveillance',
        items: [
          'Clear, unobstructed sight line from the street to the front door',
          'Front windows of the home provide views of the street and front yard',
          'No large visual barriers (walls, hedges, structures) blocking the view from the street to the home',
          'Neighboring properties have sight lines to the subject property',
          'Street-facing rooms are habitable spaces (living room, kitchen) rather than storage or bathrooms',
        ]
      },
      {
        key: 'access_control',
        name: 'Natural Access Control',
        items: [
          'Clearly defined driveway/walkway directs visitors to the front entry',
          'No ambiguous or multiple informal paths leading to the property',
          'Sidewalk and approach are in good condition and clearly routed',
        ]
      },
      {
        key: 'territorial_reinforcement',
        name: 'Territorial Reinforcement',
        items: [
          'Property boundaries visible and identifiable from the street (fencing, landscaping, grade changes, or other markers)',
          'House number clearly visible from the street (minimum 4" tall, contrasting color)',
          'House number visible at night (illuminated or reflective)',
          'Mailbox in good condition and appropriately located',
          'Front property conveys a "cared-for" and "occupied" appearance from the street',
        ]
      },
      {
        key: 'maintenance',
        name: 'Maintenance & Image',
        items: [
          'Street frontage is clean and free of debris, abandoned items, or clutter',
          'Curb, gutter, and sidewalk in good repair',
          'No graffiti, vandalism, or signs of neglect visible from the street',
          'Trash/recycling containers stored out of view when not in use',
        ]
      }
    ]
  },
  {
    key: 'front_yard',
    name: 'Front Yard & Primary Entry',
    order: 2,
    description: 'Evaluate the front yard landscaping, porch/entry area, and the main point of entry to the home.',
    principles: [
      {
        key: 'natural_surveillance',
        name: 'Natural Surveillance',
        items: [
          'Shrubs/bushes trimmed to no higher than 2 feet — the "2-foot rule"',
          'Tree canopies raised to at least 6 feet from ground — the "6-foot rule" (clear sight line between 2\' and 6\')',
          'No dense vegetation or structures creating concealment spots near the entry',
          'Front porch/entry area visible from the street and from neighboring properties',
          'Porch or entry alcove does not create deep shadows or hidden recesses',
          'Doorbell camera or peephole/door viewer present and at accessible height(s)',
        ]
      },
      {
        key: 'access_control',
        name: 'Natural Access Control',
        items: [
          'Front door is solid core hardwood or metal (not hollow core)',
          'Deadbolt installed with minimum 1" throw and 3" screws in strike plate',
          'Door frame is solid and in good condition (no rot, no gaps)',
          'Glass panels in or near door are reinforced or have security film',
          'Locks changed since current occupant moved in',
          'No spare keys hidden in obvious locations (under mat, planter, ledge)',
          'Hinge pins on exterior doors are non-removable or pinned',
          'Front entry well-defined with walkway, steps, or architectural features that guide visitors',
        ]
      },
      {
        key: 'territorial_reinforcement',
        name: 'Territorial Reinforcement',
        items: [
          'Front yard landscaping demonstrates active ownership and care',
          'Welcome mat, planter, or porch furnishings indicate occupancy',
          'Property line between front yard and public space/neighbor is clearly delineated',
          'Hostile/defensive landscaping (thorny plants) used under vulnerable windows if applicable',
        ]
      },
      {
        key: 'maintenance',
        name: 'Maintenance & Image',
        items: [
          'Lawn maintained and free of overgrown areas',
          'Walkway, steps, and porch in good structural condition',
          'Paint/siding in good condition (no peeling, fading, or damage)',
          'Doorbell/intercom functioning properly',
          'Door hardware (knob, lock, hinges) in good working condition',
        ]
      }
    ]
  },
  {
    key: 'side_yards',
    name: 'Side Yards & Pathways',
    order: 3,
    description: 'Walk both sides of the property. Side yards are common vulnerability areas — they connect the more visible front to the more private rear and are often neglected.',
    principles: [
      {
        key: 'natural_surveillance',
        name: 'Natural Surveillance',
        items: [
          'Side yards visible from at least one neighboring property',
          'No tall privacy fencing that blocks all sight lines from neighbors (consider semi-open designs)',
          'Vegetation along side yards follows the 2\'/6\' rule',
          'Windows on the side of the home are not fully obscured by vegetation or structures',
          'No concealment opportunities between structures (AC units, sheds, fences)',
        ]
      },
      {
        key: 'access_control',
        name: 'Natural Access Control',
        items: [
          'Side yard gates present and in working condition with latching hardware',
          'Gates are locked or have self-closing/self-latching mechanisms',
          'No easy-climb features along side fencing (trellises, stored items, compost bins)',
          'Side entry doors (if any) secured to the same standard as the front door',
          'Pathways along the side are defined and purposeful (not just open gaps)',
        ]
      },
      {
        key: 'territorial_reinforcement',
        name: 'Territorial Reinforcement',
        items: [
          'Side property lines clearly marked or fenced',
          'No ambiguity about where one property ends and the neighbor\'s begins',
          'Side yard conveys ownership (maintained, not abandoned/overgrown)',
        ]
      },
      {
        key: 'maintenance',
        name: 'Maintenance & Image',
        items: [
          'Side yards free of stored junk, debris, or unused items',
          'Fencing in good repair (no leaning, broken slats, or gaps)',
          'AC unit, utility meters, and utility boxes in good condition and not creating concealment',
          'Drainage/grading adequate (standing water can indicate neglect)',
        ]
      }
    ]
  },
  {
    key: 'rear_yard',
    name: 'Rear Yard & Back Entry',
    order: 4,
    description: 'The rear of the home is typically the least observed area and most common point of forced entry. Assess carefully.',
    principles: [
      {
        key: 'natural_surveillance',
        name: 'Natural Surveillance',
        items: [
          'Rear yard at least partially visible from one or more neighboring properties',
          'Rear-facing windows provide views of the back yard from inside the home',
          'No dense vegetation creating concealment along the rear of the home',
          'Outbuildings (sheds, detached garages) do not create blind spots near the home',
          'Rear yard is not fully enclosed by tall solid privacy fencing with zero visibility',
          'If pool or play area present, it is visible from inside the home',
        ]
      },
      {
        key: 'access_control',
        name: 'Natural Access Control',
        items: [
          'Rear entry door is solid core with deadbolt (same standard as front)',
          'Sliding glass doors have secondary security (dowel/pin in track, security bar, foot lock)',
          'Sliding doors cannot be lifted off track',
          'Rear windows have working locks and are reinforced if ground-accessible',
          'Rear fence/gate is secured with quality lock (not just a flip latch)',
          'No easy access from adjacent properties, alleys, or common areas to the rear yard',
          'Dog doors (if present) are not large enough for human entry or have locking covers',
        ]
      },
      {
        key: 'territorial_reinforcement',
        name: 'Territorial Reinforcement',
        items: [
          'Rear property boundaries clearly defined',
          'Rear yard demonstrates active use and ownership',
          'Any alley-facing boundaries have enhanced territorial markers',
        ]
      },
      {
        key: 'maintenance',
        name: 'Maintenance & Image',
        items: [
          'Rear yard maintained (lawn, landscaping, hardscape)',
          'Rear fencing in good repair with no gaps or compromised sections',
          'Outbuildings secured and maintained',
          'No ladder, tools, or items stored outside that could assist a burglar',
          'Patio furniture and valuables secured or not visible from outside the fence',
        ]
      }
    ]
  },
  {
    key: 'garage_driveway',
    name: 'Garage & Driveway',
    order: 5,
    description: 'Assess vehicle access, storage security, and the transition area between the garage/driveway and the home interior.',
    principles: [
      {
        key: 'natural_surveillance',
        name: 'Natural Surveillance',
        items: [
          'Driveway visible from the street and from inside the home',
          'Garage does not create blind spots or hidden areas adjacent to the home',
          'Vehicles parked in driveway do not block sight lines to the front entry',
          'Garage windows (if any) allow interior visibility but are secured',
        ]
      },
      {
        key: 'access_control',
        name: 'Natural Access Control',
        items: [
          'Interior door from garage to home is solid core with deadbolt',
          'Overhead garage door has a manual lock (not relying solely on opener)',
          'Garage door opener uses rolling code technology (not fixed code)',
          'Garage door kept closed and locked when not in active use',
          'Emergency release cord is secured against "coat hanger" manipulation',
          'Garage remote not left visible in vehicles parked outside',
        ]
      },
      {
        key: 'territorial_reinforcement',
        name: 'Territorial Reinforcement',
        items: [
          'Driveway clearly defined and directs only to the subject property',
          'Carport or garage conveys active use and ownership',
        ]
      },
      {
        key: 'maintenance',
        name: 'Maintenance & Image',
        items: [
          'Garage door in good working condition',
          'Driveway surface in good condition (no large cracks, heaving, or deterioration)',
          'Garage interior organized (cluttered garages indicate items to steal and make break-in detection harder)',
          'No high-value items visible through garage windows or open door',
        ]
      }
    ]
  },
  {
    key: 'exterior_lighting',
    name: 'Exterior Lighting',
    order: 6,
    description: 'Evaluate all exterior lighting. Ideally conduct a nighttime assessment or note fixture types/placement for expected coverage. Consistent, adequate lighting is one of the most impactful CPTED measures for residential properties.',
    principles: [
      {
        key: 'natural_surveillance',
        name: 'Natural Surveillance (Lighting Quality)',
        items: [
          'Front entry/porch has a bright, working light that illuminates visitors\' faces',
          'All exterior doors have dedicated lighting fixtures',
          'Driveway and walkway to front door are illuminated',
          'Side yards have some form of lighting (motion-activated recommended)',
          'Rear yard/patio has lighting at entry points',
          'Garage area is illuminated (both interior and exterior)',
          'No dark "dead zones" around the perimeter of the home',
          'Lighting is consistent — no extreme bright/dark contrast creating blinding spots or deep shadow zones',
        ]
      },
      {
        key: 'lighting_controls',
        name: 'Lighting Controls & Technology',
        items: [
          'Exterior lights on photocell (dusk-to-dawn) or timer — not solely manual',
          'Motion-activated lights installed at side yards, rear entry, and/or garage',
          'Interior lights on timers to simulate occupancy when away',
          'Light fixtures are mounted high enough to prevent easy tampering/removal',
          'Light fixtures are vandal-resistant or tamper-proof design',
          'Light fixtures use LED bulbs (preferred for efficiency, longevity, and consistent color temperature)',
        ]
      },
      {
        key: 'fixture_glare',
        name: 'Fixture Types & Glare Assessment',
        items: [
          'Fixture types are appropriate for their location (wall packs, bollards, recessed, flood, post-mount, etc.)',
          'Fixtures provide even light distribution without harsh hot spots or pooling',
          'No excessive glare from unshielded fixtures that could blind or disorient approaching persons',
          'Fixtures are full-cutoff or shielded design to direct light downward and reduce light trespass',
          'Flood lights (if present) are aimed properly and do not wash out visibility of approaching persons',
          'Color temperature is appropriate (warm white 2700–3000K for residential; avoid cool/blue tones that distort facial recognition)',
          'Fixture placement avoids backlighting that silhouettes residents while illuminating an intruder\'s approach',
        ]
      },
      {
        key: 'maintenance',
        name: 'Maintenance & Image',
        items: [
          'All exterior light fixtures functioning (no burned-out bulbs)',
          'Light fixtures clean and free of insect/debris buildup',
          'No landscaping growth obstructing light fixtures or blocking light output',
          'Wiring and fixtures in safe, good condition',
        ]
      }
    ]
  },
  {
    key: 'windows_interior',
    name: 'Windows & Interior Considerations',
    order: 7,
    description: 'Evaluate all accessible windows and relevant interior security features that affect CPTED principles.',
    principles: [
      {
        key: 'natural_surveillance',
        name: 'Natural Surveillance',
        items: [
          'Windows in high-use rooms (living room, kitchen) face the street or yard areas',
          'Window treatments allow occupants to observe outside (not permanently blocked/covered)',
          'No exterior features (awnings, shutters, film) that completely prevent inside-out visibility',
          'Security cameras or video doorbell installed and operational (if applicable)',
        ]
      },
      {
        key: 'access_control',
        name: 'Natural Access Control',
        items: [
          'Every window has a working lock in good condition',
          'Windows are locked even when opened slightly for ventilation (pin or secondary lock)',
          'Ground-floor windows have security film or reinforced glass where appropriate',
          'Window screens in good repair and not easily removable from outside',
          'Dowel or pin reinforcement in sliding windows',
          'No window AC units that could be pushed in for entry',
          'Second-story windows not accessible via adjacent structures, trees, or climbing aids',
        ]
      },
      {
        key: 'security_systems',
        name: 'Security Systems & Technology',
        items: [
          'Alarm/security system installed and in working order (if applicable)',
          'Alarm system activated when residents leave and at night',
          'Security signage/stickers displayed (even if no active system — discuss with resident)',
          'Smart home security features (doorbell camera, window/door sensors) operational',
          'Security camera positions provide useful coverage without excessive blind spots',
        ]
      },
      {
        key: 'behavioral',
        name: 'Behavioral & Routine Considerations',
        items: [
          'Mail and packages do not accumulate visibly when residents are away',
          'Arrangements exist for mail/newspaper hold or neighbor pickup during extended absence',
          'Valuable items not visible through windows from outside',
          'Firearms (if present) stored securely — unloaded, locked, with trigger guard',
          'Serial numbers of valuables recorded and stored securely',
          'Residents aware of neighborhood watch or community notification programs',
        ]
      }
    ]
  }
];
```

---

## Scoring System

| Score | Label | Description |
|-------|-------|-------------|
| 1 | Critical | Immediate action required — significant vulnerability |
| 2 | Deficient | Notable concern — should be addressed promptly |
| 3 | Adequate | Meets basic standard but could be improved |
| 4 | Good | Above average — minor improvements possible |
| 5 | Excellent | Best practice standard met |
| N/A | Not Applicable | Item does not apply to this property |

### Score Calculations
- **Item score:** 1-5 integer or N/A (excluded from calculations)
- **Principle score:** Average of scored items within that principle for a zone
- **Zone score:** Average of all scored items within the zone
- **Overall score:** Average of all zone scores (not weighted — equal zones)

---

## UI/UX Design Requirements

### General
- **iPad-optimized** — landscape and portrait support, but design primarily for landscape use in the field
- **Large touch targets** — minimum 44px tap areas, score buttons should be prominent and easy to hit
- **Dark navy (#1B3A5C) and light blue (#D6E8F5) color scheme** — matches the report branding
- **Minimal typing required** — tap-based scoring, optional text notes, photo capture via device camera

### Screen Flow

```
Home Screen (Assessment List)
├── [+ New Assessment] → Assessment Info Form
├── [Existing Assessment] → Zone Navigator
│
Assessment Info Form
├── Address, homeowner, assessor info, date, conditions
├── [Start Assessment] → Zone Navigator
│
Zone Navigator (main working screen)
├── Zone sidebar/tabs (1-7) with completion indicators
├── Active zone shows:
│   ├── Zone description
│   ├── Principle sections (collapsible)
│   │   ├── Item text
│   │   ├── Score buttons [1] [2] [3] [4] [5] [N/A]
│   │   ├── [📷 Photo] button → camera capture
│   │   ├── [📝 Note] button → text input (expandable)
│   │   └── Photo thumbnails (if attached)
│   └── Zone Summary box (auto-calculated score, priority findings text area)
├── [← Previous Zone] [Next Zone →]
│
Assessment Summary Screen
├── Score table by zone (auto-filled)
├── Top 5 Recommendations (text + priority + timeline)
├── Quick Wins (text list)
├── Liability waiver (pre-filled, read-only)
├── [Generate PDF Report] → downloads/shares PDF
├── [Mark Complete]
```

### Photo Capture
- Use device camera API (`navigator.mediaDevices` or `<input type="file" capture="environment">`)
- Auto-capture GPS coordinates and timestamp
- Store as compressed JPEG blobs in IndexedDB
- Show thumbnails inline next to the item they're attached to
- Allow deleting photos before report generation

### PDF Report
- Match the format of the CPTED_Residential_Assessment_Checklist.docx we already created
- Include: cover page with assessment info, scoring legend, zone-by-zone tables with scores and notes, photos embedded in relevant sections, overall summary, recommendations, quick wins, liability waiver, assessor certification
- Generate client-side using jsPDF or @react-pdf/renderer
- Share via iPad share sheet or download

---

## Offline Architecture (Phase 1)

```
┌─────────────────────────────────────┐
│           iPad (Safari PWA)          │
│                                      │
│  React App ──→ Dexie.js ──→ IndexedDB│
│      │                                │
│  Service Worker (Workbox)            │
│      │                                │
│  Camera API ──→ Photo Blobs          │
│      │                                │
│  PDF Generator ──→ Download/Share    │
└─────────────────────────────────────┘

No server needed for Phase 1.
All data lives on-device.
```

### IndexedDB Stores (Dexie.js)
```javascript
const db = new Dexie('CPTEDAssessments');
db.version(1).stores({
  assessments: 'id, status, created_at, address',
  zone_scores: 'id, assessment_id, zone_key',
  item_scores: 'id, assessment_id, [zone_key+principle]',
  photos: 'id, assessment_id, item_score_id, zone_key',
});
```

---

## Phase 2 Backend (Future — Schema Ready)

### Docker Compose Structure
```yaml
services:
  app:
    build: ./api
    ports: ["3001:3001"]
    depends_on: [db]
  db:
    image: postgres:16
    volumes: ["pgdata:/var/lib/postgresql/data"]
  nginx:
    image: nginx:alpine
    ports: ["443:443", "80:80"]
volumes:
  pgdata:
```

### Sync Strategy
- On network availability, push completed assessments to server
- Conflict resolution: last-write-wins (single user for now)
- Photos upload in background after assessment data syncs
- Server stores canonical copy; device keeps local cache

### API Endpoints (Planned)
```
POST   /api/assessments              — create new assessment
GET    /api/assessments              — list all assessments
GET    /api/assessments/:id          — get full assessment with scores
PUT    /api/assessments/:id          — update assessment
DELETE /api/assessments/:id          — delete assessment
POST   /api/assessments/:id/photos   — upload photo
GET    /api/assessments/:id/report   — generate PDF server-side
POST   /api/sync                     — bulk sync from device
```

---

## Project Structure

```
cpted-assessor/
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── sw.js                  # Service worker (Workbox)
│   ├── icons/                 # App icons (multiple sizes)
│   └── index.html
├── src/
│   ├── main.tsx               # App entry point
│   ├── App.tsx                # Router setup
│   ├── data/
│   │   └── zones.ts           # Zone/checklist definitions (from schema above)
│   ├── db/
│   │   └── database.ts        # Dexie.js setup and schema
│   ├── types/
│   │   └── index.ts           # TypeScript interfaces
│   ├── pages/
│   │   ├── Home.tsx            # Assessment list
│   │   ├── NewAssessment.tsx   # Assessment info form
│   │   ├── Assessment.tsx      # Zone navigator (main working screen)
│   │   └── Summary.tsx         # Overall summary + report generation
│   ├── components/
│   │   ├── ZoneSidebar.tsx     # Zone navigation with completion indicators
│   │   ├── ZoneView.tsx        # Active zone display
│   │   ├── PrincipleSection.tsx # Collapsible principle with items
│   │   ├── ChecklistItem.tsx   # Single item with score buttons + photo + notes
│   │   ├── ScoreButtons.tsx    # [1][2][3][4][5][N/A] tap targets
│   │   ├── PhotoCapture.tsx    # Camera integration
│   │   ├── PhotoThumbnail.tsx  # Inline photo display
│   │   └── ZoneSummary.tsx     # Per-zone score summary box
│   ├── services/
│   │   ├── scoring.ts          # Score calculation logic
│   │   ├── pdf.ts              # PDF report generation
│   │   └── photos.ts           # Photo capture, compression, storage
│   └── styles/
│       └── globals.css         # Tailwind imports + custom styles
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

---

## Liability Waiver Text (Embedded in App)

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

---

## MVP Build Priority

Build in this order for fastest path to field-usable:

1. **Project scaffolding** — Vite + React + TypeScript + Tailwind + PWA manifest
2. **Zone data file** — port all 141 checklist items into `zones.ts`
3. **Database setup** — Dexie.js with all object stores
4. **Assessment info form** — create new assessment with property details
5. **Zone navigator + checklist UI** — the main working screen with score buttons
6. **Photo capture** — camera integration with IndexedDB blob storage
7. **Score calculations** — auto-calculate zone and overall scores
8. **Assessment summary screen** — recommendations, quick wins
9. **PDF report generation** — client-side PDF matching the docx format
10. **Service Worker** — offline caching for full offline support
11. **Home screen** — assessment list with status indicators
12. **Polish** — iPad-optimize touch targets, test in Safari, PWA install flow

---

## Notes for Claude Code

- The checklist content in `zones.ts` is the source of truth — it must match the CPTED_Residential_Assessment_Checklist.docx exactly
- The scoring system uses 1-5 (not 0-5) — there is no zero score
- N/A items are excluded from all score calculations
- Photos are stored as blobs in IndexedDB, not as base64 strings (performance on iPad)
- The PDF must include the liability waiver verbatim
- The app name should be "CPTED Assessor" for the PWA manifest
- Primary colors: Navy #1B3A5C, Light Blue #D6E8F5, Medium Blue #4A7FB5
- The property_type field exists but only 'single_family_residential' is implemented for now — design the UI to be expandable later
- All timestamps should be in local time for display, stored as ISO 8601 UTC internally
