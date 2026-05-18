# Commercial Office (Single-Tenant HQ) — CPTED Assessment Research Draft

**Target property:** ~157,000 sq ft, 4-story, 11 acres, surface parking only, single tenant (insurance company HQ)
**Target item count:** 140–160 (one-day field walkthrough)
**Format:** Volusia Sheriff CPTED voice — declarative, observable, single-sentence items, scored 1–5 / N/A

---

## Executive Summary

The proposed assessment lands at **152 items across 11 zones**, fitting cleanly inside the 140–160 target and matching the school template's scope (150 items). I kept the user's 12-zone proposed framework largely intact but made four structural adjustments based on what the source literature actually emphasizes:

1. **Merged Lighting (proposed Zone 11) into the relevant outdoor and interior zones** rather than carrying a standalone lighting zone. CPTED treatments lighting as a property of every zone (a "Lighting" principle inside parking, perimeter, building exterior, lobby, etc.) rather than a place. This matches how the residential and school templates already handle it. Note: this collapses 12 → 11 zones.
2. **Kept Loading Dock + Mailroom as a single zone.** FEMA 426, BOMA, GSA Mail Center Security Guide, and the ISC Best Practices for Mail Screening all treat the receiving/mail function as one operational area in single-tenant HQs (one path: dock → mail intake → screening → distribution). Splitting them would create thin zones.
3. **Kept Critical & Restricted Areas as a dedicated zone.** Server room, MDF/IDF, executive suite, HR/records, mechanical, electrical, water, and generator share the same CPTED problem (high-value, low-traffic, must-be-locked, must-be-logged) and benefit from being assessed together. CISA insider-threat guidance and NFPA 730 group these the same way.
4. **Kept Workplace Violence & Active-Threat Readiness as its own dedicated zone (Zone 11).** ASIS WVPI AA-2020 and CISA's Active Shooter Preparedness program both frame this as a program-level capability that crosses physical zones — assessor-verifiable through the security director, EAP, drill records, and walk-bys of mass-notification devices. The user explicitly asked for this in v1.

A few items lean policy/program rather than purely physical (active-threat training cadence, threat-assessment team composition, EAP drill records). These are explicitly verifiable by asking the security director and reviewing one document — within the project's "observable in the field" rule, given commercial assessments rely more heavily on the security director interview than residential walkthroughs do. Florida tort reform (FS 768.0701, 2023) raised the practical importance of documented security programs for commercial premises, so an assessment that captures program elements has direct liability-reduction value.

---

## Source List

| Source | What it contributed |
|---|---|
| **CISA Commercial Facilities Sector** (cisa.gov/topics/.../commercial-facilities-sector) | Threat framing — armed attackers, vehicle ramming, UAS, cyber-physical convergence; sector-level vulnerability lens |
| **FEMA 426 / BIPS-06 — Reference Manual to Mitigate Potential Terrorist Attacks Against Buildings** (fema.gov, 2011 ed.) | Building Vulnerability Assessment Checklist categories: site, architectural, building envelope, structural, mechanical, electrical, fire alarm, communications, security systems, equipment ops & maintenance |
| **FEMA 430 — Site and Urban Design for Security** (fema.gov) | Standoff distances, perimeter design, site layout for blast/ramming, vehicular vs. pedestrian separation, landscaping as barrier |
| **FEMA 427 — Primer for Design of Commercial Buildings to Mitigate Terrorist Attacks** | Commercial-specific application of 426 principles |
| **ASIS WVPI AA-2020 — Workplace Violence and Active Assailant: Prevention, Intervention, and Response Standard** | Threat assessment team composition, employee training, behavioral indicators, post-incident response, BCM tie-in |
| **NFPA 730 — Guide for Premises Security (2026 ed.)** | Premises security zoning model: perimeter → building exterior → interior → critical areas; access control hierarchy |
| **CISA Active Shooter Preparedness Action Guide** (June 2025 ed.) + **Active Shooter Emergency Action Plan Guide** | EAP elements, Run-Hide-Fight, lockdown card capability, mass notification, elevator stop, drill cadence, LE coordination |
| **CISA Insider Threat Mitigation Guide** (Nov 2020) + **BTAM in Practice** (Feb 2025) | Behavioral indicators, reporting channels, threat assessment team structure |
| **BOMA Suggested Security Measures + BOMA 360 criteria** | Loading dock, mailroom, mechanical, elevator, stairwell, roof, HVAC, communications closet practices |
| **GSA Mail Center Security Guide (5th ed.) + ISC Best Practices for Mail Screening and Handling** | X-ray/screening, separated mail processing, negative-pressure intake, suspicious package protocol, isolated HVAC |
| **Threshold Security — CPTED Office Building Security Checklist** (4-part) | Direct CPTED-by-principle item language for office context (window signs ≤10%, furniture ≤5 ft, parking visibility, hinge security, deadbolt throw, key control, badge expiration) |
| **Las Vegas / Apache Junction / PWC / Seattle PD CPTED Handbooks** | Voice/format calibration; standard phrasing for landscape rule, lighting standards, signage |
| **Ontario CPTED + NICP guides** | Activity Support principle phrasing; second-generation CPTED concepts (social cohesion, sense of ownership) |
| **OSHA 29 CFR 1910.38 — Emergency Action Plans** | Required EAP elements: alarm system, evacuation procedures, accountability, training, named coordinators |
| **DHS Behavioral Threat Assessment and Management** + **FBI LEB — Threat Assessment Teams** | Multidisciplinary TAT composition (HR + legal + security + mental health + LE liaison) |
| **Kastle Active Shooter Preparedness Guide** | Building-system-level lockdown items: card-reader disable, elevator hold, fail-safe door release, panic button, remote camera viewing |
| **Threshold Security / IPVM / Kisi server-room guides** | MDF/IDF physical security, audit logging, biometric/card access for server rooms |
| **Florida Statute 768.0701 (2023 tort reform)** | Establishes the legal framing — documented commercial security programs reduce premises-liability exposure for the property owner |
| **Volusia Sheriff CPTED School Evaluation** (existing in-app reference, files(1)/CPTED SCHOOL EVAL.docx) | Voice/format — declarative single-sentence items, principle naming, scoring expectations |

