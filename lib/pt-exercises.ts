// ============================================================================
// LEFT-LEG PT EXERCISES — PWB-ERA SUPPLEMENT EXTENSIONS
// ============================================================================
//
// Drop-in TypeScript snippets to extend `lib/supplements.ts` with the new
// PWB-era PT exercise library. Match the existing file's style: type
// definitions at top, exported const dicts below, plain-string dose strings,
// "setup / execution / nwbCues" pattern preserved.
//
// IMPORTANT — SAFETY INVARIANT CHANGES:
//   The original supplements.ts header asserts ZERO left weight bearing,
//   ZERO left iliopsoas, hip flexion <90° both sides. The PT exercises
//   below RELAX two of those (TTWB now allowed; iliopsoas restriction
//   lifted by MD), but PRESERVE the FAI <90° constraint and add
//   PHASE-GATING. The header in supplements.ts MUST be updated to reflect
//   the new clinical reality before merging — see integration plan.
//
// CONVENTION:
//   - All new types and consts are prefixed `PT_` to distinguish from
//     the legacy NWB-era SUPPLEMENT_* surface.
//   - `PTExercise.phase` is the gating flag: a UI phase-picker filters
//     visible exercises by membership in this array.
//   - `PTExercise.side` documents which leg the exercise loads. The four
//     legal values are "left" | "right" | "bilateral" | "weight-shifted-left".
//   - `frequency` is first-class because PT dosing is daily / EOD / 2-3×wk
//     in a way that bodybuilding sets/reps strings don't capture cleanly.
//
// ============================================================================

// ============================================================================
// TYPES
// ============================================================================

export type RehabPhase = "TTWB" | "PWB-25" | "PWB-50" | "PWB-75" | "FWB";

export type PTFrequency =
  | "daily"
  | "twice-daily"
  | "every-other-day"
  | "3x-week"
  | "2x-week"
  | "1x-week";

export type PTCategory =
  | "glute-activation"
  | "quad-activation"
  | "hip-rotator"
  | "open-chain-knee"
  | "open-chain-hip"
  | "closed-chain-bilateral"
  | "step-work"
  | "balance"
  | "gait-drill"
  | "calf";

export type PTSide =
  | "left"
  | "right"
  | "bilateral"
  | "weight-shifted-left";

export interface PTExercise {
  id: string;
  name: string;
  phase: RehabPhase[];
  category: PTCategory;
  side: PTSide;
  frequency: PTFrequency;
  /** Display dose: "3×10 (10s hold)" — PT-clinic format, free text. */
  sets: string;
  setup: string;
  execution: string;
  /** PT-clinic-style cues (replaces nwbCues for the new PT surface). */
  ptCues: string;
  /** When user is allowed to progress beyond this exercise / dose. */
  progressionCriteria: string;
  /** Specific red-flag override; if absent, fall back to generic red flag list. */
  redFlags?: string;
  /** Citation tag back to .research/left-leg-pt-research.md §6. */
  evidence?: string;
}

// ============================================================================
// GLUTE ACTIVATION
// ============================================================================

