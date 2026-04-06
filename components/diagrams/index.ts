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
  bird_dog_prone_bench:                "p4",
  support_hold_pbars:                  "a6",
};