---

## Zone-by-Zone Outline

### Zone 1 — Site Perimeter & Approach
**Key:** `site_perimeter`
**Description:** Begin the walkthrough at the property line. Evaluate how the 11-acre site presents to approaching vehicles and pedestrians, the standoff distance between any public road and the building, and the perimeter's ability to deter both ramming and unauthorized foot entry. Set the territorial tone for the rest of the assessment here.

**Natural Surveillance** (3)
- The full property boundary is visible from the street or from on-site occupied positions without significant blind spots.
- Perimeter landscaping follows the CPTED 2'/6' rule (shrubs trimmed below 2 ft, tree canopies above 6 ft) so sight lines are preserved.
- Remote or seldom-used edges of the property are visible from the building, internal roadways, or dedicated camera coverage.

**Access Control** (4)
- Vehicle approach is funneled through a clearly defined primary entrance with no informal cut-throughs from adjacent parcels.
- Hostile-vehicle mitigation (bollards, planters, knee-wall, or landscaped berm) protects the building face from ramming at the closest standoff approach.
- Perimeter fencing, landscape berms, or natural barriers define the property edge along all sides exposed to public roadway or adjacent property.
- Knox Box or equivalent first-responder access has been installed at a visible location for after-hours building entry.

**Territorial Reinforcement** (3)
- A monument sign or building-name signage at the primary approach establishes the property as private corporate territory.
- Signage at the perimeter directs visitors, deliveries, and employees to the appropriate entrances.
- Property-line markers (fencing, hedges, walls, or pavement transitions) clearly distinguish the corporate property from public right-of-way.

**Maintenance & Image** (2)
- The perimeter is free of graffiti, litter, broken fencing, and signs of neglect that would signal reduced guardianship.
- Perimeter signage is clean, current, and free of obsolete or damaged elements.

**Zone 1 total: 12 items**

---

### Zone 2 — Surface Parking & Pedestrian Circulation
**Key:** `parking_pedestrian`
**Description:** Evaluate the surface parking lots, marked pedestrian routes between parking and the building, and any employee/visitor parking segregation. With ~700+ likely stalls on 11 acres, sight lines, lighting uniformity, and natural surveillance from the building drive most of the score here.

**Natural Surveillance** (4)
- Parking areas are visible from occupied portions of the building (ground- or upper-floor windows, reception, or security control room).
- Pedestrian routes from parking to building entrances are open, direct, and visible without hidden alcoves or screened approaches.
- Cameras provide overlapping coverage of all parking areas with no significant blind spots between fixtures.
- Landscaping in and around the parking lot follows the 2'/6' rule so a person standing between vehicles is visible from a distance.