const GLUTE_ACTIVATION: PTExercise[] = [
  {
    id: "pt_bilateral_glute_bridge",
    name: "Bilateral Glute Bridge",
    phase: ["TTWB", "PWB-25", "PWB-50", "PWB-75", "FWB"],
    category: "glute-activation",
    side: "bilateral",
    frequency: "daily",
    sets: "3×15 (2s top hold)",
    setup:
      "Supine on mat. Knees bent ~70-80° (keep hip flex ≤80° for FAI). Feet hip-width on the floor. Arms relaxed at sides.",
    execution:
      "Drive both heels into the floor, squeeze glutes, lift hips until shoulders-knees-ankles form a straight line. Pause 2s at top. Lower with control over 3s.",
    ptCues:
      "Glutes do the work — not hamstrings, not low back. If you feel hamstring cramp, your hips are too high or feet too far away. Don't overarch the lumbar spine.",
    progressionCriteria:
      "3×15 clean reps with no shake, no cramp, glutes firing well → progress to 30s top hold OR weight-shifted bridge.",
    evidence: "research §2A, refs 6, 9",
  },
  {
    id: "pt_weight_shifted_bridge_left",
    name: "Weight-Shifted Bridge (Left Bias)",
    phase: ["TTWB", "PWB-25", "PWB-50", "PWB-75", "FWB"],
    category: "glute-activation",
    side: "weight-shifted-left",
    frequency: "every-other-day",
    sets: "2×10",
    setup:
      "Supine. Same setup as bilateral bridge. Place a small towel under right foot to slightly reduce its purchase, biasing weight to the left foot (~60/40).",
    execution:
      "Bridge as normal. The asymmetric foot pressure preferentially loads the left glute max without taking the right foot off the floor.",
    ptCues:
      "Left side feels like it's working harder. Hips stay LEVEL — don't tip toward the right. Slow eccentric is where the glute med earns its keep.",
    progressionCriteria:
      "Add only after bilateral bridge is 3×15 clean. Advance to a true single-leg bridge (right foot in air) only after FWB and PT clearance.",
    evidence: "research §2A",
  },
  {
    id: "pt_side_lying_hip_abduction_left",
    name: "Side-Lying Hip Abduction (Left Side Up)",
    phase: ["TTWB", "PWB-25", "PWB-50", "PWB-75", "FWB"],
    category: "glute-activation",
    side: "left",
    frequency: "daily",
    sets: "3×15",
    setup:
      "Lie on right side. Stack hips, slightly bend bottom (right) knee for stability. Top (left) leg straight. Keep hips perpendicular to floor — don't roll backward.",
    execution:
      "Lift left leg straight up to ~30-40° (hip-width above the bottom leg). Lead with the heel, toes pointed slightly DOWN (bias glute med, not TFL). Pause 1s at top. Lower with control over 3s.",
    ptCues:
      "Heel-up rotation is the cue that targets glute med. If you feel it in the front/outside of the thigh, that's TFL — re-cue heel up, toes down. Don't tip your pelvis backward.",
    progressionCriteria:
      "3×15 each side clean → add light mini-band around lower thighs.",
    redFlags:
      "Left lateral hip pain or ITB pain → reduce range, re-cue heel-up, or stop and notify PT.",
    evidence:
      "research §2A, refs 9, 10 — side-lying hip abduction reaches ~80% MVIC of glute med, the strongest evidence-based glute med exercise.",
  },
  {
    id: "pt_side_lying_hip_abduction_right",
    name: "Side-Lying Hip Abduction (Right Side Up)",
    phase: ["TTWB", "PWB-25", "PWB-50", "PWB-75", "FWB"],
    category: "glute-activation",
    side: "right",
    frequency: "daily",
    sets: "3×15",
    setup:
      "Lie on left side. Stack hips. Top (right) leg straight, bottom (left) leg slightly bent for stability.",
    execution:
      "Lift right leg straight up to ~30-40°, lead with heel. Pause 1s. Lower 3s.",
    ptCues:
      "Right is your stance leg through this whole phase. Treat it like the priority. Same heel-up cue as left side.",
    progressionCriteria: "Same as left side.",
    evidence: "research §2A",
  },
  {
    id: "pt_clamshell_left",
    name: "Clamshell (Left Side Up)",
    phase: ["TTWB", "PWB-25", "PWB-50", "PWB-75", "FWB"],
    category: "glute-activation",
    side: "left",
    frequency: "daily",
    sets: "2×15",
    setup:
      "Side-lying on right. Hips/knees stacked. Knees bent ~45° (NOT 90° — keeps hip flex < 60° for FAI). Heels stay together.",
    execution:
      "Open top knee like a clamshell. Pause 2s at top. Close with control. Don't roll the pelvis backward — keep hips perpendicular to floor.",
    ptCues:
      "If the pelvis rolls back, you're cheating with the obliques. Place a wall behind your back if you struggle to feel it.",
    progressionCriteria:
      "Add a mini-band above knees → progress to side-lying clam-raise (clam + simultaneous abduction).",
    evidence:
      "research §2A, ref 11 — clamshell heavily activates TFL/anterior hip flexors per Selkowitz et al. *JOSPT* 2013, so this is a complement to side-lying abduction, not a replacement.",
  },
  {
    id: "pt_clamshell_right",
    name: "Clamshell (Right Side Up)",
    phase: ["TTWB", "PWB-25", "PWB-50", "PWB-75", "FWB"],
    category: "glute-activation",
    side: "right",
    frequency: "daily",
    sets: "2×15",
    setup:
      "Side-lying on left. Same form as left side: knees bent ~45°, heels together.",
    execution: "Open top (right) knee. Pause 2s. Close with control.",
    ptCues:
      "Right hip stability matters during gait — don't skip this side just because the left is the injured one.",
    progressionCriteria: "Same as left side.",
    evidence: "research §2A",
  },
];

