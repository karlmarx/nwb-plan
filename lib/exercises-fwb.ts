// ============================================================================
// FWB (Full Weight-Bearing) phase additions
// ----------------------------------------------------------------------------
// 2026-05 full clearance: full weight-bearing, unrestricted resistance
// training. These are the FWB lifts that are part of the PT program — squat,
// leg press, single- and double-leg kettlebell RDL, BFR glute bridges, calf
// raises. No left/right asymmetry restriction and NO load cap remain;
// bilateral and single-leg loading on BOTH sides is cleared. Train like a
// healthy, fit lifter — progress load by feel and PT guidance.
//
// Every entry carries `phaseUnlock: "FWB-2026-05"` so the UI renders an "FWB"
// badge. Pattern matches lib/exercises-pwb.ts: this file exports FWB_ADDITIONS
// and is `Object.assign`-merged into the main EX dictionary at the bottom of
// lib/exercises.ts. None of the existing entries in lib/exercises.ts change.
// ============================================================================

import type { Exercise } from "./exercises";

const FWB: "FWB-2026-05" = "FWB-2026-05";

export const FWB_ADDITIONS: Record<string, Exercise> = {
  // ==================== QUAD / SQUAT ====================

  "Bilateral Squat": {
    id: "squat_bilateral_fwb",
    name: "Bilateral Squat",
    requires: ["barbell"],
    category: "legs",
    sets: [["3", "6-8"], ["3", "6-8"], ["3", "8-10"]],
    rest: 150,
    tempo: "3-1-1",
    setup:
      "Bar on the upper traps (high-bar) or rear delts (low-bar) in a rack, safeties set just below depth. Feet shoulder-width, toes slightly out, weight even across both feet. Brace, big breath in.",
    execution:
      "Sit down and back, knees tracking over the toes, to at least parallel (deeper if it feels good). Drive evenly through both feet to stand. Even split left and right — no favoring.",
    nwbCues:
      "Both legs share the load equally — stand up by pushing the floor away with BOTH feet. Pick a weight you can own for clean reps and progress it like any lifter; no cap.",
    why: "The big bilateral knee+hip extension pattern — the foundation lift for rebuilding lower-body strength.",
    safety: "safe",
    phaseUnlock: FWB,
    swaps: ["Bilateral Leg Press", "TRX Squat (Bilateral)", "Hack Squat (Right)"],
    amp: [
      "BASE: Clean, controlled reps to parallel.",
      "AMP 1: 3-second eccentric, no bounce out of the hole.",
      "AMP 2: 2-second pause at the bottom before driving up.",
    ],
    machineVariants: [
      {
        id: "barbell_back_squat",
        label: "Barbell Back Squat",
        icon: "\u{1F3CB}️",
        description: "Free-weight back squat in a rack",
        setupCues: [
          "Set safety pins just below your bottom depth",
          "Bar on traps (high-bar) or rear delts (low-bar)",
          "Feet shoulder-width, toes slightly out",
        ],
        status: "preferred",
      },
      {
        id: "smith_squat",
        label: "Smith Machine Squat",
        icon: "\u{1F6E0}️",
        description: "Fixed-bar path for more stability",
        setupCues: [
          "Feet slightly forward of the bar line",
          "Brace, unrack with a small twist",
          "The fixed path lets you push depth confidently",
        ],
        requires: ["smith"],
        status: "secondary",
      },
      {
        id: "goblet_squat",
        label: "Goblet Squat",
        icon: "\u{1F3FA}",
        description: "Dumbbell/kettlebell at the chest — easy to scale",
        setupCues: [
          "Hold one dumbbell or kettlebell vertical against the chest",
          "Elbows inside the knees at the bottom",
          "Great for higher-rep volume days",
        ],
        requires: ["dumbbells"],
        status: "secondary",
      },
    ],
    constraints: { requiresIliopsoas: false, maxHipFlexion: 130, requiresWeightBearing: true },
    movementTags: [
      "weight_bearing_bilateral",
      "closed_chain",
      "deep_squat",
      "knee_flexion_over_90",
      "standing",
      "valsalva_required",
    ],
    muscles: {
      primary: ["quadriceps", "gluteus maximus"],
      secondary: ["adductor magnus", "erector spinae", "hamstrings"],
    },
  },

  "TRX Squat (Bilateral)": {
    id: "trx_squat_bilateral",
    name: "TRX Squat (Bilateral)",
    requires: ["trx"],
    category: "legs",
    sets: [["3", "12-15"], ["3", "10-12"], ["3", "8-10"]],
    rest: 90,
    tempo: "3-1-1",
    setup:
      "Anchor TRX overhead. Stand bilateral, hip-width, facing the anchor. Grip both handles, arms extended at chest height. Lean back slightly so the straps are taut.",
    execution:
      "Sit straight back and down, chest tall — the TRX assists as much or as little as you want (more lean-back = more assistance). Drive through both heels to stand. Knees track over toes, heels planted.",
    nwbCues:
      "A scalable bilateral squat — use the strap tension to dial difficulty (deep lean-back for an easy deload, near-vertical for full bodyweight). Both heels stay planted, even load left and right.",
    why: "The lowest-load bilateral squat pattern — great as a warm-up, a higher-rep finisher, or a deload option on heavy-squat days.",
    safety: "safe",
    phaseUnlock: FWB,
    swaps: ["Bilateral Squat", "Bilateral Leg Press", "Hack Squat (Right)"],
    amp: [
      "BASE: Moderate lean-back, body weight, 3-sec eccentric.",
      "AMP 1: Less lean-back (more vertical = less assistance).",
      "AMP 2: Pause-squat — 3-sec pause at the bottom before driving up.",
    ],
    constraints: { requiresIliopsoas: false, maxHipFlexion: 110, requiresWeightBearing: true },
    movementTags: [
      "weight_bearing_bilateral",
      "closed_chain",
      "knee_flexion_over_90",
      "standing",
    ],
    muscles: {
      primary: ["quadriceps", "gluteus maximus"],
      secondary: ["hamstrings", "hip adductors", "gastrocnemius", "rectus abdominis"],
    },
  },

  "Bilateral Leg Press": {
    id: "bilateral_leg_press_fwb",
    name: "Bilateral Leg Press",
    requires: ["legpress"],
    category: "legs",
    sets: [["3", "8-10"], ["3", "10-12"], ["3", "12-15"]],
    rest: 120,
    tempo: "2-1-2",
    setup:
      "Sit in the leg press, both feet mid-platform shoulder-width, back and hips flat against the pad. Release the safeties.",
    execution:
      "Lower the platform under control until the knees reach ~90° (or deeper if comfortable), then press back evenly through both feet without locking out hard. Keep the load even left to right.",
    nwbCues:
      "Both legs, even drive — push through the whole foot, heels down. Load it like a normal training lift and progress it; no cap.",
    why: "Closed-chain bilateral quad/glute loading with the back supported — lets you push heavier load than free squats. A staple leg builder.",
    safety: "safe",
    phaseUnlock: FWB,
    swaps: ["Bilateral Squat", "SL Leg Press (Right)", "Bilateral Leg Extension"],
    amp: [
      "BASE: Even tempo, controlled.",
      "AMP 1: 3-second eccentric.",
      "AMP 2: Rest-pause — to failure, 15s rest, squeeze out 3-5 more.",
    ],
    machineVariants: [
      {
        id: "45_sled",
        label: "45° Sled (Incline)",
        icon: "\u{1F9B5}",
        description: "Standard 45° incline sled leg press",
        setupCues: [
          "Feet centered or slightly high on the plate, hip-width",
          "Mid-foot or slightly toed-out",
          "Back flat against the pad",
        ],
      },
      {
        id: "seated_horizontal",
        label: "Seated/Horizontal",
        icon: "\u{1F4BA}",
        description: "Seated or horizontal leg press machine",
        setupCues: [
          "Both feet centered on the press plate, hip-width apart",
          "Set seat depth for a comfortable bottom position",
        ],
      },
    ],
    constraints: { requiresIliopsoas: false, maxHipFlexion: 110, requiresWeightBearing: true },
    movementTags: [
      "weight_bearing_bilateral",
      "closed_chain",
      "knee_flexion_45_to_90",
      "hip_flexion_45_to_90",
      "seated",
    ],
    muscles: {
      primary: ["quadriceps", "gluteus maximus"],
      secondary: ["hamstrings", "hip adductors", "gastrocnemius"],
    },
  },

  // ==================== POSTERIOR CHAIN ====================

  "RDL (Kettlebell, Bilateral)": {
    id: "rdl_kb_bilateral",
    name: "RDL (Kettlebell, Bilateral)",
    requires: ["kettlebell"],
    category: "legs",
    sets: [["3", "10-12"], ["3", "8-10"], ["3", "6-8"]],
    rest: 90,
    tempo: "3-1-1",
    setup:
      "Stand hip-width holding a kettlebell (or two) at the hips with both hands. Soft knee bend, neutral spine, ribs stacked over pelvis.",
    execution:
      "Hinge at the hips, pushing the bell straight down the front of the thighs. Knees stay soft — this is a hinge, not a squat. Lower until you feel a strong hamstring stretch (around mid-shin). Drive through both heels to stand, squeeze glutes, pause 1 sec at the top. 3-sec eccentric.",
    nwbCues:
      "Both feet share the weight evenly. Neutral spine throughout — no rounding. Drive through the heels, not the toes. Load it and progress it like normal; depth is set by your hamstring flexibility.",
    why: "Hip hinge is the foundation of every standing posterior-chain movement. Bilateral KB RDL is the primary hamstring/glute strength builder and the double-leg counterpart to the single-leg version.",
    safety: "safe",
    phaseUnlock: FWB,
    swaps: ["Single-Leg KB RDL", "Bilateral Seated Leg Curl", "Bilateral Hip Thrust"],
    amp: [
      "BASE: Single kettlebell, both hands, slow even tempo.",
      "AMP 1: Pair of kettlebells (suitcase grip) for more grip + oblique load.",
      "AMP 2: 3-sec pause at the bottom of the stretch.",
    ],
    constraints: { requiresIliopsoas: false, maxHipFlexion: 90, requiresWeightBearing: true },
    movementTags: [
      "weight_bearing_bilateral",
      "closed_chain",
      "standing",
      "neutral_spine_only",
      "hip_flexion_45_to_90",
    ],
    muscles: {
      primary: ["hamstrings", "gluteus maximus", "erector spinae"],
      secondary: ["forearm flexors", "rhomboids", "lower trapezius"],
    },
  },

  "Single-Leg KB RDL": {
    id: "rdl_kb_single_leg",
    name: "Single-Leg KB RDL",
    requires: ["kettlebell"],
    category: "legs",
    sets: [["3", "8-10/side"], ["3", "8-10/side"], ["3", "10-12/side"]],
    rest: 90,
    tempo: "3-1-1",
    setup:
      "Hold a kettlebell in one hand. Stand on the working leg, small bend in that knee. The other leg is light, ready to extend behind as a counterweight.",
    execution:
      "Hinge at the working hip, letting the rear leg float straight back as the torso lowers — body forms a 'T'. Keep hips square (don't let the back hip open). Lower to a hamstring stretch, then drive the standing-leg hip to stand tall. All reps one side, then switch.",
    nwbCues:
      "Train BOTH sides equally — the left leg is fully cleared for single-leg loading. Hips stay level and square; floating-leg toe points down. If balance is shaky, lightly touch a rack with the free hand.",
    why: "Single-leg hinge — hammers each hamstring/glute independently and rebuilds left-side balance and hip stability. Mirrors the PT progression.",
    safety: "safe",
    phaseUnlock: FWB,
    swaps: ["RDL (Kettlebell, Bilateral)", "SL Hip Thrust (Right)", "B-Stance Hip Thrust (Right-Dominant)"],
    amp: [
      "BASE: Moderate load, focus on balance and square hips.",
      "AMP 1: 3-second eccentric, controlled float.",
      "AMP 2: Deficit — stand on a low platform for extra range.",
    ],
    constraints: { requiresIliopsoas: false, maxHipFlexion: 90, requiresWeightBearing: true },
    movementTags: [
      "weight_bearing_unilateral",
      "single_leg_balance",
      "closed_chain",
      "standing",
      "neutral_spine_only",
      "balance_demand_high",
    ],
    muscles: {
      primary: ["hamstrings", "gluteus maximus"],
      secondary: ["gluteus medius", "erector spinae", "adductor magnus"],
    },
  },

  // ==================== GLUTE / BFR ====================

  "BFR Glute Bridge": {
    id: "bfr_glute_bridge_fwb",
    name: "BFR Glute Bridge",
    requires: ["bands", "mat"],
    category: "legs",
    sets: [["1", "30"], ["3", "15"]],
    rest: 30,
    tempo: "2-1-2",
    setup:
      "Apply the BFR cuffs/bands high on both upper thighs (close to the hip crease) at the prescribed tightness — snug, not painful (~7/10 perceived tightness for legs). Lie supine on the mat, knees bent, feet flat hip-width.",
    execution:
      "Drive through the heels to lift the hips into a straight line from knees to shoulders, squeezing the glutes hard at the top. Lower with control. BFR protocol: 30 reps, then 3×15 with only ~30s rest between sets — keep the cuffs on throughout.",
    nwbCues:
      "Blood-flow-restriction training is low-load / high-rep — light or bodyweight load is the point, the cuffs do the work. Keep rest short (30s). Remove the cuffs immediately if you feel numbness, tingling, or sharp pain. Both feet drive evenly.",
    why: "BFR drives a high-intensity hypertrophy/strength stimulus at light loads — efficient glute/quad work with minimal joint load. Part of the FWB PT block.",
    safety: "safe",
    phaseUnlock: FWB,
    swaps: ["Bilateral Hip Thrust", "SL Glute Bridge (Right)", "Banded Clamshells"],
    amp: [
      "BASE: Bodyweight, 30 + 3×15 with cuffs, 30s rest.",
      "AMP 1: Add a light barbell or plate across the hips.",
      "AMP 2: 2-second hold at the top of every rep.",
    ],
    constraints: { requiresIliopsoas: false, maxHipFlexion: 40, requiresWeightBearing: false },
    movementTags: ["supine", "closed_chain", "knee_flexion_45_to_90"],
    muscles: {
      primary: ["gluteus maximus"],
      secondary: ["hamstrings", "quadriceps"],
    },
  },

  // ==================== CALVES ====================

  "Standing Calf Raise (Bilateral)": {
    id: "standing_calf_raise_bilateral",
    name: "Standing Calf Raise (Bilateral)",
    requires: ["plyobox"],
    category: "legs",
    sets: [["3", "15-20"], ["3", "12-15"], ["3", "10-12"]],
    rest: 60,
    tempo: "2-1-2",
    setup:
      "Stand bilateral on the edge of a low plyobox or step, forefeet on the box, heels hanging off. Light fingertip touch on a wall or rack for balance. Hip-width stance, weight even across both forefeet.",
    execution:
      "Lower the heels into a deep stretch, pause 1 sec, then drive up onto the balls of both feet and squeeze the calves for 1 sec at the top. 2-sec eccentric. Both heels move together.",
    nwbCues:
      "Even weight on both feet — re-center if you drift to the right. Controlled stretch + pause, no bouncing at the bottom.",
    why: "Rebuilds the gastroc-soleus complex bilaterally and restores the eccentric heel-lowering used in every step of gait. Progress to loaded versions as it gets easy.",
    safety: "safe",
    phaseUnlock: FWB,
    swaps: ["Standing Calf Raise (R)", "R-Leg Calf Raise on Foot Plate"],
    amp: [
      "BASE: Body weight, 2-sec eccentric, 1-sec pause top + bottom.",
      "AMP 1: Hold a kettlebell or dumbbell at the chest (goblet) for load.",
      "AMP 2: Single-leg calf raises, alternating sides.",
    ],
    constraints: { requiresIliopsoas: false, maxHipFlexion: 0, requiresWeightBearing: true },
    movementTags: ["weight_bearing_bilateral", "closed_chain", "standing"],
    muscles: {
      primary: ["gastrocnemius", "soleus"],
      secondary: ["tibialis anterior"],
    },
  },
};
