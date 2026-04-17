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
]);

export function getItemPhase(itemText: string): Phase {
  return INTERIOR_ITEMS.has(itemText) ? 'interior' : 'exterior';
}
