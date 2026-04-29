// =============================================================================
// FNSF-LEFT CONDITION PACK
// =============================================================================
//
// Karl's pack: left femoral neck compression-side stress fracture, with
// bilateral cam-type FAI + anterosuperior labral tears, posterior chain
// tendinosis, and L4-L5 DDD. The reference implementation against which
// every other condition pack is measured.
//
// All fields here reproduce the values that were previously hard-coded
// across app/api/suggest/system-prompt.ts, lib/program.ts, lib/exercises.ts
// (PHASES, WORKOUTS, SCHED), public/manifest.json, and app/layout.tsx.
// Wiring those consumers to read this pack happens in later moves.
// =============================================================================

import type { Condition } from "@/lib/condition-types";

export const fnsfLeft: Condition = {
  metadata: {
    id: "fnsf_left",
    displayName: "Left Femoral Neck Compression-Side Stress Fracture",
    shortDescription:
      "Compression-side femoral neck stress fracture in the left hip, with secondary FAI + labral involvement.",
    longDescription:
      "8-week non-weight-bearing-to-PWB progression for a compression-side stress fracture of the left femoral neck. Iliopsoas activation drives 57-70% of femoral neck strain so left hip flexion against gravity is prohibited. Comorbid bilateral cam-type FAI and anterosuperior labral tears cap hip flexion <90° both sides; deep flexion and end-range internal rotation are also out. Designed for a fit, strong-upper-body practitioner.",
    primaryRegion: "hip",
    secondaryRegions: ["lumbar_spine", "core"],
    requiresClinicianApproval: true,
    diagnosticCodes: ["S72.044A", "M25.851"],
    searchTags: [
      "femur",
      "stress fracture",
      "femoral neck",
      "NWB",
      "PWB",
      "FAI",
      "labral tear",
    ],
    tier: "premium",
    version: "1.0.0",
    author: {
      name: "Karl Marx",
      credentials: "Patient-author (clinician review pending)",
    },
  },

  affected: {
    side: "left",
    region: "hip",
    label: "Left femoral neck",
  },

  constraints: {
    forbiddenTags: [
      "iliopsoas_recruitment_high",
      "hip_flexion_loaded_against_gravity",
      "hip_flexion_over_90",
      "deep_hip_flexion",
      "end_range_internal_rotation",
      "weight_bearing_unilateral",
      "weight_bearing_bilateral",
      "ground_reaction_force_high",
      "cardio_swimming",
      "cardio_running",
    ],
    cautionTags: [
      "hip_flexion_45_to_90",
      "single_leg_balance",
      "loaded_hip_abduction",
      "loaded_hip_adduction",
    ],
    romLimits: {
      hip_flexion_max_deg: 90,
      knee_flexion_left_open_chain_max_deg: 130,
    },
    stopSignals: [
      "Groin pain at any new load",
      "Anterior hip click or catch",
      "Trendelenburg gait when bilateral standing returns",
      "Night pain after a session",
      "Mechanical clicking with hip flexion",
    ],
    hardContraindications: [
      "PRIMARY: Left femoral neck compression-side stress fracture — strict NWB, ZERO left iliopsoas activation. Iliopsoas generates 57-70% of femoral neck strain. Any left hip flexion against gravity is PROHIBITED.",
      "SECONDARY: Bilateral cam-type FAI + anterosuperior labral tears — hip flexion capped <90° both sides, no deep squats, no end-range hip flexion.",
      "Swimming prohibited.",
      "Patient is very fit — strong upper body, experienced yoga practitioner.",
    ],
  },

  program: {
    totalDays: 56,
    phases: [
      {
        id: "fnsf_phase_foundation",
        name: "Foundation",
        description: "Adaptation phase. Higher reps, learn safe patterns.",
        durationDays: 14,
        color: "#38bdf8",
      },
      {
        id: "fnsf_phase_build",
        name: "Build",
        description: "Increase load. 4-sec eccentrics. Add drop sets & rest-pause.",
        durationDays: 14,
        color: "#a78bfa",
      },
      {
        id: "fnsf_phase_peak",
        name: "Peak",
        description: "Maximum safe output. Heavy singles. Pre-weight-bearing.",
        durationDays: 14,
        color: "#f97316",
      },
      {
        id: "fnsf_phase_pwb_prep",
        name: "PWB Prep",
        description:
          "Partial weight bearing transition. PT-guided progression. New exercises being added.",
        durationDays: 14,
        color: "#10b981",
        unlockTags: ["weight_bearing_bilateral", "weight_bearing_unilateral"],
      },
    ],
    splitKind: "ppl",
    workoutDays: [
      {
        id: "push_a",
        name: "Push A",
        subtitle: "Heavy Strength",
        icon: "💪",
        color: "#38bdf8",
        exerciseIds: [],
        tags: ["push"],
      },
      {
        id: "push_b",
        name: "Push B",
        subtitle: "Volume / Hypertrophy",
        icon: "💪",
        color: "#38bdf8",
        exerciseIds: [],
        tags: ["push"],
      },
      {
        id: "pull_a",
        name: "Pull A",
        subtitle: "Heavy Strength",
        icon: "🔗",
        color: "#a78bfa",
        exerciseIds: [],
        tags: ["pull"],
      },
      {
        id: "pull_b",
        name: "Pull B",
        subtitle: "Volume / Density",
        icon: "🔗",
        color: "#a78bfa",
        exerciseIds: [],
        tags: ["pull"],
      },
      {
        id: "legs_a",
        name: "Legs A",
        subtitle: "Quad/Glute (Cross-Ed)",
        icon: "🦵",
        color: "#10b981",
        exerciseIds: [],
        tags: ["legs"],
      },
      {
        id: "legs_b",
        name: "Legs B",
        subtitle: "Posterior Chain",
        icon: "🦵",
        color: "#10b981",
        exerciseIds: [],
        tags: ["legs"],
      },
      {
        id: "recovery",
        name: "Recovery",
        subtitle: "Active Recovery (Sunday)",
        icon: "🧘",
        color: "#64748b",
        exerciseIds: [],
        tags: ["recovery"],
      },
    ],
    defaultSchedule: {
      days: ["push_a", "pull_a", "legs_a", "push_b", "pull_b", "legs_b", "recovery"],
    },
  },

  supplements: {
    affectedLimbBase: [],
    affectedLimbExtra: [],
    coreFinishers: {},
    nearbySupersets: [],
  },

  branding: {
    appName: "Femur Fracture Fitness",
    shortName: "FFF",
    description: "MRI-Adjusted Non-Weight-Bearing Push/Pull/Legs Training Protocol",
    accentColor: "#0a0f1a",
  },

  // The SAFE / PROHIBITED block lives here as prose because it's
  // condition-specific framing the AI prompt needs verbatim. Future moves
  // may derive these lines from forbiddenTags / cautionTags directly.
  aiPromptFragment: `SAFE: Right-side weight bearing exercises, left knee extension/hamstring curls (open chain, seated/reclined), upper body work, core work without hip flexion.
PROHIBITED: Any left leg raises, left knee drives, left hip flexion, crow pose, tuck planche, swimming.`,
};