**Access Control** (4)
- Visitor parking is clearly marked, located adjacent to the main entrance, and signed at the property approach.
- Employee-only parking sections are marked with signage or pavement treatments that distinguish them from visitor stalls.
- Vehicle entry/exit points are clearly marked, controlled by gate or stop control where appropriate, and minimized to the operational minimum.
- After-hours parking is restricted, and any after-hours arrivals are observable by security staff or via monitored cameras.

**Lighting** (5)
- Parking areas are lit so faces can be recognized at 25 feet, in line with IES recommended practice for parking facilities.
- Light fixtures are spaced for uniformity (low light-to-dark ratio) without dark gaps between poles.
- Light fixtures are tamper- and vandal-resistant, mounted at heights that are not easily reached.
- All parking-area light fixtures are functioning, with no out, dim, or damaged units observed.
- Pedestrian walkways between parking and the building are lit continuously (not just at endpoints).

**Territorial Reinforcement** (3)
- Stall striping, directional arrows, and curb treatments are crisp and current rather than faded or obscured.
- Designated visitor stalls are reinforced by signage and pavement markings.
- Wayfinding signs guide visitors from parking to the main entry without ambiguity.

**Maintenance & Image** (2)
- The parking lot is free of abandoned vehicles, accumulated debris, broken pavement, and damaged stalls.
- Pavement markings, signs, and curb paint are maintained in legible condition.

**Zone 2 total: 18 items**

---

### Zone 3 — Grounds, Landscaping & Outdoor Common Areas
**Key:** `grounds_outdoor`
**Description:** Evaluate the rest of the 11-acre site outside parking — courtyards, plazas, designated smoking areas, outdoor break/eating areas, walking paths, retention ponds, and any deliveries staging or trash/dumpster areas. Look for hiding spots, defensible territory, and any areas where employees congregate outdoors.

**Natural Surveillance** (3)
- Outdoor break, smoking, and eating areas are visible from inside the building or from regularly traveled walkways.
- Walking paths and trails are open and unobstructed by tall hedges, blind curves, or screened bench enclosures.
- Trash, dumpster, and recycling areas are visible from the building or from a regularly traveled vehicle route.

**Access Control** (3)
- Designated smoking areas are positioned so smokers do not prop open exterior doors or congregate near secondary entries.
- Dumpster enclosures are gated/locked when not in active use to prevent dumpster diving and bomb-staging concealment.
- Outdoor utility components (transformers, gas meters, HVAC condensers, irrigation backflow) are protected by enclosures, fencing, or bollards.

**Territorial Reinforcement** (2)
- Outdoor common areas (courtyards, plazas, eating areas) are clearly furnished and signed as employee-use spaces, not public space.
- Landscape design and pavement signal that the grounds are owned, maintained, and patrolled.

**Maintenance & Image** (3)
- Grounds are free of graffiti, litter, broken benches/tables, and overgrown landscape.
- Trash receptacles in outdoor common areas are emptied on a regular schedule and are not overflowing.
- Irrigation, drainage, and landscape beds are functioning and not creating standing-water or overgrowth issues.

**Zone 3 total: 11 items**

---

### Zone 4 — Building Exterior & Envelope
**Key:** `building_exterior`
**Description:** Walk the full perimeter of the 4-story building. Evaluate the façade, ground-floor windows, all secondary doors (employee, emergency egress, service), roof access, and rooftop equipment. Confirm there is one and only one normal entry path and that everything else is secured.

**Natural Surveillance** (3)
- Ground-floor windows are not obstructed by interior signs, posters, or furniture beyond the 10% / 5-ft CPTED guideline.
- The full exterior perimeter is observable from cameras, regularly patrolled paths, or building windows with overlapping coverage.
- Setback/hardscape around the building is open enough to deny concealed approach to ground-floor windows and doors.

**Access Control** (8)
- All secondary exterior doors are exit-only (no exterior hardware) or controlled by card reader.
- Exterior doors have non-removable hinge pins or hinges that are not accessible from outside.
- Exterior doors are equipped with deadbolts (minimum 1-inch throw) or equivalent commercial locking, with strike plates anchored into the frame.
- Exterior door closers and weather seals are in working order and the doors latch fully when released.
- Secondary exterior doors are alarmed (door-position contact reporting to the security panel) so any opening is detected.
- Ground-floor windows that open are equipped with locks; fixed glazing is intact and not propped/blocked.
- Roof access doors and roof hatches are locked, alarmed, and not used as informal smoking-break exits.
- Rooftop HVAC, communications, and mechanical equipment is protected by perimeter fencing, locked enclosures, or restricted-access roof zoning.

