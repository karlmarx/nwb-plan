// ============================================================================
// FWB (Full Weight-Bearing) phase additions — PT-supervised bilateral movements
// ----------------------------------------------------------------------------
// 2026-05 PT clearance: progression from PWB to bilateral standing weight-
// bearing under PT load monitoring. The "NO left squat / NO left leg press"
// rules from the PWB phase relax to "bilateral OK at PT-prescribed loads."
//
// Every entry below carries `phaseUnlock: "FWB-2026-05"` and a `ptSupervised`
// safety note. Loads are deliberately capped relative to the patient's old
// pre-injury numbers — PT prescribes the exact percentage; the prose here just
// flags that "lower weight" is the expected rule.
//
// Pattern matches lib/exercises-pwb.ts: this file exports FWB_ADDITIONS and is
// `Object.assign`-merged into the main EX dictionary at the bottom of
// lib/exercises.ts.
// ============================================================================

import type { Exercise } from "./exercises";

const FWB: "FWB-2026-05" = "FWB-2026-05";

export const FWB_ADDITIONS: Record<string, Exercise> = {
  // ==================== LEGS ====================

  "RDL (Kettlebell, Bilateral)": {
    id: "rdl_kb_bilateral",
    name: "RDL (Kettlebell, Bilateral)",
    requires: ["kettlebell"],
    category: "legs",
    sets: [["3", "10-12"], ["3", "8-10"], ["3", "6-8"]],
    rest: 90,
    tempo: "3-1-1",
    setup:
      "Stand bilateral, feet hip-width. Hold one moderate-weight kettlebell at the hips with both hands (suitcase grip if using two KBs of equal weight, one per hand). Soft knee bend, neutral spine, ribs stacked over pelvis. Crutches parked within reach but not in use during the set.",
    execution:
      "Hinge at the hips, pushing the bar/KB straight down the front of the thighs. Knees stay soft — this is a hinge, not a squat. Lower until you feel a strong hamstring stretch (typically mid-shin for the bell). Drive through both heels equally to stand. Pause 1 sec at the top, squeeze glutes. Lower over 3 sec on the eccentric.",
    nwbCues:
      "BILATERAL LOAD: both feet share the weight evenly — this is the first true symmetric loading of the left side. Start with a kettlebell ≤ 50% of the load you'd have used pre-injury. PT will progress the load week-by-week. If the left hip or femur catches, cramps, or feels asymmetric, STOP the set and report to PT before next session. NO valgus collapse on the left knee on the way up — drive through the heel, not the toe.",
    why: "Hip hinge is the foundation of every standing posterior-chain movement. KB-loaded bilateral RDL re-grooves the pattern at sub-maximal load before barbell RDLs come back. Bilateral loading also exposes any left-vs-right asymmetry that's hidden in single-leg work — PT uses the bell drift left/right as a signal.",
    safety: "caution",
    phaseUnlock: FWB,
    swaps: ["Deep RDLs", "45° Back Extension", "SL Hip Thrust (Right)"],
    amp: [
      "BASE: Single kettlebell, both hands, slow even tempo.",
      "AMP 1: Pair of kettlebells (suitcase carry RDL) — increases grip + obliques load without bumping spinal load much.",
      "AMP 2: 3-sec pause at the bottom of each rep (deep hamstring stretch).",
    ],
    constraints: {
      requiresIliopsoas: false,
      maxHipFlexion: 90,
      requiresWeightBearing: true,
    },
    muscles: {
      primary: ["hamstrings", "gluteus maximus", "erector spinae"],
      secondary: ["forearm flexors", "rhomboids", "lower trapezius"],
    },
  },

  "Bilateral Leg Press (PT Load)": {
    id: "bilateral_leg_press_pt",
    name: "Bilateral Leg Press (PT Load)",
    requires: ["legpress"],
    category: "legs",
    sets: [["3", "10-12"], ["3", "10-12"], ["3", "8-10"]],
    rest: 120,
    tempo: "3-1-1",
    setup:
      "Sit in the leg press. Both feet on the plate, hip-width apart, mid-foot placement. Back flat against the pad. Hip flexion at the bottom of the rep stays under 90° — keep feet HIGH on the plate to bias glutes and reduce the hip angle. Start the working set with a load PT has prescribed for the current week — explicitly LOWER than your prior bilateral capacity.",
    execution:
      "Press the sled to ~95% extension (do NOT lock the knees). Lower over 3 sec until just before 90° hip flexion. Drive through BOTH heels evenly. Watch the screen / mirror — if you see the left hip dropping back or the left knee tracking inside the foot, abort the rep and reset.",
    nwbCues:
      "FIRST BILATERAL LP: this is the headline FWB exercise. Both legs press together for the first time since the injury. Do NOT chase old numbers — PT explicitly caps the load (typically 40–60% of pre-injury bilateral 1RM in early FWB). Stop immediately if: left hip pain, left groin sharp pinch, asymmetric leg drive, valgus knee tracking. Report any of these to PT before the next session. The previous SL Leg Press (Right) variants stay available as a fallback if the symmetric pattern doesn't feel right.",
    why: "Bilateral leg press is the bridge from single-leg cross-education work back to integrated barbell squatting. Allowing the machine to constrain the bar path means the patient can focus on equal force production left-vs-right under controlled load. PT-capped weight gives a safety margin while the femoral neck remodel completes.",
    safety: "caution",
    phaseUnlock: FWB,
    swaps: ["SL Leg Press (Right)", "TRX Squat (Bilateral)", "Hack Squat (Right)"],
    amp: [
      "BASE: PT-prescribed load, 3-sec eccentric.",
      "AMP 1: Add a 2-sec pause just before reaching 90° hip flexion (bottom isometric).",
      "AMP 2: 1.5 reps (full press → halfway down → press → full down → press).",
    ],
    machineVariants: [
      {
        id: "45_sled",
        label: "45° Sled (Incline)",
        icon: "\u{1F9B5}",
        description: "Standard 45° incline sled leg press",
        setupCues: [
          "Both feet HIGH on plate (above center) to bias glutes and reduce hip flexion",
          "Hip-width stance, mid-foot or slightly toed-out",
          "Back flat against pad",
        ],
      },
      {
        id: "seated_horizontal",
        label: "Seated/Horizontal",
        icon: "\u{1F4BA}",
        description: "Seated or horizontal leg press machine",
        setupCues: [
          "Both feet centered on the press plate, hip-width apart",
          "Adjust seat depth so hip flexion stays under 90° at bottom of rep",
        ],
      },
    ],
    constraints: {
      requiresIliopsoas: false,
      maxHipFlexion: 90,
      requiresWeightBearing: true,
    },
    muscles: {
      primary: ["quadriceps", "gluteus maximus"],
      secondary: ["hamstrings", "hip adductors", "gastrocnemius"],
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
      "Anchor TRX overhead. Stand bilateral, hip-width, facing the anchor. Grip both handles, arms extended forward at chest height. Lean back slightly so the straps are taut — the TRX takes some of your bodyweight, making this a deload squat. Crutches parked within reach.",
    execution:
      "Sit straight back and down, keeping the chest tall. The TRX assists the eccentric — you should feel like you're lowering into a chair. Drive through both heels to stand. Use the strap tension as little as possible on the way down (eccentric stays slow) and as much as needed on the way up (concentric stays controlled). Knees track over toes, no valgus collapse.",
    nwbCues:
      "BILATERAL SQUAT WITH ASSISTANCE: this is the first squat pattern allowed in the FWB phase. The TRX deload turns it into a body-weight-minus-strap-tension squat — start with deep lean-back (more deload) and progress to nearly vertical (less deload) over weeks. If left hip groin pain appears, increase the lean-back angle to deload further. If pain persists at maximum deload, STOP and report to PT. NO heel-rise: both heels stay planted. Watch for left foot turning out as a compensation.",
    why: "TRX-assisted squat is the lowest-load squat pattern that still teaches the bilateral standing squat motor pattern. The strap-deload lets the patient train the movement before they can train the load. Used in nearly every ACL / FAI / femoral neck return-to-sport protocol as the first bilateral squat.",
    safety: "caution",
    phaseUnlock: FWB,
    swaps: ["Bilateral Leg Press (PT Load)", "Bulgarian Split Squat", "Hack Squat (Right)"],
    amp: [
      "BASE: Moderate lean-back, body weight, 3-sec eccentric.",
      "AMP 1: Less lean-back (more vertical = less strap assistance).",
      "AMP 2: Pause-squat — 3-sec pause at the bottom before driving up.",
    ],
    constraints: {
      requiresIliopsoas: false,
      maxHipFlexion: 90,
      requiresWeightBearing: true,
    },
    muscles: {
      primary: ["quadriceps", "gluteus maximus"],
      secondary: ["hamstrings", "hip adductors", "gastrocnemius", "rectus abdominis"],
    },
  },

  "Standing Calf Raise (Bilateral)": {
    id: "standing_calf_raise_bilateral",
    name: "Standing Calf Raise (Bilateral)",
    requires: ["plyobox"],
    category: "legs",
    sets: [["3", "15-20"], ["3", "12-15"], ["3", "10-12"]],
    rest: 60,
    tempo: "2-1-2",
    setup:
      "Stand bilateral on the edge of a low plyobox or step. Forefeet on the box, heels hanging off. Hands on a wall or rack for balance — light fingertip touch only, no body weight. Hip-width stance, weight distributed evenly across both forefeet.",
    execution:
      "Lower the heels as far as comfortable (deep ankle dorsiflexion). Pause 1 sec at the stretch. Drive up onto the balls of both feet, squeezing the calves at the top for 1 sec. Lower over 2 sec on the eccentric. Both heels move together — no left/right asymmetry.",
    nwbCues:
      "FIRST BILATERAL CALF RAISE: equal weight on both feet is the goal. If you notice yourself unconsciously shifting weight to the right, deliberately re-center. The left calf may fatigue faster than the right after months of disuse — that's expected; reduce reps on the left's behalf rather than overloading it. NO bouncing at the bottom of the stretch — controlled stretch + pause. Stop if left Achilles or posterior heel pain appears.",
    why: "Calf raises rebuild the gastroc-soleus complex bilaterally. The bilateral standing version restores the eccentric heel-lowering pattern that's used in every step of normal gait. Bodyweight bilateral is the prerequisite for adding loaded versions later.",
    safety: "safe",
    phaseUnlock: FWB,
    swaps: ["Standing Calf Raise (R)", "R-Leg Calf Raise on Foot Plate"],
    amp: [
      "BASE: Body weight, 2-sec eccentric, 1-sec pause at top + bottom.",
      "AMP 1: Hold a kettlebell or single dumbbell at chest (goblet position) for added load.",
      "AMP 2: Switch to a single calf raise on each leg — the right side already has this in the library; the left side is the new addition this phase.",
    ],
    constraints: {
      requiresIliopsoas: false,
      maxHipFlexion: 0,
      requiresWeightBearing: true,
    },
    muscles: {
      primary: ["gastrocnemius", "soleus"],
      secondary: ["tibialis anterior"],
    },
  },
};