// ============================================================================
// QUAD ACTIVATION (open-chain, no axial load)
// ============================================================================

const QUAD_ACTIVATION: PTExercise[] = [
  // Note: "Quad Sets", "Short Arc Quads", and "Banded Terminal Knee Extensions"
  // already exist in SUPPLEMENT_EX — re-export here with PT framing for the
  // PT surface. Either alias or re-key into PT_EXERCISES at integration time;
  // see integration plan.
  {
    id: "pt_quad_set_left",
    name: "Quad Set (Left)",
    phase: ["TTWB", "PWB-25", "PWB-50", "PWB-75", "FWB"],
    category: "quad-activation",
    side: "left",
    frequency: "twice-daily",
    sets: "3×10 (5-10s hold)",
    setup:
      "Sit or lie supine with left leg extended. Roll a small towel under left knee for comfort.",
    execution:
      "Press back of left knee firmly into the surface (towel/floor/seat). Hold 5-10 seconds. Release fully. Repeat 10×.",
    ptCues:
      "Pure isometric. Quad should feel rock-hard during hold. Place a finger on the inside of the quad (VMO) to confirm activation.",
    progressionCriteria:
      "3×10 with 10s holds clean → progress to 3-4×20 (per Bend+Mend dosing). Stays daily through ALL phases.",
    evidence: "research §2A, ref 13",
  },
  {
    id: "pt_short_arc_quad_left",
    name: "Short Arc Quad (Left)",
    phase: ["TTWB", "PWB-25", "PWB-50", "PWB-75", "FWB"],
    category: "quad-activation",
    side: "left",
    frequency: "daily",
    sets: "3×12",
    setup:
      "Sit or lie supine. Roll a foam roller or large towel under left knee, creating ~30° of bend.",
    execution:
      "Slowly straighten left knee from 30° to full extension. Hold 1s at top. Lower over 3s.",
    ptCues:
      "Last 30° of extension only — keeps it pure quad, minimal hip involvement. VMO emphasis.",
    progressionCriteria:
      "3×12 with bodyweight clean → add light ankle weight. Progress to 3-4×20 reps.",
    evidence: "research §2A",
  },
  {
    id: "pt_banded_tke_left",
    name: "Banded Terminal Knee Extension (Left)",
    phase: ["TTWB", "PWB-25", "PWB-50", "PWB-75", "FWB"],
    category: "quad-activation",
    side: "left",
    frequency: "every-other-day",
    sets: "3×15 (3s eccentric)",
    setup:
      "Sit or stand (with crutch support if standing). Resistance band looped behind left knee, anchored at low height ahead of you.",
    execution:
      "Starting with knee slightly bent against band tension, extend left knee to lockout. Squeeze quad 1s. Lower over 3s.",
    ptCues:
      "Band should pull KNEE forward (causing bend); your quad pulls it back to extension. Pure terminal knee extension — no hip flex demand.",
    progressionCriteria:
      "3×15 with current band → step to a heavier band, OR move closer to anchor for more tension.",
    evidence: "research §2A",
  },
  {
    id: "pt_supine_slr_left",
    name: "Straight-Leg Raise (Left, Supine)",
    phase: ["TTWB", "PWB-25", "PWB-50", "PWB-75", "FWB"],
    category: "open-chain-hip",
    side: "left",
    frequency: "daily",
    sets: "3×10 (3s eccentric)",
    setup:
      "Supine on mat. Right knee bent with foot flat (protects low back). Left leg straight on the floor. Ankle dorsiflexed (toes up).",
    execution:
      "Tighten the quad (quad set first) — THEN lift left leg ~12-18 inches off floor in one smooth motion. Hold 2s. Lower with control over 3s.",
    ptCues:
      "Quad set FIRST so the knee stays locked — a bent knee on the way up means the hip flexors are stealing the work. Don't let lumbar arch off the mat.",
    progressionCriteria:
      "3×10 pain-free → add light ankle weight. NEW: this exercise is the Boden re-evaluation gate. If it ever becomes painful, that's a hard stop.",
    redFlags:
      "Left groin pain during or after SLR → STOP. This is the Boden re-evaluation trigger. Drop to NWB and call PT/MD.",
    evidence:
      "research §2A. Per MD clearance the iliopsoas restriction is lifted, so SLR is now safe — but the SLR pain test remains the most reliable bedside fracture-progression check.",
  },
  {
    id: "pt_supine_slr_right",
    name: "Straight-Leg Raise (Right, Supine)",
    phase: ["TTWB", "PWB-25", "PWB-50", "PWB-75", "FWB"],
    category: "open-chain-hip",
    side: "right",
    frequency: "daily",
    sets: "3×10 (3s eccentric)",
    setup:
      "Supine on mat. Left knee bent with foot flat (no left iliopsoas demand from the moving leg here, but bilateral SLR work matters). Right leg straight.",
    execution: "Same as left side. Quad set first, lift, hold 2s, lower 3s.",
    ptCues: "Right side is your stance leg — strength here matters.",
    progressionCriteria: "Same as left side.",
    evidence: "research §2A",
  },
];

