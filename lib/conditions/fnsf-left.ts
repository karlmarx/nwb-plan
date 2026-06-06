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
      "Recovery program for a compression-side stress fracture of the left femoral neck, now in the FWB (full weight-bearing) phase: as of 2026-05 the patient is fully cleared for unrestricted resistance training, with FWB lifts (squat, leg press, single/double-leg KB RDL, BFR bridges) part of PT. The earlier NWB/PWB restrictions — left-side axial-loading ban, hip-flexion cap, iliopsoas restriction — are all retired. Designed for a fit, strong-upper-body practitioner.",
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
      "FWB",
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
    // 2026-05 FWB clearance: full weight-bearing, fully cleared for
    // unrestricted resistance training. Every prior NWB/PWB movement ban is
    // retired — FWB lifts (squat, leg press, single + double-leg KB RDL, BFR
    // glute bridges) are already part of PT. No movement tags are forbidden
    // or cautioned at this stage; the FWB phase below unlocks the rest.
    forbiddenTags: [],
    cautionTags: [],
    romLimits: {},
    stopSignals: [
      "Sharp or localized pain in the left hip/groin during a lift — stop the set (not the session) and reassess load",
    ],
    hardContraindications: [
      "Full weight-bearing (FWB) and fully cleared for unrestricted resistance training as of 2026-05. No exercise is off-limits — squat, leg press, single- and double-leg kettlebell RDL, BFR glute bridges, and bilateral loading on the LEFT are all part of the current PT program.",
      "The earlier NWB/PWB restrictions (no left squat/leg press, no axial loading on the left, toe-touch only, hip-flexion cap, iliopsoas ban, no rowing erg, sub-maximal/PT-capped loads) are ALL retired. Do not reintroduce them or hedge suggestions around them, and do not cap load — progress like any healthy lifter.",
      "Progress load by feel and PT guidance; no special accommodations required.",
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
          "Full weight bearing — unrestricted resistance training. Squat, leg press, single/double-leg KB RDL, BFR bridges, calf raises — all part of PT, train like a healthy lifter.",
        durationDays: 42,
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

  // One-line phase summary — single source of truth for the prompt's phase
  // line so it can't drift from the constraints (it used to be hardcoded in
  // system-prompt.ts as well).
  phaseSummary:
    "The patient is in the FWB (full weight-bearing) phase, fully cleared for unrestricted resistance training as of 2026-05. Every prior weight-bearing and hip-flexion restriction is retired — squat, leg press, single/double-leg RDL, BFR bridges, and bilateral left-side loading are all permitted, with no load cap.",

  // The SAFE / PROHIBITED block lives here as prose because it's
  // condition-specific framing the AI prompt needs verbatim.
  aiPromptFragment: `PHASE: Full weight bearing (FWB), fully cleared for unrestricted resistance training (2026-05). Train the patient like a healthy, fit lifter.
SAFE: Everything. Bilateral and single-leg loading on BOTH sides, squat, leg press, single- and double-leg kettlebell RDL, BFR glute bridges, hinge/deadlift patterns, all machines, free weights, and standing work. Rowing erg, recumbent bike, swimming, canoeing all fine. Core and upper body unrestricted.
PROHIBITED: Nothing on movement grounds, and no load cap. Apply normal form and effort judgment only — a set stops on sharp localized left-hip pain, not on any standing categorical ban.
HIP FLEXION: Fully unrestricted.`,
};
