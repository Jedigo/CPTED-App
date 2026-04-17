/**
 * Townhome Item Guidance
 *
 * Seeded from residential ITEM_GUIDANCE — items shared verbatim with the
 * residential template inherit residential guidance automatically. Only the
 * genuinely new townhome items (Shared Boundaries zone, HOA/common-area items,
 * unit numbering, peephole) need explicit entries here.
 */

import { ITEM_GUIDANCE, type ItemGuidance } from './item-guidance';

const townhomeOverrides: Array<[string, ItemGuidance]> = [
  // ─── Zone 2: Front Entry & Stoop ───
  [
    'Peephole or video doorbell installed and functional',
    {
      standard:
        'A peephole or video doorbell lets the resident identify visitors before opening the door — critical in attached housing where strangers can loiter unobserved at a neighbor\'s stoop.',
      improvement:
        'Install a 180-degree wide-angle peephole at comfortable eye level, or install an HOA-permitted video doorbell. Video doorbells also capture evidence of package theft and suspicious activity.',
    },
  ],
  [
    'Unit clearly distinguished from adjacent units (door color, planter, mat, or fixture)',
    {
      standard:
        'Visually differentiating the unit from neighboring units reinforces territorial ownership and helps emergency responders and visitors identify it quickly.',
      improvement:
        'Add HOA-approved distinguishing elements: unique door color, planter, mat, or light fixture. Even small touches signal that the unit is actively claimed and occupied.',
    },
  ],

  // ─── Zone 3: Shared Boundaries (NEW ZONE) ───
  [
    'Shared breezeway or walkway between units is visible from neighboring units or common areas',
    {
      standard:
        'Shared breezeways are classic concealment zones in attached housing. Mutual visibility from neighboring units or common areas deters loitering and approach to side entries.',
      improvement:
        'Trim vegetation along breezeways; add lighting if dark gaps exist. Advocate with the HOA for breezeway-facing windows or security cameras in common areas.',
    },
  ],
  [
    'End unit: external side visible from at least one neighbor or common area (mark N/A for interior units)',
    {
      standard:
        'End units have one external side exposed to public view — that side needs natural surveillance the same as a single-family side yard.',
      improvement:
        'Keep the external side free of concealment (dense shrubs, stored items). Coordinate with the adjacent-property neighbor so windows or sight lines cover that side.',
    },
  ],
  [
    'No concealment opportunities along shared walls (utility enclosures, AC units, recessed alcoves)',
    {
      standard:
        'Utility alcoves, HVAC enclosures, and recessed areas along shared walls provide hiding places adjacent to the unit envelope.',
      improvement:
        'Eliminate or open up concealment zones: remove fencing around utility areas where possible, add lighting, and trim vegetation. Report structural concealment issues to the HOA.',
    },
  ],
  [
    'Shared utility access points (gas meter, electrical panel, hose bib) secured or in good repair',
    {
      standard:
        'Utility access points that are shared or exposed can be tampered with to cut power, cut water, or gain access — common tactics in attached-housing attacks.',
      improvement:
        'Report damaged or unsecured utility enclosures to the HOA or utility company. Lock or cage exposed utilities where permitted. Ensure meter areas are well-lit and observable.',
    },
  ],
  [
    'No easy-climb features along shared or external walls (trellises, stored items, A/C units under windows)',
    {
      standard:
        'Any object that provides a boost to second-story windows or roofs defeats ground-floor security measures.',
      improvement:
        'Move stored items, planters, or furniture away from walls and windows. Remove trellises near upper windows. Coordinate with HOA to relocate shared A/C units if positioned under windows.',
    },
  ],
  [
    'End unit: side gate present, working, with self-latching or locking hardware (mark N/A for interior units)',
    {
      standard:
        'An end-unit side gate controls access between the front and rear of the unit — an unsecured side gate gives offenders a direct unobserved route to the back.',
      improvement:
        'Install or repair a side gate with self-latching hardware and a padlock or keyed lock. Verify HOA-approved gate styles before replacement.',
    },
  ],
  [
    'Unit boundary clearly delineated from neighbor (paint, planter, decorative element)',
    {
      standard:
        'Clear delineation between your unit and the neighbor reinforces territorial ownership — the single strongest non-physical CPTED signal.',
      improvement:
        'Add HOA-permitted markers: differing door color, planters flanking the entry, a decorative mailbox or house-number plaque, or unique landscaping.',
    },
  ],
  [
    'HOA-permitted territorial markers used where allowed',
    {
      standard:
        'Within HOA rules, every permitted territorial marker (planter, flag, decor) strengthens the visible claim on the unit.',
      improvement:
        'Review the HOA rulebook for permitted exterior modifications. Use every allowance: planters, seasonal decor, door hardware, house numbers. Small cumulative additions add up.',
    },
  ],
  [
    'Shared walls in good visible condition (no impact damage, no obvious pest entry points)',
    {
      standard:
        'Damage to shared walls can indicate structural vulnerabilities and, rarely, attempts to bypass via the wall assembly.',
      improvement:
        'Report visible impact damage, cracks, or pest entry points to the HOA. Document with photos. Address pest entry points promptly — rodents and insects enlarge openings over time.',
    },
  ],
  [
    'Shared walkway or breezeway free of stored junk, debris, or unused items',
    {
      standard:
        'Shared walkways that accumulate clutter become concealment zones and signal neglect of the shared boundary.',
      improvement:
        'Keep your portion of shared walkways clear. If neighbors store items that block sight lines, raise the issue with HOA enforcement rather than directly.',
    },
  ],

  // ─── Zone 4: Rear Patio ───
  [
    'Shared rear alley or parking (if applicable) is overlooked by other units',
    {
      standard:
        'Rear alleys and parking in attached housing are high-risk zones unless multiple units have sight lines onto them.',
      improvement:
        'Advocate with the HOA for rear-alley lighting and cameras. Keep rear-facing window blinds open or sheer. Report dark zones to management.',
    },
  ],

  // ─── Zone 5: Garage / Parking ───
  [
    'Shared alley or parking area is overlooked by multiple units',
    {
      standard:
        'Shared vehicle areas in attached housing require multi-unit surveillance — if no unit has a window facing the parking, the area becomes a crime target.',
      improvement:
        'Advocate with the HOA for a shared-parking surveillance camera or improved lighting. Keep your rear or garage-facing blinds partially open during daylight.',
    },
  ],
  [
    'Assigned parking spot clearly marked with unit number',
    {
      standard:
        'Clear unit-number marking on assigned parking supports territorial reinforcement and helps identify unauthorized vehicles.',
      improvement:
        'Request the HOA paint or replace faded unit-number markings. Add an HOA-permitted parking sign if none exists.',
    },
  ],

  // ─── Zone 6: Exterior Lighting ───
  [
    'HOA common-area lighting (shared walkways, parking, alleys) in good repair and adequate',
    {
      standard:
        'HOA-maintained common-area lighting is typically the first line of defense at the community boundary. Dark common areas expose all units to risk.',
      improvement:
        'Report burned-out common-area fixtures to HOA management immediately. Document dark spots with photos and advocate for additional fixtures at the next HOA meeting.',
    },
  ],

  // ─── Zone 7: Windows & Interior ───
  [
    'Vents or transoms on shared walls (if any exist between units) are secured',
    {
      standard:
        'Any opening between units (shared vent, transom, crawlspace access) is a potential crossover route that must be secured.',
      improvement:
        'Inspect shared-wall vents, transoms, or access panels for secure fasteners. Install screens, secured covers, or alarm contacts. Report structural concerns to HOA.',
    },
  ],
];

export const TOWNHOME_ITEM_GUIDANCE = new Map<string, ItemGuidance>([
  ...ITEM_GUIDANCE.entries(),
  ...townhomeOverrides,
]);