// ============================================================================
// HIP ROTATORS
// ============================================================================

const HIP_ROTATORS: PTExercise[] = [
  {
    id: "pt_supine_hip_er_isometric",
    name: "Supine Hip ER Isometric",
    phase: ["TTWB", "PWB-25", "PWB-50", "PWB-75", "FWB"],
    category: "hip-rotator",
    side: "bilateral",
    frequency: "daily",
    sets: "2×10 (5s hold)",
    setup:
      "Supine. Knees bent ~70°, feet flat hip-width. Mini-band looped above the knees.",
    execution:
      "Press knees outward against the band (external rotation). Hold 5s. Release fully.",
    ptCues:
      "Hips/pelvis stay neutral — the legs work, not the spine. Keep heels in contact with floor.",
    progressionCriteria:
      "2×10 with 5s holds clean → progress to 3×10 with 10s holds, OR step to a heavier band.",
    evidence: "research §2A",
  },
  {
    id: "pt_supine_hip_ir_isometric",
    name: "Supine Hip IR Isometric",
    phase: ["TTWB", "PWB-25", "PWB-50", "PWB-75", "FWB"],
    category: "hip-rotator",
    side: "bilateral",
    frequency: "daily",
    sets: "2×10 (5s hold)",
    setup:
      "Supine. Knees bent ~70°, feet flat. Cross right ankle over top of left knee (or vice versa).",
    execution:
      "Drive top knee inward toward bottom knee (internal rotation). Hold 5s. Release.",
    ptCues:
      "If you feel any pinch in the hip crease, BACK OFF — could be FAI. Stay in a comfortable arc.",
    progressionCriteria:
      "Pain-free 2×10 with 5s holds → cleared to add cable hip IR/ER work in the gym.",
    redFlags: "Hip crease pinch on either side — back off. May indicate FAI provocation.",
    evidence: "research §2A",
  },
];

// ============================================================================
// CLOSED-CHAIN BILATERAL (PWB onward)
// ============================================================================

