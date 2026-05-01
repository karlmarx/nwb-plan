// =============================================================================
// CONDITION TYPES
// =============================================================================
//
// Type-only module describing how a "rehab condition" parameterizes the app.
// Concrete condition packs live in lib/conditions/. The schema is designed to
// fit FNSF, ACL recon, rotator cuff post-op, and disc protrusion.
//
// Design notes:
//   1. Constraints are POSITIVE-list (allowed) + NEGATIVE-list (forbidden)
//      movement tags. Tags express biomechanical demand so the AI prompt
//      can reason about novel exercises.
//   2. Phases are per-condition (names and durations vary).
//   3. Exercise filtering is a predicate over (Exercise, Condition, PhaseIndex).
//   4. Side awareness is first-class via `affectedSide`.
//   5. Copy is overridable per-condition (e.g. Side Plank: FNSF says
//      "right-side-down only"; ACL says "either side OK, watch knee alignment").
// =============================================================================

// -----------------------------------------------------------------------------
// SECTION 1 — Movement tags (the controlled vocabulary)
// -----------------------------------------------------------------------------

/**
 * MovementTag: the controlled vocabulary that links exercises to conditions.
 *
 * Adding a new condition pack should rarely need a new tag. Tags express
 * biomechanical demands, not conditions. Aim for ~50-100 tags total at v1.
 */
export type MovementTag =
  // Loading patterns
  | "weight_bearing_bilateral"
  | "weight_bearing_unilateral"
  | "non_weight_bearing"
  | "open_chain"
  | "closed_chain"
  | "ground_reaction_force_high" // running, jumping, plyo
  | "impact_low"
  | "impact_zero"

  // Hip
  | "hip_flexion_under_45"
  | "hip_flexion_45_to_90"
  | "hip_flexion_over_90"
  | "hip_flexion_loaded_against_gravity"
  | "iliopsoas_recruitment_high"
  | "iliopsoas_recruitment_low"
  | "deep_hip_flexion" // squats, pistols, lunges
  | "end_range_internal_rotation" // FAI / labrum risk
  | "loaded_hip_abduction"
  | "loaded_hip_adduction"
  | "single_leg_balance"

  // Knee
  | "knee_flexion_under_45"
  | "knee_flexion_45_to_90"
  | "knee_flexion_over_90"
  | "open_chain_knee_extension" // post-ACL caution
  | "valgus_load" // ACL reconstruction risk
  | "deep_squat" // meniscus / patellar
  | "knee_isometric"

  // Shoulder
  | "shoulder_flexion_under_90"
  | "shoulder_flexion_over_90"
  | "shoulder_abduction_over_90"
  | "loaded_external_rotation"
  | "loaded_internal_rotation"
  | "overhead_pressing"
  | "overhead_pulling"
  | "scapular_retraction"
  | "rotator_cuff_isolation"

  // Spine
  | "loaded_spinal_flexion" // disc / endplate caution
  | "loaded_spinal_extension"
  | "loaded_spinal_rotation"
  | "neutral_spine_only"
  | "valsalva_required"
  | "anti_rotation"
  | "anti_lateral_flexion"
  | "anti_extension"

  // Cardio / metabolic
  | "cardio_upper_body_only"
  | "cardio_seated"
  | "cardio_swimming"
  | "cardio_cycling"
  | "cardio_running"

  // Position
  | "supine"
  | "prone"
  | "seated"
  | "standing"
  | "side_lying"
  | "quadruped"

  // Skill / risk
  | "balance_demand_high"
  | "fall_risk_high"
  | "requires_partner";

// -----------------------------------------------------------------------------
// SECTION 2 — Anatomy & laterality
// -----------------------------------------------------------------------------

export type AffectedSide = "left" | "right" | "bilateral" | "n/a";

export type AnatomicalRegion =
  | "hip"
  | "knee"
  | "ankle"
  | "shoulder"
  | "elbow"
  | "wrist"
  | "lumbar_spine"
  | "thoracic_spine"
  | "cervical_spine"
  | "core"
  | "general_fitness";

// -----------------------------------------------------------------------------
// SECTION 3 — Phase progression
// -----------------------------------------------------------------------------

