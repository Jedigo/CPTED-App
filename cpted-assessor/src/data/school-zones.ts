import type { ZoneDefinition } from '../types';

/**
 * School zone definitions — one source of truth for Elementary, Middle, High,
 * and Combined (K-8 / K-12) school types.
 *
 * Items are tagged with the grade bands they apply to. The builder below
 * produces a `ZoneDefinition[]` per school type, filtering items that don't
 * apply (e.g., student parking lots for elementary, playground equipment for
 * high schools). Principles with zero matching items are dropped; zones never
 * drop entirely because every zone has core items that apply across all bands.
 *
 * Sources blended into this checklist:
 *   - Volusia Sheriff CPTED school evaluation (local format / verbatim where aligned)
 *   - CISA K-12 School Security Guide (3rd ed., 2022)
 *   - Partner Alliance for Safer Schools (PASS) Guidelines (7th ed., 2025)
 *   - CDC CPTED School Assessment (CSA)
 *   - Florida school-safety statute (Alyssa's Law, HB 301 mapping, MSD Act,
 *     HB 1421 campus hardening, FortifyFL, School Safety Specialist)
 */

export type SchoolBand = 'elementary' | 'middle' | 'high' | 'combined';

interface SchoolItem {
  text: string;
  /** Bands this item applies to. Omitted = applies to all bands. */
  bands?: SchoolBand[];
}

interface SchoolPrinciple {
  key: string;
  name: string;
  items: SchoolItem[];
}

interface SchoolZoneTemplate {
  key: string;
  name: string;
  order: number;
  description: string;
  principles: SchoolPrinciple[];
}

