/**
 * School CPTED Item Guidance
 *
 * Shared across all four school types (elementary, middle, high, combined).
 * Keys are exact item_text strings from school-zones.ts. Used by the PDF
 * generator to auto-explain items scored 1 (Critical) or 2 (Deficient).
 *
 * Guidance blends CPTED doctrine, Florida statute (Alyssa's Law, MSD Act,
 * HB 301, HB 1421), and PASS / CISA K-12 leading practices.
 */

import type { ItemGuidance } from './item-guidance';

export const SCHOOL_ITEM_GUIDANCE = new Map<string, ItemGuidance>([
  // ─── Zone 1: Campus Perimeter & Approach ─────────────────────────
  [
    'Property boundaries are clearly delineated from adjacent properties',
    {
      standard:
        'Clear boundary definition — fencing, landscape features, walls, or signage — tells approaching visitors, students, and offenders where school-controlled territory begins. Ambiguous boundaries invite trespass and reduce community sense of guardianship.',
      improvement:
        'Add fencing, low landscape walls, hedges (trimmed to CPTED standards), or clear boundary signage along any perimeter that currently blurs with the adjacent property. A combination of low hedge plus light pole with school-name banner is a common solution.',
    },
  ],
  [
    'Perimeter fencing allows for natural surveillance of school grounds',
    {
      standard:
        'Fencing should define territory without blinding it. Solid privacy fencing creates concealment on both sides; see-through (wrought-iron, aluminum picket, or open-weave chain-link) preserves surveillance from the street, neighbors, and passing patrols.',
      improvement:
        'Where solid fencing creates visibility problems, replace with semi-open design (wrought-iron, aluminum picket, 50%+ open) at 6–8 ft. Avoid privacy fencing except at functional screens (dumpster enclosures, HVAC yards).',
    },
  ],
  [
    'Remote or seldom-used areas of the property are visible from occupied buildings, pedestrian pathways, or vehicular routes',
    {
      standard:
        'Areas that no one can see become hiding places, vandalism targets, and loitering zones. Every part of a school campus should be overlooked by at least one occupied building, active pathway, or camera.',
      improvement:
        'Walk the campus and identify dead zones. Options: add camera coverage, install lighting, prune vegetation to restore sight lines, or repurpose the space (new outdoor learning area, garden) to activate it.',
    },
  ],
  [
    'School grounds are fenced appropriately to the campus context (full perimeter where feasible; at minimum around student play/recess areas)',
    {
      standard:
        'Fencing is a territorial-reinforcement and access-control tool. Elementary campuses with active play areas should have full play-zone fencing; larger secondary campuses should at minimum fence high-risk boundaries (adjacent to wooded or commercial parcels).',
      improvement:
        'Prioritize fence installation or repair around: playground perimeter (elementary), student gathering/recess zones, and boundaries adjacent to unrelated properties. Coordinate with the district facilities team on capital requests.',
    },
  ],
  [
    'Fencing is in good repair with no holes, gaps, or compromised sections',
    {
      standard:
        'A damaged fence is worse than no fence — it advertises neglect while providing no real barrier. Gaps in the perimeter are classic intruder-access points and often align with an established shortcut path.',
      improvement:
        'Walk the full perimeter and document damage with photos. Prioritize repair of breaches within 30 days. Add "Notify if damaged" contact signage so community members report new damage promptly.',
    },
  ],
  [
    'Knox Box has been installed at a first-responder-visible location for after-hours access',
    {
      standard:
        'A Knox Box gives fire and law-enforcement personnel keys to the facility during emergencies without forcing entry. Florida fire code and most local jurisdictions require one; placement and master-key inventory must be current.',
      improvement:
        'Coordinate with the local fire marshal to install or verify Knox Box placement. Ensure current master keys are inside, and log key changes when re-keying. Location should be near the primary entry and visible from the fire lane.',
    },
  ],
  [
    'Vehicle bollards, wheel stops, or landscaped berms protect the primary building entry from vehicle ramming',
    {
      standard:
        'Unprotected glass entries are vulnerable to vehicle-ramming attacks (deliberate or accidental). Physical standoff — bollards, berms, concrete planters — is the PASS 7th-edition recommendation for K-12 entries facing parking or drive lanes.',
      improvement:
        'Install fixed or removable bollards at 4-ft intervals across the line of fire from the drive lane to the entry glass. Large concrete planters or landscape berms achieve the same result with softer aesthetic. Capital project — coordinate with district.',
    },
  ],
  [
    'Seldom-used perimeter gates or areas are secured to prevent unauthorized access',
    {
      standard:
        'Service gates, event-only gates, and maintenance access points that are rarely used accumulate damage, bypass workarounds, and sometimes intentional breaches. Any gate not actively used during the day should be locked and inspected weekly.',
      improvement:
        'Inventory all perimeter gates. Confirm each is locked, has intact hardware, and is on the weekly perimeter-walk checklist. Consider alarm contacts on gates adjacent to high-risk boundaries.',
    },
  ],
  [
    'Signs at the property perimeter direct approaching vehicles and pedestrians to the appropriate entries',
    {
      standard:
        'Wayfinding is access control. Clear signage funnels legitimate visitors to the visitor entry and makes deviation (a driver approaching a service gate, a pedestrian crossing a fence line) conspicuous to observers.',
      improvement:
        'Add directional signs at every property approach: "Visitor Parking →", "Bus Loop ←", "All Visitors Must Report to Main Office". Use consistent district-standard signage with the school name and logo.',
    },
  ],
  [
    'An attractive, visible school-name sign is posted near the primary entry',
    {
      standard:
        'School identification is both a wayfinding aid and a territorial marker. A prominent, well-maintained sign signals active ownership and helps first responders locate the correct building in an emergency.',
      improvement:
        'Install or refresh a monument sign at the primary entry with the school name, mascot/logo, and street number. Illuminate it at night. Coordinate with district branding standards.',
    },
  ],
  [
    'Trees and shrubs along the perimeter follow CPTED standards (shrubs trimmed below 2 ft, canopy above 6 ft) to preserve sight lines',
    {
      standard:
        'The "2-foot / 6-foot rule" keeps the sight line between 2 ft and 6 ft open — the height at which an adult stands. Overgrown landscaping creates concealment at exactly the height where natural surveillance matters most.',
      improvement:
        'Trim shrubs to below 2 ft and raise tree canopies above 6 ft along the entire perimeter. Add this to the grounds-maintenance schedule quarterly. Replace non-compliant species with species that mature below 2 ft.',
    },
  ],
  [
    'Perimeter is free of graffiti, litter, or signs of neglect that signal reduced guardianship',
    {
      standard:
        'Image and maintenance are core CPTED principles. A neglected perimeter — graffiti, trash, broken fixtures — signals that nobody is watching or caring, which invites escalating incidents (broken-windows theory).',
      improvement:
        'Establish a same-day graffiti removal policy. Add the perimeter to daily custodial walk. Log maintenance issues and close within 48 hours. Enlist student groups in campus-beautification projects.',
    },
  ],
  [
    'There are no unattractive barriers such as barbed wire or razor wire on the school grounds',
    {
      standard:
        'Barbed and razor wire signal "prison" rather than "school" and are inappropriate for student-facing environments. They also create legal liability (student injuries) and hurt community perception.',
      improvement:
        'Replace barbed/razor wire with architectural alternatives: anti-climb paint, rotating spike toppers, raised security fencing, or camera-monitored boundaries.',
    },
  ],

  // ─── Zone 2: Parking, Drop-off & Bus Loops ───────────────────────
  [
    'Parking lots are easily monitored from adjacent buildings or dedicated camera coverage',
    {
      standard:
        'Parking lots are the highest-incident zone on most campuses (vehicle break-ins, fights after school, unauthorized entry). They must be observable from a staffed position or by active camera coverage, especially during arrival and dismissal.',
      improvement:
        'Add PTZ cameras covering any lot that is not visible from the admin/front-office window. Position the monitoring display where a duty staff member can glance at it. Ensure camera system supports low-light operation.',
    },
  ],
  [
    'Visitor parking is visible from adjacent administrative offices',
    {
      standard:
        'Visitor parking adjacent to admin lets reception staff observe arriving visitors before they enter the building — a key defense against hostile or unauthorized arrivals. PASS 7th ed. and CDC CSA both emphasize this adjacency.',
      improvement:
        'If visitor parking is not visible from admin, relocate designated visitor spaces to the nearest area that is visible. At minimum add a camera feed of the visitor lot to the front desk monitor.',
    },
  ],
  [
    'Parent drop-off/pickup areas are easily monitored by staff and/or cameras',
    {
      standard:
        'Drop-off and pickup concentrate hundreds of students and parents in a short window. Active supervision prevents abductions, custody incidents, fights, and traffic accidents.',
      improvement:
        'Assign at least two staff members to every drop-off/pickup cycle with clear zones. Add camera coverage of the queue and pickup point. Maintain a radio check-in with the front office.',
    },
  ],
  [
    'Bus unloading/loading areas are easily monitored',
    {
      standard:
        'Bus loops are another concentration point for students and a common location for bullying, runaway incidents, and stranger contact. Supervision is required during every arrival and departure.',
      improvement:
        'Assign administrative or duty staff to bus loops during arrivals and departures. Add camera coverage with an active monitor in the front office or dean\'s office.',
    },
  ],
  [
    'Parent drop-off/pickup location is clearly marked by signage, pavement, and curb treatments',
    {
      standard:
        'Clearly marked drop-off zones are a form of access control — they funnel traffic predictably and make anyone deviating (idling in the wrong lane, picking up from the wrong zone) easy to spot.',
      improvement:
        'Add painted pavement markings, curb striping, and upright signage defining the drop-off lane. Use a different color or pattern than bus loop. Publish a drop-off map in the parent handbook.',
    },
  ],
  [
    'Students are dropped off and picked up only at authorized locations',
    {
      standard:
        'Unauthorized drop-off locations (back lots, staff parking, off-campus pullouts) break the supervision chain. The student is handed off outside adult view — a known vector for truancy, custody violations, and abduction.',
      improvement:
        'Communicate authorized drop-off zones repeatedly (newsletters, signage, call-down to repeat offenders). Have staff block or monitor unauthorized pullouts. Escalate repeat violations to admin or the SRO.',
    },
  ],
  [
    'Bus unloading/loading areas are clearly marked by signage, pavement, and/or curb treatments',
    {
      standard:
        'Separating bus traffic from parent and pedestrian traffic with clear pavement and curb treatments prevents pedestrian strikes and streamlines evacuation.',
      improvement:
        'Stripe the bus loop in a distinct color. Add upright "BUS LOOP" signage at each entrance. Physically separate bus lane from parent loop with curbing or bollards where possible.',
    },
  ],
  [
    'Visitor parking is located directly adjacent to the main administrative entrance',
    {
      standard:
        'Visitor parking adjacent to admin forces every visitor through the main entry and keeps them within line-of-sight during their walk to the door. Distant visitor parking invites casual wandering across the campus.',
      improvement:
        'Relocate the nearest parking row to "Visitor" designation. Put up signage and repaint stripes. If layout makes this impossible, reroute the visitor walkway through direct sight of admin windows.',
    },
  ],
  [
    'Parking lot entrances and exits are clearly marked',
    {
      standard:
        'Clear lot entrances/exits are both a traffic-safety measure and an access-control one — marked routes make unauthorized entries obvious and document who entered where via cameras at the gate.',
      improvement:
        'Add "Enter / Exit" signage and directional arrows at every lot opening. Stripe pavement arrows. Close or gate any opening that shouldn\'t be used.',
    },
  ],
  [
    'Secondary vehicular entries are secured during school hours',
    {
      standard:
        'Service drives, back-lot entries, and event-only gates should be locked or chained during school hours. Open secondary entries create uncontrolled vehicle access paths.',
      improvement:
        'Gate and lock all secondary vehicular entries with school-hours padlocks. Document open/close times. Install alarm contacts on gates that must remain operable for deliveries.',
    },
  ],
  [
    'Student parking lot uses access control (gate, decal enforcement, or monitored entry)',
    {
      standard:
        'High school student parking is a recurring security hot spot. Decal-based access, perimeter gating, and monitored entry all deter non-student vehicles and create accountability for lot incidents.',
      improvement:
        'Implement a parking-permit program with visible decals. Add gate-arm access (decal reader or student ID swipe) at the student lot entrance. Empower duty staff or SRO to enforce.',
    },
  ],
  [
    'Delivery activities follow a defined route that does not cross student movement zones',
    {
      standard:
        'Deliveries (food service, supplies, custodial vendors) bring large vehicles and unfamiliar adults onto campus. Routing them through student movement zones during arrival/dismissal creates preventable conflict and safety risk.',
      improvement:
        'Establish delivery hours outside arrival/dismissal windows. Define a delivery route that uses service drives, bypassing student zones. Train front-office staff to hold or redirect untimely deliveries.',
    },
  ],
  [
    'Parking areas are delineated for staff, visitors, and (where applicable) students',
    {
      standard:
        'Separating parking types is a territorial-reinforcement tool. It lets staff quickly spot misplaced vehicles (a non-permit car in student parking, a non-staff car in staff parking) and simplifies enforcement.',
      improvement:
        'Repaint parking stripes with clear zone designations. Add reserved signs at staff-only rows. Publish the parking map and distribute to staff, students (HS), and visitors.',
    },
  ],
  [
    'All parking spaces are clearly marked',
    {
      standard:
        'Clear striping prevents double-parking, maintains orderly flow, and supports the image/maintenance principle. Faded or missing stripes signal neglect.',
      improvement:
        'Add lot re-striping to the annual maintenance calendar. Prioritize high-turnover zones (visitor parking, drop-off, ADA spaces).',
    },
  ],
  [
    'Vehicular travel routes on school property are clearly marked and in good condition',
    {
      standard:
        'Marked and maintained routes prevent pedestrian/vehicle conflicts, organize traffic flow during peak periods, and support emergency vehicle access.',
      improvement:
        'Repaint travel-lane arrows, crosswalks, and stop bars. Repair potholes and cracked pavement on primary campus loops. Coordinate with district facilities for capital resurfacing.',
    },
  ],
  [
    'Authorized adults are visible and available for assistance at parent drop-off and bus areas during arrivals and departures',
    {
      standard:
        'Visible duty staff is both a supervision tool and a deterrent. Students know an adult is watching; would-be offenders see an active guardianship zone and select elsewhere.',
      improvement:
        'Publish a duty-roster for every arrival and departure cycle. Use high-visibility vests. Ensure coverage includes both ends of the bus loop and both ends of the drop-off zone.',
    },
  ],
  [
    'Parking lots are well lit during nighttime and early-morning operations',
    {
      standard:
        'Before/after-school events, athletic practices, and adult-ed classes put the lot in use after dark. Poor lighting correlates strongly with vehicle break-ins and after-event altercations.',
      improvement:
        'Measure lot foot-candle levels (target 1.0+ at pavement). Replace failed fixtures. Add LED pole lights where coverage is thin. Verify photocell/timer operation — all fixtures should activate at dusk.',
    },
  ],
  [
    'Parking lots are in good condition with no signs of vandalism',
    {
      standard:
        'Lot condition signals guardianship. Vandalism left unrepaired invites repeat incidents and broader deterioration.',
      improvement:
        'Same-day repair of vandalism. Weekly lot inspection by custodial staff. Maintain striping, curb paint, and signage on a rolling schedule.',
    },
  ],

  // ─── Zone 3: Grounds, Playgrounds & Outdoor Areas ────────────────
  [
    'Pedestrian pathways on school property are easily monitored',
    {
      standard:
        'Pathways between buildings are student-heavy during passing periods and often become loitering zones after school. Natural surveillance from classrooms/admin or supervision from duty staff is essential.',
      improvement:
        'Reroute pathways through visible corridors where possible. Add lighting and cameras along unavoidable isolated stretches. Assign duty supervision during passing periods.',
    },
  ],
  [
    'Pedestrian pathways and gathering areas are visible from occupied buildings',
    {
      standard:
        'Casual supervision by adults in adjacent buildings is the strongest CPTED surveillance tool — it is continuous, low-cost, and integrated into normal operations.',
      improvement:
        'Trim landscaping blocking windows facing pathways. Resist covering hallway windows for "privacy." Locate staff workstations near windows overlooking gathering areas.',
    },
  ],
  [
    'Playground areas are visible from administrative and classroom windows',
    {
      standard:
        'Elementary playgrounds are lift-and-grab incident hotspots. Direct visual connection from admin and classrooms provides continuous supervision and rapid response to any incident.',
      improvement:
        'Site or reconfigure playgrounds within direct sight of admin/classroom windows. If existing layout prevents this, add camera coverage with active monitoring during recess.',
    },
  ],
  [
    'Exterior athletic areas are easily monitored',
    {
      standard:
        'After-hours athletic areas host practices, community events, and often loitering or vandalism. Camera coverage and lighting let both on-site staff and after-hours patrols maintain surveillance.',
      improvement:
        'Install field-lighting and camera coverage of athletic fields. Lock gates during non-use hours. Coordinate with the Sheriff\'s Office on after-hours patrol passes.',
    },
  ],
  [
    'Bike racks are easily monitored',
    {
      standard:
        'Bikes are frequently stolen from inadequately supervised racks. Location matters more than lock quality — a rack next to the front office is almost never targeted.',
      improvement:
        'Relocate bike racks to locations directly visible from the front office or main entry. Add camera coverage. Keep racks inside the fenced perimeter, not at a detached edge.',
    },
  ],
  [
    'There are no concealment hiding places created by landscaping or fencing',
    {
      standard:
        'Dense landscaping, opaque fencing, and structural gaps create concealment where offenders can watch, loiter, or stage. Maintaining open sight lines is the foundational natural-surveillance move.',
      improvement:
        'Walk the campus with fresh eyes. Identify every spot where a person could stand unseen. Prune, relocate, or redesign to restore visibility. Add lighting to unavoidable low-visibility zones.',
    },
  ],
  [
    'Access to dumpsters is controlled (enclosed, locked, or monitored)',
    {
      standard:
        'Dumpsters are classic concealment zones and are used to hide contraband, stolen items, and sometimes weapons. Enclosed and locked dumpster areas eliminate this.',
      improvement:
        'Install a dumpster enclosure with a locked gate. Schedule pickup hours and provide the hauler with key access or a lockbox. Confirm doors are closed after every use.',
    },
  ],
  [
    'No hiding places exist in or around dumpster areas',
    {
      standard:
        'The space around a dumpster (between the dumpster and the wall, behind the enclosure, inside the enclosure on the non-gate side) must also be free of concealment.',
      improvement:
        'Add a light fixture inside or adjacent to the enclosure. Keep the area clear of stored items or debris. Include dumpster area in daily custodial rounds.',
    },
  ],
  [
    'Site utilities (electrical vaults, HVAC, gas meters) are secured with locked enclosures',
    {
      standard:
        'Site utilities are targets for sabotage and accidents. Electrical and gas meter tampering can cause fire, outages, or gas leaks. Locked enclosures prevent casual access.',
      improvement:
        'Inventory every exposed utility point. Install locked cages, fenced enclosures, or bollard protection. Coordinate with the utility company on any changes they need to maintain.',
    },
  ],
  [
    'Playground equipment is installed to restrict climbing access onto adjacent roofs or upper levels',
    {
      standard:
        'Playground structures near buildings have been used as climbing aids to access roofs and upper-level windows. Equipment height and placement should eliminate this.',
      improvement:
        'Relocate tall playground structures away from adjacent building walls. If relocation is infeasible, add anti-climb roof-edge treatment or parapet extensions.',
    },
  ],
  [
    'Athletic fields/stadium have controlled access during non-event hours',
    {
      standard:
        'After-hours stadium and field access is a recurring vandalism, trespass, and liability issue. Gating during non-event hours deters casual use and limits school-district exposure.',
      improvement:
        'Install gates on every field/stadium entrance with locking hardware. Publish event hours. Add signage ("Closed to public outside event hours"). Empower after-school staff to lock gates.',
    },
  ],
  [
    'Pedestrian pathways are separated from vehicular routes by curbing, color markings, landscaping, or other physical barriers',
    {
      standard:
        'Mixing pedestrians and vehicles leads to strikes, especially during arrival and dismissal. Physical separation (even just a painted divider with reflective markers) materially reduces incidents.',
      improvement:
        'Install curbing, bollards, or raised crosswalks along any pathway crossing a drive lane. Paint high-visibility striping. Add pedestrian-crossing signage and flashing beacons at high-traffic crossings.',
    },
  ],
  [
    'Posted rules are located at key points around the school grounds (playground, athletic areas, bike racks)',
    {
      standard:
        'Posted rules support territorial reinforcement and make violations enforceable. "No skateboarding past 4 PM" or "Students only" communicates that the space is actively managed.',
      improvement:
        'Install clear rules signs at playground, athletic areas, bike racks, and outdoor gathering spaces. Keep them current and readable. Coordinate with administration on enforcement procedures.',
    },
  ],
  [
    'Outdoor learning areas, when present, are well-defined and supervisable',
    {
      standard:
        'Outdoor learning spaces activate otherwise underused campus areas, creating positive use and casual supervision. But they must be defined (not just an open patch) and supervisable by a teacher from a single vantage.',
      improvement:
        'Delineate outdoor classroom spaces with seating, shade, and visual markers. Locate within sight of an adjacent building window. Include in the campus map with defined capacity and schedule.',
    },
  ],
  [
    'School grounds are in good condition and enhanced with landscaping, student artwork, or similar elements that demonstrate active ownership',
    {
      standard:
        'Beautification and maintenance signal active guardianship. Student-created enhancements (murals, gardens, art installations) also build territorial pride and reduce vandalism targeting.',
      improvement:
        'Partner with art and horticulture classes on campus-improvement projects. Maintain landscaping on a documented schedule. Photograph improvements for school communications.',
    },
  ],
  [
    'No signs of graffiti or vandalism on grounds or outdoor equipment',
    {
      standard:
        'Unremediated graffiti invites more graffiti — the broken-windows principle. Same-day removal is a published best practice for school and community settings.',
      improvement:
        'Adopt a 24-hour graffiti-removal policy. Train custodial staff on removal methods (chemical, pressure wash, paint-over). Photograph incidents for law-enforcement pattern tracking.',
    },
  ],
  [
    'Landscaping does not provide easy access to roofs, windows, or upper levels',
    {
      standard:
        'Mature trees close to walls, trellises, decorative walls, and dense shrubs all provide climbing aids. Offenders have used these to access roofs and upper-level windows in documented incidents.',
      improvement:
        'Remove or prune trees within 10 ft of buildings to prevent climb access. Relocate trellises and decorative climbable features. Trim shrubs adjacent to windows below sill height.',
    },
  ],
  [
    'Bike racks and enclosures are in good condition',
    {
      standard:
        'A damaged rack signals neglect and often gets ignored — bikes park nearby rather than in the rack, undoing the security benefit.',
      improvement:
        'Repair or replace damaged racks. Ensure racks are anchored to concrete (not loose). Provide enough capacity so students can use them without overcrowding.',
    },
  ],

  // ─── Zone 4: Building Exterior & Public Entry ────────────────────
  [
    'Public entry is located adjacent to the administration area and visitor parking',
    {
      standard:
        'Co-locating the public entry, admin office, and visitor parking creates a single defensible choke point. Visitors walk from a visible lot through a visible entry into a staffed office — natural surveillance at every step.',
      improvement:
        'If admin is remote from the public entry, relocate the main office to be adjacent. Alternatively, staff a fulltime greeter at the entry with direct communication to admin. Capital/renovation project for reconfiguration.',
    },
  ],
  [
    'Extensive windows and glazed doors at the public entry enhance natural surveillance',
    {
      standard:
        'Glass at the entry allows two-way visibility — visitors see an open, staffed building; staff see approaching visitors. Solid or tiny-window entries feel fortified but defeat natural surveillance.',
      improvement:
        'Maximize glazing at the public entry within ballistic-glazing standards. Use security-film-treated laminated glass to retain surveillance benefits while adding forced-entry delay.',
    },
  ],
  [
    'Courtyards are visible from the windows and doors of surrounding school buildings',
    {
      standard:
        'Interior courtyards can become concealment zones if surrounded by windowless walls. Active courtyards should have windows, doors, and occupied spaces facing inward.',
      improvement:
        'Keep courtyard-facing blinds/shades open during school hours. Relocate staff workstations adjacent to courtyard windows. Add camera coverage where the layout blocks visibility.',
    },
  ],
  [
    'Exterior stairs, balconies, ramps, and upper-level corridors are visible from windows or doors of school buildings, parking lots, and/or activity areas',
    {
      standard:
        'Exterior circulation (breezeways, stairs, open-air corridors) must be overlooked by occupied space — otherwise they become hiding and ambush zones.',
      improvement:
        'Open blinds on interior-facing windows. Add cameras on any stair or corridor section without sight-line coverage. Add lighting to low-light segments.',
    },
  ],
  [
    'Exterior stairs do not create hiding or hard-to-see areas',
    {
      standard:
        'Stairs with solid risers, enclosed sides, or dead-end landings create concealment spots. Open-riser, transparent-side stairs eliminate the hiding opportunity.',
      improvement:
        'Where feasible, retrofit to open-riser design. Add lighting inside the stair volume. Install mirrors or cameras at blind turns. Inspect landings for accumulating debris that signals loitering.',
    },
  ],
  [
    'A single, defined public entry is enforced during school hours (fortified vestibule / mantrap or equivalent)',
    {
      standard:
        'The single-point-of-entry model is the Florida FDOE and PASS 7th-edition cornerstone. All visitors enter through one hardened vestibule, get credentialed, and are then buzzed into the school interior. Multiple unstaffed entry points defeat every other hardening measure.',
      improvement:
        'Designate one public entry. Lock all others during school hours (confirm fire-code egress). Build a vestibule: visitors enter through an unlocked exterior door into a small glass-walled room, present ID, and are buzzed through the interior door.',
    },
  ],
  [
    "Front-entry vestibule glazing is ballistic-resistant, laminated, or protected with security film rated for forced-entry delay",
    {
      standard:
        'The vestibule is the last hardened layer between an attacker and the school interior. Standard glass is defeated in seconds. Laminated security glass or rated security film buys crucial seconds for lockdown and police response.',
      improvement:
        'Upgrade vestibule glazing to laminated ballistic-resistant glass, or apply UL 972 / ASTM F1233-rated security film to existing glass. Document rating level (UL 752 Level 1, 2, 3 depending on threat profile).',
    },
  ],
  [
    'Secondary entrance/exit doors are secured in the closed position and not propped open',
    {
      standard:
        'A single propped door defeats the entire single-point-of-entry model. Staff commonly prop doors for convenience during staff moves, recess returns, and deliveries — training and enforcement matter as much as hardware.',
      improvement:
        'Install door-prop alarms on every secondary door. Train staff that propping is prohibited. Provide staff with alternative access (badge readers) so they don\'t need to prop. Random audits by admin.',
    },
  ],
  [
    'Emergency-exit doors are alarmed or monitored to deter unauthorized outside access',
    {
      standard:
        'Emergency exits must be operable from inside (fire code) but should not permit outside access. Alarms and monitoring deter unauthorized exit (students slipping out) and entry (propping by accomplices).',
      improvement:
        'Install door-contact alarms on every emergency exit. Tie alarms to the front office monitoring station. Log and investigate every activation — patterns reveal process gaps.',
    },
  ],
  [
    'All buildings have highly visible identification names and/or numbers for first-responder access',
    {
      standard:
        'On multi-building campuses, first responders must identify the target building from the driveway in an emergency. Highly visible names/numbers reduce critical response seconds.',
      improvement:
        'Paint or install large building-number placards on every exterior face facing a drive lane. Use reflective signage for night visibility. Confirm labels match the school safety map / HB 301 digital mapping.',
    },
  ],
  [
    'Portable classrooms display highly visible identification names/numbers',
    {
      standard:
        'Portables are often the most difficult buildings for first responders to find because they\'re numbered non-sequentially and tucked into back lots. Clear identification is critical.',
      improvement:
        'Number every portable on at least two sides (entry door and back). Match the number used on the campus map and HB 301 mapping data.',
    },
  ],
  [
    'Spaces under portables, including stairs and ramps, are screened to limit access',
    {
      standard:
        'The space under a raised portable is a classic concealment zone — used for contraband stash, hiding during lockdown avoidance, and after-hours loitering.',
      improvement:
        'Install lattice, skirting, or solid panels around the base of every portable. Leave service access panels (locked) for plumbing/HVAC. Include under-portable zones in custodial checks.',
    },
  ],
  [
    'Portables are secured when not in use',
    {
      standard:
        'Unlocked portables after hours are vandalism and theft targets and create an entry point to the campus interior if they connect via breezeway or covered walkway.',
      improvement:
        'Train staff to lock portable doors and windows at end of day. Add door-contact alarms. Include portables in nightly custodial security walk.',
    },
  ],
  [
    'Screening walls and/or architectural features do not allow easy access to the roof or upper levels',
    {
      standard:
        'Screening walls, trash enclosures, and architectural features adjacent to buildings are frequently used as climbing aids to access the roof. Roof access enables entry through skylights, HVAC penetrations, and upper windows.',
      improvement:
        'Audit the exterior for climb-aid structures. Where they exist, extend parapet height, add anti-climb treatment, or relocate the feature.',
    },
  ],
  [
    'Covers for exterior walkways and stairs are designed to limit easy access to roofs, windows, or upper levels',
    {
      standard:
        'Covered walkway roofs are a common climbing path to building roofs because they abut the wall at a climbable height.',
      improvement:
        'Separate walkway covers from main building walls by at least 4 ft. Add parapet/barrier at the connection point. Consider anti-climb coating on walkway supports.',
    },
  ],
  [
    'Public entry is well defined with architectural features, signs, lighting, artwork, landscaping, and/or landmarks such as flags',
    {
      standard:
        'The public entry should read as the welcoming front door — both to invite legitimate visitors and to make any attempted entry elsewhere conspicuous.',
      improvement:
        'Enhance the public entry with a flagpole, school monument sign, distinctive architectural feature, lighting, and coordinated landscaping. Make it impossible to mistake which door is the front door.',
    },
  ],
  [
    'Courtyards are enhanced with landscaping, student artwork, or other physical means',
    {
      standard:
        'Enhanced courtyards are actively used courtyards. Active use generates natural surveillance and discourages misuse.',
      improvement:
        'Partner with art, horticulture, or environmental-science classes to enhance courtyards. Add seating for class use. Plan scheduled use (outdoor lessons, reading time) to activate the space.',
    },
  ],
  [
    'Exterior walls, doors, and windows are in good condition',
    {
      standard:
        'Condition reflects guardianship. Broken hardware, cracked glass, and failed seals invite further damage and create actual security gaps.',
      improvement:
        'Establish a quarterly envelope inspection. Log and schedule repairs within 30 days. Prioritize any glass damage, broken locks, or failed weatherstripping around doors.',
    },
  ],
  [
    'No signs of graffiti on exterior walls',
    {
      standard:
        'Exterior graffiti is the most visible indicator of reduced guardianship — it broadcasts vulnerability to the neighborhood.',
      improvement:
        'Same-day graffiti removal policy (within 24 hours). Photograph before removal for law-enforcement pattern analysis. Use anti-graffiti coating on frequent-target walls.',
    },
  ],
  [
    'Murals, artwork, landscaping, and/or other architectural treatments enhance blank or barren exterior walls',
    {
      standard:
        'Large blank walls are vandalism magnets. Activation with murals, artwork, or landscaping both enhances image and deters graffiti (vandals avoid walls that are already "owned").',
      improvement:
        'Commission student or community murals on blank exterior walls. Add climbing vines or facade landscaping. Coordinate with district on approval and maintenance funding.',
    },
  ],

  // ─── Zone 5: Reception, Visitor Management & Administration ──────
  [
    'Reception desk has clear sight lines to the public entry and approach',
    {
      standard:
        'Desk positioning is critical. Receptionist should face the entry, not sit with back to it (the problem flagged in the Volusia source document). Desk should see visitors approaching and entering.',
      improvement:
        'Reposition the reception desk to face the entry. If structurally impossible, install a mirror or camera feed so the receptionist has continuous entry view without turning.',
    },
  ],
  [
    'Extensive use of windows in administrative areas provides natural surveillance of adjoining interior spaces',
    {
      standard:
        'Admin is the most continuously staffed area of the school. Interior windows into adjacent spaces (lobby, corridor, secretary workroom) leverage that constant presence into continuous surveillance.',
      improvement:
        'Add interior-facing windows or glass half-walls between admin and adjoining spaces. Keep blinds open during school hours. Resist covering windows for "privacy" — surveillance is the priority.',
    },
  ],
  [
    'Extensive use of windows in administrative areas provides natural surveillance of the exterior',
    {
      standard:
        'Exterior-facing admin windows let reception see visitors approaching and entering the parking area. This is the foundational layer of visitor management.',
      improvement:
        'Preserve and uncover admin exterior windows. Trim landscaping blocking the view. Avoid relocating admin to an interior room without exterior windows.',
    },
  ],
  [
    'Lobby area is visible from adjacent administrative offices',
    {
      standard:
        'Staff in admin offices should be able to see the lobby without leaving their desks. This creates continuous lobby supervision without dedicated duty assignment.',
      improvement:
        'Add interior glazing between admin office walls and the lobby. Reposition desks to face the lobby. Consider lobby-facing camera feeds to staff monitors.',
    },
  ],
  [
    'Access from the public lobby into the main school building is controlled (locked door, electronic access control, or staffed gate)',
    {
      standard:
        'The lobby/vestibule should be a secure buffer — visitors can enter from outside but cannot enter the main school without credentialing. This is the functional core of PASS single-point-of-entry.',
      improvement:
        'Install a locked interior door between lobby and main school, controlled by reception via electric strike / buzzer. Confirm fire-code compliance for egress (door must unlock on alarm).',
    },
  ],
  [
    'Visitor sign-in and badging system is in place and actively used (e.g., Raptor, ID scan)',
    {
      standard:
        'ID-scan visitor systems (Raptor, Ident-A-Kid, Verkada, etc.) automatically check visitors against sex-offender and custody lists. Florida best practice for all K-12; required by many districts.',
      improvement:
        'Deploy a visitor-management system with ID scan, printed badge, and automated background check. Train all front-office staff. Ensure the system is used for 100% of visitors — no exceptions.',
    },
  ],
  [
    'Front office has an Alyssa\'s Law panic alert / silent panic button accessible from the reception position',
    {
      standard:
        'Florida statute requires a Mobile Panic Alert System (MPAS) that integrates directly with the local PSAP. Reception is the first to encounter a hostile arrival and must be able to trigger the alert instantly.',
      improvement:
        'Ensure the Alyssa\'s Law MPAS has a reception-accessible trigger (wearable, desk button, or mobile app). Test the PSAP integration quarterly. Train reception on activation criteria and procedure.',
    },
  ],
  [
    'Access to school staff areas is controlled (badge, code, or staffed access)',
    {
      standard:
        'Staff-only areas (workrooms, teacher lounges, records rooms) should not be open to the public or unescorted visitors. Controlled access deters both unauthorized entry and insider misuse.',
      improvement:
        'Install badge or keypad access on staff-area doors. Audit key distribution. Re-key when staff leave or keys are lost.',
    },
  ],
  [
    'Counseling and student-services areas have controlled access and are in good condition',
    {
      standard:
        'Counseling spaces handle sensitive student records, mental-health information, and sometimes crisis-response interactions. They need controlled access and a maintained image that communicates trust.',
      improvement:
        'Ensure counseling offices have locking doors and records storage. Keep the space clean and welcoming. Provide a private-but-observable waiting area.',
    },
  ],
  [
    'Lobby is attractive, cheerful, and inviting — with signs clearly directing visitors to the office',
    {
      standard:
        'An inviting lobby serves double duty: it welcomes legitimate visitors and signals active guardianship (clean, staffed, attended). Directional signs prevent visitors from wandering.',
      improvement:
        'Invest in lobby presentation: fresh paint, student displays, flags, seating. Add signs at eye level directing to the main office. Keep the area free of clutter.',
    },
  ],
  [
    'Signs provide directions to major school areas (administrative offices, cafeteria, media center, auditorium, gymnasium, etc.)',
    {
      standard:
        'Wayfinding signage reduces unauthorized wandering and helps first responders and new visitors navigate quickly. Good signage is a measured PASS recommendation.',
      improvement:
        'Install wayfinding signs at every decision point inside the building. Use consistent iconography and a color-coded scheme. Include in the new-student/new-staff orientation.',
    },
  ],
  [
    'Lobby and reception area are clean, well lit, and in good condition',
    {
      standard:
        'Condition and cleanliness reinforce the guardianship signal. A tired, dim lobby signals an unfocused school.',
      improvement:
        'Daily cleaning. Replace failed lighting within 48 hours. Refresh paint annually. Maintain seating, plants, and displays.',
    },
  ],

  // ─── Zone 6: Interior Corridors, Stairs & Lobbies ────────────────
  [
    'Interior corridors are easily monitored by staff during class changes, arrivals, and departures',
    {
      standard:
        'Hall monitoring is the core interior-supervision task. Visible staff at class changes, arrivals, and departures deters bullying, fights, tardiness, and unauthorized movement.',
      improvement:
        'Publish a hallway duty roster. Require every admin and duty-eligible staff member to be in the hallway for passing periods. Use high-visibility lanyards or vests.',
    },
  ],
  [
    'Interior corridors have no hiding places (no recessed alcoves or unmonitored nooks)',
    {
      standard:
        'Recessed alcoves, dead-end nooks, and architectural features create concealment zones where incidents cluster. Every corridor section should be surveillable by at least one camera or monitor position.',
      improvement:
        'Identify alcoves. Add cameras at blind spots. Where feasible, reconfigure or close off the alcove. Install convex mirrors at critical turns.',
    },
  ],
  [
    'Interior stairs do not create hiding or hard-to-see areas',
    {
      standard:
        'Stairwells are disproportionately the site of fights, substance use, and bullying — they\'re enclosed and infrequently observed. Visibility treatments materially reduce incidents.',
      improvement:
        'Install cameras in every stairwell with a real-time feed to the front office. Add lighting. Where architecturally feasible, convert solid stair walls to glass or partial-height.',
    },
  ],
  [
    'Locker banks, when present, are arranged to maintain visibility (center lockers do not obstruct sight lines)',
    {
      standard:
        'Free-standing locker islands in the middle of a corridor create hidden rows behind them. Wall-mounted-only lockers preserve corridor sight lines.',
      improvement:
        'Where center lockers exist, consider removing them or lowering their height. At minimum, add cameras positioned to cover the blind side of each locker island.',
    },
  ],
  [
    'Interior corridor light controls are secured to prevent unauthorized access',
    {
      standard:
        'Unprotected light switches invite tampering (turning off lights during transitions to enable bullying or fights). Tamper-resistant or locked controls prevent this.',
      improvement:
        'Replace exposed switches with locked tamper-resistant covers or keyed switches. Use building-management automation for routine on/off control.',
    },
  ],
  [
    'Interior stair and balcony light controls are secured',
    {
      standard:
        'Same logic as corridor light switches — stairs are especially vulnerable because they\'re already low-surveillance zones.',
      improvement:
        'Replace stairwell switches with locked covers. Use occupancy sensors or scheduled automatic control.',
    },
  ],
  [
    'Access to elevators is limited to authorized individuals',
    {
      standard:
        'Elevators are enclosed spaces where incidents have low visibility. Limiting use to staff, visitors with escorts, and students with documented need reduces unsupervised use.',
      improvement:
        'Install key-card or key-switch control on elevators. Publish the elevator-access policy. Audit unauthorized use patterns via camera.',
    },
  ],
  [
    'Elevators are located in easy-to-view areas with mirrors inside to eliminate hiding places',
    {
      standard:
        'Elevator location and mirrors together provide the security layer for this enclosed space. Mirrors let the cab\'s interior be observed before entry.',
      improvement:
        'Install convex mirrors inside every elevator cab. Position elevator lobbies on main traffic paths, not in remote hallways.',
    },
  ],
  [
    'Authorized adults (staff, administrators, SRO/Guardian) are visible in interior corridors during arrivals, class changes, and departures',
    {
      standard:
        'Active, visible adult presence is the single most effective deterrent to interior-space incidents. The SRO/Guardian and admin should be visible in the corridor, not in the back office.',
      improvement:
        'Publish a corridor-coverage duty plan. Admin commits to walking halls during passing periods. SRO/Guardian walks between zones on a rotating pattern.',
    },
  ],
  [
    'Lockers, where used, are adequately spaced to avoid crowding and see-through where possible',
    {
      standard:
        'Crowding at lockers is a bullying and theft hot spot. See-through metal-mesh lockers (where policy allows) also eliminate concealment inside the locker itself.',
      improvement:
        'Reconfigure locker banks to reduce crowding during passing periods. Consider mesh-fronted lockers when replacing units. Stagger bell schedules if crowding persists.',
    },
  ],
  [
    'Interior corridors are well lit and free of obstacles that impede orderly pedestrian flow',
    {
      standard:
        'Clutter in corridors — bookshelves, displays, equipment — reduces visibility and impedes rapid evacuation. Lighting gaps create concealment during peak hours.',
      improvement:
        'Remove non-essential obstacles from primary corridors. Add lighting where foot-candle measurement falls short. Establish clear fire-code egress paths.',
    },
  ],
  [
    'Interior stairs, balconies, doors, and windows are in good condition',
    {
      standard:
        'Condition reflects maintenance priority. Failed hardware, broken glass, and damaged stair treads create both safety and security issues.',
      improvement:
        'Monthly inspection of stair and circulation hardware. Schedule repairs within 30 days. Replace failing window hardware promptly — broken window locks are both safety and security concerns.',
    },
  ],

  // ─── Zone 7: Classrooms & Instructional Spaces ───────────────────
  [
    'Classroom door windows allow natural surveillance into classrooms from the hallway',
    {
      standard:
        'Door windows allow administrators and hall monitors to verify classroom state without entering. Critical during lockdown — external monitors can assess whether a room is secure.',
      improvement:
        'Maintain door-window glazing. Keep it uncovered during normal operation. Use removable opaque coverings for lockdown (see separate item).',
    },
  ],
  [
    'Classroom windows allow for natural surveillance of exterior spaces',
    {
      standard:
        'Exterior-facing classroom windows turn every occupied classroom into a surveillance post for the adjacent campus area. Occupied classrooms should face the active campus.',
      improvement:
        'Preserve exterior windows. Keep blinds open during lessons when feasible. Locate high-use classrooms along sides of the building that face playgrounds, parking, or entry points.',
    },
  ],
  [
    'Furniture, lockers, or other objects do not compromise natural surveillance within the classroom',
    {
      standard:
        'Tall furniture, storage cabinets, and interior lockers can create interior hiding spots inside a classroom. For lockdown scenarios, every square foot should be surveillable from a single teacher position.',
      improvement:
        'Audit classroom furniture for tall blind-side pieces. Reposition or remove where they create blind spots. Maintain a "see-through classroom" layout at the teacher\'s eye level.',
    },
  ],
  [
    'Classrooms can be secured and locked down from the inside without the teacher exiting the room',
    {
      standard:
        'Florida HB 1421 campus hardening. The historical practice of teachers exiting to lock doors from outside is a known vulnerability during active-threat events. All classroom doors must be lockable from inside.',
      improvement:
        'Install interior-locking door hardware on every classroom door. Verify compliance with fire code (must exit freely). Prioritize this retrofit — it is the single highest-impact classroom hardening.',
    },
  ],
  [
    'Secured classroom doors can still be exited from inside in an emergency (no key required to egress)',
    {
      standard:
        'Fire code and life-safety requirement: doors must be operable from inside without a key, even when locked against intrusion. Non-compliant hardware creates fire evacuation liability.',
      improvement:
        'Verify every classroom lock meets fire-code egress requirements. Replace non-compliant hardware immediately. Typical compliant solutions: single-action thumbturn, classroom-function lockset.',
    },
  ],
  [
    'Classroom doors are secured when the classroom is not in use',
    {
      standard:
        'Unlocked unoccupied classrooms are theft targets and potential hiding spots. Secured rooms protect equipment and reduce search area during lockdown.',
      improvement:
        'Train staff to lock classrooms at end of day and during any period the room is empty for 15+ minutes. Consider automatic door-closers and self-locking hardware.',
    },
  ],
  [
    'Door-glazing coverings or opaque strips are available and deployable during lockdown (block sight into the room)',
    {
      standard:
        'PASS 7th-edition best practice: door-window coverings that can be quickly deployed during lockdown prevent the attacker from identifying occupied rooms. Permanent coverings defeat everyday surveillance.',
      improvement:
        'Issue each classroom a door-glazing cover (magnetic strip, roll-down shade, or adhesive blackout panel). Train on deployment during lockdown drills. Store accessibly near the door.',
    },
  ],
  [
    'Each classroom has an exterior-visible classroom number or ID (door or window placard) for tactical response',
    {
      standard:
        'During tactical response (law enforcement sweep of a school), exterior-visible room numbers let officers match positions on the HB 301 digital mapping to physical rooms. Critical for locating the specific room under threat.',
      improvement:
        'Install exterior-visible placards at every classroom door or adjacent exterior window. Match numbering to the HB 301 digital mapping file provided to law enforcement.',
    },
  ],
  [
    'Every classroom has a means to contact the front office or administration directly (phone, intercom, two-way radio, or mobile alert app)',
    {
      standard:
        'Teachers must be able to summon help without leaving the classroom. Every classroom should have at least one independent communication channel to admin and/or the panic alert system.',
      improvement:
        'Verify phone or intercom in every classroom. If gaps exist, deploy Alyssa\'s Law mobile panic apps to every teacher device. Confirm two-way radios are available for floating staff.',
    },
  ],
  [
    'Posted emergency procedures, lockdown instructions, or Standard Response Protocol (SRP) signage is visible in each classroom',
    {
      standard:
        'Posted procedures reinforce training and give substitute teachers and visitors immediate guidance. Standard Response Protocol (SRP: Hold, Secure, Lockdown, Evacuate, Shelter) is the widely adopted framework.',
      improvement:
        'Post SRP or equivalent procedure cards in every classroom at eye level near the door. Include the classroom\'s room number, nearest exit, and reunification location.',
    },
  ],
  [
    'Classrooms are well lit, in good condition, and free of clutter that would impede evacuation or lockdown',
    {
      standard:
        'Clutter obstructs evacuation, blocks sight lines during lockdown, and signals a distracted environment. Every classroom should have clear primary and secondary egress paths.',
      improvement:
        'Periodic classroom clutter audits. Maintain minimum 36-inch evacuation paths. Ensure lockdown hiding zones (under the line of sight through the door window) are unobstructed.',
    },
  ],
  [
    'In-school suspension areas are easily monitored by staff',
    {
      standard:
        'ISS rooms concentrate at-risk students and can become incident hotspots if inadequately supervised. Active staff presence and line-of-sight are required.',
      improvement:
        'Staff ISS rooms continuously. Add camera coverage. Position the supervising staff member with direct sight of every student. Keep class sizes manageable.',
    },
  ],

  // ─── Zone 8: Assembly & Support Spaces ───────────────────────────
  [
    'Cafeteria entries are well-defined and easily monitored',
    {
      standard:
        'Cafeterias concentrate hundreds of students during meal periods. Defined entries and active monitoring prevent unauthorized entry, fights, and food-line disputes.',
      improvement:
        'Define cafeteria entries with physical markers (stanchions, signage). Assign duty staff to each entry during every meal period. Add camera coverage of entries and main dining area.',
    },
  ],
  [
    'Auditorium entries are well-defined and easily monitored',
    {
      standard:
        'Auditoriums host large-group events including community functions. Defined entries and staffed monitoring during events are both security and fire-code requirements.',
      improvement:
        'Add signage defining the auditorium public entry. Assign event staff to the entry during performances. Maintain clear fire-code egress at all exits.',
    },
  ],
  [
    'Gymnasium is easily monitored and access to the underside of bleachers is limited',
    {
      standard:
        'Gyms host PE, practices, and events. Bleacher undersides are classic concealment zones — used for contraband, hiding, and bullying.',
      improvement:
        'Skirt bleacher undersides with plywood or metal mesh. Keep the gym locked when not in use. Add camera coverage of the gym floor and bleacher area.',
    },
  ],
  [
    'Library / media center entries are well-defined and monitored by staff/volunteers',
    {
      standard:
        'Libraries are open gathering spaces often used during free periods. The entry is a natural choke point for monitoring and check-in.',
      improvement:
        'Position the checkout desk at the primary entry. Staff or volunteer presence during all open hours. Limit alternate entries to emergency exit only.',
    },
  ],
  [
    'Locker rooms and shower areas are easily monitored by staff',
    {
      standard:
        'Locker rooms have historically been underserved by adult supervision due to privacy concerns. Balanced monitoring — staff presence at entry, visible during changing windows — is achievable without violating privacy.',
      improvement:
        'Assign coaching/PE staff to be present during changing periods. Position the supervising station with sight of the locker aisle (not the shower). Address shower supervision through pair-buddy procedure or camera at entry only.',
    },
  ],
  [
    'Access to the cafeteria kitchen and serving areas is limited to authorized staff',
    {
      standard:
        'Kitchen access control is both a security and food-safety requirement. Unauthorized access enables contamination, theft, and equipment tampering.',
      improvement:
        'Install locked access to the kitchen. Publish an authorized-personnel list. Badge-access control in larger operations. Serve through a defined pass-through window.',
    },
  ],
  [
    'Cafeteria entrances are secured when the room is not in use',
    {
      standard:
        'Outside meal hours, an open cafeteria is a large unsupervised space. Secured doors prevent unauthorized gathering and loitering.',
      improvement:
        'Lock cafeteria doors outside meal periods. Train custodial staff to verify locked state. Include in nightly security walk.',
    },
  ],
  [
    'Gymnasium entrances are secured when the room is not in use',
    {
      standard:
        'Gyms are frequent after-hours vandalism targets. Secured entrances protect equipment and deter unauthorized entry from covered walkways or adjacent rooms.',
      improvement:
        'Lock gym doors when not in use. Badge-access for authorized coaches/staff. Camera coverage of entrances. Include in nightly security walk.',
    },
  ],
  [
    'Light controls in gym and locker rooms are secured to prevent unauthorized access',
    {
      standard:
        'Unsecured light switches are commonly tampered with to create concealment during incidents. Locker rooms and gyms are high-incident zones where this matters most.',
      improvement:
        'Install locked switch covers or keyed switches. Use occupancy sensors or scheduled automatic control.',
    },
  ],
  [
    'Auditorium backstage, sound booth, and production areas are secured when not in use',
    {
      standard:
        'Backstage and production zones contain valuable equipment, catwalks, and hidden spaces that can be misused for concealment or unauthorized gathering.',
      improvement:
        'Install locked access to backstage, sound booth, and catwalk areas. Publish an authorized-personnel list. Lock equipment storage separately.',
    },
  ],
  [
    'CTE / shop / lab spaces (if present) have controlled access and secured tool storage',
    {
      standard:
        'Shop and lab spaces contain tools, chemicals, and equipment that must not leave the space. Controlled access and locked tool storage protect both security and OSHA compliance.',
      improvement:
        'Install badge or keyed access to shop/lab rooms. Use locked tool cribs with daily inventory. Secure chemicals and power equipment after every class. Camera coverage of tool storage.',
    },
  ],
  [
    'Cafeteria has authorized adults visible during meal periods',
    {
      standard:
        'Adult presence during meal periods deters fights, bullying, and food-service disputes. Visible authority is a primary natural-surveillance tool.',
      improvement:
        'Publish a cafeteria-duty roster for every meal period. Rotate admin presence. Use high-visibility vests or lanyards. Position staff at movement choke points.',
    },
  ],
  [
    'Posted rules or code of conduct displayed at entries to gym, cafeteria, and library',
    {
      standard:
        'Posted rules make expectations enforceable and visible. They also support territorial reinforcement — the space has rules because someone cares about it.',
      improvement:
        'Install uniform rule/conduct signs at each major assembly space entry. Keep content current. Coordinate with admin on enforcement procedure.',
    },
  ],
  [
    'Cafeteria, auditorium, gymnasium, and library are in good condition',
    {
      standard:
        'Assembly-space condition reflects institutional priority. Degraded assembly spaces signal neglect and invite further damage.',
      improvement:
        'Quarterly condition inspection. Repairs scheduled within 30 days. Annual refresh of paint, flooring, and lighting. Include in capital-improvement planning.',
    },
  ],
  [
    'Sufficient table spacing in the cafeteria allows orderly circulation',
    {
      standard:
        'Crowded cafeteria layouts cause fights, spills, and bottlenecks at egress. PASS recommends defined circulation lanes between tables.',
      improvement:
        'Reconfigure cafeteria to leave defined circulation lanes. Mark them on the floor if needed. Reduce table count if necessary to maintain spacing.',
    },
  ],
  [
    'Locker rooms are well lit in all areas including shower and restroom zones',
    {
      standard:
        'Dim locker rooms enable concealment. Full illumination in every zone — including showers and restrooms — is essential for natural surveillance.',
      improvement:
        'Measure foot-candle levels throughout locker rooms. Upgrade fixtures where thin. Use moisture-rated LED in showers. Check daily that all fixtures operate.',
    },
  ],
  [
    'Athletic equipment and supply storage rooms are locked when not in use',
    {
      standard:
        'Athletic storage rooms hold equipment that can be misused as weapons (bats, clubs) and valuable supplies. They also become hiding spaces if left unlocked.',
      improvement:
        'Install keyed or badge locks on all athletic storage. Authorized-personnel list. Check lock state during nightly security walk.',
    },
  ],

  // ─── Zone 9: Restrooms & Utility Areas ───────────────────────────
  [
    'Multi-stall restroom entries use an open zigzag / maze design rather than a single solid door',
    {
      standard:
        'Zigzag / maze entries provide privacy visual block without a solid door. Critical: they allow auditory surveillance from the adjacent corridor, meaning staff can hear incidents and intervene. Solid-door restrooms are a historically high-incident zone.',
      improvement:
        'Where feasible, replace solid-door multi-stall restrooms with zigzag entries. For existing solid-door installations, consider prop-open policies during high-risk periods with privacy walls inside.',
    },
  ],
  [
    'Restroom entries are easily viewed from other active areas',
    {
      standard:
        'Restroom entry should be in the corridor sight line — not tucked into a remote hall wing. Visibility of the entry by passing staff creates strong natural surveillance.',
      improvement:
        'Place restroom entries along primary corridors. Add camera coverage where the entry is in a less-traveled section. Ensure staff in adjacent offices have the entry in their line of sight.',
    },
  ],
  [
    'Restrooms with solid doors have vents that allow auditory surveillance',
    {
      standard:
        'Where architecture mandates solid-door restrooms (elementary, single-occupancy), vents or transoms allow staff in the adjacent corridor to hear incidents occurring inside — a partial compensation.',
      improvement:
        'Install door vents or transom panels on solid-door restrooms where surveillance is difficult. Maintain periodic audio check-ins. Consider noise-sensing detectors in older facilities.',
    },
  ],
  [
    'Restroom light controls are secured to prevent unauthorized access',
    {
      standard:
        'Switching off restroom lights during an incident enables concealment. Locked switches or occupancy-sensor control prevents tampering.',
      improvement:
        'Install occupancy sensors (no switch) or locked switch covers. Confirm lighting comes on when the room is occupied.',
    },
  ],
  [
    'Electrical panels, mechanical rooms, and utility closets are locked',
    {
      standard:
        'Electrical panels can be tampered with to cause power loss (a tactic in some active-threat events). Mechanical rooms contain HVAC, water, and gas controls.',
      improvement:
        'Lock every electrical panel and utility room. Audit key distribution. Install alarm contacts on mechanical rooms. Include in nightly security walk.',
    },
  ],
  [
    'IT / server room access is restricted to authorized personnel and logged',
    {
      standard:
        'IT rooms contain student records, attendance systems, camera recordings, and Alyssa\'s Law hardware. Access must be restricted and logged for audit.',
      improvement:
        'Install badge or electronic-key access to IT rooms. Enable access logging. Review logs periodically. Limit authorized-personnel list to IT staff only.',
    },
  ],
  [
    'Roof access hatches are secured and alarmed',
    {
      standard:
        'Roof access via interior hatches or exterior ladders is a recurring intrusion vector. Secure hatches and alarm openings to deter and detect unauthorized use.',
      improvement:
        'Lock all roof-access hatches. Install alarm contacts reporting to front office. Remove or disable exterior roof ladders below a climbable height. Schedule roof inspection annually.',
    },
  ],
  [
    'Restroom stall doors, hardware, and locks are in good condition',
    {
      standard:
        'Damaged stalls, broken latches, and missing doors are both maintenance issues and privacy/safety concerns. They also signal neglect.',
      improvement:
        'Quarterly inspection of every restroom. Repair damage within 48 hours. Replace failed hardware immediately. Privacy partitions and locks are essential — no exceptions.',
    },
  ],
  [
    'Restrooms are well lit with no unusually foul odors',
    {
      standard:
        'Lighting and odor are both image/maintenance indicators. A well-maintained restroom signals active guardianship; a neglected one invites further neglect.',
      improvement:
        'Daily custodial attention. Replace failed fixtures within 24 hours. Address drainage issues (persistent odors often indicate drain problems). Maintain floor and fixture condition.',
    },
  ],
  [
    'Restroom ceiling treatments do not provide access to a hiding place',
    {
      standard:
        'Drop-ceiling tiles in restrooms have been used to conceal contraband, weapons, and sometimes intruders. Secure or solid ceilings eliminate this.',
      improvement:
        'Where drop ceilings exist in restrooms, consider secured-tile systems or replacement with fixed ceilings. Routine ceiling-tile inspection for tampering.',
    },
  ],
  [
    'Toilets, urinals, lavatories, and fixtures are in good condition',
    {
      standard:
        'Fixture condition reflects maintenance priority and directly affects student dignity. Broken fixtures also create hygiene, plumbing, and mold issues.',
      improvement:
        'Quarterly fixture inspection. Repair or replace within 30 days. Annual fixture refresh budget. Track fixture failures to identify systemic issues.',
    },
  ],

  // ─── Zone 10: Safety Systems, Policies & Emergency Readiness ─────
  [
    'Camera coverage exists at all primary entries, main corridors, parking lots, and bus loading / drop-off zones',
    {
      standard:
        'Camera coverage of all entries, primary circulation, and vehicle zones provides both real-time monitoring and post-incident evidence. PASS and CISA K-12 guidance both treat camera coverage as a baseline.',
      improvement:
        'Gap-analyze current camera coverage. Add PTZ at entries; fixed cameras in corridors; dome coverage of parking. Tie to a monitoring station with recording and retrieval capability.',
    },
  ],
  [
    'Camera system records continuously with adequate storage (minimum 30 days) and accurate timestamps',
    {
      standard:
        'Retention period matters — incidents often aren\'t reported for days or weeks. 30-day retention is a widely used floor; FDOE encourages longer. Accurate timestamps are essential for investigation.',
      improvement:
        'Verify retention settings. Expand storage if under 30 days. Confirm system NTP time-sync. Test retrieval quarterly. Ensure exports produce prosecutable-quality video.',
    },
  ],
  [
    'A dedicated monitoring point (SRO office, front desk, or admin) provides real-time camera view during school hours',
    {
      standard:
        'Cameras are most effective when actively monitored. A dedicated monitoring station with a duty-eligible viewer during school hours turns a passive-recording system into an active-deterrent one.',
      improvement:
        'Install a monitoring station in the SRO office, front desk, or admin with multi-feed display. Assign viewing responsibility. Integrate with panic-alert system to auto-focus on alert location.',
    },
  ],
  [
    'Alyssa\'s Law Mobile Panic Alert System (MPAS) is installed and staff have been trained; alert integrates directly with local PSAP (911)',
    {
      standard:
        'Florida statute requires every school to operate an MPAS integrating directly with the PSAP. Failure to integrate must be reported to the superintendent, vendor, and FDOE Office of Safe Schools within 24 hours.',
      improvement:
        'Verify MPAS deployment and PSAP integration. Train 100% of staff on activation. Test the PSAP handshake quarterly. Document training compliance. Report failures on the statutory timeline.',
    },
  ],
  [
    'Digital school mapping data (HB 301) has been provided to the Sheriff\'s Office and first responders',
    {
      standard:
        'HB 301 (2023) requires digital mapping data — floor plans, room IDs, utility shutoffs, camera locations — for first responders. Critical during tactical response; required to access the HB 301 grant funding.',
      improvement:
        'Contract with an approved HB 301 mapping vendor. Produce compliant digital map. Share with the Sheriff\'s Office and fire department. Refresh annually and after any renovation.',
    },
  ],
  [
    'Electronic access control / badge system is used for staff entry to controlled areas',
    {
      standard:
        'Badge access creates accountability, supports re-keying when staff leave, and enables zone-level access policies (staff-only, admin-only, custodial hours). Metal keys can\'t do any of this.',
      improvement:
        'Deploy electronic access at primary staff entries and controlled areas (admin, IT, records, mechanical). Manage the badge database centrally. Deactivate departing staff immediately.',
    },
  ],
  [
    'Key control system is in place (master keys tracked, locks re-keyed when staff leave, spare keys secured)',
    {
      standard:
        'Key management is frequently the weakest link in school physical security. Untracked keys, infrequent re-keying, and loose spare keys undermine every hardening measure.',
      improvement:
        'Maintain a key inventory spreadsheet. Re-key promptly when keys are lost or staff leave. Secure master keys in a safe. Move toward badge access to reduce physical-key count over time.',
    },
  ],
  [
    'Single-alert activation automatically triggers campus lockdown and notification across intercom, digital signage, and staff devices',
    {
      standard:
        'Alyssa\'s Law v2 evolution (and PASS leading practice): a single trigger should simultaneously activate PSAP alert, intercom announcement, digital signage display, and staff mobile notification. Coordinated response beats manual multi-step.',
      improvement:
        'Integrate panic-alert platform with intercom, digital signage, and staff notification. Test the coordinated trigger quarterly. Document playbook. Train staff on simultaneous multi-channel response.',
    },
  ],
  [
    'School Safety Specialist is appointed and all staff know who that person is',
    {
      standard:
        'Florida HB 1421 requires a School Safety Specialist per district with duties including drills, threat assessment, training, and compliance. Awareness across the school is essential for utilization.',
      improvement:
        'Publish the Safety Specialist\'s name, role, and contact info in staff handbook, break rooms, and digital staff portal. Introduce them at every staff meeting. Include them in drill debriefs.',
    },
  ],
  [
    'Threat Assessment Team is established and meets per state requirements (Marjory Stoneman Douglas Act)',
    {
      standard:
        'The MSD Public Safety Act requires every school to have a multidisciplinary Threat Assessment Team to evaluate concerning behaviors and intervene before escalation. Meeting cadence and documentation are statutory.',
      improvement:
        'Constitute a TAT with admin, counseling, SRO/Guardian, and teacher members. Train on the statewide TAT framework. Meet on the statutory schedule. Document every assessed case confidentially.',
    },
  ],
  [
    'School Resource Officer or Guardian coverage is in place for all student hours, matching campus population and footprint',
    {
      standard:
        'MSD Act requires armed law-enforcement presence (SRO or qualified Guardian) at every public school during all student hours. Coverage must match population and footprint — large campuses often need multiple officers.',
      improvement:
        'Verify SRO/Guardian coverage with the Sheriff\'s Office. Match staffing to enrollment (benchmark: 1 per 1000 students minimum, plus one per additional occupied building). Document schedule and substitutes.',
    },
  ],
  [
    'FortifyFL (anonymous tip line) is posted and publicized to students and staff',
    {
      standard:
        'FortifyFL is the state-required anonymous tip line. Florida statute requires posting in every school. Utilization correlates with reporting — schools that publicize it see more early-warning reports.',
      improvement:
        'Install FortifyFL posters at every student gathering space (cafeteria, lobby, corridors). Include in the student handbook, parent newsletter, and morning announcements. Train staff on tip triage.',
    },
  ],
  [
    'Two-way radios or equivalent communication devices are available to administration, SRO/Guardian, and duty staff',
    {
      standard:
        'During incidents, cell networks can fail and phones are slow. Dedicated two-way radios provide instant, reliable, group communication across admin, SRO, custodial, and duty staff.',
      improvement:
        'Equip admin, SRO/Guardian, and duty staff with radios. Establish channel plan (daily ops, emergency, custodial). Train on radio etiquette. Test weekly. Maintain charger stations at admin.',
    },
  ],
  [
    'Multi-hazard evacuation plan is current, reviewed annually with law enforcement and fire, and posted as required',
    {
      standard:
        'Florida statute requires a multi-hazard evacuation plan covering fires, hurricanes, shootings, and bomb threats. Annual review with law enforcement and fire is required. Posted in common areas.',
      improvement:
        'Review the plan annually with the Sheriff\'s Office and fire department. Update after any incident or facility change. Post in common areas. Distribute to staff. Include in new-hire orientation.',
    },
  ],
  [
    'Reunification site and procedure are established, documented, and known to staff and families',
    {
      standard:
        'Post-evacuation reunification is logistically complex and historically chaotic without pre-planning. A designated off-site location, documented procedure, and family-notification protocol are essential.',
      improvement:
        'Designate a reunification site (typically an off-site partner facility). Document the accountability and release procedure. Communicate to families. Drill the reunification component at least annually.',
    },
  ],
  [
    'Lockdown, fire, and severe-weather drills have been conducted on the state-required schedule',
    {
      standard:
        'Florida requires fire drills monthly, lockdown drills at defined intervals, and severe-weather drills annually. Drill logs are subject to FDOE review.',
      improvement:
        'Publish the drill calendar. Assign a drill coordinator. Log every drill: date, duration, issues identified, corrective actions. Include all building occupants (students, staff, visitors).',
    },
  ],
  [
    'Mass-notification system (intercom, digital signage, SMS) is tested and functional',
    {
      standard:
        'Mass notification carries lockdown instructions, evacuation routing, and reunification information during an incident. Regular testing confirms it works when needed.',
      improvement:
        'Test intercom weekly (beginning-of-day check). Test SMS / digital signage monthly. Document test results. Replace failed components immediately. Confirm integration with panic-alert activation.',
    },
  ],
]);