const CLOSED_CHAIN_BILATERAL: PTExercise[] = [
  {
    id: "pt_wall_sit",
    name: "Wall Sit (Bilateral, Shallow)",
    phase: ["PWB-25", "PWB-50", "PWB-75", "FWB"],
    category: "closed-chain-bilateral",
    side: "bilateral",
    frequency: "every-other-day",
    sets: "2-3×30s",
    setup:
      "Back flat against wall. Feet 12-18 inches away from wall, hip-width. Slide down to ~60-75° knee bend (keep HIP FLEX < 90°).",
    execution: "Hold the position. Knees track over toes — don't let them collapse inward.",
    ptCues:
      "Quad burn is the goal. If pressure is felt in left groin or front of left hip, you're too deep — slide back up.",
    progressionCriteria:
      "2×30s clean → 2×60s → add a single dumbbell held at chest → progress to mini-squats.",
    redFlags: "Any left groin or anterior hip pain → stop, return to TTWB/PWB-25 dosing.",
    evidence: "research §2B",
  },
  {
    id: "pt_mini_squat",
    name: "Mini-Squat (Bilateral, 0-30°)",
    phase: ["PWB-50", "PWB-75", "FWB"],
    category: "closed-chain-bilateral",
    side: "bilateral",
    frequency: "every-other-day",
    sets: "3×10 (3s eccentric, 1s pause, 2s up)",
    setup:
      "Stand, feet hip-width. Light support (counter, rail, or stable chair back) for balance with one hand.",
    execution:
      "Slow descent over 3s to ~30° knee flex (well above parallel). Pause 1s. Stand 2s.",
    ptCues:
      "Knees track over toes. Weight even between both feet — feel for any lateral drift toward the right (compensation).",
    progressionCriteria:
      "3×10 pain-free, no compensation → drop the rail support → deepen to 60° knee flex → add dumbbell load.",
    evidence: "research §2B",
  },
  {
    id: "pt_squat_to_high_chair",
    name: "Bodyweight Squat to High Chair",
    phase: ["PWB-50", "PWB-75", "FWB"],
    category: "closed-chain-bilateral",
    side: "bilateral",
    frequency: "every-other-day",
    sets: "3×8",
    setup:
      "Tall chair (kitchen-counter height) behind you. Stand with feet hip-width, toes slightly out.",
    execution:
      "Sit back to the chair with control over 3s. Lightly tap the chair seat. Stand back up.",
    ptCues:
      "Sit back, not down — drive the hips back first. The chair gates depth so you can't accidentally exceed hip flex 90°.",
    progressionCriteria:
      "3×8 clean → lower the chair height by 2 inches every 1-2 weeks until at standard chair height.",
    evidence: "research §2B",
  },
];

// ============================================================================
// STEP WORK (PWB-50+)
// ============================================================================

const STEP_WORK: PTExercise[] = [
  {
    id: "pt_step_up_4in_right",
    name: "Step-Up onto 4-inch Box (Right Drive)",
    phase: ["PWB-50", "PWB-75", "FWB"],
    category: "step-work",
    side: "right",
    frequency: "every-other-day",
    sets: "2×10",
    setup:
      "4-inch box or aerobic step. Stand directly in front. Light rail support if needed (1-2 fingers).",
    execution:
      "Place RIGHT foot on box. Drive through right heel to bring left foot up beside right (left is just along for the ride — DO NOT push off with it). Step down to start. Keep hip-flex < 90° throughout.",
    ptCues:
      "Right glute does the work. Watch yourself in a mirror — if your left side of pelvis drops as you stand up, that's Trendelenburg → drop to a lower box or do more glute med work first.",
    progressionCriteria:
      "2×10 clean with no Trendelenburg → progress to 6-inch → 8-inch box. Right-leg step-up onto 8-inch is the gate per Brigham/MGH hip arthroscopy protocol.",
    redFlags:
      "Left-side pelvic drop (Trendelenburg) → glute med insufficiency, not yet ready for this height.",
    evidence: "research §2B, ref 6 — Brigham/MGH 8-inch step-up advancement criterion.",
  },
  {
    id: "pt_step_down_4in_right",
    name: "Forward Step-Down (Right Eccentric)",
    phase: ["PWB-50", "PWB-75", "FWB"],
    category: "step-work",
    side: "right",
    frequency: "every-other-day",
    sets: "2×8",
    setup:
      "Stand on a 4-inch box with RIGHT foot. Left foot hangs in front off the box.",
    execution:
      "Slowly lower the left heel toward the floor over 3s, using right-leg eccentric quad/glute control. Tap the heel lightly. Press back up.",
    ptCues:
      "Right knee tracks over toes — don't let it collapse inward. Keep right hip level — don't let left side of pelvis drop.",
    progressionCriteria:
      "2×8 with no compensation → progress to 6-inch → 8-inch.",
    evidence: "research §2B",
  },
  {
    id: "pt_step_up_4in_left",
    name: "Step-Up onto 4-inch Box (LEFT Drive — FWB ONLY)",
    phase: ["FWB"],
    category: "step-work",
    side: "left",
    frequency: "every-other-day",
    sets: "2×8",
    setup:
      "4-inch box. Stand in front. Mirror-feedback essential. Light rail support OK initially.",
    execution:
      "LEFT foot on box. Drive through left heel to bring right foot up beside left. Step down. Hip-flex < 90° throughout.",
    ptCues:
      "This is the first true single-leg-LEFT loaded exercise. Watch for any Trendelenburg, knee-cave, or hip-shift compensation. STOP at the first sign.",
    progressionCriteria:
      "DEFER until ≥ 1 week of pain-free FWB walking AND PT clearance. 2×8 clean → 6-inch → 8-inch.",
    redFlags:
      "ANY left groin pain → STOP. Drop back to bilateral closed-chain work. Notify PT.",
    evidence: "research §2C",
  },
];

