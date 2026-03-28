export const SUPPLEMENT_LEFT_LEG = {
  base: ['Quad Sets', 'Short Arc Quads', 'Ankle Pumps & Circles'],
  legsExtra: ['Banded Terminal Knee Extensions', 'Reclined Knee Extensions']
};

export const SUPPLEMENT_CORE = {
  'Push A': {
    subtitle: 'Upper + Lower + Obliques',
    exercises: [
      { name: 'Seated Cable Crunch', region: 'Upper Abs' },
      { name: 'Modified Hollow Body Hold', region: 'Lower Abs' },
      { name: 'Pallof Press with Overhead Reach', region: 'Obliques' },
      { name: 'Modified Side Plank Hip Dips', region: 'Obliques' }
    ]
  },
  'Push B': {
    subtitle: 'Upper + Lower + Obliques',
    exercises: [
      { name: 'Modified Plank', region: 'Upper Abs' },
      { name: 'Reverse Crunch (R Leg Only)', region: 'Lower Abs' },
      { name: 'Single-Arm Seated Cable Row', region: 'Obliques' },
      { name: 'Seated Oblique Cable Crunch', region: 'Obliques' }
    ]
  },
  'Pull A': {
    subtitle: 'Upper + Lower + Obliques',
    exercises: [
      { name: 'Weighted Crunch (Seated)', region: 'Upper Abs' },
      { name: 'Modified Hollow Body Flutter', region: 'Lower Abs' },
      { name: 'Seated Landmine Rotation', region: 'Obliques' },
      { name: 'Modified Side Plank with Band Row', region: 'Obliques' }
    ]
  },
  'Pull B': {
    subtitle: 'Upper + Lower + Obliques',
    exercises: [
      { name: 'Modified Plank Shoulder Taps', region: 'Upper Abs' },
      { name: 'Slow Dead Bugs (Modified)', region: 'Lower Abs' },
      { name: 'High-to-Low Woodchop', region: 'Obliques' },
      { name: 'Suitcase Hold (Seated)', region: 'Obliques' }
    ]
  },
  'Legs A': {
    subtitle: 'Upper + Lower + Obliques',
    exercises: [
      { name: 'Seated Cable Crunch', region: 'Upper Abs' },
      { name: 'Right Leg Lowers', region: 'Lower Abs' },
      { name: 'Pallof Alphabet', region: 'Obliques' },
      { name: 'Modified Side Plank Hold', region: 'Obliques' }
    ]
  },
  'Legs B': {
    subtitle: 'Upper + Lower + Obliques',
    exercises: [
      { name: 'Modified Plank', region: 'Upper Abs' },
      { name: 'Reverse Crunch (R Leg Only)', region: 'Lower Abs' },
      { name: 'Low-to-High Woodchop', region: 'Obliques' },
      { name: 'Pallof ISO Hold', region: 'Obliques' }
    ]
  }
};

export const CABLE_VARIANTS = [
  { id: 'single-col', label: 'Single Column' },
  { id: 'dual-pulleys', label: 'Dual Pulleys' },
  { id: 'lat-machine', label: 'Lat Pulldown Machine' },
  { id: 'functional', label: 'Functional Trainer' }
];

export const CABLE_SUPERSET = {
  title: 'Left Ankle Dorsiflexion',
  sets: '2\u00d715',
  instruction:
    'Low cable, strap around top of left foot. Pull toes toward shin against cable resistance.',
  safety:
    'Tibialis anterior maintenance for gait recovery. Fully seated or reclined.'
};

export const GENERIC_SEATED_SUPERSET = {
  title: 'Quad Sets',
  sets: '2\u00d710, 5s hold',
  instruction:
    'Press back of left knee into seat surface. Hold 5 seconds, release, repeat.',
  safety: 'Pure isometric, zero joint stress. Can be done between any seated exercise.'
};

