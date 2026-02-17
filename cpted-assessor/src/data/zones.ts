import type { ZoneDefinition } from '../types';

export const ZONES: ZoneDefinition[] = [
  {
    key: 'street_approach',
    name: 'Street Approach & Address Visibility',
    order: 1,
    description:
      'Assess the property as you approach from the street, simulating the perspective of both a visitor and a potential offender.',
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
    key: 'front_yard',
    name: 'Front Yard & Primary Entry',
    order: 2,
    description:
      'Evaluate the front yard landscaping, porch/entry area, and the main point of entry to the home.',
    principles: [
      {
        key: 'natural_surveillance',
        name: 'Natural Surveillance',
        items: [
          'Vegetation follows the 2\'/6\' rule (shrubs under 2 ft, tree canopies above 6 ft)',
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
        ],
      },
      {
        key: 'territorial_reinforcement',
        name: 'Territorial Reinforcement',
        items: [
          'Front yard landscaping demonstrates active ownership and care',
          'Property line between front yard and public space is clearly delineated',
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
    key: 'side_yards',
    name: 'Side Yards & Pathways',
    order: 3,
    description:
      'Walk both sides of the property. Side yards are common vulnerability areas — they connect the more visible front to the more private rear and are often neglected.',
    principles: [
      {
        key: 'natural_surveillance',
        name: 'Natural Surveillance',
        items: [
          'Side yards visible from at least one neighboring property',
          'Vegetation along side yards follows the 2\'/6\' rule',
          'No concealment opportunities between structures (AC units, sheds, fences)',
        ],
      },
      {
        key: 'access_control',
        name: 'Natural Access Control',
        items: [
          'Side yard gates present, in working condition, with self-latching or locking hardware',
          'No easy-climb features along side fencing (trellises, stored items, compost bins)',
        ],
      },
      {
        key: 'territorial_reinforcement',
        name: 'Territorial Reinforcement',
        items: [
          'Side property lines clearly marked or fenced',
        ],
      },
      {
        key: 'maintenance',
        name: 'Maintenance & Image',
        items: [
          'Side yards free of stored junk, debris, or unused items',
          'Fencing in good repair (no leaning, broken slats, or gaps)',
        ],
      },
    ],
  },
  {
    key: 'rear_yard',
    name: 'Rear Yard & Back Entry',
    order: 4,
    description:
      'The rear of the home is typically the least observed area and most common point of forced entry. Assess carefully.',
    principles: [
      {
        key: 'natural_surveillance',
        name: 'Natural Surveillance',
        items: [
          'Rear yard at least partially visible from one or more neighboring properties',
          'Rear-facing windows provide views of the back yard from inside the home',
          'No dense vegetation creating concealment along the rear of the home',
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
    key: 'garage_driveway',
    name: 'Garage & Driveway',
    order: 5,
    description:
      'Assess vehicle access, storage security, and the transition area between the garage/driveway and the home interior.',
    principles: [
      {
        key: 'natural_surveillance',
        name: 'Natural Surveillance',
        items: [
          'Driveway visible from the street and from inside the home',
          'Garage does not create blind spots or hidden areas adjacent to the home',
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
      'Evaluate all exterior lighting. Ideally conduct a nighttime assessment or note fixture types/placement for expected coverage. Consistent, adequate lighting is one of the most impactful CPTED measures for residential properties.',
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
      'Evaluate all accessible windows and relevant interior security features that affect CPTED principles.',
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

/** Total number of checklist items across all zones */
export const TOTAL_ITEM_COUNT = ZONES.reduce(
  (total, zone) =>
    total + zone.principles.reduce((zoneTotal, p) => zoneTotal + p.items.length, 0),
  0,
);