**Territorial Reinforcement** (2)
- The primary entry is visually distinct (canopy, signage, lighting) from secondary doors so visitors are funneled to it unambiguously.
- All secondary doors are signed appropriately (e.g., "Emergency Exit Only — Alarm Will Sound") to deter routine use.

**Lighting** (3)
- All exterior building façades are lit during darkness with no dark sides of the building.
- Exterior door entries are lit so a person at the door can be recognized on camera and from inside.
- Roof-edge or rooftop lighting allows after-hours patrol or maintenance access without flashlights.

**Maintenance & Image** (2)
- The building façade is free of graffiti, broken windows, and visible damage.
- Exterior signage, door hardware, and lighting fixtures are maintained and current.

**Zone 4 total: 18 items**

---

### Zone 5 — Main Lobby, Reception & Visitor Management
**Key:** `lobby_reception`
**Description:** Evaluate the main public lobby — the visitor's first impression and the building's primary chokepoint. Observe reception layout, sight lines from reception to the entry vestibule, visitor processing workflow, and the transition from public lobby to controlled employee space.

**Natural Surveillance** (3)
- The reception/security desk has direct sight line to the primary exterior door and the full lobby.
- Reception staff can see arriving visitors before the visitor reaches the desk (no concealed approach).
- The lobby is monitored by camera with recording, including coverage of the reception desk and any side doors.

**Access Control** (6)
- A vestibule or transaction barrier separates the public lobby from the employee-controlled portion of the building.
- All visitors check in at reception and are issued a visitor badge before entering the controlled portion of the building.
- Visitor badges are visually distinct from employee badges and use a self-expiring or dated mechanism so reuse is detected.
- Visitors are escorted by a host employee, or are routed through a reception-controlled door, before entering office floors.
- A panic alarm or duress button is present at the reception desk and tested on a known schedule.
- The transition door from lobby to employee space is controlled by card reader, not propped, and re-locks reliably.

**Territorial Reinforcement** (2)
- A clearly posted visitor policy or sign-in expectation is visible to arriving visitors.
- Reception's location, signage, and orientation make it obvious that all visitors must check in before proceeding.

**Security Systems & Technology** (2)
- Reception staff have a workstation view (or shared monitor) of relevant exterior and lobby cameras.
- The visitor management system (paper log or software) captures visitor name, host, time in/out, and badge number.

**Maintenance & Image** (1)
- The lobby is well-maintained, brightly lit, and projects a controlled, professional image consistent with corporate ownership.

**Zone 5 total: 14 items**

---

### Zone 6 — Loading Dock, Mailroom & Service Entries
**Key:** `loading_mail`
**Description:** Evaluate all paths by which goods, mail, packages, and contractors enter the building. This is the highest-volume non-visitor entry stream and consistently the highest-risk receiving point for prohibited items, suspicious packages, and unauthorized after-hours entry. Single-tenant HQ means deliveries belong to one organization.

**Natural Surveillance** (3)
- The loading dock is visible from a regularly staffed position, security camera, or both at all times of dock operation.
- Mailroom intake is observable from another staffed area or by camera covering the receiving counter.
- The exterior approach to the loading dock is camera-covered with continuous recording.

**Access Control** (5)
- The loading dock overhead door and any pedestrian door are kept closed and locked when not actively in use.
- Vendors, delivery drivers, and contractors check in at the dock or at reception and are issued a temporary badge before entering the building.
- The mailroom has dedicated access control (card reader or staffed sign-in) separating it from the rest of the office space.
- A documented suspicious-package protocol (tell-tale signs, isolation procedure, 911 escalation) is posted in or near the mailroom.
- Service entries (janitor, vendor, contractor doors) are alarmed, exit-only or card-controlled, and not propped during business hours.

**Security Systems & Technology** (3)
- Mail and packages are screened (visual inspection at minimum; X-ray, K9, or vendor-screening service if higher tier) before distribution into the building.
- The mailroom HVAC is isolated from, or capable of being isolated from, the building's central air handling in the event of a suspicious substance release.
- A package-receiving log records inbound deliveries, sender, and recipient for accountability.

**Territorial Reinforcement** (1)
- The loading-dock area is signed as "Authorized Personnel Only — Deliveries Only" so unauthorized foot traffic is deterred.

**Maintenance & Image** (1)
- The dock and mailroom are clean, organized, and free of accumulated packaging, prop-open wedges, and unsecured tools.