/** A single phase of a condition's protocol. Length is in days for precision. */
export interface ConditionPhase {
  /** Stable id, e.g. "fnsf_phase_pwb_prep". Used by exercise.phaseEligibility. */
  id: string;
  /** Display name, e.g. "PWB Prep" or "Return to Sport". */
  name: string;
  /** One-line description for the user. */
  description: string;
  /** Phase length in DAYS (not weeks — ACL phase 1 is 14 days, not "2 weeks"). */
  durationDays: number;
  /** UI accent color (hex) — kept here so condition packs can theme phases. */
  color: string;

  /** Tags that become PERMITTED in this phase (override condition-level deny). */
  unlockTags?: MovementTag[];
  /** Tags that become FORBIDDEN in this phase (override condition-level allow). */
  restrictTags?: MovementTag[];

  /** Optional clinician-required milestone before advancing. */
  advancementCriteria?: string[];
}

// -----------------------------------------------------------------------------
// SECTION 4 — Workout split
// -----------------------------------------------------------------------------

export type WorkoutSplitKind =
  | "ppl" // Push/Pull/Legs (Karl's current)
  | "upper_lower"
  | "full_body"
  | "bro_split"
  | "rehab_only" // No structured strength split — just PT exercises
  | "custom";

/** A named workout day in the user's split. */
export interface WorkoutDay {
  /** Stable id used as a lookup key. */
  id: string;
  /** User-facing name, e.g. "Upper A" or "Lower (Affected Side)". */
  name: string;
  /** Subtitle, e.g. "Heavy strength" or "Volume". */
  subtitle?: string;
  /** Icon (emoji or icon-set ref). */
  icon: string;
  /** Theme color. */
  color: string;
  /** Ordered list of exercise IDs. Must exist in the global `EX` table OR
   *  be supplied as overrides via `condition.exerciseOverrides`. */
  exerciseIds: string[];
  /** Tags this workout fits — used to drive supplement selection.
   *  e.g. ["push"], ["pull"], ["legs", "affected_side"]. */
  tags: ("push" | "pull" | "legs" | "core" | "cardio" | "rehab" | "recovery")[];
}

/** Weekly schedule. Day index 0 = Monday. */
export interface WeeklySchedule {
  /** 7 entries, Mon-Sun. Each value is a WorkoutDay.id or null for rest. */
  days: (string | null)[];
}

// -----------------------------------------------------------------------------
// SECTION 5 — The Condition itself
// -----------------------------------------------------------------------------

export interface ConditionMetadata {
  /** Stable slug, e.g. "fnsf_left", "acl_recon_right". */
  id: string;
  /** Marketing name, e.g. "Left Femoral Neck Stress Fracture". */
  displayName: string;
  /** One-line lay description. */
  shortDescription: string;
  /** Long-form description shown in onboarding. */
  longDescription: string;
  /** What body region this is centered on. */
  primaryRegion: AnatomicalRegion;
  /** Optional list of comorbid issues this pack handles
   *  (e.g. FNSF + bilateral FAI). */
  secondaryRegions?: AnatomicalRegion[];
  /** Required clinician sign-off before patient can use this pack? */
  requiresClinicianApproval: boolean;
  /** Free-form ICD-10 / SNOMED codes for clinic integrations. */
  diagnosticCodes?: string[];
  /** Tags for marketing / discovery, e.g. ["femur", "stress fracture", "NWB"]. */
  searchTags: string[];
  /** Pricing tier (informational — actual pricing in billing service). */
  tier: "free" | "core" | "premium" | "clinician";
  /** Pack version — increment when constraints or phases change in a
   *  way that requires user re-confirmation. */
  version: string;
  /** Author / maintainer (for clinician trust). */
  author: {
    name: string;
    credentials?: string; // e.g. "DPT, OCS"
    contact?: string;
  };
}

