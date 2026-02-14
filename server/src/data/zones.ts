import type { ZoneDefinition } from '../types/index.js';

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
          'Neighboring properties have sight lines to the subject property',
          'Street-facing rooms are habitable spaces (living room, kitchen) rather than storage or bathrooms',
        ],
      },
      {
        key: 'access_control',
        name: 'Natural Access Control',
        items: [
          'Clearly defined driveway/walkway directs visitors to the front entry',
          'No ambiguous or multiple informal paths leading to the property',
          'Sidewalk and approach are in good condition and clearly routed',
        ],
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
        ],
      },
      {
        key: 'maintenance',
        name: 'Maintenance & Image',
        items: [
          'Street frontage is clean and free of debris, abandoned items, or clutter',
          'Curb, gutter, and sidewalk in good repair',
          'No graffiti, vandalism, or signs of neglect visible from the street',
          'Trash/recycling containers stored out of view when not in use',
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
          'Shrubs/bushes trimmed to no higher than 2 feet — the "2-foot rule"',
          "Tree canopies raised to at least 6 feet from ground — the \"6-foot rule\" (clear sight line between 2' and 6')",
          'No dense vegetation or structures creating concealment spots near the entry',
          'Front porch/entry area visible from the street and from neighboring properties',
          'Porch or entry alcove does not create deep shadows or hidden recesses',
          'Doorbell camera or peephole/door viewer present and at accessible height(s)',
        ],
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
        ],
      },
      {
        key: 'territorial_reinforcement',
        name: 'Territorial Reinforcement',
        items: [
          'Front yard landscaping demonstrates active ownership and care',
          'Welcome mat, planter, or porch furnishings indicate occupancy',
          'Property line between front yard and public space/neighbor is clearly delineated',
          'Hostile/defensive landscaping (thorny plants) used under vulnerable windows if applicable',
        ],
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
          'No tall privacy fencing that blocks all sight lines from neighbors (consider semi-open designs)',
          "Vegetation along side yards follows the 2'/6' rule",
          'Windows on the side of the home are not fully obscured by vegetation or structures',
          'No concealment opportunities between structures (AC units, sheds, fences)',
        ],
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
        ],
      },
      {
        key: 'territorial_reinforcement',
        name: 'Territorial Reinforcement',
        items: [
          'Side property lines clearly marked or fenced',
          "No ambiguity about where one property ends and the neighbor's begins",
          'Side yard conveys ownership (maintained, not abandoned/overgrown)',
        ],
      },
      {
        key: 'maintenance',
        name: 'Maintenance & Image',
        items: [
          'Side yards free of stored junk, debris, or unused items',
          'Fencing in good repair (no leaning, broken slats, or gaps)',
          'AC unit, utility meters, and utility boxes in good condition and not creating concealment',
          'Drainage/grading adequate (standing water can indicate neglect)',
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
          'Outbuildings (sheds, detached garages) do not create blind spots near the home',
          'Rear yard is not fully enclosed by tall solid privacy fencing with zero visibility',
          'If pool or play area present, it is visible from inside the home',
        ],
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
        ],
      },
      {
        key: 'territorial_reinforcement',
        name: 'Territorial Reinforcement',
        items: [
          'Rear property boundaries clearly defined',
          'Rear yard demonstrates active use and ownership',
          'Any alley-facing boundaries have enhanced territorial markers',
        ],
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
          'Vehicles parked in driveway do not block sight lines to the front entry',
          'Garage windows (if any) allow interior visibility but are secured',
        ],
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
        ],
      },
      {
        key: 'territorial_reinforcement',
        name: 'Territorial Reinforcement',
        items: [
          'Driveway clearly defined and directs only to the subject property',
          'Carport or garage conveys active use and ownership',
        ],
      },
      {
        key: 'maintenance',
        name: 'Maintenance & Image',
        items: [
          'Garage door in good working condition',
          'Driveway surface in good condition (no large cracks, heaving, or deterioration)',
          'Garage interior organized (cluttered garages indicate items to steal and make break-in detection harder)',
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
        name: 'Natural Surveillance (Lighting Quality)',
        items: [
          "Front entry/porch has a bright, working light that illuminates visitors' faces",
          'All exterior doors have dedicated lighting fixtures',
          'Driveway and walkway to front door are illuminated',
          'Side yards have some form of lighting (motion-activated recommended)',
          'Rear yard/patio has lighting at entry points',
          'Garage area is illuminated (both interior and exterior)',
          'No dark "dead zones" around the perimeter of the home',
          'Lighting is consistent — no extreme bright/dark contrast creating blinding spots or deep shadow zones',
        ],
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
        ],
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
          "Fixture placement avoids backlighting that silhouettes residents while illuminating an intruder's approach",
        ],
      },
      {
        key: 'maintenance',
        name: 'Maintenance & Image',
        items: [
          'All exterior light fixtures functioning (no burned-out bulbs)',
          'Light fixtures clean and free of insect/debris buildup',
          'No landscaping growth obstructing light fixtures or blocking light output',
          'Wiring and fixtures in safe, good condition',
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
          'No exterior features (awnings, shutters, film) that completely prevent inside-out visibility',
          'Security cameras or video doorbell installed and operational (if applicable)',
        ],
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
        ],
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
        ],
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