**Zone 6 total: 13 items**

---

### Zone 7 — Vertical Circulation (Elevators, Stairwells, Floor Lobbies)
**Key:** `vertical_circulation`
**Description:** Evaluate how people move between the four floors. Observe elevator access control, stairwell security and surveillance, floor-lobby transitions, and the relationship between vertical circulation and emergency egress. (No parking garage, so all vertical circulation is interior to the building.)

**Natural Surveillance** (3)
- Elevator interiors are camera-covered with recording.
- Stairwells are camera-covered at landings or have alarmed door contacts so unauthorized travel is detected.
- Floor lobbies (elevator vestibules on each floor) are visible from a regularly occupied position on that floor.

**Access Control** (5)
- Elevator floor selection requires a credential after hours (or all-times for restricted floors), so unauthenticated travel is blocked.
- Stairwell doors permit free egress (life-safety code) but re-entry from the stairwell to office floors is controlled by card reader.
- Stairwell re-entry is permitted on at least every fourth floor and on the floor of discharge, in line with code, so occupants are never trapped in a stairwell.
- The path from the stairwell discharge to the exterior exit door is unobstructed and well lit.
- Roof access from the top stairwell is locked, alarmed, and signed as restricted.

**Lighting** (2)
- All stairwells are lit at code-required levels with no out or dim fixtures.
- Floor lobbies and elevator vestibules are lit to recognize faces on camera.

**Maintenance & Image** (2)
- Stairwells are free of stored materials, propped doors, and accumulated trash.
- Elevator cab interiors are clean, undamaged, and free of graffiti.

**Zone 7 total: 12 items**

---

### Zone 8 — Office Floors & Workstations
**Key:** `office_floors`
**Description:** Evaluate the open-office areas, executive suites, conference rooms, break rooms, and copy/print rooms across all four floors. Look for clean-desk practices, secured executive areas, and conference-room surveillance considerations. Single-tenant means uniform access control across the floor.

**Natural Surveillance** (3)
- Workstation layout preserves sight lines across the open floor plan rather than creating hidden alcoves or screened workstations.
- Conference rooms with glass walls or interior windows allow casual observation of activity from circulation paths.
- Cubicle and partition heights do not exceed five feet in primary work areas, in line with CPTED office surveillance guidance.

**Access Control** (4)
- Executive suite, executive assistant area, or C-suite floor is separated from general office space by access control.
- Conference rooms used for sensitive discussions are lockable when in use.
- Print/copy rooms with multifunction devices that handle sensitive documents are positioned in low-foot-traffic locations with reasonable visibility.
- Employee badging policy requires badges to be worn visibly while on the floor.

**Territorial Reinforcement** (2)
- Floor signage and wayfinding establish departmental identity (e.g., "Claims Operations — Floor 3") so visitors understand whose territory they have entered.
- Executive and restricted floors are signed and visually treated to reinforce that the space is access-controlled.

**Behavioral & Routine Considerations** (3)
- A clean-desk practice is in effect for sensitive paper records (claims, PII, HR) at end of day.
- Workstations are configured so that screens displaying confidential information are not visible from public corridors or windows.
- Employees know how to challenge or report a person on the floor without a visible badge.

**Maintenance & Image** (1)
- Office floors are clean, well-maintained, and project a controlled corporate image consistent with the lobby presentation.

**Zone 8 total: 13 items**

---

### Zone 9 — Critical & Restricted Areas
**Key:** `critical_restricted`
**Description:** Evaluate the rooms that, if compromised, take down the business or expose the company to significant liability — server room, MDF/IDF closets, executive suite (already partly covered in Zone 8), HR records, file rooms, mechanical rooms, electrical rooms, water service entry, and the emergency generator. These share a CPTED problem profile (high-value, low-foot-traffic, must-be-locked, must-be-logged).

**Natural Surveillance** (2)
- Doors to critical rooms are visible from a regularly staffed position or are camera-covered.
- Activity in or around mechanical/electrical/utility rooms is observable from corridors rather than from unmonitored hallway dead-ends.

**Access Control** (6)
- The server room / data center has access control with audit logging (card reader at minimum; biometric where the data sensitivity warrants it).
- MDF and IDF telecom closets are locked at all times and access is limited to IT and authorized vendors.
- HR records, claim files, and other PII storage areas are behind access-controlled doors with key or badge logging.
- Mechanical, electrical, and elevator-equipment rooms are locked and signed as restricted.
- The water service entry, fire-pump room, and any chemical or fuel storage areas are locked and signed.
- The emergency generator and fuel storage are protected by perimeter fencing, locked enclosure, or restricted-access yard.

