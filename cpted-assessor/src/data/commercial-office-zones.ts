import type { ZoneDefinition } from '../types';

/**
 * Commercial Office (single-tenant HQ) — 11 zones, 152 items
 * Sourced from research draft (files(1)/commercial_office_research_draft.md, v1).
 * Voice follows Volusia Sheriff CPTED format: declarative, observable, single-sentence.
 */
export const COMMERCIAL_OFFICE_ZONES: ZoneDefinition[] = [
  {
    key: 'site_perimeter',
    name: 'Site Perimeter & Approach',
    order: 1,
    description:
      "Begin the walkthrough at the property line. Evaluate how the site presents to approaching vehicles and pedestrians, the standoff distance between any public road and the building, and the perimeter's ability to deter both ramming and unauthorized foot entry. Set the territorial tone for the rest of the assessment here.",
    principles: [
      {
        key: 'natural_surveillance',
        name: 'Natural Surveillance',
        items: [
          'The full property boundary is visible from the street or from on-site occupied positions without significant blind spots',
          "Perimeter landscaping follows the CPTED 2'/6' rule (shrubs trimmed below 2 ft, tree canopies above 6 ft) so sight lines are preserved",
          'Remote or seldom-used edges of the property are visible from the building, internal roadways, or dedicated camera coverage',
        ],
      },
      {
        key: 'access_control',
        name: 'Access Control',
        items: [
          'Vehicle approach is funneled through a clearly defined primary entrance with no informal cut-throughs from adjacent parcels',
          'Hostile-vehicle mitigation (bollards, planters, knee-wall, or landscaped berm) protects the building face from ramming at the closest standoff approach',
          'Perimeter fencing, landscape berms, or natural barriers define the property edge along all sides exposed to public roadway or adjacent property',
          'Knox Box or equivalent first-responder access has been installed at a visible location for after-hours building entry',
        ],
      },
      {
        key: 'territorial_reinforcement',
        name: 'Territorial Reinforcement',
        items: [
          'A monument sign or building-name signage at the primary approach establishes the property as private corporate territory',
          'Signage at the perimeter directs visitors, deliveries, and employees to the appropriate entrances',
          'Property-line markers (fencing, hedges, walls, or pavement transitions) clearly distinguish the corporate property from public right-of-way',
        ],
      },
      {
        key: 'maintenance',
        name: 'Maintenance & Image',
        items: [
          'The perimeter is free of graffiti, litter, broken fencing, and signs of neglect that would signal reduced guardianship',
          'Perimeter signage is clean, current, and free of obsolete or damaged elements',
        ],
      },
    ],
  },
  {
    key: 'parking_pedestrian',
    name: 'Surface Parking & Pedestrian Circulation',
    order: 2,
    description:
      'Evaluate the surface parking lots, marked pedestrian routes between parking and the building, and any employee/visitor parking segregation. Sight lines, lighting uniformity, and natural surveillance from the building drive most of the score here.',
    principles: [
      {
        key: 'natural_surveillance',
        name: 'Natural Surveillance',
        items: [
          'Parking areas are visible from occupied portions of the building (ground- or upper-floor windows, reception, or security control room)',
          'Pedestrian routes from parking to building entrances are open, direct, and visible without hidden alcoves or screened approaches',
          'Cameras provide overlapping coverage of all parking areas with no significant blind spots between fixtures',
          "Landscaping in and around the parking lot follows the 2'/6' rule so a person standing between vehicles is visible from a distance",
        ],
      },
      {
        key: 'access_control',
        name: 'Access Control',
        items: [
          'Visitor parking is clearly marked, located adjacent to the main entrance, and signed at the property approach',
          'Employee-only parking sections are marked with signage or pavement treatments that distinguish them from visitor parking spaces',
          'Vehicle entry/exit points are clearly marked, controlled by gate or stop control where appropriate, and minimized to the operational minimum',
          'After-hours parking is restricted, and any after-hours arrivals are observable by security staff or via monitored cameras',
        ],
      },
      {
        key: 'lighting',
        name: 'Lighting',
        items: [
          'Parking areas are lit so faces can be recognized at 25 feet, in line with IES recommended practice for parking facilities',
          'Light fixtures are spaced for uniformity (low light-to-dark ratio) without dark gaps between poles',
          'Light fixtures are tamper- and vandal-resistant, mounted at heights that are not easily reached',
          'All parking-area light fixtures are functioning, with no out, dim, or damaged units observed',
          'Pedestrian walkways between parking and the building are lit continuously (not just at endpoints)',
        ],
      },
      {
        key: 'territorial_reinforcement',
        name: 'Territorial Reinforcement',
        items: [
          'Designated visitor parking spaces are reinforced by signage and pavement markings',
          'Wayfinding signs guide visitors from parking to the main entry without ambiguity',
        ],
      },
      {
        key: 'maintenance',
        name: 'Maintenance & Image',
        items: [
          'The parking lot is free of abandoned vehicles, accumulated debris, broken pavement, and damaged parking spaces',
          'Pavement markings, signs, and curb paint are maintained in legible condition',
        ],
      },
    ],
  },
  {
    key: 'grounds_outdoor',
    name: 'Grounds, Landscaping & Outdoor Common Areas',
    order: 3,
    description:
      'Evaluate the rest of the site outside parking — courtyards, plazas, designated smoking areas, outdoor break/eating areas, walking paths, retention ponds, and any deliveries staging or trash/dumpster areas. Look for hiding spots, defensible territory, and any areas where employees congregate outdoors.',
    principles: [
      {
        key: 'natural_surveillance',
        name: 'Natural Surveillance',
        items: [
          'Outdoor break, smoking, and eating areas are visible from inside the building or from regularly traveled walkways',
          'Walking paths and trails are open and unobstructed by tall hedges, blind curves, or screened bench enclosures',
          'Trash, dumpster, and recycling areas are visible from the building or from a regularly traveled vehicle route',
          "Landscaping along walkways, courtyards, and the building face follows the CPTED 2'/6' rule (shrubs trimmed below 2 ft, tree canopies above 6 ft) so concealment is eliminated and sight lines are preserved",
        ],
      },
      {
        key: 'access_control',
        name: 'Access Control',
        items: [
          'Designated smoking areas are positioned so smokers do not prop open exterior doors or congregate near secondary entries',
          'Dumpster enclosures are gated/locked when not in active use to prevent dumpster diving and bomb-staging concealment',
          'Outdoor utility components (transformers, gas meters, HVAC condensers, irrigation backflow) are protected by enclosures, fencing, or bollards',
        ],
      },
      {
        key: 'territorial_reinforcement',
        name: 'Territorial Reinforcement',
        items: [
          'Outdoor common areas (courtyards, plazas, eating areas) are clearly furnished and signed as employee-use spaces, not public space',
          'Landscape design and pavement signal that the grounds are owned, maintained, and patrolled',
        ],
      },
      {
        key: 'maintenance',
        name: 'Maintenance & Image',
        items: [
          'Grounds are free of graffiti, litter, broken benches/tables, and overgrown landscape',
          'Trash receptacles in outdoor common areas are emptied on a regular schedule and are not overflowing',
          'Irrigation, drainage, and landscape beds are functioning and not creating standing-water or overgrowth issues',
        ],
      },
    ],
  },
  {
    key: 'building_exterior',
    name: 'Building Exterior & Envelope',
    order: 4,
    description:
      'Walk the full perimeter of the building. Evaluate the façade, ground-floor windows, all secondary doors (employee, emergency egress, service), roof access, and rooftop equipment. Confirm there is one and only one normal entry path and that everything else is secured.',
    principles: [
      {
        key: 'natural_surveillance',
        name: 'Natural Surveillance',
        items: [
          'Ground-floor windows are not obstructed by interior signs, posters, or furniture beyond the 10% / 5-ft CPTED guideline',
          'The full exterior perimeter is observable from cameras, regularly patrolled paths, or building windows with overlapping coverage',
          'Setback/hardscape around the building is open enough to deny concealed approach to ground-floor windows and doors',
        ],
      },
      {
        key: 'access_control',
        name: 'Access Control',
        items: [
          'All secondary exterior doors are exit-only (no exterior hardware) or controlled by card reader',
          'Exterior doors have non-removable hinge pins or hinges that are not accessible from outside',
          'Exterior doors are equipped with deadbolts (minimum 1-inch throw) or equivalent commercial locking, with strike plates anchored into the frame',
          'Exterior door closers and weather seals are in working order and the doors latch fully when released',
          'Secondary exterior doors are alarmed (door-position contact reporting to the security panel) so any opening is detected',
          'Ground-floor windows that open are equipped with locks; fixed glazing is intact and not propped/blocked',
          'Roof access doors and roof hatches are locked, alarmed, and not used as informal smoking-break exits',
          'Rooftop HVAC, communications, and mechanical equipment is protected by perimeter fencing, locked enclosures, or restricted-access roof zoning',
        ],
      },
      {
        key: 'territorial_reinforcement',
        name: 'Territorial Reinforcement',
        items: [
          'The primary entry is visually distinct (canopy, signage, lighting) from secondary doors so visitors are funneled to it unambiguously',
          'All secondary doors are signed appropriately (e.g., "Emergency Exit Only — Alarm Will Sound") to deter routine use',
        ],
      },
      {
        key: 'lighting',
        name: 'Lighting',
        items: [
          'All exterior building façades are lit during darkness with no dark sides of the building',
          'Exterior door entries are lit so a person at the door can be recognized on camera and from inside',
          'Roof-edge or rooftop lighting allows after-hours patrol or maintenance access without flashlights',
        ],
      },
      {
        key: 'maintenance',
        name: 'Maintenance & Image',
        items: [
          'The building façade is free of graffiti, broken windows, and visible damage',
          'Exterior signage, door hardware, and lighting fixtures are maintained and current',
        ],
      },
    ],
  },
  {
    key: 'lobby_reception',
    name: 'Main Lobby, Reception & Visitor Management',
    order: 5,
    description:
      "Evaluate the main public lobby — the visitor's first impression and the building's primary chokepoint. Observe reception layout, sight lines from reception to the entry vestibule, visitor processing workflow, and the transition from public lobby to controlled employee space.",
    principles: [
      {
        key: 'natural_surveillance',
        name: 'Natural Surveillance',
        items: [
          'The reception/security desk has direct sight line to the primary exterior door and the full lobby',
          'Reception staff can see arriving visitors before the visitor reaches the desk (no concealed approach)',
          'The lobby is monitored by camera with recording, including coverage of the reception desk and any side doors',
          'A designated customer waiting area is visible from reception and not isolated in an unstaffed alcove or back-corner seating',
          'Customer meeting rooms preserve sight line from outside (vision panel, glass wall) or are equipped with a panic/duress button so employees are not isolated during difficult conversations',
        ],
      },
      {
        key: 'access_control',
        name: 'Access Control',
        items: [
          'A vestibule or transaction barrier separates the public lobby from the employee-controlled portion of the building',
          'All visitors check in at reception and are issued a visitor badge before entering the controlled portion of the building',
          'Reception distinguishes customer visitors from vendor/contractor sign-ins so each is routed and badged appropriately',
          'Visitor badges are visually distinct from employee badges and use a self-expiring or dated mechanism so reuse is detected',
          'Visitors are escorted by a host employee, or are routed through a reception-controlled door, before entering office floors',
          'A panic alarm or duress button is present at the reception desk and tested on a known schedule',
          'The transition door from lobby to employee space is controlled by card reader, not propped, and re-locks reliably',
        ],
      },
      {
        key: 'territorial_reinforcement',
        name: 'Territorial Reinforcement',
        items: [
          'A clearly posted visitor policy or sign-in expectation is visible to arriving visitors',
          "Reception's location, signage, and orientation make it obvious that all visitors must check in before proceeding",
        ],
      },
      {
        key: 'security_technology',
        name: 'Security Systems & Technology',
        items: [
          'Reception staff have a workstation view (or shared monitor) of relevant exterior and lobby cameras',
          'The visitor management system (paper log or software) captures visitor name, host, time in/out, and badge number',
        ],
      },
      {
        key: 'maintenance',
        name: 'Maintenance & Image',
        items: [
          'The lobby is well-maintained, brightly lit, and projects a controlled, professional image consistent with corporate ownership',
        ],
      },
    ],
  },
  {
    key: 'loading_mail',
    name: 'Loading Dock, Mailroom & Service Entries',
    order: 6,
    description:
      'Evaluate all paths by which goods, mail, packages, and contractors enter the building. This is the highest-volume non-visitor entry stream and consistently the highest-risk receiving point for prohibited items, suspicious packages, and unauthorized after-hours entry.',
    principles: [
      {
        key: 'natural_surveillance',
        name: 'Natural Surveillance',
        items: [
          'The loading dock is visible from a regularly staffed position, security camera, or both at all times of dock operation',
          'Mailroom intake is observable from another staffed area or by camera covering the receiving counter',
          'The exterior approach to the loading dock is camera-covered with continuous recording',
        ],
      },
      {
        key: 'access_control',
        name: 'Access Control',
        items: [
          'The loading dock overhead door and any pedestrian door are kept closed and locked when not actively in use',
          'Vendors, delivery drivers, and contractors check in at the dock or at reception and are issued a temporary badge before entering the building',
          'The mailroom has dedicated access control (card reader or staffed sign-in) separating it from the rest of the office space',
          'A documented suspicious-package protocol (tell-tale signs, isolation procedure, 911 escalation) is posted in or near the mailroom',
          'Service entries (janitor, vendor, contractor doors) are alarmed, exit-only or card-controlled, and not propped during business hours',
        ],
      },
      {
        key: 'security_technology',
        name: 'Security Systems & Technology',
        items: [
          'Mail and packages are screened (visual inspection at minimum; X-ray, K9, or vendor-screening service if higher tier) before distribution into the building',
          "The mailroom HVAC is isolated from, or capable of being isolated from, the building's central air handling in the event of a suspicious substance release",
          'A package-receiving log records inbound deliveries, sender, and recipient for accountability',
        ],
      },
      {
        key: 'territorial_reinforcement',
        name: 'Territorial Reinforcement',
        items: [
          'The loading-dock area is signed as "Authorized Personnel Only — Deliveries Only" so unauthorized foot traffic is deterred',
        ],
      },
      {
        key: 'maintenance',
        name: 'Maintenance & Image',
        items: [
          'The dock and mailroom are clean, organized, and free of accumulated packaging, prop-open wedges, and unsecured tools',
        ],
      },
    ],
  },
  {
    key: 'vertical_circulation',
    name: 'Vertical Circulation (Elevators, Stairwells, Floor Lobbies)',
    order: 7,
    description:
      'Evaluate how people move between floors. Observe elevator access control, stairwell security and surveillance, floor-lobby transitions, and the relationship between vertical circulation and emergency egress.',
    principles: [
      {
        key: 'natural_surveillance',
        name: 'Natural Surveillance',
        items: [
          'Elevator interiors are camera-covered with recording',
          'Stairwells are camera-covered at landings or have alarmed door contacts so unauthorized travel is detected',
          'Floor lobbies (elevator vestibules on each floor) are visible from a regularly occupied position on that floor',
        ],
      },
      {
        key: 'access_control',
        name: 'Access Control',
        items: [
          'Elevator floor selection requires a credential after hours (or all-times for restricted floors), so unauthenticated travel is blocked',
          'Stairwell doors permit free egress (life-safety code) but re-entry from the stairwell to office floors is controlled by card reader',
          'Stairwell re-entry is permitted on at least every fourth floor and on the floor of discharge, in line with code, so occupants are never trapped in a stairwell',
          'The path from the stairwell discharge to the exterior exit door is unobstructed and well lit',
          'Roof access from the top stairwell is locked, alarmed, and signed as restricted',
        ],
      },
      {
        key: 'lighting',
        name: 'Lighting',
        items: [
          'All stairwells are lit at code-required levels with no out or dim fixtures',
          'Floor lobbies and elevator vestibules are lit to recognize faces on camera',
        ],
      },
      {
        key: 'maintenance',
        name: 'Maintenance & Image',
        items: [
          'Stairwells are free of stored materials, propped doors, and accumulated trash',
          'Elevator cab interiors are clean, undamaged, and free of graffiti',
        ],
      },
    ],
  },
  {
    key: 'office_floors',
    name: 'Office Floors & Workstations',
    order: 8,
    description:
      'Evaluate the open-office areas, executive suites, conference rooms, break rooms, and copy/print rooms across all floors. Look for clean-desk practices, secured executive areas, and conference-room surveillance considerations. Single-tenant means uniform access control across the floor.',
    principles: [
      {
        key: 'natural_surveillance',
        name: 'Natural Surveillance',
        items: [
          'Workstation layout preserves sight lines across the open floor plan rather than creating hidden alcoves or screened workstations',
          'Conference rooms with glass walls or interior windows allow casual observation of activity from circulation paths',
          'Cubicle and partition heights do not exceed five feet in primary work areas, in line with CPTED office surveillance guidance',
        ],
      },
      {
        key: 'access_control',
        name: 'Access Control',
        items: [
          'Executive suite, executive assistant area, or C-suite floor is separated from general office space by access control',
          'Conference rooms used for sensitive discussions are lockable when in use',
          'Print/copy rooms with multifunction devices that handle sensitive documents are positioned in low-foot-traffic locations with reasonable visibility',
          'Employee badging policy requires badges to be worn visibly while on the floor',
        ],
      },
      {
        key: 'territorial_reinforcement',
        name: 'Territorial Reinforcement',
        items: [
          'Floor signage and wayfinding establish departmental identity (e.g., "Claims Operations — Floor 3") so visitors understand whose territory they have entered',
          'Executive and restricted floors are signed and visually treated to reinforce that the space is access-controlled',
        ],
      },
      {
        key: 'behavioral_routine',
        name: 'Behavioral & Routine Considerations',
        items: [
          'A clean-desk practice is in effect for sensitive paper records (claims, PII, HR) at end of day',
          'Workstations are configured so that screens displaying confidential information are not visible from public corridors or windows',
          'Employees know how to challenge or report a person on the floor without a visible badge',
        ],
      },
      {
        key: 'maintenance',
        name: 'Maintenance & Image',
        items: [
          'Office floors are clean, well-maintained, and project a controlled corporate image consistent with the lobby presentation',
        ],
      },
    ],
  },
  {
    key: 'critical_restricted',
    name: 'Critical & Restricted Areas',
    order: 9,
    description:
      'Evaluate the rooms that, if compromised, take down the business or expose the company to significant liability — server room, telecom/network closets (MDF/IDF), executive suite, HR records, file rooms, mechanical rooms, electrical rooms, water service entry, and the emergency generator. These share a CPTED problem profile (high-value, low-foot-traffic, must-be-locked, must-be-logged).',
    principles: [
      {
        key: 'natural_surveillance',
        name: 'Natural Surveillance',
        items: [
          'Doors to critical rooms are visible from a regularly staffed position or are camera-covered',
          'Activity in or around mechanical/electrical/utility rooms is observable from corridors rather than from unmonitored hallway dead-ends',
        ],
      },
      {
        key: 'access_control',
        name: 'Access Control',
        items: [
          'The server room / data center has access control with audit logging (card reader at minimum; biometric where the data sensitivity warrants it)',
          'Main and floor-level telecom/network closets (often labeled MDF and IDF) are locked at all times and access is limited to IT and authorized vendors',
          'HR records, claim files, and other PII storage areas are behind access-controlled doors with key or badge logging',
          'Mechanical, electrical, and elevator-equipment rooms are locked and signed as restricted',
          'The water service entry, fire-pump room, and any chemical or fuel storage areas are locked and signed',
          'The emergency generator and fuel storage are protected by perimeter fencing, locked enclosure, or restricted-access yard',
        ],
      },
      {
        key: 'security_technology',
        name: 'Security Systems & Technology',
        items: [
          'Server room and telecom/network closets (MDF and IDF rooms) are camera-covered with recording',
          'Door-position contacts on critical rooms report to the security alarm panel and trigger after-hours alerts',
          'Access logs for critical rooms are reviewed on a defined cadence (the security director can describe the cadence and reviewer)',
        ],
      },
      {
        key: 'maintenance',
        name: 'Maintenance & Image',
        items: [
          'Critical rooms are kept clean and free of stored unrelated materials that would obscure equipment or block egress',
          'Restricted-area signage is current, legible, and free of damage',
        ],
      },
    ],
  },
  {
    key: 'security_technology',
    name: 'Building Systems & Security Technology',
    order: 10,
    description:
      'Evaluate the security infrastructure as a system: CCTV, access control platform, intrusion alarm, mass notification, fire/life-safety integration, and the security operations center (if present). This zone tests whether the technology investments are functional, monitored, and integrated rather than installed-and-forgotten.',
    principles: [
      {
        key: 'security_technology',
        name: 'Security Systems & Technology',
        items: [
          'The access control system is unified across the entire building (single-tenant context — one platform, one credential per employee)',
          'The access control system can immediately disable a credential and the security director can describe the revocation workflow',
          'Camera footage is retained for at least 30 days (90 days preferred per CPTED office guidance)',
          'Cameras are positioned and resolved to support facial recognition at intended distances; non-working cameras have been repaired or removed',
          'The intrusion alarm system is monitored 24/7 (in-house SOC or central station) and the monitoring contract is current',
          'A mass notification system is in place that can reach all building occupants (intercom/PA, SMS, desktop alerts, or combination) and has been tested within the last 12 months',
          'The security system is integrated with fire/life-safety such that fire alarm activation releases fail-safe doors and elevators recall in line with code',
          'A documented panic-alarm capability exists at reception, executive areas, and HR with a tested response protocol',
        ],
      },
      {
        key: 'maintenance',
        name: 'Maintenance & Image',
        items: [
          'Security technology (cameras, readers, alarm panels, mass-notification devices) shows no visible damage, missing covers, or out-of-service indicators',
          'Documentation, drawings, and credentials lists are current and reviewed on a stated cadence',
        ],
      },
    ],
  },
  {
    key: 'workplace_violence_readiness',
    name: 'Workplace Violence & Active-Threat Readiness',
    order: 11,
    description:
      'Evaluate the program-level capability to prevent, respond to, and recover from workplace violence, active-assailant, and targeted-violence events. Most items are verifiable through the security director, written EAP, training records, and walk-bys of mass-notification and lockdown infrastructure. Item is N/A only if the company genuinely lacks the program — score 1 if absent, not N/A.',
    principles: [
      {
        key: 'behavioral_routine',
        name: 'Behavioral & Routine Considerations',
        items: [
          'A documented Workplace Violence Prevention policy exists and is communicated to all employees on hire and at a defined refresher cadence',
          'A multidisciplinary Threat Assessment Team (security, HR, legal, mental-health resource, LE liaison) is in place and meets on a defined cadence to review concerning behavior reports',
          'A confidential employee-reporting channel exists for threats, intimidation, and concerning behavior, and employees know how to use it',
          'Pre-employment screening and a documented termination protocol (badge return, escort, threat assessment for high-risk separations) are in place',
          'Customer-facing staff (claims, policy service, reception) have received de-escalation and hostile-customer response training within the last 24 months',
        ],
      },
      {
        key: 'emergency_preparedness',
        name: 'Emergency Preparedness',
        items: [
          'A written Emergency Action Plan (EAP) covering fire, severe weather, medical, bomb threat, and active assailant is current and accessible to floor wardens',
          'Run-Hide-Fight (or equivalent ALICE-style) training has been delivered to all employees within the last 24 months',
          'Lockdown drills have been conducted within the last 12 months and after-action notes are retained',
          'Floor wardens or a building emergency-response team are designated, named, and trained, with backups identified for absences',
          'Designated assembly/rally points (and inclement-weather alternates) are identified for evacuation accountability',
        ],
      },
      {
        key: 'access_control',
        name: 'Access Control',
        items: [
          'The building has a tested capability to immediately lock all access-controlled doors and disable card readers on command (lockdown card or SOC console)',
          'The building has a tested capability to immediately stop elevators at the next floor so they do not recall to the lobby during an active threat',
          'Designated rooms or floors have lockable interior doors so occupants can shelter in place, and employees know which rooms qualify',
        ],
      },
      {
        key: 'security_technology',
        name: 'Security Systems & Technology',
        items: [
          'Mass notification devices (PA, desktop alert, SMS) reach all areas of the building including stairwells, restrooms, and parking; coverage has been verified by drill',
          'Floor plans, riser diagrams, and access credentials/keys are pre-staged for delivery to law enforcement during an incident (e.g., Knox Box, lobby lockbox, or pre-arranged digital share)',
          "The security director has a documented coordination point of contact with the Volusia Sheriff's Office (or local LE) and has hosted a familiarization walkthrough within the last 24 months",
        ],
      },
      {
        key: 'maintenance',
        name: 'Maintenance & Image',
        items: [
          'Mass notification, panic alarm, and lockdown systems are tested on a documented schedule and test logs are retained',
          'EAP documents, evacuation maps, and rally-point signage on every floor are current and legible',
          'Post-incident response resources (EAP, victim assistance contacts, employee assistance program, business continuity playbook) are documented and assigned to a named owner',
        ],
      },
    ],
  },
];

/** Total number of checklist items across all commercial office zones */
export const COMMERCIAL_OFFICE_TOTAL_ITEM_COUNT = COMMERCIAL_OFFICE_ZONES.reduce(
  (total, zone) =>
    total + zone.principles.reduce((zoneTotal, p) => zoneTotal + p.items.length, 0),
  0,
);
