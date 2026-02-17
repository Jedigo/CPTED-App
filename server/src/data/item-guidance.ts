/**
 * CPTED Item Guidance Knowledge Base
 *
 * Maps each checklist item (by exact item_text) to:
 *   - standard: What CPTED best practice expects (1-2 sentences)
 *   - improvement: Specific actionable steps the homeowner can take (2-3 steps)
 *
 * Used in the PDF report to auto-explain items scored 1 (Critical) or 2 (Deficient).
 */

export interface ItemGuidance {
  standard: string;
  improvement: string;
}

export const ITEM_GUIDANCE = new Map<string, ItemGuidance>([
  // ─── Zone 1: Street Approach & Address Visibility ───

  [
    'Clear, unobstructed sight line from the street to the front door',
    {
      standard:
        'CPTED principles require a clear line of sight between the street and the front entry so that visitors and neighbors can observe activity at the door.',
      improvement:
        'Trim or remove large shrubs, ornamental trees, or structures that block the view from the street to the front door. Keep vegetation below 2 feet near the entry path and raise tree canopies above 6 feet.',
    },
  ],
  [
    'Front windows of the home provide views of the street and front yard',
    {
      standard:
        'Windows facing the street enable natural surveillance — occupants can monitor approaching visitors and street activity from inside the home.',
      improvement:
        'Replace opaque window coverings with sheer curtains or adjustable blinds that allow outward visibility. Keep furniture and objects from permanently blocking window views of the front yard.',
    },
  ],
  [
    'No large visual barriers (walls, hedges, structures) blocking the view from the street to the home',
    {
      standard:
        'Large visual barriers near the property frontage create concealment opportunities and prevent neighbors and passersby from observing suspicious activity.',
      improvement:
        'Replace solid walls or dense hedges with open-style fencing (e.g., aluminum picket) or reduce hedge height to under 3 feet. Relocate storage sheds or large structures away from the front sight line.',
    },
  ],
  [
    'Clearly defined driveway/walkway directs visitors to the front entry',
    {
      standard:
        'A well-defined path from the street to the front door guides legitimate visitors along an intended route and makes anyone deviating from that path more conspicuous.',
      improvement:
        'Install or repair walkway edging and surface materials so the path is visually distinct. Add low border landscaping or solar path lights to reinforce the intended route to the front entry.',
    },
  ],
  [
    'Sidewalk and approach are in good condition and clearly routed',
    {
      standard:
        'A well-maintained approach signals active ownership and territorial control, discouraging would-be offenders from targeting the property.',
      improvement:
        'Repair cracked or uneven sidewalk sections. Remove weeds growing through joints and ensure the walkway surface is clean and level. Consider adding path lighting for nighttime visibility.',
    },
  ],
  [
    'Property boundaries visible and identifiable from the street',
    {
      standard:
        'Clearly marked property boundaries establish territorial reinforcement — a core CPTED principle — making it obvious where public space ends and private property begins.',
      improvement:
        'Define property lines with low fencing, landscape borders, contrasting ground cover, or decorative stone edging. Even subtle boundary markers like a mailbox post or planter row can reinforce ownership.',
    },
  ],
  [
    'House number clearly visible from the street (minimum 4" tall, contrasting color, illuminated or reflective at night)',
    {
      standard:
        'Address numbers must be at least 4 inches tall, high-contrast, and visible at night so that emergency responders and law enforcement can quickly locate the property.',
      improvement:
        'Install large, reflective or backlit house numbers on a contrasting background near the front entry or at the curb. Position them where they are not blocked by vegetation or vehicles, and add a small light fixture if not already illuminated.',
    },
  ],
  [
    'Street frontage is clean and free of debris, abandoned items, or clutter',
    {
      standard:
        'A clean street frontage projects an image of active ownership and community care, which deters criminal behavior (the "Broken Windows" theory).',
      improvement:
        'Remove abandoned items, clutter, and debris from the street-facing portion of the property. Establish a regular maintenance routine for keeping the frontage tidy and well-kept.',
    },
  ],
  [
    'No graffiti, vandalism, or signs of neglect visible from the street',
    {
      standard:
        'Visible signs of neglect or vandalism signal a lack of territorial control and can attract further criminal activity.',
      improvement:
        'Remove graffiti promptly using appropriate cleaning products for the surface material. Repair vandalized fixtures, fences, or mailboxes as soon as possible to maintain the image of an actively managed property.',
    },
  ],

  // ─── Zone 2: Front Yard & Primary Entry ───

  [
    "Vegetation follows the 2'/6' rule (shrubs under 2 ft, tree canopies above 6 ft)",
    {
      standard:
        'The 2-foot/6-foot rule is a foundational CPTED landscaping standard: shrubs should be kept below 2 feet and tree canopies raised above 6 feet to eliminate hiding spots while maintaining sight lines.',
      improvement:
        'Prune all shrubs near walkways, entries, and windows to under 2 feet. Trim lower tree branches to maintain a 6-foot clearance from ground level. Replace overgrown foundation plantings with low-profile species.',
    },
  ],
  [
    'No dense vegetation or structures creating concealment spots near the entry',
    {
      standard:
        'Concealment spots near the primary entry allow an offender to hide while waiting for the homeowner to approach or unlock the door — a high-risk scenario.',
      improvement:
        'Remove or significantly thin dense bushes, hedges, or architectural features within 6 feet of the front entry. Replace with low groundcover or decorative gravel. Ensure no blind corners exist where someone could hide unseen.',
    },
  ],
  [
    'Front porch/entry area visible from the street and from neighboring properties',
    {
      standard:
        'The front entry should be observable from the street and adjacent properties so that any forced entry attempt or suspicious behavior can be witnessed.',
      improvement:
        'Remove or reduce obstructions (walls, columns, dense vegetation) that block views of the porch from the street. Consider adding a security camera or video doorbell to supplement natural surveillance.',
    },
  ],
  [
    'Front door is solid core hardwood or metal (not hollow core)',
    {
      standard:
        'A solid-core or metal front door resists forced entry attempts far better than a hollow-core door, which can be breached with minimal effort.',
      improvement:
        'Replace any hollow-core exterior door with a solid hardwood or steel door rated for exterior use. Ensure the door fits snugly in the frame with no gaps that could be exploited.',
    },
  ],
  [
    'Deadbolt installed with minimum 1" throw and reinforced strike plate (3" screws)',
    {
      standard:
        'A Grade 1 or Grade 2 deadbolt with at least a 1-inch throw bolt and a reinforced strike plate secured with 3-inch screws into the door frame stud is the minimum standard for residential security.',
      improvement:
        'Install a quality deadbolt with a minimum 1-inch throw. Replace the strike plate with a heavy-duty reinforced version and secure it with 3-inch screws that penetrate into the wall stud behind the door jamb.',
    },
  ],
  [
    'Door frame is solid and in good condition (no rot, no gaps)',
    {
      standard:
        'A compromised door frame negates even the best locks — a rotted or weakened frame can be kicked in easily.',
      improvement:
        'Repair or replace any rotted or damaged sections of the door frame. Fill gaps with solid material and consider installing a door frame reinforcement kit for added kick-in resistance.',
    },
  ],
  [
    'Glass panels in or near door are reinforced or have security film',
    {
      standard:
        'Glass sidelights or panels within arm\'s reach of the deadbolt allow an intruder to break the glass and reach in to unlock the door from inside.',
      improvement:
        'Apply security window film to all glass within 40 inches of the lock. Alternatively, replace standard glass with tempered or laminated security glass. Consider adding a double-cylinder deadbolt (keyed on both sides) if code-compliant.',
    },
  ],
  [
    'Front yard landscaping demonstrates active ownership and care',
    {
      standard:
        'Maintained landscaping is a visible expression of territorial reinforcement — it communicates that the property is actively monitored and cared for.',
      improvement:
        'Keep the lawn mowed, beds weeded, and plantings healthy. Add seasonal flowers or decorative elements that show ongoing attention. Remove dead plants and replace bare spots promptly.',
    },
  ],
  [
    'Property line between front yard and public space is clearly delineated',
    {
      standard:
        'A clearly marked transition from public to private space signals territorial ownership and makes trespassers more aware they are entering private property.',
      improvement:
        'Use low hedges, decorative fencing, landscape borders, or a change in ground surface to visually separate the front yard from the public sidewalk or street. Even a row of small shrubs or a stone border can be effective.',
    },
  ],
  [
    'Lawn maintained and free of overgrown areas',
    {
      standard:
        'An unmaintained lawn suggests the property may be unoccupied or neglected, making it a more attractive target for criminal activity.',
      improvement:
        'Mow the lawn regularly, edge along walkways, and address overgrown areas promptly. If extended absences are planned, arrange for lawn maintenance to maintain the appearance of occupancy.',
    },
  ],
  [
    'Walkway, steps, and porch in good structural condition',
    {
      standard:
        'Deteriorating walkways, steps, and porches present both a safety hazard and an image of neglect that can attract criminal attention.',
      improvement:
        'Repair cracked or uneven steps and walkway surfaces. Replace loose or damaged porch railings. Ensure all surfaces are stable, level, and free of tripping hazards.',
    },
  ],
  [
    'Door hardware (knob, lock, hinges) in good working condition',
    {
      standard:
        'All door hardware must function smoothly and securely. Loose or worn hardware compromises the door\'s resistance to forced entry.',
      improvement:
        'Tighten or replace loose door knobs and lock sets. Replace worn hinges and ensure hinge pins are non-removable on outward-opening doors. Lubricate locks and verify smooth deadbolt operation.',
    },
  ],

  // ─── Zone 3: Side Yards & Pathways ───

  [
    'Side yards visible from at least one neighboring property',
    {
      standard:
        'Side yards that are visible to neighbors provide natural surveillance of an area often used as a concealed path to the rear of the home.',
      improvement:
        'Remove solid privacy fencing between side yards where possible, or replace with semi-open fencing. Trim vegetation that blocks views from neighboring windows. Consider adding motion-activated lighting.',
    },
  ],
  [
    "Vegetation along side yards follows the 2'/6' rule",
    {
      standard:
        'The 2-foot/6-foot landscaping rule applies to side yards as well — shrubs below 2 feet and tree canopies above 6 feet maintain clear sight lines through these narrow transitional areas.',
      improvement:
        'Prune all side-yard shrubs to under 2 feet and raise tree canopies to above 6 feet. Remove or thin any dense plantings that create hiding spots along the side of the home.',
    },
  ],
  [
    'No concealment opportunities between structures (AC units, sheds, fences)',
    {
      standard:
        'Gaps between structures in side yards — such as behind AC units, between sheds and fences, or along utility areas — can conceal a person lying in wait.',
      improvement:
        'Install thorny landscaping or low fencing around AC units and utility equipment. Reduce gaps between structures and fencing. Add motion-activated lighting to illuminate these areas after dark.',
    },
  ],
  [
    'Side yard gates present, in working condition, with self-latching or locking hardware',
    {
      standard:
        'Side yard gates are a critical access control point — they separate the more visible front from the more vulnerable rear of the property.',
      improvement:
        'Install sturdy gates on both side yards if not present. Equip each gate with a self-closing hinge and self-latching mechanism. Add a keyed lock or combination padlock to prevent unauthorized access to the rear yard.',
    },
  ],
  [
    'No easy-climb features along side fencing (trellises, stored items, compost bins)',
    {
      standard:
        'Objects placed against fences — trellises, bins, stacked items — act as climbing aids that allow an intruder to easily scale the fence into the yard.',
      improvement:
        'Relocate compost bins, trash cans, storage items, and trellises away from fence lines. Keep at least 3 feet of clear space along all fencing. Consider adding anti-climb measures such as fence topper strips.',
    },
  ],
  [
    'Side property lines clearly marked or fenced',
    {
      standard:
        'Clearly defined side property boundaries establish territorial ownership and make it obvious when someone is trespassing.',
      improvement:
        'Install fencing or clear boundary markers along side property lines. Even low-profile markers like landscape edging, post-and-rail fencing, or hedge lines help define the boundary.',
    },
  ],
  [
    'Side yards free of stored junk, debris, or unused items',
    {
      standard:
        'Clutter in side yards provides concealment and can serve as tools or climbing aids for intruders. It also signals neglect.',
      improvement:
        'Remove all unnecessary stored items, debris, and unused equipment from side yards. Store items inside the garage or shed. Maintain side yards as clean, open passageways.',
    },
  ],
  [
    'Fencing in good repair (no leaning, broken slats, or gaps)',
    {
      standard:
        'Damaged fencing fails to provide the access control and territorial definition it was designed for, and visually signals neglect.',
      improvement:
        'Repair or replace leaning fence sections, broken slats, and boards with gaps. Ensure posts are secure in the ground and that the fence maintains a consistent, intact barrier.',
    },
  ],

  // ─── Zone 4: Rear Yard & Back Entry ───

  [
    'Rear yard at least partially visible from one or more neighboring properties',
    {
      standard:
        'The rear yard is the most common point of forced entry. At least partial visibility from neighboring properties provides critical natural surveillance of this vulnerable area.',
      improvement:
        'Replace solid privacy fencing with semi-open styles (aluminum picket, wrought iron, or chain-link) that allow visibility while maintaining boundaries. Trim hedges and trees that block neighbors\' views of the rear yard.',
    },
  ],
  [
    'Rear-facing windows provide views of the back yard from inside the home',
    {
      standard:
        'Rear-facing windows enable occupants to observe activity in the back yard from inside, providing natural surveillance of the most private area of the property.',
      improvement:
        'Ensure rear windows are not permanently blocked by heavy curtains, furniture, or stored items. Use window treatments that allow easy outward viewing. Keep rear window areas clean and accessible.',
    },
  ],
  [
    'No dense vegetation creating concealment along the rear of the home',
    {
      standard:
        'Dense vegetation along the rear wall of the home provides cover for an intruder attempting to force entry through a rear door or window.',
      improvement:
        'Clear dense vegetation within 3 feet of the rear wall of the home. Replace with low groundcover or decorative gravel. Maintain the 2-foot/6-foot rule for any remaining plantings near the rear entry.',
    },
  ],
  [
    'Rear entry door is solid core with deadbolt (same standard as front)',
    {
      standard:
        'Rear entry doors must meet the same security standards as the front door — solid core construction with a quality deadbolt — because the rear is the most common forced entry point.',
      improvement:
        'Replace any hollow-core rear door with a solid hardwood or steel door. Install a Grade 1 or Grade 2 deadbolt with a minimum 1-inch throw and a reinforced strike plate with 3-inch screws.',
    },
  ],
  [
    'Sliding glass doors have secondary security (dowel/pin in track, security bar, or foot lock)',
    {
      standard:
        'Standard sliding glass door latches are easily defeated. Secondary security measures prevent the door from being lifted off its track or forced open.',
      improvement:
        'Place a solid dowel rod or commercial security bar in the track to prevent forced sliding. Install anti-lift pins or screws in the upper track. Consider adding a foot lock or secondary keyed lock for additional protection.',
    },
  ],
  [
    'Rear windows have working locks and are reinforced if ground-accessible',
    {
      standard:
        'Ground-accessible rear windows are high-risk entry points and must have functioning locks and, ideally, additional reinforcement such as security film.',
      improvement:
        'Verify all rear window locks operate properly and engage fully. Apply security window film to ground-accessible windows. Consider adding window pins or secondary locks for double-hung windows.',
    },
  ],
  [
    'Rear fence/gate is secured with quality lock (not just a flip latch)',
    {
      standard:
        'A rear gate with only a flip latch provides virtually no access control — it can be reached over the fence and opened in seconds.',
      improvement:
        'Replace flip latches with a keyed lock or combination padlock. Install a self-closing hinge mechanism so the gate latches automatically. Ensure the gate fits tightly with no gaps that allow reaching through to the lock.',
    },
  ],
  [
    'Rear property boundaries clearly defined',
    {
      standard:
        'Clear rear property boundaries establish territorial ownership and make it immediately obvious when someone is trespassing.',
      improvement:
        'Install or repair rear boundary fencing. Ensure fence lines are continuous with no gaps or openings. If fencing is not feasible, use dense (but low) boundary plantings, post markers, or landscape edging.',
    },
  ],
  [
    'Rear yard maintained (lawn, landscaping, hardscape)',
    {
      standard:
        'A well-maintained rear yard signals active occupancy and territorial ownership, even in areas not visible from the street.',
      improvement:
        'Keep the rear lawn mowed and landscaping maintained. Remove dead vegetation and repair damaged hardscape elements. A tidy rear yard signals to potential offenders that the property is actively occupied.',
    },
  ],
  [
    'No ladders, tools, or items stored outside that could assist a burglar',
    {
      standard:
        'Ladders, tools, pry bars, and heavy objects left in the yard can be used by an intruder to break into the home or access upper floors and windows.',
      improvement:
        'Store all ladders, tools, and heavy objects inside a locked garage or shed. If items must remain outside, secure them with a cable lock or chain. Never leave a ladder leaning against the house.',
    },
  ],

  // ─── Zone 5: Garage & Driveway ───

  [
    'Driveway visible from the street and from inside the home',
    {
      standard:
        'A visible driveway provides natural surveillance of vehicle activity and makes it obvious when unfamiliar vehicles or people are present.',
      improvement:
        'Trim vegetation or remove structures that block views of the driveway from the street and from interior windows. Consider adding a convex mirror if sight lines are limited by the home\'s layout.',
    },
  ],
  [
    'Garage does not create blind spots or hidden areas adjacent to the home',
    {
      standard:
        'Gaps between the garage and the home, or recessed areas created by the garage structure, can provide concealment for someone attempting entry.',
      improvement:
        'Install motion-activated lighting in any blind spots or recessed areas created by the garage. Close off accessible gaps between the garage and home with fencing or lattice. Trim vegetation that adds to concealment.',
    },
  ],
  [
    'Interior door from garage to home is solid core with deadbolt',
    {
      standard:
        'The door between the garage and the home interior is often overlooked but should meet the same security standard as any exterior door — solid core with a deadbolt.',
      improvement:
        'Replace any hollow-core garage-to-interior door with a solid-core or steel door. Install a quality deadbolt with a reinforced strike plate. Keep this door locked at all times, even when the garage door is closed.',
    },
  ],
  [
    'Overhead garage door has a manual lock (not relying solely on opener)',
    {
      standard:
        'Relying solely on an electric opener for garage door security leaves the home vulnerable during power outages and to opener frequency scanning.',
      improvement:
        'Install a manual slide bolt or padlock hasp on the inside of the garage door for use when the home is unoccupied for extended periods. Ensure the manual lock is engaged during vacations.',
    },
  ],
  [
    'Emergency release cord is secured against coat hanger manipulation',
    {
      standard:
        'The emergency release cord on many garage doors can be triggered from outside using a coat hanger slipped through the weather seal at the top of the door.',
      improvement:
        'Secure the emergency release cord with a zip tie or purpose-built release shield. This still allows manual activation from inside in an emergency but prevents external manipulation. Commercial garage door shields are available for under $20.',
    },
  ],
  [
    'Garage door kept closed and locked when not in active use',
    {
      standard:
        'An open garage door exposes the home interior, stored valuables, and the garage-to-home door to observation and opportunistic entry.',
      improvement:
        'Make it a habit to close the garage door immediately after entering or exiting. Install a garage door timer or smart controller that automatically closes the door after a set period. Never leave the garage open overnight.',
    },
  ],
  [
    'Driveway clearly defined and directs only to the subject property',
    {
      standard:
        'A clearly defined driveway reinforces territorial ownership and makes it obvious when someone uses it who does not belong.',
      improvement:
        'Define the driveway edges with landscape borders, pavers, or low plantings. Ensure the driveway does not appear to serve adjacent properties or provide a cut-through path.',
    },
  ],
  [
    'Garage door in good working condition',
    {
      standard:
        'A garage door that does not close fully, has gaps, or is visibly damaged compromises security and signals neglect.',
      improvement:
        'Repair or replace damaged garage door panels, weather seals, and hardware. Ensure the door closes fully and sits flush with the ground. Lubricate tracks and test the auto-reverse safety feature.',
    },
  ],
  [
    'No high-value items visible through garage windows or open door',
    {
      standard:
        'Visible high-value items (tools, bikes, electronics) in the garage invite theft and can motivate a break-in attempt.',
      improvement:
        'Frost or tint garage windows to prevent viewing inside. Store high-value items out of sight or in locked cabinets. Avoid leaving the garage door open with valuables in view.',
    },
  ],

  // ─── Zone 6: Exterior Lighting ───

  [
    "Front entry/porch has a bright, working light that illuminates visitors' faces",
    {
      standard:
        'The front entry light should be bright enough to clearly illuminate a visitor\'s face from inside the home or through a peephole, enabling identification before opening the door.',
      improvement:
        'Install a bright (minimum 60W equivalent / 800 lumens) LED light fixture at the front entry. Position it so faces are illuminated from above at approximately a 45-degree angle. Use a warm white bulb (3000K) for accurate facial recognition.',
    },
  ],
  [
    'All exterior doors have dedicated lighting fixtures',
    {
      standard:
        'Every exterior door — front, rear, side, and garage entry — should have its own dedicated light fixture to eliminate dark approach areas.',
      improvement:
        'Install a light fixture above or adjacent to each exterior door that does not currently have one. Use photocell or dusk-to-dawn fixtures so they activate automatically each evening.',
    },
  ],
  [
    'Walkways and driveway adequately illuminated',
    {
      standard:
        'Well-lit walkways and driveways allow occupants and neighbors to observe anyone approaching the home and eliminate concealment along travel paths.',
      improvement:
        'Add solar or low-voltage path lights along walkways. Install a fixture or floodlight to illuminate the driveway. Ensure lighting is even with no dark gaps between fixtures.',
    },
  ],
  [
    'Motion-activated lights at vulnerable areas (side yards, rear entry, garage)',
    {
      standard:
        'Motion-activated lights serve as both a deterrent and an alert system — sudden illumination startles intruders and draws attention from neighbors.',
      improvement:
        'Install motion-activated LED floodlights at the rear entry, side yards, and garage area. Adjust sensitivity and range to avoid false triggers from animals while covering key approach paths. Mount lights at 8-10 feet for optimal coverage.',
    },
  ],
  [
    'No dark "dead zones" around the perimeter of the home',
    {
      standard:
        'Dark areas around the perimeter of the home provide concealment for intruders and make it possible to move around the property undetected at night.',
      improvement:
        'Walk the perimeter at night to identify dark spots. Add motion-activated or photocell fixtures to eliminate dead zones. Pay special attention to areas between lighting fixtures, behind landscaping, and around utility equipment.',
    },
  ],
  [
    'Exterior lights on photocell (dusk-to-dawn) or timer — not solely manual switch',
    {
      standard:
        'Lights that depend solely on manual switches are often forgotten and leave the property dark. Automated lighting ensures consistent illumination every night.',
      improvement:
        'Replace manual-switch fixtures with photocell (dusk-to-dawn) or smart-timer-equipped lights. Many LED bulbs now include built-in photocells. Smart plugs or in-wall timers are affordable alternatives.',
    },
  ],
  [
    'All exterior light fixtures functioning (no burned-out bulbs)',
    {
      standard:
        'Non-functioning exterior lights create dark spots that undermine the entire lighting plan and signal neglect.',
      improvement:
        'Replace burned-out bulbs immediately. Switch to long-life LED bulbs to reduce maintenance frequency. Check all exterior lights monthly as part of a regular home maintenance routine.',
    },
  ],
  [
    'No landscaping growth obstructing light fixtures or blocking light output',
    {
      standard:
        'Vegetation that has grown around or in front of light fixtures blocks the light output and creates shadows that negate the fixture\'s purpose.',
      improvement:
        'Trim vegetation around all exterior light fixtures to ensure full, unobstructed light output. Maintain a clear zone of at least 12 inches around each fixture. Adjust fixture positions if persistent plant growth is an issue.',
    },
  ],

  // ─── Zone 7: Windows & Interior Considerations ───

  [
    'Windows in high-use rooms (living room, kitchen) face the street or yard areas',
    {
      standard:
        'Rooms where occupants spend the most time should have windows facing the street or yard so that natural surveillance occurs as part of daily activity.',
      improvement:
        'If high-use room windows face away from the street, arrange seating and workspaces to maximize views of exterior areas from other windows. Consider adding a convex security mirror to monitor blind spots from inside.',
    },
  ],
  [
    'Window treatments allow occupants to observe outside (not permanently blocked/covered)',
    {
      standard:
        'Permanently blocked or covered windows eliminate natural surveillance from inside the home and prevent occupants from monitoring their property.',
      improvement:
        'Replace heavy blackout curtains or permanent window coverings with adjustable options such as sheer curtains, blinds, or top-down/bottom-up shades that allow outward observation while maintaining privacy.',
    },
  ],
  [
    'Every window has a working lock in good condition',
    {
      standard:
        'Window locks are a basic but essential layer of access control. Many residential burglaries involve entry through an unlocked or poorly secured window.',
      improvement:
        'Test every window lock in the home and repair or replace any that do not engage fully. For double-hung windows, install window pins or secondary locks as an additional measure. Keep all windows locked when not in use.',
    },
  ],
  [
    'Ground-floor windows have security film or reinforced glass where appropriate',
    {
      standard:
        'Ground-floor windows are accessible entry points. Security film holds the glass together when struck, delaying entry and creating noise that alerts occupants and neighbors.',
      improvement:
        'Apply 4-mil or thicker security film to all ground-floor windows, especially those in secluded areas or near doors. Security film is a cost-effective alternative to replacing windows with tempered or laminated glass.',
    },
  ],
  [
    'Second-story windows not accessible via adjacent structures, trees, or climbing aids',
    {
      standard:
        'Upper-floor windows can become entry points if nearby trees, trellises, pergolas, or other structures provide a climbing path.',
      improvement:
        'Trim tree branches within 6 feet of second-story windows. Remove or relocate trellises and other climbable structures away from the home. Ensure no patio furniture, storage sheds, or fences provide stepping-stone access to upper windows.',
    },
  ],
  [
    'Alarm/security system installed and in working order (if applicable)',
    {
      standard:
        'A monitored alarm system provides rapid notification to law enforcement and serves as a significant deterrent to potential intruders.',
      improvement:
        'If a system is installed, ensure it is active and monitored. Test sensors on all doors and windows and replace batteries on wireless sensors. If no system is present, consider a modern DIY system which can be self-installed at low cost.',
    },
  ],
  [
    'Security signage/stickers displayed (even if no active system)',
    {
      standard:
        'Visible security signage and window stickers deter opportunistic burglars by suggesting the home is monitored — research shows even signage alone reduces targeting.',
      improvement:
        'Place security company yard signs near the front entry and security stickers on ground-floor windows and doors. Position signs where they are visible from the street and from approach paths.',
    },
  ],
  [
    'Valuable items not visible through windows from outside',
    {
      standard:
        'Visible high-value items (electronics, jewelry, firearms) advertise targets to potential burglars conducting surveillance of the neighborhood.',
      improvement:
        'Rearrange rooms so that TVs, computers, and valuables are not directly visible through windows from the street or sidewalk. Use window treatments strategically to block views of high-value items, especially at night when interior lights make them more visible.',
    },
  ],
]);
