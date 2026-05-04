/**
 * Hevy → NWB-Plan exercise name map.
 *
 * Keys: Hevy "Exercise Name" column, lowercased + whitespace-normalized.
 * Values: exercise id from lib/exercises.ts EX[key].id
 *
 * Hevy uses verbose names like "Bench Press (Barbell)" while NWB-Plan ids
 * are snake_case slugs. We map by gym-vocabulary equivalence; NWB exercises
 * are unilateral/NWB-adapted, so we map the generic Hevy name → the NWB
 * single-leg or adapted variant that makes sense.
 *
 * ~35 pairs covering the most common push/pull/legs/core exercises a Hevy
 * user would have logged before switching to this app.
 */
export const HEVY_NAME_MAP: Record<string, string> = {
  // ── PUSH / CHEST ─────────────────────────────────────────────────────────
  "bench press (barbell)": "barbell_floor_press",
  "bench press": "barbell_floor_press",
  "floor press (barbell)": "barbell_floor_press",
  "barbell floor press": "barbell_floor_press",

  "incline bench press (dumbbell)": "incline_db_bench_press",
  "incline dumbbell bench press": "incline_db_bench_press",
  "incline db press": "incline_db_bench_press",

  "chest press (machine)": "machine_chest_press",
  "chest press machine": "machine_chest_press",
  "machine chest press": "machine_chest_press",

  "cable chest fly": "cable_chest_fly",
  "cable fly": "cable_chest_fly",
  "cable crossover": "cable_chest_fly",
  "pec deck": "cable_chest_fly",
  "pec deck fly": "cable_chest_fly",

  // ── PUSH / SHOULDER ───────────────────────────────────────────────────────
  "overhead press (dumbbell)": "seated_db_oh_press",
  "shoulder press (dumbbell)": "seated_db_oh_press",
  "seated dumbbell shoulder press": "seated_db_oh_press",
  "dumbbell shoulder press": "seated_db_oh_press",

  "arnold press (dumbbell)": "seated_arnold_press",
  "arnold press": "seated_arnold_press",

  "lateral raise (dumbbell)": "cable_lateral_raise_seated",
  "lateral raise (cable)": "cable_lateral_raise_seated",
  "cable lateral raise": "cable_lateral_raise_seated",
  "side lateral raise": "cable_lateral_raise_seated",

  "shoulder press (machine)": "machine_shoulder_press",
  "machine shoulder press": "machine_shoulder_press",

  // ── PUSH / TRICEPS ────────────────────────────────────────────────────────
  "skull crusher": "lying_skull_crushers",
  "skull crushers": "lying_skull_crushers",
  "lying tricep extension": "lying_skull_crushers",
  "lying triceps extension": "lying_skull_crushers",

  "tricep pushdown (cable - rope)": "tricep_rope_pushdown",
  "tricep pushdown (rope)": "tricep_rope_pushdown",
  "rope pushdown": "tricep_rope_pushdown",
  "cable tricep pushdown": "tricep_rope_pushdown",
  "tricep pushdown": "tricep_rope_pushdown",

  "overhead tricep extension (dumbbell)": "oh_triceps_extension",
  "overhead tricep extension (cable)": "oh_triceps_extension",
  "overhead tricep extension": "oh_triceps_extension",

  "tricep kickback (dumbbell)": "db_tricep_kickback",
  "dumbbell tricep kickback": "db_tricep_kickback",

  // ── PULL / BACK ───────────────────────────────────────────────────────────
  "lat pulldown (bar)": "lat_pulldown_wide",
  "lat pulldown (wide bar)": "lat_pulldown_wide",
  "lat pulldown": "lat_pulldown_wide",
  "wide grip lat pulldown": "lat_pulldown_wide",

  "lat pulldown (neutral grip)": "neutral_grip_pulldown",
  "neutral grip lat pulldown": "neutral_grip_pulldown",
  "close grip lat pulldown": "neutral_grip_pulldown",

  "pull-up": "weighted_pullup",
  "pullup": "weighted_pullup",
  "pull up": "weighted_pullup",
  "weighted pull-up": "weighted_pullup",
  "chin-up": "weighted_pullup",
  "chin up": "weighted_pullup",

  "bent over row (barbell)": "chest_supported_db_row",
  "bent over row (dumbbell)": "chest_supported_db_row",
  "chest supported row (dumbbell)": "chest_supported_db_row",
  "incline row": "chest_supported_db_row",

  "seated cable row": "seated_cable_row",
  "cable row": "seated_cable_row",
  "low cable row": "seated_cable_row",
  "seated row (cable)": "seated_cable_row",

  "single arm cable row": "one_arm_cable_row",
  "one arm cable row": "one_arm_cable_row",
  "single arm row (cable)": "one_arm_cable_row",

  "face pull": "seated_face_pulls",
  "face pulls": "seated_face_pulls",
  "cable face pull": "seated_face_pulls",

  "reverse fly (machine)": "pec_deck_reverse_fly",
  "reverse fly (dumbbell)": "reverse_fly",
  "rear delt fly": "reverse_fly",
  "reverse fly": "reverse_fly",

  // ── PULL / BICEPS ─────────────────────────────────────────────────────────
  "preacher curl (ez bar)": "preacher_curls",
  "preacher curl": "preacher_curls",
  "ez bar preacher curl": "preacher_curls",

  "hammer curl (dumbbell)": "hammer_curls",
  "hammer curl": "hammer_curls",

  "incline curl (dumbbell)": "incline_db_curl",
  "incline dumbbell curl": "incline_db_curl",

  "bicep curl (cable)": "cable_curl",
  "cable bicep curl": "cable_curl",
  "cable curl": "cable_curl",

  // ── LEGS / QUADS ──────────────────────────────────────────────────────────
  "leg press": "sl_leg_press_right",
  "single leg press": "sl_leg_press_right",
  "leg press (single leg)": "sl_leg_press_right",

  "hack squat": "hack_squat_right",
  "hack squat machine": "hack_squat_right",

  "leg extension": "sl_leg_extension_right",
  "leg extension (single leg)": "sl_leg_extension_right",
  "single leg extension": "sl_leg_extension_right",

  // ── LEGS / GLUTES + HAMSTRINGS ────────────────────────────────────────────
  "glute bridge": "sl_glute_bridge_right",
  "single leg glute bridge": "sl_glute_bridge_right",
  "barbell glute bridge": "sl_glute_bridge_right",

  "hip thrust (barbell)": "sl_hip_thrust_right",
  "hip thrust": "sl_hip_thrust_right",
  "barbell hip thrust": "sl_hip_thrust_right",
  "single leg hip thrust": "sl_hip_thrust_right",

  "leg curl (lying)": "prone_ham_curl_right",
  "leg curl (prone)": "prone_ham_curl_right",
  "lying leg curl": "prone_ham_curl_right",
  "prone leg curl": "prone_ham_curl_right",
  "hamstring curl": "prone_ham_curl_right",

  "stability ball leg curl": "stab_ball_ham_curl_right",
  "swiss ball leg curl": "stab_ball_ham_curl_right",
  "stability ball hamstring curl": "stab_ball_ham_curl_right",

  "nordic hamstring curl": "nordic_ham_curl",
  "nordic curl": "nordic_ham_curl",

  "calf raise": "standing_calf_raise_r",
  "standing calf raise": "standing_calf_raise_r",
  "seated calf raise": "standing_calf_raise_r",

  // ── LEGS / ADDUCTION + ABDUCTION ──────────────────────────────────────────
  "hip abduction (machine)": "side_lying_hip_abduction_left",
  "hip abduction": "side_lying_hip_abduction_left",
  "clamshell": "banded_clamshells",
  "banded clamshell": "banded_clamshells",
  "clamshells": "banded_clamshells",

  // ── CORE ──────────────────────────────────────────────────────────────────
  "plank": "forearm_plank_saw",
  "forearm plank": "forearm_plank_saw",
  "dead bug": "dead_bug_r_leg_only",
  "hollow body hold": "hollow_body_hold",
  "pallof press": "pallof_press_seated",
  "bird dog": "bird_dog_prone_bench",
  "bird-dog": "bird_dog_prone_bench",
  "russian twist": "russian_twist_seated_bench",
  "cable woodchop": "cable_woodchop_seated",
  "side plank": "side_plank_r_side_down",
  "mcgill curl up": "mcgill_curl_up",
  "mcgill curl-up": "mcgill_curl_up",

  // ── CARDIO ────────────────────────────────────────────────────────────────
  "ski erg": "seated_skierg",
  "skierg": "seated_skierg",
  "rowing machine": "arm_ergometer",
  "battle ropes": "seated_battle_ropes",
};

/** Normalize a Hevy exercise name for map lookup. */
function normalizeHevyName(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

/**
 * Look up a Hevy exercise name and return the NWB-Plan exercise id, or null
 * if no mapping exists.
 */
export function findExerciseId(hevyName: string): string | null {
  const key = normalizeHevyName(hevyName);
  return HEVY_NAME_MAP[key] ?? null;
}
