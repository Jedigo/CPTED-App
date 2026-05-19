/**
 * Checklist-item walkthrough phase classification.
 *
 * Items are either:
 *   - 'exterior' — observable/checkable from outside the building (street view,
 *      perimeter walk, parking, etc.)
 *   - 'interior' — requires interior access (deadbolts, window locks, alarm
 *      panels, sanctuary / admin / classroom checks)
 *
 * The assessor uses the phase filter to focus on the current part of their
 * walkthrough (e.g., "Exterior" during the solo perimeter walk, then
 * "Interior" when going inside with the owner/staff).
 *
 * Default: any item_text not present in INTERIOR_ITEMS is treated as exterior.
 * This set is shared across all property types — item texts that appear in
 * multiple templates (e.g., "Deadbolt installed with minimum 1\" throw...") have
 * the same phase regardless of template.
 */

export type Phase = 'exterior' | 'interior';

const INTERIOR_ITEMS = new Set<string>([
  // ─── Residential + Townhome: front door / entry hardware ───
  'Front door is solid core hardwood or metal (not hollow core)',
  'Deadbolt installed with minimum 1" throw and reinforced strike plate (3" screws)',
  'Door frame is solid and in good condition (no rot, no gaps)',
  'Glass panels in or near door are reinforced or have security film',
  'Peephole or video doorbell installed and functional',

  // ─── Residential + Townhome: rear entry / windows ───
  'Rear entry door is solid core with deadbolt (same standard as front)',
  'Sliding glass doors have secondary security (dowel/pin in track, security bar, or foot lock)',
  'Rear windows have working locks and are reinforced if ground-accessible',

  // ─── Residential + Townhome: garage interior ───
  'Interior door from garage to home is solid core with deadbolt',
  'Overhead garage door has a manual lock (not relying solely on opener)',
  'Emergency release cord is secured against coat hanger manipulation',

  // ─── Lighting control (owner must confirm) ───
  'Exterior lights on photocell (dusk-to-dawn) or timer — not solely manual switch',
  'Exterior lights on photocell or timer — not solely manual switch',

  // ─── Residential + Townhome: windows & interior security ───
  'Windows in high-use rooms (living room, kitchen) face the street or yard areas',
  'Window treatments allow occupants to observe outside (not permanently blocked/covered)',
  'Every window has a working lock in good condition',
  'Ground-floor windows have security film or reinforced glass where appropriate',
  'Alarm/security system installed and in working order (if applicable)',

  // ─── Townhome-specific interior items ───
  'Vents or transoms on shared walls (if any exist between units) are secured',

  // ─── Worship + Christian Church: Main Entry / Lobby ───
  'Lobby/narthex has windows or sight lines to the exterior approach',
  'Greeters, ushers, or reception staff have a clear view of arriving visitors',
  'Foyer/lobby has windows or sight lines to the exterior approach',
  'Greeters, welcome team, or reception staff are positioned to observe and engage all arriving visitors',
  'Main entry doors can be locked or controlled during services (single point of entry when needed)',
  'Vestibule or narthex creates a transitional space between outside and worship areas',
  'Foyer or lobby creates a transitional space between outside and worship areas',
  'All visitors are funneled through 1-2 well-marked entrances rather than multiple scattered access points',
  'Greeting or welcome ministry is positioned to observe and engage all who enter',
  'Visitor check-in or information area is near the main entrance',
  'Visitor check-in or welcome center is positioned centrally near the main entrance to serve as both information point and visual deterrent',
  'Entry area is clean, well-lit, and welcoming (good first impression)',

  // ─── Worship + Christian Church: Sanctuary / Worship Center ───
  'Ushers or safety team members can observe all seating areas and entry points from their positions',
  'Balcony, choir loft, or elevated areas are monitored or restricted when not in use',
  'Altar/chancel area is visible from multiple vantage points (no hidden approaches)',
  'Stage/platform area is visible from multiple vantage points (no hidden approaches)',
  'Sound booth/AV production area has clear sight lines to the stage and all entry points',
  'Sacristy and vestry rooms are locked when unoccupied',
  'Tabernacle or sacred objects are secured (anchored, locked, or alarmed)',
  'Access to altar/chancel area can be controlled during services',
  'Access to stage/platform area can be controlled during services',
  'Backstage and production areas are locked when unoccupied',
  'Sound booth and AV equipment are secured (locked cabinet or restricted room)',
  'Baptistry area has locked access when not in use (doors and stair access secured)',
  'Emergency exits are clearly marked, unobstructed, and operable from inside',
  'Evacuation plan is posted and congregation has been briefed on emergency procedures',
  'Panic alarm is accessible from the sound/media booth and the podium/stage area',
  'Worship center doors can be secured for lockdown during an active threat',

  // ─── Worship + Christian Church: Fellowship / Community Spaces ───
  'Fellowship hall and meeting rooms have windows or open sight lines from adjacent spaces',
  'Kitchen area has a serving window or pass-through that maintains visual connection',
  'Cafe/bookstore area has open sight lines and is visible from staffed areas — when near the entry, supports natural surveillance of arriving visitors',
  'Gymnasium/recreation areas have windows or open access points allowing visual monitoring',
  'Meeting rooms can be locked when not in use',
  'Kitchen has lockable storage for sharp objects and hazardous materials',
  'Exterior doors from fellowship spaces are alarmed or monitored',
  'Gymnasium storage rooms are locked when not in use',
  'Fellowship spaces are clean, organized, and free of clutter that could impede evacuation',
  'Emergency exits from fellowship areas are clearly marked and unobstructed',

  // ─── Worship + Christian Church: Education / Children / Youth ───
  "Children's wing or area has controlled access (check-in/check-out system in place)",
  'Classroom doors have locks operable from inside and viewing windows or half-doors for supervision',
  "Restrooms near children's areas are single-occupancy or supervised",
  "Only authorized personnel can access nursery and children's rooms",
  'Youth/student ministry building or wing has controlled access separate from the main facility',
  'Youth areas have lockdown capability independent of main building',
  'Exterior doors on youth building are locked from outside (exit-only) during programming',
  "Hallways in children's areas have clear sight lines with no hidden alcoves",
  "Hallways in children's and youth areas have clear sight lines with no hidden alcoves",
  'Classroom doors have vision panels or windows allowing visual monitoring from hallways',
  'Classroom and youth activity rooms have vision panels or windows allowing visual monitoring from hallways',
  'Classrooms have lockdown capability (doors lockable from inside, window coverings available)',
  "Two-adult rule or open-door policy is practiced in children's ministry areas",
  "Two-adult rule or open-door policy is practiced in children's and youth ministry areas",

  // ─── Worship + Christian Church: Admin / Support ───
  'Administrative offices are locked when unoccupied',
  'Financial records, offering storage, and safe are in a secured area with limited access',
  'Server room or IT closet is locked and access is restricted to authorized personnel',
  'Office area reception or front desk has a clear view of approaching visitors',
  'No isolated offices without a secondary exit or line of sight to common areas',
  'Storage rooms and maintenance areas are organized and locked when not in use',
  'Key control system is in place (master keys tracked, locks rekeyed when staff leave)',

  // ─── Worship + Christian Church: Surveillance (requires system access) ───
  'Camera system records continuously with adequate storage (minimum 30 days)',

  // ─── Schools: Building Exterior (interior-observed vestibule details) ───
  'A single, defined public entry is enforced during school hours (fortified vestibule / mantrap or equivalent)',
  'Front-entry vestibule glazing is ballistic-resistant, laminated, or protected with security film rated for forced-entry delay',
  'Secondary entrance/exit doors are secured in the closed position and not propped open',
  'Emergency-exit doors are alarmed or monitored to deter unauthorized outside access',

  // ─── Schools: Reception, Visitor Management & Administration ───
  'Reception desk has clear sight lines to the public entry and approach',
  'Extensive use of windows in administrative areas provides natural surveillance of adjoining interior spaces',
  'Extensive use of windows in administrative areas provides natural surveillance of the exterior',
  'Lobby area is visible from adjacent administrative offices',
  'Access from the public lobby into the main school building is controlled (locked door, electronic access control, or staffed gate)',
  'Visitor sign-in and badging system is in place and actively used (e.g., Raptor, ID scan)',
  "Front office has an Alyssa's Law panic alert / silent panic button accessible from the reception position",
  'Access to school staff areas is controlled (badge, code, or staffed access)',
  'Counseling and student-services areas have controlled access and are in good condition',
  'Lobby is attractive, cheerful, and inviting — with signs clearly directing visitors to the office',
  'Signs provide directions to major school areas (administrative offices, cafeteria, media center, auditorium, gymnasium, etc.)',
  'Lobby and reception area are clean, well lit, and in good condition',

  // ─── Schools: Interior Corridors, Stairs & Lobbies ───
  'Interior corridors are easily monitored by staff during class changes, arrivals, and departures',
  'Interior corridors have no hiding places (no recessed alcoves or unmonitored nooks)',
  'Interior stairs do not create hiding or hard-to-see areas',
  'Locker banks, when present, are arranged to maintain visibility (center lockers do not obstruct sight lines)',
  'Interior corridor light controls are secured to prevent unauthorized access',
  'Interior stair and balcony light controls are secured',
  'Access to elevators is limited to authorized individuals',
  'Elevators are located in easy-to-view areas with mirrors inside to eliminate hiding places',
  'Authorized adults (staff, administrators, SRO/Guardian) are visible in interior corridors during arrivals, class changes, and departures',
  'Lockers, where used, are adequately spaced to avoid crowding and see-through where possible',
  'Interior corridors are well lit and free of obstacles that impede orderly pedestrian flow',
  'Interior stairs, balconies, doors, and windows are in good condition',

  // ─── Schools: Classrooms & Instructional Spaces ───
  'Classroom door windows allow natural surveillance into classrooms from the hallway',
  'Classroom windows allow for natural surveillance of exterior spaces',
  'Furniture, lockers, or other objects do not compromise natural surveillance within the classroom',
  'Classrooms can be secured and locked down from the inside without the teacher exiting the room',
  'Secured classroom doors can still be exited from inside in an emergency (no key required to egress)',
  'Classroom doors are secured when the classroom is not in use',
  'Door-glazing coverings or opaque strips are available and deployable during lockdown (block sight into the room)',
  'Each classroom has an exterior-visible classroom number or ID (door or window placard) for tactical response',
  'Every classroom has a means to contact the front office or administration directly (phone, intercom, two-way radio, or mobile alert app)',
  'Posted emergency procedures, lockdown instructions, or Standard Response Protocol (SRP) signage is visible in each classroom',
  'Classrooms are well lit, in good condition, and free of clutter that would impede evacuation or lockdown',
  'In-school suspension areas are easily monitored by staff',

  // ─── Schools: Assembly & Support Spaces ───
  'Cafeteria entries are well-defined and easily monitored',
  'Auditorium entries are well-defined and easily monitored',
  'Gymnasium is easily monitored and access to the underside of bleachers is limited',
  'Library / media center entries are well-defined and monitored by staff/volunteers',
  'Locker rooms and shower areas are easily monitored by staff',
  'Access to the cafeteria kitchen and serving areas is limited to authorized staff',
  'Cafeteria entrances are secured when the room is not in use',
  'Gymnasium entrances are secured when the room is not in use',
  'Light controls in gym and locker rooms are secured to prevent unauthorized access',
  'Auditorium backstage, sound booth, and production areas are secured when not in use',
  'CTE / shop / lab spaces (if present) have controlled access and secured tool storage',
  'Cafeteria has authorized adults visible during meal periods',
  'Posted rules or code of conduct displayed at entries to gym, cafeteria, and library',
  'Cafeteria, auditorium, gymnasium, and library are in good condition',
  'Sufficient table spacing in the cafeteria allows orderly circulation',
  'Locker rooms are well lit in all areas including shower and restroom zones',
  'Athletic equipment and supply storage rooms are locked when not in use',

  // ─── Schools: Restrooms & Utility Areas ───
  'Multi-stall restroom entries use an open zigzag / maze design rather than a single solid door',
  'Restroom entries are easily viewed from other active areas',
  'Restrooms with solid doors have vents that allow auditory surveillance',
  'Restroom light controls are secured to prevent unauthorized access',
  'Electrical panels, mechanical rooms, and utility closets are locked',
  'IT / server room access is restricted to authorized personnel and logged',
  'Roof access hatches are secured and alarmed',
  'Restroom stall doors, hardware, and locks are in good condition',
  'Restrooms are well lit with no unusually foul odors',
  'Restroom ceiling treatments do not provide access to a hiding place',
  'Toilets, urinals, lavatories, and fixtures are in good condition',

  // ─── Schools: Safety Systems, Policies & Emergency Readiness ───
  'Camera coverage exists at all primary entries, main corridors, parking lots, and bus loading / drop-off zones',
  'Camera system records continuously with adequate storage (minimum 30 days) and accurate timestamps',
  'A dedicated monitoring point (SRO office, front desk, or admin) provides real-time camera view during school hours',
  "Alyssa's Law Mobile Panic Alert System (MPAS) is installed and staff have been trained; alert integrates directly with local PSAP (911)",
  "Digital school mapping data (HB 301) has been provided to the Sheriff's Office and first responders",
  'Electronic access control / badge system is used for staff entry to controlled areas',
  'Key control system is in place (master keys tracked, locks re-keyed when staff leave, spare keys secured)',
  'Single-alert activation automatically triggers campus lockdown and notification across intercom, digital signage, and staff devices',
  'School Safety Specialist is appointed and all staff know who that person is',
  'Threat Assessment Team is established and meets per state requirements (Marjory Stoneman Douglas Act)',
  'School Resource Officer or Guardian coverage is in place for all student hours, matching campus population and footprint',
  'FortifyFL (anonymous tip line) is posted and publicized to students and staff',
  'Two-way radios or equivalent communication devices are available to administration, SRO/Guardian, and duty staff',
  'Multi-hazard evacuation plan is current, reviewed annually with law enforcement and fire, and posted as required',
  'Reunification site and procedure are established, documented, and known to staff and families',
  'Lockdown, fire, and severe-weather drills have been conducted on the state-required schedule',
  'Mass-notification system (intercom, digital signage, SMS) is tested and functional',

  // ─── Commercial Office: items mis-tagged as exterior that actually require
  // SOC/alarm-panel/interview verification (re-phased v0.23.1) ───
  'Remote or seldom-used edges of the property are visible from the building, internal roadways, or dedicated camera coverage',
  'Parking areas are visible from occupied portions of the building (ground- or upper-floor windows, reception, or security control room)',
  'Cameras provide overlapping coverage of all parking areas with no significant blind spots between fixtures',
  'After-hours parking is restricted, and any after-hours arrivals are observable by security staff or via monitored cameras',
  'The full exterior perimeter is observable from cameras, regularly patrolled paths, or building windows with overlapping coverage',
  'Secondary exterior doors are alarmed (door-position contact reporting to the security panel) so any opening is detected',
  'Roof access doors and roof hatches are locked, alarmed, and not used as informal smoking-break exits',
  'The loading dock is visible from a regularly staffed position, security camera, or both at all times of dock operation',
  'The exterior approach to the loading dock is camera-covered with continuous recording',
  'Service entries (janitor, vendor, contractor doors) are alarmed, exit-only or card-controlled, and not propped during business hours',
  'Vendors, delivery drivers, and contractors check in at the dock or at reception and are issued a temporary badge before entering the building',
  'Ground-floor windows are not obstructed by interior signs, posters, or furniture beyond the 10% / 5-ft CPTED guideline',

  // ─── Commercial Office: Lobby, Reception & Visitor Management (Z5 — all interior) ───
  'The reception/security desk has direct sight line to the primary exterior door and the full lobby',
  'Reception staff can see arriving visitors before the visitor reaches the desk (no concealed approach)',
  'The lobby is monitored by camera with recording, including coverage of the reception desk and any side doors',
  'A vestibule or transaction barrier separates the public lobby from the employee-controlled portion of the building',
  'All visitors check in at reception and are issued a visitor badge before entering the controlled portion of the building',
  'Visitor badges are visually distinct from employee badges and use a self-expiring or dated mechanism so reuse is detected',
  'Visitors are escorted by a host employee, or are routed through a reception-controlled door, before entering office floors',
  'A panic alarm or duress button is present at the reception desk and tested on a known schedule',
  'The transition door from lobby to employee space is controlled by card reader, not propped, and re-locks reliably',
  'A clearly posted visitor policy or sign-in expectation is visible to arriving visitors',
  "Reception's location, signage, and orientation make it obvious that all visitors must check in before proceeding",
  'Reception staff have a workstation view (or shared monitor) of relevant exterior and lobby cameras',
  'The visitor management system (paper log or software) captures visitor name, host, time in/out, and badge number',
  'The lobby is well-maintained, brightly lit, and projects a controlled, professional image consistent with corporate ownership',
  'A designated customer waiting area is visible from reception and not isolated in an unstaffed alcove or back-corner seating',
  'Customer meeting rooms preserve sight line from outside (vision panel, glass wall) or are equipped with a panic/duress button so employees are not isolated during difficult conversations',
  'Reception distinguishes customer visitors from vendor/contractor sign-ins so each is routed and badged appropriately',

  // ─── Commercial Office: Loading Dock, Mailroom & Service Entries (Z6 — interior subset) ───
  'Mailroom intake is observable from another staffed area or by camera covering the receiving counter',
  'The mailroom has dedicated access control (card reader or staffed sign-in) separating it from the rest of the office space',
  'A documented suspicious-package protocol (tell-tale signs, isolation procedure, 911 escalation) is posted in or near the mailroom',
  'Mail and packages are screened (visual inspection at minimum; X-ray, K9, or vendor-screening service if higher tier) before distribution into the building',
  "The mailroom HVAC is isolated from, or capable of being isolated from, the building's central air handling in the event of a suspicious substance release",
  'A package-receiving log records inbound deliveries, sender, and recipient for accountability',
  'The dock and mailroom are clean, organized, and free of accumulated packaging, prop-open wedges, and unsecured tools',

  // ─── Commercial Office: Vertical Circulation (Z7 — all interior) ───
  'Elevator interiors are camera-covered with recording',
  'Stairwells are camera-covered at landings or have alarmed door contacts so unauthorized travel is detected',
  'Floor lobbies (elevator vestibules on each floor) are visible from a regularly occupied position on that floor',
  'Elevator floor selection requires a credential after hours (or all-times for restricted floors), so unauthenticated travel is blocked',
  'Stairwell doors permit free egress (life-safety code) but re-entry from the stairwell to office floors is controlled by card reader',
  'Stairwell re-entry is permitted on at least every fourth floor and on the floor of discharge, in line with code, so occupants are never trapped in a stairwell',
  'The path from the stairwell discharge to the exterior exit door is unobstructed and well lit',
  'Roof access from the top stairwell is locked, alarmed, and signed as restricted',
  'All stairwells are lit at code-required levels with no out or dim fixtures',
  'Floor lobbies and elevator vestibules are lit to recognize faces on camera',
  'Stairwells are free of stored materials, propped doors, and accumulated trash',
  'Elevator cab interiors are clean, undamaged, and free of graffiti',

  // ─── Commercial Office: Office Floors & Workstations (Z8 — all interior) ───
  'Workstation layout preserves sight lines across the open floor plan rather than creating hidden alcoves or screened workstations',
  'Conference rooms with glass walls or interior windows allow casual observation of activity from circulation paths',
  'Cubicle and partition heights do not exceed five feet in primary work areas, in line with CPTED office surveillance guidance',
  'Executive suite, executive assistant area, or C-suite floor is separated from general office space by access control',
  'Conference rooms used for sensitive discussions are lockable when in use',
  'Print/copy rooms with multifunction devices that handle sensitive documents are positioned in low-foot-traffic locations with reasonable visibility',
  'Employee badging policy requires badges to be worn visibly while on the floor',
  'Floor signage and wayfinding establish departmental identity (e.g., "Claims Operations — Floor 3") so visitors understand whose territory they have entered',
  'Executive and restricted floors are signed and visually treated to reinforce that the space is access-controlled',
  'A clean-desk practice is in effect for sensitive paper records (claims, PII, HR) at end of day',
  'Workstations are configured so that screens displaying confidential information are not visible from public corridors or windows',
  'Employees know how to challenge or report a person on the floor without a visible badge',
  'Office floors are clean, well-maintained, and project a controlled corporate image consistent with the lobby presentation',

  // ─── Commercial Office: Critical & Restricted Areas (Z9 — all interior) ───
  'Doors to critical rooms are visible from a regularly staffed position or are camera-covered',
  'Activity in or around mechanical/electrical/utility rooms is observable from corridors rather than from unmonitored hallway dead-ends',
  'The server room / data center has access control with audit logging (card reader at minimum; biometric where the data sensitivity warrants it)',
  'Main and floor-level telecom/network closets (often labeled MDF and IDF) are locked at all times and access is limited to IT and authorized vendors',
  'HR records, claim files, and other PII storage areas are behind access-controlled doors with key or badge logging',
  'Mechanical, electrical, and elevator-equipment rooms are locked and signed as restricted',
  'The water service entry, fire-pump room, and any chemical or fuel storage areas are locked and signed',
  'The emergency generator and fuel storage are protected by perimeter fencing, locked enclosure, or restricted-access yard',
  'Server room and telecom/network closets (MDF and IDF rooms) are camera-covered with recording',
  'Door-position contacts on critical rooms report to the security alarm panel and trigger after-hours alerts',
  'Access logs for critical rooms are reviewed on a defined cadence (the security director can describe the cadence and reviewer)',
  'Critical rooms are kept clean and free of stored unrelated materials that would obscure equipment or block egress',
  'Restricted-area signage is current, legible, and free of damage',

  // ─── Commercial Office: Building Systems & Security Technology (Z10 — all interior) ───
  'The access control system is unified across the entire building (single-tenant context — one platform, one credential per employee)',
  'The access control system can immediately disable a credential and the security director can describe the revocation workflow',
  'Camera footage is retained for at least 30 days (90 days preferred per CPTED office guidance)',
  'Cameras are positioned and resolved to support facial recognition at intended distances; non-working cameras have been repaired or removed',
  'The intrusion alarm system is monitored 24/7 (in-house SOC or central station) and the monitoring contract is current',
  'A mass notification system is in place that can reach all building occupants (intercom/PA, SMS, desktop alerts, or combination) and has been tested within the last 12 months',
  'The security system is integrated with fire/life-safety such that fire alarm activation releases fail-safe doors and elevators recall in line with code',
  'A documented panic-alarm capability exists at reception, executive areas, and HR with a tested response protocol',
  'Security technology (cameras, readers, alarm panels, mass-notification devices) shows no visible damage, missing covers, or out-of-service indicators',
  'Documentation, drawings, and credentials lists are current and reviewed on a stated cadence',

  // ─── Commercial Office: Workplace Violence & Active-Threat Readiness (Z11 — all interior / program) ───
  'A documented Workplace Violence Prevention policy exists and is communicated to all employees on hire and at a defined refresher cadence',
  'A multidisciplinary Threat Assessment Team (security, HR, legal, mental-health resource, LE liaison) is in place and meets on a defined cadence to review concerning behavior reports',
  'A confidential employee-reporting channel exists for threats, intimidation, and concerning behavior, and employees know how to use it',
  'Pre-employment screening and a documented termination protocol (badge return, escort, threat assessment for high-risk separations) are in place',
  'Customer-facing staff (claims, policy service, reception) have received de-escalation and hostile-customer response training within the last 24 months',
  'A written Emergency Action Plan (EAP) covering fire, severe weather, medical, bomb threat, and active assailant is current and accessible to floor wardens',
  'Run-Hide-Fight (or equivalent ALICE-style) training has been delivered to all employees within the last 24 months',
  'Lockdown drills have been conducted within the last 12 months and after-action notes are retained',
  'Floor wardens or a building emergency-response team are designated, named, and trained, with backups identified for absences',
  'Designated assembly/rally points (and inclement-weather alternates) are identified for evacuation accountability',
  'The building has a tested capability to immediately lock all access-controlled doors and disable card readers on command (lockdown card or SOC console)',
  'The building has a tested capability to immediately stop elevators at the next floor so they do not recall to the lobby during an active threat',
  'Designated rooms or floors have lockable interior doors so occupants can shelter in place, and employees know which rooms qualify',
  'Mass notification devices (PA, desktop alert, SMS) reach all areas of the building including stairwells, restrooms, and parking; coverage has been verified by drill',
  'Floor plans, riser diagrams, and access credentials/keys are pre-staged for delivery to law enforcement during an incident (e.g., Knox Box, lobby lockbox, or pre-arranged digital share)',
  "The security director has a documented coordination point of contact with the Volusia Sheriff's Office (or local LE) and has hosted a familiarization walkthrough within the last 24 months",
  'Mass notification, panic alarm, and lockdown systems are tested on a documented schedule and test logs are retained',
  'EAP documents, evacuation maps, and rally-point signage on every floor are current and legible',
  'Post-incident response resources (EAP, victim assistance contacts, employee assistance program, business continuity playbook) are documented and assigned to a named owner',
]);