// ============================================================================
// HIP THRUST PROGRESSION
// ============================================================================

const HIP_THRUST_FAMILY: PTExercise[] = [
  {
    id: "pt_bilateral_hip_thrust_loaded",
    name: "Bilateral Hip Thrust (Loaded)",
    phase: ["TTWB", "PWB-25", "PWB-50", "PWB-75", "FWB"],
    category: "glute-activation",
    side: "bilateral",
    frequency: "2x-week",
    sets: "3×8-10 @ RPE 6-7",
    setup:
      "Upper back on a bench, both feet on floor hip-width, knees bent ~90°. Barbell, hip-thrust machine, or dumbbells across hips.",
    execution:
      "Drive both heels into floor. Squeeze glutes to lift hips until torso-thighs are parallel. Pause 1s top. Lower with control.",
    ptCues:
      "Top position: hip-flex stays UNDER 90° (FAI). Don't hyperextend lumbar to chase height. Glutes squeeze HARD at top.",
    progressionCriteria:
      "3 sessions pain-free at current load → +5-10 lb. 10% rule applies on weekly load.",
    evidence: "research §2A, refs 22, 23",
  },
  {
    id: "pt_single_leg_hip_thrust_right",
    name: "Single-Leg Hip Thrust (Right Drive Only)",
    phase: ["PWB-50", "PWB-75", "FWB"],
    category: "glute-activation",
    side: "right",
    frequency: "1x-week",
    sets: "2×8 / right side",
    setup:
      "Upper back on bench. Cross LEFT ankle over right knee, OR extend left leg out straight. Right foot flat, knee ~90°.",
    execution:
      "Drive purely through right heel. Lift hips to top. Left leg is a NON-LOADING rider — never pushes.",
    ptCues:
      "Builds right glute strength (your stance leg). If hips wobble laterally, drop the load.",
    progressionCriteria:
      "3×10/right clean → introduce B-stance with left foot down (~30% load on left).",
    evidence: "research §2B, ref 23",
  },
  {
    id: "pt_b_stance_hip_thrust_left_bias",
    name: "B-Stance Hip Thrust (Left Bias) — FWB ONLY",
    phase: ["FWB"],
    category: "glute-activation",
    side: "weight-shifted-left",
    frequency: "1x-week",
    sets: "2×8 / left side (~70% load on left)",
    setup:
      "Upper back on bench. LEFT foot fully planted hip-width. RIGHT foot's heel slightly forward and ONLY toes touching (assist, not drive). Per Onnit dosing: ~70% load on left, 30% on right.",
    execution:
      "Drive primarily through left heel. Right toes are stabilizers. Lift to top. 1s pause. Lower 3s.",
    ptCues:
      "First time the LEFT leg drives a closed-chain loaded movement. Start UNLOADED (bodyweight only) and confirm pain-free for ≥ 1 session before adding weight.",
    progressionCriteria:
      "Bodyweight 2×8 pain-free → add light DB across hips → 10% rule on weekly load. Eventually progress to true single-leg-LEFT hip thrust.",
    redFlags:
      "Left groin pain or anterior hip pain — STOP. Drop back to bilateral. Notify PT.",
    evidence: "research §2C, ref 22",
  },
];