**Security Systems & Technology** (3)
- Server room and MDF/IDF rooms are camera-covered with recording.
- Door-position contacts on critical rooms report to the security alarm panel and trigger after-hours alerts.
- Access logs for critical rooms are reviewed on a defined cadence (the security director can describe the cadence and reviewer).

**Maintenance & Image** (2)
- Critical rooms are kept clean and free of stored unrelated materials that would obscure equipment or block egress.
- Restricted-area signage is current, legible, and free of damage.

**Zone 9 total: 13 items**

---

### Zone 10 — Building Systems & Security Technology
**Key:** `security_technology`
**Description:** Evaluate the security infrastructure as a system: CCTV, access control platform, intrusion alarm, mass notification, fire/life-safety integration, and the security operations center (if present). This zone tests whether the technology investments are functional, monitored, and integrated rather than installed-and-forgotten.

**Security Systems & Technology** (8)
- The access control system is unified across the entire building (single-tenant context — one platform, one credential per employee).
- The access control system can immediately disable a credential and the security director can describe the revocation workflow.
- Camera footage is retained for at least 30 days (90 days preferred per CPTED office guidance).
- Cameras are positioned and resolved to support facial recognition at intended distances; non-working cameras have been repaired or removed.
- The intrusion alarm system is monitored 24/7 (in-house SOC or central station) and the monitoring contract is current.
- A mass notification system is in place that can reach all building occupants (intercom/PA, SMS, desktop alerts, or combination) and has been tested within the last 12 months.
- The security system is integrated with fire/life-safety such that fire alarm activation releases fail-safe doors and elevators recall in line with code.
- A documented panic-alarm capability exists at reception, executive areas, and HR with a tested response protocol.

**Maintenance & Image** (2)
- Security technology (cameras, readers, alarm panels, mass-notification devices) shows no visible damage, missing covers, or out-of-service indicators.
- Documentation, drawings, and credentials lists are current and reviewed on a stated cadence.

**Zone 10 total: 10 items**

---

### Zone 11 — Workplace Violence & Active-Threat Readiness
**Key:** `workplace_violence_readiness`
**Description:** Evaluate the program-level capability to prevent, respond to, and recover from workplace violence, active-assailant, and targeted-violence events. Most items are verifiable through the security director, written EAP, training records, and walk-bys of mass-notification and lockdown infrastructure already partly captured in Zone 10. Item is N/A only if the company genuinely lacks the program — score 1 if absent, not N/A.

**Behavioral & Routine Considerations** (4)
- A documented Workplace Violence Prevention policy exists and is communicated to all employees on hire and at a defined refresher cadence.
- A multidisciplinary Threat Assessment Team (security, HR, legal, mental-health resource, LE liaison) is in place and meets on a defined cadence to review concerning behavior reports.
- A confidential employee-reporting channel exists for threats, intimidation, and concerning behavior, and employees know how to use it.
- Pre-employment screening and a documented termination protocol (badge return, escort, threat assessment for high-risk separations) are in place.

**Emergency Preparedness** (5)
- A written Emergency Action Plan (EAP) covering fire, severe weather, medical, bomb threat, and active assailant is current and accessible to floor wardens.
- Run-Hide-Fight (or equivalent ALICE-style) training has been delivered to all employees within the last 24 months.
- Lockdown drills have been conducted within the last 12 months and after-action notes are retained.
- Floor wardens or a building emergency-response team are designated, named, and trained, with backups identified for absences.
- Designated assembly/rally points (and inclement-weather alternates) are identified for evacuation accountability.

**Access Control** (3)
- The building has a tested capability to immediately lock all access-controlled doors and disable card readers on command (lockdown card or SOC console).
- The building has a tested capability to immediately stop elevators at the next floor so they do not recall to the lobby during an active threat.
- Designated rooms or floors have lockable interior doors so occupants can shelter in place, and employees know which rooms qualify.

**Security Systems & Technology** (3)
- Mass notification devices (PA, desktop alert, SMS) reach all areas of the building including stairwells, restrooms, and parking; coverage has been verified by drill.
- Floor plans, riser diagrams, and access credentials/keys are pre-staged for delivery to law enforcement during an incident (e.g., Knox Box, lobby lockbox, or pre-arranged digital share).
- The security director has a documented coordination point of contact with the Volusia Sheriff's Office (or local LE) and has hosted a familiarization walkthrough within the last 24 months.

