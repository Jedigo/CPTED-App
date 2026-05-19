# Commercial Office Audit — Deferred Changes

Findings from the field audit of the v0.23.x commercial office template.
Held until the assessor finishes the first audit pass so item-text renames
don't keep invalidating the in-progress test assessment.

Apply all of these in a single batch at the end: rename / delete in
`commercial-office-zones.ts`, mirror the same key changes in
`commercial-office-item-guidance.ts`, bump version.

## Findings

### 1. Z2 Territorial — duplicate striping item

Drop this item from `commercial-office-zones.ts` Z2 Territorial Reinforcement:

> "Painted parking space lines, directional arrows, and curb markings are crisp and current rather than faded or obscured"

It duplicates the Z2 Maintenance & Image item:

> "Pavement markings, signs, and curb paint are maintained in legible condition"

Same observable, two principles. Keep the Maintenance one — "legible condition"
reads naturally as maintenance, and Territorial Reinforcement already has the
visitor-parking-distinct + wayfinding-signs items that are genuinely about
ownership signaling.

Also delete the matching guidance Map entry in
`commercial-office-item-guidance.ts`.

### 2. Z4 — re-tag the 10% / 5-ft window obstruction item to interior

Move this item from default (exterior) to the `INTERIOR_ITEMS` set in
`src/data/item-phases.ts`:

> "Ground-floor windows are not obstructed by interior signs, posters, or furniture beyond the 10% / 5-ft CPTED guideline"

Reason: at properties with mirrored or heavily-tinted glazing (common for
commercial office) you can't see the interior from outside at all, so neither
the 10% sign-coverage nor the 5-ft furniture-setback can be verified on the
perimeter walk. Even with clear glass, the inside-out view during the interior
walk is the more reliable check.

Consider also adding a `VERIFICATION_HINTS` entry: "Check from inside — look
at sign coverage on the glazing and verify desks/file cabinets are at least
5 ft back from ground-floor windows." Same pattern as the v0.23.1 SOC/alarm
hints.

### 3. Z3 missing the 2'/6' rule for grounds-area landscaping

The CPTED 2'/6' landscape rule appears in Z1 (perimeter, line 21) and Z2
(parking, line 68) but not in Z3 — even though Z3 is the dedicated
landscaping zone. Z3 currently has the path-unobstructed item, the
overgrown-landscape maintenance item, and the irrigation/drainage item, but
none score the actual 2 ft shrub / 6 ft canopy rule for courtyards, plazas,
walkways, or the building face.

Add to Z3 `natural_surveillance` (matches the principle used in Z1 and Z2):

> "Landscaping along walkways, courtyards, and the building face follows the CPTED 2'/6' rule (shrubs trimmed below 2 ft, tree canopies above 6 ft) so concealment is eliminated and sight lines are preserved"

Also add a matching entry to `commercial-office-item-guidance.ts` —
standard text on sight-line preservation, improvement text on a documented
trimming schedule with the landscape contractor.

### 4. Z9 — explain MDF/IDF in plain language

"MDF" and "IDF" without explanation assume IT fluency. The terms appear in
two scoring items and the Z9 description.

Rename in `commercial-office-zones.ts` (and mirror the item-text keys in
`commercial-office-item-guidance.ts`):

- Line 437: "MDF and IDF telecom closets are locked at all times and access is limited to IT and authorized vendors"
  → "Main and floor-level telecom/network closets (often labeled MDF and IDF) are locked at all times and access is limited to IT and authorized vendors"
- Line 448: "Server room and MDF/IDF rooms are camera-covered with recording"
  → "Server room and telecom/network closets (MDF and IDF rooms) are camera-covered with recording"

Smaller fix in the same pass: the Z9 description (line 422) lists
"server room, MDF/IDF closets, executive suite, HR records..." — soften to
"server room, telecom/network closets (MDF/IDF), executive suite,
HR records..." so first-time readers aren't tripped up before they reach
the items.

Definitions for reference:
- MDF = Main Distribution Frame — the building's primary network/telecom
  termination room where the carrier feed lands.
- IDF = Intermediate Distribution Frame — per-floor (or per-zone) closets
  that branch from the MDF and serve nearby workstations.

### 5. `isNightItem` over-broad — interior lighting items leaking into Night

`isNightItem` matches anything with `principle === 'lighting'`, which sweeps
in interior lighting items (Z7 stairwells, floor lobbies & elevator
vestibules). Combined with v0.23.3's "exclude night items from Interior tab"
rule, those items get hidden from the Interior tab AND surfaced in Night —
where the assessor can't reach them after hours.

Fix in `src/data/item-phases.ts`:

```ts
export function isNightItem(score: ...): boolean {
  if (INTERIOR_ITEMS.has(score.item_text)) return false;  // ← add this
  if (NIGHT_ITEMS.has(score.item_text)) return true;
  if (score.zone_key === 'exterior_lighting') return true;
  if (score.principle === 'lighting') return true;
  return false;
}
```

Logic-only change, no DB schema impact. After fix:

- Z2/Z4 commercial lighting → Night (correct — exterior fixtures)
- Z7 stairwell + elevator-vestibule lighting → Interior only (correct)
- Residential `exterior_lighting` zone → Night (correct, items aren't in INTERIOR_ITEMS)
- Worship/christian Z8 exterior lighting → Night (correct)