// ============================================================================
// BALANCE / PROPRIOCEPTION
// ============================================================================

const BALANCE: PTExercise[] = [
  {
    id: "pt_single_leg_balance_right",
    name: "Single-Leg Balance (Right)",
    phase: ["TTWB", "PWB-25", "PWB-50", "PWB-75", "FWB"],
    category: "balance",
    side: "right",
    frequency: "daily",
    sets: "3×30s",
    setup:
      "Stand on RIGHT leg. Left foot lightly tapping floor or held off ground. Light fingertip support on rail/counter if needed.",
    execution:
      "Maintain balance for 30s. Eyes can scan around naturally. Progress: eyes open → eyes closed → on a foam pad → with arm reaches.",
    ptCues:
      "Stance-leg proprioception. The right leg is your workhorse — don't skip this.",
    progressionCriteria:
      "30s eyes-open clean → 30s eyes-closed → foam pad → arm reaches.",
    evidence: "research §2B",
  },
  {
    id: "pt_single_leg_balance_left",
    name: "Single-Leg Balance (Left) — FWB ONLY",
    phase: ["FWB"],
    category: "balance",
    side: "left",
    frequency: "daily",
    sets: "3×30s",
    setup:
      "Stand on LEFT leg. Right foot off ground or lightly tapping. Fingertip support OK initially.",
    execution: "30s hold. Eyes open initially. No bouncing or hopping.",
    ptCues:
      "Defer until ≥ 1 week of pain-free FWB walking. First session: stay near a rail. Watch for Trendelenburg in mirror.",
    progressionCriteria:
      "Same progression as right side, but ALWAYS one phase behind (left leg is the injured side — err on the side of caution).",
    redFlags: "Any left groin pain or sense of instability → step off, contact PT.",
    evidence: "research §2C",
  },
];

// ============================================================================
// GAIT DRILLS
// ============================================================================

const GAIT_DRILLS: PTExercise[] = [
  {
    id: "pt_static_weight_shift",
    name: "Static Weight-Shift in Standing",
    phase: ["TTWB", "PWB-25", "PWB-50"],
    category: "gait-drill",
    side: "bilateral",
    frequency: "daily",
    sets: "2×10 shifts",
    setup:
      "Stand with crutches, both feet flat. Mirror-feedback recommended.",
    execution:
      "Slowly shift weight side-to-side. Stay within current PWB envelope (TTWB: light \"potato chip\" pressure; PWB: per crutch loading).",
    ptCues:
      "Don't exceed your prescribed weight-bearing percentage on the left. Use a bathroom scale at first if uncertain.",
    progressionCriteria:
      "Symmetric, smooth shifts within current envelope → graduate to next PWB sub-stage when pain-free.",
    redFlags:
      "Pain on weight-shift specifically with left-leg loading at any percentage — left femoral neck not ready. Drop one stage and call PT.",
    evidence: "research §2A",
  },
  {
    id: "pt_sit_to_stand_high",
    name: "Sit-to-Stand from High Chair",
    phase: ["TTWB", "PWB-25", "PWB-50", "PWB-75"],
    category: "gait-drill",
    side: "bilateral",
    frequency: "daily",
    sets: "2×8",
    setup:
      "Tall chair (kitchen-counter or bar-stool height). Feet flat, hip-width.",
    execution:
      "Stand using BOTH legs evenly. Sit with control over 3s. Hands on chair arms or knees for assist; progress to no hands.",
    ptCues:
      "Re-grooves bilateral closed-chain pattern. High chair = shallow hip flexion = easy on hip.",
    progressionCriteria:
      "2×8 no-hands clean → lower chair height progressively until standard chair height.",
    evidence: "research §2A",
  },
  {
    id: "pt_tandem_walk",
    name: "Tandem Walking (Heel-to-Toe)",
    phase: ["PWB-25", "PWB-50", "PWB-75", "FWB"],
    category: "gait-drill",
    side: "bilateral",
    frequency: "daily",
    sets: "5-10 hallway lengths",
    setup:
      "Start in a hallway with light wall touch available. With or without crutches per current PWB level.",
    execution:
      "Walk heel-to-toe, each step placing the heel directly in front of the previous toe. Mirror-feedback or phone camera is gold here.",
    ptCues:
      "Watch for any Trendelenburg or hip-hike on the left. Tall posture, equal step length, foot-strike beneath COM.",
    progressionCriteria:
      "Smooth tandem walk both directions → forward/backward/lateral walking drills.",
    evidence: "research §2B",
  },
  {
    id: "pt_pelvic_drop_drill",
    name: "Pelvic Drop / Trendelenburg Corrective",
    phase: ["PWB-50", "PWB-75", "FWB"],
    category: "gait-drill",
    side: "right",
    frequency: "every-other-day",
    sets: "2×10 reps",
    setup:
      "Stand on RIGHT leg on a small step or thick book. LEFT foot dangles off the side. Mirror in front.",
    execution:
      "Slowly drop left side of pelvis ~5° toward floor. Re-level by contracting RIGHT glute med. Watch yourself in mirror.",
    ptCues:
      "Right glute med is what re-levels the pelvis. If you can't re-level, reduce range or step off.",
    progressionCriteria:
      "2×10 with smooth control → graduate to standing banded hip abduction.",
    evidence:
      "research §2B, ref 12 — gluteal activation reduces acetabular contact pressure ~32% in cam-FAI.",
  },
];

