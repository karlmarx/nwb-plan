# Claude Code Prompt: Add Core & Arm Balance Exercises to NWB Plan

Add the following exercises to the nwb-plan app. These are NWB-safe core exercises across three categories. Follow the existing exercise data structure and UI patterns already in the app.

## New Exercise Categories to Add

### Category: TRX Core
Add as a new section/day or integrate into the existing Push-Pull-Legs structure as appropriate.

**TRX Pallof Press** — Standing sideways to anchor on RIGHT leg only. Hold TRX handles at chest, press arms straight out. Anti-rotation core. Left leg hangs as dead weight. Equipment: TRX.

**TRX Standing Rollout** — Face away from anchor on RIGHT leg. Arms in straps overhead, lean forward extending arms. Anti-extension. Left leg trails behind passively. Equipment: TRX.

**TRX Single-Arm Row** — Face anchor on RIGHT leg. Row one arm at a time. Unilateral pull creates anti-rotation demand through core. Alternate arms each set. Left leg hangs. Equipment: TRX.

**TRX Kneeling Rollout** — RIGHT knee on pad, hands in straps. Roll forward extending arms, pull back. Left leg trails behind in hip extension (zero iliopsoas). Equipment: TRX + knee pad.

**TRX Kneeling Chop** — RIGHT knee on pad. Hold handles, rotate trunk through diagonal chop pattern. Rotational core. Left leg trails passively. Equipment: TRX + knee pad.

**TRX Body Saw** — RIGHT foot in strap, forearm plank. Rock body forward and back. Left leg rests on ground as dead weight. Equipment: TRX.

**TRX Side Plank** — RIGHT foot in strap, RIGHT forearm down. Side plank hold. Left leg rests on top of right. Oblique endurance. Equipment: TRX.

### Category: Arm Balance Prep
These build toward crow, side crow, flying pigeon, and other arm balances.

**TRX Knee Tuck (Fig-4 Hook)** — RIGHT foot in TRX strap, LEFT leg hooked eagle/figure-4 behind right calf (passive). Tuck right knee to chest. Lower abs drive the tuck. Left hip stays at fixed angle in hook. Equipment: TRX.

**TRX Body Saw (Fig-4 Hook)** — Same fig-4 hook setup as above. Rock body forward/back in forearm plank. Higher anti-extension demand. Equipment: TRX.

**L-Sit Knee Tuck** — On parallettes. Support hold, drive RIGHT knee up toward chest repeatedly. LEFT leg hangs straight down passively under gravity (no iliopsoas needed — gravity keeps it extended). Compression strength builder. Equipment: Parallettes.

**L-Sit Hold (R Leg Extended)** — On parallettes. Extend RIGHT leg to L-sit position. LEFT leg hangs passive. Hold for time. Equipment: Parallettes.

**Tuck Planche Lean** — On parallettes. RIGHT knee tucked to chest, lean shoulders forward past hands. LEFT leg trails behind in hip extension. Builds forward-lean shoulder loading for arm balances. Equipment: Parallettes.

**Support Hold + Protraction Pulses** — On parallettes or rings. Straight arms, depress & protract scapulae. Pulse protraction in/out. Both legs hang passively. Foundational for crow, side crow, flying pigeon. Equipment: Parallettes or Rings.

### Category: Supine Oblique
**Cross-Body Reach** — Flat on back, legs straight. Reach right hand toward left hip lifting shoulder blade. Alternate sides. Pure thoracic rotation.

**Supine Side Bend (Heel Slide)** — Flat on back, slide hand down toward same-side heel by laterally flexing trunk. Legs stay still.

**Right Knee Drop + Oblique Return** — Right knee bent, foot flat. Let knee fall outward (passive), then use LEFT oblique to pull it back to center. Left leg stays flat.

**Dead Bug — Right Side Only** — Right arm overhead + right knee at ~80° flexion, extend right leg + right arm out simultaneously. Left arm and left leg stay pinned to floor. Anti-rotation demand.

## Safety Rules (apply to ALL exercises above)
- Left leg is ALWAYS passive dead weight — zero left iliopsoas activation
- No weight bearing on left leg
- Hip flexion capped at <90° for bilateral FAI/labral tears
- Fig-4 hook exercises: left hip stays at fixed angle, shortened + externally rotated (iliopsoas mechanically disadvantaged)
- CONTRAINDICATED: Both feet in TRX straps simultaneously (reflexive left iliopsoas firing)
- Exhale before every movement
- Use side-roll method for supine-to-sitting transitions

## Implementation Notes
- Match existing exercise card/row structure with expandable detail panels
- Include equipment tags (TRX, Parallettes, Rings, Knee Pad)
- Include safety warnings in the detail panel
- Each exercise should have the four-section detail panel pattern if that's what the app uses
- Push to main when done
