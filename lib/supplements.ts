// ===== LEFT LEG MAINTENANCE SUPPLEMENTS =====
// Interleaved with main exercises as supersets

export const SUPPLEMENT_LEFT_LEG: {
  base: string[];
  legsExtra: string[];
} = {
  base: ["Quad Sets", "Short Arc Quads", "Ankle Pumps & Circles"],
  legsExtra: [
    "Banded Terminal Knee Extensions",
    "Reclined Knee Extensions",
  ],
};

// ===== CORE SUPPLEMENT ROUTINES (per training day) =====

export interface CoreSupplementExercise {
  name: string;
  region: "Upper Abs" | "Lower Abs" | "Obliques";
}

export interface CoreSupplementDay {
  subtitle: string;
  exercises: CoreSupplementExercise[];
}

export const SUPPLEMENT_CORE: Record<string, CoreSupplementDay> = {
  "Push A": {
    subtitle: "Upper + Lower + Obliques",
    exercises: [
      { name: "Seated Cable Crunch", region: "Upper Abs" },
      { name: "Modified Hollow Body Hold", region: "Lower Abs" },
      { name: "Pallof Press with Overhead Reach", region: "Obliques" },
      { name: "Modified Side Plank Hip Dips", region: "Obliques" },
    ],
  },
  "Push B": {
    subtitle: "Upper + Lower + Obliques",
    exercises: [
      { name: "Modified Plank", region: "Upper Abs" },
      { name: "Reverse Crunch (R Leg Only)", region: "Lower Abs" },
      { name: "Single-Arm Seated Cable Row", region: "Obliques" },
      { name: "Seated Oblique Cable Crunch", region: "Obliques" },
    ],
  },
  "Pull A": {
    subtitle: "Upper + Lower + Obliques",
    exercises: [
      { name: "Weighted Crunch (Seated)", region: "Upper Abs" },
      { name: "Modified Hollow Body Flutter", region: "Lower Abs" },
      { name: "Seated Landmine Rotation", region: "Obliques" },
      { name: "Modified Side Plank with Band Row", region: "Obliques" },
    ],
  },
  "Pull B": {
    subtitle: "Upper + Lower + Obliques",
    exercises: [
      { name: "Modified Plank Shoulder Taps", region: "Upper Abs" },
      { name: "Slow Dead Bugs (Modified)", region: "Lower Abs" },
      { name: "High-to-Low Woodchop", region: "Obliques" },
      { name: "Suitcase Hold (Seated)", region: "Obliques" },
    ],
  },
  "Legs A": {
    subtitle: "Upper + Lower + Obliques",
    exercises: [
      { name: "Seated Cable Crunch", region: "Upper Abs" },
      { name: "Right Leg Lowers", region: "Lower Abs" },
      { name: "Pallof Alphabet", region: "Obliques" },
      { name: "Modified Side Plank Hold", region: "Obliques" },
    ],
  },
  "Legs B": {
    subtitle: "Upper + Lower + Obliques",
    exercises: [
      { name: "Modified Plank", region: "Upper Abs" },
      { name: "Reverse Crunch (R Leg Only)", region: "Lower Abs" },
      { name: "Low-to-High Woodchop", region: "Obliques" },
      { name: "Pallof ISO Hold", region: "Obliques" },
    ],
  },
};

// ===== EQUIPMENT KEY → NEARBY ID MAPPING =====
// Maps exercise `requires` keys to nearby-picker IDs so we can auto-highlight
// what equipment the current exercise uses and drive context-aware supersets.

export const EQUIP_TO_NEARBY: Record<string, string> = {
  cables: "cable_station",
  latpulldown: "cable_station",
  pullupbar: "pullup_bar",
  dipMachine: "dip_assist",
  barbell: "barbell_rack",
  bench: "adj_bench",
  bands: "bands",
  mat: "mat_floor",
  dumbbells: "adj_bench", // dumbbells are usually used at a bench
};

// ===== NEARBY-EQUIPMENT-DRIVEN SUPERSETS =====
// When a nearby equipment chip is selected, these supersets become available.
// Keyed by nearby equipment ID. Each has a condition and a suggestion.

export interface NearbySuperset {
  nearbyId: string;
  title: string;
  sets: string;
  instruction: string;
  safety: string;
}

export const NEARBY_SUPERSETS: NearbySuperset[] = [
  {
    nearbyId: "cable_station",
    title: "Left Ankle Dorsiflexion",
    sets: "2\u00D715",
    instruction:
      "Low cable, strap around top of left foot. Pull toes toward shin against cable resistance.",
    safety:
      "Tibialis anterior maintenance for gait recovery. Fully seated or reclined.",
  },
  {
    nearbyId: "flat_bench",
    title: "Quad Sets (Bench)",
    sets: "2\u00D710, 5s hold",
    instruction:
      "Sit on nearby bench. Press back of left knee into bench surface. Hold 5 seconds, release, repeat.",
    safety: "Pure isometric, zero joint stress.",
  },
  {
    nearbyId: "adj_bench",
    title: "Quad Sets (Bench)",
    sets: "2\u00D710, 5s hold",
    instruction:
      "Sit on nearby adjustable bench. Press back of left knee into bench surface. Hold 5 seconds, release, repeat.",
    safety: "Pure isometric, zero joint stress.",
  },
  {
    nearbyId: "mat_floor",
    title: "Ankle Pumps & Circles",
    sets: "2\u00D720",
    instruction:
      "Lie or sit on mat. Point and flex left foot, then circle ankle in both directions.",
    safety:
      "Zero load on fracture site. Maintains ankle ROM and promotes circulation.",
  },
  {
    nearbyId: "bands",
    title: "Banded Terminal Knee Extensions",
    sets: "2\u00D715",
    instruction:
      "Sit with band looped behind left knee and anchored ahead. Extend left knee against band resistance.",
    safety:
      "Pure knee extension \u2014 zero hip flexion demand. Band provides gentle progressive resistance.",
  },
  {
    nearbyId: "dip_assist",
    title: "Short Arc Quads",
    sets: "2\u00D712",
    instruction:
      "Sit on the dip machine seat. Place a rolled towel under left knee. Press knee down into towel, straighten last 30\u00B0 of knee extension.",
    safety:
      "Minimal range, pure quad activation. Zero hip flexor involvement.",
  },
];

// ===== CABLE SUPERSET (first cable exercise per workout) =====

export const CABLE_SUPERSET = {
  title: "Left Ankle Dorsiflexion",
  sets: "2\u00D715",
  instruction:
    "Low cable, strap around top of left foot. Pull toes toward shin against cable resistance.",
  safety:
    "Tibialis anterior maintenance for gait recovery. Fully seated or reclined.",
};

// ===== GENERIC SEATED SUPERSET (fallback for seated exercises) =====

export const GENERIC_SEATED_SUPERSET = {
  title: "Quad Sets",
  sets: "2\u00D710, 5s hold",
  instruction:
    "Press back of left knee into seat surface. Hold 5 seconds, release, repeat.",
  safety:
    "Pure isometric, zero joint stress. Can be done between any seated exercise.",
};

