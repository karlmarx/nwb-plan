export const WORKOUTS = {
  'Push A': {
    title: 'Push A — Heavy Strength',
    icon: '💪',
    color: '#38bdf8',
    hevy: 'https://hevy.com/routine/T2lMXhz4NFS',
    exercises: [
      'Barbell Floor Press',
      'Seated DB OH Press',
      'Incline DB Press + Lat Raises',
      'Lying Skull Crushers',
      'Pseudo Planche Push-Up',
      'McGill Curl-Up'
    ],
    removed: [
      { name: 'Standing OHP', reason: 'Requires bilateral stance' },
      { name: 'Dips (freestanding)', reason: 'Lower body swing risk' }
    ]
  },
  'Push B': {
    title: 'Push B — Volume / Hypertrophy',
    icon: '💪',
    color: '#38bdf8',
    hevy: 'https://hevy.com/routine/j0XrGQzMyF1',
    exercises: [
      'DB Floor Press',
      'Mechanical Drop Set (Press)',
      'Landmine Press (seated)',
      'Cable Chest Fly',
      'Tricep Rope Pushdown',
      'Parallette L-Sit',
      'Side Plank (R Side Down)'
    ],
    removed: []
  },
  'Pull A': {
    title: 'Pull A — Heavy Strength',
    icon: '🔗',
    color: '#a78bfa',
    hevy: 'https://hevy.com/routine/c91UqmMdwz7',
    exercises: [
      'Finger-Assist One-Arm Pull-Up',
      'Lat Pulldown (Wide)',
      'Chest-Supported DB Row',
      'Seated Cable Row',
      'Seated Face Pulls',
      'Preacher Curls',
      'Pallof Press (Seated)'
    ],
    removed: [
      {
        name: 'Bent-Over Row',
        reason: 'Unsupported spinal position — use chest-supported rows instead'
      }
    ]
  },
  'Pull B': {
    title: 'Pull B — Volume / Density',
    icon: '🔗',
    color: '#a78bfa',
    hevy: 'https://hevy.com/routine/J1rggKx4PIk',
    exercises: [
      'Neutral Grip Pulldown',
      'Mechanical Drop Set (Pull)',
      'One-Arm Cable Row',
      'Reverse Fly',
      'Hammer Curls',
      'Incline DB Curl',
      'Bird-Dog (Prone Bench)'
    ],
    removed: []
  },
  'Legs A': {
    title: 'Legs A — Quad/Glute (Cross-Ed)',
    icon: '🦵',
    color: '#10b981',
    hevy: 'https://hevy.com/routine/FKCWOPCUE4H',
    exercises: [
      'SL Leg Press (Right)',
      'SL Leg Extension (Right)',
      'SL Glute Bridge (Right)',
      'Banded Clamshells',
      'Isometric Quad Sets (Left)',
      'Ankle Pumps (Left)',
      'Dead Bug (R Leg Only)'
    ],
    removed: [
      { name: 'Pistol Squats', reason: 'Deep hip flexion damages labrum' },
      { name: 'Bulgarian Split Squat', reason: 'Exceeds 90° flexion limit' }
    ]
  },
  'Legs B': {
    title: 'Legs B — Posterior Chain',
    icon: '🦵',
    color: '#10b981',
    hevy: 'https://hevy.com/routine/s5QsLGXsVAy',
    exercises: [
      'Low-Box Step-Up (Right)',
      'SL Hip Thrust (Right)',
      'Prone Ham Curl (Right)',
      'Nordic Ham Curl',
      'Standing Calf Raise (R)',
      'Stir the Pot'
    ],
    removed: [
      {
        name: 'Seated Ham Curl',
        reason: 'Compresses ischial tuberosity (tendinopathy)'
      },
      { name: 'Deep RDLs', reason: 'Violent eccentric load on tendinosis' }
    ]
  },
  Recovery: {
    title: 'Active Recovery (Sunday)',
    icon: '🧘',
    color: '#64748b',
    exercises: [
      'Arm Ergometer',
      'Upper Body Stretching',
      'T-Spine Mobility',
      'Isometric Quad Sets (Left)',
      'Ankle Pumps (Left)'
    ],
    removed: []
  }
};

export const CORE_FINISHERS = {
  'Push A': ['Forearm Plank Saw', 'Pallof Press (Seated)'],
  'Push B': ['Dead Bug (R Leg Only)', 'Bird-Dog (Prone Bench)'],
  'Pull A': ['Side Plank (R Side Down)', 'Russian Twist (Seated Bench)'],
  'Pull B': ['Suitcase Hold (Seated)', 'McGill Curl-Up'],
  'Legs A': ['Hollow Body Hold', 'Side Plank (L Oblique Bias — R Side Down)'],
  'Legs B': ['Wheelbarrow Hold', 'Bicycle Crunch (R Leg Only)']
};

export const SCHED = [
  { d: 'Mon', t: 'Push A', i: '💪', c: '#38bdf8' },
  { d: 'Tue', t: 'Pull A', i: '🔗', c: '#a78bfa' },
  { d: 'Wed', t: 'Legs A', i: '🦵', c: '#10b981' },
  { d: 'Thu', t: 'Push B', i: '💪', c: '#38bdf8' },
  { d: 'Fri', t: 'Pull B', i: '🔗', c: '#a78bfa' },
  { d: 'Sat', t: 'Legs B', i: '🦵', c: '#10b981' },
  { d: 'Sun', t: 'Recovery', i: '🧘', c: '#64748b' }
];

export const PHASES = [
  {
    weeks: '1-2',
    name: 'Foundation',
    color: '#38bdf8',
    desc: 'Adaptation phase. Higher reps, learn safe patterns.'
  },
  {
    weeks: '3-4',
    name: 'Build',
    color: '#a78bfa',
    desc: 'Increase load. 4-sec eccentrics. Add drop sets & rest-pause.'
  },
  {
    weeks: '5-6',
    name: 'Peak',
    color: '#f97316',
    desc: 'Maximum safe output. Heavy singles. Pre-weight-bearing.'
  }
];
