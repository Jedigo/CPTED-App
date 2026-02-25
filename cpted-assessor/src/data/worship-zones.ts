import type { ZoneDefinition } from '../types';

export const WORSHIP_ZONES: ZoneDefinition[] = [
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
        ],
      },
      {
        key: 'access_control',
        name: 'Access Control',
        items: [
          'Secondary and emergency exit doors are locked from outside (exit-only hardware)',
          'Utility rooms, HVAC equipment, and roof access points are secured',
          'Dumpster and storage areas are enclosed or secured and not adjacent to building entry points',
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
    name: 'Main Entry & Narthex/Lobby',
    order: 3,
    description:
      'Evaluate the primary entrance experience — from the approach to the greeting/reception area. This is where first impressions and initial access decisions occur.',
    principles: [
      {
        key: 'natural_surveillance',
        name: 'Natural Surveillance',
        items: [
          'Main entrance is clearly identifiable and visible from the parking area',
          'Lobby/narthex has windows or sight lines to the exterior approach',
          'Greeters, ushers, or reception staff have a clear view of arriving visitors',
        ],
      },
      {
        key: 'access_control',
        name: 'Access Control',
        items: [
          'Main entry doors can be locked or controlled during services (single point of entry when needed)',
          'Vestibule or narthex creates a transitional space between outside and worship areas',
        ],
      },
      {
        key: 'activity_support',
        name: 'Activity Support',
        items: [
          'Greeting or welcome ministry is positioned to observe and engage all who enter',
          'Visitor check-in or information area is near the main entrance',
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
    name: 'Sanctuary & Worship Space',
    order: 4,
    description:
      'Assess the primary worship space for emergency preparedness, sight lines, sacred object security, and egress.',
    principles: [
      {
        key: 'natural_surveillance',
        name: 'Natural Surveillance',
        items: [
          'Ushers or safety team members can observe all seating areas and entry points from their positions',
          'Balcony, choir loft, or elevated areas are monitored or restricted when not in use',
          'Altar/chancel area is visible from multiple vantage points (no hidden approaches)',
        ],
      },
      {
        key: 'access_control',
        name: 'Access Control',
        items: [
          'Sacristy and vestry rooms are locked when unoccupied',
          'Tabernacle or sacred objects are secured (anchored, locked, or alarmed)',
          'Access to altar/chancel area can be controlled during services',
        ],
      },
      {
        key: 'target_hardening',
        name: 'Target Hardening & Emergency Preparedness',
        items: [
          'Emergency exits are clearly marked, unobstructed, and operable from inside',
          'Evacuation plan is posted and congregation has been briefed on emergency procedures',
        ],
      },
    ],
  },
  {
    key: 'fellowship_spaces',
    name: 'Fellowship & Community Spaces',
    order: 5,
    description:
      'Evaluate fellowship halls, kitchens, meeting rooms, and multi-purpose spaces used for community events and gatherings.',
    principles: [
      {
        key: 'natural_surveillance',
        name: 'Natural Surveillance',
        items: [
          'Fellowship hall and meeting rooms have windows or open sight lines from adjacent spaces',
          'Kitchen area has a serving window or pass-through that maintains visual connection',
        ],
      },
      {
        key: 'access_control',
        name: 'Access Control',
        items: [
          'Meeting rooms can be locked when not in use',
          'Kitchen has lockable storage for sharp objects and hazardous materials',
          'Exterior doors from fellowship spaces are alarmed or monitored',
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
    name: 'Education & Children\'s Areas',
    order: 6,
    description:
      'Children\'s ministry areas, classrooms, nurseries, and youth spaces require the highest level of access control and supervision.',
    principles: [
      {
        key: 'access_control',
        name: 'Access Control',
        items: [
          'Children\'s wing or area has controlled access (check-in/check-out system in place)',
          'Classroom doors have locks operable from inside and viewing windows or half-doors for supervision',
          'Restrooms near children\'s areas are single-occupancy or supervised',
          'Only authorized personnel can access nursery and children\'s rooms',
        ],
      },
      {
        key: 'natural_surveillance',
        name: 'Natural Surveillance',
        items: [
          'Hallways in children\'s areas have clear sight lines with no hidden alcoves',
          'Classroom doors have vision panels or windows allowing visual monitoring from hallways',
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
          'Two-adult rule or open-door policy is practiced in children\'s ministry areas',
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
      'Evaluate all exterior lighting and surveillance systems. Places of worship are often unoccupied for extended periods, making lighting and surveillance critical deterrents.',
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
          'Landscaping does not obstruct light fixtures or camera sight lines',
        ],
      },
    ],
  },
];

/** Total number of checklist items across all worship zones */
export const WORSHIP_TOTAL_ITEM_COUNT = WORSHIP_ZONES.reduce(
  (total, zone) =>
    total + zone.principles.reduce((zoneTotal, p) => zoneTotal + p.items.length, 0),
  0,
);
