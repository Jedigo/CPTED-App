import type { ZoneDefinition } from '../types';

/**
 * Townhome zones — aligned with residential item text where the CPTED concept
 * is identical, so scores and photos from a residential assessment carry over
 * cleanly when the user duplicates as a townhome.
 *
 * Items that are genuinely new for townhomes (unit numbering, peephole, Shared
 * Boundaries zone, HOA lighting, shared alley/parking, HOA awareness) use
 * townhome-specific text.
 */
export const TOWNHOME_ZONES: ZoneDefinition[] = [
  {
    key: 'street_approach',
    name: 'Street Approach & Address Visibility',
    order: 1,
    description:
      'Approach the unit from the street as a visitor or potential offender would. Assess visibility from public view and how clearly the unit is identified among the surrounding attached housing.',
    principles: [
      {
        key: 'natural_surveillance',
        name: 'Natural Surveillance',
        items: [
          'Clear, unobstructed sight line from the street to the front door',
          'Front windows of the home provide views of the street and front yard',
          'No large visual barriers (walls, hedges, structures) blocking the view from the street to the home',
        ],
      },
      {
        key: 'access_control',
        name: 'Natural Access Control',
        items: [
          'Clearly defined driveway/walkway directs visitors to the front entry',
          'Sidewalk and approach are in good condition and clearly routed',
        ],
      },
      {
        key: 'territorial_reinforcement',
        name: 'Territorial Reinforcement',
        items: [
          'Property boundaries visible and identifiable from the street',
          'House number clearly visible from the street (minimum 4" tall, contrasting color, illuminated or reflective at night)',
        ],
      },
      {
        key: 'maintenance',
        name: 'Maintenance & Image',
        items: [
          'Street frontage is clean and free of debris, abandoned items, or clutter',
          'No graffiti, vandalism, or signs of neglect visible from the street',
        ],
      },
    ],
  },
  {
    key: 'front_entry',
    name: 'Front Entry & Stoop',
    order: 2,
    description:
      'Evaluate the front entry area. For townhomes the "front yard" is often a stoop, small landscape strip, or shared walk — focus on the entry itself.',
    principles: [
      {
        key: 'natural_surveillance',
        name: 'Natural Surveillance',
        items: [
          "Vegetation follows the 2'/6' rule (shrubs under 2 ft, tree canopies above 6 ft)",
          'No dense vegetation or structures creating concealment spots near the entry',
          'Front porch/entry area visible from the street and from neighboring properties',
        ],
      },
      {
        key: 'access_control',
        name: 'Natural Access Control',
        items: [
          'Front door is solid core hardwood or metal (not hollow core)',
          'Deadbolt installed with minimum 1" throw and reinforced strike plate (3" screws)',
          'Door frame is solid and in good condition (no rot, no gaps)',
          'Glass panels in or near door are reinforced or have security film',
          'Peephole or video doorbell installed and functional',
        ],
      },
      {
        key: 'territorial_reinforcement',
        name: 'Territorial Reinforcement',
        items: [
          'Front yard landscaping demonstrates active ownership and care',
          'Property line between front yard and public space is clearly delineated',
          'Unit clearly distinguished from adjacent units (door color, planter, mat, or fixture)',
        ],
      },
      {
        key: 'maintenance',
        name: 'Maintenance & Image',
        items: [
          'Lawn maintained and free of overgrown areas',
          'Walkway, steps, and porch in good structural condition',
          'Door hardware (knob, lock, hinges) in good working condition',
        ],
      },
    ],
  },
  {
    key: 'shared_boundaries',
    name: 'Shared Boundaries',
    order: 3,
    description:
      'Townhomes share at least one wall with neighboring units. Assess shared walls, breezeways, utility access points, and — for end units — the external side of the structure.',
    principles: [
      {
        key: 'natural_surveillance',
        name: 'Natural Surveillance',
        items: [
          'Shared breezeway or walkway between units is visible from neighboring units or common areas',
          'End unit: external side visible from at least one neighbor or common area (mark N/A for interior units)',
          'No concealment opportunities along shared walls (utility enclosures, AC units, recessed alcoves)',
        ],
      },
      {
        key: 'access_control',
        name: 'Natural Access Control',
        items: [
          'Shared utility access points (gas meter, electrical panel, hose bib) secured or in good repair',
          'No easy-climb features along shared or external walls (trellises, stored items, A/C units under windows)',
          'End unit: side gate present, working, with self-latching or locking hardware (mark N/A for interior units)',
        ],
      },
      {
        key: 'territorial_reinforcement',
        name: 'Territorial Reinforcement',
        items: [
          'Unit boundary clearly delineated from neighbor (paint, planter, decorative element)',
          'HOA-permitted territorial markers used where allowed',
        ],
      },
      {
        key: 'maintenance',
        name: 'Maintenance & Image',
        items: [
          'Shared walls in good visible condition (no impact damage, no obvious pest entry points)',
          'Shared walkway or breezeway free of stored junk, debris, or unused items',
        ],
      },
    ],
  },
  {
    key: 'rear_patio',
    name: 'Rear Patio & Back Entry',
    order: 4,
    description:
      'Most townhomes have a small private patio, shared rear alley, or shared green space. Assess the back side carefully — still the most common forced-entry point.',
    principles: [
      {
        key: 'natural_surveillance',
        name: 'Natural Surveillance',
        items: [
          'Rear yard at least partially visible from one or more neighboring properties',
          'Rear-facing windows provide views of the back yard from inside the home',
          'No dense vegetation creating concealment along the rear of the home',
          'Shared rear alley or parking (if applicable) is overlooked by other units',
        ],
      },
      {
        key: 'access_control',
        name: 'Natural Access Control',
        items: [
          'Rear entry door is solid core with deadbolt (same standard as front)',
          'Sliding glass doors have secondary security (dowel/pin in track, security bar, or foot lock)',
          'Rear windows have working locks and are reinforced if ground-accessible',
          'Rear fence/gate is secured with quality lock (not just a flip latch)',
        ],
      },
      {
        key: 'territorial_reinforcement',
        name: 'Territorial Reinforcement',
        items: [
          'Rear property boundaries clearly defined',
        ],
      },
      {
        key: 'maintenance',
        name: 'Maintenance & Image',
        items: [
          'Rear yard maintained (lawn, landscaping, hardscape)',
          'No ladders, tools, or items stored outside that could assist a burglar',
        ],
      },
    ],
  },
  {
    key: 'garage_parking',
    name: 'Garage, Driveway, or Assigned Parking',
    order: 5,
    description:
      'Townhomes vary: front-loaded garage, rear-alley garage, or assigned parking with no garage. Skip items that do not apply (mark N/A).',
    principles: [
      {
        key: 'natural_surveillance',
        name: 'Natural Surveillance',
        items: [
          'Driveway visible from the street and from inside the home',
          'Garage does not create blind spots or hidden areas adjacent to the home',
          'Shared alley or parking area is overlooked by multiple units',
        ],
      },
      {
        key: 'access_control',
        name: 'Natural Access Control',
        items: [
          'Interior door from garage to home is solid core with deadbolt',
          'Overhead garage door has a manual lock (not relying solely on opener)',
          'Emergency release cord is secured against coat hanger manipulation',
          'Garage door kept closed and locked when not in active use',
        ],
      },
      {
        key: 'territorial_reinforcement',
        name: 'Territorial Reinforcement',
        items: [
          'Driveway clearly defined and directs only to the subject property',
          'Assigned parking spot clearly marked with unit number',
        ],
      },
      {
        key: 'maintenance',
        name: 'Maintenance & Image',
        items: [
          'Garage door in good working condition',
          'No high-value items visible through garage windows or open door',
        ],
      },
    ],
  },
  {
    key: 'exterior_lighting',
    name: 'Exterior Lighting',
    order: 6,
    description:
      'Townhomes often have HOA-controlled common-area lighting in addition to unit-controlled fixtures. Note which lighting is the unit\'s responsibility versus the HOA\'s.',
    principles: [
      {
        key: 'natural_surveillance',
        name: 'Lighting Coverage',
        items: [
          "Front entry/porch has a bright, working light that illuminates visitors' faces",
          'All exterior doors have dedicated lighting fixtures',
          'Walkways and driveway adequately illuminated',
          'Motion-activated lights at vulnerable areas (side yards, rear entry, garage)',
          'No dark "dead zones" around the perimeter of the home',
          'HOA common-area lighting (shared walkways, parking, alleys) in good repair and adequate',
          'Exterior lights on photocell (dusk-to-dawn) or timer — not solely manual switch',
        ],
      },
      {
        key: 'maintenance',
        name: 'Maintenance & Image',
        items: [
          'All exterior light fixtures functioning (no burned-out bulbs)',
          'No landscaping growth obstructing light fixtures or blocking light output',
        ],
      },
    ],
  },
  {
    key: 'windows_interior',
    name: 'Windows & Interior Considerations',
    order: 7,
    description:
      'Evaluate accessible windows and interior security features. Interior townhome units typically have windows only on the front and rear elevations.',
    principles: [
      {
        key: 'natural_surveillance',
        name: 'Natural Surveillance',
        items: [
          'Windows in high-use rooms (living room, kitchen) face the street or yard areas',
          'Window treatments allow occupants to observe outside (not permanently blocked/covered)',
        ],
      },
      {
        key: 'access_control',
        name: 'Natural Access Control',
        items: [
          'Every window has a working lock in good condition',
          'Ground-floor windows have security film or reinforced glass where appropriate',
          'Second-story windows not accessible via adjacent structures, trees, or climbing aids',
          'Vents or transoms on shared walls (if any exist between units) are secured',
        ],
      },
      {
        key: 'security_systems',
        name: 'Security Systems & Technology',
        items: [
          'Alarm/security system installed and in working order (if applicable)',
          'Security signage/stickers displayed (even if no active system)',
        ],
      },
      {
        key: 'behavioral',
        name: 'Behavioral & Routine Considerations',
        items: [
          'Valuable items not visible through windows from outside',
        ],
      },
    ],
  },
];

/** Total number of checklist items across all townhome zones */
export const TOWNHOME_TOTAL_ITEM_COUNT = TOWNHOME_ZONES.reduce(
  (total, zone) =>
    total + zone.principles.reduce((zoneTotal, p) => zoneTotal + p.items.length, 0),
  0,
);