export const EQ_VARIANTS = {
  'SL Leg Press (Right)': {
    variants: [
      { id: '45-sled', label: '45\u00b0 Sled (Incline)' },
      { id: 'seated', label: 'Seated/Horizontal' },
      { id: 'plate-sled', label: 'Plate-Loaded Sled' }
    ],
    variantSetup: {
      '45-sled':
        'Sit in 45\u00b0 incline sled leg press. Place RIGHT foot HIGH on the plate (above center) to minimize hip flexion at the bottom. Left foot off the machine entirely. Back flat against pad, grip side handles.',
      seated:
        'Sit in seated/horizontal leg press. Place RIGHT foot centered on the press plate. Left foot off to the side. Adjust seat depth so hip flexion stays under 90\u00b0 at bottom of rep. Back against pad.',
      'plate-sled':
        'Sit in plate-loaded sled press. Place RIGHT foot HIGH on the plate. Left foot off the machine. Load plates evenly if machine has bilateral loading. Grip side handles firmly.'
    },
    superset: {
      title: 'Left Leg Extension',
      sets: '3\u00d710, 3s eccentric',
      instruction:
        'Go to nearest leg extension machine. Between leg press sets, do quad sets pressing left knee into the seat (2\u00d710, 5s hold) before walking to extension machine.',
      safety:
        'Can\u2019t use leg press for left leg (NWB). Hip stays static and reclined on extension machine, pure knee extension, zero iliopsoas.'
    }
  },
  'SL Leg Extension (Right)': {
    variants: [
      { id: 'selectorized', label: 'Selectorized' },
      { id: 'plate-loaded', label: 'Plate-Loaded' }
    ],
    variantSetup: {
      selectorized:
        'Sit in selectorized leg extension machine. Adjust back pad and shin pad for RIGHT leg. Left leg off the machine. Pin-select your weight.',
      'plate-loaded':
        'Sit in plate-loaded leg extension. Adjust pads for RIGHT leg. Left leg off the machine. Load plates manually.'
    },
    superset: {
      title: 'Left Leg Extension',
      sets: '3\u00d712, 3s eccentric',
      instruction:
        'Same machine \u2014 reduce weight to ~40-50% of right side. Stay seated, switch legs.',
      safety: 'Hip stays static and reclined, pure knee extension, zero iliopsoas.'
    },
    variantSupersetNotes: {
      'plate-loaded':
        'Plate-loaded requires manual weight change between legs \u2014 strip plates before switching.'
    }
  },
  'Prone Ham Curl (Right)': {
    variants: [
      { id: 'seated', label: 'Seated Machine' },
      { id: 'prone', label: 'Prone/Lying' },
      { id: 'plate-loaded', label: 'Plate-Loaded' }
    ],
    variantSetup: {
      seated:
        'Sit in seated hamstring curl machine. RIGHT leg on the pad, left leg off the machine. Adjust back pad so you\u2019re comfortably upright.',
      prone:
        'Lie face-down on prone/lying hamstring curl machine. RIGHT leg only under the pad. Left leg off to the side or resting on the machine frame.',
      'plate-loaded':
        'Position on plate-loaded curl machine (seated or prone depending on type). RIGHT leg only. Load plates manually.'
    },
    variantSuperset: {
      seated: {
        title: 'Left Leg Curl',
        sets: '3\u00d710',
        instruction:
          'Same machine \u2014 reduce weight significantly. Stay seated, switch legs. Go light (bilateral hamstring tendinosis).',
        safety: 'Force across knee only. Seated position keeps hip neutral.'
      },
      prone: {
        title: 'Left Leg Curl',
        sets: '3\u00d710',
        instruction:
          'Same machine \u2014 reduce weight significantly. Stay face down, switch legs. Go light (bilateral hamstring tendinosis).',
        safety: 'Force across knee only. Prone position keeps hip completely neutral.'
      },
      'plate-loaded': {
        title: 'Left Leg Curl',
        sets: '3\u00d710',
        instruction:
          'Same machine \u2014 reduce weight significantly, switch legs. Strip plates as needed. Go light (bilateral hamstring tendinosis).',
        safety: 'Force across knee only.'
      }
    }
  },
  'Machine Chest Press': {
    variants: [
      { id: 'selectorized', label: 'Selectorized' },
      { id: 'plate-loaded', label: 'Plate-Loaded' },
      { id: 'smith', label: 'Smith Machine' }
    ],
    variantSetup: {
      selectorized:
        'Sit at selectorized chest press machine. Adjust seat height so handles align with mid-chest. Pin-select weight. Back against pad.',
      'plate-loaded':
        'Sit at plate-loaded chest press machine. Adjust seat height so handles align with mid-chest. Load plates evenly on both sides.',
      smith:
        'Set up on a flat bench inside the Smith machine. Unrack the bar at chest height. Right foot flat on floor, left leg straight and relaxed.'
    },
    superset: {
      title: 'Quad Sets',
      sets: '2\u00d710, 5s hold',
      instruction:
        'Press back of left knee into seat surface. Hold 5 seconds, release, repeat.',
      safety: 'Pure isometric, zero joint stress.'
    }
  },
  'Lat Pulldown (Wide)': { isCable: true, variants: CABLE_VARIANTS },
  'Neutral Grip Pulldown': { isCable: true, variants: CABLE_VARIANTS },
  'Seated Cable Row': { isCable: true, variants: CABLE_VARIANTS },
  'One-Arm Cable Row': { isCable: true, variants: CABLE_VARIANTS },
  'Cable Chest Fly': { isCable: true, variants: CABLE_VARIANTS },
  'Tricep Rope Pushdown': { isCable: true, variants: CABLE_VARIANTS },
  'OH Triceps Extension': { isCable: true, variants: CABLE_VARIANTS },
  'Seated Face Pulls': { isCable: true, variants: CABLE_VARIANTS }
};
