/**
 * CPTED Item Guidance for Christian Churches
 *
 * Maps each Christian church checklist item (by exact item_text) to:
 *   - standard: What CPTED best practice expects (1-2 sentences)
 *   - improvement: Specific actionable steps the organization can take (2-3 steps)
 *
 * Based on CISA Houses of Worship Self-Assessment, Sheepdog Church Security,
 * Tri-Rivers Baptist Assessment Checklist, Brewster Baptist Safety Manual,
 * and Church Production Magazine CPTED guidelines.
 */

import type { ItemGuidance } from './item-guidance';

export const CHRISTIAN_ITEM_GUIDANCE = new Map<string, ItemGuidance>([
  // ─── Zone 1: Property Perimeter & Parking ───

  [
    'Parking lot is visible from the street and from at least one occupied building entrance',
    {
      standard:
        'CPTED principles require parking areas to be observable from occupied spaces so that criminal activity is deterred by the perception of being watched.',
      improvement:
        'Trim vegetation and remove visual barriers between the parking lot and the street. Install windows or cameras facing the lot from the main building. Consider positioning greeters or safety team members with a view of the parking area during events.',
    },
  ],
  [
    'No dense vegetation, walls, or structures creating concealment near parking areas',
    {
      standard:
        'Areas adjacent to parking should be free of hiding spots that could conceal an attacker or criminal activity.',
      improvement:
        'Apply the 2\'/6\' rule: trim shrubs below 2 feet and raise tree canopies above 6 feet. Remove or relocate storage sheds, dumpsters, or walls that create blind spots adjacent to where people park.',
    },
  ],
  [
    'Drop-off and pick-up zones are clearly visible from interior gathering spaces',
    {
      standard:
        'Drop-off areas — especially those used by children, elderly, or mobility-impaired visitors — should be observable from inside the building.',
      improvement:
        'Designate a specific drop-off zone near the main entrance with clear sight lines from the lobby. Install a window or camera covering the drop-off area. Assign a greeter or volunteer to monitor during high-traffic times.',
    },
  ],
  [
    'Perimeter has clear sight lines — no blind corners along property edges',
    {
      standard:
        'The full perimeter of the property should be observable without blind corners that could harbor loitering or concealment.',
      improvement:
        'Walk the full perimeter and identify blind spots created by walls, fences, vegetation, or outbuildings. Remove or trim concealment, add convex mirrors at blind corners, or install lighting to eliminate dark zones.',
    },
  ],
  [
    'Vehicular entry points are limited and clearly defined (not open on all sides)',
    {
      standard:
        'Limiting vehicle access points reduces the attack surface and makes it easier to monitor who enters the property.',
      improvement:
        'Close unnecessary vehicle entry points with bollards, planters, or gates. Ensure remaining entry points are clearly marked with signage. Consider temporary barriers during large events.',
    },
  ],
  [
    'Bollards or barriers protect building entrances and gathering areas from vehicle approach',
    {
      standard:
        'Physical barriers between vehicle routes and pedestrian areas prevent vehicle-ramming attacks, which are a recognized threat to places of worship.',
      improvement:
        'Install bollards, large planters, or reinforced benches at building entrances and outdoor gathering areas. Decorative bollards can provide protection while maintaining aesthetics. Ensure barriers are rated for vehicle impact.',
    },
  ],
  [
    'Parking lot has designated visitor, staff, and accessible spaces clearly marked',
    {
      standard:
        'Clearly marked parking designations improve traffic flow, reduce confusion, and help safety teams identify unfamiliar vehicles.',
      improvement:
        'Paint or repaint parking lot markings. Add signs for visitor, handicap, and staff parking. Consider reserving spots closest to the main entrance for visitors and those with mobility needs.',
    },
  ],
  [
    'Perimeter fencing or boundary markers control pedestrian access to the property',
    {
      standard:
        'Defined boundaries establish territorial reinforcement and channel pedestrian traffic to monitored entry points.',
      improvement:
        'Install low fencing, hedging, or decorative boundary markers along property lines. Ensure pedestrian access is directed toward the main entrance. Secure gaps in existing fencing.',
    },
  ],
  [
    'Property name, service times, and address clearly visible from the street',
    {
      standard:
        'Clear identification helps visitors find the property, enables emergency responders to locate the site quickly, and communicates active use.',
      improvement:
        'Install or upgrade a monument sign with the organization name, address (minimum 4" numbers), and service times. Ensure signage is illuminated or reflective for nighttime visibility.',
    },
  ],
  [
    'Signage directs visitors to main entrance and parking areas',
    {
      standard:
        'Wayfinding signage reduces confusion, channels visitors to monitored entry points, and reinforces a sense of organization.',
      improvement:
        'Add directional signs at the property entrance, parking lot, and along walkways. Include arrows pointing to the main entrance, parking, and accessible routes.',
    },
  ],
  [
    'Property boundaries are clearly defined and maintained',
    {
      standard:
        'Clearly defined boundaries communicate ownership and deter trespassing on church property outside of services.',
      improvement:
        'Install or maintain boundary markers such as low fencing, landscaping borders, or monument features. Ensure property lines are visible from all approaches.',
    },
  ],
  [
    'Parking lot surface is in good condition (no potholes, faded markings, debris)',
    {
      standard:
        'A well-maintained parking lot communicates active ownership and care, deterring criminal activity and reducing liability.',
      improvement:
        'Fill potholes, repaint faded lane markings and parking space lines, and remove debris. Schedule regular lot maintenance. Keep the lot clean of litter and abandoned items.',
    },
  ],
  [
    'Perimeter landscaping is maintained and does not create hiding spots',
    {
      standard:
        'Landscaping along the property perimeter should enhance the property image without creating concealment opportunities.',
      improvement:
        'Apply the 2\'/6\' rule along the entire perimeter. Remove dead plants and overgrowth. Replace dense hedges with open-design landscaping that allows visibility.',
    },
  ],

  // ─── Zone 2: Building Exterior & Grounds ───

  [
    'All sides of the building are visible from parking areas, neighboring properties, or public roads',
    {
      standard:
        'Every face of the building should be observable to reduce opportunities for forced entry, vandalism, or loitering in unseen areas.',
      improvement:
        'Clear vegetation and stored items from building walls. Add cameras or mirrors to cover blind sides. Consider motion-activated lighting on less-visible faces of the building.',
    },
  ],
  [
    'No hidden alcoves, recessed doorways, or utility areas creating concealment opportunities',
    {
      standard:
        'Recessed areas and alcoves provide hiding spots for individuals with harmful intent and should be minimized or monitored.',
      improvement:
        'Install lighting in recessed doorways and alcoves. Add cameras covering these areas. Where possible, fill in or gate off unused recessed spaces.',
    },
  ],
  [
    'Playground or outdoor gathering areas are visible from interior occupied spaces',
    {
      standard:
        'Outdoor areas where children play or congregants gather should be observable from inside the building for both safety and supervision.',
      improvement:
        'Install windows or cameras overlooking outdoor gathering areas. Position playground equipment within sight lines of commonly occupied rooms. Assign adult supervision during all youth activities.',
    },
  ],
  [
    'Outdoor event areas (courtyards, fire pits, baptistry) are visible from building interior',
    {
      standard:
        'Outdoor spaces used for church events, fellowship, or baptisms should be visible from inside the building to maintain natural surveillance and enable staff to monitor activity.',
      improvement:
        'Ensure windows or cameras provide sight lines to courtyards and outdoor event spaces. Position outdoor baptistry areas where they can be observed from adjacent indoor rooms. Remove vegetation or structures that block views from the building.',
    },
  ],
  [
    'Secondary and emergency exit doors are locked from outside (exit-only hardware)',
    {
      standard:
        'Secondary doors should allow emergency egress from inside while preventing unauthorized entry from outside.',
      improvement:
        'Install panic bars (crash bars) on all emergency exits. Ensure doors cannot be opened from the exterior. Add door alarms that sound when emergency exits are opened during services.',
    },
  ],
  [
    'Utility rooms, HVAC equipment, and roof access points are secured',
    {
      standard:
        'Utility and mechanical areas can be exploited for sabotage, concealment, or roof access and must be secured.',
      improvement:
        'Lock all utility room doors, mechanical closets, and roof hatches. Use keyed or coded locks. Inspect these areas regularly and include them in security walkthroughs.',
    },
  ],
  [
    'Dumpster and storage areas are enclosed or secured and not adjacent to building entry points',
    {
      standard:
        'Dumpsters and outdoor storage near buildings create concealment and can be used to stage threats or hide contraband.',
      improvement:
        'Relocate dumpsters away from building entrances. Enclose them with a locked fence or screen. Keep storage areas locked and regularly inspected.',
    },
  ],
  [
    'Gas and electric utility entry points are secured and not publicly accessible',
    {
      standard:
        'Utility entry points provide potential access to critical building systems. Unsecured gas or electrical connections could be exploited for sabotage or arson.',
      improvement:
        'Install locked enclosures or cages around exterior gas meters and electrical panels. Ensure utility access points are not hidden behind vegetation that provides concealment. Include utility areas in regular security walkthroughs.',
    },
  ],
  [
    'Exterior playgrounds are enclosed by a sturdy fence with a restricted entry point',
    {
      standard:
        'Playground areas should have controlled access to prevent unauthorized individuals from approaching children during outdoor activities.',
      improvement:
        'Install a minimum 4-foot fence around playground areas with a single gated entry point visible from the building. Use tamper-resistant hardware on fence and gate. Ensure the gate can be secured during children\'s programming.',
    },
  ],
  [
    'Electrical panels and lighting switches are inaccessible to the public',
    {
      standard:
        'Public access to electrical panels or lighting controls could allow an individual to disable lighting or building systems, creating a tactical advantage during an attack.',
      improvement:
        'Relocate accessible panels behind locked doors or install locking panel covers. Ensure exterior lighting circuits cannot be disabled from publicly accessible switches. Include panel security in regular facility inspections.',
    },
  ],
  [
    'Building exterior communicates active use and care (no boarded windows, peeling paint, or neglect)',
    {
      standard:
        'A well-maintained exterior projects active ownership, which deters criminal targeting according to the "broken windows" theory.',
      improvement:
        'Address visible deterioration promptly: repair broken windows, repaint peeling surfaces, replace damaged siding or trim. Maintain a regular exterior maintenance schedule.',
    },
  ],
  [
    'Grounds show regular maintenance and community investment',
    {
      standard:
        'Well-kept grounds communicate that the property is actively managed and cared for, reducing vulnerability to criminal activity.',
      improvement:
        'Maintain lawns, landscaping, and walkways regularly. Remove litter and abandoned items. Consider community work days to demonstrate neighborhood investment.',
    },
  ],
  [
    'Building exterior is free of graffiti, vandalism, or visible damage',
    {
      standard:
        'Visible graffiti or vandalism signals a lack of guardianship and can invite further criminal activity.',
      improvement:
        'Remove graffiti within 24-48 hours of discovery. Repair vandalism damage promptly. Apply anti-graffiti coatings to vulnerable surfaces. Report incidents to law enforcement.',
    },
  ],
  [
    'Landscaping around the building follows the 2\'/6\' rule (shrubs under 2 ft, canopies above 6 ft)',
    {
      standard:
        'The 2\'/6\' rule eliminates concealment while maintaining attractive landscaping: shrubs trimmed below 2 feet and tree canopies raised above 6 feet.',
      improvement:
        'Audit all landscaping around the building perimeter. Trim shrubs below 2 feet in height. Remove low-hanging tree branches up to 6 feet. Replace dense foundation plantings with low-profile ground cover.',
    },
  ],

  // ─── Zone 3: Main Entry & Foyer/Lobby ───

  [
    'Main entrance is clearly identifiable and visible from the parking area',
    {
      standard:
        'The main entrance should be architecturally distinct and visible so visitors know where to enter and safety teams can focus monitoring.',
      improvement:
        'Add distinctive architectural features, awnings, or signage to highlight the main entrance. Ensure the path from parking to the main door is direct and well-lit. Remove visual obstructions.',
    },
  ],
  [
    'Foyer/lobby has windows or sight lines to the exterior approach',
    {
      standard:
        'Interior spaces near the entrance should allow occupants to see who is approaching before they enter the building.',
      improvement:
        'Install windows, sidelights, or a camera monitor in the foyer/lobby showing the exterior approach. Position a greeter station with a view of the entrance path.',
    },
  ],
  [
    'Greeters, welcome team, or reception staff are positioned to observe and engage all arriving visitors',
    {
      standard:
        'Human surveillance through greeters and welcome teams is one of the most effective CPTED measures for churches — it combines observation with social engagement that can identify concerning behavior.',
      improvement:
        'Position greeter stations at or near the main entrance with an unobstructed view of approaching visitors. Train greeters to observe and engage all arrivals, including recognizing behavioral warning signs. Ensure the greeting area is prominent, not tucked in a corner.',
    },
  ],
  [
    'Main entry doors can be locked or controlled during services (single point of entry when needed)',
    {
      standard:
        'During services, the ability to funnel visitors through a single monitored entrance increases security while maintaining a welcoming environment.',
      improvement:
        'Install locks or magnetic hold-open devices on main entry doors that can be activated during services. Designate a single monitored entry point. Assign a safety team member to manage entry after services begin.',
    },
  ],
  [
    'Foyer or lobby creates a transitional space between outside and worship areas',
    {
      standard:
        'A transitional space between the exterior and the sanctuary allows for observation, greeting, and screening before individuals enter the main worship area.',
      improvement:
        'If no foyer exists, consider adding one or using movable partitions to create a transition zone. Use this space for greeters, visitor registration, and informal screening.',
    },
  ],
  [
    'All visitors are funneled through 1-2 well-marked entrances rather than multiple scattered access points',
    {
      standard:
        'Limiting active entry points reduces the number of locations that must be monitored and ensures all visitors pass through an observed transition zone before accessing the facility.',
      improvement:
        'Designate 1-2 primary entrances and lock or alarm all others during services. Post signage directing visitors to the main entrance. Assign greeters or safety team members at each active entry point.',
    },
  ],
  [
    'Visitor check-in or welcome center is positioned centrally near the main entrance to serve as both information point and visual deterrent',
    {
      standard:
        'A centrally positioned welcome area helps identify newcomers, provides orientation, and reinforces a culture of awareness. Its visible staffing serves as a natural deterrent to anyone with harmful intent.',
      improvement:
        'Set up a visitor information table, kiosk, or welcome desk in the center of the foyer — not off to the side. Include name tags, welcome packets, and a sign-in sheet. Ensure staff can see and be seen by everyone entering.',
    },
  ],
  [
    'Entry area is clean, well-lit, and welcoming (good first impression)',
    {
      standard:
        'A clean, bright entry communicates order and active management, which deters criminal activity and reassures visitors.',
      improvement:
        'Ensure entry lighting is bright and warm-toned. Keep the area clean and uncluttered. Add welcome signage. Maintain flooring and paint in good condition.',
    },
  ],

  // ─── Zone 4: Worship Center & Stage/Platform ───

  [
    'Ushers or safety team members can observe all seating areas and entry points from their positions',
    {
      standard:
        'Safety team members should have unobstructed sight lines across the entire worship center to detect unusual behavior or threats quickly.',
      improvement:
        'Position ushers at rear corners and side aisles with clear views of all seating sections. Assign specific observation zones to each team member. Conduct regular sight-line audits from usher positions.',
    },
  ],
  [
    'Balcony, choir loft, or elevated areas are monitored or restricted when not in use',
    {
      standard:
        'Elevated areas provide tactical advantage to anyone with harmful intent and must be monitored during services or locked when not in use.',
      improvement:
        'Lock access to balconies and choir lofts when not in active use. Assign a safety team member to elevated areas during services. Install cameras covering these spaces.',
    },
  ],
  [
    'Stage/platform area is visible from multiple vantage points (no hidden approaches)',
    {
      standard:
        'The stage and platform area should be open and visible to prevent concealed approach to pastors and worship leaders.',
      improvement:
        'Remove or rearrange furnishings that create blind approaches to the stage. Ensure safety team members have clear sight lines to the platform from multiple positions. Keep backstage access points visible or monitored.',
    },
  ],
  [
    'Sound booth/AV production area has clear sight lines to the stage and all entry points',
    {
      standard:
        'The sound booth is typically elevated and centrally positioned, making it an ideal natural surveillance point. AV operators should be able to observe the entire worship center and alert safety teams to concerns.',
      improvement:
        'Position the sound booth with an unobstructed view of the stage, all seating areas, and entry doors. Ensure AV staff are trained as part of the security observation team. Install a direct communication link (radio or intercom) between the sound booth and safety team.',
    },
  ],
  [
    'Backstage and production areas are locked when unoccupied',
    {
      standard:
        'Backstage areas, green rooms, and production spaces can provide concealment and access to the stage if left unsecured.',
      improvement:
        'Install quality locks on backstage and production room doors. Establish a policy of locking these areas whenever they are unoccupied. Limit key access to authorized staff and volunteers.',
    },
  ],
  [
    'Sound booth and AV equipment are secured (locked cabinet or restricted room)',
    {
      standard:
        'Sound and AV systems represent significant financial investment and can be exploited to cause disruption if accessed by unauthorized individuals.',
      improvement:
        'Secure the sound booth with a lockable door or barrier. Lock AV equipment cabinets when not in use. Restrict sound system access to trained, authorized operators.',
    },
  ],
  [
    'Access to stage/platform area can be controlled during services',
    {
      standard:
        'Controlling access to the stage area protects pastors and worship leaders from potential threats during services.',
      improvement:
        'Position a safety team member near stage access points during services. Use rope barriers or low railings to define stage boundaries. Establish a protocol for who is permitted on stage during services.',
    },
  ],
  [
    'Baptistry area has locked access when not in use (doors and stair access secured)',
    {
      standard:
        'Baptistry tanks present both a security concealment risk and a safety hazard (slip/fall, drowning risk for children) when not actively in use for services.',
      improvement:
        'Install a locking door or gate on baptistry stair access. Secure the baptistry area when not in use for scheduled services. Ensure the area is included in regular facility walkthroughs and that water is drained or covered when not in use for extended periods.',
    },
  ],
  [
    'Emergency exits are clearly marked, unobstructed, and operable from inside',
    {
      standard:
        'All emergency exits must be clearly visible, free of obstructions, and usable without special knowledge — this is critical for safe evacuation.',
      improvement:
        'Install illuminated exit signs at all emergency exits. Remove any items blocking exit paths. Test all emergency exit hardware regularly. Ensure exits open outward with panic hardware.',
    },
  ],
  [
    'Evacuation plan is posted and congregation has been briefed on emergency procedures',
    {
      standard:
        'An established and communicated emergency plan enables rapid, orderly evacuation and reduces panic during emergencies.',
      improvement:
        'Develop a written emergency action plan covering fire, active threat, medical emergency, and severe weather. Post evacuation routes in the worship center and hallways. Brief the congregation annually and train the safety team quarterly.',
    },
  ],
  [
    'Panic alarm is accessible from the sound/media booth and the podium/stage area',
    {
      standard:
        'Panic alarms in key locations enable rapid notification of law enforcement during an active threat without requiring a phone call, which may not be possible during an emergency.',
      improvement:
        'Install hardwired or wireless panic buttons at the sound booth, podium/pulpit, and main office. Connect alarms to a monitored security system that notifies law enforcement directly. Test panic alarms monthly and ensure all staff know their locations.',
    },
  ],
  [
    'Worship center doors can be secured for lockdown during an active threat',
    {
      standard:
        'The ability to lock or barricade worship center doors during an active threat can delay an attacker and protect the congregation while law enforcement responds.',
      improvement:
        'Install locks or security bars on worship center doors that can be engaged quickly from inside. Consider doors that swing inward to allow barricading. Conduct lockdown drills with the safety team. Ensure lockdown procedures do not block emergency egress routes.',
    },
  ],

  // ─── Zone 5: Fellowship, Cafe & Community Spaces ───

  [
    'Fellowship hall and meeting rooms have windows or open sight lines from adjacent spaces',
    {
      standard:
        'Natural surveillance into fellowship and meeting spaces reduces the opportunity for harmful activity when groups are meeting.',
      improvement:
        'Install interior windows or half-walls that maintain visual connection between rooms and corridors. Keep doors open during events when possible. Position rooms near high-traffic areas.',
    },
  ],
  [
    'Kitchen area has a serving window or pass-through that maintains visual connection',
    {
      standard:
        'Kitchens that are visually connected to serving areas allow for natural surveillance while food is being prepared.',
      improvement:
        'Install a serving window or pass-through between the kitchen and fellowship hall. Keep kitchen doors open during events. Ensure kitchen staff can see and be seen from the serving area.',
    },
  ],
  [
    'Cafe/bookstore area has open sight lines and is visible from staffed areas — when near the entry, supports natural surveillance of arriving visitors',
    {
      standard:
        'Cafe and bookstore areas common in modern churches serve a dual CPTED function: they create natural gathering that populates transitional spaces, and their staff provide informal surveillance of the lobby and entry areas.',
      improvement:
        'Position the cafe or bookstore in or adjacent to the main foyer with open sight lines. Avoid enclosed or walled-off designs that isolate the area. Ensure cafe volunteers have a clear view of the main entrance and can observe arriving visitors.',
    },
  ],
  [
    'Gymnasium/recreation areas have windows or open access points allowing visual monitoring',
    {
      standard:
        'Gymnasiums and recreation spaces are large, multi-use areas that may be used by outside groups. Visual monitoring from adjacent spaces helps maintain oversight.',
      improvement:
        'Install interior windows or open pass-throughs between the gymnasium and hallways or adjacent rooms. Ensure the gym is not completely isolated from the rest of the facility. Add cameras if the space is used by outside groups during off-hours.',
    },
  ],
  [
    'Meeting rooms can be locked when not in use',
    {
      standard:
        'Unused rooms that remain unlocked provide concealment opportunities and increase the facility footprint that must be monitored.',
      improvement:
        'Install locks on all meeting room doors. Establish a policy of locking unused rooms. Include room checks in regular security walkthroughs.',
    },
  ],
  [
    'Kitchen has lockable storage for sharp objects and hazardous materials',
    {
      standard:
        'Knives, cleaning chemicals, and other potential weapons of opportunity should be secured when the kitchen is not in active use.',
      improvement:
        'Install locked cabinets or drawers for knives and sharp implements. Secure cleaning chemicals in a locked closet. Ensure the kitchen itself can be locked when not in use.',
    },
  ],
  [
    'Exterior doors from fellowship spaces are alarmed or monitored',
    {
      standard:
        'Doors from fellowship areas to the exterior can become unmonitored entry points during events and should be secured or monitored.',
      improvement:
        'Install alarms or chimes on exterior doors in fellowship areas. Keep these doors locked during services (exit-only). Assign a safety team member to monitor if doors must remain open.',
    },
  ],
  [
    'Gymnasium storage rooms are locked when not in use',
    {
      standard:
        'Gymnasium storage rooms contain sports equipment that could be used as improvised weapons and provide concealment space if left unsecured.',
      improvement:
        'Install locks on all gymnasium storage room doors. Establish a policy of locking storage after each use. Include gymnasium storage in regular facility walkthroughs.',
    },
  ],
  [
    'Fellowship spaces are clean, organized, and free of clutter that could impede evacuation',
    {
      standard:
        'Cluttered spaces slow evacuation, create tripping hazards, and project a lack of active management.',
      improvement:
        'Clear aisles and pathways to meet fire code width requirements. Store chairs and tables in designated areas. Remove unnecessary stored items from fellowship spaces.',
    },
  ],
  [
    'Emergency exits from fellowship areas are clearly marked and unobstructed',
    {
      standard:
        'All rooms used for gatherings must have clearly marked, unobstructed emergency exits per fire code and CPTED best practices.',
      improvement:
        'Install illuminated exit signs in fellowship halls and meeting rooms. Keep exit paths clear of furniture, storage, and equipment. Test exit doors regularly.',
    },
  ],

  // ─── Zone 6: Children's & Youth Ministry Areas ───

  [
    'Children\'s wing or area has controlled access (check-in/check-out system in place)',
    {
      standard:
        'Children\'s areas require the most stringent access control — only authorized adults should be able to enter or remove a child.',
      improvement:
        'Implement a numbered check-in/check-out system (matching tags for parent and child). Staff the check-in point during all children\'s programming. Install a door with controlled access (keypad, card reader, or buzzer) at the entrance to the children\'s wing.',
    },
  ],
  [
    'Classroom doors have locks operable from inside and viewing windows or half-doors for supervision',
    {
      standard:
        'Classroom doors should lock from inside for lockdown capability while allowing visual monitoring from the hallway for child safety.',
      improvement:
        'Install locks operable from inside on all classroom doors. Add vision panels (small windows) to solid doors. Replace fully solid doors with half-light doors where appropriate.',
    },
  ],
  [
    'Restrooms near children\'s areas are single-occupancy or supervised',
    {
      standard:
        'Restrooms are a common vulnerability in children\'s ministry — they should be single-occupancy or have adult supervision protocols.',
      improvement:
        'Designate specific restrooms for children\'s ministry use. Convert multi-stall restrooms to single-occupancy where possible. Establish a protocol for adult escorts to restrooms.',
    },
  ],
  [
    'Only authorized personnel can access nursery and children\'s rooms',
    {
      standard:
        'Nurseries and children\'s rooms should be restricted to screened, authorized volunteers and staff at all times.',
      improvement:
        'Implement background checks for all children\'s ministry volunteers. Issue identifiable badges or lanyards. Enforce a policy that only badged personnel may enter nursery spaces.',
    },
  ],
  [
    'Youth/student ministry building or wing has controlled access separate from the main facility',
    {
      standard:
        'Youth areas that operate semi-independently from the main building need their own access control to prevent unauthorized entry when the main facility may be locked or unmonitored.',
      improvement:
        'Install controlled-access doors (keypad, card reader, or buzzer) at the entrance to the youth wing or building. Ensure youth leaders manage access during programming. Lock the youth facility when not in active use.',
    },
  ],
  [
    'Youth areas have lockdown capability independent of main building',
    {
      standard:
        'If the youth wing or building is separate from the main facility, it must be able to lock down independently during an active threat without relying on main building systems or personnel.',
      improvement:
        'Install locks on all youth area doors that can be engaged from inside. Ensure youth leaders are trained on lockdown procedures specific to their space. Conduct lockdown drills in the youth area separately from main building drills.',
    },
  ],
  [
    'Exterior doors on youth building are locked from outside (exit-only) during programming',
    {
      standard:
        'During youth programming, exterior doors should only allow egress to prevent unauthorized individuals from entering through unmonitored access points.',
      improvement:
        'Install panic bars on all exterior youth building doors. Ensure doors cannot be opened from outside during programming. Designate a single monitored entry point for the youth area.',
    },
  ],
  [
    'Hallways in children\'s and youth areas have clear sight lines with no hidden alcoves',
    {
      standard:
        'Hallways in children\'s and youth areas should be open and visible to prevent concealment or unsupervised contact between adults and minors.',
      improvement:
        'Remove stored items from hallways. Eliminate blind corners with mirrors or reconfiguration. Keep hallway lighting bright. Assign a hallway monitor during children\'s and youth programming.',
    },
  ],
  [
    'Classroom and youth activity rooms have vision panels or windows allowing visual monitoring from hallways',
    {
      standard:
        'Visual transparency into classrooms and youth rooms from hallways is essential for child protection, accountability, and rapid situational awareness during emergencies.',
      improvement:
        'Install narrow vision panels or windows in all classroom and youth room doors. Ensure windows are not blocked by posters or coverings. Adopt an open-door policy when building layout permits.',
    },
  ],
  [
    'Youth outdoor activity areas are visible from the youth building interior',
    {
      standard:
        'Outdoor areas used for youth activities should be observable from inside the youth building to maintain supervision and enable rapid response to incidents.',
      improvement:
        'Install windows overlooking outdoor youth activity areas. Position outdoor gathering spaces within sight lines of commonly occupied youth rooms. Assign adult supervision with clear sight lines during all outdoor activities.',
    },
  ],
  [
    'Classrooms have lockdown capability (doors lockable from inside, window coverings available)',
    {
      standard:
        'In an active threat scenario, classrooms must be able to lock down quickly with doors secured and windows covered.',
      improvement:
        'Install classroom locks operable from inside without a key (thumb-turn deadbolt or lever lock). Provide window coverings (blinds or pull-down shades) for all classroom door windows and exterior windows. Conduct lockdown drills with children\'s ministry staff.',
    },
  ],
  [
    'Two-adult rule or open-door policy is practiced in children\'s and youth ministry areas',
    {
      standard:
        'The two-adult rule is a foundational child protection policy — no single adult should be alone with children or youth in an enclosed space.',
      improvement:
        'Adopt and enforce a written two-adult policy for all children\'s and youth ministry activities. Recruit sufficient volunteers to staff all rooms with at least two adults. If staffing is short, require doors to remain fully open.',
    },
  ],

  // ─── Zone 7: Administrative & Support Areas ───

  [
    'Administrative offices are locked when unoccupied',
    {
      standard:
        'Offices contain sensitive personal information, financial records, and often have computer access that should be secured when unattended.',
      improvement:
        'Install quality locks on all office doors. Establish a policy of locking offices when stepping away. Consider keypad or card-access locks for convenience.',
    },
  ],
  [
    'Financial records, offering storage, and safe are in a secured area with limited access',
    {
      standard:
        'Financial areas are high-value targets. Access should be limited to authorized personnel with physical security measures in place.',
      improvement:
        'Store financial records and offerings in a locked room with restricted key access. Install a safe rated for the value stored. Use a two-person rule for counting offerings. Vary the routine for bank deposits.',
    },
  ],
  [
    'Server room or IT closet is locked and access is restricted to authorized personnel',
    {
      standard:
        'IT infrastructure contains sensitive data and access to networks. Physical access must be controlled.',
      improvement:
        'Lock the server room or IT closet at all times. Limit keys to IT staff and senior leadership. Install a temperature monitor and consider a camera covering the door.',
    },
  ],
  [
    'Office area reception or front desk has a clear view of approaching visitors',
    {
      standard:
        'Administrative staff should be able to see who is approaching their workspace to assess visitors before granting access.',
      improvement:
        'Position the reception desk facing the entrance to the office area. Install a window or half-wall that allows visual screening. Consider a buzzer or intercom for controlled entry.',
    },
  ],
  [
    'No isolated offices without a secondary exit or line of sight to common areas',
    {
      standard:
        'Staff members should not be trapped in isolated spaces with no escape route or ability to signal for help.',
      improvement:
        'Ensure every office has either a secondary exit or a window to a common area. Install panic buttons or two-way communication for isolated workspaces. Relocate staff from dead-end offices when possible.',
    },
  ],
  [
    'Storage rooms and maintenance areas are organized and locked when not in use',
    {
      standard:
        'Unlocked storage and maintenance areas provide concealment, access to tools, and potential hiding spots for threats.',
      improvement:
        'Lock all storage and maintenance rooms when not in active use. Keep these areas organized so missing items or intrusions are quickly noticed. Include them in regular security walkthroughs.',
    },
  ],
  [
    'Key control system is in place (master keys tracked, locks rekeyed when staff leave)',
    {
      standard:
        'A key control system prevents unauthorized access from lost, copied, or unreturned keys — a common vulnerability in churches with high volunteer turnover.',
      improvement:
        'Maintain a written log of all keys issued. Collect keys when staff or volunteers leave. Rekey locks whenever a master key is lost or a long-term staff member departs. Consider transitioning to a keypad or card-access system.',
    },
  ],

  // ─── Zone 8: Exterior Lighting & Surveillance ───

  [
    'All building entrances have bright, working lights that illuminate visitors\' faces',
    {
      standard:
        'Entrance lighting must be bright enough to identify faces from a reasonable distance, which deters crime and aids camera identification.',
      improvement:
        'Install bright, white-light fixtures (minimum 4 foot-candles) at every entrance. Aim lights to illuminate faces of people approaching the door. Replace dim or yellow-toned bulbs with LED fixtures.',
    },
  ],
  [
    'Parking lot has consistent lighting with no dark gaps between fixtures',
    {
      standard:
        'Parking lot lighting should be uniform — dark gaps between light pools create concealment opportunities and increase vulnerability.',
      improvement:
        'Conduct a nighttime lighting survey to identify dark spots. Add fixtures or increase wattage to eliminate gaps. Aim for minimum 1 foot-candle throughout the lot with 4 foot-candles at entry points.',
    },
  ],
  [
    'Walkways between parking and building entrances are well-lit',
    {
      standard:
        'The path from parking to the building is where visitors are most exposed — it must be well-lit to reduce vulnerability.',
      improvement:
        'Install pathway lighting along all walking routes from parking to entrances. Use bollard lights or pole-mounted fixtures. Ensure even coverage with no dark stretches.',
    },
  ],
  [
    'Motion-activated lights cover vulnerable areas (rear of building, storage, utility areas)',
    {
      standard:
        'Motion-activated lighting serves as both a deterrent and an alert — sudden illumination draws attention to activity in vulnerable areas.',
      improvement:
        'Install motion-activated LED floodlights at the rear of the building, near dumpsters, at utility access points, and along unmonitored sides. Set sensitivity to detect person-sized movement. Test monthly.',
    },
  ],
  [
    'Exterior lights on photocell or timer — not solely manual switch',
    {
      standard:
        'Lights that depend on someone remembering to turn them on will inevitably be left off — automated controls ensure consistent operation.',
      improvement:
        'Install photocell sensors (dusk-to-dawn) or programmable timers on all exterior lighting circuits. Replace manual-only switches with automated controls. Include a manual override for special events.',
    },
  ],
  [
    'Security cameras cover parking lot, main entrance, and building perimeter',
    {
      standard:
        'A camera system provides deterrence, real-time monitoring capability, and evidence preservation for incidents.',
      improvement:
        'Install weatherproof cameras at the parking lot entrance, main door, and all building corners. Use cameras with night vision capability. Ensure coverage includes all entry and exit points. Post signage indicating camera surveillance.',
    },
  ],
  [
    'Camera system records continuously with adequate storage (minimum 30 days)',
    {
      standard:
        'Camera footage must be stored long enough to be useful for investigations — incidents may not be discovered immediately.',
      improvement:
        'Configure the camera system for continuous recording with minimum 30-day retention. Use a dedicated NVR (network video recorder) with sufficient storage. Set up remote access for authorized personnel to review footage.',
    },
  ],
  [
    'All exterior light fixtures functioning (no burned-out bulbs or damaged fixtures)',
    {
      standard:
        'Non-functioning lights create dark spots that undermine the entire lighting plan and signal lack of maintenance.',
      improvement:
        'Conduct a monthly lighting audit — check every exterior fixture. Replace burned-out bulbs immediately. Keep spare bulbs on hand. Consider switching to longer-lasting LED fixtures to reduce maintenance.',
    },
  ],
]);
