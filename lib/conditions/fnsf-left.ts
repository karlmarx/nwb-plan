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
    // 2026-04-29 doctor clearance: hip flexion fully unrestricted (FAI/labral
    // concerns retired); iliopsoas restriction lifted; swimming OK.
    // Globally forbidden are only the things that still axially load the left
    // femoral neck or cause high impact. PWB-phase unlockTags below relax the
    // weight-bearing tags for the current rehab stage.
    forbiddenTags: [
      "ground_reaction_force_high",
      "cardio_running",
      "weight_bearing_unilateral",
      "weight_bearing_bilateral",
    ],
    cautionTags: [
      "single_leg_balance",
      "loaded_hip_abduction",
      "loaded_hip_adduction",
    ],
    romLimits: {
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
      "PRIMARY: Left femoral neck compression-side stress fracture — FWB phase as of 2026-05 (PT progression). Bilateral standing weight-bearing is now permitted under PT load monitoring. The single-leg-only rehab patterns from the PWB phase remain available as fallbacks.",
      "Bilateral squat, leg press, RDL, and calf raise are PERMITTED at PT-prescribed (sub-maximal) loads. Single-leg LEFT squat and LEFT leg press in isolation remain off the table — bilateral only on the left side, with PT supervising the load progression.",
      "NO rowing erg (Concept2 / similar). Recumbent bike, swimming, and canoeing are OK.",
      "Hip flexion is fully unrestricted: the FAI + labral concerns have been retired by the doctor. The iliopsoas restriction is lifted — left hip flexion against gravity is now permitted.",
      "Core work is unrestricted.",
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
      {
        id: "fnsf_phase_fwb",
        name: "FWB",
        description:
          "Full weight bearing return. Bilateral standing patterns under PT load monitoring. RDLs, leg press, TRX squat, calf raises bilateral at sub-maximal loads.",
        durationDays: 28,
        color: "#facc15",
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
  aiPromptFragment: `PHASE: Full weight bearing (FWB) as of 2026-05. Bilateral standing weight-bearing is now permitted under PT supervision; the 4-week FWB block is dedicated to grooving symmetric bilateral patterns at sub-maximal load. PWB-phase single-leg exercises remain available as fallbacks.
SAFE: Bilateral RDL with kettlebell, bilateral leg press at PT-prescribed loads, TRX-assisted bilateral squat, bilateral standing calf raise. All PWB-phase exercises (bilateral leg curl, leg extension, hip thrust, hip abduction/adduction machines, half-kneeling and tall-kneeling press, cable crossover with kickstand). Recumbent bike, swimming, canoeing. All core work. Upper-body work is unrestricted.
PROHIBITED: Rowing erg (Concept2 / similar). Single-leg ISOLATED left squat / left leg press — bilateral only on the left side. PT explicitly caps load on every new bilateral pattern; do not chase pre-injury numbers.
HIP FLEXION: Fully unrestricted. The previous <90deg cap and iliopsoas activation ban are both retired.
PT LOAD CAP: When the user asks about weight for any FWB-phase bilateral exercise (RDL KB, bilateral leg press, TRX squat, calf raise), default to "PT-prescribed sub-maximal load" rather than a number. Typical early-FWB loads are 40-60% of pre-injury bilateral capacity; PT updates this week-by-week.`,
};
