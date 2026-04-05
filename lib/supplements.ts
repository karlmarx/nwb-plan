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

// ===== SUPPLEMENT EXERCISE DATA =====
// Exercise data for supplement exercises that aren't in the main EX database.
// Used by expanded supplement cards in workout-view.tsx.

export interface SupplementExData {
  sets: [string, string][];
  setup: string;
  execution: string;
  nwbCues: string;
  rest: number;
}

export const SUPPLEMENT_EX: Record<string, SupplementExData> = {
  // ── LEFT LEG ──────────────────────────────────────────────────────────────
  "Quad Sets": {
    sets: [["2", "10, 5s hold"]],
    setup: "1. Sit or lie with left leg extended. 2. Small towel under knee for comfort (optional).",
    execution: "1. Press back of left knee firmly into surface — maximum quad contraction. 2. Hold 5 seconds. 3. Release completely. Repeat 10×.",
    nwbCues: "⚠️ NWB SAFE: Pure isometric — zero joint movement, zero fracture stress. Do these between every exercise set.",
    rest: 0,
  },
  "Short Arc Quads": {
    sets: [["2", "12"]],
    setup: "1. Sit with rolled towel or foam roller under left knee (~30° bend). 2. Leg relaxed at start.",
    execution: "1. Exhale and straighten left knee from 30° to full extension. 2. Hold 1 second at top. 3. Inhale and lower over 3 seconds.",
    nwbCues: "⚠️ NWB SAFE: Last 30° of extension only — zero hip flexion, pure quad activation. No fracture load.",
    rest: 0,
  },
  "Ankle Pumps & Circles": {
    sets: [["2", "20"]],
    setup: "1. Sit or lie with left leg supported or slightly elevated. 2. Do these constantly — every hour minimum.",
    execution: "1. Point and flex left foot through full range (pumps). 2. Circle ankle clockwise, then counter-clockwise.",
    nwbCues: "⚠️ DVT PREVENTION: Zero fracture load. Maintains ankle ROM and promotes circulation. Do these CONSTANTLY throughout the day.",
    rest: 0,
  },
  "Banded Terminal Knee Extensions": {
    sets: [["2", "15"]],
    setup: "1. Sit with band behind left knee, anchored at low height ahead. 2. Knee starts slightly bent.",
    execution: "1. Exhale and extend against band. 2. Squeeze quad at full extension — hold 1 second. 3. Inhale and lower slowly.",
    nwbCues: "⚠️ NWB SAFE: Pure knee extension — zero hip flexion. Band provides gentle progressive resistance. No fracture load.",
    rest: 0,
  },
  "Reclined Knee Extensions": {
    sets: [["2", "12"]],
    setup: "1. Sit reclined, left leg at ~45° bend. 2. Bodyweight only — no added load.",
    execution: "1. Exhale and extend left knee to full extension. 2. Hold 1 second at top. 3. Inhale and lower over 3 seconds.",
    nwbCues: "⚠️ NWB SAFE: Bodyweight only. Zero hip flexion. Last 45° of extension only — no fracture load.",
    rest: 0,
  },

  // ── CORE ──────────────────────────────────────────────────────────────────
  "Seated Cable Crunch": {
    sets: [["3", "12"]],
    setup: "1. Rope on high cable. 2. Sit on bench facing stack. 3. Rope ends at temples.",
    execution: "1. Exhale and flex spine forward — elbows toward knees. 2. Contract abs hard at bottom. 3. Inhale and return with control.",
    nwbCues: "⚠️ NWB SAFE: Seated throughout. Left foot rests — zero weight. Spinal flexion only, no hip flexion.",
    rest: 60,
  },
  "Modified Hollow Body Hold": {
    sets: [["3", "20s"]],
    setup: "1. Lie flat on mat. 2. Right leg straight. 3. Left leg extended passively on floor — stays there.",
    execution: "1. Press lower back INTO mat. 2. Lift right leg ~6 inches. 3. Hold, breathe steadily.",
    nwbCues: "⚠️ NWB SAFETY (femoral neck fracture): Left leg on floor entire time. No bilateral raise. If back arches, lower right leg higher.",
    rest: 45,
  },
  "Pallof Press with Overhead Reach": {
    sets: [["3", "10/side"]],
    setup: "Seated sideways to a cable or band anchored at chest height. Hold handle at chest with both hands.",
    execution: "Press handle straight out, then reach overhead with arms extended. Return to chest. Resist rotation throughout.",
    nwbCues: "Seated only. Move deliberately — the overhead reach increases anti-rotation demand.",
    rest: 60,
  },
  "Modified Side Plank Hip Dips": {
    sets: [["3", "10/side"]],
    setup: "Side-lying on right forearm. Left leg rests passively on right leg. Lift right hip into modified side plank.",
    execution: "Lower right hip toward floor then lift back up. Full controlled range.",
    nwbCues: "Left leg is a passive rider. Core controls the dip — not hip momentum.",
    rest: 45,
  },
  "Modified Plank": {
    sets: [["3", "20s"]],
    setup: "Forearm plank with both knees on the floor. Left knee passive, right knee bearing weight.",
    execution: "Hold position with core braced, hips level. Don't let hips sag or bridge up.",
    nwbCues: "Knee-supported version only — no full plank. Left leg contributes no force.",
    rest: 45,
  },
  "Reverse Crunch (R Leg Only)": {
    sets: [["3", "12"]],
    setup: "Lie on mat. Left leg flat on floor (passive). Right leg bent at 90°, foot off floor.",
    execution: "Using abs, curl pelvis up — lift tailbone off mat. Lower with control. No hip flexor momentum.",
    nwbCues: "Left leg stays flat and passive throughout. Right leg is the only one assisting.",
    rest: 60,
  },
  "Single-Arm Seated Cable Row": {
    sets: [["3", "12/side"]],
    setup: "Sit at low cable row with single D-handle. Sit upright with slight forward lean, feet on platform.",
    execution: "Row handle to side of torso with controlled rotation. Full stretch at start, elbow past body at finish.",
    nwbCues: "Seated throughout, hips stable. Left foot rests on platform — no weight bearing.",
    rest: 60,
  },
  "Seated Oblique Cable Crunch": {
    sets: [["3", "12/side"]],
    setup: "Sit sideways on a bench next to high cable. Hold rope or D-handle at opposite ear with both hands.",
    execution: "Crunch sideways toward cable side. Obliques on far side stretch then contract. Return with control.",
    nwbCues: "Seated. Keep hips stable — only torso flexes laterally. Left leg passive.",
    rest: 60,
  },
  "Weighted Crunch (Seated)": {
    sets: [["3", "12"]],
    setup: "Sit upright on a bench or machine. Hold a plate or dumbbell at chest.",
    execution: "Flex spine forward — shoulders curl toward hips. Squeeze at top, lower slowly.",
    nwbCues: "Seated throughout. No left leg ground pressure. Use a support rail if balance is uncertain.",
    rest: 60,
  },
  "Modified Hollow Body Flutter": {
    sets: [["3", "15/side"]],
    setup: "Lie on mat. Left leg extended on floor (passive). Lower back pressed firmly to mat.",
    execution: "Flutter kick with right leg only — small rapid up-down movements. Maintain hollow position.",
    nwbCues: "Left leg stays on the floor. Do not bridge. Lower back contact is mandatory.",
    rest: 45,
  },
  "Seated Landmine Rotation": {
    sets: [["3", "10/side"]],
    setup: "Sit straddling a bench end. Hold loaded landmine bar end with both hands extended.",
    execution: "Rotate torso side-to-side, controlling the arc of the bar. Hips stay square.",
    nwbCues: "Hips face forward — only the torso rotates. Seated throughout.",
    rest: 60,
  },
  "Modified Side Plank with Band Row": {
    sets: [["3", "8/side"]],
    setup: "Modified side plank on knee and forearm. Resistance band anchored at low height ahead. Free hand holds band.",
    execution: "Hold the side plank while rowing band to ribcage with free hand. Don't rotate.",
    nwbCues: "Left knee is passive support. Hip flexion stays below 90°.",
    rest: 60,
  },
  "Modified Plank Shoulder Taps": {
    sets: [["3", "10 pairs"]],
    setup: "Knee-supported plank (both knees on floor). Core braced, hips level.",
    execution: "Lift one hand and tap opposite shoulder. Alternate sides without rotating hips.",
    nwbCues: "Knees on floor only — no full plank. Brace hard before each tap to prevent rotation.",
    rest: 45,
  },
  "Slow Dead Bugs (Modified)": {
    sets: [["3", "8/side"]],
    setup: "Lie on mat. Arms pointing to ceiling. Right knee bent at 90° (foot off floor). Left leg extended on floor.",
    execution: "Slowly lower right arm overhead while keeping right knee bent. Press lower back to mat. Return.",
    nwbCues: "Left leg stays on floor — one-limb version only. Lower back contact is the non-negotiable cue.",
    rest: 45,
  },
  "High-to-Low Woodchop": {
    sets: [["3", "12/side"]],
    setup: "Seated at cable station. High cable with rope or D-handle. Sit tall with core braced.",
    execution: "Pull cable diagonally from high-to-low across body, rotating torso. Control the eccentric return.",
    nwbCues: "Seated only. Hip flexion minimal — rotation drives the movement.",
    rest: 60,
  },
  "Right Leg Lowers": {
    sets: [["3", "10"]],
    setup: "Lie on mat. Left leg extended on floor (passive). Right leg straight up toward ceiling.",
    execution: "Slowly lower right leg toward floor, keeping lower back pressed down. Stop before back arches. Return slowly.",
    nwbCues: "Left leg is passive and flat. Only right leg moves. Strict lower-back contact throughout.",
    rest: 45,
  },
  "Pallof Alphabet": {
    sets: [["2", "A\u2013J/side"]],
    setup: "Seated sideways to cable or band. Hold handle at chest with both hands, arms extended.",
    execution: "Trace letters A through J with the handle, keeping arms extended. Resist rotation throughout.",
    nwbCues: "Seated. Small controlled movements. Core braced — the alphabet is the anti-rotation challenge.",
    rest: 60,
  },
  "Modified Side Plank Hold": {
    sets: [["3", "20s/side"]],
    setup: "Side-lying on right forearm and right knee. Left knee stacked passively on right.",
    execution: "Lift right hip off floor. Hold position with core braced. Breathe steadily.",
    nwbCues: "Knee-supported version. Left leg is a passive rider — do not push off with it.",
    rest: 45,
  },
  "Low-to-High Woodchop": {
    sets: [["3", "12/side"]],
    setup: "Seated at cable station. Low cable with rope or D-handle. Sit tall.",
    execution: "Pull cable diagonally from low-to-high across body, rotating torso. Follow movement with eyes. Control return.",
    nwbCues: "Seated only. Hip flexion minimal — rotation drives movement.",
    rest: 60,
  },
  "Pallof ISO Hold": {
    sets: [["3", "20s/side"]],
    setup: "Seated sideways to cable or band at chest height. Hold handle at chest with both hands.",
    execution: "Press handle straight out and HOLD. Resist any rotation. Breathe steadily through the hold.",
    nwbCues: "Seated. Start with lighter resistance to learn the anti-rotation demand.",
    rest: 45,
  },
  "Suitcase Hold (Seated)": {
    sets: [["3", "30s/side"]],
    setup: "Sit upright on a bench. Hold a dumbbell at your side (like a briefcase) in one hand.",
    execution: "Resist lateral lean — keep spine perfectly vertical while holding the weight. Switch sides.",
    nwbCues: "Seated. Core keeps you upright. No lateral hip shift.",
    rest: 45,
  },
};

