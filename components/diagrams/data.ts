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
  { key: "push", label: "Push", accent: "#3498db" },
  { key: "pull", label: "Pull", accent: "#a78bfa" },
  { key: "legs", label: "Legs", accent: "#48c78e" },
  { key: "core", label: "Core", accent: "#f39c12" },
  { key: "recovery", label: "Recovery", accent: "#1abc9c" },
];

export const EXERCISES: ExerciseDiagram[] = [
  // ── RACK / FREE-WEIGHT CORE → core tab ──
  {
    id: "r1", category: "core", name: "Landmine Rotations",
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
    id: "r2", category: "core", name: "Plate Halos",
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
    id: "r3", category: "core", name: "Barbell Rollouts",
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
    id: "r4", category: "core", name: "Suitcase Hold",
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
    id: "r5", category: "core", name: "Overhead Plate Hold",
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
  {
    id: "r6", category: "core", name: "McGill Curl-Up",
    target: "Upper Abs / McGill Big 3",
    cues: [
      "Lie on back. Hands under lumbar curve as a monitoring system.",
      "RIGHT knee bent, left leg straight on floor.",
      "Lift ONLY head and shoulder blades 2-3 inches off floor — 4s up, 5s HOLD, lower.",
      "Lumbar spine stays in its natural arch throughout — NOT a crunch.",
    ],
    safetyNote: "Tiny range of motion. If the arch disappears into your hands, you went too high. Left leg stays straight and passive.",
  },
  {
    id: "r7", category: "core", name: "Stir the Pot",
    target: "Anti-Rotation / Anti-Extension / Core",
    cues: [
      "Forearms on stability ball. RIGHT foot or knee on ground.",
      "Left leg extended behind on mat, passive.",
      "Slow forearm circles — clockwise, then counter-clockwise.",
      "Make circles as large as you can control.",
    ],
    safetyNote: "Left leg rests on mat — if it tenses to stabilize, reposition. Ultimate integrated core challenge.",
    equipment: ["Stability Ball"],
  },

  // ── SUPINE → core tab ──
  {
    id: "s1", category: "core", name: "Cross-Body Reach",
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
    id: "s2", category: "core", name: "Supine Side Bend",
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
    id: "s3", category: "core", name: "Knee Drop + Return",
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
    id: "s5", category: "core", name: "Dead Bug (R Only)",
    target: "Anti-Extension / Contralateral Control",
    cues: [
      "Lie supine. Left arm and left leg are dead weight on the floor.",
      "Extend right arm overhead + right leg out simultaneously.",
      "Return to start with control. Maintain low back contact with floor.",
      "All movement on RIGHT side only.",
    ],
    safetyNote: "Left arm & left leg are dead weight the entire time. Zero left hip flexion.",
  },

  // ── PRONE / PLYO BOX → split: legs (p1, p6), pull (p2, p3, p4), core (p5) ──
  {
    id: "p1", category: "legs", name: "Prone Hip Extension (R)",
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
    id: "p2", category: "pull", name: "Prone Y-T-W Raises",
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
    id: "p3", category: "pull", name: "Prone Back Extension",
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
    id: "p4", category: "pull", name: "Prone Single-Arm Reach",
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
  {
    id: "p5", category: "core", name: "Bird-Dog (Prone Bench)",
    target: "Glute / Core — Anti-Rotation",
    cues: [
      "Face-down on bench. Hips at bench edge so legs hang free.",
      "Extend RIGHT leg straight back via glutes + LEFT arm straight forward.",
      "4-count up, 5-second HOLD, 4-count lower. Hips stay level.",
      "Left leg HANGS freely when not working — never pushes.",
    ],
    safetyNote: "Prone bench eliminates femoral neck loading. Quadruped version is UNSAFE (left knee at ~90° hip flexion = FAI limit).",
    equipment: ["Bench"],
  },
  {
    id: "p6", category: "legs", name: "Prone Ham Curl (R)",
    target: "Hamstring — Eccentric Focus",
    cues: [
      "Lie face-down on prone ham curl machine. RIGHT leg only on the pad.",
      "3 seconds up, 1 second hold, 3 seconds down.",
      "Controlled eccentric for maximum muscle activation.",
      "Left leg stays OFF the machine entirely.",
    ],
    safetyNote: "Prone position is preferred — no hip flexion involved. Left leg stays off the machine.",
    equipment: ["Ham Curl Machine"],
  },

  // ── PRONE HAM CURL MACHINE → core exercises (p7–p12) ──
  {
    id: "p7", category: "core", name: "Prone Y-Raise",
    target: "Lower Traps / Serratus",
    cues: [
      "Lie face-down on prone ham curl machine. Ankles locked under pad.",
      "Thumbs up, lift arms into Y overhead at ~45°.",
      "Squeeze lower traps at top for 2 seconds.",
      "Lower with control. Bodyweight or light dumbbells.",
    ],
    safetyNote: "Zero lower-body demand — ankles stay locked. Pure scapular depression + retraction.",
    equipment: ["Ham Curl Machine"],
  },
  {
    id: "p8", category: "core", name: "Prone T-Raise",
    target: "Mid Traps / Rhomboids",
    cues: [
      "Lie face-down on prone ham curl machine. Ankles locked under pad.",
      "Arms straight out to sides, palms down.",
      "Pinch shoulder blades together at the top.",
      "Hold 1-2 seconds. Lower with control.",
    ],
    safetyNote: "Zero lower-body demand. Scapular retraction focus — no momentum.",
    equipment: ["Ham Curl Machine"],
  },
  {
    id: "p9", category: "core", name: "Prone W-Raise",
    target: "Rotator Cuff / Lower Traps",
    cues: [
      "Lie face-down on prone ham curl machine. Ankles locked under pad.",
      "Elbows bent 90°, externally rotate shoulders.",
      "Squeeze shoulder blades down and back into W shape.",
      "Hold 2 seconds at peak contraction. Lower with control.",
    ],
    safetyNote: "Rotator cuff prehab in a zero-WB position. Excellent shoulder health between sets.",
    equipment: ["Ham Curl Machine"],
  },
  {
    id: "p10", category: "core", name: "Prone Trunk Extension",
    target: "Erectors / Glutes / Anti-Flexion Core",
    cues: [
      "Lie face-down on prone ham curl machine. Ankles locked under pad.",
      "Hands behind head (add plate to progress).",
      "Lift chest 1-2 inches off the pad. Hold 1 second at top.",
      "Lower with control. Keep chin tucked — neck neutral.",
    ],
    safetyNote: "Ankles locked = zero lower-body demand. Anti-flexion core in a completely NWB position.",
    equipment: ["Ham Curl Machine"],
  },
  {
    id: "p11", category: "core", name: "Prone Iso Hold",
    target: "Erectors / Deep Core Stabilizers",
    cues: [
      "Lie face-down on prone ham curl machine. Ankles locked under pad.",
      "Lift chest slightly off the pad — small range.",
      "Hold 20-45 seconds. Breathe into brace — don't hold breath.",
      "Progress by adding time or holding a plate behind the head.",
    ],
    safetyNote: "Isometric erector endurance. Breathe through the brace — respiratory demand is the progression.",
    equipment: ["Ham Curl Machine"],
  },
  {
    id: "p12", category: "core", name: "Prone Lateral Trunk Raise",
    target: "Obliques / QL",
    cues: [
      "Lie face-down on prone ham curl machine. Ankles locked under pad.",
      "Small side bend — lift and rotate torso slightly left, then right.",
      "Alternate sides each rep. Keep range small and controlled.",
      "Feel the obliques and quadratus lumborum work through the lateral flexion.",
    ],
    safetyNote: "Controlled lateral flexion only. No twisting through the lumbar spine — thoracic rotation is fine.",
    equipment: ["Ham Curl Machine"],
  },

  // ── GLUTE / RIGHT-LEG STRENGTH → legs tab ──
  {
    id: "g1", category: "legs", name: "SL Glute Bridge (R)",
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
    id: "g2", category: "legs", name: "Banded Clamshells",
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
    id: "g3", category: "legs", name: "Cable Kickback (R)",
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

  {
    id: "g4", category: "legs", name: "Seated Hip Abduction \u2014 Band",
    target: "Glute Medius / Lateral Hip",
    cues: [
      "Sit upright on a bench, hips at ~80\u00B0 (NEVER over 90\u00B0).",
      "Loop band around both knees \u2014 use hands only to position.",
      "Press knees outward, driving from the glutes \u2014 not the feet.",
      "5\u201310s isometric holds, or 2-3 tempo reps. Light band only.",
    ],
    safetyNote: "\u26A0 Glute med likely deconditioned \u2014 start with lightest band. Stop if anterior hip pain. Left foot purely passive, zero push-off.",
    equipment: ["Resistance Band", "Bench"],
  },
  {
    id: "g5", category: "legs", name: "Seated Hip Adduction \u2014 Band",
    target: "Adductors / Inner Thigh",
    cues: [
      "Sit upright, hips at ~80\u00B0. Place loop band around both knees with HANDS only.",
      "Squeeze knees inward smoothly \u2014 no jerking.",
      "5\u201310s isometric holds, or 2-3 tempo reps.",
      "Left foot rests passively \u2014 zero push-off.",
    ],
    safetyNote: "\u26A0 LIGHT to MODERATE band ONLY. Heavy resistance recruits pectineus/iliopsoas \u2192 femoral neck loading. STOP if any sensation in left groin or hip crease.",
    equipment: ["Resistance Band", "Bench"],
  },
  {
    id: "g6", category: "legs", name: "SL Hip Thrust (R)",
    target: "Glute Max / Hip Extension",
    cues: [
      "Shoulders on bench edge. RIGHT foot flat on floor. Left leg extended forward.",
      "Drive through R heel to lift hips to full extension.",
      "Squeeze glutes hard at top. Chin tucked, ribs down.",
      "Load with barbell or dumbbell across hips for progressive overload.",
    ],
    safetyNote: "Keep chin tucked and ribs down to prevent lumbar arching. Superior glute isolation with peak tension at the top.",
    equipment: ["Bench", "Barbell"],
  },
  {
    id: "g7", category: "legs", name: "SL Leg Press (R)",
    target: "Quad / Glute \u2014 Cross-Education",
    cues: [
      "Sit in leg press. RIGHT foot HIGH on plate. Left foot off the machine entirely.",
      "Lower the sled until JUST before 90\u00B0 hip flexion \u2014 then press back up.",
      "Weeks 3+: 4-second eccentric for cross-education strength effect.",
      "Do NOT lock out knee. Left leg hangs free.",
    ],
    safetyNote: "\u26A0 HIGH foot placement is MANDATORY \u2014 less hip flexion protects FAI/labrum. 90\u00B0 limit is absolute. MOST IMPORTANT exercise for contralateral strength preservation.",
    equipment: ["Leg Press"],
  },
  {
    id: "g8", category: "legs", name: "Hack Squat (R)",
    target: "Quad / Glute \u2014 Squat Pattern",
    cues: [
      "Step into hack squat with RIGHT foot on platform. Left leg off to the side.",
      "Lower until just before 90\u00B0 hip flexion.",
      "Press back up through the heel.",
      "Machine provides stability \u2014 focus on the right leg, no balance demand.",
    ],
    safetyNote: "Same 90\u00B0 hip flexion limit as leg press. Left leg off the machine entirely.",
    equipment: ["Hack Squat Machine"],
  },
  {
    id: "g9", category: "legs", name: "Low-Box Step-Up (R)",
    target: "Functional Strength / Balance",
    cues: [
      "Box BELOW knee height. RIGHT foot on top. Dumbbells at sides.",
      "Push through RIGHT heel to stand. Left leg dangles passively behind.",
      "Slow controlled descent \u2014 right leg lowering you down.",
      "Never let left foot touch down first. Pure right leg drive.",
    ],
    safetyNote: "\u26A0 TRANSITION RISK: single-leg standing balance. Hip flexion \u226490\u00B0 (low box ensures this). Left leg is passive dead weight throughout \u2014 never bracing. Support within arm's reach.",
    equipment: ["Plyo Box", "Dumbbells"],
  },
  {
    id: "g10", category: "legs", name: "Stab Ball Ham Curl (R)",
    target: "Hamstring / Glute Connection",
    cues: [
      "Lie on back. RIGHT heel on stability ball.",
      "Bridge hips up, then curl the ball toward glutes using right heel.",
      "Extend back out smoothly. Slow and controlled.",
      "Keep hips up throughout the entire set.",
    ],
    safetyNote: "Smoother contraction than heavy RDLs. Zero spinal load.",
    equipment: ["Stability Ball"],
  },
  {
    id: "g11", category: "legs", name: "Prone Hip Extension (R)",
    target: "Glute Max / Hip Extension — NWB bridge-thrust alt",
    cues: [
      "Face down on mat. RIGHT knee bent 90° — sole toward ceiling.",
      "Left leg flat on the floor, fully passive.",
      "Squeeze RIGHT glute to lift heel straight toward ceiling. Pause 1s at top.",
      "Lower with control. Keep the knee bent the whole time — only the hip moves.",
    ],
    safetyNote: "Feel it in the glute, not the low back. If the lumbar compensates, reduce ROM. Left hip stays in neutral extension — zero iliopsoas risk. NWB-safe substitute for SL Glute Bridge & SL Hip Thrust.",
  },
  {
    id: "g12", category: "legs", name: "Side-Lying Hip Abduction (L)",
    target: "Left Glute Medius / Hip Abduction",
    cues: [
      "Lie on the RIGHT (healthy) side. Head on pillow. Legs stacked and straight.",
      "Lift the LEFT leg up and slightly back — in line with the torso, NOT forward.",
      "Pause 1–2s at ~30–45° of abduction. Lower with control.",
      "Toes pointing forward throughout — internal rotation (toes up) shuts glute med off.",
    ],
    safetyNote: "Hips stacked vertically — don't let the top hip roll backward (TFL/hip flexors take over). Leg slightly BEHIND neutral keeps left iliopsoas silent. Zero weight bearing on the left leg; it moves freely in space. Stop at any groin or anterior hip sensation.",
  },

  // ── TRX → split: pull (t3 row), core (others) ──
  {
    id: "t1", category: "core", name: "TRX Pallof Press",
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
    id: "t2", category: "core", name: "TRX Standing Rollout",
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
    id: "t3", category: "pull", name: "TRX Single-Arm Row",
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
    id: "t4", category: "core", name: "TRX Kneeling Rollout",
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
    id: "t5", category: "core", name: "TRX Kneeling Chop",
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
    id: "t6", category: "core", name: "TRX Body Saw",
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
    id: "t7", category: "core", name: "TRX Side Plank",
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

  // ── ARM BALANCE PREP → split: push (a5 lean, a6 protraction), core (others) ──
  {
    id: "a1", category: "core", name: "TRX Knee Tuck (Fig-4)",
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
    id: "a2", category: "core", name: "TRX Body Saw (Fig-4)",
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
    id: "a3", category: "core", name: "L-Sit Knee Tuck",
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
    id: "a4", category: "core", name: "R-Leg L-Sit Hold",
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
    id: "a5", category: "push", name: "Tuck Planche Lean",
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
    id: "a6", category: "push", name: "Support Protraction",
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
  {
    id: "a7", category: "core", name: "Plank Knee Tuck (R only)",
    target: "Obliques / Right Hip Flexor",
    cues: [
      "Forearm plank on right knee. Left leg extended behind on mat, passive.",
      "Draw RIGHT knee toward right elbow — 4-count in, 5s HOLD at peak, 4-count return.",
      "Never touch knee to ground between reps. Continuous tension.",
      "Left hip flexor must NOT engage — reset position if it does.",
    ],
    safetyNote: "Only the RIGHT knee moves. Left leg stays dead on the mat the entire time.",
  },

  // ── YOGA → recovery tab ──
  {
    id: "y1", category: "recovery", name: "Dolphin Pose",
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
    id: "y2", category: "recovery", name: "Warrior III (Modified)",
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
    id: "y3", category: "recovery", name: "FeetUp Leg Lowers",
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
    id: "y4", category: "recovery", name: "Chair Pose (Wall)",
    target: "Quad Endurance / Core Isometric",
    cues: [
      "Back against wall. Slide down to ~90° knee bend.",
      "RIGHT foot flat, bearing all weight.",
      "Left foot hovers or rests lightly on right ankle.",
      "Arms overhead or at chest. Hold 20-30s.",
    ],
    safetyNote: "Right leg only. Left foot hovers — zero weight bearing.",
  },

  // ── EQUIPMENT-SPECIFIC → split: push (e1), core (e2), legs (e3, e4) ──
  {
    id: "e1", category: "push", name: "Pseudo Planche Push-Up",
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
    id: "e2", category: "core", name: "Side Plank Config",
    target: "Right-Side-Down Only / Obliques",
    cues: [
      "Right side down ONLY — right elbow + right knee/foot bears weight.",
      "Left leg rests passively on top. Dead weight.",
      "Left-side-down loads injured femoral neck — NEVER do this.",
      "For left oblique bias: reach LEFT arm overhead from right-side-down.",
    ],
    safetyNote: "NEVER go left-side-down. That loads the left femoral neck through elbow-hip-knee chain.",
  },
  {
    id: "e3", category: "legs", name: "SL Leg Extension (R)",
    target: "Quad — Isolation",
    cues: [
      "Sit in leg extension machine. Pad against RIGHT shin. Left leg off the machine.",
      "Extend knee to full lockout.",
      "2-second SQUEEZE at top. 3-second eccentric lowering.",
      "Last set: drop set ×2 for metabolic exhaustion.",
    ],
    safetyNote: "Full lockout is safe here — open-chain, no hip compression. Go for the burn.",
    equipment: ["Leg Extension Machine"],
  },
  {
    id: "e4", category: "legs", name: "Nordic Ham Curl",
    target: "Hamstring — Eccentric Gold Standard",
    cues: [
      "Kneel on a thick pad with feet anchored (heavy dumbbell, bench, or partner).",
      "Slowly lower torso forward by extending at the knees.",
      "Fight gravity all the way down. Catch yourself with hands.",
      "Push off hands to return to start.",
    ],
    safetyNote: "Only 0-20° of hip flexion throughout. Gold standard for hamstring injury prevention.",
  },
];

// Map of exerciseId → animation component key (used by gallery to find the right animation)
// All IDs must match the animation map keys in their respective category files
export const ANIM_IDS = EXERCISES.map(e => e.id);
