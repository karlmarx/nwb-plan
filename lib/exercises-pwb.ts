// ============================================================================
// PWB (Partial Weight-Bearing) phase additions — merged from .research/ snippets
// ----------------------------------------------------------------------------
// 2026-04-29 doctor clearance: toe-touch weight bearing on left with crutches,
// bilateral lower-body work allowed (NO left squat / leg press), hip flexion
// fully unrestricted, iliopsoas restriction lifted, NO rowing erg.
//
// Every entry below carries `phaseUnlock: "PWB-2026-04"` so the UI can render a
// "PWB" badge. None of the existing entries in `lib/exercises.ts` are modified.
// ============================================================================

import type { Exercise } from "./exercises";

const PWB: "PWB-2026-04" = "PWB-2026-04";

export const PWB_ADDITIONS: Record<string, Exercise> = {
  // ==================== PUSH ====================

  "Half-Kneeling Landmine Press": {
    id: "half_kneeling_landmine_press",
    name: "Half-Kneeling Landmine Press",
    requires: ["barbell", "mat"],
    category: "push",
    sets: [["3", "8-10/side"], ["3", "8-10/side"], ["3", "6-8/side"]],
    rest: 90,
    tempo: "3-1-2",
    setup:
      "Set up a landmine (or wedge a barbell in a corner). Place a folded mat or pad on the floor. Kneel on the RIGHT knee on the pad. LEFT foot forward, planted only as a TOE-TOUCH for balance — no push-off. Hold the loaded end of the barbell at shoulder height with the same-side (left) hand. Crutch parked within reach.",
    execution:
      "Press the bar up and forward at the natural landmine angle until the elbow is fully extended. Pause 1 second at the top. Lower with control over 3 seconds. The diagonal path is shoulder-friendly. Complete all reps one side, then switch knee position and arm.",
    nwbCues:
      "LEFT LEG SETUP: knee position determines which side bears the load. R knee on pad = R side loaded; L foot is forward but ONLY as a balance toe-touch. Do NOT push off the L foot to drive the press. If the L hip starts to feel pinched or the L femur loads, drop weight or switch to seated landmine. The crutch should be reachable for getting back up. PWB phase — left foot is for balance only.",
    why: "Half-kneeling locks out leg drive and lumbar arch, forcing pure shoulder + anti-rotation core work. The diagonal landmine path reduces shoulder impingement risk vs. straight overhead. Industry-standard rehab-to-performance pressing pattern (Cressey, [P]rehab).",
    safety: "safe",
    phaseUnlock: PWB,
    swaps: ["Landmine Press (seated)", "Seated DB OH Press", "Machine Shoulder Press"],
    amp: [
      "BASE: Light weight, even tempo.",
      "AMP 1: 2-second pause at top of each press.",
      "AMP 2: Add a 5-second isometric hold at the bar-at-forehead position before pressing.",
    ],
    machineVariants: [
      {
        id: "landmine_anchor",
        label: "Landmine Anchor",
        icon: "\u{1F3CB}️",
        description: "Dedicated landmine attachment bolted to the rack or floor",
        setupCues: [
          "Insert empty barbell into the landmine sleeve",
          "Add plates progressively — start with just the bar",
          "Position the loaded end at shoulder height (where you'll catch it)",
          "Pad on the floor for the R knee",
        ],
        superset: {
          title: "Banded Left TKE (Same Knee Down Position)",
          sets: "2x12",
          instruction:
            "Between sets: stand briefly with the crutch, then sit on the floor or a low bench. Loop a band behind your left knee, anchor it forward. Extend left knee against the band — last 30 deg of extension only.",
          safety:
            "Pure terminal knee extension, zero hip flexion demand. Light band only.",
          note: "If standing up between sides feels rough, just stay kneeling on the R knee and do left quad sets isometrically against the floor.",
        },
      },
      {
        id: "corner_wedge",
        label: "Corner-Wedged Barbell",
        icon: "\u{1F4D0}",
        description: "Barbell wedged into a padded corner — no landmine attachment",
        setupCues: [
          "Wedge the bar end into a padded floor corner or rolled-up towel",
          "Test the wedge by pressing once — the bar should not slide",
          "Same R-knee-down setup as landmine version",
          "Keep the wedge angle steeper than 60deg from the floor for stability",
        ],
      },
    ],
    constraints: { requiresIliopsoas: false, maxHipFlexion: 90, requiresWeightBearing: false },
    muscles: {
      primary: ["anterior deltoid", "triceps brachii"],
      secondary: ["lateral deltoid", "serratus anterior", "rectus abdominis", "external obliques"],
    },
  },

  "Z-Press": {
    id: "z_press",
    name: "Z-Press",
    requires: ["dumbbells", "mat"],
    category: "push",
    sets: [["3", "8-10"], ["3", "8-10"], ["3", "6-8"]],
    rest: 120,
    tempo: "2-1-3",
    setup:
      "Sit on the floor in a long-sit position. Legs extended in front, hip-width apart. Hold dumbbells at shoulder height, neutral or pronated grip. Sit tall — chest up, shoulders down. The L leg rests relaxed in extended position, no engagement.",
    execution:
      "Press both DBs straight overhead until elbows lock. Control the descent over 3 seconds. Do NOT lean back — the floor is your reference. Maintain a vertical torso throughout.",
    nwbCues:
      "LEFT LEG SETUP: extended on the floor in long-sit. The leg is passive — hip is at ~90 deg simply because of the seated geometry, not because you're loading it. If left hip flexor or femur starts to ache, bend the L knee slightly and rest the foot flat. PWB-unlocked: previously banned by the <90deg hip flexion rule. The hip flexion cap is now lifted.",
    why: "Eliminates leg drive and lumbar arch entirely. Brutal core stability demand. Builds the core-and-shoulder coordination needed to eventually return to standing OHP. BarBend / Advanced Human Performance both cite Z-press as a top-tier core+OH developer.",
    safety: "safe",
    phaseUnlock: PWB,
    swaps: ["Seated DB OH Press", "Half-Kneeling Landmine Press", "Machine Shoulder Press"],
    amp: [
      "BASE: Both legs extended, both arms pressing simultaneously.",
      "AMP 1: Alternate-arm pressing (one DB up at a time). Anti-rotation overload.",
      "AMP 2: Single-arm Z-press (one DB at a time, full sets per side). Maximum oblique demand.",
    ],
    constraints: { requiresIliopsoas: false, maxHipFlexion: 90, requiresWeightBearing: false },
    muscles: {
      primary: ["anterior deltoid", "lateral deltoid", "triceps brachii"],
      secondary: ["rectus abdominis", "external obliques", "internal obliques", "erector spinae"],
    },
  },

  "Flat DB Bench Press (PWB)": {
    id: "flat_db_bench_press_pwb",
    name: "Flat DB Bench Press (PWB)",
    requires: ["dumbbells", "bench"],
    category: "push",
    sets: [["4", "8-10"], ["4", "6-8"], ["4", "5-6"]],
    rest: 120,
    setup:
      "Set bench flat. Sit upright on the bench with DBs on knees. Kick DBs up to shoulder height as you lie back, leaving the LEFT foot LIFTED — rest the L foot on the bench beside your hip OR on a plyo box positioned next to the bench. R foot flat on the floor for stability. Crutch parked next to the bench.",
    execution:
      "Press DBs from chest level to lockout. 3-second eccentric. Squeeze chest at the top. Do NOT arch your back or push off the LEFT foot to drive reps — if you need leg drive, the weight is too heavy.",
    nwbCues:
      "LEFT LEG SETUP: foot is OFF the floor at all times during the set. Either rest it on the bench beside your hip (knee bent) or elevate it on a plyo box. The leg is dead weight throughout. R foot stays flat for stability and bench-to-floor transitions. PWB-unlocked: bilateral standing for set-up is now permitted, so flat bench is reachable.",
    why: "Full ROM bilateral chest press — the gold-standard chest builder. Floor press limits the stretch; this variant gives the full range with the L foot positioned safely off the floor.",
    safety: "safe",
    phaseUnlock: PWB,
    swaps: ["Barbell Floor Press", "DB Floor Press", "Incline DB Bench Press", "Machine Chest Press"],
    machineVariants: [
      {
        id: "bench_only",
        label: "Bench (L Foot on Bench)",
        icon: "\u{1F6CB}️",
        description: "Standard flat bench. Left foot rests on the bench beside hip.",
        setupCues: [
          "Set bench flat — make sure it's wide enough for L foot beside hip",
          "Sit, lift L foot onto the bench (knee bent ~90deg)",
          "Lie back keeping L foot on the bench throughout",
          "R foot flat on floor for stability",
        ],
      },
      {
        id: "bench_plus_plyobox",
        label: "Bench + Plyo Box (L Foot on Box)",
        icon: "\u{1F4E6}",
        description: "Bench with a plyo box positioned next to the bench at hip level for L foot support",
        setupCues: [
          "Place plyo box next to bench, height matches bench surface",
          "Sit on bench, transfer L foot to plyo box (knee bent ~90deg)",
          "L foot stays on box throughout the set — zero contact with floor",
          "R foot flat on floor",
        ],
      },
    ],
    constraints: { requiresIliopsoas: false, maxHipFlexion: 90, requiresWeightBearing: false },
    muscles: {
      primary: ["pectoralis major", "anterior deltoid", "triceps brachii"],
      secondary: ["serratus anterior"],
    },
  },

  "Single-Arm Cable Chest Press (Standing)": {
    id: "single_arm_cable_chest_press_standing",
    name: "Single-Arm Cable Chest Press (Standing)",
    requires: ["cables"],
    category: "push",
    sets: [["3", "10-12/side"], ["3", "10-12/side"], ["3", "8-10/side"]],
    rest: 90,
    setup:
      "Set cable to chest height. Stand sideways to the cable column with the working arm furthest from the column. R foot dominant; L foot toe-touched only for balance. Free hand braces the cable column or a nearby upright. Crutch within reach.",
    execution:
      "Press the D-handle forward at chest level until the arm is fully extended. Squeeze chest at lockout for 1 second. Return slowly with constant tension.",
    nwbCues:
      "LEFT LEG SETUP: weight is on R leg; L foot is toe-touch only. The free hand on the column does the balance work — DO NOT shift weight onto the L foot to brace. If L hip starts to load up during the set, take the load off the L side by spreading the stance out wider (more weight to R) and re-grip the column harder. PWB phase — left foot for balance only, no push-off.",
    why: "Constant cable tension through full ROM; standing position recruits the core as a stabilizer. Free-hand brace makes it a supported-standing exercise — legal in PWB.",
    safety: "caution",
    phaseUnlock: PWB,
    cableSuperset: true,
    swaps: ["Cable Chest Fly", "TRX Chest Press", "DB Floor Press"],
    constraints: { requiresIliopsoas: false, maxHipFlexion: 90, requiresWeightBearing: true },
    muscles: {
      primary: ["pectoralis major", "anterior deltoid"],
      secondary: ["triceps brachii", "serratus anterior", "external obliques", "internal obliques"],
    },
  },

  "Standing Landmine Press": {
    id: "standing_landmine_press",
    name: "Standing Landmine Press",
    requires: ["barbell"],
    category: "push",
    sets: [["3", "8-10/side"], ["3", "8-10/side"], ["3", "6-8/side"]],
    rest: 120,
    setup:
      "Set up landmine with empty bar (add weight conservatively). Stand facing the loaded end with feet hip-width. RIGHT foot bears the weight; LEFT foot is forward and toe-touched only for balance. Hold the bar end in one hand at shoulder height. Crutch parked against the rack within reach.",
    execution:
      "Press the bar up and forward along the natural landmine arc until the arm is locked out overhead-and-forward. Lower under control. Maintain a vertical torso — do NOT lean back to help the press up.",
    nwbCues:
      "LEFT LEG SETUP: stand mostly on R leg. L foot toe-touches the floor about 6-12in in front for a wider base — purely for balance. If you feel any axial loading on the L femur, shift the L foot back so it carries even less, or step back to the half-kneeling variant. Start with empty bar to dial in the position. The crutch should be reachable.",
    why: "Modest axial load (the angled bar transmits less vertical compression than overhead pressing). Bridges from half-kneeling toward eventual return to standing OHP. Strong unilateral shoulder + oblique sling work.",
    safety: "caution",
    phaseUnlock: PWB,
    swaps: ["Half-Kneeling Landmine Press", "Landmine Press (seated)", "Seated DB OH Press"],
    amp: [
      "BASE: Empty bar, even tempo, focus on bar path.",
      "AMP 1: Light load + 2-second hold at lockout.",
      "AMP 2: Moderate load + alternate pressing (left, right, left, right) without rest — anti-rotation under fatigue.",
    ],
    constraints: { requiresIliopsoas: false, maxHipFlexion: 90, requiresWeightBearing: true },
    muscles: {
      primary: ["anterior deltoid", "lateral deltoid", "triceps brachii"],
      secondary: ["serratus anterior", "external obliques", "internal obliques", "rectus abdominis"],
    },
  },

  "Close-Grip Pin Press": {
    id: "close_grip_pin_press",
    name: "Close-Grip Pin Press",
    requires: ["barbell", "bench"],
    category: "push",
    sets: [["4", "5-6"], ["4", "4-5"], ["5", "3-5"]],
    rest: 150,
    setup:
      "Set bench flat inside a power rack. Set safety pins just above your chest when lying down (test before loading). Load bar evenly. Sit upright on the bench, then lie back keeping the LEFT foot LIFTED (rest on the bench beside hip OR on a plyo box). Grip the bar at shoulder-width or slightly narrower. R foot flat on floor.",
    execution:
      "Press the bar from a complete dead stop on the safety pins. Drive elbows in toward the torso to bias triceps. Lock out at the top, control 3 seconds back to the pins, full pause on the pins (1 second), explode up.",
    nwbCues:
      "LEFT LEG SETUP: foot OFF the floor for the entire set — either on the bench beside hip or elevated on a plyo box. Do NOT arch the back or push off the L foot. The pins act as your spotter — if a rep fails, the bar settles on the pins safely. Crutch parked within reach for getting up after the set.",
    why: "Heavy triceps overload via dead-stop concentric. The pins eliminate stretch reflex and provide built-in spotter safety, making it the safest heavy triceps press for solo training. Close grip biases triceps and inner pec.",
    safety: "caution",
    phaseUnlock: PWB,
    swaps: ["Barbell Floor Press", "Lying Skull Crushers", "Machine Chest Press"],
    constraints: { requiresIliopsoas: false, maxHipFlexion: 90, requiresWeightBearing: false },
    muscles: {
      primary: ["triceps brachii", "pectoralis major"],
      secondary: ["anterior deltoid"],
    },
  },

  "Seated Cable Shoulder Press": {
    id: "seated_cable_shoulder_press",
    name: "Seated Cable Shoulder Press",
    requires: ["cables", "bench"],
    category: "push",
    sets: [["3", "10-12"], ["3", "10-12"], ["3", "8-10"]],
    rest: 90,
    setup:
      "Position a bench in front of a low cable pulley. Attach D-handles or a short bar to a low cable on each side (use two cable stations or set up close to a single low pulley with a single handle for unilateral work). Sit on the bench with back upright. Both feet flat on floor; left foot rests passively, no push-off.",
    execution:
      "Press the handle(s) from shoulder height to overhead lockout. Control the descent for 3 seconds. Maintain constant cable tension throughout the ROM — do not let the cable slack at the bottom.",
    nwbCues:
      "LEFT LEG SETUP: seated throughout, both feet on floor for stability but the L foot is purely a balance contact — no weight shift, no push-off. Bench provides spinal support; back stays upright. PWB phase — fully seated, low risk to the L femur.",
    why: "Cable tension is constant from shoulder to lockout, unlike DBs (where the bottom is a dead zone). Fully seated, low-risk. Fills the gap between Cable Lateral Raise (Seated) and Seated DB OH Press — a true cable shoulder press.",
    safety: "safe",
    phaseUnlock: PWB,
    cableSuperset: true,
    swaps: ["Seated DB OH Press", "Machine Shoulder Press", "Seated Arnold Press"],
    machineVariants: [
      {
        id: "two_stations_dbar",
        label: "Two Cable Stations",
        icon: "⚖️",
        description: "Two low cable pulleys flanking the bench, D-handle each side, bilateral press",
        setupCues: [
          "Position bench between two cable stations",
          "Attach D-handles to each low pulley",
          "Set seat so handles start at shoulder height",
          "Press both arms simultaneously",
        ],
      },
      {
        id: "single_station_unilateral",
        label: "Single Station — Unilateral",
        icon: "\u{1F4CC}",
        description: "Single cable station, alternating arms or full sets per side",
        setupCues: [
          "Position bench in line with the low pulley",
          "Press one arm at a time — free hand on knee for stability",
          "Full sets per side, then switch",
        ],
      },
    ],
    constraints: { requiresIliopsoas: false, maxHipFlexion: 90, requiresWeightBearing: false },
    muscles: {
      primary: ["anterior deltoid", "lateral deltoid", "triceps brachii"],
      secondary: ["serratus anterior", "trapezius"],
    },
  },

  "Cable Crossover (PWB)": {
    id: "cable_crossover_pwb",
    name: "Cable Crossover (PWB)",
    requires: ["cables"],
    category: "push",
    sets: [["3", "12-15"], ["3", "12-15"], ["3", "10-12"]],
    rest: 60,
    setup:
      "Set both cable arms HIGH. Stand between the two cables with R foot bearing weight, L foot toe-touched only as a balance reference. Step forward with R foot to take the cables under tension. Slight forward lean from the hips. Crutch within reach.",
    execution:
      "With slight elbow bend, bring both hands forward and down in a sweeping arc until they meet in front of the lower chest. Squeeze the chest hard for 1 second. Return slowly with control.",
    nwbCues:
      "LEFT LEG SETUP: R foot is the staked-down anchor; L foot is forward toe-touch only. Because both arms are working bilaterally, the cables pull symmetrically — there's no rotational force trying to twist you. Keep stance narrow so the L toe-touch isn't reaching far. If balance falters, drop to one knee on a pad (R knee down, L toe-touch forward) and finish the set there.",
    why: "Reaches the inner pec from an angle DBs and barbells can't. Standing position recruits core stabilizers. The bilateral nature means no anti-rotation demand on the L hip — lower risk than single-arm standing presses.",
    safety: "caution",
    phaseUnlock: PWB,
    cableSuperset: true,
    swaps: ["Cable Chest Fly", "Pec Deck Reverse Fly"],
    machineVariants: [
      {
        id: "high_to_low",
        label: "High-to-Low (Lower Pec)",
        icon: "↙️",
        description: "Cables set high, sweep down to meet at lower chest level",
        setupCues: [
          "Both cables at the highest setting",
          "Sweep down and toward the midline",
          "Meet hands at hip / lower-chest level",
        ],
      },
      {
        id: "low_to_high",
        label: "Low-to-High (Upper Pec)",
        icon: "↗️",
        description: "Cables set low, sweep up to meet at chin level",
        setupCues: [
          "Both cables at the lowest setting",
          "Sweep up and toward the midline",
          "Meet hands at chin / upper-chest level",
          "Better upper-chest activation than high-to-low",
        ],
      },
      {
        id: "mid_chest",
        label: "Mid (Standard Crossover)",
        icon: "➡️",
        description: "Cables at chest height, sweep horizontal",
        setupCues: [
          "Cables at chest height",
          "Pure horizontal adduction",
          "Meet hands directly in front of sternum",
        ],
      },
    ],
    constraints: { requiresIliopsoas: false, maxHipFlexion: 90, requiresWeightBearing: true },
    muscles: {
      primary: ["pectoralis major"],
      secondary: ["anterior deltoid", "serratus anterior"],
    },
  },

  // ==================== PULL ====================

  "Straight-Arm Pulldown": {
    id: "straight_arm_pulldown",
    name: "Straight-Arm Pulldown",
    requires: ["cables"],
    category: "pull",
    sets: [["3", "12-15"], ["3", "12-15"], ["3", "10-12"]],
    rest: 75,
    setup:
      "Set cable to highest pulley. Attach a straight bar or rope. Stand or half-kneel facing the stack with arms extended overhead, slight forward lean from the hips. Crutches within reach if standing — feet shoulder-width, weight balanced (toe-touch on left is fine).",
    execution:
      "Keeping arms STRAIGHT (slight elbow bend locked in), drive the bar in a wide arc down to your thighs. Squeeze the lats hard at the bottom — think 'punch the floor with the bar.' Return slowly to the overhead start position with full lat stretch.",
    nwbCues:
      "Half-kneeling on the LEFT knee is the most stable option — pad the knee on a folded mat. If standing, distribute weight bilaterally with toe-touch left; do not lean into the stack with body weight. Keep the lumbar spine neutral; the hinge is at the hips, not the low back.",
    why: "EMG research shows the straight-arm pulldown produces the highest latissimus activation of any single-joint lat exercise — even higher than the barbell pullover. Pure lat isolation without elbow flexion bleed-off.",
    safety: "safe",
    phaseUnlock: PWB,
    swaps: ["Lat Pulldown (Wide)", "Neutral Grip Pulldown", "TRX Pulldown", "Band Pulldown"],
    machineVariants: [
      {
        id: "cable_straight_bar",
        label: "Cable + Straight Bar",
        icon: "⚖️",
        description: "Standard cable station with a long straight bar attachment",
        setupCues: [
          "Attach straight bar to high pulley",
          "Step back so cable is taut at full extension overhead",
          "Slight hip hinge — chest tall, lumbar neutral",
        ],
      },
      {
        id: "cable_rope",
        label: "Cable + Rope",
        icon: "⚖️",
        description: "Rope attachment for wider lat squeeze at the bottom (split rope past hips)",
        setupCues: [
          "Attach rope to high pulley",
          "Pull rope ends apart at bottom for extra lat squeeze",
          "Slightly less load than straight bar at the same setting",
        ],
      },
      {
        id: "band_high_anchor",
        label: "Band at Rack",
        icon: "\u{1F380}",
        description: "Heavy band looped over a high anchor point on a rack",
        setupCues: [
          "Loop band over top of power rack or pull-up bar",
          "Half-kneel below the anchor for stability",
          "Resistance ramps up at the bottom — great for warm-ups",
        ],
      },
    ],
    cableSuperset: true,
    constraints: { requiresIliopsoas: false, maxHipFlexion: 60, requiresWeightBearing: false },
    muscles: {
      primary: ["latissimus dorsi"],
      secondary: ["teres major", "lower trapezius", "rectus abdominis"],
    },
  },

  "Single-Arm DB Row (Bench-Supported)": {
    id: "single_arm_db_row_bench",
    name: "Single-Arm DB Row (Bench-Supported)",
    requires: ["dumbbells", "bench"],
    category: "pull",
    sets: [["4", "8-10"], ["4", "8-10"], ["4", "6-8"]],
    rest: 90,
    setup:
      "Set bench flat. Place LEFT hand and LEFT knee on the bench (bench supports the left side completely). RIGHT foot flat on the floor, soft knee. Dumbbell in the right hand hanging straight down. Spine in a neutral, table-top line. Reverse hand/foot positions to row the LEFT arm: RIGHT hand and RIGHT knee on the bench, LEFT foot lightly toe-touch on the floor.",
    execution:
      "Pull the dumbbell up to the lower ribcage by driving the elbow back and squeezing the shoulder blade toward the spine. Squeeze 1 second at the top. Lower with control over 2-3 seconds, full stretch at the bottom.",
    nwbCues:
      "When rowing the LEFT side (right knee on bench), the LEFT foot is just a kickstand on the floor — toe-touch only, do NOT push through it. The bench takes the load. If you feel any femur/groin sensation on left, switch to Chest-Supported DB Row instead.",
    why: "The OG single-arm row — scales heavy, fixes L/R asymmetry, and the bench-supported stance keeps the spine fully unloaded. With one knee on the bench there is no standing balance demand.",
    safety: "safe",
    phaseUnlock: PWB,
    swaps: ["Chest-Supported DB Row", "Seated Cable Row", "One-Arm Cable Row", "TRX Row (Seated)"],
    visual: "        []\n         \\\n     ____ \\___\n    |   O    |\n    |  /|    | (L hand + L knee on bench)\n    | + |\n    +---+\n        R foot flat",
    constraints: { requiresIliopsoas: false, maxHipFlexion: 90, requiresWeightBearing: false },
    muscles: {
      primary: ["latissimus dorsi", "rhomboids", "trapezius"],
      secondary: ["biceps brachii", "posterior deltoid", "teres major"],
    },
  },

  "Chest-Supported Landmine Row": {
    id: "chest_supported_landmine_row",
    name: "Chest-Supported Landmine Row",
    requires: ["barbell", "bench"],
    category: "pull",
    sets: [["4", "8-10"], ["4", "6-8"], ["4", "5-6"]],
    rest: 120,
    setup:
      "Anchor one end of a barbell in a landmine attachment (or wedge it into a corner with a towel). Set an incline bench to 30deg in front of the bar so the loaded sleeve clears under the bench. Lie face-down on the bench with chest fully supported, both arms hanging down toward the bar. Feet rest on the floor or footplate — zero load.",
    execution:
      "Grip the loaded sleeve with both hands (or use a V-handle attachment). Row the bar up to your chest by driving the elbows back and squeezing the shoulder blades together. Hold 1 second at the top. Lower under control to a full lat stretch.",
    nwbCues:
      "FACE-DOWN on the bench means feet are passive — they just rest on the floor or step. Zero femoral load, zero balance demand. This is the safest way to row heavy. If the bench is too low and the bar's weighted end can't clear, prop the foot of the bench up on a plate.",
    why: "Landmine rowing has a unique pulling arc that hits the lats and mid-back through a long stretch position. The chest-supported version eliminates the standing hip-hinge of a Meadows or T-bar row — critical for protecting the left femoral neck from axial compression.",
    safety: "safe",
    phaseUnlock: PWB,
    swaps: ["Chest-Supported DB Row", "Seated Cable Row", "Single-Arm DB Row (Bench-Supported)"],
    machineVariants: [
      {
        id: "two_hand_sleeve",
        label: "Two-Hand Sleeve",
        icon: "\u{1F3CB}️",
        description: "Both hands gripping the loaded barbell sleeve directly",
        setupCues: [
          "Wrap a towel around the sleeve for grip if needed",
          "Both hands close together, neutral grip",
          "Pull the sleeve to your sternum",
        ],
      },
      {
        id: "vhandle_landmine",
        label: "Landmine V-Handle",
        icon: "⚖️",
        description: "T-bar / landmine V-handle attachment for a more secure grip",
        setupCues: [
          "Slide V-handle under the loaded sleeve",
          "Neutral close grip, slight forward angle",
          "Best when going heavy",
        ],
      },
      {
        id: "single_arm_landmine",
        label: "Single-Arm Landmine",
        icon: "\u{1F4AA}",
        description: "One arm at a time, gripping the sleeve directly — fix L/R asymmetry",
        setupCues: [
          "Same chest-supported bench setup",
          "One hand on bench / one arm rowing",
          "Lighter load — emphasize the squeeze",
        ],
      },
    ],
    constraints: { requiresIliopsoas: false, maxHipFlexion: 30, requiresWeightBearing: false },
    muscles: {
      primary: ["latissimus dorsi", "rhomboids", "trapezius"],
      secondary: ["posterior deltoid", "biceps brachii", "teres major"],
    },
  },

  "Half-Kneeling Single-Arm Cable Row": {
    id: "half_kneeling_single_arm_cable_row",
    name: "Half-Kneeling Single-Arm Cable Row",
    requires: ["cables", "mat"],
    category: "pull",
    sets: [["3", "10-12/arm"], ["3", "10-12/arm"], ["3", "8-10/arm"]],
    rest: 90,
    setup:
      "Set cable pulley to chest height. Attach a single D-handle. Kneel facing the cable on a mat or pad: LEFT knee down, RIGHT foot forward and flat (foot under the same-side knee). Grip the handle with the LEFT hand — same side as the kneeling knee. Switch sides for the second arm: RIGHT knee down, LEFT foot forward (toe-touch is fine here), RIGHT hand on the handle.",
    execution:
      "Pull the handle to your lower ribcage, driving the elbow straight back. Squeeze the shoulder blade. Resist any rotation of the trunk — hips and shoulders stay perfectly square to the cable. Return with control.",
    nwbCues:
      "When the LEFT knee is down: weight on the right foot, left foot trailing back. When RIGHT knee is down (rowing the right arm): the LEFT foot is the front leg — toe-touch only, knee bent at 90deg, no push-off through it. PAD THE LEFT KNEE every time it touches the floor. The trunk-twist failure mode is the danger: if you feel any pelvic rotation, drop weight or revert to Seated Cable Row.",
    why: "Single-arm pull with anti-rotation core demand. EMG studies show ~38% greater core activation vs the standing single-arm row. Kneeling on the left knee was previously off-limits under the strict NWB protocol; now it's a high-value rehab pattern.",
    safety: "caution",
    phaseUnlock: PWB,
    swaps: ["One-Arm Cable Row", "Seated Cable Row", "TRX Row (Seated)"],
    cableSuperset: true,
    constraints: { requiresIliopsoas: false, maxHipFlexion: 90, requiresWeightBearing: false },
    muscles: {
      primary: ["latissimus dorsi", "rhomboids"],
      secondary: ["biceps brachii", "posterior deltoid", "external obliques", "internal obliques"],
    },
  },

  "Inverted Row (Barbell in Rack)": {
    id: "inverted_row_barbell_rack",
    name: "Inverted Row (Barbell in Rack)",
    requires: ["barbell"],
    category: "pull",
    sets: [["3", "10-12"], ["3", "10-12"], ["3", "8-10"]],
    rest: 90,
    setup:
      "Set a barbell in a power rack at hip height. Lie on the floor face-up under the bar so it's directly over your sternum. Grip the bar with overhand grip slightly outside shoulder width. RIGHT foot flat on the floor, knee bent ~90deg; LEFT leg extended out and resting on the floor (heel down) OR bent with the foot flat for symmetry once weight tolerance is high enough.",
    execution:
      "Brace the body in a straight line from heels (or knees) to shoulders. Pull your chest up to the bar by driving the elbows down and back. Squeeze shoulder blades hard at the top. Lower with control over 2-3 seconds.",
    nwbCues:
      "ADJUST DIFFICULTY by bar height: higher bar = easier, lower bar = harder. Start with the bar at chest level (easier) before going to hip level. The LEFT leg can stay extended on the floor with heel down — this is fine under the new clearance. If the left hip protests, bend the left knee and rest on the floor (not pushing).",
    why: "Bodyweight horizontal pull with adjustable difficulty (just change bar height). Strong rhomboid and mid-trap recruitment. Travel-friendly fallback when machines are unavailable.",
    safety: "safe",
    phaseUnlock: PWB,
    swaps: ["TRX Row (Seated)", "Chest-Supported DB Row", "Seated Cable Row", "Band Row (Seated)"],
    visual: "    ===========  (Bar in rack)\n         |\n         O <- chest under bar\n        /|\\\n       / | \\\n      /  +  \\___\n     R       L (extended)",
    constraints: { requiresIliopsoas: false, maxHipFlexion: 45, requiresWeightBearing: false },
    muscles: {
      primary: ["rhomboids", "trapezius", "latissimus dorsi"],
      secondary: ["biceps brachii", "posterior deltoid", "rectus abdominis"],
    },
  },

  "Chin-Up (Supinated)": {
    id: "chin_up_supinated",
    name: "Chin-Up (Supinated)",
    requires: ["pullupbar"],
    category: "pull",
    sets: [["4", "5-8"], ["4", "5-8"], ["4", "3-5 Weighted"]],
    rest: 150,
    setup:
      "Hang from the pull-up bar with an UNDERHAND (supinated, palms facing you) grip, hands shoulder-width apart. Use a tall box / step to get up: step up with the RIGHT foot first, grip the bar, then ease the LEFT foot onto the box (toe-touch is OK now — the new clearance permits this). Step off the box once gripped, both legs hang.",
    execution:
      "From a dead hang, pull your chin OVER the bar by driving the elbows down. Lats AND biceps both contribute. Lower under control over 2-3 seconds. Full extension at the bottom.",
    nwbCues:
      "GETTING DOWN: Lower yourself back to the box, do NOT drop. The supinated grip puts the biceps in their strongest mechanical position — expect to do more reps than a pull-up. While hanging, keep the body still — zero kipping or kicking.",
    why: "EMG research shows the chin-up's supinated grip drives biceps brachii and brachialis significantly harder than a pronated pull-up, while keeping lat activation comparable. Pairs well with bicep day. Hanging itself decompresses the spine.",
    safety: "safe",
    phaseUnlock: PWB,
    swaps: ["Weighted Pull-Up", "Lat Pulldown (Wide)", "Neutral Grip Pulldown", "TRX Pulldown"],
    constraints: { requiresIliopsoas: false, maxHipFlexion: 0, requiresWeightBearing: false },
    muscles: {
      primary: ["latissimus dorsi", "biceps brachii", "brachialis"],
      secondary: ["rhomboids", "lower trapezius", "teres major", "forearm flexors"],
    },
  },

  "Dead Hang + Scapular Pull-Up": {
    id: "dead_hang_scap_pullup",
    name: "Dead Hang + Scapular Pull-Up",
    requires: ["pullupbar"],
    category: "pull",
    sets: [["3", "30-60s hang"], ["3", "8-12 scap reps"], ["3", "30-60s hang"]],
    rest: 60,
    setup:
      "Hang from the pull-up bar with a shoulder-width overhand grip. Use a tall box to mount; step up with the RIGHT foot, grip, then ease the LEFT foot up (toe-touch fine), then step off the box. Both legs hang completely passive. PASSIVE HANG: relax the shoulders — let the shoulder blades ride up toward your ears. SCAPULAR PULL-UP: from passive hang, depress the shoulder blades (pull them DOWN and back, away from your ears) WITHOUT bending the elbows. Body rises an inch or two from pure scap depression.",
    execution:
      "Set 1 (hang): Hold a passive dead hang for 30-60 seconds, breathing normally. Set 2 (scap): From a passive hang, perform 8-12 scapular pull-ups — down/back, hold 1 second, return. Arms STRAIGHT throughout. Set 3 (hang): Repeat the dead hang, longer if possible.",
    nwbCues:
      "Hanging is a TOP-TIER NWB exercise: zero femoral load, decompresses the spine, builds grip endurance. Step DOWN onto the box — do NOT drop off. If the left wrist or elbow complains, drop hang time and build back up. Cue: 'Crush a tennis ball under each shoulder blade' for scap depression.",
    why: "Spine decompression (gentle traction increases vertebral spacing), shoulder mobility, lower-trap activation, and grip endurance — one trial in climbers showed ~25% grip-endurance gain in 4 weeks of intermittent hangs. Frequently prescribed in shoulder-rehab protocols. With this much pressing volume in the program, hanging is essentially free shoulder/spinal medicine.",
    safety: "safe",
    phaseUnlock: PWB,
    swaps: ["Weighted Pull-Up", "Finger-Assist One-Arm Pull-Up", "TRX Pulldown"],
    constraints: { requiresIliopsoas: false, maxHipFlexion: 0, requiresWeightBearing: false },
    muscles: {
      primary: ["latissimus dorsi", "lower trapezius", "forearm flexors"],
      secondary: ["rhomboids", "rotator cuff", "rectus abdominis"],
    },
  },

  "Spider Curl": {
    id: "spider_curl",
    name: "Spider Curl",
    requires: ["dumbbells", "bench"],
    category: "pull",
    sets: [["3", "10-12"], ["3", "10-12"], ["3", "8-10"]],
    rest: 75,
    setup:
      "Set incline bench to ~45deg. Lie FACE-DOWN with chest fully supported on the pad and arms hanging straight down off the top. Both feet rest on the floor or footplate — passive. Dumbbells in each hand, neutral or supinated grip.",
    execution:
      "Curl the dumbbells up by bending only at the elbows — upper arms stay perpendicular to the floor (locked in by the bench). Squeeze the biceps hard at the top. Lower with a 3-second eccentric to a full stretch at the bottom. Constant tension.",
    nwbCues:
      "Face-down position means feet are completely passive — zero balance demand, zero femoral load. The bench prevents any body english. If you can swing weight, the bench angle is too steep; lower it. Excellent for fixing a body-english cheating habit.",
    why: "Bench-supported face-down position = zero possibility of momentum cheating. Pure bicep isolation under constant mechanical tension. A great complement to Preacher Curl (different strength curve) and Incline DB Curl (different shoulder position).",
    safety: "safe",
    phaseUnlock: PWB,
    swaps: ["Preacher Curls", "Incline DB Curl", "Hammer Curls", "Cable Curl", "TRX Curl"],
    visual: "       O\n      /|\\___\n     / | \\\n    +--+--+ (Bench at 45deg)\n   //   \\\\\n  []     [] (DBs hang straight down)",
    constraints: { requiresIliopsoas: false, maxHipFlexion: 0, requiresWeightBearing: false },
    muscles: {
      primary: ["biceps brachii", "brachialis"],
      secondary: ["brachioradialis", "forearm flexors"],
    },
  },

  "Band Pull-Apart": {
    id: "band_pull_apart",
    name: "Band Pull-Apart",
    requires: ["bands"],
    category: "pull",
    sets: [["3", "15-20"], ["3", "15-20"], ["3", "12-15"]],
    rest: 45,
    setup:
      "Sit on a bench or stand with feet shoulder-width (toe-touch left is fine). Hold a light resistance band with both hands at chest height, arms extended straight in front, palms down (pronated) or palms up (supinated for more rear-delt bias). Hands shoulder-width apart on the band.",
    execution:
      "Pull the band APART by driving the hands out wide, leading with the pinkies. Squeeze the shoulder blades together hard at the end position — like crushing a walnut between them. Hands reach the chest line at the end. Return with control.",
    nwbCues:
      "Seated is preferred (zero balance demand). Standing is permitted under the new clearance — distribute weight bilaterally with toe-touch left, no shifting. KEEP THE ELBOWS STRAIGHT but not locked. If the elbows bend, you're cheating with biceps — lighter band.",
    why: "Targets the same rear-delt and lower-trap fibers as the reverse pec deck — EMG-validated as effective rear-delt work. Cheap, portable, infinitely scalable by band thickness. Perfect warm-up before any pressing or pulling work.",
    safety: "safe",
    phaseUnlock: PWB,
    swaps: ["Seated Face Pulls", "Reverse Fly", "TRX Face Pull", "Pec Deck Reverse Fly"],
    constraints: { requiresIliopsoas: false, maxHipFlexion: 90, requiresWeightBearing: false },
    muscles: {
      primary: ["posterior deltoid", "rhomboids"],
      secondary: ["lower trapezius", "rotator cuff"],
    },
  },

  "Seated DB Shrug": {
    id: "seated_db_shrug",
    name: "Seated DB Shrug",
    requires: ["dumbbells", "bench"],
    category: "pull",
    sets: [["3", "12-15"], ["3", "10-12"], ["4", "8-10"]],
    rest: 75,
    setup:
      "Sit on a flat bench, back tall, feet flat on the floor (toe-touch left is fine). Hold a dumbbell in each hand at arm's length by your sides, neutral grip (palms facing in). Shoulders slightly retracted, head neutral.",
    execution:
      "Shrug the shoulders STRAIGHT UP toward the ears — do NOT roll them forward or backward. Hold the top contraction for 1-2 seconds, squeezing the upper traps. Lower under control to a full stretch at the bottom.",
    nwbCues:
      "SEATED is the key cue — the bench distributes the load through your hips and into the seat, NOT down through the femoral necks. Do NOT use a standing barbell shrug (axial column load through both femurs). If you can't sit comfortably with the DBs at your sides without rounding the shoulders, the weight is too heavy.",
    why: "Upper-trap volume that's been missing from the program. The seated position routes the dumbbell load through the bench and pelvis, sparing the left femoral neck from the compressive column-load that a standing barbell shrug would create.",
    safety: "safe",
    phaseUnlock: PWB,
    swaps: ["Seated Face Pulls", "Lat Pulldown (Wide)"],
    machineVariants: [
      {
        id: "seated_db",
        label: "Seated Dumbbell",
        icon: "\u{1F4AA}",
        description: "Standard seated DB shrug — most accessible variant",
        setupCues: [
          "Bench upright or 90deg",
          "Heavy DBs at arm's length, neutral grip",
          "Pure vertical movement at the shoulders",
        ],
      },
      {
        id: "machine_shrug_plate",
        label: "Plate-Loaded Shrug Machine",
        icon: "\u{1F3CB}️",
        description: "Hammer Strength / plate-loaded seated shrug machine — fixed arc, easy to load heavy",
        setupCues: [
          "Sit, chest tall, grip the handles",
          "Use the seated position even if the machine label says 'standing'",
          "Squeeze hard at the top — the machine's fixed path makes cheating hard",
        ],
        requires: ["legpress"],
      },
      {
        id: "smith_seated",
        label: "Smith Machine (Seated)",
        icon: "\u{1F4CC}",
        description: "Bench placed inside a Smith rack — pull the bar straight up off the safeties for shrugs",
        setupCues: [
          "Set Smith safeties just below standing arm extension",
          "Sit on a flat bench inside the rack — the bar comes off the safeties at thigh level",
          "Pure vertical shrug — the Smith locks the path, sparing the spine",
        ],
      },
      {
        id: "cable_shrug_seated",
        label: "Cable Shrug (Seated, Low Pulleys)",
        icon: "⚖️",
        description: "Sit on a bench between two low cables; cable handles in each hand for constant tension",
        setupCues: [
          "Two low cables, D-handles, sit on bench between them",
          "Constant tension through the full ROM",
          "Lighter loads — prioritize squeeze and stretch",
        ],
        requires: ["cables", "bench"],
      },
    ],
    constraints: { requiresIliopsoas: false, maxHipFlexion: 90, requiresWeightBearing: false },
    muscles: {
      primary: ["trapezius"],
      secondary: ["rhomboids", "forearm flexors"],
    },
  },

  // ==================== CORE ====================

  "Hollow Body Hold (Bilateral)": {
    id: "hollow_body_hold_bilateral",
    name: "Hollow Body Hold (Bilateral)",
    requires: ["mat"],
    category: "core",
    sets: [["3", "20s"], ["3", "30s"], ["4", "45s"]],
    rest: 45,
    tempo: "isometric",
    phase: 2,
    tier: 1,
    setup:
      "Lie supine on a mat. Exhale fully — press the lumbar spine into the floor (posterior pelvic tilt). Both legs extend straight, hovering 4-6 inches off the ground, toes pointed, quads engaged. Arms overhead by ears, chin tucked.",
    execution:
      "Hold the position. Ribs knit down toward hips — do NOT let them flare. Active quad squeeze on BOTH legs. Breathe steadily through the brace. The lumbar must stay imprinted on the mat for the entire hold — if it lifts, you came up too high or your legs dropped too low.",
    nwbCues:
      "Both legs are now active — this is the canonical gymnastics hollow. Posterior pelvic tilt + active quad squeeze keeps the lumbar imprinted and the hip flexors loaded without pinching. If the lower back arches even slightly off the mat, bend the knees (tuck regression) and re-imprint before extending again. No axial load on either femur — supine.",
    why: "Foundation isometric for every gymnastic skill (front lever, planche, kipping). With clearance, the canonical bilateral version unlocks. Anti-extension under co-contraction load.",
    safety: "safe",
    phaseUnlock: PWB,
    swaps: ["Hollow Body Hold", "Dead Bug (R Leg Only)", "Forearm Plank Saw"],
    amp: [
      "BASE: Tuck variant — knees bent 90deg, arms forward. Hold 20s.",
      "AMP 1: Full bilateral hollow, arms overhead, 30s.",
      "AMP 2: Full hollow + 5-10 lb plate held overhead, 45s. Add slow rocks (6 in fore/aft) once 60s static is clean. Expect failure ~30-40s with plate.",
    ],
    constraints: { requiresIliopsoas: true, maxHipFlexion: 30, requiresWeightBearing: false },
    muscles: {
      primary: ["rectus abdominis", "transverse abdominis", "hip flexors"],
      secondary: ["quadriceps", "internal obliques", "external obliques"],
    },
  },

  "Reverse Crunch (Bilateral)": {
    id: "reverse_crunch_bilateral",
    name: "Reverse Crunch (Bilateral)",
    requires: ["mat"],
    category: "core",
    sets: [["3", "10-12"], ["3", "12-15"], ["4", "12-15"]],
    rest: 45,
    tempo: "2-1-3",
    phase: 2,
    tier: 1,
    setup:
      "Lie supine on a mat with arms by your sides, palms down for stability. Knees bent ~90deg, feet hovering or lightly touching the floor. Lumbar imprinted on the mat from the start.",
    execution:
      "Lift hips 4-6 inches off the floor by tucking the pelvis posteriorly and drawing both knees toward the chest — 2-count up, 1-second squeeze at top, 3-count lower. The motion is a hip TUCK, not a leg LIFT — your lower abs do the work, not your hip flexors. Reset and repeat.",
    nwbCues:
      "Both legs now active — this is the canonical bilateral reverse crunch. The eccentric is where the work happens; do not crash back down. No axial load on the femur because the legs never touch the floor with body weight.",
    why: "Top-tier lower-rectus EMG per Escamilla 2006. Lowest spine compression of any bilateral hip-flexion-driven core move. The cleanest reentry to flexion-pattern work post-clearance.",
    safety: "safe",
    phaseUnlock: PWB,
    swaps: ["Hollow Body Hold (Bilateral)", "Dead Bug (R Leg Only)", "V-Up (Bilateral)"],
    amp: [
      "BASE: Floor reverse crunch, knees bent, 2-1-3 tempo, 3x12.",
      "AMP 1: Bench reverse crunch — hands grip bench above head. 3x12.",
      "AMP 2: 30deg decline bench reverse crunch (head higher than feet) — top-tier EMG (Escamilla 2006). 3x10. Add an ankle-weight pair for AMP 3 once 15 reps decline is clean.",
    ],
    constraints: { requiresIliopsoas: true, maxHipFlexion: 90, requiresWeightBearing: false },
    muscles: {
      primary: ["rectus abdominis", "hip flexors"],
      secondary: ["transverse abdominis", "internal obliques"],
    },
  },

  "Hanging Leg Raise (Bilateral)": {
    id: "hanging_leg_raise_bilateral",
    name: "Hanging Leg Raise (Bilateral)",
    requires: ["pullupbar"],
    category: "core",
    sets: [["3", "8-10"], ["3", "10-12"], ["4", "8-10"]],
    rest: 90,
    tempo: "2-1-3",
    phase: 2,
    tier: 2,
    setup:
      "Hang from a pull-up bar with a shoulder-width overhand or mixed grip. Scapulae depressed (shoulders pulled DOWN away from ears) — never hang passively from the connective tissue. Both legs together.",
    execution:
      "Drive both knees toward the chest with a slight posterior pelvic tilt at the top — 2-count up, 1-second squeeze, 3-count lower. Do not swing — every rep starts from a dead stop in a strict hollow hang. Progression target: knee tuck -> straight-leg parallel -> toes-to-bar.",
    nwbCues:
      "Both legs active — the move the medical update explicitly cleared. Scapular depression is non-negotiable: it protects the shoulder AND aligns the lats to assist the flexion. If anterior hip pain shows up at the top of the rep, regress to knee tuck and shorten the eccentric. Stop if any femoral neck symptoms.",
    why: "Hanging knee-up is one of the highest upper + lower rectus EMG exercises measured (Escamilla 2006). Bilateral hanging is the headline move unlocked by clearance.",
    safety: "caution",
    phaseUnlock: PWB,
    swaps: ["R-Leg Toes-to-Bar", "Captain's Chair Knee Raise (Bilateral)", "Reverse Crunch (Bilateral)"],
    amp: [
      "BASE: Hanging Knee Tuck — knees bent 90deg, drive to hip height, 2-1-3 tempo. 3x8-10.",
      "AMP 1: Hanging Straight Leg Raise to parallel — legs straight, drive to 90deg, 3-count down. 3x6-8.",
      "AMP 2: Toes-to-Bar (Bilateral) — full ROM, slight kip permitted, then progress to strict. 3x5-8. Spine compression is significant — do not chain sets.",
    ],
    constraints: { requiresIliopsoas: true, maxHipFlexion: 120, requiresWeightBearing: false },
    muscles: {
      primary: ["rectus abdominis", "hip flexors", "iliopsoas"],
      secondary: ["latissimus dorsi", "forearm flexors", "internal obliques", "external obliques"],
    },
  },

  "V-Up (Bilateral)": {
    id: "v_up_bilateral",
    name: "V-Up (Bilateral)",
    requires: ["mat"],
    category: "core",
    sets: [["3", "8-10"], ["3", "10-12"], ["3", "8-10"]],
    rest: 60,
    tempo: "2-1-3",
    phase: 2,
    tier: 2,
    setup:
      "Lie supine in a hollow body position — arms overhead, both legs straight and hovering, lumbar imprinted on the mat.",
    execution:
      "Simultaneously lift torso AND legs toward each other into a V-shape, hands reaching for shins or feet — 2-count up, 1-second touch, 3-count return to hollow (DO NOT touch the mat at the bottom). The hollow position bookends every rep — this is what makes it a real core exercise rather than a hip-flexor swing.",
    nwbCues:
      "Both legs active. The eccentric (lower) is where the work is — do not crash back down. The bottom of the rep returns to hollow, not to the floor. If you feel any anterior hip pain at peak, drop to tuck-up regression (knees bend at the top of the V instead of staying straight).",
    why: "Combines anti-extension (hollow) + dynamic flexion. Hits rectus abdominis through full range with co-activation of hip flexors. Bilateral version unlocked by clearance.",
    safety: "safe",
    phaseUnlock: PWB,
    swaps: ["Hollow Body Hold (Bilateral)", "Reverse Crunch (Bilateral)", "Bicycle Crunch (Bilateral)"],
    amp: [
      "BASE: Tuck-Up — start hollow, knees pull to chest + chest meets knees, return to hollow. 3x10.",
      "AMP 1: Half V-Up alternating — single arm + opposite leg meet, alternate sides. 3x10/side.",
      "AMP 2: Full V-Up — both legs straight, both arms reach toes, return to hollow. 3x8.",
      "AMP 3 (stretch goal): Jackknife Sit-Up — straight arms + straight legs meet at apex, no hollow rest. 3x6.",
    ],
    constraints: { requiresIliopsoas: true, maxHipFlexion: 90, requiresWeightBearing: false },
    muscles: {
      primary: ["rectus abdominis", "hip flexors"],
      secondary: ["internal obliques", "external obliques", "quadriceps"],
    },
  },

  "Bicycle Crunch (Bilateral)": {
    id: "bicycle_crunch_bilateral",
    name: "Bicycle Crunch (Bilateral)",
    requires: ["mat"],
    category: "core",
    sets: [["3", "30s"], ["3", "45s"], ["3", "60s"]],
    rest: 45,
    tempo: "2-2 (slow pedal)",
    phase: 2,
    tier: 1,
    setup:
      "Lie supine, hands lightly behind the head (do not pull on the neck). Both legs lift off the floor with knees bent 90deg. Lumbar imprinted.",
    execution:
      "Pedal one leg out toward extension while the other knee draws to the opposite elbow with a thoracic rotation — 2-count each side, full ROM, no momentum. The rotation comes from the ribcage over the pelvis, not from the hips twisting.",
    nwbCues:
      "Both legs cycle now. The slow tempo removes momentum and forces the obliques to control the entire range. If the lumbar arches off the mat as a leg extends, shorten the extension range. No axial load — supine.",
    why: "EMG ranks bicycle crunch at or near the top for both rectus abdominis and obliques in the 13-exercise comparison (Francis & Frelinger / ACE Fitness). Best bang-for-buck oblique movement unlocked by clearance.",
    safety: "safe",
    phaseUnlock: PWB,
    swaps: ["Bicycle Crunch (R Leg Only)", "V-Up (Bilateral)", "Russian Twist (Seated Bench)"],
    amp: [
      "BASE: Slow 2-2 tempo, partial extension, 30s.",
      "AMP 1: Slow tempo, full extension (leg parallel to floor), 45s.",
      "AMP 2: Ankle-weight pair (2.5-5 lb) + full extension + 3-second hold at peak rotation, 45s. Expect failure ~35s.",
    ],
    constraints: { requiresIliopsoas: true, maxHipFlexion: 90, requiresWeightBearing: false },
    muscles: {
      primary: ["external obliques", "internal obliques", "rectus abdominis"],
      secondary: ["hip flexors", "transverse abdominis"],
    },
  },

  "Captain's Chair Knee Raise (Bilateral)": {
    id: "captains_chair_knee_raise_bilateral",
    name: "Captain's Chair Knee Raise (Bilateral)",
    requires: ["captainsChair"],
    category: "core",
    sets: [["3", "10-12"], ["3", "12-15"], ["4", "10-12"]],
    rest: 60,
    tempo: "2-1-3",
    phase: 2,
    tier: 2,
    setup:
      "Step into the captain's chair (VKR). Forearms on pads, back against the backrest, scapulae depressed. Both legs hang straight down.",
    execution:
      "Drive both knees toward the chest with a posterior pelvic tilt at the top — 2-count up, 1-second squeeze, 3-count lower. No swinging. The pads bear all the body weight; legs work without ground reaction.",
    nwbCues:
      "Both legs active. Captain's chair removes any ground reaction force, so this is mechanically gentler on the femur than the hanging version. Watch for kipping — the back must stay glued to the pad. Stop if any anterior hip pain.",
    why: "Top-tier rectus abdominis EMG (ACE Fitness comparative study). Captain's chair eliminates grip fatigue and stabilization demand, leaving the abs to do the work.",
    safety: "safe",
    phaseUnlock: PWB,
    swaps: ["Captain's Chair SLR (Right)", "Hanging Leg Raise (Bilateral)", "Reverse Crunch (Bilateral)"],
    amp: [
      "BASE: Bilateral knee raise, 2-1-3 tempo, 3x10-12.",
      "AMP 1: Bilateral straight-leg raise to parallel, 3-count down, 3x8-10.",
      "AMP 2: L-sit hold at parallel for 10-15s x 3 sets, OR drive bilateral toes toward elbows for 6-8 reps.",
    ],
    constraints: { requiresIliopsoas: true, maxHipFlexion: 90, requiresWeightBearing: false },
    muscles: {
      primary: ["rectus abdominis", "hip flexors", "iliopsoas"],
      secondary: ["internal obliques", "external obliques"],
    },
  },

  "Ab Wheel Rollout (Bilateral Kneeling)": {
    id: "ab_wheel_rollout_bilateral_kneeling",
    name: "Ab Wheel Rollout (Bilateral Kneeling)",
    requires: ["mat"],
    category: "core",
    sets: [["3", "6-8"], ["3", "8-10"], ["4", "8-10"]],
    rest: 90,
    tempo: "3s out, 2s pull",
    phase: 2,
    tier: 2,
    setup:
      "Kneel on a thick mat with both knees together, ab wheel (or barbell with plates) in front. Glutes squeezed hard from the start — this is what prevents lumbar extension as you roll out.",
    execution:
      "Roll forward as far as you can while maintaining a hollow body line — 3-count out, 2-count pull back. Glutes stay tight throughout. Pull back using the abs, not the hip flexors. Start with partial ROM (30-50% of full extension) and build distance week by week.",
    nwbCues:
      "Both knees on the pad — the bilateral kneeling base distributes the (sub-bodyweight) load through the patella and tibia, not through the femoral neck. If anterior hip pinches at the bottom, shorten the rollout distance. Standing rollout is OFF the menu until full PWB / off crutches.",
    why: "Anti-extension under dynamic load — among the highest demands you can place on the anterior chain without spine flexion. The kneeling base is biomechanically clean for this PWB phase.",
    safety: "caution",
    phaseUnlock: PWB,
    swaps: ["Barbell Rollout (R-Knee)", "Body Saw (Sliders)", "Hollow Body Hold (Bilateral)"],
    amp: [
      "BASE: Partial ROM (50%), 3x6-8.",
      "AMP 1: Full ROM (forehead to floor at end-range), 3x8-10.",
      "AMP 2: Half-kneeling (right knee + left foot toe-touch back), 3x6/side. Standing-from-wall rollouts deferred until PT clearance.",
    ],
    constraints: { requiresIliopsoas: false, maxHipFlexion: 30, requiresWeightBearing: false },
    muscles: {
      primary: ["rectus abdominis", "transverse abdominis"],
      secondary: ["latissimus dorsi", "gluteus maximus", "serratus anterior"],
    },
  },

  "Tall-Kneeling Pallof Press": {
    id: "tall_kneeling_pallof_press",
    name: "Tall-Kneeling Pallof Press",
    requires: ["cables", "mat"],
    category: "core",
    sets: [["3", "10/side"], ["3", "12/side"], ["3", "12/side"]],
    rest: 45,
    tempo: "2-3-2",
    phase: 2,
    tier: 1,
    setup:
      "Tall-kneeling on a thick mat with both knees together (or hip-width). Cable anchored at chest height to your side. Hold the handle at the sternum with both hands, elbows tucked. Glutes squeezed, ribs stacked over hips — no lumbar arch.",
    execution:
      "Press the handle straight out to full arm extension — 2-count out, 3-second hold at extension, 2-count return. The cable wants to rotate your torso toward the stack; you fight it. Both hips and torso stay perfectly square. Switch sides — anchor on the right for left-oblique work, vice versa.",
    nwbCues:
      "Tall-kneeling distributes the load bilaterally through both kneecaps — no axial femoral neck loading. Crucially: do not let the left knee unload onto the toes; keep it pressed flat. If anterior hip pinches with the cable load, drop the weight or regress to seated.",
    why: "Tall-kneeling removes hip drive and forces the trunk to do all the anti-rotation work. McGill calls this 'core stiffness' — the foundational quality for spinal stability under load.",
    safety: "safe",
    phaseUnlock: PWB,
    swaps: ["Pallof Press (Seated)", "Pallof Overhead Reach"],
    amp: [
      "BASE: Light cable, 2-3-2 tempo, 10/side.",
      "AMP 1: Moderate cable + 5-second hold at extension, 12/side.",
      "AMP 2: Heavy cable + slow overhead reach from the extended position (anti-rotation + anti-extension combined), 8-10/side. Expect grip and oblique cofailure.",
    ],
    constraints: { requiresIliopsoas: false, maxHipFlexion: 0, requiresWeightBearing: false },
    muscles: {
      primary: ["external obliques", "internal obliques", "transverse abdominis"],
      secondary: ["gluteus maximus", "rectus abdominis", "quadratus lumborum"],
    },
  },

  "TRX Knee Tuck (Bilateral)": {
    id: "trx_knee_tuck_bilateral",
    name: "TRX Knee Tuck (Bilateral)",
    requires: ["trx", "mat"],
    category: "core",
    sets: [["3", "8-10"], ["3", "10-12"], ["4", "10-12"]],
    rest: 60,
    tempo: "2-1-3",
    phase: 2,
    tier: 2,
    setup:
      "Both feet in TRX foot cradles, straps adjusted to mid-shin height. Hands on a thick mat in a high plank position. Scapulae protracted (push the floor away). Both legs straight.",
    execution:
      "Drive both knees toward the chest with a posterior pelvic tilt — 2-count tuck, 1-second squeeze, 3-count return to plank. Maintain shoulder protraction throughout. The straps make every rep an unstable plank — your serratus and core fight to keep you flat.",
    nwbCues:
      "Both feet in straps now. The TRX SUPPORTS the legs against gravity, so this is actually mechanically gentler on the femur than ground-based knee drives. The shoulder demand is the limiter for most people. If anterior hip pinches at peak knee tuck, shorten the range.",
    why: "Suspension-based knee tuck is the foundational TRX core movement and the gateway to pike, atomic push-up, and atomic pike (per ACE Fitness progression).",
    safety: "safe",
    phaseUnlock: PWB,
    swaps: ["Reverse Crunch (Bilateral)", "Body Saw (Sliders)", "Hollow Body Hold (Bilateral)"],
    amp: [
      "BASE: TRX Plank — both feet in straps, hold 30-45s.",
      "AMP 1: TRX Knee Tuck (Bilateral) — full tuck, 2-1-3 tempo, 3x10.",
      "AMP 2: TRX Pike — straight-leg pike, hips toward ceiling, 3x8.",
      "AMP 3 (stretch): TRX Atomic Pike — push-up + pike combo, 3x6. Prerequisite: 60s clean TRX plank.",
    ],
    constraints: { requiresIliopsoas: true, maxHipFlexion: 90, requiresWeightBearing: false },
    muscles: {
      primary: ["rectus abdominis", "hip flexors", "transverse abdominis"],
      secondary: ["serratus anterior", "anterior deltoid", "internal obliques"],
    },
  },

  "L-Sit (Bilateral)": {
    id: "l_sit_bilateral",
    name: "L-Sit (Bilateral)",
    requires: ["parallettes"],
    category: "core",
    sets: [["3", "10s"], ["4", "10s"], ["5", "15s"]],
    rest: 90,
    tempo: "isometric",
    phase: 2,
    tier: 3,
    setup:
      "Sit between parallettes (or push-up stands) with hands gripping the bars at hips. Shoulders depressed (ears far from shoulders), elbows locked. Both legs extend straight forward, parallel to the floor.",
    execution:
      "Press into the bars to lift the entire body off the floor. Both legs straight, toes pointed, parallel to floor. Hold for time. Posterior pelvic tilt + active quad squeeze + scapular depression. Breathe.",
    nwbCues:
      "Both legs now active and straight. The full bilateral L-sit puts hip flexion at ~85-90deg — now permitted. If anterior hip pinches at full extension, regress to one-leg L-sit (already in the codebase). No axial load — body is fully suspended on the hands.",
    why: "Skill-ceiling gymnastic isometric. Iliopsoas + lower abs + triceps + scapular depressors all maxed. Builds toward V-sit, manna, and tuck planche transitions.",
    safety: "caution",
    phaseUnlock: PWB,
    swaps: ["Parallette L-Sit", "Captain's Chair Knee Raise (Bilateral)"],
    amp: [
      "BASE: Tuck L-Sit (knees to chest, hips off floor), 3x10s.",
      "AMP 1: Advanced Tuck L-Sit (shins parallel to floor, knees bent 90deg), 3x10s.",
      "AMP 2: One-Leg L-Sit (one straight, one tucked), 3x10s/side.",
      "AMP 3: Straddle L-Sit (legs wide), 3x10s.",
      "AMP 4: Full Bilateral L-Sit, 3x10-20s. Goal: 30s clean.",
    ],
    constraints: { requiresIliopsoas: true, maxHipFlexion: 90, requiresWeightBearing: false },
    muscles: {
      primary: ["rectus abdominis", "hip flexors", "iliopsoas", "triceps brachii"],
      secondary: ["quadriceps", "lower trapezius", "latissimus dorsi"],
    },
  },

  // ==================== LOWER ====================

  "Bilateral Seated Leg Curl": {
    id: "bilateral_seated_leg_curl",
    name: "Bilateral Seated Leg Curl",
    requires: ["hamcurl"],
    category: "legs",
    sets: [["3", "10-12"], ["3", "10-12"], ["4", "8-10"]],
    rest: 90,
    setup:
      "Sit in seated leg-curl machine with BOTH feet under the ankle pad. Adjust the back pad so your knees align with the machine's pivot. Thigh pad snug but not crushing the quads. Crutches parked within arm's reach during the set.",
    execution:
      "Curl both heels under the seat with a 2-second concentric. 1-second squeeze at peak flexion. 3-second eccentric back to start — never let the stack slam. Last working set: drop set x2 (drop ~25%, AMRAP, drop again, AMRAP).",
    nwbCues:
      "PWB phase: both legs are now allowed to load. Force lives across the knee joint only — zero axial compression through the femoral neck. Start at ~50% of pre-injury bilateral working weight and reassess after week 1. Stop if you feel any anterior groin or proximal hamstring (ischial) sting on the left.",
    why: "Restores bilateral hamstring strength and corrects the right/left asymmetry built up during the NWB block. Seated machine isolates knee flexion with full lumbar/hip support.",
    safety: "safe",
    phaseUnlock: PWB,
    swaps: ["Prone Ham Curl (Right)", "Stab Ball Ham Curl (Right)"],
    machineVariants: [
      {
        id: "seated_pin",
        label: "Seated Pin-Loaded",
        icon: "\u{1F4CC}",
        description: "Selectorized seated hamstring curl machine — fastest for drop sets",
        setupCues: [
          "Pin to working weight (start at ~50% of pre-injury bilateral 1RM)",
          "Both feet under the ankle pad, equal spacing",
          "Thigh pad snug; spine flush against back pad",
          "Pre-plan drop weights (e.g. 100 -> 80 -> 60)",
        ],
      },
      {
        id: "seated_plate",
        label: "Seated Plate-Loaded",
        icon: "\u{1F3CB}️",
        description: "Plate-loaded seated curl — load each side evenly",
        setupCues: [
          "Load plates evenly on both sides",
          "Both feet under ankle pad",
          "Position knees on machine pivot line",
        ],
      },
    ],
    constraints: { requiresIliopsoas: false, maxHipFlexion: 90, requiresWeightBearing: false },
    muscles: {
      primary: ["hamstrings", "biceps femoris", "semitendinosus"],
      secondary: ["gastrocnemius"],
    },
  },

  "Bilateral Leg Extension": {
    id: "bilateral_leg_extension",
    name: "Bilateral Leg Extension",
    requires: ["cables"],
    category: "legs",
    sets: [["3", "12-15"], ["3", "10-12"], ["4", "8-10"]],
    rest: 90,
    setup:
      "Sit in leg extension machine with BOTH shins under the pad. Pad rests just above the ankle. Adjust the back pad so the knee axis aligns with the machine pivot. Hands on the side handles.",
    execution:
      "Extend both knees to full lockout with a 2-second concentric. 2-second SQUEEZE at the top. 3-second eccentric. Last set: drop set x2.",
    nwbCues:
      "PWB phase: both legs now load freely. Open-chain — zero axial compression through the femoral neck on either side. If the left quad fires noticeably weaker than the right (expected after NWB block), keep loads matched anyway and let the left catch up over 4-6 weeks.",
    why: "Direct quadriceps hypertrophy with the smallest possible joint load envelope. Re-establishes left/right quad symmetry, which is the single biggest predictor of return-to-sport readiness in lower-limb rehab.",
    safety: "safe",
    phaseUnlock: PWB,
    swaps: ["SL Leg Extension (Right)"],
    machineVariants: [
      {
        id: "seated_pin_ext",
        label: "Seated Pin-Loaded",
        icon: "\u{1F4CC}",
        description: "Selectorized leg extension machine",
        setupCues: [
          "Pin to working weight",
          "Both shins under the pad, ankles aligned",
          "Knees aligned with machine pivot",
        ],
      },
      {
        id: "seated_plate_ext",
        label: "Plate-Loaded",
        icon: "\u{1F3CB}️",
        description: "Plate-loaded leg extension — load both sides evenly",
        setupCues: [
          "Load plates evenly across the lever arm",
          "Both shins under the pad",
          "Drive through the top half of the rep where leverage is lowest",
        ],
      },
    ],
    constraints: { requiresIliopsoas: false, maxHipFlexion: 90, requiresWeightBearing: false },
    muscles: {
      primary: ["quadriceps", "rectus femoris", "vastus medialis"],
      secondary: [],
    },
  },

  "Bilateral Hip Thrust": {
    id: "bilateral_hip_thrust",
    name: "Bilateral Hip Thrust",
    requires: ["barbell", "bench"],
    category: "legs",
    sets: [["3", "8-10"], ["4", "8-10"], ["4", "6-8"]],
    rest: 150,
    setup:
      "Shoulders on a flat bench, both feet planted shoulder-width apart, ~12-18 inches in front of the bench so the shins are vertical at the top. Barbell across the hips on a thick pad. Crutches within reach for the un-rack.",
    execution:
      "Drive both heels into the floor and extend the hips until the torso is parallel to the floor. Squeeze glutes hard at the top for 1-2 seconds. Chin tucked, ribs down, posterior pelvic tilt at lockout. Lower with control to roughly 60-70deg hip flexion (just kiss the floor with the bar; do not bottom out).",
    nwbCues:
      "PWB phase: bilateral hip thrust now allowed. Loading vector is perpendicular to the femoral neck axis — the femoral head/neck sees shear and bending, NOT axial compression. Start at ~50% of pre-injury 1RM and progress 5-10 lb/week if pain-free. Watch the left foot at lockout — if it drifts inward or the heel lifts, you're compensating; reset. Tuck pelvis at the top to protect the lumbar spine.",
    why: "Highest-EMG glute exercise that does not transmit axial load through the femoral neck. Primary bilateral glute and posterior chain rebuilder for the PWB phase.",
    safety: "caution",
    phaseUnlock: PWB,
    diagram: "hip-thrust-support",
    swaps: ["B-Stance Hip Thrust (Right-Dominant)", "SL Hip Thrust (Right)", "SL Glute Bridge (Right)"],
    machineVariants: [
      {
        id: "barbell",
        label: "Barbell",
        icon: "\u{1F3CB}️",
        description: "Classic Bret Contreras-style barbell hip thrust on a flat bench",
        setupCues: [
          "Flat bench against a wall or rack so it doesn't slide",
          "Pad on barbell across the hips (Hampton or rolled towel)",
          "Both feet shoulder-width, shins vertical at lockout",
          "Roll the bar over the legs into hip-crease starting position",
        ],
        requires: ["barbell", "bench"],
      },
      {
        id: "machine_glute_drive",
        label: "Glute Drive Machine",
        icon: "\u{1F9B5}",
        description: "Plate-loaded or pin-loaded hip thrust machine — locks the load path",
        setupCues: [
          "Sit in the machine with the back pad in the scapula notch",
          "Strap or padded bar across the hips",
          "Both feet on platform, shoulder-width",
          "Best entry point for the first 2-3 weeks of bilateral hip thrusting",
        ],
        requires: ["legpress"],
      },
      {
        id: "dumbbell",
        label: "Dumbbell",
        icon: "\u{1F4AA}",
        description: "Single heavy DB held vertically over the hip crease — light setup",
        setupCues: [
          "Heavy DB held vertically with both hands over the hip crease",
          "Towel or pad between DB and pelvis",
          "Same foot placement as barbell version",
          "Cap weight at single-DB max; for heavier loads, switch to barbell",
        ],
        requires: ["dumbbells", "bench"],
      },
    ],
    constraints: { requiresIliopsoas: false, maxHipFlexion: 90, requiresWeightBearing: false },
    muscles: {
      primary: ["gluteus maximus", "hamstrings"],
      secondary: ["quadriceps", "erector spinae", "gluteus medius"],
    },
  },

  "B-Stance Hip Thrust (Right-Dominant)": {
    id: "b_stance_hip_thrust_right",
    name: "B-Stance Hip Thrust (Right-Dominant)",
    requires: ["barbell", "bench"],
    category: "legs",
    sets: [["3", "8-10"], ["3", "8-10"], ["4", "6-8"]],
    rest: 120,
    setup:
      "Shoulders on a flat bench. RIGHT foot flat on the floor as the working foot, shin vertical. LEFT foot in toe-touch position 6-8 inches forward of the right, ball of the foot lightly touching the floor as a kickstand. Barbell on a pad across the hips.",
    execution:
      "Drive primarily through the RIGHT heel to extend the hips. The left foot maintains a light toe-touch — never push off it. Squeeze glutes at the top, 1-2 second hold. Lower with control. Right side carries ~70% of the load; left ~30% as a balance kickstand only.",
    nwbCues:
      "Toe-touch left foot is the load cap on the left side — if you start pushing off it, the percentage shifts and the femoral neck loads more than intended. Keep left ball-of-foot light. If balance is shaky, narrow the stagger (closer feet) until comfortable. Use this as the bridge between SL Hip Thrust (Right) and Bilateral Hip Thrust.",
    why: "Loads the right glute heavily while introducing the left side to gentle proprioceptive contact. Bret Contreras' canonical bridge from unilateral to bilateral hip extension. ~70/30 force split.",
    safety: "caution",
    phaseUnlock: PWB,
    diagram: "hip-thrust-support",
    swaps: ["SL Hip Thrust (Right)", "Bilateral Hip Thrust"],
    machineVariants: [
      {
        id: "barbell_b_stance",
        label: "Barbell B-Stance",
        icon: "\u{1F3CB}️",
        description: "Standard barbell hip thrust with kickstand left foot",
        setupCues: [
          "Right foot flat, shin vertical at top of rep",
          "Left foot toe-touch, 6-8 inches forward of right",
          "Light pad on barbell across hips",
        ],
      },
      {
        id: "db_b_stance",
        label: "Dumbbell B-Stance",
        icon: "\u{1F4AA}",
        description: "DB held vertically over the hips — lighter setup, easier transitions",
        setupCues: [
          "Single heavy DB on hip crease (towel between)",
          "Right foot flat, left toe-touch kickstand",
          "Easier to set up alone than barbell",
        ],
        requires: ["dumbbells", "bench"],
      },
    ],
    constraints: { requiresIliopsoas: false, maxHipFlexion: 90, requiresWeightBearing: false },
    muscles: {
      primary: ["gluteus maximus", "hamstrings"],
      secondary: ["quadriceps", "erector spinae", "gluteus medius"],
    },
  },

  "Bilateral Hip Abduction (Machine)": {
    id: "bilateral_hip_abduction_machine",
    name: "Bilateral Hip Abduction (Machine)",
    requires: ["cables"],
    category: "legs",
    sets: [["3", "12-15"], ["3", "12-15"], ["3", "10-12"]],
    rest: 60,
    setup:
      "Sit in the hip abduction machine with both knees against the outside pads. Adjust the starting width so the knees begin in a moderate inside position (not pinned together). Spine against the back pad, hands on the side handles.",
    execution:
      "Press both knees outward against the pads with a 2-second concentric. 1-second pause at full abduction. 3-second eccentric back to start. Last set: 1.5 reps (full abduct -> half-return -> full abduct -> controlled return) for a metabolic finisher.",
    nwbCues:
      "Seated and supported — zero axial compression through the femoral neck on either side. The left glute medius is likely the most deconditioned muscle in the body after the NWB block. Start with the machine at ~30% of what feels easy and build up over 2-3 weeks. End-range pause is where the medius does its real work.",
    why: "Direct bilateral glute medius / minimus reactivation. Most efficient way to rebuild the muscle that drives gait stability (Trendelenburg prevention) on return to full weight bearing.",
    safety: "safe",
    phaseUnlock: PWB,
    swaps: ["Seated Hip Abduction — Band", "Banded Clamshells", "Side-Lying Hip Abduction (Left)"],
    machineVariants: [
      {
        id: "pin_loaded_abd",
        label: "Pin-Loaded Machine",
        icon: "\u{1F4CC}",
        description: "Selectorized hip abduction machine",
        setupCues: [
          "Pin to working weight",
          "Knees pressed against outside pads",
          "Adjust starting width so reps don't begin from pinned-together",
        ],
      },
      {
        id: "plate_loaded_abd",
        label: "Plate-Loaded Machine",
        icon: "\u{1F3CB}️",
        description: "Plate-loaded hip abduction sled",
        setupCues: [
          "Load plates evenly on both sides",
          "Both knees against pads",
          "Hands gripping side handles for spine stability",
        ],
      },
      {
        id: "cable_standing_alt",
        label: "Cable (Alternating)",
        icon: "⚖️",
        description: "Cable station — cuff around the moving ankle, support leg planted (alternate sides each set)",
        setupCues: [
          "Ankle cuff on the moving leg",
          "Plant the support leg firmly; hold the upright with the same-side hand",
          "Abduct against cable resistance, slow eccentric",
          "Switch sides between sets to load both glute medii",
        ],
      },
    ],
    constraints: { requiresIliopsoas: false, maxHipFlexion: 90, requiresWeightBearing: false },
    muscles: {
      primary: ["gluteus medius", "gluteus minimus", "hip abductors"],
      secondary: ["gluteus maximus"],
    },
  },

  "Bilateral Hip Adduction (Machine)": {
    id: "bilateral_hip_adduction_machine",
    name: "Bilateral Hip Adduction (Machine)",
    requires: ["cables"],
    category: "legs",
    sets: [["3", "12-15"], ["3", "12-15"], ["3", "10-12"]],
    rest: 60,
    setup:
      "Sit in the hip adduction machine with both knees against the inside pads. Set the starting width to a comfortable end-range stretch (not painful — typically ~30-35deg of abduction). Spine against back pad, hands on side handles.",
    execution:
      "Squeeze both knees inward against the pads with a 2-second concentric. 1-second hold at full adduction. 3-second eccentric. Final set: 1.5 reps for metabolic stress.",
    nwbCues:
      "Seated and supported — zero axial compression on the femoral neck. The previous Banded Adduction caution about pectineus/iliopsoas co-recruitment is no longer in force (hip flexion + iliopsoas restrictions are lifted). Still: if you feel a sharp anterior-groin pinch on the left, back off the starting stretch range.",
    why: "Bilateral adductor strength is a major contributor to pelvic stability and to gait quality on return to walking. Direct loading is far more efficient than the band-only setup that was used during NWB.",
    safety: "safe",
    phaseUnlock: PWB,
    swaps: ["Seated Hip Adduction — Band"],
    machineVariants: [
      {
        id: "pin_loaded_add",
        label: "Pin-Loaded Machine",
        icon: "\u{1F4CC}",
        description: "Selectorized hip adduction machine",
        setupCues: [
          "Pin to working weight",
          "Knees pressed against inside pads",
          "Set starting width to a controllable stretch (not painful)",
        ],
      },
      {
        id: "plate_loaded_add",
        label: "Plate-Loaded Machine",
        icon: "\u{1F3CB}️",
        description: "Plate-loaded hip adduction sled",
        setupCues: [
          "Load plates evenly",
          "Both knees against inside pads",
          "Maintain neutral spine against pad",
        ],
      },
      {
        id: "copenhagen_plank",
        label: "Copenhagen Plank (Side-Lying)",
        icon: "\u{1F9D8}",
        description: "Side-plank with top leg on a bench — bodyweight adductor isometric/dynamic",
        setupCues: [
          "Side plank with forearm on the floor; TOP leg on a flat bench",
          "Lift bottom leg up to meet the bench (adduction)",
          "Bodyweight only — start short (10-15s) and progress",
          "Useful for home gym / no-machine days",
        ],
        requires: ["bench", "mat"],
      },
    ],
    constraints: { requiresIliopsoas: false, maxHipFlexion: 90, requiresWeightBearing: false },
    muscles: {
      primary: ["hip adductors"],
      secondary: ["gluteus medius", "quadratus lumborum"],
    },
  },

  "Bilateral Seated Calf Raise": {
    id: "bilateral_seated_calf_raise",
    name: "Bilateral Seated Calf Raise",
    requires: ["cables"],
    category: "legs",
    sets: [["3", "12-15"], ["4", "12-15"], ["4", "15-20"]],
    rest: 60,
    setup:
      "Sit in seated calf machine. Both balls of the feet on the foot-platform with heels hanging free. Knee pad snug across the lower thighs. Hands on the lever release.",
    execution:
      "Drop heels for a 3-second deep stretch at the bottom. Press up to full plantarflexion with a 1-2 second peak squeeze. Slow controlled descent. Last set: drop set or 1.5 reps to failure.",
    nwbCues:
      "Load is supported across the KNEES (thigh pad), not the spine, and not the femoral neck. Loaded plantarflexion in this position is fully NWB on the femoral head. Standing calf raise remains off-limits on the left because it puts bodyweight axial compression up the chain — this seated version replaces it cleanly.",
    why: "Soleus-dominant calf hypertrophy that fully respects the no-axial-load rule. Restores bilateral calf strength symmetry and ankle pump capacity. Stable starter loading can be heavy without joint risk.",
    safety: "safe",
    phaseUnlock: PWB,
    swaps: ["Standing Calf Raise (R)"],
    machineVariants: [
      {
        id: "seated_calf_machine",
        label: "Seated Calf Machine",
        icon: "\u{1F9B5}",
        description: "Dedicated seated calf raise machine with thigh pad",
        setupCues: [
          "Both forefeet on platform, heels free",
          "Thigh pad snug just above the knees",
          "Drive up explosively; lower over 3 seconds",
        ],
      },
      {
        id: "smith_seated",
        label: "Smith Machine + Bench",
        icon: "\u{1F3CB}️",
        description: "Sit on a bench under a Smith bar with feet on a plate. Bar across the lower thighs",
        setupCues: [
          "Bench under the Smith bar; feet on a 25 lb plate",
          "Bar padded, resting across lower thighs (above knees)",
          "Unrack and perform full-ROM seated calf raises",
        ],
        requires: ["bench"],
      },
      {
        id: "leg_press_calf",
        label: "Leg Press Calf Press",
        icon: "\u{1F9BF}",
        description: "Calf press on a leg press machine — both feet, balls of feet on bottom of platform",
        setupCues: [
          "Both feet, balls of feet on the bottom edge of the press platform",
          "Knees stay slightly bent — DO NOT lock out",
          "Press through forefoot only; this is not a full leg press rep",
        ],
        requires: ["legpress"],
      },
    ],
    constraints: { requiresIliopsoas: false, maxHipFlexion: 90, requiresWeightBearing: false },
    muscles: {
      primary: ["soleus", "gastrocnemius"],
      secondary: ["tibialis anterior"],
    },
  },

  "45° Back Extension (Hyperextension)": {
    id: "back_extension_45",
    name: "45° Back Extension (Hyperextension)",
    requires: ["bench"],
    category: "legs",
    sets: [["3", "12-15"], ["3", "10-12"], ["4", "8-10"]],
    rest: 90,
    setup:
      "Step into a 45deg back extension bench (Roman chair). Both feet flat on the platform, heels firm against the back stops. Pad rests just BELOW the hip crease (so the hip can hinge freely above it). Crutches within arm's reach.",
    execution:
      "Hinge at the hips with a flat back, lowering the torso until you feel a strong hamstring/glute stretch (~60deg trunk flexion). Drive the hips into the pad to extend back to a straight body line — do NOT hyperextend past neutral. 2-second concentric, 1-second top hold, 3-second eccentric. Add a plate held at the chest (or behind the head) for progression.",
    nwbCues:
      "Both feet planted on the platform — the femoral neck sees no axial compression because the hip pad bears the trunk's weight. Stop extension at a straight body line; lumbar hyperextension is unnecessary and adds nothing. If left-glute fatigue lags right-side, intentionally pause 1 extra second at lockout to bias the left side.",
    why: "Hip-hinge pattern restoration with the lumbar spine fully supported by the pad. Loads the entire posterior chain (glutes, hamstrings, erectors) in their full ROM without any of the axial/spinal demand of a deadlift or RDL. Excellent precursor to bilateral RDL.",
    safety: "safe",
    phaseUnlock: PWB,
    swaps: ["Bilateral Hip Thrust", "Stir the Pot"],
    machineVariants: [
      {
        id: "roman_45",
        label: "45deg Roman Chair",
        icon: "\u{1F4BA}",
        description: "Standard 45deg back extension bench",
        setupCues: [
          "Pad just below hip crease — hip must hinge freely",
          "Both feet on platform, heels against back stops",
          "Cross arms or hold a plate at the chest for added load",
        ],
      },
      {
        id: "horizontal_back_ext",
        label: "Horizontal (90deg) Bench",
        icon: "\u{1F9B5}",
        description: "Flat / horizontal back extension bench — longer ROM, harder",
        setupCues: [
          "Same pad placement as 45deg (just below hip crease)",
          "Body horizontal means longer lever — start with bodyweight only",
          "Pause 1 second at the top to lock out the glutes",
        ],
      },
      {
        id: "reverse_hyper",
        label: "Reverse Hyper",
        icon: "\u{1F3CB}️",
        description: "Lay prone on a reverse-hyper machine. Legs swing under load. Near-zero femoral compression",
        setupCues: [
          "Lie prone, hips at the edge of the pad",
          "Both ankles in the strap or on the swing arm",
          "Drive both legs up to a flat body line; lower with control",
          "Excellent rebuild option if available — extremely joint-friendly",
        ],
      },
    ],
    constraints: { requiresIliopsoas: false, maxHipFlexion: 90, requiresWeightBearing: false },
    muscles: {
      primary: ["gluteus maximus", "hamstrings", "erector spinae"],
      secondary: ["biceps femoris", "semitendinosus"],
    },
  },

  "Cable Pull-Through": {
    id: "cable_pull_through",
    name: "Cable Pull-Through",
    requires: ["cables"],
    category: "legs",
    sets: [["3", "10-12"], ["3", "10-12"], ["3", "10-12"]],
    rest: 75,
    setup:
      "Set a rope attachment on a low cable. Stand facing AWAY from the stack with feet shoulder-width and knees softly bent. Reach between the legs and grab the rope with both hands. Step forward until there is steady tension on the cable.",
    execution:
      "Hinge at the hips, pushing the glutes back toward the cable stack until you feel a strong hamstring stretch. Drive hips forward to lockout — squeeze glutes hard, keep ribs down, do not hyperextend the lumbar spine. 2-second concentric, 1-second top hold, 3-second eccentric.",
    nwbCues:
      "Both feet planted on the floor. The cable load pulls horizontally, not vertically — femoral neck axial compression is essentially zero. Best used as a hinge-pattern teaching tool before progressing to RDL. If standing balance is unsteady, hold a wall or rack with one hand and use a single-handle attachment.",
    why: "Re-grooves the hip-hinge pattern with light, joint-friendly load. The horizontal load vector eliminates spinal compression, making it ideal for the early PWB phase before tackling RDL.",
    safety: "safe",
    phaseUnlock: PWB,
    swaps: ["45° Back Extension (Hyperextension)", "Bilateral Hip Thrust"],
    cableSuperset: true,
    constraints: { requiresIliopsoas: false, maxHipFlexion: 90, requiresWeightBearing: false },
    muscles: {
      primary: ["gluteus maximus", "hamstrings"],
      secondary: ["erector spinae", "hip adductors"],
    },
  },

  "RFE Split Squat (Right-Dominant, Left Toe-Touch Rear)": {
    id: "rfe_split_squat_right_dominant",
    name: "RFE Split Squat (Right-Dominant, Left Toe-Touch Rear)",
    requires: ["dumbbells", "bench"],
    category: "legs",
    sets: [["3", "8-10"], ["3", "8-10"], ["4", "6-8"]],
    rest: 120,
    setup:
      "Stand with a flat bench behind you. RIGHT foot forward, ~2 foot-lengths in front of the bench. LEFT foot back, top of the foot resting LIGHTLY on the bench as a TOE-TOUCH balance reference only. DBs in both hands. Crutches or a rack within reach.",
    execution:
      "Lower the back knee toward the floor with a 3-second eccentric — the right knee tracks over the right foot, torso slight forward lean. Stop just above the floor, then drive UP through the right heel only. The left foot is a balance kickstand; never push off it.",
    nwbCues:
      "LEFT FOOT IS A KICKSTAND. Toe-touch contact only — if you feel pressure under the left forefoot at the top of the rep, the bench is too low (raise it) or you're pushing off (don't). Right leg does ~95%+ of the work. This is NOT a Bulgarian split squat with the left in front — that's still off-limits.",
    why: "Heavy right-leg unilateral overload with the back leg providing pure balance. Bridges from sl-leg-press / hack-squat to standing weighted unilateral work without any left-side axial compression.",
    safety: "caution",
    phaseUnlock: PWB,
    swaps: ["SL Leg Press (Right)", "Hack Squat (Right)", "Low-Box Step-Up (Right)"],
    constraints: { requiresIliopsoas: false, maxHipFlexion: 90, requiresWeightBearing: false },
    muscles: {
      primary: ["quadriceps", "gluteus maximus"],
      secondary: ["hamstrings", "gluteus medius", "hip adductors"],
    },
  },

  "Recumbent Bike Intervals": {
    id: "recumbent_bike_intervals",
    name: "Recumbent Bike Intervals",
    requires: ["recumbentBike"],
    category: "cardio",
    sets: [["1", "20 min"], ["1", "8 x 30s/30s"], ["1", "10 x 30s/30s"]],
    rest: 0,
    setup:
      "Set the recumbent bike seat all the way back so hip flexion at the top of the pedal stroke stays comfortable (~65-75deg max). Adjust seat height so the knee has a slight bend at full extension.",
    execution:
      "Steady-state warm-up 5 min at low resistance. Then alternate 30s hard / 30s easy for 8-10 rounds. Cool-down 5 min. Cadence 70-90 RPM, low-moderate resistance for the first 2 weeks.",
    nwbCues:
      "Recumbent geometry distributes load along the femur as shear, not as femoral-neck axial compression. Seat fully back to keep hip flexion under ~75deg (still comfortable post-FAI clearance). Stop if the left hip feels pinched at the top of any pedal stroke — re-check seat distance.",
    why: "Re-introduces lower-body steady-state and HIIT cardio in a controlled, non-impact, non-axially-loaded position. Recumbent vs upright: the seat-back absorbs the trunk reaction force.",
    safety: "safe",
    tier: 1,
    phaseUnlock: PWB,
    swaps: ["Arm Ergometer", "Seated SkiErg"],
    constraints: { requiresIliopsoas: false, maxHipFlexion: 90, requiresWeightBearing: false },
    muscles: {
      primary: ["quadriceps", "hamstrings", "gluteus maximus"],
      secondary: ["gastrocnemius", "soleus"],
    },
  },

  "Cable Glute Kickback (Both Sides)": {
    id: "cable_glute_kickback_bilateral",
    name: "Cable Glute Kickback (Both Sides)",
    requires: ["cables"],
    category: "legs",
    sets: [["3", "12/side"], ["3", "12/side"], ["3", "10/side"]],
    rest: 60,
    setup:
      "Low pulley with an ankle cuff. Stand facing the stack. Plant the support leg firmly under the hip; cuff on the moving ankle. Hold the upright with the same-side hand for balance. Crutches within reach.",
    execution:
      "Drive the working leg straight back with a 2-second concentric — squeeze the glute hard at the top, hold 1 second. Slow 3-second return. Knee stays soft (slight bend); no spinal hyperextension. Complete the set, then switch sides.",
    nwbCues:
      "Always plant the RIGHT foot when the LEFT leg is the moving leg, and vice versa. The left side is now safe to be the moving leg (no axial compression — the leg is not bearing weight while it moves). When the LEFT is the planted/support leg, the load is just bodyweight standing — that's now allowed in the PWB phase. If standing on the left feels unstable, do all left-moving sets first while you're fresh.",
    why: "Direct, focal glute max work for both sides with negligible axial demand. Excellent finisher after hip thrust to drive blood into the glute and reinforce hip extension under cable resistance.",
    safety: "safe",
    phaseUnlock: PWB,
    swaps: ["Prone Hip Extension (Right)", "SL Glute Bridge (Right)"],
    cableSuperset: true,
    constraints: { requiresIliopsoas: false, maxHipFlexion: 90, requiresWeightBearing: false },
    muscles: {
      primary: ["gluteus maximus"],
      secondary: ["hamstrings", "erector spinae", "gluteus medius"],
    },
  },
};