export function getItemPhase(itemText: string): Phase {
  return INTERIOR_ITEMS.has(itemText) ? 'interior' : 'exterior';
}

/**
 * Items that are best observed/verified after dark.
 *
 * Used to power the dedicated "Night" walkthrough tab — the assessor opens it
 * during the nighttime portion of a multi-time-of-day assessment and sees a
 * flat list of every night-relevant item across all zones, no per-zone hunting.
 *
 * Tagging strategy:
 *   1. Any item in a `lighting` principle (commercial Z2/Z4/Z7, worship/christian Z8)
 *   2. Any item in the `exterior_lighting` zone (residential + townhome — whole zone)
 *   3. Explicit one-offs in NIGHT_ITEMS (after-hours observability, motion lights
 *      that live in other principles)
 */
const NIGHT_ITEMS = new Set<string>([
  // Commercial Office — after-hours observability lives in access_control, not lighting
  'After-hours parking is restricted, and any after-hours arrivals are observable by security staff or via monitored cameras',
]);

export function isNightItem(score: {
  zone_key: string;
  principle: string;
  item_text: string;
}): boolean {
  // Interior-tagged items are never night items, even when in a lighting
  // principle. The assessor doesn't have building access after dark, so
  // interior fixtures (Z7 stairwells, elevator vestibules) belong on the
  // Interior walk, not the Night walk.
  if (INTERIOR_ITEMS.has(score.item_text)) return false;
  if (NIGHT_ITEMS.has(score.item_text)) return true;
  if (score.zone_key === 'exterior_lighting') return true;
  if (score.principle === 'lighting') return true;
  return false;
}

