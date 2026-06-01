// ============================================================================
// DAILY REQUIRED HEP — PT-PRESCRIBED HOME EXERCISE PROGRAM
// ============================================================================
//
// Daily floor of PT-prescribed exercises (HEP2GO printouts from Justin Joaquin,
// DPT, CSCS).  Distinct from lib/pt-exercises.ts (which is a phase-gated,
// flexible supplement layer).  HEP is non-phase-gated, daily-required work.
//
// CONVENTION:
//   - All ids prefixed `hep_` to disambiguate from EX[] / pt_*
//   - Per-day completion is tracked in localStorage by date key
//     (`nwb_hep_done_<YYYY-MM-DD>`) — see useHEPCompletion in
//     components/hep-block.tsx
//   - Append-only: adding next week's prescription is one entry below.
//   - Retiring an exercise: set `retiredOn` instead of deleting.
//
// ============================================================================

export type HEPSide = "left" | "right" | "bilateral";

export interface HEPExercise {
  /** Stable slug — `hep_<lower_snake>`. */
  id: string;
  /** Display name as written on the HEP2GO printout. */
  name: string;
  /** Plain-text instructions, one paragraph. */
  instructions: string;
  /** Sets count, e.g. 3. */
  sets: number;
  /** Reps per set. Optional for hold-only exercises. */
  reps?: number;
  /** Hold seconds. Optional. */
  holdSeconds?: number;
  /** Frequency note. Defaults to "1× daily" if omitted. */
  frequency?: string;
  /** Which leg is loaded; "bilateral" for both. */
  side: HEPSide;
  /** HEP2GO video URL (decoded from QR code). Optional — fill in later. */
  videoUrl?: string;
  /** Optional reference image URL. */
  figureUrl?: string;
  /** Date the exercise was added to the prescription (ISO `YYYY-MM-DD`). */
  prescribedOn: string;
  /** Date the exercise was retired, if any. Filters out of the active list. */
  retiredOn?: string;
}

export const HEP_EXERCISES: HEPExercise[] = [
  {
    id: "hep_prone_hip_extension",
    name: "Prone Hip Extension",
    instructions:
      "While lying face down with your knee straight, slowly raise your leg up off the ground. Maintain a straight knee the entire time.",
    sets: 3,
    reps: 10,
    side: "left",
    prescribedOn: "2026-05-06",
  },
  {
    id: "hep_hip_abduction_sidelying",
    name: "Hip Abduction - Sidelying",
    instructions:
      "While lying on your side, slowly raise up your top leg towards the sky. Keep your knee straight and maintain your toes pointed forward the entire time. Keep your leg in-line with your body. The bottom leg can be bent to stabilize your body.",
    sets: 3,
    reps: 10,
    side: "left",
    prescribedOn: "2026-05-06",
  },
  {
    id: "hep_straight_leg_raise",
    name: "Straight Leg Raise (SLR)",
    instructions:
      "While lying on your back, raise up your leg with a straight knee. Keep the opposite knee bent with the foot planted on the ground.",
    sets: 3,
    reps: 10,
    side: "left",
    prescribedOn: "2026-05-06",
  },
  {
    id: "hep_bridging_ball_squeeze",
    name: "Bridging with Rubber Ball Squeeze",
    instructions:
      "Lie on your back with knees bent. Place a small rubber ball between your knees. Squeeze the ball with your knees and hold the pressure. While holding this pressure, press through your heels as you raise your buttocks off the floor/bed creating a bridge with your body. Return to starting position and repeat.",
    sets: 3,
    reps: 10,
    side: "bilateral",
    prescribedOn: "2026-05-06",
  },
  {
    id: "hep_isometric_hip_er_prone_ball",
    name: "Isometric Hip External Rotation - Prone - Ball Squeeze",
    instructions:
      "While lying face down, place a ball between your ankles and press your feet together. Hold, relax and repeat.",
    sets: 3,
    reps: 10,
    holdSeconds: 5,
    side: "bilateral",
    prescribedOn: "2026-05-06",
  },
  {
    id: "hep_band_sidelying_clamshell",
    name: "Elastic Band - Side-Lying Clamshell",
    instructions:
      "While lying on your side with your knees bent and an elastic band wrapped around your knees, draw up the top knee while keeping contact of your feet together as shown. Do not let your pelvis roll back during the lifting movement.",
    sets: 3,
    reps: 10,
    side: "left",
    prescribedOn: "2026-05-06",
  },
  {
    id: "hep_calf_raise",
    name: "Calf Raise",
    instructions:
      "Stand with feet hip-width on a flat surface, fingertips on a rail or counter for balance. Press up onto the balls of both feet, lifting your heels as high as possible. Hold briefly at the top, then lower with control until heels touch the floor. Keep weight even between both feet.",
    sets: 3,
    reps: 10,
    side: "bilateral",
    prescribedOn: "2026-05-13",
  },
  {
    id: "hep_bilateral_leg_press",
    name: "Bilateral Leg Press",
    instructions:
      "Set up on a leg press machine with both feet placed shoulder-width on the platform. Brace your core, then lower the platform under control until knees reach roughly 90° (keep hips below 90° of flexion). Press back to near-lockout without snapping the knees. Keep weight evenly distributed between both legs — do not let the right side dominate.",
    sets: 3,
    reps: 10,
    side: "bilateral",
    prescribedOn: "2026-05-13",
  },
  {
    id: "hep_kb_rdl",
    name: "Kettlebell Romanian Deadlift (RDL)",
    instructions:
      "Stand with feet hip-width, holding a kettlebell in front of your thighs with both hands. Keeping a soft bend in the knees and a flat back, hinge at the hips to lower the kettlebell along the front of your legs until you feel a stretch in the hamstrings. Drive through both heels and squeeze the glutes to return to standing. Keep weight even between both feet.",
    sets: 3,
    reps: 10,
    side: "bilateral",
    prescribedOn: "2026-05-13",
  },
  {
    id: "hep_trx_squat",
    name: "TRX Squat",
    instructions:
      "Face the TRX anchor and hold a handle in each hand at chest height with elbows close to the ribs. Step back until the straps are taut and stand with feet hip-width. Sit back and down into a squat, letting the straps unload some of your bodyweight as needed. Drive through both heels to stand. Keep weight even between both feet and knees tracking over toes.",
    sets: 3,
    reps: 10,
    side: "bilateral",
    prescribedOn: "2026-05-13",
  },
];

/** Active HEP exercises — excludes anything with `retiredOn` set. */
export function getActiveHEP(): HEPExercise[] {
  return HEP_EXERCISES.filter((e) => !e.retiredOn);
}
