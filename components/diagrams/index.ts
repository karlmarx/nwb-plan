export { default as DiagramGallery } from "./gallery";
export { ALL_ANIMS } from "./gallery";
export { CATEGORIES, EXERCISES } from "./data";
export type { ExerciseDiagram, Category } from "./data";

// Maps exercise IDs (lib/exercises.ts) → diagram IDs (components/diagrams/data.ts)
// Only includes high-confidence name matches where the diagram shows the same movement.
export const EXERCISE_TO_DIAGRAM: Record<string, string> = {
  sl_glute_bridge_right:              "g1",
  trx_sl_glute_bridge_right:          "g1",
  banded_clamshells:                   "g2",
  pseudo_planche_pushup:               "e1",
  side_plank_r_side_down:              "e2",
  side_plank_l_oblique_bias_r_side_down: "e2",
  dead_bug_r_leg_only:                 "s5",
  barbell_rollout_r_knee:              "r3",
  suitcase_hold_seated:                "r4",
  parallette_l_sit:                    "a4",
  bird_dog_prone_bench:                "p5",
  support_hold_pbars:                  "a6",
  seated_hip_abduction_band:           "g4",
  seated_hip_adduction_band:           "g5",
  // ── Issue #54: high-priority NWB-specific diagrams ──
  sl_hip_thrust_right:                 "g6",
  sl_leg_press_right:                  "g7",
  hack_squat_right:                    "g8",
  low_box_step_up_right:               "g9",
  stab_ball_ham_curl_right:            "g10",
  prone_hip_extension_right:           "g11",
  prone_ham_curl_right:                "p6",
  sl_leg_extension_right:              "e3",
  nordic_ham_curl:                     "e4",
  plank_knee_tuck_r_only:              "a7",
  mcgill_curl_up:                      "r6",
  stir_the_pot:                        "r7",
  // ── Prone Ham Curl Machine Core ──
  prone_y_raise:                       "p7",
  prone_t_raise:                       "p8",
  prone_w_raise:                       "p9",
  prone_trunk_extension:               "p10",
  prone_iso_hold:                      "p11",
  prone_lateral_trunk_raise:           "p12",
};