**Maintenance & Image** (3)
- Mass notification, panic alarm, and lockdown systems are tested on a documented schedule and test logs are retained.
- EAP documents, evacuation maps, and rally-point signage on every floor are current and legible.
- Post-incident response resources (EAP, victim assistance contacts, employee assistance program, business continuity playbook) are documented and assigned to a named owner.

**Zone 11 total: 18 items**

---

## Total Item Count

| Zone | Name | Items |
|---|---|---:|
| 1 | Site Perimeter & Approach | 12 |
| 2 | Surface Parking & Pedestrian Circulation | 18 |
| 3 | Grounds, Landscaping & Outdoor Common Areas | 11 |
| 4 | Building Exterior & Envelope | 18 |
| 5 | Main Lobby, Reception & Visitor Management | 14 |
| 6 | Loading Dock, Mailroom & Service Entries | 13 |
| 7 | Vertical Circulation (Elevators, Stairwells, Floor Lobbies) | 12 |
| 8 | Office Floors & Workstations | 13 |
| 9 | Critical & Restricted Areas | 13 |
| 10 | Building Systems & Security Technology | 10 |
| 11 | Workplace Violence & Active-Threat Readiness | 18 |
| | **Total** | **152** |

Inside the 140–160 target. Roughly 30 minutes per zone for a one-day field walkthrough plus a 1-hour security-director interview at the start to feed Zones 9–11.

---

## Open Questions / Flags