const SCHOOL_ZONES_TEMPLATE: SchoolZoneTemplate[] = [
  // ─── Zone 1 ──────────────────────────────────────────────────────
  {
    key: 'campus_perimeter',
    name: 'Campus Perimeter & Approach',
    order: 1,
    description:
      'Begin the walkthrough at the property boundary. Assess how the campus presents to approaching vehicles and pedestrians, and how effectively the perimeter defines the school as controlled territory.',
    principles: [
      {
        key: 'natural_surveillance',
        name: 'Natural Surveillance',
        items: [
          { text: 'Property boundaries are clearly delineated from adjacent properties' },
          { text: 'Perimeter fencing allows for natural surveillance of school grounds' },
          { text: 'Remote or seldom-used areas of the property are visible from occupied buildings, pedestrian pathways, or vehicular routes' },
        ],
      },
      {
        key: 'access_control',
        name: 'Natural Access Control',
        items: [
          { text: 'School grounds are fenced appropriately to the campus context (full perimeter where feasible; at minimum around student play/recess areas)' },
          { text: 'Fencing is in good repair with no holes, gaps, or compromised sections' },
          { text: 'Knox Box has been installed at a first-responder-visible location for after-hours access' },
          { text: 'Vehicle bollards, wheel stops, or landscaped berms protect the primary building entry from vehicle ramming' },
          { text: 'Seldom-used perimeter gates or areas are secured to prevent unauthorized access' },
        ],
      },
      {
        key: 'territorial_reinforcement',
        name: 'Territorial Reinforcement',
        items: [
          { text: 'Signs at the property perimeter direct approaching vehicles and pedestrians to the appropriate entries' },
          { text: 'An attractive, visible school-name sign is posted near the primary entry' },
          { text: 'Trees and shrubs along the perimeter follow CPTED standards (shrubs trimmed below 2 ft, canopy above 6 ft) to preserve sight lines' },
        ],
      },
      {
        key: 'maintenance',
        name: 'Maintenance & Image',
        items: [
          { text: 'Perimeter is free of graffiti, litter, or signs of neglect that signal reduced guardianship' },
          { text: 'There are no unattractive barriers such as barbed wire or razor wire on the school grounds' },
        ],
      },
    ],
  },

  // ─── Zone 2 ──────────────────────────────────────────────────────
  {
    key: 'parking_drop_off',
    name: 'Parking, Drop-off & Bus Loops',
    order: 2,
    description:
      'Evaluate vehicular circulation: parent drop-off/pickup, bus loading, delivery, staff parking, visitor parking, and (where applicable) student parking. These zones see the highest non-classroom traffic and risk.',
    principles: [
      {
        key: 'natural_surveillance',
        name: 'Natural Surveillance',
        items: [
          { text: 'Parking lots are easily monitored from adjacent buildings or dedicated camera coverage' },
          { text: 'Visitor parking is visible from adjacent administrative offices' },
          { text: 'Parent drop-off/pickup areas are easily monitored by staff and/or cameras' },
          { text: 'Bus unloading/loading areas are easily monitored' },
        ],
      },
      {
        key: 'access_control',
        name: 'Natural Access Control',
        items: [
          { text: 'Parent drop-off/pickup location is clearly marked by signage, pavement, and curb treatments' },
          { text: 'Students are dropped off and picked up only at authorized locations' },
          { text: 'Bus unloading/loading areas are clearly marked by signage, pavement, and/or curb treatments' },
          { text: 'Visitor parking is located directly adjacent to the main administrative entrance' },
          { text: 'Parking lot entrances and exits are clearly marked' },
          { text: 'Secondary vehicular entries are secured during school hours' },
          { text: 'Student parking lot uses access control (gate, decal enforcement, or monitored entry)', bands: ['high', 'combined'] },
          { text: 'Delivery activities follow a defined route that does not cross student movement zones' },
        ],
      },
      {
        key: 'territorial_reinforcement',
        name: 'Territorial Reinforcement',
        items: [
          { text: 'Parking areas are delineated for staff, visitors, and (where applicable) students' },
          { text: 'All parking spaces are clearly marked' },
          { text: 'Vehicular travel routes on school property are clearly marked and in good condition' },
          { text: 'Authorized adults are visible and available for assistance at parent drop-off and bus areas during arrivals and departures' },
        ],
      },
      {
        key: 'maintenance',
        name: 'Maintenance & Image',
        items: [
          { text: 'Parking lots are well lit during nighttime and early-morning operations' },
          { text: 'Parking lots are in good condition with no signs of vandalism' },
        ],
      },
    ],
  },

  // ─── Zone 3 ──────────────────────────────────────────────────────
  {
    key: 'grounds_outdoor',
    name: 'Grounds, Playgrounds & Outdoor Areas',
    order: 3,
    description:
      'Walk the campus grounds between buildings. Assess pathways, gathering areas, playgrounds and athletic spaces, bike racks, dumpsters, and utilities — the semi-public zones most likely to host loitering, vandalism, or trespass.',
    principles: [
      {
        key: 'natural_surveillance',
        name: 'Natural Surveillance',
        items: [
          { text: 'Pedestrian pathways on school property are easily monitored' },
          { text: 'Pedestrian pathways and gathering areas are visible from occupied buildings' },
          { text: 'Playground areas are visible from administrative and classroom windows', bands: ['elementary', 'combined'] },
          { text: 'Exterior athletic areas are easily monitored' },
          { text: 'Bike racks are easily monitored' },
          { text: 'There are no concealment hiding places created by landscaping or fencing' },
        ],
      },
      {
        key: 'access_control',
        name: 'Natural Access Control',
        items: [
          { text: 'Access to dumpsters is controlled (enclosed, locked, or monitored)' },
          { text: 'No hiding places exist in or around dumpster areas' },
          { text: 'Site utilities (electrical vaults, HVAC, gas meters) are secured with locked enclosures' },
          { text: 'Playground equipment is installed to restrict climbing access onto adjacent roofs or upper levels', bands: ['elementary', 'combined'] },
          { text: 'Athletic fields/stadium have controlled access during non-event hours', bands: ['middle', 'high', 'combined'] },
        ],
      },
      {
        key: 'territorial_reinforcement',
        name: 'Territorial Reinforcement',
        items: [
          { text: 'Pedestrian pathways are separated from vehicular routes by curbing, color markings, landscaping, or other physical barriers' },
          { text: 'Posted rules are located at key points around the school grounds (playground, athletic areas, bike racks)' },
          { text: 'Outdoor learning areas, when present, are well-defined and supervisable' },
        ],
      },
      {
        key: 'maintenance',
        name: 'Maintenance & Image',
        items: [
          { text: 'School grounds are in good condition and enhanced with landscaping, student artwork, or similar elements that demonstrate active ownership' },
          { text: 'No signs of graffiti or vandalism on grounds or outdoor equipment' },
          { text: 'Landscaping does not provide easy access to roofs, windows, or upper levels' },
          { text: 'Bike racks and enclosures are in good condition' },
        ],
      },
    ],
  },

  // ─── Zone 4 ──────────────────────────────────────────────────────
  {
    key: 'building_exterior',
    name: 'Building Exterior & Public Entry',
    order: 4,
    description:
      'Assess the exterior envelope of every school building: main public entry, secondary doors, walls, courtyards, roof access, and portable classrooms. Single-point-of-entry design and vestibule hardening are the top PASS/FDOE priorities here.',
    principles: [
      {
        key: 'natural_surveillance',
        name: 'Natural Surveillance',
        items: [
          { text: 'Public entry is located adjacent to the administration area and visitor parking' },
          { text: 'Extensive windows and glazed doors at the public entry enhance natural surveillance' },
          { text: 'Courtyards are visible from the windows and doors of surrounding school buildings' },
          { text: 'Exterior stairs, balconies, ramps, and upper-level corridors are visible from windows or doors of school buildings, parking lots, and/or activity areas' },
          { text: 'Exterior stairs do not create hiding or hard-to-see areas' },
        ],
      },
      {
        key: 'access_control',
        name: 'Natural Access Control',
        items: [
          { text: 'A single, defined public entry is enforced during school hours (fortified vestibule / mantrap or equivalent)' },
          { text: 'Front-entry vestibule glazing is ballistic-resistant, laminated, or protected with security film rated for forced-entry delay' },
          { text: 'Secondary entrance/exit doors are secured in the closed position and not propped open' },
          { text: 'Emergency-exit doors are alarmed or monitored to deter unauthorized outside access' },
          { text: 'All buildings have highly visible identification names and/or numbers for first-responder access' },
          { text: 'Portable classrooms display highly visible identification names/numbers' },
          { text: 'Spaces under portables, including stairs and ramps, are screened to limit access' },
          { text: 'Portables are secured when not in use' },
          { text: 'Screening walls and/or architectural features do not allow easy access to the roof or upper levels' },
          { text: 'Covers for exterior walkways and stairs are designed to limit easy access to roofs, windows, or upper levels' },
        ],
      },
      {
        key: 'territorial_reinforcement',
        name: 'Territorial Reinforcement',
        items: [
          { text: 'Public entry is well defined with architectural features, signs, lighting, artwork, landscaping, and/or landmarks such as flags' },
          { text: 'Courtyards are enhanced with landscaping, student artwork, or other physical means' },
        ],
      },
      {
        key: 'maintenance',
        name: 'Maintenance & Image',
        items: [
          { text: 'Exterior walls, doors, and windows are in good condition' },
          { text: 'No signs of graffiti on exterior walls' },
          { text: 'Murals, artwork, landscaping, and/or other architectural treatments enhance blank or barren exterior walls' },
        ],
      },
    ],
  },

  // ─── Zone 5 ──────────────────────────────────────────────────────
  {
    key: 'reception_admin',
    name: 'Reception, Visitor Management & Administration',
    order: 5,
    description:
      'Evaluate the visitor-management choke point: front desk positioning, sign-in/badging, access control from public lobby into the school, and administrative sightlines.',
    principles: [
      {
        key: 'natural_surveillance',
        name: 'Natural Surveillance',
        items: [
          { text: 'Reception desk has clear sight lines to the public entry and approach' },
          { text: 'Extensive use of windows in administrative areas provides natural surveillance of adjoining interior spaces' },
          { text: 'Extensive use of windows in administrative areas provides natural surveillance of the exterior' },
          { text: 'Lobby area is visible from adjacent administrative offices' },
        ],
      },
      {
        key: 'access_control',
        name: 'Natural Access Control',
        items: [
          { text: 'Access from the public lobby into the main school building is controlled (locked door, electronic access control, or staffed gate)' },
          { text: 'Visitor sign-in and badging system is in place and actively used (e.g., Raptor, ID scan)' },
          { text: 'Front office has an Alyssa\'s Law panic alert / silent panic button accessible from the reception position' },
          { text: 'Access to school staff areas is controlled (badge, code, or staffed access)' },
          { text: 'Counseling and student-services areas have controlled access and are in good condition' },
        ],
      },
      {
        key: 'territorial_reinforcement',
        name: 'Territorial Reinforcement',
        items: [
          { text: 'Lobby is attractive, cheerful, and inviting — with signs clearly directing visitors to the office' },
          { text: 'Signs provide directions to major school areas (administrative offices, cafeteria, media center, auditorium, gymnasium, etc.)' },
        ],
      },
      {
        key: 'maintenance',
        name: 'Maintenance & Image',
        items: [
          { text: 'Lobby and reception area are clean, well lit, and in good condition' },
        ],
      },
    ],
  },

  // ─── Zone 6 ──────────────────────────────────────────────────────
  {
    key: 'corridors_stairs',
    name: 'Interior Corridors, Stairs & Lobbies',
    order: 6,
    description:
      'Assess the interior circulation network: hallways, stairwells, lobbies, elevators, and locker banks. These are the highest-traffic monitoring zones during class changes, arrivals, and departures.',
    principles: [
      {
        key: 'natural_surveillance',
        name: 'Natural Surveillance',
        items: [
          { text: 'Interior corridors are easily monitored by staff during class changes, arrivals, and departures' },
          { text: 'Interior corridors have no hiding places (no recessed alcoves or unmonitored nooks)' },
          { text: 'Interior stairs do not create hiding or hard-to-see areas' },
          { text: 'Locker banks, when present, are arranged to maintain visibility (center lockers do not obstruct sight lines)', bands: ['middle', 'high', 'combined'] },
        ],
      },
      {
        key: 'access_control',
        name: 'Natural Access Control',
        items: [
          { text: 'Interior corridor light controls are secured to prevent unauthorized access' },
          { text: 'Interior stair and balcony light controls are secured' },
          { text: 'Access to elevators is limited to authorized individuals' },
          { text: 'Elevators are located in easy-to-view areas with mirrors inside to eliminate hiding places' },
        ],
      },
      {
        key: 'territorial_reinforcement',
        name: 'Territorial Reinforcement',
        items: [
          { text: 'Authorized adults (staff, administrators, SRO/Guardian) are visible in interior corridors during arrivals, class changes, and departures' },
          { text: 'Lockers, where used, are adequately spaced to avoid crowding and see-through where possible', bands: ['middle', 'high', 'combined'] },
        ],
      },
      {
        key: 'maintenance',
        name: 'Maintenance & Image',
        items: [
          { text: 'Interior corridors are well lit and free of obstacles that impede orderly pedestrian flow' },
          { text: 'Interior stairs, balconies, doors, and windows are in good condition' },
        ],
      },
    ],
  },

  // ─── Zone 7 ──────────────────────────────────────────────────────
  {
    key: 'classrooms',
    name: 'Classrooms & Instructional Spaces',
    order: 7,
    description:
      'Evaluate classroom-level security: lockdown capability, door glazing, interior sight lines, and communication. The classroom is the last layer of protection during an active threat.',
    principles: [
      {
        key: 'natural_surveillance',
        name: 'Natural Surveillance',
        items: [
          { text: 'Classroom door windows allow natural surveillance into classrooms from the hallway' },
          { text: 'Classroom windows allow for natural surveillance of exterior spaces' },
          { text: 'Furniture, lockers, or other objects do not compromise natural surveillance within the classroom' },
        ],
      },
      {
        key: 'access_control',
        name: 'Natural Access Control',
        items: [
          { text: 'Classrooms can be secured and locked down from the inside without the teacher exiting the room' },
          { text: 'Secured classroom doors can still be exited from inside in an emergency (no key required to egress)' },
          { text: 'Classroom doors are secured when the classroom is not in use' },
          { text: 'Door-glazing coverings or opaque strips are available and deployable during lockdown (block sight into the room)' },
          { text: 'Each classroom has an exterior-visible classroom number or ID (door or window placard) for tactical response' },
          { text: 'Every classroom has a means to contact the front office or administration directly (phone, intercom, two-way radio, or mobile alert app)' },
        ],
      },
      {
        key: 'territorial_reinforcement',
        name: 'Territorial Reinforcement',
        items: [
          { text: 'Posted emergency procedures, lockdown instructions, or Standard Response Protocol (SRP) signage is visible in each classroom' },
        ],
      },
      {
        key: 'maintenance',
        name: 'Maintenance & Image',
        items: [
          { text: 'Classrooms are well lit, in good condition, and free of clutter that would impede evacuation or lockdown' },
          { text: 'In-school suspension areas are easily monitored by staff' },
        ],
      },
    ],
  },

  // ─── Zone 8 ──────────────────────────────────────────────────────
  {
    key: 'assembly_support',
    name: 'Assembly & Support Spaces',
    order: 8,
    description:
      'Evaluate large-group and specialty spaces: cafeteria, auditorium, gymnasium, locker rooms, library/media center, and CTE/shop labs. These spaces concentrate students and often operate at different schedules than the main classroom flow.',
    principles: [
      {
        key: 'natural_surveillance',
        name: 'Natural Surveillance',
        items: [
          { text: 'Cafeteria entries are well-defined and easily monitored' },
          { text: 'Auditorium entries are well-defined and easily monitored', bands: ['middle', 'high', 'combined'] },
          { text: 'Gymnasium is easily monitored and access to the underside of bleachers is limited' },
          { text: 'Library / media center entries are well-defined and monitored by staff/volunteers' },
          { text: 'Locker rooms and shower areas are easily monitored by staff', bands: ['middle', 'high', 'combined'] },
        ],
      },
      {
        key: 'access_control',
        name: 'Natural Access Control',
        items: [
          { text: 'Access to the cafeteria kitchen and serving areas is limited to authorized staff' },
          { text: 'Cafeteria entrances are secured when the room is not in use' },
          { text: 'Gymnasium entrances are secured when the room is not in use' },
          { text: 'Light controls in gym and locker rooms are secured to prevent unauthorized access', bands: ['middle', 'high', 'combined'] },
          { text: 'Auditorium backstage, sound booth, and production areas are secured when not in use', bands: ['middle', 'high', 'combined'] },
          { text: 'CTE / shop / lab spaces (if present) have controlled access and secured tool storage', bands: ['high', 'combined'] },
        ],
      },
      {
        key: 'territorial_reinforcement',
        name: 'Territorial Reinforcement',
        items: [
          { text: 'Cafeteria has authorized adults visible during meal periods' },
          { text: 'Posted rules or code of conduct displayed at entries to gym, cafeteria, and library' },
        ],
      },
      {
        key: 'maintenance',
        name: 'Maintenance & Image',
        items: [
          { text: 'Cafeteria, auditorium, gymnasium, and library are in good condition' },
          { text: 'Sufficient table spacing in the cafeteria allows orderly circulation' },
          { text: 'Locker rooms are well lit in all areas including shower and restroom zones', bands: ['middle', 'high', 'combined'] },
          { text: 'Athletic equipment and supply storage rooms are locked when not in use' },
        ],
      },
    ],
  },

  // ─── Zone 9 ──────────────────────────────────────────────────────
  {
    key: 'restrooms_utility',
    name: 'Restrooms & Utility Areas',
    order: 9,
    description:
      'Assess the most concealed building interior spaces: restrooms and utility rooms. These are the hardest to monitor and therefore disproportionately host bullying, substance use, and vandalism incidents.',
    principles: [
      {
        key: 'natural_surveillance',
        name: 'Natural Surveillance',
        items: [
          { text: 'Multi-stall restroom entries use an open zigzag / maze design rather than a single solid door' },
          { text: 'Restroom entries are easily viewed from other active areas' },
          { text: 'Restrooms with solid doors have vents that allow auditory surveillance' },
        ],
      },
      {
        key: 'access_control',
        name: 'Natural Access Control',
        items: [
          { text: 'Restroom light controls are secured to prevent unauthorized access' },
          { text: 'Electrical panels, mechanical rooms, and utility closets are locked' },
          { text: 'IT / server room access is restricted to authorized personnel and logged' },
          { text: 'Roof access hatches are secured and alarmed' },
        ],
      },
      {
        key: 'territorial_reinforcement',
        name: 'Territorial Reinforcement',
        items: [
          { text: 'Restroom stall doors, hardware, and locks are in good condition' },
        ],
      },
      {
        key: 'maintenance',
        name: 'Maintenance & Image',
        items: [
          { text: 'Restrooms are well lit with no unusually foul odors' },
          { text: 'Restroom ceiling treatments do not provide access to a hiding place' },
          { text: 'Toilets, urinals, lavatories, and fixtures are in good condition' },
        ],
      },
    ],
  },

  // ─── Zone 10 ─────────────────────────────────────────────────────
  {
    key: 'safety_systems',
    name: 'Safety Systems, Policies & Emergency Readiness',
    order: 10,
    description:
      'Close the walkthrough with the procedural and technology layer: camera coverage, panic alerts (Alyssa\'s Law), digital mapping (HB 301), threat assessment team, SRO/Guardian coverage, drills, and emergency communications. These are required under Florida school-safety statute and are the spine of the rest of the checklist.',
    principles: [
      {
        key: 'natural_surveillance',
        name: 'Surveillance Systems',
        items: [
          { text: 'Camera coverage exists at all primary entries, main corridors, parking lots, and bus loading / drop-off zones' },
          { text: 'Camera system records continuously with adequate storage (minimum 30 days) and accurate timestamps' },
          { text: 'A dedicated monitoring point (SRO office, front desk, or admin) provides real-time camera view during school hours' },
        ],
      },
      {
        key: 'access_control',
        name: 'Technology & Access Control',
        items: [
          { text: 'Alyssa\'s Law Mobile Panic Alert System (MPAS) is installed and staff have been trained; alert integrates directly with local PSAP (911)' },
          { text: 'Digital school mapping data (HB 301) has been provided to the Sheriff\'s Office and first responders' },
          { text: 'Electronic access control / badge system is used for staff entry to controlled areas' },
          { text: 'Key control system is in place (master keys tracked, locks re-keyed when staff leave, spare keys secured)' },
          { text: 'Single-alert activation automatically triggers campus lockdown and notification across intercom, digital signage, and staff devices' },
        ],
      },
      {
        key: 'territorial_reinforcement',
        name: 'Programs & Personnel',
        items: [
          { text: 'School Safety Specialist is appointed and all staff know who that person is' },
          { text: 'Threat Assessment Team is established and meets per state requirements (Marjory Stoneman Douglas Act)' },
          { text: 'School Resource Officer or Guardian coverage is in place for all student hours, matching campus population and footprint' },
          { text: 'FortifyFL (anonymous tip line) is posted and publicized to students and staff' },
          { text: 'Two-way radios or equivalent communication devices are available to administration, SRO/Guardian, and duty staff' },
        ],
      },
      {
        key: 'maintenance',
        name: 'Planning & Drills',
        items: [
          { text: 'Multi-hazard evacuation plan is current, reviewed annually with law enforcement and fire, and posted as required' },
          { text: 'Reunification site and procedure are established, documented, and known to staff and families' },
          { text: 'Lockdown, fire, and severe-weather drills have been conducted on the state-required schedule' },
          { text: 'Mass-notification system (intercom, digital signage, SMS) is tested and functional' },
        ],
      },
    ],
  },
];

