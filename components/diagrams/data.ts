export interface ExerciseDiagram {
  id: string;
  category: string;
  name: string;
  target: string;
  cues: string[];
  safetyNote?: string;
  equipment?: string[];
}

export interface Category {
  key: string;
  label: string;
  accent: string;
}

export const CATEGORIES: Category[] = [
  { key: "rack", label: "Rack Core", accent: "#f39c12" },
  { key: "supine", label: "Supine", accent: "#2ecc71" },
  { key: "prone", label: "Prone / Box", accent: "#e67e22" },
  { key: "glute", label: "Glute", accent: "#48c78e" },
  { key: "trx", label: "TRX", accent: "#3498db" },
  { key: "arm", label: "Arm Balance", accent: "#a78bfa" },
  { key: "yoga", label: "Yoga", accent: "#1abc9c" },
  { key: "equip", label: "Equipment", accent: "#95a5a6" },
];

export const EXERCISES: ExerciseDiagram[] = [
  // ── RACK CORE ──
  {
    id: "r1", category: "rack", name: "Landmine Rotations",
    target: "Anti-Rotation / Obliques",
    cues: [
      "Insert barbell into landmine or corner. Stand on RIGHT leg, grip end with both hands.",
      "Arc the bar from one hip to the other in a controlled rainbow arc.",
      "Resist rotation through the core — arms guide, obliques brake.",
      "Left leg trails passively behind or hangs in space.",
    ],
    safetyNote: "Single-leg on RIGHT only. Left leg dead weight — zero push-off.",
    equipment: ["Barbell", "Landmine"],
  },
  {
    id: "r2", category: "rack", name: "Plate Halos",
    target: "Shoulder Mobility / Core Stability",
    cues: [
      "Hold plate at chest height. Circle it around your head in a smooth orbit.",
      "Keep elbows tight and core braced throughout the rotation.",
      "Alternate direction each set.",
      "Seated on bench or standing on RIGHT leg.",
    ],
    safetyNote: "Can be done seated to remove all lower-body demand.",
    equipment: ["Plate"],
  },
  {
    id: "r3", category: "rack", name: "Barbell Rollouts",
    target: "Anti-Extension / Deep Core",
    cues: [
      "Kneel on RIGHT knee, grip barbell with plates that roll.",
      "Roll bar forward, extending arms overhead. Hips follow.",
      "Pull back using abs — don't yank with arms.",
      "Left leg trails behind in hip extension.",
    ],
    safetyNote: "Right knee bears all weight. Left leg extends passively — zero iliopsoas.",
    equipment: ["Barbell"],
  },
  {
    id: "r4", category: "rack", name: "Suitcase Hold",
    target: "Anti-Lateral Flexion / Obliques",
    cues: [
      "Hold heavy dumbbell/kettlebell in one hand at your side.",
      "Stand tall on RIGHT leg — resist the lateral pull.",
      "Shoulders level, ribs down, breathe normally.",
      "Hold 20-30s per side. The side WITHOUT the weight works hardest.",
    ],
    safetyNote: "Right leg only. Left hangs passively. Pure isometric anti-lateral flexion.",
    equipment: ["Dumbbell"],
  },
  {
    id: "r5", category: "rack", name: "Overhead Plate Hold",
    target: "Overhead Stability / Anti-Extension",
    cues: [
      "Press plate directly overhead with both arms locked out.",
      "Ribs down, glutes tight — fight the urge to arch.",
      "Hold 20-30s. Core works to prevent extension.",
      "Can be done seated on bench.",
    ],
    safetyNote: "Seated version eliminates all lower-body balance demand.",
    equipment: ["Plate"],
  },

  // ── SUPINE ──
  {
    id: "s1", category: "supine", name: "Cross-Body Reach",
    target: "Thoracic Rotation / Obliques",
    cues: [
      "Lie supine, arms at sides. Both legs flat.",
      "Reach opposite hand toward opposite hip, lifting only shoulder blade.",
      "Pure thoracic rotation — hips stay pinned to floor.",
      "Alternate sides each rep.",
    ],
    safetyNote: "Left leg stays completely flat — zero hip flexor activation.",
  },
  {
    id: "s2", category: "supine", name: "Supine Side Bend",
    target: "Lateral Flexion / Obliques",
    cues: [
      "Lie supine, arms at sides. Both legs flat.",
      "Slide hand down toward same-side heel by laterally flexing trunk.",
      "Ribs compress on the working side — feel the oblique crunch.",
      "Legs stay completely still throughout.",
    ],
    safetyNote: "No hip involvement. Pure trunk lateral flexion.",
  },
  {
    id: "s3", category: "supine", name: "Knee Drop + Return",
    target: "Oblique Control / Anti-Rotation",
    cues: [
      "Right knee bent, foot flat. Left leg flat and passive.",
      "Let right knee fall outward — gravity does the work.",
      "LEFT oblique fires to pull the knee back to center.",
      "The rep is the RETURN, not the drop.",
    ],
    safetyNote: "Left leg flat & passive. Only RIGHT knee moves. Oblique work is pulling it BACK.",
  },
  {
    id: "s5", category: "supine", name: "Dead Bug (R Only)",
    target: "Anti-Extension / Contralateral Control",
    cues: [
      "Lie supine. Left arm and left leg are dead weight on the floor.",
      "Extend right arm overhead + right leg out simultaneously.",
      "Return to start with control. Maintain low back contact with floor.",
      "All movement on RIGHT side only.",
    ],
    safetyNote: "Left arm & left leg are dead weight the entire time. Zero left hip flexion.",
  },

  // ── PRONE / PLYO BOX ──
  {
    id: "p1", category: "prone", name: "Prone Hip Extension (R)",
    target: "Glute Max / Hip Extension",
    cues: [
      "Lie prone on plyo box, hips at edge. Grip box sides.",
      "Extend RIGHT leg straight back and up, squeezing glute at top.",
      "Lower with 3-count control. Left leg hangs passive off the box.",
      "Keep hips pressed into box — no arching.",
    ],
    safetyNote: "Left leg hangs as dead weight. Zero left hip extension effort.",
    equipment: ["Plyo Box"],
  },
  {
    id: "p2", category: "prone", name: "Prone Y-T-W Raises",
    target: "Posterior Shoulder / Scapular Stability",
    cues: [
      "Lie prone on box, arms hanging down. Thumbs up.",
      "Y: raise arms overhead at 45°. T: raise arms straight out. W: elbows bent, squeeze shoulder blades.",
      "Hold each position 2-3 seconds. Light weight or bodyweight.",
      "3-5 reps each letter = 1 set.",
    ],
    safetyNote: "Pure upper body. No lower body involvement. Legs rest on box.",
    equipment: ["Plyo Box"],
  },
  {
    id: "p3", category: "prone", name: "Prone Back Extension",
    target: "Erector Spinae / Posterior Chain",
    cues: [
      "Lie prone on box, hips at edge, feet anchored or hanging.",
      "Cross arms at chest. Extend torso up from hip hinge.",
      "Squeeze at top. Lower with control.",
      "Keep chin tucked — neck neutral, not cranking up.",
    ],
    safetyNote: "Right foot can anchor under box lip. Left leg hangs passively.",
    equipment: ["Plyo Box"],
  },
  {
    id: "p4", category: "prone", name: "Prone Single-Arm Reach",
    target: "Anti-Rotation / Shoulder Stability",
    cues: [
      "Lie prone on box, both arms hanging. Core braced.",
      "Reach one arm forward/overhead. Hold 2s. Return.",
      "Fight the rotation — hips and shoulders stay square.",
      "Alternate arms. Light weight optional.",
    ],
    safetyNote: "Purely upper body anti-rotation. No leg activation needed.",
    equipment: ["Plyo Box"],
  },

  // ── GLUTE ──
  {
    id: "g1", category: "glute", name: "SL Glute Bridge (R)",
    target: "Glute Max / Hip Extension",
    cues: [
      "Lie supine. RIGHT knee bent, foot flat. Left knee bent, foot hovering.",
      "Drive through RIGHT heel to lift hips. Straight line shoulders→knee.",
      "Squeeze glutes hard at top for 2 seconds.",
      "Lower with 2-count control. Left leg is dead weight.",
    ],
    safetyNote: "Left foot hovers — do NOT rest it on floor. Zero left hip flexor engagement.",
  },
  {
    id: "g2", category: "glute", name: "Banded Clamshells",
    target: "Glute Med / Hip Abduction",
    cues: [
      "Side-lying, knees bent ~45°. Band above knees.",
      "Open top knee like a clamshell. Feet stay glued together.",
      "Hips stacked — don't roll backward.",
      "1s open, brief hold, 1s close. 20 reps per side.",
    ],
    safetyNote: "If on LEFT side: pillow under left hip if uncomfortable. Stop if groin pain.",
    equipment: ["Resistance Band"],
  },
  {
    id: "g3", category: "glute", name: "Cable Kickback (R)",
    target: "Glute Max / Isolated Hip Extension",
    cues: [
      "Ankle strap on RIGHT ankle. Face the cable stack.",
      "Lean forward slightly, grip frame. Extend right leg straight back.",
      "Squeeze glute at full extension. 2s hold.",
      "Control the return — don't let the weight stack slam.",
    ],
    safetyNote: "Stand on LEFT leg with crutch support or lean on frame. Right leg does all work.",
    equipment: ["Cable Machine"],
  },

  // ── TRX ──
  {
    id: "t1", category: "trx", name: "TRX Pallof Press",
    target: "Anti-Rotation / Core Stability",
    cues: [
      "Stand sideways to anchor on RIGHT leg. Handles at chest.",
      "Press handles straight out from chest. Resist rotation.",
      "Hold 2s extended. Return with control.",
      "Left leg hangs as dead weight.",
    ],
    safetyNote: "Single-leg on RIGHT only. Left leg dead weight — zero push-off.",
    equipment: ["TRX"],
  },
  {
    id: "t2", category: "trx", name: "TRX Standing Rollout",
    target: "Anti-Extension / Core",
    cues: [
      "Face away from anchor on RIGHT leg.",
      "Lean forward extending arms overhead in straps.",
      "Pull back using core, not arms.",
      "Left leg trails behind passively.",
    ],
    safetyNote: "Anti-extension core demand. Left leg passive.",
    equipment: ["TRX"],
  },
  {
    id: "t3", category: "trx", name: "TRX Single-Arm Row",
    target: "Anti-Rotation / Unilateral Pull",
    cues: [
      "Face anchor on RIGHT leg. Row one arm at a time.",
      "Massive anti-rotation demand from unilateral pull.",
      "Alternate rowing arm each set.",
      "Left leg hangs passively.",
    ],
    safetyNote: "Right leg only. Left leg hangs.",
    equipment: ["TRX"],
  },
  {
    id: "t4", category: "trx", name: "TRX Kneeling Rollout",
    target: "Anti-Extension / Deep Core",
    cues: [
      "RIGHT knee on pad, hands in straps.",
      "Roll forward extending arms. Core resists extension.",
      "Pull back from abs, not arms.",
      "Left leg trails in hip extension behind.",
    ],
    safetyNote: "Left leg trails in hip extension — zero iliopsoas. Right knee bears weight.",
    equipment: ["TRX"],
  },
  {
    id: "t5", category: "trx", name: "TRX Kneeling Chop",
    target: "Rotational Core / Obliques",
    cues: [
      "RIGHT knee on pad. Hold handles.",
      "Rotate trunk through a diagonal chop pattern.",
      "Core controls the rotation — don't just swing arms.",
      "Left leg trails passively.",
    ],
    safetyNote: "Pure rotational core. Left leg trails passively.",
    equipment: ["TRX"],
  },
  {
    id: "t6", category: "trx", name: "TRX Body Saw",
    target: "Anti-Extension / Dynamic Plank",
    cues: [
      "RIGHT foot in strap, forearm plank.",
      "Rock body forward and back like a saw.",
      "Core fights extension throughout the full range.",
      "Left leg rests on ground as dead weight.",
    ],
    safetyNote: "Left leg on ground. Anti-extension + anti-rotation.",
    equipment: ["TRX"],
  },
  {
    id: "t7", category: "trx", name: "TRX Side Plank",
    target: "Oblique Endurance / Lateral Core",
    cues: [
      "RIGHT foot in strap, right forearm down.",
      "Stack into side plank. Top arm to ceiling.",
      "Left leg rests passively on top of right.",
      "Breathe normally. Hold for time.",
    ],
    safetyNote: "Oblique endurance. Left leg is passive weight.",
    equipment: ["TRX"],
  },

  // ── ARM BALANCE PREP ──
  {
    id: "a1", category: "arm", name: "TRX Knee Tuck (Fig-4)",
    target: "Lower Abs / Compression",
    cues: [
      "RIGHT foot in strap, left hooked fig-4 behind right calf.",
      "Forearm plank. Tuck right knee to chest.",
      "Lower abs drive the tuck. Left hip stays fixed angle.",
      "Left iliopsoas mechanically disadvantaged — won't fire.",
    ],
    safetyNote: "Fig-4 hook keeps left hip shortened + externally rotated — zero flexor activation.",
    equipment: ["TRX"],
  },
  {
    id: "a2", category: "arm", name: "TRX Body Saw (Fig-4)",
    target: "Anti-Extension / Advanced Plank",
    cues: [
      "Same fig-4 hook setup as knee tuck.",
      "Rock body forward and back in forearm plank.",
      "Higher anti-extension demand than floor version.",
      "Left leg hooked passively — zero active involvement.",
    ],
    safetyNote: "Left leg hooked passively. Higher demand than standard body saw.",
    equipment: ["TRX"],
  },
  {
    id: "a3", category: "arm", name: "L-Sit Knee Tuck",
    target: "Compression Strength / Lower Abs",
    cues: [
      "Parallettes, support hold. Drive RIGHT knee up toward chest.",
      "Left leg hangs passive — gravity keeps it extended.",
      "Squeeze at top. Lower with control.",
      "Build toward full R-leg L-sit hold.",
    ],
    safetyNote: "Left leg is dead weight hanging down — zero iliopsoas. Compression strength builder.",
    equipment: ["Parallettes"],
  },
  {
    id: "a4", category: "arm", name: "R-Leg L-Sit Hold",
    target: "Compression / Hip Flexor Endurance",
    cues: [
      "Parallettes. Extend RIGHT leg to full L-sit.",
      "Left leg hangs passive below. Hold for time.",
      "Core compression + right hip flexor work.",
      "Depress shoulders throughout.",
    ],
    safetyNote: "Left leg hangs — no flexion demand. Right quad/hip flexor does all work.",
    equipment: ["Parallettes"],
  },
  {
    id: "a5", category: "arm", name: "Tuck Planche Lean",
    target: "Forward Lean / Shoulder Loading",
    cues: [
      "Parallettes. Right knee tucked, lean shoulders past hands.",
      "Left leg trails behind in full extension.",
      "Hold the lean. Shoulders ahead of wrists = the loading.",
      "Build toward crow, planche progression.",
    ],
    safetyNote: "Left hip in extension — zero flexor activation. Forward-lean shoulder loading.",
    equipment: ["Parallettes"],
  },
  {
    id: "a6", category: "arm", name: "Support Protraction",
    target: "Scapular Strength / Foundation",
    cues: [
      "Parallettes or rings. Straight arms, support hold.",
      "Depress & protract scapulae. Pulse in/out.",
      "Legs hang passive below — both sides.",
      "Foundational for crow, side crow, flying pigeon.",
    ],
    safetyNote: "Legs hang passive. Pure scapular strength.",
    equipment: ["Parallettes"],
  },

  // ── YOGA ──
  {
    id: "y1", category: "yoga", name: "Dolphin Pose",
    target: "Shoulder Flexion / Core",
    cues: [
      "Forearms on mat, shoulder width. Hips pike up like downward dog.",
      "RIGHT foot on ground. Left leg lifts passively or hovers.",
      "Press forearms down, push hips back and up.",
      "Head between arms. Hold 5-10 breaths.",
    ],
    safetyNote: "Right foot bears weight. Left leg floats — zero ground contact.",
  },
  {
    id: "y2", category: "yoga", name: "Warrior III (Modified)",
    target: "Balance / Posterior Chain",
    cues: [
      "Stand on RIGHT leg. Hinge forward at hip.",
      "Arms extend forward, left leg extends back — T shape.",
      "Left leg is passive counterbalance — don't actively lift it.",
      "Hold 5 breaths. Use wall for hands if needed.",
    ],
    safetyNote: "ALL weight on right leg. Left leg is passive counterweight — zero active extension.",
  },
  {
    id: "y3", category: "yoga", name: "FeetUp Leg Lowers",
    target: "Core Control / Inversion Prep",
    cues: [
      "In FeetUp headstand trainer. Legs vertical.",
      "Lower RIGHT leg forward slowly while left stays up.",
      "Core resists extension as right leg descends.",
      "Return to vertical. Left leg stays passive throughout.",
    ],
    safetyNote: "Left leg stays vertical — gravity holds it. Right leg does controlled eccentric work.",
    equipment: ["FeetUp Trainer"],
  },
  {
    id: "y4", category: "yoga", name: "Chair Pose (Wall)",
    target: "Quad Endurance / Core Isometric",
    cues: [
      "Back against wall. Slide down to ~90° knee bend.",
      "RIGHT foot flat, bearing all weight.",
      "Left foot hovers or rests lightly on right ankle.",
      "Arms overhead or at chest. Hold 20-30s.",
    ],
    safetyNote: "Right leg only. Left foot hovers — zero weight bearing.",
  },

  // ── EQUIPMENT ID ──
  {
    id: "e1", category: "equip", name: "Pseudo Planche Push-Up",
    target: "Anterior Delt / Chest / Forward Lean",
    cues: [
      "Parallettes near waist — much further back than normal push-up.",
      "Right foot on box behind. Left leg hangs alongside — zero weight.",
      "Lean entire body forward over wrists. Immediate shoulder tension = correct.",
      "Lower chest to floor maintaining lean. Press back up.",
    ],
    safetyNote: "Left leg floats — zero weight or push. Hip at neutral extension. No FAI zone.",
    equipment: ["Parallettes", "Box"],
  },
  {
    id: "e2", category: "equip", name: "Side Plank Config",
    target: "Right-Side-Down Only / Obliques",
    cues: [
      "Right side down ONLY — right elbow + right knee/foot bears weight.",
      "Left leg rests passively on top. Dead weight.",
      "Left-side-down loads injured femoral neck — NEVER do this.",
      "For left oblique bias: reach LEFT arm overhead from right-side-down.",
    ],
    safetyNote: "NEVER go left-side-down. That loads the left femoral neck through elbow-hip-knee chain.",
  },
];

// Map of exerciseId → animation component key (used by gallery to find the right animation)
// All IDs must match the animation map keys in their respective category files
export const ANIM_IDS = EXERCISES.map(e => e.id);