export interface ConditionConstraints {
  /** Tags that are NEVER allowed for this condition (in any phase, unless
   *  a phase explicitly unlocks them via `phase.unlockTags`). */
  forbiddenTags: MovementTag[];
  /** Tags that are PROVISIONALLY allowed — user must confirm OK before
   *  including. e.g. "single_leg_balance" for FNSF in PWB phase. */
  cautionTags: MovementTag[];
  /** Numeric ranges for joint motion, e.g. {hip_flexion_max: 90}. */
  romLimits: Record<string, number>;
  /** Free-form absolute-stop signals shown in the Safety tab. */
  stopSignals: string[];
  /** Hard clinical contraindications expressed as plain English (used in
   *  AI system prompt verbatim). */
  hardContraindications: string[];
}

export interface ConditionAffected {
  /** Which side is the injury on. Drives how unilateral exercises render. */
  side: AffectedSide;
  /** What's the affected joint / structure. */
  region: AnatomicalRegion;
  /** Plain-English label, e.g. "Left femoral neck", "Right ACL". */
  label: string;
}

export interface ConditionProgram {
  /** Total program length in days. Sum of phase durations should equal this. */
  totalDays: number;
  /** Ordered phases. Index 0 = first phase. */
  phases: ConditionPhase[];
  /** Workout split shape. */
  splitKind: WorkoutSplitKind;
  /** Workout days available in this condition. */
  workoutDays: WorkoutDay[];
  /** Default weekly schedule. User can edit. */
  defaultSchedule: WeeklySchedule;
}

/** Per-condition copy overrides for individual exercises.
 *  Keyed by exercise.id. Any field omitted falls back to the global text. */
export interface ExerciseCopyOverride {
  setup?: string;
  execution?: string;
  cues?: string; // replaces the generic `nwbCues` field
  why?: string;
  safetyNote?: string;
  /** Override the global safety classification (e.g. an exercise that's
   *  "safe" globally may be "danger" for this condition). */
  safety?: "safe" | "caution" | "danger";
  /** Hide from this condition entirely even if equipment is available. */
  hidden?: boolean;
}

export interface ConditionSupplements {
  /** Affected-side maintenance routines (was `SUPPLEMENT_LEFT_LEG`). */
  affectedLimbBase: string[]; // exercise IDs
  affectedLimbExtra: string[];
  /** Per-workout-day core finishers. Keyed by `WorkoutDay.id`. */
  coreFinishers: Record<string, string[]>;
  /** Nearby-equipment supersets — same shape as today's `NEARBY_SUPERSETS`,
   *  but each entry can declare `requiresTags` and `forbidsTags` so a
   *  generic superset library can be filtered per condition. */
  nearbySupersets: NearbySupersetEntry[];
}

export interface NearbySupersetEntry {
  id: string;
  nearbyEquipmentId: string;
  title: string;
  sets: string;
  instruction: string;
  safety: string;
  /** Movement tags this superset uses. Must be allowed by condition. */
  movementTags: MovementTag[];
}

export interface ConditionBranding {
  /** App name shown in title bar, manifest, etc. */
  appName: string;
  /** Short name for PWA / iOS home screen. */
  shortName: string;
  /** Description for app store / marketing. */
  description: string;
  /** Theme accent color. */
  accentColor: string;
  /** Optional logo URL or component ref. */
  logoUrl?: string;
}

/**
 * The top-level Condition object. A user's profile points at exactly one
 * Condition (we may later allow multiple stacked conditions, but that's
 * out of scope for v1).
 */
export interface Condition {
  metadata: ConditionMetadata;
  affected: ConditionAffected;
  constraints: ConditionConstraints;
  program: ConditionProgram;
  supplements: ConditionSupplements;
  branding: ConditionBranding;

  /** Per-exercise copy overrides. Sparse — most exercises will inherit
   *  the global copy, only condition-specific cues differ. */
  exerciseOverrides?: Record<string, ExerciseCopyOverride>;

  /** Optional condition-specific AI system-prompt fragment. Composed with
   *  the global suggest prompt scaffold at request time. */
  aiPromptFragment?: string;

  /** Optional cardio plan (Karl's current `CARDIO_SCHEDULE`). */
  cardioPlan?: {
    weekly: { day: string; primary: string; alternate: string; kcal: string }[];
  };