/**
 * Field-verification hints for items that require interior access (SOC monitor,
 * alarm panel, or security-director interview). Shows on the ChecklistItem card
 * during scoring so the assessor knows what to ask / where to look.
 *
 * Most items don't need a hint — only those where verification path is
 * non-obvious from the item text itself.
 */
const VERIFICATION_HINTS = new Map<string, string>([
  // Commercial office — SOC/alarm/interview verification
  [
    'Remote or seldom-used edges of the property are visible from the building, internal roadways, or dedicated camera coverage',
    'Verify camera coverage of remote edges with the security director.',
  ],
  [
    'Parking areas are visible from occupied portions of the building (ground- or upper-floor windows, reception, or security control room)',
    'Look out from reception and upper-floor windows during the interior walk.',
  ],
  [
    'Cameras provide overlapping coverage of all parking areas with no significant blind spots between fixtures',
    'At the SOC monitor, walk between cameras and have the security director confirm you appear on each camera with overlap at the edges.',
  ],
  [
    'After-hours parking is restricted, and any after-hours arrivals are observable by security staff or via monitored cameras',
    'Ask the security director about after-hours arrival alerts and monitoring coverage.',
  ],
  [
    'The full exterior perimeter is observable from cameras, regularly patrolled paths, or building windows with overlapping coverage',
    'Review the camera-coverage map or SOC feeds with the security director.',
  ],
  [
    'Secondary exterior doors are alarmed (door-position contact reporting to the security panel) so any opening is detected',
    'Verify door-position contacts at the intrusion alarm panel or SOC.',
  ],
  [
    'Roof access doors and roof hatches are locked, alarmed, and not used as informal smoking-break exits',
    'Verify the lock by accessing the top stairwell; verify alarm status at the panel.',
  ],
  [
    'The loading dock is visible from a regularly staffed position, security camera, or both at all times of dock operation',
    'Ask the dock supervisor about their sight line; check the dock camera feed at the SOC.',
  ],
  [
    'The exterior approach to the loading dock is camera-covered with continuous recording',
    'Confirm at the SOC monitor — verify the dock-approach camera captures license plates.',
  ],
  [
    'Service entries (janitor, vendor, contractor doors) are alarmed, exit-only or card-controlled, and not propped during business hours',
    'Verify alarm status at the panel; check door hardware up close during the interior walk.',
  ],
  [
    'Vendors, delivery drivers, and contractors check in at the dock or at reception and are issued a temporary badge before entering the building',
    'Review the dock check-in log and interview the dock supervisor about the vendor protocol.',
  ],
  [
    'Ground-floor windows are not obstructed by interior signs, posters, or furniture beyond the 10% / 5-ft CPTED guideline',
    'Check from inside — verify sign coverage on the glazing is under 10% and that desks/file cabinets are at least 5 ft back from ground-floor windows. Especially important when the glass is mirrored or heavily tinted.',
  ],
]);

export function getVerificationHint(itemText: string): string | undefined {
  return VERIFICATION_HINTS.get(itemText);
}
