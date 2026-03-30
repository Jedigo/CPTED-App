import type { ZoneDefinition } from '../types';

export const CHRISTIAN_ZONES: ZoneDefinition[] = [
  {
    key: 'perimeter_parking',
    name: 'Property Perimeter & Parking',
    order: 1,
    description:
      'Assess the property boundaries, signage, vehicular access, and parking areas. Evaluate how the site is perceived from the street and by visitors arriving for services.',
    principles: [
      {
        key: 'natural_surveillance',
        name: 'Natural Surveillance',
        items: [
          'Parking lot is visible from the street and from at least one occupied building entrance',
          'No dense vegetation, walls, or structures creating concealment near parking areas',
          'Drop-off and pick-up zones are clearly visible from interior gathering spaces',
          'Perimeter has clear sight lines — no blind corners along property edges',
        ],
      },
      {
        key: 'access_control',
        name: 'Access Control',
        items: [
          'Vehicular entry points are limited and clearly defined (not open on all sides)',
          'Bollards or barriers protect building entrances and gathering areas from vehicle approach',
          'Parking lot has designated visitor, staff, and accessible spaces clearly marked',
          'Perimeter fencing or boundary markers control pedestrian access to the property',
        ],
      },
      {
        key: 'territorial_reinforcement',
        name: 'Territorial Reinforcement',
        items: [
          'Property name, service times, and address clearly visible from the street',
          'Signage directs visitors to main entrance and parking areas',
          'Property boundaries are clearly defined and maintained',
        ],
      },
      {
        key: 'maintenance',
        name: 'Maintenance & Image',
        items: [
          'Parking lot surface is in good condition (no potholes, faded markings, debris)',
          'Perimeter landscaping is maintained and does not create hiding spots',
        ],
      },
    ],
  },
  {
    key: 'building_exterior',
    name: 'Building Exterior & Grounds',
    order: 2,
    description:
      'Walk the full exterior of the building. Evaluate the grounds, secondary doors, utility areas, and overall building envelope security.',
    principles: [
      {
        key: 'natural_surveillance',
        name: 'Natural Surveillance',
        items: [
          'All sides of the building are visible from parking areas, neighboring properties, or public roads',
          'No hidden alcoves, recessed doorways, or utility areas creating concealment opportunities',
          'Playground or outdoor gathering areas are visible from interior occupied spaces',
          'Outdoor event areas (courtyards, fire pits, baptistry) are visible from building interior',
        ],
      },
      {
        key: 'access_control',
        name: 'Access Control',
        items: [
          'Secondary and emergency exit doors are locked from outside (exit-only hardware)',
          'Utility rooms, HVAC equipment, and roof access points are secured',
          'Dumpster and storage areas are enclosed or secured and not adjacent to building entry points',
          'Gas and electric utility entry points are secured and not publicly accessible',
          'Exterior playgrounds are enclosed by a sturdy fence with a restricted entry point',
          'Electrical panels and lighting switches are inaccessible to the public',
        ],
      },
      {
        key: 'territorial_reinforcement',
        name: 'Territorial Reinforcement',
        items: [
          'Building exterior communicates active use and care (no boarded windows, peeling paint, or neglect)',
          'Grounds show regular maintenance and community investment',
        ],
      },
      {
        key: 'maintenance',
        name: 'Maintenance & Image',
        items: [
          'Building exterior is free of graffiti, vandalism, or visible damage',
          'Landscaping around the building follows the 2\'/6\' rule (shrubs under 2 ft, canopies above 6 ft)',
        ],
      },
    ],
  },
  {
    key: 'main_entry',
    name: 'Main Entry & Foyer/Lobby',
    order: 3,
    description:
      'Evaluate the primary entrance experience — from the approach to the greeting/reception area. This is where first impressions and initial access decisions occur.',
    principles: [
      {
        key: 'natural_surveillance',
        name: 'Natural Surveillance',
        items: [
          'Main entrance is clearly identifiable and visible from the parking area',
          'Foyer/lobby has windows or sight lines to the exterior approach',
          'Greeters, welcome team, or reception staff are positioned to observe and engage all arriving visitors',
        ],
      },
      {
        key: 'access_control',
        name: 'Access Control',
        items: [
          'Main entry doors can be locked or controlled during services (single point of entry when needed)',
          'Foyer or lobby creates a transitional space between outside and worship areas',
          'All visitors are funneled through 1-2 well-marked entrances rather than multiple scattered access points',
        ],
      },
      {
        key: 'activity_support',
        name: 'Activity Support',
        items: [
          'Visitor check-in or welcome center is positioned centrally near the main entrance to serve as both information point and visual deterrent',
        ],
      },
      {
        key: 'maintenance',
        name: 'Maintenance & Image',
        items: [
          'Entry area is clean, well-lit, and welcoming (good first impression)',
        ],
      },
    ],
  },
  {
    key: 'sanctuary',
    name: 'Worship Center & Stage/Platform',
    order: 4,
    description:
      'Assess the primary worship space for emergency preparedness, sight lines, stage/platform security, and egress.',
    principles: [
      {
        key: 'natural_surveillance',
        name: 'Natural Surveillance',
        items: [
          'Ushers or safety team members can observe all seating areas and entry points from their positions',
          'Balcony, choir loft, or elevated areas are monitored or restricted when not in use',
          'Stage/platform area is visible from multiple vantage points (no hidden approaches)',
          'Sound booth/AV production area has clear sight lines to the stage and all entry points',
        ],
      },
      {
        key: 'access_control',
        name: 'Access Control',
        items: [
          'Backstage and production areas are locked when unoccupied',
          'Sound booth and AV equipment are secured (locked cabinet or restricted room)',
          'Access to stage/platform area can be controlled during services',
          'Baptistry area has locked access when not in use (doors and stair access secured)',
        ],
      },
      {
        key: 'target_hardening',
        name: 'Target Hardening & Emergency Preparedness',
        items: [
          'Emergency exits are clearly marked, unobstructed, and operable from inside',
          'Evacuation plan is posted and congregation has been briefed on emergency procedures',
          'Panic alarm is accessible from the sound/media booth and the podium/stage area',
          'Worship center doors can be secured for lockdown during an active threat',
        ],
      },
    ],
  },
  {
    key: 'fellowship_spaces',
    name: 'Fellowship, Cafe & Community Spaces',
    order: 5,
    description:
      'Evaluate fellowship halls, kitchens, cafes, gymnasiums, and multi-purpose spaces used for community events and gatherings.',
    principles: [
      {
        key: 'natural_surveillance',
        name: 'Natural Surveillance',
        items: [
          'Fellowship hall and meeting rooms have windows or open sight lines from adjacent spaces',
          'Kitchen area has a serving window or pass-through that maintains visual connection',
          'Cafe/bookstore area has open sight lines and is visible from staffed areas — when near the entry, supports natural surveillance of arriving visitors',
          'Gymnasium/recreation areas have windows or open access points allowing visual monitoring',
        ],
      },
      {
        key: 'access_control',
        name: 'Access Control',
        items: [
          'Meeting rooms can be locked when not in use',
          'Kitchen has lockable storage for sharp objects and hazardous materials',
          'Exterior doors from fellowship spaces are alarmed or monitored',
          'Gymnasium storage rooms are locked when not in use',
        ],
      },
      {
        key: 'maintenance',
        name: 'Maintenance & Image',
        items: [
          'Fellowship spaces are clean, organized, and free of clutter that could impede evacuation',
          'Emergency exits from fellowship areas are clearly marked and unobstructed',
        ],
      },
    ],
  },
  {
    key: 'education_children',
    name: 'Children\'s & Youth Ministry Areas',
    order: 6,
    description:
      'Children\'s and youth ministry areas, classrooms, nurseries, and student spaces require the highest level of access control and supervision. Youth wings may operate semi-independently from the main facility.',
    principles: [
      {
        key: 'access_control',
        name: 'Access Control',
        items: [
          'Children\'s wing or area has controlled access (check-in/check-out system in place)',
          'Classroom doors have locks operable from inside and viewing windows or half-doors for supervision',
          'Restrooms near children\'s areas are single-occupancy or supervised',
          'Only authorized personnel can access nursery and children\'s rooms',
          'Youth/student ministry building or wing has controlled access separate from the main facility',
          'Youth areas have lockdown capability independent of main building',
          'Exterior doors on youth building are locked from outside (exit-only) during programming',
        ],
      },
      {
        key: 'natural_surveillance',
        name: 'Natural Surveillance',
        items: [
          'Hallways in children\'s and youth areas have clear sight lines with no hidden alcoves',
          'Classroom and youth activity rooms have vision panels or windows allowing visual monitoring from hallways',
          'Youth outdoor activity areas are visible from the youth building interior',
        ],
      },
      {
        key: 'target_hardening',
        name: 'Target Hardening',
        items: [
          'Classrooms have lockdown capability (doors lockable from inside, window coverings available)',
        ],
      },
      {
        key: 'activity_support',
        name: 'Activity Support',
        items: [
          'Two-adult rule or open-door policy is practiced in children\'s and youth ministry areas',
        ],
      },
    ],
  },
  {
    key: 'admin_support',
    name: 'Administrative & Support Areas',
    order: 7,
    description:
      'Evaluate offices, financial areas, server/IT rooms, and maintenance spaces. These areas contain sensitive information and valuables.',
    principles: [
      {
        key: 'access_control',
        name: 'Access Control',
        items: [
          'Administrative offices are locked when unoccupied',
          'Financial records, offering storage, and safe are in a secured area with limited access',
          'Server room or IT closet is locked and access is restricted to authorized personnel',
        ],
      },
      {
        key: 'natural_surveillance',
        name: 'Natural Surveillance',
        items: [
          'Office area reception or front desk has a clear view of approaching visitors',
          'No isolated offices without a secondary exit or line of sight to common areas',
        ],
      },
      {
        key: 'maintenance',
        name: 'Maintenance & Image',
        items: [
          'Storage rooms and maintenance areas are organized and locked when not in use',
          'Key control system is in place (master keys tracked, locks rekeyed when staff leave)',
        ],
      },
    ],
  },
  {
    key: 'lighting_surveillance',
    name: 'Exterior Lighting & Surveillance',
    order: 8,
    description:
      'Evaluate all exterior lighting and surveillance systems. Churches are often unoccupied for extended periods, making lighting and surveillance critical deterrents.',
    principles: [
      {
        key: 'lighting',
        name: 'Lighting Coverage',
        items: [
          'All building entrances have bright, working lights that illuminate visitors\' faces',
          'Parking lot has consistent lighting with no dark gaps between fixtures',
          'Walkways between parking and building entrances are well-lit',
          'Motion-activated lights cover vulnerable areas (rear of building, storage, utility areas)',
          'Exterior lights on photocell or timer — not solely manual switch',
        ],
      },
      {
        key: 'surveillance',
        name: 'Surveillance Systems',
        items: [
          'Security cameras cover parking lot, main entrance, and building perimeter',
          'Camera system records continuously with adequate storage (minimum 30 days)',
        ],
      },
      {
        key: 'maintenance',
        name: 'Maintenance & Image',
        items: [
          'All exterior light fixtures functioning (no burned-out bulbs or damaged fixtures)',
        ],
      },
    ],
  },
];

/** Total number of checklist items across all Christian church zones */
export const CHRISTIAN_TOTAL_ITEM_COUNT = CHRISTIAN_ZONES.reduce(
  (total, zone) =>
    total + zone.principles.reduce((zoneTotal, p) => zoneTotal + p.items.length, 0),
  0,
);