  /** Optional pool / specialty content. */
  specialtyContent?: {
    pool?: PoolMethod[];
    nutrition?: NutritionGuidance;
  };
}

interface PoolMethod {
  title: string;
  badge: "RECOMMENDED" | "ANY POOL" | "HARDEST EXIT" | string;
  entry: string;
  exit: string;
  warning?: string;
}

interface NutritionGuidance {
  rationale: string;
  caloriesPerKg: [number, number];
  proteinPerKg: [number, number];
  notes: string[];
}

// -----------------------------------------------------------------------------
// SECTION 6 — Exercise extensions
// -----------------------------------------------------------------------------

/** Existing `Exercise` shape stays. We add these fields. */
export interface ExerciseExtensions {
  /** Movement tags this exercise demands. Used for filtering. */
  movementTags: MovementTag[];
  /** Is this exercise side-mirrorable? If true, render copy with
   *  affected-side/healthy-side substitution. */
  mirrorable: boolean;
  /** If unilateral, which side is the "working" side by default
   *  ("affected" or "healthy" — *relative to user's condition*). */
  defaultWorkingSide?: "affected" | "healthy";
  /** Phase eligibility: only show in these phases. Empty array = all
   *  phases. References `ConditionPhase.id`. */
  phaseEligibility?: string[];
}

// -----------------------------------------------------------------------------
// SECTION 7 — User profile (linking user → condition)
// -----------------------------------------------------------------------------

export interface UserProfile {
  userId: string;
  email: string;
  /** The user's selected condition. Null = onboarding incomplete. */
  conditionId: string | null;
  /** Condition pack version they accepted. Force re-onboarding if condition
   *  is bumped. */
  conditionVersion: string | null;
  /** Date they started the program (= week 1 day 1). */
  programStartDate: string | null; // ISO date
  /** Optional: date the user completed onboarding. */
  onboardingCompletedAt: string | null;
  /** Optional clinician override. If set, this clinician approved the
   *  user's condition pack and pinned them to a phase. */
  clinicianOverride?: {
    clinicianId: string;
    pinnedPhaseId?: string;
    notes?: string;
    expiresAt?: string;
  };
  /** Subscription state — minimal here, full state lives in billing. */
  subscription: {
    status: "free" | "active" | "past_due" | "canceled";
    plan: "free" | "core_monthly" | "core_annual" | "premium_monthly" | "clinician_seat";
    renewsAt?: string;
  };
}

// -----------------------------------------------------------------------------
// SECTION 8 — Filter predicates (the runtime contract)
// -----------------------------------------------------------------------------

/** Is this exercise allowed for this condition in this phase? */
export type ExerciseSafetyPredicate = (args: {
  exerciseTags: MovementTag[];
  condition: Condition;
  currentPhaseId: string;
}) => {
  allowed: boolean;
  /** "safe" | "caution" | "danger" — drives UI badge */
  level: "safe" | "caution" | "danger";
  /** If denied, which forbidden tag tripped it? */
  blockedBy?: MovementTag;
  /** Human-readable explanation for the safety tab / AI rationale. */
  rationale: string;
};

/** Compose the AI system prompt from a condition. */
export type AISystemPromptBuilder = (condition: Condition) => string;

// -----------------------------------------------------------------------------
// SECTION 9 — Onboarding (how the user picks a condition)
// -----------------------------------------------------------------------------

/** A question shown during the condition-selection quiz. */
export interface OnboardingQuestion {
  id: string;
  prompt: string;
  /** Which axis of the condition this question helps determine. */
  axis: "region" | "side" | "severity" | "phase" | "lifestyle";
  options: {
    label: string;
    /** What conditions this answer is compatible with. */
    compatibleConditions: string[]; // Condition.metadata.id[]
  }[];
}

/** A clinician-prescribed condition assignment (skips the quiz). */
export interface ClinicianPrescription {
  prescriptionId: string;
  clinicianId: string;
  patientEmail: string;
  conditionId: string;
  startDate: string;
  pinnedPhaseId?: string;
  expiresAt: string;
  /** Sealed JSON sig so patient app can verify this isn't tampered. */
  signature: string;
}