1. **Customer-walk-in counter vs. employee-only HQ.** The user said "single-tenant insurance company HQ" but did not specify whether the public walks in to file claims, pay bills, etc. The current draft assumes **employee-only HQ with appointment-only visitors** (closer to a corporate office than to a retail/branch operation). If there is a customer-walk-in counter, Zone 5 (Lobby & Reception) needs ~3–5 more items (queue management, customer-service desk surveillance, transaction-window separation, robbery-prevention signage, drop-safe practices). Recommend adding a `commercial_office_with_customer_counter` variant later if needed; do not bake those items in for the HQ template.
2. **Smoking areas.** Florida law restricts indoor smoking and many corporate campuses now ban it on-property entirely. Zone 3's smoking-area items should be `N/A` if the company is smoke-free; flagging because the assessor should not be confused when the score is 1-by-default-because-no-smoking-area-exists (it should be N/A).
3. **Hostile vehicle mitigation depth.** FEMA 426/430 specify performance-rated standoff (e.g., DOS K-rating, ASTM F2656). The current draft has one HVM item in Zone 1 phrased generically. For an insurance HQ that's not a federal/critical-infrastructure target, this is appropriate. If the user wants K-rated barrier specifics, that becomes 2–3 additional items and pushes the field assessor toward asking the security director rather than visually scoring.
4. **Drone / UAS threat.** CISA Commercial Facilities sector calls out UAS as an emerging threat. Zero items in the current draft. Recommend deferring to v2 — UAS countermeasures in commercial settings are mostly policy and detection (no practical mitigation), and assessors can't verify in a walkthrough.
5. **Cyber-physical convergence.** The CISA framing emphasizes cyber-physical (badge system breach, IoT building-systems compromise). The current draft touches this only in Zone 10 (audit log review) and Zone 9 (server-room physical security). If the user wants a stronger cyber-physical lens, that's a small additive (3–5 items in Zone 10 about credential management hygiene, IoT segmentation, vendor remote access). Defer unless requested.
6. **Active-Threat zone overlap with other zones.** Zones 5 (panic alarm at reception), 7 (elevator stop), and 10 (mass notification, lockdown card) all touch active-threat capabilities that are also called out in Zone 11. The current draft accepts this overlap deliberately — Zone 11 evaluates the **program/policy/training** while the other zones evaluate the **physical infrastructure**. Reviewer: confirm this is the right trade-off vs. consolidating everything into Zone 11.
7. **Florida-specific items.** Unlike schools (Alyssa's Law, HB 1421, MSD Act), commercial offices have **no** Florida-specific physical-security statute. The current draft references **FS 768.0701 (2023 tort reform)** only as motivation in the executive summary. Confirm: do you want any explicit Florida-statute items in this template? Recommend no — there's nothing analogous to school hardening law for private commercial property.
8. **N/A bias for Zone 11.** Many Zone 11 items will score 1 (Critical) if the company has no program at all rather than N/A. Recommend explicitly noting in the item-guidance file that "absent program" = score 1, not N/A. N/A should be reserved for items genuinely inapplicable to the property (e.g., "rooftop fall-arrest" if there's no rooftop access).
9. **Phase classification (interior/exterior toggle).** Zones 1–4 and most of 6 are exterior. Zones 5, 7, 8, 9, 10, 11 are interior. Some Zone 6 items (mailroom protocol) and Zone 2 items are interior-information observed from outside. The walkthrough phase tags should be:
   - Exterior: Zones 1, 2, 3, 4, plus Zone 6 dock-approach items
   - Interior: Zones 5, 7, 8, 9, 10, 11
10. **Auto-flagged recommendations.** The residential template auto-recommends CPTED fencing for low-scored fence items. For commercial, the equivalent triggers are:
    - Low score on Zone 1 HVM → auto-recommend bollards/planters
    - Low score on Zone 5 vestibule/badge → auto-recommend visitor management software + vestibule
    - Low score on Zone 11 EAP/training → auto-recommend EAP development + Run-Hide-Fight training
   Defer to v2 unless requested.

---

## Sources (URLs for follow-up)

- CISA Commercial Facilities Sector: https://www.cisa.gov/topics/critical-infrastructure-security-and-resilience/critical-infrastructure-sectors/commercial-facilities-sector
- FEMA 426: https://www.fema.gov/sites/default/files/2020-08/fema426_0.pdf
- FEMA 430: https://www.fema.gov/sites/default/files/2020-08/fema430.pdf
- FEMA 427: https://www.fema.gov/sites/default/files/2020-08/fema427.pdf
- FEMA 426 Building Vulnerability Assessment Checklist: https://www.dcjs.virginia.gov/sites/dcjs.virginia.gov/files/training-events/5318/fema_building_vulnerability_checklist.pdf
- ASIS WVPI AA-2020: https://www.asisonline.org/publications--resources/standards--guidelines/workplace-violence/
- NFPA 730 (Premises Security, 2026): https://www.nfpa.org/codes-and-standards/nfpa-730-standard-development/730
- CISA Active Shooter Preparedness: https://www.cisa.gov/topics/physical-security/active-shooter-preparedness
- CISA Active Shooter Emergency Action Plan Guide: https://www.cisa.gov/sites/default/files/publications/active-shooter-emergency-action-plan-112017-508v2.pdf
- CISA Active Shooter Preparedness Action Guide (2025): https://www.cisa.gov/sites/default/files/2025-06/Active-Shooter-Preparedness-Action-Guide_508_20250611.pdf
- CISA Insider Threat Mitigation Guide: https://www.cisa.gov/sites/default/files/2022-11/Insider%20Threat%20Mitigation%20Guide_Final_508.pdf
- BOMA Suggested Security Measures: https://www.boma.org/BOMA/Advocacy/Security___Emergency_Preparedness/BOMA%20Suggested%20Security%20Measures.aspx
- GSA Mail Center Security Guide (5th ed.): https://www.gsa.gov/system/files/Mail%20Center%20Security%20Guide%205th%20Edition%20508%20Compliant.pdf
- ISC Best Practices for Mail Screening and Handling: https://electionline.org/wp-content/uploads/2020/01/Best_Practices_for_Mail_Screening_and_Handling_Processes__A_Guide_for_th.._.pdf
- Threshold Security CPTED Office Building Checklist: https://www.thresholdsecurity.com/blog/cpted-office-building-security-checklist/
- Las Vegas CPTED Handbook (2022): https://files.lasvegasnevada.gov/public-safety/CLV%20CPTED-Handbook-2022.pdf
- WBDG CPTED resource: https://www.wbdg.org/resources/crime-prevention-environmental-design
- OSHA EAP eTool: https://www.osha.gov/etools/evacuation-plans-procedures/eap
- OSHA 1910.38 Emergency Action Plans: https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.38
- DHS Behavioral Threat Assessment and Management: https://www.dhs.gov/behavioral-threat-assessment-and-management
- FBI LEB — Threat Assessment Teams: https://leb.fbi.gov/articles/featured-articles/threat-assessment-teams-workplace-and-school-violence-prevention
- Florida Statute 768.0701 (2023 tort reform): https://www.flsenate.gov/Laws/Statutes/2023/0768.0701
- Kastle Active Shooter Preparedness Guide: https://info.security.kastle.com/resources/articles/active-shooter-preparedness-guide