function buildSchoolZones(band: SchoolBand): ZoneDefinition[] {
  const zones: ZoneDefinition[] = [];

  for (const template of SCHOOL_ZONES_TEMPLATE) {
    const principles = template.principles
      .map((p) => {
        const items = p.items
          .filter((i) => !i.bands || i.bands.includes(band))
          .map((i) => i.text);
        return { key: p.key, name: p.name, items };
      })
      .filter((p) => p.items.length > 0);

    // Every zone should retain at least one principle; guard anyway.
    if (principles.length === 0) continue;

    zones.push({
      key: template.key,
      name: template.name,
      order: template.order,
      description: template.description,
      principles,
    });
  }

  return zones;
}

export const ELEMENTARY_SCHOOL_ZONES: ZoneDefinition[] = buildSchoolZones('elementary');
export const MIDDLE_SCHOOL_ZONES: ZoneDefinition[] = buildSchoolZones('middle');
export const HIGH_SCHOOL_ZONES: ZoneDefinition[] = buildSchoolZones('high');
export const COMBINED_SCHOOL_ZONES: ZoneDefinition[] = buildSchoolZones('combined');

/** Flat list of every unique checklist item across the school template — used
 *  by item-guidance and item-phases to provide full coverage. */
export const ALL_SCHOOL_ITEM_TEXTS: string[] = Array.from(
  new Set(
    SCHOOL_ZONES_TEMPLATE.flatMap((z) => z.principles.flatMap((p) => p.items.map((i) => i.text))),
  ),
);