// ============================================================================
// CALF
// ============================================================================

const CALF: PTExercise[] = [
  {
    id: "pt_seated_calf_raise_bilateral",
    name: "Seated Calf Raise (Bilateral)",
    phase: ["TTWB", "PWB-25", "PWB-50", "PWB-75", "FWB"],
    category: "calf",
    side: "bilateral",
    frequency: "3x-week",
    sets: "3×15",
    setup:
      "Seated on a bench, both feet flat. Place a plate on lap or use a calf-raise machine.",
    execution:
      "Press up onto balls of feet. Hold 1s at top. Lower over 3s until heels touch floor.",
    ptCues:
      "Seated = soleus emphasis, no axial femur load. Critical for gait quality return.",
    progressionCriteria:
      "3×15 with current load → +5 lb. Once FWB cleared, transition to standing calf raise (bilateral first).",
    evidence: "research §2A",
  },
  {
    id: "pt_standing_calf_raise_bilateral",
    name: "Standing Calf Raise (Bilateral) — FWB ONLY",
    phase: ["FWB"],
    category: "calf",
    side: "bilateral",
    frequency: "3x-week",
    sets: "3×12",
    setup:
      "Stand on a step or flat ground, feet hip-width. Hands on rail for balance.",
    execution: "Press up onto balls of feet. Pause 1s top. Lower 3s.",
    ptCues:
      "Equal weight both feet. Don't shift to right side. Defer single-leg-LEFT calf raise until well into FWB and PT clearance.",
    progressionCriteria:
      "3×12 bilateral clean → 3×12 single-leg RIGHT → eventually single-leg LEFT.",
    evidence: "research §2C",
  },
];

// ============================================================================
// AGGREGATE EXPORT
// ============================================================================

export const PT_EXERCISES: Record<string, PTExercise> = Object.fromEntries(
  [
    ...GLUTE_ACTIVATION,
    ...QUAD_ACTIVATION,
    ...HIP_ROTATORS,
    ...CLOSED_CHAIN_BILATERAL,
    ...STEP_WORK,
    ...HIP_THRUST_FAMILY,
    ...BALANCE,
    ...GAIT_DRILLS,
    ...CALF,
  ].map((ex) => [ex.id, ex]),
);

// ============================================================================
// PHASE FILTER HELPER
// ============================================================================

/**
 * Filter PT_EXERCISES by current rehab phase.
 * UI calls this to render only phase-appropriate exercises.
 */
export function getPTExercisesForPhase(phase: RehabPhase): PTExercise[] {
  return Object.values(PT_EXERCISES).filter((ex) => ex.phase.includes(phase));
}

/**
 * Group exercises by category for UI sectioning.
 */
export function groupPTByCategory(
  exercises: PTExercise[],
): Record<PTCategory, PTExercise[]> {
  const out = {} as Record<PTCategory, PTExercise[]>;
  for (const ex of exercises) {
    (out[ex.category] ||= []).push(ex);
  }
  return out;
}
