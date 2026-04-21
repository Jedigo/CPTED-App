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
]);

export function getItemPhase(itemText: string): Phase {
  return INTERIOR_ITEMS.has(itemText) ? 'interior' : 'exterior';
}
