/**
 * CPTED Item Guidance for Commercial Office (Single-Tenant HQ)
 *
 * Maps each commercial-office checklist item (by exact item_text) to:
 *   - standard: What CPTED best practice expects (1-2 sentences)
 *   - improvement: Specific actionable steps the organization can take (2-3 steps)
 *
 * Note on N/A vs. score 1 for Zone 11: when a program (EAP, TAT, drills) is
 * entirely absent, score 1 — do not score N/A. N/A is reserved for items
 * genuinely inapplicable (e.g., rooftop items when there is no rooftop access).
 */

import type { ItemGuidance } from './item-guidance';

export const COMMERCIAL_OFFICE_ITEM_GUIDANCE = new Map<string, ItemGuidance>([
  // ─── Zone 1: Site Perimeter & Approach ───
  [
    'The full property boundary is visible from the street or from on-site occupied positions without significant blind spots',
    {
      standard:
        'CPTED requires that property boundaries be observable from occupied vantage points so that intrusions and loitering are deterred by the perception of being watched.',
      improvement:
        "Walk the perimeter and identify blind spots created by vegetation, walls, outbuildings, or topography. Trim landscaping to the 2'/6' rule, add camera coverage to remote edges, or relocate parking/operations so occupied positions overlook the boundary.",
    },
  ],
  [
    "Perimeter landscaping follows the CPTED 2'/6' rule (shrubs trimmed below 2 ft, tree canopies above 6 ft) so sight lines are preserved",
    {
      standard:
        "The 2'/6' rule prevents landscaping from creating concealment: shrubs stay below 2 ft so a person cannot hide behind them, and tree canopies are raised above 6 ft so they don't block sight lines or lighting.",
      improvement:
        'Schedule landscape maintenance to trim shrubs below 2 ft and raise canopies above 6 ft. Replace overgrown plantings with low-growth species. Document the standard in the facilities maintenance contract.',
    },
  ],
  [
    'Remote or seldom-used edges of the property are visible from the building, internal roadways, or dedicated camera coverage',
    {
      standard:
        'Remote portions of large sites are common locations for trespass, dumping, and staging. CPTED extends surveillance to these edges through cameras, patrol routes, or building sight lines. Verified during the interior walk by reviewing camera coverage of remote edges with the security director.',
      improvement:
        'Identify remote edges (rear of property, retention ponds, vacant land). Add cameras with overlapping coverage, route security patrols through those areas on a schedule, or modify landscaping to open sight lines from the building.',
    },
  ],
  [
    'Vehicle approach is funneled through a clearly defined primary entrance with no informal cut-throughs from adjacent parcels',
    {
      standard:
        'Limiting vehicle entry points reduces the attack surface and channels traffic past observable, controllable chokepoints.',
      improvement:
        'Close informal cut-throughs with bollards, fencing, planters, or curbing. Mark the primary entrance clearly. Coordinate with adjacent property owners to prevent ad-hoc routing across boundaries.',
    },
  ],
  [
    'Hostile-vehicle mitigation (bollards, planters, knee-wall, or landscaped berm) protects the building face from ramming at the closest standoff approach',
    {
      standard:
        'FEMA 426/430 and CISA call for hostile-vehicle mitigation at the closest unobstructed vehicle approach to the building, particularly at lobby entries and ground-floor occupied areas.',
      improvement:
        'Install bollards (rated to ASTM F2656 or DOS K-rating when threat justifies it), heavy planters, knee-walls, or landscaped berms between drive lanes and pedestrian areas at the lobby and other high-occupancy entries. Decorative options can preserve aesthetics.',
    },
  ],
  [
    'Perimeter fencing, landscape berms, or natural barriers define the property edge along all sides exposed to public roadway or adjacent property',
    {
      standard:
        'A physical or symbolic boundary signals private ownership and establishes territorial reinforcement, deterring casual trespass.',
      improvement:
        'Install perimeter fencing, decorative walls, berms, or hedge rows along exposed property lines. Use semi-transparent fencing (ornamental metal) to preserve natural surveillance while still defining the boundary.',
    },
  ],
  [
    'Knox Box or equivalent first-responder access has been installed at a visible location for after-hours building entry',
    {
      standard:
        'A Knox Box provides police and fire personnel rapid keyed access to a locked building during an emergency, preventing forced-entry delays during life-safety responses.',
      improvement:
        "Coordinate with the Volusia Sheriff's Office and local fire department to install a Knox Box at the primary exterior entrance. Stock it with current master keys and access credentials. Verify the box's contents annually with the fire marshal.",
    },
  ],
  [
    'A monument sign or building-name signage at the primary approach establishes the property as private corporate territory',
    {
      standard:
        'Clear identifying signage reinforces territoriality: visitors immediately understand they are entering a defined corporate property.',
      improvement:
        'Install a monument sign or building-name signage at the property entrance. Use materials and lighting consistent with the corporate brand. Add address numbers for first-responder visibility.',
    },
  ],
  [
    'Signage at the perimeter directs visitors, deliveries, and employees to the appropriate entrances',
    {
      standard:
        'Wayfinding signage reduces confusion at the perimeter and prevents unauthorized foot/vehicle traffic from drifting into restricted operational areas.',
      improvement:
        'Audit perimeter signage and add directional signs for "Visitor Entrance," "Deliveries," and "Employee Entrance." Place signs at decision points (entry from the road, entry to parking). Use consistent symbology and color.',
    },
  ],
  [
    'Property-line markers (fencing, hedges, walls, or pavement transitions) clearly distinguish the corporate property from public right-of-way',
    {
      standard:
        'Property-line markers create the symbolic edge between public and private space, a foundational CPTED territoriality concept.',
      improvement:
        'Add or restore fencing, hedge rows, low walls, or pavement transitions (e.g., decorative concrete, banding) at the boundary. Ensure markers are continuous and consistent around the full perimeter.',
    },
  ],
  [
    'The perimeter is free of graffiti, litter, broken fencing, and signs of neglect that would signal reduced guardianship',
    {
      standard:
        "The Broken Windows principle within CPTED holds that visible signs of neglect invite further disorder. A clean, maintained perimeter signals active guardianship.",
      improvement:
        'Implement a daily perimeter walkthrough with same-day graffiti removal, litter pickup, and fencing repair. Track maintenance tickets to closure. Make perimeter maintenance a contracted facilities responsibility.',
    },
  ],
  [
    'Perimeter signage is clean, current, and free of obsolete or damaged elements',
    {
      standard:
        'Damaged or outdated signage signals neglect and undermines the territorial message of the rest of the perimeter.',
      improvement:
        'Inventory all perimeter signs annually. Replace damaged or faded signs. Remove signs referencing former tenants, defunct programs, or out-of-date contact numbers.',
    },
  ],

  // ─── Zone 2: Surface Parking & Pedestrian Circulation ───
  [
    'Parking areas are visible from occupied portions of the building (ground- or upper-floor windows, reception, or security control room)',
    {
      standard:
        'Natural surveillance from the building deters criminal activity in the parking lot. Occupied vantage points should overlook the lot continuously. Verified during the interior walk by looking out from reception and upper-floor windows toward the lot.',
      improvement:
        'Identify which building positions overlook the lot. Where coverage is thin, add cameras feeding to the security desk, relocate workstations to perimeter windows, or trim landscaping that blocks views.',
    },
  ],
  [
    'Pedestrian routes from parking to building entrances are open, direct, and visible without hidden alcoves or screened approaches',
    {
      standard:
        'Walking routes between parked vehicles and the building should be open and observable to prevent ambush at the most vulnerable moment of the visit.',
      improvement:
        "Designate primary walkways with painted crosswalks, signage, and lighting. Eliminate landscape features (tall hedges, brick screens) that create blind approaches. Channel pedestrians through observable routes via curbing or planters.",
    },
  ],
  [
    'Cameras provide overlapping coverage of all parking areas with no significant blind spots between fixtures',
    {
      standard:
        'Camera coverage should overlap so that an event captured at the edge of one camera is also captured by an adjacent camera, providing redundancy and multi-angle evidence. Verified at the SOC monitor — walk between cameras and have the security director confirm you appear on each adjacent camera with overlap at the edges.',
      improvement:
        'Conduct a camera coverage walkthrough at night, identifying blind spots. Add cameras or reposition existing ones to overlap. Document the coverage map with the camera vendor.',
    },
  ],
  [
    "Landscaping in and around the parking lot follows the 2'/6' rule so a person standing between vehicles is visible from a distance",
    {
      standard:
        "Landscape islands in parking lots commonly create concealment opportunities at vehicle level. The 2'/6' rule preserves sight lines through and across the lot.",
      improvement:
        'Replace tall island shrubs with ground cover or low ornamentals. Raise tree canopies above 6 ft. Add the 2/6 standard to the landscape maintenance contract.',
    },
  ],
  [
    'Visitor parking is clearly marked, located adjacent to the main entrance, and signed at the property approach',
    {
      standard:
        'Designated visitor parking close to the main entrance channels visitors past reception and away from operational/employee-only areas.',
      improvement:
        'Reserve stalls closest to the main entrance for visitors. Add pavement markings ("VISITOR") and overhead signage. Reinforce with signage at the property entry directing visitors to the correct lot.',
    },
  ],
  [
    'Employee-only parking sections are marked with signage or pavement treatments that distinguish them from visitor stalls',
    {
      standard:
        'Distinguishing employee from visitor parking helps security recognize unfamiliar vehicles in employee zones and reinforces territoriality.',
      improvement:
        'Add "Employee Parking" signage and color-coded pavement markings to employee-only sections. Issue employee parking decals or tags so unfamiliar vehicles are easy to spot.',
    },
  ],
  [
    'Vehicle entry/exit points are clearly marked, controlled by gate or stop control where appropriate, and minimized to the operational minimum',
    {
      standard:
        'Fewer, well-marked vehicle access points reduce the surveillance burden and channel vehicles past identifiable observation points.',
      improvement:
        'Close excess vehicle access points with bollards, curbing, or gates. Add stop controls or gate arms at remaining points for after-hours control. Mark each entry/exit clearly with directional signage.',
    },
  ],
  [
    'After-hours parking is restricted, and any after-hours arrivals are observable by security staff or via monitored cameras',
    {
      standard:
        'After-hours vehicles in the lot are higher-risk than daytime traffic. CPTED requires that they be observable so legitimate arrivals can be distinguished from intruders. Verified by interviewing the security director about after-hours arrival alerts and monitoring coverage.',
      improvement:
        'Post after-hours parking rules. Route after-hours camera feeds to a monitored station (in-house SOC or central station). Set automated alerts for vehicles arriving outside business hours.',
    },
  ],
  [
    'Parking areas are lit so faces can be recognized at 25 feet, in line with IES recommended practice for parking facilities',
    {
      standard:
        'IES Recommended Practice RP-20 sets minimum illuminance for parking facilities to allow face recognition — a fundamental safety and forensic-evidence requirement.',
      improvement:
        'Hire a lighting consultant or qualified electrician to measure foot-candle levels across the lot. Replace fixtures or relocate poles to meet IES RP-20. Convert to LED for consistent lumen output and lower maintenance.',
    },
  ],
  [
    'Light fixtures are spaced for uniformity (low light-to-dark ratio) without dark gaps between poles',
    {
      standard:
        'Uniformity matters as much as brightness: bright pools with dark gaps create eye-adaptation issues and concealment opportunities between poles.',
      improvement:
        'Measure the light-to-dark ratio across the lot. Where gaps are observed, add infill fixtures or upgrade to higher-output heads. Aim for a max-to-min ratio of 4:1 or better per IES guidance.',
    },
  ],
  [
    'Light fixtures are tamper- and vandal-resistant, mounted at heights that are not easily reached',
    {
      standard:
        'Vandal-resistant fixtures and mounting heights protect lighting infrastructure from deliberate disabling, which is a known pre-attack indicator.',
      improvement:
        'Replace ground-level wall packs with high-mount fixtures (typically 20-25 ft). Use polycarbonate lenses and tamper-resistant fasteners. Verify mounting hardware is intact during quarterly maintenance.',
    },
  ],
  [
    'All parking-area light fixtures are functioning, with no out, dim, or damaged units observed',
    {
      standard:
        'A single dark fixture creates a measurable concealment opportunity. Functional lighting is a deterrent only when it is reliably on.',
      improvement:
        'Establish a quick-response replacement protocol (within 72 hours of failure). Conduct monthly night walkthroughs to catch failures. Track replacements in the facilities CMMS.',
    },
  ],
  [
    'Pedestrian walkways between parking and the building are lit continuously (not just at endpoints)',
    {
      standard:
        'Continuous walkway lighting protects pedestrians at the most vulnerable point of the visit. Endpoint-only lighting leaves middle sections dark.',
      improvement:
        'Add bollard or pole-mounted fixtures along walkways at IES-recommended spacing. Avoid lighting only at parking and lobby (which creates dark middle gaps). Verify after-hours operation with a night walkthrough.',
    },
  ],
  [
    'Stall striping, directional arrows, and curb treatments are crisp and current rather than faded or obscured',
    {
      standard:
        'Crisp pavement markings reinforce territorial control and project active maintenance — both CPTED indicators of guardianship.',
      improvement:
        'Restripe the lot on a 3-5 year cycle. Repaint directional arrows and fire lanes annually. Refresh curb paint (yellow for fire lanes, red for no-parking) as it weathers.',
    },
  ],
  [
    'Designated visitor stalls are reinforced by signage and pavement markings',
    {
      standard:
        'Combining pavement markings with overhead signage creates redundant cues that reduce visitor confusion and reinforce employee-only zones.',
      improvement:
        'Add pavement-stenciled "VISITOR" lettering and post overhead signage at each visitor stall. Use a consistent color (often green or blue) distinct from employee stalls.',
    },
  ],
  [
    'Wayfinding signs guide visitors from parking to the main entry without ambiguity',
    {
      standard:
        'Clear wayfinding prevents visitors from wandering into operational areas and reinforces the main entry as the only correct path.',
      improvement:
        'Install directional signs at every parking decision point pointing to "Main Entrance" or "Visitor Reception." Use consistent design and place signs at pedestrian eye level along the walkway.',
    },
  ],
  [
    'The parking lot is free of abandoned vehicles, accumulated debris, broken pavement, and damaged stalls',
    {
      standard:
        'Visible disorder in the lot signals reduced guardianship and invites additional disorder per Broken Windows.',
      improvement:
        'Implement a daily lot inspection and same-day cleanup. Track abandoned vehicles via a 72-hour notice/tow process. Repair pavement damage within 30 days.',
    },
  ],
  [
    'Pavement markings, signs, and curb paint are maintained in legible condition',
    {
      standard:
        'Maintained markings reinforce the active-guardianship signal and ensure that traffic flow rules remain clear to visitors and employees.',
      improvement:
        'Schedule restriping and repainting on a documented cycle. Inspect after rain events and tropical storms. Track maintenance through facilities work orders.',
    },
  ],

  // ─── Zone 3: Grounds, Landscaping & Outdoor Common Areas ───
  [
    'Outdoor break, smoking, and eating areas are visible from inside the building or from regularly traveled walkways',
    {
      standard:
        'Outdoor employee-gathering areas should be observable from occupied building positions so that employees feel safe and incidents are witnessed.',
      improvement:
        'Locate break areas adjacent to building windows or interior occupied spaces. Where existing areas are isolated, add cameras with monitored feeds. Trim vegetation that blocks sight lines into the area.',
    },
  ],
  [
    'Walking paths and trails are open and unobstructed by tall hedges, blind curves, or screened bench enclosures',
    {
      standard:
        'Walking paths should provide visibility ahead and to the sides so users can see who they are approaching and be seen by others.',
      improvement:
        "Trim landscaping along paths to the 2'/6' rule. Eliminate blind curves by widening the path or removing screening hedges. Replace enclosed bench shelters with open seating.",
    },
  ],
  [
    'Trash, dumpster, and recycling areas are visible from the building or from a regularly traveled vehicle route',
    {
      standard:
        'Dumpster areas are common locations for dumping, dumpster diving, and bomb-staging concealment. Surveillance discourages all three.',
      improvement:
        'Relocate dumpsters away from blind corners. Add cameras covering the enclosure. Position the enclosure within sight of a regularly used walking or driving path.',
    },
  ],
  [
    'Designated smoking areas are positioned so smokers do not prop open exterior doors or congregate near secondary entries',
    {
      standard:
        'Propped doors at smoking areas are a leading cause of unauthorized entry. Designated areas should be positioned away from secondary doors.',
      improvement:
        'Designate a smoking area away from secondary entries, with shelter and seating to discourage migration. Add door-position alarms on secondary doors to detect propping. Communicate the policy clearly.',
    },
  ],
  [
    'Dumpster enclosures are gated/locked when not in active use to prevent dumpster diving and bomb-staging concealment',
    {
      standard:
        'Locked dumpster enclosures prevent unauthorized disposal, dumpster diving for sensitive paper records, and the use of dumpsters to stage suspicious packages.',
      improvement:
        'Install gates with locks on all dumpster enclosures. Provide keys only to the cleaning/janitorial staff. Schedule daily lock checks as part of the facilities walkthrough.',
    },
  ],
  [
    'Outdoor utility components (transformers, gas meters, HVAC condensers, irrigation backflow) are protected by enclosures, fencing, or bollards',
    {
      standard:
        'Exposed utility components are vulnerable to sabotage, theft of copper, and accidental damage. Physical protection is a baseline CPTED requirement.',
      improvement:
        'Install fencing or enclosures around utility components, allowing service access via locked gates. Add bollards around vehicle-vulnerable components (gas meters, transformers). Sign the enclosures as restricted.',
    },
  ],
  [
    'Outdoor common areas (courtyards, plazas, eating areas) are clearly furnished and signed as employee-use spaces, not public space',
    {
      standard:
        'Outdoor common areas should be visually claimed as employee territory — through furnishing, signage, and design — to deter use by non-employees.',
      improvement:
        'Furnish outdoor common areas with branded seating, umbrellas, and signage indicating employee use. Add subtle territorial markers (planters, pavement banding) at the edges to signal the space belongs to the corporation.',
    },
  ],
  [
    'Landscape design and pavement signal that the grounds are owned, maintained, and patrolled',
    {
      standard:
        'Well-maintained landscaping and pavement signal active guardianship and deter casual misuse of the property.',
      improvement:
        'Invest in a quality landscape contract with monthly visits. Use consistent paving materials and patterns. Maintain mulch, edge beds, and replant seasonally to keep the property visibly cared for.',
    },
  ],
  [
    'Grounds are free of graffiti, litter, broken benches/tables, and overgrown landscape',
    {
      standard:
        'Visible neglect on the grounds undermines the territorial message of the perimeter and parking and signals reduced guardianship.',
      improvement:
        'Daily walkthroughs with same-day cleanup. Same-week repair or replacement of broken furniture. Same-day graffiti removal — preferably documented with a photo before removal for any pattern tracking.',
    },
  ],
  [
    'Trash receptacles in outdoor common areas are emptied on a regular schedule and are not overflowing',
    {
      standard:
        'Overflowing trash signals neglect and creates a public-health and pest issue. Regular emptying is a basic maintenance indicator.',
      improvement:
        'Schedule daily trash pickup for common areas. Increase frequency around lunch hours and after events. Add receptacles where existing ones consistently overflow.',
    },
  ],
  [
    'Irrigation, drainage, and landscape beds are functioning and not creating standing-water or overgrowth issues',
    {
      standard:
        'Functioning irrigation and drainage prevent both visible neglect (dead landscaping) and safety issues (mosquito breeding, slip hazards).',
      improvement:
        'Schedule monthly irrigation inspections. Clear drains and culverts before and after rainy season. Replace dead plantings within 30 days.',
    },
  ],

  // ─── Zone 4: Building Exterior & Envelope ───
  [
    'Ground-floor windows are not obstructed by interior signs, posters, or furniture beyond the 10% / 5-ft CPTED guideline',
    {
      standard:
        'CPTED guidance limits window obstruction to 10% of the glazing or 5 ft of unobstructed height so that natural surveillance into/out of the building is preserved.',
      improvement:
        'Audit ground-floor windows. Remove signs and posters that exceed 10% of glazing. Move tall furniture (file cabinets, partitions) at least 5 ft from windows. Brief office managers on the standard.',
    },
  ],
  [
    'The full exterior perimeter is observable from cameras, regularly patrolled paths, or building windows with overlapping coverage',
    {
      standard:
        'The full building perimeter should be under continuous observation through some combination of cameras, patrols, and natural surveillance. Verified by reviewing the camera-coverage map or SOC feeds with the security director.',
      improvement:
        'Map current coverage of the exterior perimeter. Add cameras to dark sides. Schedule security patrols to walk the full perimeter on a defined cadence. Open sight lines from interior windows where blocked.',
    },
  ],
  [
    'Setback/hardscape around the building is open enough to deny concealed approach to ground-floor windows and doors',
    {
      standard:
        "FEMA 426 standoff and CPTED concealment principles both require open ground around the building so that an attacker cannot approach unseen.",
      improvement:
        'Maintain at least 4-6 ft of unplanted hardscape or low groundcover around the building. Remove tall plantings adjacent to ground-floor windows. Add motion-activated lighting where setback is narrow.',
    },
  ],
  [
    'All secondary exterior doors are exit-only (no exterior hardware) or controlled by card reader',
    {
      standard:
        'Secondary doors that allow casual exterior entry undermine the controlled-entry model. They must be exit-only or credentialed.',
      improvement:
        'Audit all exterior doors. Remove exterior handles/levers from emergency-egress-only doors. Add card readers to legitimate secondary employee entries. Sign all doors per their function.',
    },
  ],
  [
    'Exterior doors have non-removable hinge pins or hinges that are not accessible from outside',
    {
      standard:
        'Removable exterior hinge pins are a known method of forced entry. Doors should use security hinges or interior-mounted hinges.',
      improvement:
        'Replace exterior hinges with non-removable-pin (NRP) hinges or set screws to lock pins in place. For doors with outward-swinging exterior hinges, install hinge studs or convert to inward-swing where code permits.',
    },
  ],
  [
    'Exterior doors are equipped with deadbolts (minimum 1-inch throw) or equivalent commercial locking, with strike plates anchored into the frame',
    {
      standard:
        'A 1-inch deadbolt throw with a frame-anchored strike plate resists most pry and kick-in attacks — the commercial CPTED door standard.',
      improvement:
        'Verify all exterior doors have 1-inch deadbolts. Replace short-throw or builder-grade hardware. Reinforce strike plates with 3-inch screws into the frame stud. Use a security-rated strike box where the frame is hollow.',
    },
  ],
  [
    'Exterior door closers and weather seals are in working order and the doors latch fully when released',
    {
      standard:
        'A door that does not latch fully provides no security regardless of lock quality. Closers and seals are part of the locking system.',
      improvement:
        'Test every exterior door closer monthly. Replace failed closers. Replace worn weather seals so the door seats fully. Adjust strike alignment so the bolt throws without resistance.',
    },
  ],
  [
    'Secondary exterior doors are alarmed (door-position contact reporting to the security panel) so any opening is detected',
    {
      standard:
        'Door-position contacts detect when a door is opened — essential for catching propped doors and after-hours forced entry. Verified at the intrusion alarm panel or SOC by confirming door-position contacts are wired and report opening events.',
      improvement:
        'Install magnetic door-position contacts on all secondary exterior doors, wired to the intrusion alarm panel. Configure alerts for after-hours opening and for "door held open" conditions. Test contacts quarterly.',
    },
  ],
  [
    'Ground-floor windows that open are equipped with locks; fixed glazing is intact and not propped/blocked',
    {
      standard:
        'Operable ground-floor windows are a forced-entry vector if unlocked. Fixed glazing must remain intact and unblocked to support natural surveillance.',
      improvement:
        'Verify every operable window has functional locks. Replace broken glazing within 30 days. Remove items propped against windows from interior or exterior.',
    },
  ],
  [
    'Roof access doors and roof hatches are locked, alarmed, and not used as informal smoking-break exits',
    {
      standard:
        'Roof access provides a path to rooftop equipment, HVAC intakes, and adjacent buildings. It must be locked and alarmed. Verified by accessing the top stairwell during the interior walk and confirming alarm status at the panel.',
      improvement:
        'Install card readers or high-security locks on roof access doors and hatches. Alarm them on the intrusion panel. Communicate to employees that roof access is restricted to maintenance.',
    },
  ],
  [
    'Rooftop HVAC, communications, and mechanical equipment is protected by perimeter fencing, locked enclosures, or restricted-access roof zoning',
    {
      standard:
        'Rooftop equipment is vulnerable to sabotage, copper theft, and intake-based chemical attacks. CISA and FEMA 426 call for physical protection.',
      improvement:
        'Install fencing around HVAC compressors and condensers. Lock electrical and communications equipment in enclosures. Restrict roof access via card reader. Add cameras covering rooftop critical equipment.',
    },
  ],
  [
    'The primary entry is visually distinct (canopy, signage, lighting) from secondary doors so visitors are funneled to it unambiguously',
    {
      standard:
        'The primary entry should be the most visually prominent door so visitors instinctively choose it, channeling them past reception.',
      improvement:
        'Add a canopy, prominent signage, and overhead lighting at the primary entry. Make secondary doors visually plain by comparison. Verify wayfinding from parking reinforces the choice.',
    },
  ],
  [
    'All secondary doors are signed appropriately (e.g., "Emergency Exit Only — Alarm Will Sound") to deter routine use',
    {
      standard:
        'Signage at secondary doors deters routine misuse and reinforces that the primary entry is the correct path.',
      improvement:
        'Audit secondary door signage. Add "Emergency Exit Only — Alarm Will Sound" placards where missing. Ensure signs are legible and well-positioned at eye level.',
    },
  ],
  [
    'All exterior building façades are lit during darkness with no dark sides of the building',
    {
      standard:
        'A single dark façade creates a concealed approach to ground-floor doors and windows. All sides should be lit during darkness.',
      improvement:
        'Conduct a night walkthrough of the full exterior. Add wall-mount or pole-mount lighting to dark sides. Connect to photocells or timers so lights operate automatically at dusk.',
    },
  ],
  [
    'Exterior door entries are lit so a person at the door can be recognized on camera and from inside',
    {
      standard:
        'Door-entry lighting allows identification of arrivals on camera and supports the reception staff in seeing who is approaching.',
      improvement:
        'Add wall-mounted fixtures above each exterior door. Verify that camera exposure captures a recognizable face at the door. Replace incandescent or yellow-sodium with white LED to support color rendition.',
    },
  ],
  [
    'Roof-edge or rooftop lighting allows after-hours patrol or maintenance access without flashlights',
    {
      standard:
        "Rooftop work requires lighting both for safety and to support after-hours observability of rooftop activity.",
      improvement:
        'Add rooftop lighting at penthouse perimeters, equipment, and HVAC zones. Use switched or motion-activated fixtures to balance light pollution with on-demand visibility.',
    },
  ],
  [
    'The building façade is free of graffiti, broken windows, and visible damage',
    {
      standard:
        'A clean façade signals active guardianship per Broken Windows. Visible damage invites further disorder.',
      improvement:
        'Implement same-day graffiti removal and 30-day repair of façade damage. Document each incident with photos before remediation for any pattern tracking. Track maintenance via facilities tickets.',
    },
  ],
  [
    'Exterior signage, door hardware, and lighting fixtures are maintained and current',
    {
      standard:
        'Maintained exterior elements project corporate professionalism and active management of the property.',
      improvement:
        'Annually inventory exterior signage, door hardware, and fixtures. Replace damaged or obsolete items. Track maintenance through facilities work orders.',
    },
  ],

  // ─── Zone 5: Main Lobby, Reception & Visitor Management ───
  [
    'The reception/security desk has direct sight line to the primary exterior door and the full lobby',
    {
      standard:
        'Reception must see arriving visitors as they enter to identify hostile intent, intercept unauthorized entry, and greet legitimate visitors.',
      improvement:
        'Reposition the reception desk to face the primary entry. Remove obstructing planters, signage, or partitions. Where the desk cannot be moved, add convex mirrors or camera monitors at the desk.',
    },
  ],
  [
    'Reception staff can see arriving visitors before the visitor reaches the desk (no concealed approach)',
    {
      standard:
        'A concealed approach to reception eliminates the staff member\'s opportunity to assess and prepare. The approach should be open and well-lit.',
      improvement:
        'Audit the path from entry to reception. Remove screening furniture, planters, or partitions. Where layout limits visibility, add a camera feed at the desk showing the approach.',
    },
  ],
  [
    'The lobby is monitored by camera with recording, including coverage of the reception desk and any side doors',
    {
      standard:
        'Lobby camera coverage provides forensic evidence and supports duress response. Coverage should include the desk and all side doors.',
      improvement:
        'Add cameras to cover the full lobby including the reception desk and side doors. Ensure recording with at least 30-day retention. Verify the camera at the desk does not face directly into reception screens.',
    },
  ],
  [
    'A designated customer waiting area is visible from reception and not isolated in an unstaffed alcove or back-corner seating',
    {
      standard:
        'Customers waiting for their meeting should remain in a visible, monitored area — not abandoned in a private corner — both to maintain natural surveillance of customers on premises and to deter misuse of unsupervised lobby space.',
      improvement:
        'Designate the waiting area within direct sight line of the reception desk and furnish it visibly (signage, dedicated seating). Avoid back-corner couches, unstaffed conference-room foyers, or alcoves as informal waiting spots. Add a camera if reception sight line is partly obstructed.',
    },
  ],
  [
    'Customer meeting rooms preserve sight line from outside (vision panel, glass wall) or are equipped with a panic/duress button so employees are not isolated during difficult conversations',
    {
      standard:
        'Employees meeting alone with potentially upset customers should not be sealed in an unobservable room without duress capability. Insurance customer interactions (claim denials, premium disputes, coverage refusals) are a documented workplace-violence vector, and either external visibility or a panic button mitigates the isolation risk.',
      improvement:
        'Add vision panels or convert one wall to glass in customer-meeting rooms. Where privacy requires solid walls, install a panic/duress button wired to reception or the security operations center. Train customer-facing staff on activation criteria and on de-escalation steps before activation.',
    },
  ],
  [
    'A vestibule or transaction barrier separates the public lobby from the employee-controlled portion of the building',
    {
      standard:
        'A physical separation (vestibule, ballistic-rated barrier, or controlled door) creates a hard line between public and employee space — a foundational defensive layer.',
      improvement:
        'Where there is no vestibule, add a controlled-entry door between lobby and employee floors. Consider ballistic-rated glazing at the reception transaction window for higher-risk operations.',
    },
  ],
  [
    'All visitors check in at reception and are issued a visitor badge before entering the controlled portion of the building',
    {
      standard:
        'Universal visitor check-in is the keystone of the visitor management program. Without it, the rest of the visitor controls are unenforceable.',
      improvement:
        'Implement a visitor management system (paper log or software). Require all visitors to sign in and be badged. Train reception staff to enforce the policy without exception. Audit compliance quarterly.',
    },
  ],
  [
    'Reception distinguishes customer visitors from vendor/contractor sign-ins so each is routed and badged appropriately',
    {
      standard:
        'Customers, vendors, and contractors arrive for different purposes and need to be routed and badged differently — customer to host/waiting area, vendor to dock or destination room, contractor with escort. Distinguishing them at sign-in supports correct handling and forensic review.',
      improvement:
        'Use distinct visitor types in the visitor management system with separate badge colors or labels. Train reception to ask the visit purpose before badging. Route customers to the designated waiting area; route vendors and contractors per their established protocol.',
    },
  ],
  [
    'Visitor badges are visually distinct from employee badges and use a self-expiring or dated mechanism so reuse is detected',
    {
      standard:
        'Distinct, dated visitor badges prevent tailgating and badge reuse. Self-expiring badges (color-change after 24 hours) are best practice.',
      improvement:
        'Switch to color- or shape-distinct visitor badges. Use self-expiring badge stock or print the date prominently. Brief employees on what current-day visitor badges look like so they can identify outdated badges.',
    },
  ],
  [
    'Visitors are escorted by a host employee, or are routed through a reception-controlled door, before entering office floors',
    {
      standard:
        'Visitors should not be in employee space unescorted. Either an employee escort or a reception-controlled routing prevents wandering.',
      improvement:
        'Adopt a written escort policy. Train employees to escort visitors to and from meetings. Where escorts aren\'t practical, route visitors through a controlled door at reception that only opens to a specific destination.',
    },
  ],
  [
    'A panic alarm or duress button is present at the reception desk and tested on a known schedule',
    {
      standard:
        'A duress button at reception is critical for rapid LE response to an active threat at the building\'s most exposed staffed position.',
      improvement:
        'Install a panic/duress button at reception, wired to the central station or 911. Test monthly with the monitoring vendor. Train reception staff on activation criteria. Use silent activation to avoid escalating the threat.',
    },
  ],
  [
    'The transition door from lobby to employee space is controlled by card reader, not propped, and re-locks reliably',
    {
      standard:
        'The lobby-to-employee transition door is a critical defensive layer. It must be card-controlled, never propped, and reliably re-locking.',
      improvement:
        'Add a card reader if absent. Install a door-held-open alarm to detect propping. Test the door closer and electric strike quarterly. Audit access logs monthly for tailgating patterns.',
    },
  ],
  [
    'A clearly posted visitor policy or sign-in expectation is visible to arriving visitors',
    {
      standard:
        'Posted visitor expectations reinforce compliance and reduce friction when reception enforces the policy.',
      improvement:
        'Post a clear sign at the lobby entrance stating "All visitors must check in at reception." Include any specific requirements (ID, escort, badge). Use clear, professional design.',
    },
  ],
  [
    "Reception's location, signage, and orientation make it obvious that all visitors must check in before proceeding",
    {
      standard:
        "Reception should be unavoidable: the desk's position, signage, and lobby layout should funnel every visitor past it.",
      improvement:
        'Audit the lobby layout. Move planters, furniture, or signage to channel visitors to the desk. Add wayfinding signage if needed. Position reception so it sits between the entry and the elevators/transition door.',
    },
  ],
  [
    'Reception staff have a workstation view (or shared monitor) of relevant exterior and lobby cameras',
    {
      standard:
        'Reception is positioned to act on what they see. Camera feeds at the desk extend their visual range to the exterior and lobby corners.',
      improvement:
        'Install a monitor at reception showing primary exterior and lobby cameras. Use software that allows reception to scroll through views. Ensure the monitor is not visible to arriving visitors.',
    },
  ],
  [
    'The visitor management system (paper log or software) captures visitor name, host, time in/out, and badge number',
    {
      standard:
        'A complete visitor record supports incident investigation, contact tracing, and audit. Software systems add photo and pre-registration capability.',
      improvement:
        'Adopt a visitor management software platform (e.g., Envoy, Sine, Proxyclick) with photo capture, pre-registration, and host notification. Retain logs for at least 90 days per CPTED office guidance.',
    },
  ],
  [
    'The lobby is well-maintained, brightly lit, and projects a controlled, professional image consistent with corporate ownership',
    {
      standard:
        'Lobby presentation is the building\'s territorial statement: a maintained, professional lobby signals active guardianship throughout.',
      improvement:
        'Maintain the lobby to corporate-brand standards. Replace worn furniture, refresh paint and finishes, ensure full lighting. Display corporate identity prominently.',
    },
  ],

  // ─── Zone 6: Loading Dock, Mailroom & Service Entries ───
  [
    'The loading dock is visible from a regularly staffed position, security camera, or both at all times of dock operation',
    {
      standard:
        'The loading dock is the highest-volume non-visitor entry. Constant surveillance is required to prevent unauthorized entry and to verify deliveries. Verified by asking the dock supervisor about their sight line and reviewing the dock camera feed at the SOC.',
      improvement:
        'Add cameras with monitored feeds covering the dock. Position the dock supervisor or mailroom clerk with sight line to the receiving area. Configure alerts for after-hours dock activity.',
    },
  ],
  [
    'Mailroom intake is observable from another staffed area or by camera covering the receiving counter',
    {
      standard:
        'Mail intake is a high-risk point for suspicious packages and prohibited items. Surveillance supports both detection and forensic review.',
      improvement:
        'Position the mailroom intake counter so it is visible from an adjacent staffed area or via dedicated camera. Add recording with at least 30-day retention.',
    },
  ],
  [
    'The exterior approach to the loading dock is camera-covered with continuous recording',
    {
      standard:
        'Exterior dock camera coverage captures vehicle approaches, license plates, and the identity of arriving drivers — supporting incident response and audit. Verified at the SOC monitor by confirming the dock-approach camera is recording and captures license plates clearly.',
      improvement:
        'Add cameras at the dock approach with vehicle-recognition framing. Ensure they capture license plates clearly. Maintain recording with at least 30-day retention.',
    },
  ],
  [
    'The loading dock overhead door and any pedestrian door are kept closed and locked when not actively in use',
    {
      standard:
        'An open or unlocked dock door is an invitation for unauthorized entry. Doors should be closed and locked between active deliveries.',
      improvement:
        'Train dock staff to close and lock the overhead door after each delivery. Install automatic closers on the pedestrian door. Add door-position alarms to detect prolonged openings.',
    },
  ],
  [
    'Vendors, delivery drivers, and contractors check in at the dock or at reception and are issued a temporary badge before entering the building',
    {
      standard:
        'Vendors and contractors entering the building must be processed through the same identity verification as visitors — not waved through informally. Verified by reviewing the dock check-in log and interviewing the dock supervisor about the vendor protocol.',
      improvement:
        'Implement vendor check-in at the dock with badge issuance. Maintain a vendor log with company, driver name, vehicle, and time. Brief receiving staff on the policy.',
    },
  ],
  [
    'The mailroom has dedicated access control (card reader or staffed sign-in) separating it from the rest of the office space',
    {
      standard:
        'The mailroom is a contained high-risk zone. Access control prevents the suspicious-package issue from spreading and limits insider access to mail.',
      improvement:
        'Install a card reader on the mailroom door. Limit credentials to mailroom and authorized facilities staff. Audit access logs monthly.',
    },
  ],
  [
    'A documented suspicious-package protocol (tell-tale signs, isolation procedure, 911 escalation) is posted in or near the mailroom',
    {
      standard:
        'GSA Mail Center Security Guide and ISC Best Practices require a written, posted protocol for handling suspicious packages — the difference between safe isolation and panic.',
      improvement:
        'Adopt the GSA Mail Center Security Guide protocol. Post a one-page summary in the mailroom. Train mailroom staff annually. Stock isolation equipment (containment bag, gloves) at the receiving counter.',
    },
  ],
  [
    'Service entries (janitor, vendor, contractor doors) are alarmed, exit-only or card-controlled, and not propped during business hours',
    {
      standard:
        'Service entries are common informal entry paths. They must be controlled with the same rigor as the primary entry. Verified at the alarm panel for armed status; door hardware (exit-only / card reader) inspected up close during the interior walk.',
      improvement:
        'Audit every exterior service door. Convert to exit-only or card-controlled. Alarm them on the intrusion panel. Add door-held-open alerts. Brief janitorial staff on the no-prop policy.',
    },
  ],
  [
    'Mail and packages are screened (visual inspection at minimum; X-ray, K9, or vendor-screening service if higher tier) before distribution into the building',
    {
      standard:
        'Screening is the primary defense against improvised explosive devices, chemical-biological packages, and prohibited items entering the building.',
      improvement:
        'Adopt at minimum visual inspection per GSA Mail Center Security Guide. For higher-risk profiles, contract X-ray or K9 screening, or use a third-party screening center. Train inspectors and document the screening procedure.',
    },
  ],
  [
    "The mailroom HVAC is isolated from, or capable of being isolated from, the building's central air handling in the event of a suspicious substance release",
    {
      standard:
        'HVAC isolation prevents a suspicious-substance release in the mailroom from contaminating the entire building — an ISC mail-screening best practice.',
      improvement:
        'Work with mechanical engineering to isolate the mailroom HVAC return on a dedicated zone with shutoff capability. Add a control to the mailroom or SOC for emergency isolation. Test annually.',
    },
  ],
  [
    'A package-receiving log records inbound deliveries, sender, and recipient for accountability',
    {
      standard:
        'A receiving log supports incident investigation, internal accountability for high-value shipments, and the ability to reconstruct delivery streams.',
      improvement:
        'Maintain a receiving log (paper or software) capturing date, sender, recipient, vendor, and tracking number. Retain logs for at least 12 months. Cross-check against high-value or controlled shipments.',
    },
  ],
  [
    'The loading-dock area is signed as "Authorized Personnel Only — Deliveries Only" so unauthorized foot traffic is deterred',
    {
      standard:
        'Signage reinforces the territorial message that the dock is operationally restricted, not a casual entry path.',
      improvement:
        'Post "Authorized Personnel Only" signage at the dock and on any pedestrian door. Use signage consistent with the corporate brand and visible to approaching vehicles and pedestrians.',
    },
  ],
  [
    'The dock and mailroom are clean, organized, and free of accumulated packaging, prop-open wedges, and unsecured tools',
    {
      standard:
        'A maintained dock and mailroom signal disciplined operations. Accumulated packaging creates concealment and fire-load risk; prop-open wedges defeat door control.',
      improvement:
        'Daily housekeeping of the dock and mailroom. Remove all prop-open wedges and devices. Lock tools in cabinets. Brief staff on the standard and audit weekly.',
    },
  ],

  // ─── Zone 7: Vertical Circulation ───
  [
    'Elevator interiors are camera-covered with recording',
    {
      standard:
        'Elevator camera coverage provides forensic evidence for incidents in a confined space where the victim cannot escape and witnesses are absent.',
      improvement:
        'Add cameras inside each elevator cab. Ensure they record with at least 30-day retention. Verify the camera is positioned to capture face-level video without being easily blocked.',
    },
  ],
  [
    'Stairwells are camera-covered at landings or have alarmed door contacts so unauthorized travel is detected',
    {
      standard:
        'Stairwells provide a private vertical path. Coverage at landings or door-position alarms detects unauthorized travel between floors.',
      improvement:
        'Add cameras at each stairwell landing or install door-position contacts on stairwell doors. Connect to the alarm panel. Configure after-hours alerts for stairwell use.',
    },
  ],
  [
    'Floor lobbies (elevator vestibules on each floor) are visible from a regularly occupied position on that floor',
    {
      standard:
        'Floor lobbies are the arrival point on each floor. Visibility from an occupied position deters tailgating and unauthorized arrival.',
      improvement:
        'Position reception, admin, or open-office workstations within sight of the elevator lobby on each floor. Add a camera if the position cannot be relocated.',
    },
  ],
  [
    'Elevator floor selection requires a credential after hours (or all-times for restricted floors), so unauthenticated travel is blocked',
    {
      standard:
        'Credential-based floor selection prevents unauthenticated travel to specific floors, which is essential for restricted floors and after-hours access.',
      improvement:
        'Integrate elevator destination dispatch with the access control system. Require credential at the lobby panel or in the cab. Restrict floors based on the credential. Test after-hours behavior.',
    },
  ],
  [
    'Stairwell doors permit free egress (life-safety code) but re-entry from the stairwell to office floors is controlled by card reader',
    {
      standard:
        'Life-safety code requires free egress, but uncontrolled re-entry from stairwells defeats access control. Card-reader re-entry resolves both.',
      improvement:
        'Install card readers on stairwell doors for re-entry. Verify free egress is preserved. Configure code-compliant unlock on fire alarm activation. Test fire-alarm interface annually.',
    },
  ],
  [
    'Stairwell re-entry is permitted on at least every fourth floor and on the floor of discharge, in line with code, so occupants are never trapped in a stairwell',
    {
      standard:
        'IBC requires stairwell re-entry on at least every fourth floor and on the floor of discharge so occupants are never trapped during evacuation or shelter-in-place reversal.',
      improvement:
        'Verify with the AHJ that re-entry meets code. If not, add code-compliant re-entry capability. Sign re-entry floors clearly inside the stairwell.',
    },
  ],
  [
    'The path from the stairwell discharge to the exterior exit door is unobstructed and well lit',
    {
      standard:
        'The stairwell-to-exit path is the last segment of evacuation. Obstructions or poor lighting create injury and panic risk at the most critical moment.',
      improvement:
        'Walk every stairwell discharge to its exterior door. Remove stored materials, signage, or temporary fixtures. Verify lighting on emergency power. Test the egress path annually.',
    },
  ],
  [
    'Roof access from the top stairwell is locked, alarmed, and signed as restricted',
    {
      standard:
        'Top-stairwell roof access is a common informal exit and a route to rooftop equipment. It must be controlled with the same rigor as exterior doors.',
      improvement:
        'Install a high-security lock and door-position alarm on the top-stairwell roof door. Sign it as restricted. Audit access via the alarm panel. Reserve a key with maintenance only.',
    },
  ],
  [
    'All stairwells are lit at code-required levels with no out or dim fixtures',
    {
      standard:
        'Stairwell lighting at code-required levels (typically 10 foot-candles on the walking surface, with emergency backup) is essential for evacuation safety.',
      improvement:
        'Conduct quarterly stairwell lighting walkthroughs. Replace failed fixtures within 72 hours. Test emergency-power backup annually per code. Convert to LED for reliability.',
    },
  ],
  [
    'Floor lobbies and elevator vestibules are lit to recognize faces on camera',
    {
      standard:
        'Lighting in floor lobbies supports facial recognition on the elevator-vestibule camera, which is the arrival capture point on each floor.',
      improvement:
        'Verify lighting at each floor lobby supports camera exposure. Add fixtures or upgrade to higher-output LED where needed. Avoid backlit conditions that silhouette arrivals.',
    },
  ],
  [
    'Stairwells are free of stored materials, propped doors, and accumulated trash',
    {
      standard:
        'Stored materials in stairwells violate fire code, obstruct evacuation, and signal reduced guardianship.',
      improvement:
        'Daily janitorial sweep of stairwells. Removal of all stored materials. Removal of door props. Brief tenants on the no-storage policy. Track via fire-marshal inspections.',
    },
  ],
  [
    'Elevator cab interiors are clean, undamaged, and free of graffiti',
    {
      standard:
        'Elevator cab condition is a visible territorial-maintenance indicator. Damaged or graffitied cabs signal disorder per Broken Windows.',
      improvement:
        'Daily janitorial cleaning of cab interiors. Same-day graffiti removal. 30-day refresh of damaged panels, mirrors, or flooring.',
    },
  ],

  // ─── Zone 8: Office Floors & Workstations ───
  [
    'Workstation layout preserves sight lines across the open floor plan rather than creating hidden alcoves or screened workstations',
    {
      standard:
        'Open sight lines across the floor enable natural surveillance among employees — the second-generation CPTED principle of mutual observation.',
      improvement:
        'Audit workstation layout. Lower partitions to 5 ft or below. Remove screening enclosures. Add glass partitions where privacy is needed. Position circulation paths to support visibility.',
    },
  ],
  [
    'Conference rooms with glass walls or interior windows allow casual observation of activity from circulation paths',
    {
      standard:
        'Glass-walled conference rooms support casual surveillance from circulation paths — discouraging misuse while preserving meeting privacy through audio isolation.',
      improvement:
        'Convert solid-wall conference rooms to glass walls where privacy permits. Use frosted glass with a clear vision strip if full transparency is too exposing. Add motorized blinds for sensitive meetings.',
    },
  ],
  [
    'Cubicle and partition heights do not exceed five feet in primary work areas, in line with CPTED office surveillance guidance',
    {
      standard:
        'Partition heights above 5 ft create concealment opportunities and defeat natural surveillance among co-workers — a Threshold Security CPTED office checklist item.',
      improvement:
        'Lower or replace partitions exceeding 5 ft in open work areas. Reserve higher partitions for areas with confirmed privacy/acoustic need. Adopt the 5-ft standard in workplace design guidelines.',
    },
  ],
  [
    'Executive suite, executive assistant area, or C-suite floor is separated from general office space by access control',
    {
      standard:
        'Executive areas are higher-target environments (data, decision-making, public profile). Access control separates them from general office traffic.',
      improvement:
        'Add a card-reader-controlled door to the executive area. Limit credentials to executives, assistants, and authorized staff. Audit access logs monthly. Pair with executive-area duress capability.',
    },
  ],
  [
    'Conference rooms used for sensitive discussions are lockable when in use',
    {
      standard:
        'Lockable conference rooms allow privacy during HR, legal, board, or M&A discussions — essential for confidentiality and reducing eavesdropping risk.',
      improvement:
        'Install push-button or thumb-turn locks on conference room doors. Brief staff on appropriate lock use (during meetings; not as permanent locks). For high-sensitivity meetings, add a sound-masking device.',
    },
  ],
  [
    'Print/copy rooms with multifunction devices that handle sensitive documents are positioned in low-foot-traffic locations with reasonable visibility',
    {
      standard:
        'Multifunction devices handle sensitive prints. Positioning them in low-traffic but visible locations balances privacy with surveillance of devices and pickup areas.',
      improvement:
        'Locate print/copy rooms away from high-traffic corridors and public areas. Preserve sight lines from an adjacent occupied position. Use secure print release (badge swipe) for sensitive documents.',
    },
  ],
  [
    'Employee badging policy requires badges to be worn visibly while on the floor',
    {
      standard:
        'Visible badging supports employee challenge of unfamiliar persons — the foundation of employee-driven natural surveillance.',
      improvement:
        'Adopt a written policy requiring visible badges. Brief on hire and at refresher. Train employees to politely challenge or report unbadged individuals. Reinforce with management visibility.',
    },
  ],
  [
    'Floor signage and wayfinding establish departmental identity (e.g., "Claims Operations — Floor 3") so visitors understand whose territory they have entered',
    {
      standard:
        'Departmental identity signage reinforces territoriality on each floor, signaling to visitors that they have arrived in a defined operational space.',
      improvement:
        'Add departmental signage at elevator lobbies and primary circulation paths on each floor. Use consistent branding. Pair with welcome/check-in expectations for floor visitors.',
    },
  ],
  [
    'Executive and restricted floors are signed and visually treated to reinforce that the space is access-controlled',
    {
      standard:
        'Visual cues at restricted floors deter casual misuse and signal that access control is enforced.',
      improvement:
        'Add "Authorized Personnel Only" signage at the entry to restricted floors. Use distinct finishes (paint, flooring) at the controlled-zone boundary. Pair with the actual card-reader control.',
    },
  ],
  [
    'A clean-desk practice is in effect for sensitive paper records (claims, PII, HR) at end of day',
    {
      standard:
        'Clean-desk practice prevents after-hours exposure of PII, claim documents, and other sensitive records to janitorial staff and unauthorized observers.',
      improvement:
        'Adopt a written clean-desk policy. Issue lockable file cabinets and shredders. Brief staff at onboarding and at refresher. Perform quarterly clean-desk audits.',
    },
  ],
  [
    'Workstations are configured so that screens displaying confidential information are not visible from public corridors or windows',
    {
      standard:
        'Screen visibility from corridors and windows is a passive PII-disclosure risk. Workstation orientation should mitigate this.',
      improvement:
        'Rotate or reposition workstations so screens face away from corridors and windows. Issue privacy filters where rotation is not possible. Lower workstation backs to support natural surveillance while keeping screens private.',
    },
  ],
  [
    'Employees know how to challenge or report a person on the floor without a visible badge',
    {
      standard:
        "Employee challenge of unfamiliar persons is the most effective informal access control — but only if employees are trained and authorized to do it.",
      improvement:
        "Train employees on the polite challenge: \"Welcome — can I help you find someone?\" Provide a clear reporting channel (security desk, SOC, or hotline). Reinforce in security awareness training annually.",
    },
  ],
  [
    'Office floors are clean, well-maintained, and project a controlled corporate image consistent with the lobby presentation',
    {
      standard:
        'Floor presentation reinforces the territoriality established in the lobby. Disrepair on the floors undermines the message.',
      improvement:
        'Maintain corporate-brand standards on each floor. Schedule painting and finish refresh. Address damage within 30 days. Audit during management walkthroughs.',
    },
  ],

  // ─── Zone 9: Critical & Restricted Areas ───
  [
    'Doors to critical rooms are visible from a regularly staffed position or are camera-covered',
    {
      standard:
        'Critical-room doors should be observable so unauthorized access attempts are detected and logged in real time.',
      improvement:
        'Map all critical-room doors. Where they are not visible from a staffed position, add cameras with recording. Configure after-hours alerts for access attempts.',
    },
  ],
  [
    'Activity in or around mechanical/electrical/utility rooms is observable from corridors rather than from unmonitored hallway dead-ends',
    {
      standard:
        'Mechanical rooms placed at unmonitored dead-ends create concealed approach. Visibility from a circulation path deters tampering.',
      improvement:
        'Where mechanical rooms are at dead-ends, add cameras covering the approach. Add motion-activated lighting. Where layout permits, route circulation paths past the rooms.',
    },
  ],
  [
    'The server room / data center has access control with audit logging (card reader at minimum; biometric where the data sensitivity warrants it)',
    {
      standard:
        'Server room access logging is essential for insider-threat detection and incident investigation. Biometric or two-factor adds non-repudiation for high-sensitivity data.',
      improvement:
        'Install card reader on the server room door at minimum. For high-sensitivity environments (PII, PHI, financial), add biometric or PIN as a second factor. Configure audit logging with at least 90-day retention.',
    },
  ],
  [
    'MDF and IDF telecom closets are locked at all times and access is limited to IT and authorized vendors',
    {
      standard:
        'MDF/IDF closets contain the network and telecom backbone. Compromise enables eavesdropping, tapping, and lateral attacks on the network.',
      improvement:
        'Install card readers or high-security locks on all MDF/IDF closets. Limit credentials to IT and authorized vendors. Audit access logs monthly. Add cameras for sensitive closets.',
    },
  ],
  [
    'HR records, claim files, and other PII storage areas are behind access-controlled doors with key or badge logging',
    {
      standard:
        'PII storage areas require access control with audit logging to meet privacy-law requirements (GDPR, CCPA, state insurance regs) and to support incident response.',
      improvement:
        'Add card readers on HR and records-storage doors. Configure logging with at least 90-day retention. Audit access patterns monthly. Pair with shredding and document-disposal protocols.',
    },
  ],
  [
    'Mechanical, electrical, and elevator-equipment rooms are locked and signed as restricted',
    {
      standard:
        'Mechanical and electrical rooms control building life-safety and operations. Unauthorized access enables sabotage, theft of copper, and accidental tampering.',
      improvement:
        'Verify locks on all mechanical, electrical, and elevator rooms. Add "Authorized Personnel Only" signage. Restrict key/credential distribution. Audit quarterly.',
    },
  ],
  [
    'The water service entry, fire-pump room, and any chemical or fuel storage areas are locked and signed',
    {
      standard:
        'Water, fire-pump, and chemical-storage areas are sabotage targets. Locking and signage are the baseline CPTED requirement.',
      improvement:
        'Verify locks and signage on water service, fire pump, and any chemical/fuel storage. Add door-position alarms for after-hours detection. Restrict access to facilities staff and authorized vendors.',
    },
  ],
  [
    'The emergency generator and fuel storage are protected by perimeter fencing, locked enclosure, or restricted-access yard',
    {
      standard:
        'Generator and fuel storage are critical-asset targets. Protection by fencing, enclosure, or restricted yard is a baseline FEMA 426 / CPTED requirement.',
      improvement:
        'Install fencing around the generator yard. Lock the fuel storage. Add cameras with monitored feeds. Restrict access to facilities staff. Audit fuel inventory quarterly.',
    },
  ],
  [
    'Server room and MDF/IDF rooms are camera-covered with recording',
    {
      standard:
        'Camera coverage of server rooms supports insider-threat investigation and provides accountability for vendor and IT staff visits.',
      improvement:
        'Add cameras covering the entry door and equipment racks. Ensure recording with at least 90-day retention for high-sensitivity environments. Position cameras to capture face-level video on entry.',
    },
  ],
  [
    'Door-position contacts on critical rooms report to the security alarm panel and trigger after-hours alerts',
    {
      standard:
        'Door-position contacts on critical rooms detect unauthorized after-hours access and trigger immediate alerts — essential for insider-threat detection.',
      improvement:
        'Install magnetic door-position contacts on all critical-room doors. Wire to the intrusion panel. Configure after-hours alerts to security or SOC. Test quarterly.',
    },
  ],
  [
    'Access logs for critical rooms are reviewed on a defined cadence (the security director can describe the cadence and reviewer)',
    {
      standard:
        'Access logs only have value if reviewed. CISA insider-threat guidance calls for defined review cadence and a named reviewer.',
      improvement:
        'Document a log-review cadence (weekly for high-sensitivity, monthly for general). Assign a named reviewer. Audit anomalies (off-hours, repeated denied attempts, unusual users). Retain review notes.',
    },
  ],
  [
    'Critical rooms are kept clean and free of stored unrelated materials that would obscure equipment or block egress',
    {
      standard:
        'Stored materials in critical rooms create fire-load, equipment-obscuring, and egress-blocking issues — all of which compound the consequences of an incident.',
      improvement:
        'Audit critical rooms quarterly. Remove all unrelated materials. Designate proper storage elsewhere. Brief facilities and IT on the standard.',
    },
  ],
  [
    'Restricted-area signage is current, legible, and free of damage',
    {
      standard:
        "Signage reinforces the territorial restriction and provides legal notice — both important if access is challenged or contested.",
      improvement:
        'Annually audit restricted-area signage. Replace damaged or faded signs. Ensure language is clear ("Authorized Personnel Only — Restricted Area").',
    },
  ],

  // ─── Zone 10: Building Systems & Security Technology ───
  [
    'The access control system is unified across the entire building (single-tenant context — one platform, one credential per employee)',
    {
      standard:
        'A unified access control platform supports consistent policy enforcement, centralized audit, and reliable revocation across the full building.',
      improvement:
        'Migrate disparate access systems to a single platform. Issue one credential per employee. Document the platform, vendor, and administration roles. Audit credentials quarterly.',
    },
  ],
  [
    'The access control system can immediately disable a credential and the security director can describe the revocation workflow',
    {
      standard:
        'Rapid credential revocation is critical at termination, badge loss, and threat-actor identification. The workflow should be documented and tested.',
      improvement:
        'Document the revocation workflow with named roles and time-to-disable target (typically under 15 minutes for high-risk separations). Test the workflow quarterly. Integrate with HR offboarding.',
    },
  ],
  [
    'Camera footage is retained for at least 30 days (90 days preferred per CPTED office guidance)',
    {
      standard:
        'CPTED office guidance and Threshold Security recommend 30-day retention minimum, 90-day preferred — long enough to support most incident investigations.',
      improvement:
        'Audit camera retention period. Upgrade storage capacity to meet 30/90-day standards. Validate that all cameras record at the standard, not just some.',
    },
  ],
  [
    'Cameras are positioned and resolved to support facial recognition at intended distances; non-working cameras have been repaired or removed',
    {
      standard:
        'A non-working or inadequately resolved camera is worse than no camera — it conveys false assurance. Cameras must be positioned and resolved for their intended forensic purpose.',
      improvement:
        'Conduct a camera audit. Repair or replace failed units. Verify resolution supports face capture at intended distances. Remove or relabel cameras that cannot meet the standard.',
    },
  ],
  [
    'The intrusion alarm system is monitored 24/7 (in-house SOC or central station) and the monitoring contract is current',
    {
      standard:
        'Monitored intrusion alarms ensure incidents trigger response. Unmonitored alarms only annoy adjacent occupants.',
      improvement:
        'Verify the monitoring contract is current. If in-house SOC, document the staffing and response protocol. If central station, verify the contract and test response monthly.',
    },
  ],
  [
    'A mass notification system is in place that can reach all building occupants (intercom/PA, SMS, desktop alerts, or combination) and has been tested within the last 12 months',
    {
      standard:
        'CISA Active Shooter and NFPA 730 require mass notification capability covering the full occupant population — essential for fire, severe weather, and active-threat events.',
      improvement:
        'Implement a mass notification system (PA, SMS, desktop alerts, or combination). Verify coverage by drill in all areas. Document the test annually.',
    },
  ],
  [
    'The security system is integrated with fire/life-safety such that fire alarm activation releases fail-safe doors and elevators recall in line with code',
    {
      standard:
        "IBC and NFPA 72 require fire-alarm integration with access control and elevator recall. This is both a code requirement and an evacuation-life-safety requirement.",
      improvement:
        'Verify fire-alarm integration via the fire marshal at annual inspection. Test door-release and elevator recall annually. Document the integration in the security and life-safety documentation.',
    },
  ],
  [
    'A documented panic-alarm capability exists at reception, executive areas, and HR with a tested response protocol',
    {
      standard:
        'Panic alarms at high-risk positions (reception, executive, HR) enable silent activation and rapid LE response — critical for active threat and confrontation incidents.',
      improvement:
        'Install panic buttons at reception, executive areas, and HR. Document the activation protocol. Test monthly with the monitoring vendor. Train staff on activation criteria.',
    },
  ],
  [
    'Security technology (cameras, readers, alarm panels, mass-notification devices) shows no visible damage, missing covers, or out-of-service indicators',
    {
      standard:
        'Visible damage or out-of-service indicators on security technology undermine the deterrent value and signal reduced guardianship.',
      improvement:
        'Quarterly inspections of all security technology. Repair within 30 days. Replace missing covers. Document repairs in the facilities CMMS.',
    },
  ],
  [
    'Documentation, drawings, and credentials lists are current and reviewed on a stated cadence',
    {
      standard:
        'Security documentation supports incident response, audit, and continuity. Outdated documentation degrades response quality.',
      improvement:
        'Maintain current as-built drawings, camera-coverage maps, credential lists, and vendor contacts. Review annually. Pre-stage for LE share during incidents.',
    },
  ],

  // ─── Zone 11: Workplace Violence & Active-Threat Readiness ───
  [
    'A documented Workplace Violence Prevention policy exists and is communicated to all employees on hire and at a defined refresher cadence',
    {
      standard:
        'ASIS WVPI AA-2020 requires a documented Workplace Violence Prevention policy as the foundation of the program. It must be communicated to employees on hire and at refresher.',
      improvement:
        'Adopt a WVP policy modeled on ASIS WVPI AA-2020. Communicate at hire and annually. Cover reporting channels, behavioral indicators, and management response. Document training completion.',
    },
  ],
  [
    'A multidisciplinary Threat Assessment Team (security, HR, legal, mental-health resource, LE liaison) is in place and meets on a defined cadence to review concerning behavior reports',
    {
      standard:
        'A multidisciplinary Threat Assessment Team is best practice (CISA BTAM in Practice, FBI LEB) for evaluating concerning behavior reports before they escalate.',
      improvement:
        'Form a TAT with security, HR, legal, mental-health resource, and LE liaison. Define meeting cadence (monthly minimum, ad-hoc for active reports). Train the team on BTAM methodology. Document case reviews.',
    },
  ],
  [
    'A confidential employee-reporting channel exists for threats, intimidation, and concerning behavior, and employees know how to use it',
    {
      standard:
        'A confidential reporting channel surfaces concerning behavior before incidents. Without it, warnings go undetected.',
      improvement:
        'Implement a confidential reporting channel (hotline, web portal, or app). Brief employees at hire and at refresher. Protect reporter identity. Document and triage every report through the TAT.',
    },
  ],
  [
    'Pre-employment screening and a documented termination protocol (badge return, escort, threat assessment for high-risk separations) are in place',
    {
      standard:
        'Pre-employment screening reduces hiring risk. A documented termination protocol — especially for high-risk separations — reduces revenge-violence and IP-loss risk.',
      improvement:
        'Adopt pre-employment screening (background, reference, drug as appropriate). Document a termination protocol covering badge return, escort, and high-risk threat assessment. Coordinate with HR and security on every separation.',
    },
  ],
  [
    'Customer-facing staff (claims, policy service, reception) have received de-escalation and hostile-customer response training within the last 24 months',
    {
      standard:
        'Customer-facing roles in insurance are the most exposed to hostile-customer behavior (denied claims, premium disputes, coverage refusals). Periodic de-escalation training reduces incident escalation and aligns with ASIS WVPI AA-2020 program expectations for high-exposure roles.',
      improvement:
        'Schedule de-escalation training every 24 months for claims, policy service, and reception staff, alongside Run-Hide-Fight. Use a qualified vendor or in-house content covering verbal de-escalation, recognizing escalation cues, and exit/duress protocols. Document attendance. Pair training with a written hostile-customer response protocol (panic activation, summon help, end the meeting).',
    },
  ],
  [
    'A written Emergency Action Plan (EAP) covering fire, severe weather, medical, bomb threat, and active assailant is current and accessible to floor wardens',
    {
      standard:
        'OSHA 1910.38 requires a written EAP. CISA and ASIS extend the scope to active assailant. The plan must be current and accessible to those who execute it.',
      improvement:
        'Develop a written EAP covering fire, severe weather, medical, bomb threat, and active assailant. Distribute to floor wardens. Review annually. Test through drills.',
    },
  ],
  [
    'Run-Hide-Fight (or equivalent ALICE-style) training has been delivered to all employees within the last 24 months',
    {
      standard:
        'CISA Active Shooter Preparedness Guide requires regular Run-Hide-Fight (or equivalent) training. Employee response is the most consequential factor in active-threat survival.',
      improvement:
        'Schedule Run-Hide-Fight training every 24 months minimum (annually preferred). Use CISA, ALICE, or law-enforcement-delivered content. Document attendance. Refresh content as guidance evolves.',
    },
  ],
  [
    'Lockdown drills have been conducted within the last 12 months and after-action notes are retained',
    {
      standard:
        'Drills reveal infrastructure gaps and reinforce employee response. Annual minimum, with after-action notes, is the operational standard.',
      improvement:
        'Schedule annual lockdown drills. Coordinate with LE for realistic scenarios. Retain after-action notes. Address identified gaps within 90 days. Adjust EAP based on findings.',
    },
  ],
  [
    'Floor wardens or a building emergency-response team are designated, named, and trained, with backups identified for absences',
    {
      standard:
        'Floor wardens execute the EAP at the local level. Named, trained wardens with backups ensure coverage during absences.',
      improvement:
        'Designate a primary and backup warden per floor. Train at hire and annually. Provide warden-identifying vest, lanyard, or armband. Refresh contacts annually.',
    },
  ],
  [
    'Designated assembly/rally points (and inclement-weather alternates) are identified for evacuation accountability',
    {
      standard:
        'Assembly points support employee accountability after evacuation — critical for verifying everyone got out and identifying anyone still inside.',
      improvement:
        'Designate primary rally points outside the building, plus inclement-weather alternates. Sign rally points. Train wardens on accountability procedures. Brief employees during onboarding and drills.',
    },
  ],
  [
    'The building has a tested capability to immediately lock all access-controlled doors and disable card readers on command (lockdown card or SOC console)',
    {
      standard:
        'Immediate-lockdown capability allows the SOC or designated authority to lock down the building in seconds — critical during active threats originating outside.',
      improvement:
        'Implement a lockdown capability through the access control system. Provide a lockdown card or SOC console trigger. Test annually. Document the activation criteria and authorized activators.',
    },
  ],
  [
    'The building has a tested capability to immediately stop elevators at the next floor so they do not recall to the lobby during an active threat',
    {
      standard:
        'During an active threat, elevators recalling to the lobby delivers fresh victims. Active-threat elevator stop is a Kastle-recommended capability.',
      improvement:
        'Work with the elevator vendor to add an active-threat stop function distinct from fire-recall. Document activation. Test annually. Train SOC or designated activators.',
    },
  ],
  [
    'Designated rooms or floors have lockable interior doors so occupants can shelter in place, and employees know which rooms qualify',
    {
      standard:
        'Shelter-in-place capability is a key Run-Hide-Fight element. Rooms with interior locks and full walls qualify; cubicles do not.',
      improvement:
        'Audit floor plans for shelter-qualifying rooms. Install interior locks where lacking. Communicate qualifying rooms to employees in drills. Pair with door-blocking guidance for rooms without locks.',
    },
  ],
  [
    'Mass notification devices (PA, desktop alert, SMS) reach all areas of the building including stairwells, restrooms, and parking; coverage has been verified by drill',
    {
      standard:
        'Mass notification must reach occupants in stairwells, restrooms, and parking — common locations during active threats. Coverage verified only by drill.',
      improvement:
        'Verify coverage during the annual drill. Add devices in dead zones (stairwells, restrooms, parking). Test PA, SMS, and desktop channels separately. Document the coverage map.',
    },
  ],
  [
    'Floor plans, riser diagrams, and access credentials/keys are pre-staged for delivery to law enforcement during an incident (e.g., Knox Box, lobby lockbox, or pre-arranged digital share)',
    {
      standard:
        "CISA and LE best practice call for pre-staging floor plans, riser diagrams, and credentials so responding officers can navigate and access immediately on arrival.",
      improvement:
        "Pre-stage materials in the Knox Box, lobby lockbox, or pre-arranged digital share with the Volusia Sheriff's Office. Update annually. Coordinate familiarization walkthroughs with LE.",
    },
  ],
  [
    "The security director has a documented coordination point of contact with the Volusia Sheriff's Office (or local LE) and has hosted a familiarization walkthrough within the last 24 months",
    {
      standard:
        'LE familiarization walkthroughs ensure responding officers know the building before incidents. CISA recommends every 24 months minimum.',
      improvement:
        "Coordinate a familiarization walkthrough with the Volusia Sheriff's Office. Document the LE liaison. Refresh every 24 months or after major building changes. Include tabletop exercises.",
    },
  ],
  [
    'Mass notification, panic alarm, and lockdown systems are tested on a documented schedule and test logs are retained',
    {
      standard:
        'Active-threat systems only work if they work. Tested and logged maintenance is required for both reliability and audit.',
      improvement:
        'Test mass notification, panic alarms, and lockdown systems on a documented schedule (monthly for panic, quarterly for lockdown, annually for mass notification). Retain test logs.',
    },
  ],
  [
    'EAP documents, evacuation maps, and rally-point signage on every floor are current and legible',
    {
      standard:
        'Evacuation maps and rally-point signage are last-mile guidance during emergencies. They must be current, legible, and visible on every floor.',
      improvement:
        'Audit evacuation maps and rally-point signage annually. Refresh where damaged or outdated. Update after any floor-plan change. Brief during annual drills.',
    },
  ],
  [
    'Post-incident response resources (EAP, victim assistance contacts, employee assistance program, business continuity playbook) are documented and assigned to a named owner',
    {
      standard:
        'Post-incident response is as important as prevention. Documented resources with named owners ensure rapid activation when needed.',
      improvement:
        'Document post-incident resources: EAP, victim assistance contacts, EAP (employee assistance program), and business continuity playbook. Assign a named owner. Brief leadership annually. Refresh after any incident.',
    },
  ],
]);
