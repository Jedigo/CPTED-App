# CPTED Scope Audit — 2026-05-21

## Purpose

The team is reverting from the hybrid CPTED + target-hardening approach to **strictly CPTED**
content, for liability reasons. The assessors hold the **Florida Attorney General's Office
CPTED Practitioner designation** — a narrow, CPTED-specific credential. Recommending outside
that scope is a liability attack surface.

This audit tagged all **594 checklist items** across all six property templates against the
Crowe three-form CPTED taxonomy (surveillance / access control / territorial reinforcement /
maintenance & image / activity support / lighting — each in natural, mechanical, and organized
forms).

## Decision

**Remove the 20 out-of-scope items** listed below. Deferred to a future session (not started).
- Borderline items (33) are **kept** — they reframe to a CPTED strategy. Do NOT remove them.
- School statutory items (10) are **kept** — they rest on Florida statutory authority, a
  separate and stronger footing. Label them as statutory-compliance items, not CPTED findings.

## Coverage

| Template | Items | Clean in-scope | Borderline (keep/reframe) | Statutory (keep) | **Out of scope (REMOVE)** |
|---|---|---|---|---|---|
| Residential | 63 | 59 | 4 | 0 | **0** |
| Townhome | 71 | 67 | 4 | 0 | **0** |
| Worship (Catholic) | 70 | 65 | 3 | 0 | **2** |
| Christian church | 84 | 76 | 5 | 0 | **3** |
| Schools | 150 | 130 | 7 | 10 | **3** |
| Commercial office | 156 | 134 | 10 | 0 | **12** |
| **Total** | **594** | **531** | **33** | **10** | **20** |

95% of the app is already defensible CPTED. The fix is surgical, concentrated in three hotspots.

---

## THE 20 ITEMS TO REMOVE (exact text)

### Worship — Catholic (`worship-zones.ts`) — 2 items
1. **Sanctuary & Worship Space / Target Hardening & Emergency Preparedness** —
   "Evacuation plan is posted and congregation has been briefed on emergency procedures"
2. **Education & Children's Areas / Target Hardening** —
   "Classrooms have lockdown capability (doors lockable from inside, window coverings available)"
   *(If the team later wants a clean access-control item, "classroom doors lockable from inside"
   alone is defensible — re-add as a new mechanical-access-control item without the lockdown framing.)*

### Christian church (`christian-zones.ts`) — 3 items
3. **Worship Center & Stage/Platform / Target Hardening & Emergency Preparedness** —
   "Evacuation plan is posted and congregation has been briefed on emergency procedures"
4. **Worship Center & Stage/Platform / Target Hardening & Emergency Preparedness** —
   "Worship center doors can be secured for lockdown during an active threat"
5. **Children's & Youth Ministry Areas / Access Control** —
   "Youth areas have lockdown capability independent of main building"

### Schools (`school-zones.ts`) — 3 items (all Zone 10 / Planning & Drills)
6. "Multi-hazard evacuation plan is current, reviewed annually with law enforcement and fire, and posted as required"
7. "Reunification site and procedure are established, documented, and known to staff and families"
8. "Mass-notification system (intercom, digital signage, SMS) is tested and functional"

### Commercial office (`commercial-office-zones.ts`) — 12 items (all Zone 11)
9.  **Z11 / Behavioral & Routine Considerations** — "A documented Workplace Violence Prevention policy exists and is communicated to all employees on hire and at a defined refresher cadence"
10. **Z11 / Behavioral & Routine Considerations** — "A multidisciplinary Threat Assessment Team (security, HR, legal, mental-health resource, LE liaison) is in place and meets on a defined cadence to review concerning behavior reports"
11. **Z11 / Behavioral & Routine Considerations** — "A confidential employee-reporting channel exists for threats, intimidation, and concerning behavior, and employees know how to use it"
12. **Z11 / Behavioral & Routine Considerations** — "Pre-employment screening and a documented termination protocol (badge return, escort, threat assessment for high-risk separations) are in place"
13. **Z11 / Behavioral & Routine Considerations** — "Customer-facing staff (claims, policy service, reception) have received de-escalation and hostile-customer response training within the last 24 months"
14. **Z11 / Emergency Preparedness** — "A written Emergency Action Plan (EAP) covering fire, severe weather, medical, bomb threat, and active assailant is current and accessible to floor wardens"
15. **Z11 / Emergency Preparedness** — "Run-Hide-Fight (or equivalent ALICE-style) training has been delivered to all employees within the last 24 months"
16. **Z11 / Emergency Preparedness** — "Lockdown drills have been conducted within the last 12 months and after-action notes are retained"
17. **Z11 / Emergency Preparedness** — "Floor wardens or a building emergency-response team are designated, named, and trained, with backups identified for absences"
18. **Z11 / Emergency Preparedness** — "Designated assembly/rally points (and inclement-weather alternates) are identified for evacuation accountability"
19. **Z11 / Maintenance & Image** — "EAP documents, evacuation maps, and rally-point signage on every floor are current and legible"
20. **Z11 / Maintenance & Image** — "Post-incident response resources (EAP, victim assistance contacts, employee assistance program, business continuity playbook) are documented and assigned to a named owner"

**Common thread:** every out-of-scope item is *emergency management* — plans, drills, training
programs, response teams. CPTED ends at the physical environment; active-threat *response*
begins where the environment ends.

---

## BORDERLINE — 33 items — KEEP (reframe later, do NOT remove)

These touch hardening/procedure but map to a CPTED strategy. They are defensible with correct
framing. A later pass may reword them; they are NOT part of the removal.

- **Residential + Townhome (4 distinct, in both files):** "Glass panels in or near door are
  reinforced or have security film" · "Rear windows have working locks and are reinforced if
  ground-accessible" · "Ground-floor windows have security film or reinforced glass where
  appropriate" · "Sliding glass doors have secondary security (dowel/pin in track, security bar,
  or foot lock)" — all defensible as mechanical access control (reach-through / delay defeat,
  NOT ballistic).
- **Worship Catholic (2):** tabernacle/sacred objects secured · altar/chancel access control.
- **Christian (5):** electrical panels inaccessible · utility entry points secured · stage
  access control · panic alarm at sound booth/podium (reframe as duress/surveillance device) ·
  youth exterior doors exit-only.
- **Schools (7):** building ID signage · portable-classroom ID signage · classroom-number
  placards · deployable door-glazing opaque covers · posted SRP signage · in-school-suspension
  area monitoring · two-way radios. (Most are signage framed for "tactical response" — reframe
  as environmental wayfinding/territorial signage.)
- **Commercial (10):** centralized lock-all-doors capability · elevator next-floor-stop ·
  lockable shelter rooms · mass-notification devices · LE-staged floor plans / Knox Box ·
  security-director LE coordination · panic/notification system testing · Z6 suspicious-package
  protocol · Z6 mail screening · Z5 customer meeting-room sightline/duress (this one is
  genuinely in scope — flagged for visibility only).

---

## SCHOOL STATUTORY — 10 items — KEEP (label as statutory compliance, not CPTED findings)

**Environmental hardware mandated by statute (also CPTED-defensible):**
- Z5 reception Alyssa's Law panic button
- Z10 MPAS installed + PSAP integration (Alyssa's Law)
- Z10 single-alert lockdown trigger (Alyssa's Law)
- Z10 SRO/Guardian coverage (MSD Act — organized surveillance/access control)
- Z7 "Classrooms can be secured and locked down from the inside without the teacher exiting the
  room" (HB 1421 — also clean mechanical access control)

**Purely procedural, mandated by statute (statutory but not CPTED):**
- Z10 HB 301 digital school mapping data provided
- Z10 School Safety Specialist appointed (HB 1421)
- Z10 Threat Assessment Team established (MSD Act)
- Z10 FortifyFL anonymous tip line posted/publicized
- Z10 lockdown/fire/severe-weather drills conducted on state schedule

---

## GUIDANCE-PROSE CLEANUP (separate workstream — `*-item-guidance.ts`)

Even some *in-scope* items have guidance text that strays outside CPTED. Not part of the item
removal; address as a follow-up pass.
- **Worship/Christian:** evacuation-plan guidance prescribes a full written EAP + quarterly
  safety-team training; lockdown-drill prose; "security bars" / inward-swing barricading prose;
  arson/sabotage framing on the utilities item.
- **Schools:** ballistic-glazing UL-752 rating-level specs (security-engineering, not CPTED
  observation); fire-code compliance verification language; OSHA / food-safety references.
- **Commercial:** Z11 guidance cites OSHA 1910.38, ALICE, BTAM methodology, ASIS WVPI AA-2020;
  Z6 mailroom GSA-guide procedure + staff training; Z8/Z9 PII/privacy framing (GDPR/CCPA) —
  reframe to natural surveillance / mechanical access control (consistent with prior design
  feedback: CPTED framing, not data-protection framing).

---

## IMPLEMENTATION NOTES (for the removal session)

For each of the 20 items:
1. Delete the item from its zone file (`worship-zones.ts`, `christian-zones.ts`,
   `school-zones.ts`, `commercial-office-zones.ts`).
2. Delete the matching guidance entry from the corresponding `*-item-guidance.ts`.
3. Remove any `item-phases.ts` entries keyed to that exact item text — `INTERIOR_ITEMS`,
   `NIGHT_ITEMS`, `VERIFICATION_HINTS`.
4. Update item-count constants — `COMMERCIAL_OFFICE_TOTAL_ITEM_COUNT` and any school count
   display. New counts: Worship 68, Christian 81, Schools 147, Commercial 144.
5. **Empty-principle handling:** removing items may empty a principle. Worship Catholic's
   "Target Hardening & Emergency Preparedness" principle may be left with zero scoring items —
   check and drop the principle if empty. Christian's same-named principle retains the panic-alarm
   borderline item, so it survives.
6. **Rename the "Target Hardening & Emergency Preparedness" principle** in worship/christian —
   the name itself contradicts CPTED doctrine (Crowe positioned CPTED as the move *away* from
   target hardening). Rename the *display name* only; do NOT change the principle *key* — the
   key is part of the `item_scores` composite index `[zone_key+principle]` and changing it
   orphans existing assessment records.
7. **Version bump:** minor (items dropped) — likely **v0.25.0**. Bump `package.json` + `Home.tsx`.
8. **Existing assessments:** removing items from a zone def does not break old assessments'
   display (`ZoneView` reads `item_scores`, not the zone def), but removed items will still
   appear in old assessments and their guidance lookup will fail. User's typical preference is
   start fresh — no migration.
9. Typecheck + production build, then `./deploy.sh` from repo root.

## OPEN QUESTION — Commercial Zone 11

Removing 12 of Z11's 19 items leaves **7 borderline items, 0 clean in-scope**. The zone becomes
awkward. Two paths for the team to decide next session:
- (a) **Relocate** the ~5 genuine hardware/access-control items (centralized lock-all-doors,
  lockable shelter rooms, Knox Box) into Zones 4/9/10, then drop Z11 entirely.
- (b) Keep Z11 as a slimmed zone of reframed borderline items.

Also for the team: townhome template is **71 items**, not the "~67" previously recorded in
CLAUDE.md / MEMORY.md — corrected this session.
