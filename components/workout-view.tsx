"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { loadState, saveState } from "@/lib/storage";
import {
  EX,
  EQUIPMENT,
  WORKOUTS,
  CORE_FINISHERS,
  NEARBY_EQUIPMENT,
  SCHED,
  PHASES,
} from "@/lib/exercises";
import {
  SUPPLEMENT_LEFT_LEG,
  SUPPLEMENT_CORE,
  SUPPLEMENT_EX,
  CABLE_SUPERSET,
  EQUIP_TO_NEARBY,
  NEARBY_SUPERSETS,
} from "@/lib/supplements";
import type { VariantSuperset } from "@/lib/exercises";
import Section from "@/components/section";
import ExerciseRow from "@/components/exercise-row";
import RemovedRow from "@/components/removed-row";
import Callout from "@/components/callout";
import RestTimer from "@/components/rest-timer";
import ProgressClock from "@/components/progress-clock";
import MachineSelector from "@/components/machine-selector";
import NearbyPicker from "@/components/nearby-picker";
import Badge from "@/components/badge";
import DiagramModal from "@/components/diagram-modal";
import DiagramGallery from "@/components/diagrams/gallery";

// Conditionally import AuthButton only when feature flag is on
const AuthButton =
  process.env.NEXT_PUBLIC_FEATURE_AI_SUGGESTIONS === "true"
    ? React.lazy(() => import("@/components/auth-button"))
    : null;

// ===== DEFAULT HEVY IDS =====
const DEFAULT_HEVY: Record<string, string> = {
  "Push A": "T2lMXhz4NFS",
  "Push B": "j0XrGQzMyF1",
  "Pull A": "c91UqmMdwz7",
  "Pull B": "J1rggKx4PIk",
  "Legs A": "FKCWOPCUE4H",
  "Legs B": "s5QsLGXsVAy",
};

const TABS = ["Workout", "Upper", "Lower", "Core", "Cardio", "Safety"];

const TAB_TIPS = [
  "Today's scheduled workout",
  "Push + Pull exercise library",
  "Legs + Recovery exercise library",
  "Core exercises by body part",
  "NWB cardio options",
  "Injury cues & safety rules",
];

// Gear/config tab is accessed via header icon, not in the tab bar
const GEAR_TAB_INDEX = 6;

const DAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const DAY_ABBR = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getRealToday(): number {
  const jsDay = new Date().getDay();
  return jsDay === 0 ? 6 : jsDay - 1; // Mon=0 .. Sun=6
}

function parseHevyId(input: string | undefined): string {
  if (!input) return "";
  const match = input.match(/hevy\.com\/routine\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : input.trim();
}

// ===== EQUIPMENT CATEGORIES =====
const EQUIP_CATEGORIES: Record<string, string> = {
  weights: "Weights",
  machines: "Machines",
  functional: "Functional",
  cardio: "Cardio Equipment",
  basic: "Basic Gear",
  home: "Home Equipment",
};

// ===== CARDIO SCHEDULE DATA =====
const CARDIO_SCHEDULE = [
  ["Mon", "Rest", "SkiErg HIIT 25m", "~300"],
  ["Tue", "Arm Ergo 30m", "Battle Ropes 15m", "~400"],
  ["Wed", "SkiErg Intervals", "Rest", "~350"],
  ["Thu", "Boxing 20m", "SkiErg Steady 25m", "~450"],
  ["Fri", "Arm Ergo HIIT", "Ropes Tabata", "~400"],
  ["Sat", "SkiErg Long 40m", "Boxing 15m", "~500"],
  ["Sun", "Light Arm Ergo 20m", "Rest", "~100"],
];

// ===== INJURY DATA =====
const INJURIES = [
  {
    n: "L Hip Stress Fracture",
    c: "var(--color-danger)",
    r: "Compression-sided medial femoral neck. Strict NWB 6+ weeks. Zero hip flexor activation on left side. This drives ALL exercise modifications.",
  },
  {
    n: "Bilateral FAI + Labral Tears",
    c: "var(--color-warning)",
    r: "Cam-type impingement both hips. Anterosuperior labral tear. Keep hip flexion under 90\u00B0.",
  },
  {
    n: "Bilateral Hamstring Tendinosis",
    c: "var(--color-text-muted)",
    r: "Minor \u2014 no discrete tear. Not restricting programming.",
  },
  {
    n: "L4-L5 DDD",
    c: "var(--color-text-muted)",
    r: "Minor \u2014 not restricting programming. Good form is sufficient.",
  },
  {
    n: "R Hip Labral Tear (mild)",
    c: "var(--color-text-muted)",
    r: "Minor \u2014 small anterosuperior tear. Not restricting programming.",
  },
];

// ===== OVERLOAD RULES =====
const OVERLOAD_RULES = [
  {
    t: "Load Progression",
    d: "Add 2.5kg when all reps/sets hit target RPE across 2 sessions. Single-leg: 5% increments.",
  },
  {
    t: "Volume Accumulation",
    d: "Add 1 set/exercise/week over 3-week wave (3\u00D710 \u2192 4\u00D710 \u2192 5\u00D710), then deload.",
  },
  {
    t: "Tempo Manipulation",
    d: "4-second eccentric on any exercise. Increases TUT by 60-100%.",
  },
  {
    t: "Rest-Pause Sets",
    d: "8 reps \u2192 rack 15s \u2192 3-4 more \u2192 rack 15s \u2192 2-3 more. Comparable hypertrophy in less time.",
  },
  {
    t: "Mechanical Advantage Drop Sets",
    d: "Cycle harder\u2192easier variations (incline\u2192flat\u2192decline press). Max stimulus from limited exercises.",
  },
  {
    t: "Density Training",
    d: "Cut 15 seconds off rest every 2 weeks. Same work in less time = progressive overload.",
  },
];

// ===== GYM BAG ITEMS =====
const GYM_BAG = [
  {
    n: "Furniture Slider",
    d: "Mandatory for single-leg rowing intervals. Gyms don't have these.",
  },
  {
    n: "Thick Exercise Mat",
    d: "For floor presses and seated battle rope intervals.",
  },
  {
    n: "Light Resistance Band",
    d: "For Pallof presses and Thrower's Ten prehab if no cables.",
  },
  {
    n: "Parallettes (optional)",
    d: "For L-sits. Can use hex dumbbells at gym instead.",
  },
];

// ===== POOL METHODS =====
const POOL_METHODS = [
  {
    title: "Method 1: Sun Chair at Pool Edge",
    badge: "RECOMMENDED",
    badgeColor: "var(--color-safe)",
    badgeBg: "var(--color-safe-bg)",
    badgeBorder: "var(--color-safe-border)",
    entry:
      "Position heavy chair at pool edge. Sit, then lateral transfer to deck (hands press down). Controlled tricep-dip lower into the water. Right foot finds the wall, left leg hangs passively.",
    exit: "Hands on deck, right foot on wall. Straight-arm press up to seated on deck edge. Lift left leg with hands. Transfer to chair.",
    warning: null,
  },
  {
    title: "Method 2: Steps \u2014 Single Rail",
    badge: "HARDEST EXIT",
    badgeColor: "var(--color-danger)",
    badgeBg: "var(--color-danger-bg)",
    badgeBorder: "var(--color-danger-border)",
    entry:
      "Both hands on curved rail. Right foot steps down one step at a time. Hands walk down the rail. Left leg trails between steps. Buoyancy helps on lower steps.",
    exit: "Reverse the entry. Last 2\u20133 steps are hardest as buoyancy drops. Near-full bodyweight pull on one rail.",
    warning:
      "\u26A0\uFE0F Top steps can recruit left hip flexor \u2014 stop and reset if felt. Dry hands before exit.",
  },
  {
    title: "Method 3: Wall Press \u2014 No Props",
    badge: "ANY POOL",
    badgeColor: "var(--color-warning)",
    badgeBg: "var(--color-warning-bg)",
    badgeBorder: "var(--color-warning-border)",
    entry:
      "Sit at edge (lower via right knee). Hands on deck, slow tricep-negative dip into water. Left leg hangs passively.",
    exit: "Press up from water, rotate to seated on deck. Lift left leg with hands. Floor-to-stand via right knee.",
    warning: null,
  },
];

const POOL_TABLE = [
  ["Sun Chair", "Heavy chair at edge", "Easiest"],
  ["Steps + Rail", "Pool steps with rail", "Hard exit"],
  ["Wall Press", "Any pool edge", "Hardest"],
];

// ===== UPPER BODY MUSCLE GROUPS =====
const UPPER_GROUPS = [
  {
    key: "chest",
    label: "Chest",
    icon: "\uD83D\uDCAA",
    accent: "#38bdf8",
    exercises: [
      "Barbell Floor Press",
      "DB Floor Press",
      "Machine Chest Press",
      "Incline DB Press + Lat Raises",
      "Cable Chest Fly",
      "Mechanical Drop Set (Press)",
      "Dip Machine",
    ],
  },
  {
    key: "shoulders",
    label: "Shoulders",
    icon: "\uD83C\uDFCB\uFE0F",
    accent: "#f97316",
    exercises: [
      "Seated DB OH Press",
      "Seated Arnold Press",
      "Landmine Press (seated)",
      "Seated Face Pulls",
      "Reverse Fly",
    ],
  },
  {
    key: "back",
    label: "Back",
    icon: "\uD83E\uDDBE",
    accent: "#a78bfa",
    exercises: [
      "Lat Pulldown (Wide)",
      "Neutral Grip Pulldown",
      "Weighted Pull-Up",
      "Finger-Assist One-Arm Pull-Up",
      "Chest-Supported DB Row",
      "Seated Cable Row",
      "One-Arm Cable Row",
      "Mechanical Drop Set (Pull)",
    ],
  },
  {
    key: "arms",
    label: "Arms",
    icon: "\uD83D\uDCAA",
    accent: "#10b981",
    exercises: [
      "Lying Skull Crushers",
      "OH Triceps Extension",
      "Tricep Rope Pushdown",
      "Preacher Curls",
      "Hammer Curls",
      "Incline DB Curl",
    ],
  },
  {
    key: "skill",
    label: "Compound / Skill",
    icon: "\uD83E\uDD38",
    accent: "#eab308",
    exercises: [
      "Pseudo Planche Push-Up",
      "Parallette L-Sit",
    ],
  },
];

// ===== LOWER BODY MUSCLE GROUPS =====
const LOWER_GROUPS = [
  {
    key: "quads",
    label: "Quads",
    icon: "\uD83E\uDDB5",
    accent: "#38bdf8",
    exercises: [
      "SL Leg Press (Right)",
      "Hack Squat (Right)",
      "SL Leg Extension (Right)",
      "Low-Box Step-Up (Right)",
    ],
  },
  {
    key: "glutes",
    label: "Glutes / Hips",
    icon: "\uD83C\uDF51",
    accent: "#ec4899",
    exercises: [
      "SL Glute Bridge (Right)",
      "SL Hip Thrust (Right)",
      "Banded Clamshells",
    ],
  },
  {
    key: "hamstrings",
    label: "Hamstrings",
    icon: "\uD83E\uDDBF",
    accent: "#a78bfa",
    exercises: [
      "Prone Ham Curl (Right)",
      "Stab Ball Ham Curl (Right)",
      "Nordic Ham Curl",
    ],
  },
  {
    key: "calves",
    label: "Calves",
    icon: "\uD83E\uDDB6",
    accent: "#f97316",
    exercises: [
      "Standing Calf Raise (R)",
    ],
  },
  {
    key: "rehab",
    label: "Left Leg Rehab",
    icon: "\uD83E\uDE7B",
    accent: "#14b8a6",
    exercises: [
      "Isometric Quad Sets (Left)",
      "Ankle Pumps (Left)",
    ],
  },
];

// ===== CORE BLOCKS (organized by body part) =====
const CORE_BLOCKS = [
  {
    key: "core-anterior",
    title: "Anterior Core (Front)",
    icon: "\uD83D\uDD25",
    accent: "#ef4444",
    count: 8,
    exercises: [
      "Forearm Plank Saw",
      "Plank Knee Tuck (R only)",
      "Wheelbarrow Hold",
      "Hollow Body Hold",
      "Dead Bug (R Leg Only)",
      "Body Saw (Sliders)",
      "McGill Curl-Up",
      "Bicycle Crunch (R Leg Only)",
    ],
  },
  {
    key: "core-obliques",
    title: "Obliques & Lateral",
    icon: "\u2194\uFE0F",
    accent: "#a78bfa",
    count: 7,
    exercises: [
      "Side Plank (R Side Down)",
      "Side Plank (L Oblique Bias \u2014 R Side Down)",
      "Suitcase Hold (Seated)",
      "Pallof Press (Seated)",
      "Pallof Overhead Reach",
      "Russian Twist (Seated Bench)",
      "Cable Woodchop (Seated)",
    ],
  },
  {
    key: "core-posterior",
    title: "Posterior Core (Back)",
    icon: "\uD83E\uDDBF",
    accent: "#10b981",
    count: 3,
    exercises: [
      "Bird-Dog (Prone Bench)",
      "Spiderman Plank (R only)",
      "Slow Mountain Climber (R)",
    ],
  },
  {
    key: "core-integrated",
    title: "Full Core & Integrated",
    icon: "\uD83C\uDFAF",
    accent: "#f97316",
    count: 1,
    exercises: [
      "Stir the Pot",
    ],
  },
];

// Equipment-specific core blocks — shown when nearby equipment is selected
const EQUIPMENT_CORE_BLOCKS: {
  key: string;
  title: string;
  icon: string;
  accent: string;
  nearbyId: string;
  exercises: string[];
}[] = [
  {
    key: "core-captains-chair",
    title: "Captain's Chair Core",
    icon: "\uD83E\uDE91",
    accent: "#FF6B35",
    nearbyId: "captains_chair",
    exercises: [
      "Captain's Chair SLR (Right)",
      "Captain's Chair Knee-to-Elbow (Right)",
    ],
  },
  {
    key: "core-parallel-bars",
    title: "Parallel Bars Core",
    icon: "\uD83E\uDD38",
    accent: "#118AB2",
    nearbyId: "parallel_bars",
    exercises: [
      "Support Hold (Parallel Bars)",
      "Weight Shift Hold (Parallel Bars)",
    ],
  },
  {
    key: "core-barbell",
    title: "Barbell Core",
    icon: "\uD83C\uDFCB\uFE0F",
    accent: "#f97316",
    nearbyId: "barbell_rack",
    exercises: [
      "Dragon Flags",
      "Barbell Rollout (R-Knee)",
      "Body Saw (Barbell)",
      "Human Flag Progressions",
      "Eccentric Body Levers",
      "Hollow Body Inverted Rows",
    ],
  },
  {
    key: "core-hanging",
    title: "Hanging Core (Pull-Up Bar)",
    icon: "\uD83D\uDD25",
    accent: "#ef4444",
    nearbyId: "pullup_bar",
    exercises: [
      "Front Lever",
      "Windshield Wipers (R-Leg)",
      "1-Arm Hang + R Knee Drive",
      "Front Lever Raises",
      "Typewriter R-Leg Raises",
      "R-Leg Toes-to-Bar",
    ],
  },
];

const REMOVED_CORE = [
  {
    name: "Active Straight Leg Raises",
    reason:
      "Hip flexor contraction compresses femoral neck stress fracture. NEVER do these.",
  },
  {
    name: "Hanging Leg Raises",
    reason:
      "Deep hip flexion + massive hip flexor force = fracture danger.",
  },
  {
    name: "Standard Navasana / V-Ups / Tuck-Ups",
    reason:
      "Bilateral hip flexor activation. Use Modified Navasana (parallette press) instead.",
  },
  {
    name: "Standard Bird-Dog (quadruped)",
    reason:
      "Left knee at 90\u00B0 hip flexion approaches FAI limit + loads femoral neck. Use Prone Bench version instead. Quadruped needs PT clearance.",
  },
];

// ===== MAIN COMPONENT =====

export default function WorkoutView() {
  // ----- State -----
  const [tab, setTab] = useState(() => loadState<number>("nwb_tab", 0));
  const [phase, setPhase] = useState(() => loadState<number>("nwb_phase", 0));
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    () => {
      const sd = loadState<number>("nwb_startDay", 0);
      const rt = getRealToday();
      const rotIdx = (rt - sd + 7) % 7;
      return { [SCHED[rotIdx].t]: true };
    },
  );
  const [expandedEx, setExpandedEx] = useState<Record<string, boolean>>({});
  const [equipment, setEquipment] = useState<Record<string, boolean>>(() =>
    loadState("nwb_equipment", {}),
  );
  const [timer, setTimer] = useState<number | null>(null);
  const [diagramOpen, setDiagramOpen] = useState<string | null>(null);
  const [swaps, setSwaps] = useState<Record<string, string>>(() =>
    loadState("nwb_swaps", {}),
  );
  const [hevyIds, setHevyIds] = useState<Record<string, string>>(() =>
    loadState("nwb_hevy", DEFAULT_HEVY),
  );
  const [startDay, setStartDay] = useState(() =>
    loadState<number>("nwb_startDay", 0),
  );
  const [selectedDay, setSelectedDay] = useState(getRealToday);
  const [machineSelections, setMachineSelections] = useState<
    Record<string, string>
  >(() => loadState("nwb_machines", {}));
  const [nearbySelections, setNearbySelections] = useState<
    Record<string, string[]>
  >(() => loadState("nwb_nearby", {}));
  const [coreNearby, setCoreNearby] = useState<string[]>(
    () => loadState<string[]>("nwb_core_nearby", []),
  );
  const [supplementToggles, setSupplementToggles] = useState<{
    leftLeg: boolean;
    core: boolean;
  }>(() => loadState("nwb_supplements", { leftLeg: true, core: true }));
  const [upperFilter, setUpperFilter] = useState<string | null>(null);
  const [lowerFilter, setLowerFilter] = useState<string | null>(null);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window === "undefined") return "dark";
    return (localStorage.getItem("nwb_theme") as "dark" | "light") || "dark";
  });
  const [uiV2, setUiV2] = useState(() => loadState<boolean>("nwb_ui_v2", false));

  // ----- Persistence -----
  useEffect(() => {
    saveState("nwb_tab", tab);
  }, [tab]);
  useEffect(() => {
    saveState("nwb_phase", phase);
  }, [phase]);
  useEffect(() => {
    saveState("nwb_equipment", equipment);
  }, [equipment]);
  useEffect(() => {
    saveState("nwb_swaps", swaps);
  }, [swaps]);
  useEffect(() => {
    saveState("nwb_hevy", hevyIds);
  }, [hevyIds]);
  useEffect(() => {
    saveState("nwb_startDay", startDay);
  }, [startDay]);
  useEffect(() => {
    saveState("nwb_machines", machineSelections);
  }, [machineSelections]);
  useEffect(() => {
    saveState("nwb_nearby", nearbySelections);
  }, [nearbySelections]);
  useEffect(() => {
    saveState("nwb_core_nearby", coreNearby);
  }, [coreNearby]);
  useEffect(() => {
    saveState("nwb_supplements", supplementToggles);
  }, [supplementToggles]);
  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
    localStorage.setItem("nwb_theme", theme);
  }, [theme]);
  useEffect(() => {
    saveState("nwb_ui_v2", uiV2);
  }, [uiV2]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }, []);

  // ----- Helpers -----
  const realToday = getRealToday();

  const getWorkoutForDay = useCallback(
    (dayIdx: number) => {
      const rotIdx = (dayIdx - startDay + 7) % 7;
      return SCHED[rotIdx];
    },
    [startDay],
  );

  const toggleSection = useCallback((key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const toggleEx = useCallback((name: string) => {
    setExpandedEx((prev) => ({ ...prev, [name]: !prev[name] }));
  }, []);

  const isAvailable = useCallback(
    (exName: string): boolean => {
      const ex = EX[exName];
      if (!ex) return true;
      return ex.requires.every((r) => equipment[r] !== false);
    },
    [equipment],
  );

  const handleSwap = useCallback(
    (workoutKey: string, origName: string, newName: string) => {
      if (newName.startsWith("__timer__")) {
        setTimer(parseInt(newName.replace("__timer__", "")));
        return;
      }
      const key = workoutKey + ":" + origName;
      setSwaps((prev) => ({ ...prev, [key]: newName }));
    },
    [],
  );

  const getExName = useCallback(
    (workoutKey: string, origName: string): string => {
      const key = workoutKey + ":" + origName;
      return swaps[key] || origName;
    },
    [swaps],
  );

  const toggleSupplement = useCallback((key: "leftLeg" | "core") => {
    setSupplementToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const resetSwap = useCallback(
    (workoutKey: string, origName: string) => {
      const key = workoutKey + ":" + origName;
      setSwaps((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    },
    [],
  );

  // ----- Core exercise renderer (used in Core and workout tabs) -----
  function renderCoreExercise(name: string) {
    const ex = EX[name];
    if (!ex) return null;
    const unavail =
      !ex || ex.requires.some((r) => equipment[r] === false);
    return (
      <div key={name}>
        <ExerciseRow
          name={name}
          ex={ex}
          phase={phase}
          isExpanded={!!expandedEx[name]}
          onToggle={() => toggleEx(name)}
          onSwap={(sw) => {
            if (sw.startsWith("__timer__"))
              setTimer(parseInt(sw.replace("__timer__", "")));
          }}
          onDiagram={(d) => setDiagramOpen(d)}
          unavailable={unavail}
          equipment={equipment}
        />
        {expandedEx[name] && ex.machineVariants && (
          <div className="px-3 pb-2">
            <div className="text-xs font-bold text-text-muted uppercase tracking-wide mb-2">
              Machine type at your station
            </div>
            <MachineSelector
              variants={ex.machineVariants}
              selected={machineSelections[name] ?? null}
              onSelect={(id) =>
                setMachineSelections((prev) => ({ ...prev, [name]: id }))
              }
            />
          </div>
        )}
        {expandedEx[name] && (() => {
          const exData = EX[name];
          const inUseIds = exData
            ? exData.requires
                .map((r) => EQUIP_TO_NEARBY[r])
                .filter(Boolean)
            : [];
          return (
            <div className="px-3 pb-3">
              <NearbyPicker
                selected={nearbySelections[name] ?? []}
                inUse={inUseIds}
                onToggle={(id) =>
                  setNearbySelections((prev) => {
                    const current = prev[name] ?? [];
                    const next = current.includes(id)
                      ? current.filter((x) => x !== id)
                      : [...current, id];
                    return { ...prev, [name]: next };
                  })
                }
              />
            </div>
          );
        })()}
      </div>
    );
  }

  // ----- Render workout section -----
  function renderWorkout(workoutKey: string) {
    const w = WORKOUTS[workoutKey];
    if (!w) return null;
    const hevyId = parseHevyId(hevyIds[workoutKey] || w.hevy);
    const isTrainingDay = SUPPLEMENT_CORE[workoutKey] != null;
    const isLegsDay = workoutKey === "Legs A" || workoutKey === "Legs B";

    // Find first cable exercise for cable superset
    const firstCableEx = w.exercises.find((orig) => {
      const en = getExName(workoutKey, orig);
      return EX[en]?.cableSuperset;
    });
    const firstCableName = firstCableEx
      ? getExName(workoutKey, firstCableEx)
      : null;

    // Build supplement pairings — interleave left leg + core across main exercises
    const suppMap: Record<
      string,
      { type: "leftleg" | "core"; name: string; region?: string }[]
    > = {};
    let coreSubtitle = "";
    if (isTrainingDay) {
      const llExercises = [...SUPPLEMENT_LEFT_LEG.base];
      if (isLegsDay) llExercises.push(...SUPPLEMENT_LEFT_LEG.legsExtra);
      const coreExData = SUPPLEMENT_CORE[workoutKey].exercises;
      coreSubtitle = SUPPLEMENT_CORE[workoutKey].subtitle;

      const allSupps: {
        type: "leftleg" | "core";
        name: string;
        region?: string;
      }[] = [];
      const maxSL = Math.max(llExercises.length, coreExData.length);
      for (let si = 0; si < maxSL; si++) {
        if (si < llExercises.length)
          allSupps.push({ type: "leftleg", name: llExercises[si] });
        if (si < coreExData.length)
          allSupps.push({
            type: "core",
            name: coreExData[si].name,
            region: coreExData[si].region,
          });
      }

      const activeEx = w.exercises.filter((orig) => {
        const en = getExName(workoutKey, orig);
        const exd = EX[en];
        return exd && (exd.phase == null || phase >= exd.phase);
      });

      for (let sj = 0; sj < allSupps.length; sj++) {
        const target = activeEx[sj % activeEx.length];
        if (!suppMap[target]) suppMap[target] = [];
        suppMap[target].push(allSupps[sj]);
      }
    }

    const llExercises = isTrainingDay
      ? [
          ...SUPPLEMENT_LEFT_LEG.base,
          ...(isLegsDay ? SUPPLEMENT_LEFT_LEG.legsExtra : []),
        ]
      : [];
    const coreExData =
      isTrainingDay && SUPPLEMENT_CORE[workoutKey]
        ? SUPPLEMENT_CORE[workoutKey].exercises
        : [];

    return (
      <Section
        title={w.title}
        icon={w.icon}
        accent={w.color}
        isOpen={!!openSections[workoutKey]}
        onToggle={() => toggleSection(workoutKey)}
        count={w.exercises.length}
      >
        {/* Hevy link */}
        {hevyId && (
          <div className="mb-3">
            <a
              href={`https://hevy.com/routine/${hevyId}`}
              target="_blank"
              rel="noopener"
              onClick={(ev) => ev.stopPropagation()}
              className="block text-center rounded-xl text-sm font-semibold no-underline min-h-[48px] leading-[48px] transition-colors duration-150"
              style={{
                padding: "0 12px",
                background: "#a78bfa15",
                border: "1px solid #a78bfa33",
                color: "#a78bfa",
              }}
            >
              Open in HEVY
            </a>
          </div>
        )}

        {/* NWB Yoga link (Recovery only) */}
        {workoutKey === "Recovery" && (
          <a
            href="https://nyoga.93.fyi"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(ev) => ev.stopPropagation()}
            className="block mb-3 rounded-lg no-underline"
            style={{
              padding: "10px 14px",
              background: "var(--color-card)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div className="flex items-center gap-2.5">
              <svg width={28} height={28} viewBox="0 0 24 24" fill="currentColor">
                <g transform="translate(12,18)">
                  <path d="M0,0 C-1.5,-1.8 -1.8,-5.2 0,-8 C1.8,-5.2 1.5,-1.8 0,0Z" opacity="0.5"/>
                  <path d="M0,0 C-1.2,-2.5 -1.5,-7 0,-11 C1.5,-7 1.2,-2.5 0,0Z" opacity="0.7"/>
                  <path d="M0,0 C-1,-3.2 -1.2,-8 0,-13 C1.2,-8 1,-3.2 0,0Z"/>
                  <path d="M0,0 C-1.5,-1.8 -1.8,-5.2 0,-8 C1.8,-5.2 1.5,-1.8 0,0Z" transform="rotate(35)" opacity="0.5"/>
                  <path d="M0,0 C-1.5,-1.8 -1.8,-5.2 0,-8 C1.8,-5.2 1.5,-1.8 0,0Z" transform="rotate(-35)" opacity="0.5"/>
                  <path d="M0,0 C-1.2,-2.5 -1.5,-7 0,-11 C1.5,-7 1.2,-2.5 0,0Z" transform="rotate(20)" opacity="0.6"/>
                  <path d="M0,0 C-1.2,-2.5 -1.5,-7 0,-11 C1.5,-7 1.2,-2.5 0,0Z" transform="rotate(-20)" opacity="0.6"/>
                </g>
              </svg>
              <div>
                <div className="text-[13px] font-semibold text-text">
                  NWB Yoga Companion App
                </div>
                <div className="text-[11px] text-text-dim mt-0.5">
                  3 guided tiers &middot; 14 animated poses &middot; built-in
                  timer
                </div>
              </div>
              <span className="ml-auto text-text-muted text-xs">
                &rarr;
              </span>
            </div>
          </a>
        )}

        {/* Supplement toggle controls */}
        {isTrainingDay && (
          <div className="flex gap-2 mb-3 flex-wrap">
            <button
              onClick={(ev) => {
                ev.stopPropagation();
                toggleSupplement("leftLeg");
              }}
              className="text-[11px] rounded-xl cursor-pointer font-[inherit] min-h-[36px] transition-all duration-150"
              style={{
                padding: "6px 12px",
                background: supplementToggles.leftLeg
                  ? "var(--color-ll)15"
                  : "transparent",
                border: `1.5px solid ${supplementToggles.leftLeg ? "var(--color-ll)" : "var(--color-border)"}`,
                color: supplementToggles.leftLeg
                  ? "var(--color-ll)"
                  : "var(--color-text-muted)",
                fontWeight: supplementToggles.leftLeg ? 600 : 400,
              }}
            >
              {"\uD83E\uDDBF"} L-Leg Supersets{" "}
              {supplementToggles.leftLeg ? "ON" : "OFF"}
            </button>
            <button
              onClick={(ev) => {
                ev.stopPropagation();
                toggleSupplement("core");
              }}
              className="text-[11px] rounded-xl cursor-pointer font-[inherit] min-h-[36px] transition-all duration-150"
              style={{
                padding: "6px 12px",
                background: supplementToggles.core
                  ? "var(--color-core-sup)15"
                  : "transparent",
                border: `1.5px solid ${supplementToggles.core ? "var(--color-core-sup)" : "var(--color-border)"}`,
                color: supplementToggles.core
                  ? "var(--color-core-sup)"
                  : "var(--color-text-muted)",
                fontWeight: supplementToggles.core ? 600 : 400,
              }}
            >
              {"\uD83C\uDFAF"} Core Supersets{" "}
              {supplementToggles.core ? "ON" : "OFF"}
              {coreSubtitle ? ` \u2014 ${coreSubtitle}` : ""}
            </button>
          </div>
        )}

        {/* Exercise rows */}
        {w.exercises.map((origName) => {
          const exName = getExName(workoutKey, origName);
          const ex = EX[exName];
          if (!ex) return null;
          if (ex.phase != null && phase < ex.phase) return null;
          const unavail = !isAvailable(exName);
          const isExp = !!expandedEx[exName];

          // Resolve selected machine variant (for setup cues + superset)
          const selMachineId = machineSelections[exName];
          const selectedVariant = ex.machineVariants?.find(
            (v) => v.id === selMachineId
          ) ?? null;

          // Equipment-specific superset (driven by machineVariants selection)
          let ssInfo: VariantSuperset | null = null;
          if (supplementToggles.leftLeg) {
            if (ex.cableSuperset && exName === firstCableName) {
              ssInfo = { ...CABLE_SUPERSET };
              // Check if selected machine variant is a lat pulldown machine (no low cable)
              if (selMachineId === "band_rack") {
                ssInfo.note =
                  "No cable available with band setup \u2014 do ankle dorsiflexion at nearest cable column between sets.";
              }
            } else if (selectedVariant?.superset) {
              // Only show variant superset when user has explicitly selected a machine type
              ssInfo = { ...selectedVariant.superset };
            }
          }

          const suppCards = suppMap[origName] || [];
          const activeSuppCards = suppCards.filter((supp) => {
            const isLL = supp.type === "leftleg";
            return (
              (isLL && supplementToggles.leftLeg) ||
              (!isLL && supplementToggles.core)
            );
          });

          const v2GroupAccent =
            uiV2 && activeSuppCards.length > 0
              ? activeSuppCards.some((s) => s.type === "leftleg")
                ? "#14b8a6"
                : "#f97316"
              : null;
          return (
            <div
              key={origName}
              style={
                v2GroupAccent
                  ? {
                      borderLeft: `2px solid ${v2GroupAccent}55`,
                      paddingLeft: 3,
                      marginLeft: 2,
                      borderRadius: "0 0 0 6px",
                    }
                  : undefined
              }
            >
              {/* Swap indicator */}
              {exName !== origName && (
                <div className="text-[10px] text-text-muted px-3 flex items-center gap-1">
                  <span>
                    {"\u21BB"} was: {origName}
                  </span>
                  <button
                    onClick={() => resetSwap(workoutKey, origName)}
                    className="text-[10px] text-accent bg-transparent border-none cursor-pointer font-[inherit] underline"
                  >
                    undo
                  </button>
                </div>
              )}
              <ExerciseRow
                name={exName}
                ex={ex}
                phase={phase}
                isExpanded={isExp}
                onToggle={() => toggleEx(exName)}
                onSwap={(sw) => handleSwap(workoutKey, origName, sw)}
                onDiagram={(d) => setDiagramOpen(d)}
                unavailable={unavail}
                equipment={equipment}
                workoutExercises={w.exercises.map((o) =>
                  getExName(workoutKey, o)
                )}
                variantSetupCues={selectedVariant?.setupCues}
                variantLabel={selectedVariant?.label}
                supplementSlot={
                  suppCards.length > 0 ? (
                    <div className="mb-3">
                      {suppCards.map((supp) => {
                        const isLL = supp.type === "leftleg";
                        if (isLL && !supplementToggles.leftLeg) return null;
                        if (!isLL && !supplementToggles.core) return null;
                        if (isLL && ssInfo) return null;
                        const suppEx = EX[supp.name] ?? SUPPLEMENT_EX[supp.name];
                        if (!suppEx) return null;
                        const suppSets = suppEx.sets[phase] || suppEx.sets[0];
                        const suppExpKey = "supp_" + supp.name;
                        const suppIsExp = !!expandedEx[suppExpKey];
                        const groupTotal = isLL ? llExercises.length : coreExData.length;
                        const groupIdx = isLL
                          ? llExercises.indexOf(supp.name) + 1
                          : coreExData.findIndex((c) => c.name === supp.name) + 1;
                        const groupLabel = `${groupIdx}/${groupTotal}`;

                        if (isLL) {
                          return (
                            <div key={`supp-${supp.name}`} className="mx-1 my-0.5 rounded-lg overflow-hidden" style={{ background: "#14b8a609", border: "1px solid #14b8a628", borderLeft: "3px solid #14b8a6" }}>
                              <div onClick={() => toggleEx(suppExpKey)} className="cursor-pointer flex items-center gap-1.5" style={{ padding: "8px 10px" }}>
                                <span className="inline-flex items-center justify-center rounded text-[9px] font-extrabold shrink-0" style={{ width: 18, height: 18, background: "#14b8a622", border: "1px solid #14b8a644", color: "#14b8a6" }}>L</span>
                                <span className="text-[9px] font-bold" style={{ color: "#14b8a6", opacity: 0.7 }}>{groupLabel}</span>
                                <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "#14b8a6" }}>Left Leg</span>
                                <span className="font-semibold text-xs text-text flex-1">{supp.name}</span>
                                <span className="text-[10px] text-text-dim">{suppSets[0]}&times;{suppSets[1]}</span>
                                <span className="text-[9px] ml-1" style={{ color: "#14b8a6" }}>{suppIsExp ? "▲" : "▼"}</span>
                              </div>
                              {suppIsExp && (
                                <div className="text-[11px] leading-relaxed" style={{ padding: "0 10px 10px" }}>
                                  <div className="mb-1.5"><span className="font-bold text-[10px]" style={{ color: "#14b8a6" }}>📍 Setup: </span><span className="text-text-dim">{suppEx.setup}</span></div>
                                  <div className="mb-1.5"><span className="font-bold text-[10px] text-safe">🔄 Execute: </span><span className="text-text-dim">{suppEx.execution}</span></div>
                                  <div><span className="font-bold text-[10px]" style={{ color: "#14b8a6" }}>🛡️ Safety: </span><span className="text-text-dim">{suppEx.nwbCues}</span></div>
                                  {suppEx.rest > 0 && <button onClick={(ev) => { ev.stopPropagation(); setTimer(suppEx.rest); }} className="mt-2 w-full rounded-md text-[11px] font-semibold cursor-pointer font-[inherit]" style={{ padding: 7, background: "#14b8a618", border: "1px solid #14b8a633", color: "#14b8a6" }}>⏱ Start {suppEx.rest}s Rest</button>}
                                </div>
                              )}
                            </div>
                          );
                        } else {
                          const regionColors: Record<string, string> = { "Upper Abs": "#f59e0b", "Lower Abs": "#ec4899", Obliques: "#a78bfa" };
                          const regionColor = regionColors[supp.region || ""] || "#f97316";
                          return (
                            <div key={`supp-${supp.name}`} className="mx-1 my-0.5 rounded-lg overflow-hidden" style={{ border: "1px dashed #f9731633", background: "linear-gradient(135deg, #f9731608 0%, #f9731603 100%)" }}>
                              <div style={{ height: 3, background: `linear-gradient(90deg, ${regionColor}, ${regionColor}66)` }} />
                              <div onClick={() => toggleEx(suppExpKey)} className="cursor-pointer flex items-center gap-1.5" style={{ padding: "8px 10px" }}>
                                <span className="inline-flex items-center justify-center rounded-full text-[8px] font-extrabold shrink-0" style={{ minWidth: 20, height: 20, padding: "0 4px", background: "#f9731622", border: "1px solid #f9731644", color: "#f97316" }}>{groupLabel}</span>
                                <span className="text-[8px] font-bold uppercase tracking-wider shrink-0 rounded-lg" style={{ padding: "2px 6px", background: regionColor + "22", border: `1px solid ${regionColor}44`, color: regionColor }}>{supp.region || "Core"}</span>
                                <span className="font-semibold text-xs text-text flex-1">{supp.name}</span>
                                <span className="text-[10px] text-text-dim">{suppSets[0]}&times;{suppSets[1]}</span>
                                <span className="text-[9px] ml-1" style={{ color: "#f97316" }}>{suppIsExp ? "▲" : "▼"}</span>
                              </div>
                              {suppIsExp && (
                                <div className="text-[11px] leading-relaxed" style={{ padding: "0 10px 10px" }}>
                                  <div className="mb-1.5"><span className="font-bold text-[10px]" style={{ color: "#f97316" }}>📍 Setup: </span><span className="text-text-dim">{suppEx.setup}</span></div>
                                  <div className="mb-1.5"><span className="font-bold text-[10px] text-safe">🔄 Execute: </span><span className="text-text-dim">{suppEx.execution}</span></div>
                                  <div><span className="font-bold text-[10px]" style={{ color: "#f97316" }}>🛡️ Safety: </span><span className="text-text-dim">{suppEx.nwbCues}</span></div>
                                  {suppEx.rest > 0 && <button onClick={(ev) => { ev.stopPropagation(); setTimer(suppEx.rest); }} className="mt-2 w-full rounded-md text-[11px] font-semibold cursor-pointer font-[inherit]" style={{ padding: 7, background: "#f9731618", border: "1px solid #f9731633", color: "#f97316" }}>⏱ Start {suppEx.rest}s Rest</button>}
                                </div>
                              )}
                            </div>
                          );
                        }
                      })}
                    </div>
                  ) : undefined
                }
              />

              {/* Supplement indicator — show in both collapsed and expanded states */}
              {activeSuppCards.length > 0 && (
                <div
                  onClick={() => toggleEx(exName)}
                  className="cursor-pointer flex items-center gap-1.5"
                  style={{
                    margin: "-4px 0 4px",
                    padding: "4px 12px 6px",
                    background:
                      "linear-gradient(90deg, #14b8a608, #f9731608)",
                    borderRadius: "0 0 8px 8px",
                    borderLeft: "3px solid transparent",
                    borderImage:
                      "linear-gradient(to bottom, #14b8a644, #f9731644) 1",
                  }}
                >
                  {activeSuppCards.map((supp, si) => {
                    const isLL = supp.type === "leftleg";
                    const accent = isLL ? "#14b8a6" : "#f97316";
                    const label = isLL ? "L" : "C";
                    const chipLabel = isLL ? "L-LEG" : "CORE";
                    return (
                      <span
                        key={`ind-${si}`}
                        className="inline-flex items-center gap-1"
                      >
                        {uiV2 ? (
                          <span
                            data-testid="v2-supp-chip"
                            className="inline-flex items-center justify-center rounded-full text-[8px] font-extrabold tracking-wide"
                            style={{
                              padding: "1px 6px",
                              background: accent + "22",
                              border: `1px solid ${accent}44`,
                              color: accent,
                            }}
                          >
                            {chipLabel}
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center justify-center rounded text-[7px] font-extrabold"
                            style={{
                              width: 14,
                              height: 14,
                              background: accent + "22",
                              border: `1px solid ${accent}44`,
                              color: accent,
                            }}
                          >
                            {label}
                          </span>
                        )}
                        <span
                          className="text-[9px] font-semibold"
                          style={{ color: accent, opacity: 0.8 }}
                        >
                          {supp.name.length > 20
                            ? supp.name.substring(0, 18) + "..."
                            : supp.name}
                        </span>
                      </span>
                    );
                  })}
                  <span className="ml-auto text-[8px] text-text-muted">
                    {"\u25BC"} tap to expand
                  </span>
                </div>
              )}

              {/* Supplement cards now rendered inside ExerciseRow via supplementSlot prop */}

              {/* Equipment-specific superset card */}
              {isExp && ssInfo && (
                <div
                  className="mx-3 mb-2 rounded-lg"
                  style={{
                    padding: "8px 10px",
                    background: "#14b8a60d",
                    border: "1px solid #14b8a633",
                    borderLeft: "3px solid #14b8a6",
                  }}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span
                      className="text-[8px] font-extrabold rounded px-1 py-0.5"
                      style={{
                        background: "#14b8a622",
                        border: "1px solid #14b8a644",
                        color: "#14b8a6",
                      }}
                    >
                      SUPERSET
                    </span>
                    <span
                      className="text-xs font-semibold"
                      style={{ color: "#14b8a6" }}
                    >
                      {ssInfo.title}
                    </span>
                    <span className="ml-auto text-[10px] text-text-dim">
                      {ssInfo.sets}
                    </span>
                  </div>
                  <div className="text-[11px] text-text-dim leading-relaxed">
                    {ssInfo.instruction}
                  </div>
                  <div
                    className="text-[10px] mt-1"
                    style={{ color: "#14b8a6" }}
                  >
                    {"\uD83D\uDEE1\uFE0F"} {ssInfo.safety}
                  </div>
                  {ssInfo.note && (
                    <div className="text-[10px] mt-1 text-warning">
                      {"\u26A0\uFE0F"} {ssInfo.note}
                    </div>
                  )}
                </div>
              )}

              {/* Machine selector */}
              {isExp && ex.machineVariants && (
                <div className="px-3 pb-2">
                  <div className="text-xs font-bold text-text-muted uppercase tracking-wide mb-2">
                    Machine type at your station
                  </div>
                  <MachineSelector
                    variants={ex.machineVariants}
                    selected={machineSelections[exName] ?? null}
                    onSelect={(id) =>
                      setMachineSelections((prev) => ({
                        ...prev,
                        [exName]: id,
                      }))
                    }
                  />
                </div>
              )}
              {/* Nearby picker */}
              {isExp && (() => {
                const exData = EX[exName];
                const inUseIds = exData
                  ? exData.requires
                      .map((r) => EQUIP_TO_NEARBY[r])
                      .filter(Boolean)
                  : [];
                const allNearby = [
                  ...new Set([
                    ...inUseIds,
                    ...(nearbySelections[exName] ?? []),
                  ]),
                ];
                const nearbySupersets = supplementToggles.leftLeg
                  ? NEARBY_SUPERSETS.filter(
                      (ns) =>
                        allNearby.includes(ns.nearbyId) &&
                        !inUseIds.includes(ns.nearbyId) &&
                        !ssInfo // don't duplicate if we already have an equipment-specific superset
                    )
                  : [];
                return (
                  <div className="px-3 pb-3">
                    <NearbyPicker
                      selected={nearbySelections[exName] ?? []}
                      inUse={inUseIds}
                      onToggle={(id) =>
                        setNearbySelections((prev) => {
                          const current = prev[exName] ?? [];
                          const next = current.includes(id)
                            ? current.filter((x) => x !== id)
                            : [...current, id];
                          return { ...prev, [exName]: next };
                        })
                      }
                    />
                    {nearbySupersets.length > 0 && (
                      <div className="mt-2 space-y-1.5">
                        {nearbySupersets.map((ns) => (
                          <div
                            key={ns.nearbyId}
                            className="rounded-lg"
                            style={{
                              padding: "8px 10px",
                              background: "#14b8a60d",
                              border: "1px solid #14b8a633",
                              borderLeft: "3px solid #14b8a6",
                            }}
                          >
                            <div className="flex items-center gap-1.5 mb-1">
                              <span
                                className="text-[8px] font-extrabold rounded px-1 py-0.5"
                                style={{
                                  background: "#14b8a622",
                                  border: "1px solid #14b8a644",
                                  color: "#14b8a6",
                                }}
                              >
                                NEARBY
                              </span>
                              <span
                                className="text-xs font-semibold"
                                style={{ color: "#14b8a6" }}
                              >
                                {ns.title}
                              </span>
                              <span className="ml-auto text-[10px] text-text-dim">
                                {ns.sets}
                              </span>
                            </div>
                            <div className="text-[11px] text-text-dim leading-relaxed">
                              {ns.instruction}
                            </div>
                            <div
                              className="text-[10px] mt-1"
                              style={{ color: "#14b8a6" }}
                            >
                              {"\uD83D\uDEE1\uFE0F"} {ns.safety}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          );
        })}

        {/* Removed exercises */}
        {w.removed.length > 0 && (
          <div className="mt-2.5 pt-2.5 border-t border-border">
            {w.removed.map((r) => (
              <RemovedRow key={r.name} name={r.name} reason={r.reason} />
            ))}
          </div>
        )}

        {/* Core finishers */}
        {CORE_FINISHERS[workoutKey] && (
          <div
            className="mt-4 rounded-xl"
            style={{
              padding: "14px",
              background: "var(--color-bg)",
              border: "1px dashed var(--color-warning)33",
            }}
          >
            <div className="text-[13px] font-bold text-warning mb-3 tracking-wide">
              {"\uD83D\uDD25"} Core Finisher &mdash; pick 1&ndash;2
            </div>
            {CORE_FINISHERS[workoutKey].map((name) => {
              const ex = EX[name];
              if (!ex) return null;
              return (
                <ExerciseRow
                  key={`cf-${name}`}
                  name={name}
                  ex={ex}
                  phase={phase}
                  isExpanded={!!expandedEx[name]}
                  onToggle={() => toggleEx(name)}
                  onSwap={(sw) => {
                    if (sw.startsWith("__timer__"))
                      setTimer(parseInt(sw.replace("__timer__", "")));
                  }}
                  onDiagram={(d) => setDiagramOpen(d)}
                  unavailable={!isAvailable(name)}
                  equipment={equipment}
                />
              );
            })}
          </div>
        )}
      </Section>
    );
  }

  // ========== TAB CONTENT ==========

  function renderTodayTab() {
    const selSched = getWorkoutForDay(selectedDay);
    const isToday = selectedDay === realToday;

    return (
      <div>
        {/* Day header */}
        <div
          data-testid="day-header"
          className="text-center mb-5 rounded-xl"
          style={uiV2 ? {
            padding: "16px 12px 14px",
            background: `linear-gradient(135deg, ${selSched.c}15 0%, ${selSched.c}08 50%, transparent 100%)`,
            border: `1px solid ${selSched.c}22`,
          } : undefined}
        >
          <div className="text-xs text-text-muted uppercase tracking-[0.15em] font-medium">
            {isToday ? "Today \u2014 " : ""}
            {DAY_NAMES[selectedDay]}
          </div>
          <div
            className="text-2xl font-extrabold mt-1.5 tracking-tight"
            style={{ color: selSched.c }}
          >
            {selSched.i} {selSched.t}
          </div>
        </div>

        {/* Day picker grid */}
        <div className="grid grid-cols-7 gap-1.5 mb-5">
          {DAY_ABBR.map((d, i) => {
            const dayWorkout = getWorkoutForDay(i);
            const isSel = i === selectedDay;
            const isReal = i === realToday;
            return (
              <div
                key={`day-${i}`}
                onClick={() => {
                  setSelectedDay(i);
                  if (!openSections[dayWorkout.t])
                    toggleSection(dayWorkout.t);
                }}
                className="rounded-xl text-center cursor-pointer transition-all duration-150"
                style={{
                  padding: "8px 3px",
                  background: isSel
                    ? dayWorkout.c + "18"
                    : "var(--color-card)",
                  border: `1.5px solid ${isSel ? dayWorkout.c : isReal ? dayWorkout.c + "44" : "var(--color-border)"}`,
                  boxShadow: isSel ? `0 0 10px ${dayWorkout.c}15` : "none",
                }}
              >
                <div
                  className="text-[10px] font-bold uppercase"
                  style={{
                    color: isSel ? dayWorkout.c : "var(--color-text-muted)",
                  }}
                >
                  {isReal ? "\u2022 " + d : d}
                </div>
                <div className="text-base my-0.5">{dayWorkout.i}</div>
                <div
                  className="text-[9px] font-semibold"
                  style={{
                    color: isSel
                      ? "var(--color-text)"
                      : "var(--color-text-muted)",
                  }}
                >
                  {dayWorkout.t}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected workout */}
        {WORKOUTS[selSched.t] && renderWorkout(selSched.t)}

        {/* Cross-Education Protocol */}
        <Section
          title="Cross-Education Protocol"
          icon={"\uD83E\uDDE0"}
          isOpen={!!openSections["cross-ed"]}
          onToggle={() => toggleSection("cross-ed")}
        >
          <Callout type="info">
            Manca et al. meta-analysis: 11.9% strength gains in untrained
            limb. Eccentric-focused work &rarr; 17.7% crossover.
          </Callout>
          <div className="text-xs text-text-dim leading-[1.7]">
            {[
              "Intensity: \u226580% 1RM (Weeks 3+)",
              "Tempo: 4-second eccentric on leg exercises",
              "Rest: 2+ minutes between heavy sets",
              "ROM: <90\u00B0 hip flexion (protects left hip)",
              "Mental focus on injured limb during right-leg training",
            ].map((r, i) => (
              <p key={`r-${i}`}>&bull; {r}</p>
            ))}
          </div>
        </Section>
      </div>
    );
  }

  function renderExerciseLibrary(
    groups: typeof UPPER_GROUPS,
    filter: string | null,
    setFilter: (f: string | null) => void,
    accentColor: string,
    diagramLabel: string,
    diagramDesc: string,
  ) {
    const visibleGroups = filter
      ? groups.filter((g) => g.key === filter)
      : groups;

    const totalExercises = groups.reduce((n, g) => n + g.exercises.length, 0);
    const availableCount = groups.reduce(
      (n, g) => n + g.exercises.filter((name) => isAvailable(name)).length,
      0,
    );

    return (
      <div>
        {/* Diagram gallery button */}
        <button
          data-testid="open-diagram-gallery"
          onClick={() => setDiagramOpen("gallery")}
          className="w-full mb-3 rounded-xl cursor-pointer font-[inherit] text-left min-h-[44px]"
          style={{
            padding: "12px 14px",
            background: uiV2
              ? `linear-gradient(135deg, ${accentColor}18 0%, ${accentColor}08 60%, transparent 100%)`
              : accentColor + "15",
            border: `1px solid ${accentColor}33`,
            boxShadow: uiV2 ? `0 0 16px ${accentColor}08` : "none",
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">{"\uD83C\uDFA8"}</span>
            <div>
              <div className="text-[13px] font-semibold" style={{ color: accentColor }}>
                {diagramLabel}
              </div>
              <div className="text-[10px] text-text-dim">
                {diagramDesc}
              </div>
            </div>
            <span className="ml-auto text-text-muted text-xs">&rarr;</span>
          </div>
        </button>

        {/* Stats bar */}
        <div className="text-[10px] text-text-muted mb-2 px-1">
          {availableCount}/{totalExercises} exercises available with current equipment
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {uiV2 ? (
            // v2: centered flex pills with count badge
            <>
              <button
                onClick={() => setFilter(null)}
                className="inline-flex items-center justify-content-center gap-1.5 font-[inherit] rounded-full cursor-pointer"
                style={{
                  padding: "6px 13px", minHeight: 32, fontSize: 11.5, fontWeight: filter === null ? 700 : 500,
                  border: `1.5px solid ${filter === null ? accentColor + "88" : "var(--color-border)"}`,
                  background: filter === null ? accentColor + "18" : "var(--color-card)",
                  color: filter === null ? accentColor : "var(--color-text-muted)",
                }}
              >
                All
                <span style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  background: filter === null ? accentColor + "33" : "var(--color-border)",
                  borderRadius: 10, padding: "1px 5px", fontSize: 9, fontWeight: 800,
                  color: filter === null ? accentColor : "var(--color-text-muted)",
                  lineHeight: 1.4,
                }}>{totalExercises}</span>
              </button>
              {groups.map((g) => {
                const isActive = filter === g.key;
                return (
                  <button
                    key={g.key}
                    onClick={() => setFilter(isActive ? null : g.key)}
                    className="inline-flex items-center justify-center gap-1.5 font-[inherit] rounded-full cursor-pointer"
                    style={{
                      padding: "6px 13px", minHeight: 32, fontSize: 11.5, fontWeight: isActive ? 700 : 500,
                      border: `1.5px solid ${isActive ? g.accent + "88" : "var(--color-border)"}`,
                      background: isActive ? g.accent + "18" : "var(--color-card)",
                      color: isActive ? g.accent : "var(--color-text-muted)",
                    }}
                  >
                    {g.icon} {g.label}
                    <span style={{
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      background: isActive ? g.accent + "33" : "var(--color-border)",
                      borderRadius: 10, padding: "1px 5px", fontSize: 9, fontWeight: 800,
                      color: isActive ? g.accent : "var(--color-text-muted)",
                      lineHeight: 1.4,
                    }}>{g.exercises.length}</span>
                  </button>
                );
              })}
            </>
          ) : (
            // classic: existing pills
            <>
              <button
                onClick={() => setFilter(null)}
                className="px-2.5 py-1.5 text-[11px] font-[inherit] rounded-md cursor-pointer min-h-[36px]"
                style={{
                  border: filter === null ? `1.5px solid ${accentColor}` : "1.5px solid var(--color-border)",
                  background: filter === null ? accentColor + "18" : "var(--color-card)",
                  color: filter === null ? accentColor : "var(--color-text-muted)",
                  fontWeight: filter === null ? 700 : 400,
                }}
              >
                All
              </button>
              {groups.map((g) => {
                const isActive = filter === g.key;
                return (
                  <button
                    key={g.key}
                    onClick={() => setFilter(isActive ? null : g.key)}
                    className="px-2.5 py-1.5 text-[11px] font-[inherit] rounded-md cursor-pointer min-h-[36px]"
                    style={{
                      border: isActive ? `1.5px solid ${g.accent}` : "1.5px solid var(--color-border)",
                      background: isActive ? g.accent + "18" : "var(--color-card)",
                      color: isActive ? g.accent : "var(--color-text-muted)",
                      fontWeight: isActive ? 700 : 400,
                    }}
                  >
                    {g.icon} {g.label}
                    <span className="ml-1 text-[9px] opacity-60">
                      {g.exercises.length}
                    </span>
                  </button>
                );
              })}
            </>
          )}
        </div>

        {/* Exercise groups */}
        {visibleGroups.map((group) => (
          <Section
            key={group.key}
            title={group.label}
            icon={group.icon}
            isOpen={!!openSections[`lib-${group.key}`]}
            onToggle={() => toggleSection(`lib-${group.key}`)}
            count={group.exercises.length}
            accent={group.accent}
            coloredBorder={uiV2}
          >
            {group.exercises.map((name) => renderCoreExercise(name))}
          </Section>
        ))}
      </div>
    );
  }

  function renderUpperTab() {
    return renderExerciseLibrary(
      UPPER_GROUPS,
      upperFilter,
      setUpperFilter,
      "#a78bfa",
      "Exercise Diagram Gallery",
      "35+ animated diagrams \u00B7 arm balance, TRX, equipment",
    );
  }

  function renderLowerTab() {
    return renderExerciseLibrary(
      LOWER_GROUPS,
      lowerFilter,
      setLowerFilter,
      "#10b981",
      "Exercise Diagram Gallery",
      "Glute bridges, clamshells, yoga \u00B7 animated diagrams",
    );
  }

  function renderCardioTab() {
    const cardioExercises = Object.keys(EX).filter(
      (k) => EX[k].category === "cardio",
    );
    const tier1 = cardioExercises.filter((k) => EX[k].tier === 1);

    return (
      <div>
        <Callout type="warning">
          VO2 max drops ~15% in just 2 weeks of inactivity. Aggressive
          upper-body cardio is essential.
        </Callout>

        <Section
          title="Tier 1 - Highest Output"
          icon={"\uD83D\uDD25"}
          isOpen={!!openSections["cardio-t1"]}
          onToggle={() => toggleSection("cardio-t1")}
        >
          {tier1.map((k) => (
            <ExerciseRow
              key={k}
              name={k}
              ex={EX[k]}
              phase={phase}
              isExpanded={!!expandedEx[k]}
              onToggle={() => toggleEx(k)}
              onSwap={(sw) => {
                if (sw.startsWith("__timer__"))
                  setTimer(parseInt(sw.replace("__timer__", "")));
              }}
              onDiagram={(d) => setDiagramOpen(d)}
              unavailable={!isAvailable(k)}
              equipment={equipment}
            />
          ))}
        </Section>

        <Section
          title="Weekly Cardio Schedule"
          icon={"\uD83D\uDCC6"}
          isOpen={!!openSections["cardio-sched"]}
          onToggle={() => toggleSection("cardio-sched")}
        >
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[11px]">
              <thead>
                <tr
                  style={{
                    borderBottom: "2px solid var(--color-accent)44",
                  }}
                >
                  {["Day", "AM", "PM", "~Cal"].map((h) => (
                    <th
                      key={h}
                      className="p-1.5 text-left text-accent text-[10px] font-bold"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CARDIO_SCHEDULE.map((row, i) => (
                  <tr
                    key={`cr-${i}`}
                    className="border-b border-border"
                  >
                    {row.map((cell, j) => (
                      <td
                        key={`cc-${j}`}
                        className="p-1.5"
                        style={{
                          color:
                            j === 0
                              ? "var(--color-text)"
                              : "var(--color-text-dim)",
                          fontWeight: j === 0 ? 600 : 400,
                        }}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-2.5 text-[11px] text-text-muted">
            Estimated weekly total: ~2,500 cal from cardio alone
          </div>
        </Section>

        <Section
          title="Cardio Protocols"
          icon={"\uD83D\uDCCB"}
          isOpen={!!openSections["cardio-proto"]}
          onToggle={() => toggleSection("cardio-proto")}
        >
          <div className="text-xs text-text-dim leading-[1.7]">
            <p className="font-bold text-accent mb-1">
              SkiErg 4-3-2-1 Descending Intervals (20 min)
            </p>
            <p>
              4 min moderate &rarr; 3 min hard &rarr; 2 min very hard &rarr;
              1 min ALL OUT &rarr; 2 min rest &rarr; repeat in reverse
              (1-2-3-4)
            </p>
            <p className="font-bold text-accent mt-3 mb-1">
              Battle Ropes Tabata (12 min)
            </p>
            <p>
              3 rounds of classic Tabata: 20s max effort alternating waves /
              10s rest &times; 8 = 4 min. 1 min rest between rounds.
            </p>
            <p className="font-bold text-accent mt-3 mb-1">
              Slider Row HIIT
            </p>
            <p>
              10-20 rounds of 200m sprints. 30s rest between. Right leg
              drives, left leg glides on furniture slider.
            </p>
          </div>
        </Section>
      </div>
    );
  }

  function renderCoreTab() {
    return (
      <div>
        <button
          data-testid="open-core-gallery"
          onClick={() => setDiagramOpen("gallery")}
          className="w-full mb-3 rounded-lg cursor-pointer font-[inherit] text-left min-h-[44px]"
          style={{
            padding: "10px 14px",
            background: "#f9731615",
            border: "1px solid #f9731633",
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">{"\uD83C\uDFA8"}</span>
            <div>
              <div className="text-[13px] font-semibold" style={{ color: "#f97316" }}>
                Core Diagram Gallery
              </div>
              <div className="text-[10px] text-text-dim">
                TRX, supine, prone, rack core &middot; animated diagrams
              </div>
            </div>
            <span className="ml-auto text-text-muted text-xs">&rarr;</span>
          </div>
        </button>

        {CORE_BLOCKS.map((block) => (
          <Section
            key={block.key}
            title={block.title}
            icon={block.icon}
            isOpen={!!openSections[block.key]}
            onToggle={() => toggleSection(block.key)}
            count={block.count}
            accent={block.accent}
          >
            {block.exercises.map((name) => renderCoreExercise(name))}
          </Section>
        ))}

        {/* Equipment-specific core: nearby picker */}
        <div
          className="rounded-lg mt-4 mb-3"
          style={{
            padding: "12px 14px",
            background: "var(--color-card)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-2.5">
            {"\uD83D\uDCCD"} What equipment is nearby?
          </div>
          <div className="text-[10px] text-text-dim mb-2.5">
            Select equipment to see matching core exercises
          </div>
          <div className="flex flex-wrap gap-2">
            {NEARBY_EQUIPMENT.filter((item) =>
              EQUIPMENT_CORE_BLOCKS.some((b) => b.nearbyId === item.id),
            ).map((item) => {
              const isSelected = coreNearby.includes(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() =>
                    setCoreNearby((prev) =>
                      prev.includes(item.id)
                        ? prev.filter((x) => x !== item.id)
                        : [...prev, item.id],
                    )
                  }
                  className="rounded-lg text-[11px] font-semibold cursor-pointer font-[inherit] min-h-[36px]"
                  style={{
                    padding: "6px 12px",
                    background: isSelected
                      ? "var(--color-accent)22"
                      : "var(--color-bg)",
                    border: `1.5px solid ${isSelected ? "var(--color-accent)" : "var(--color-border)"}`,
                    color: isSelected
                      ? "var(--color-accent)"
                      : "var(--color-text-muted)",
                  }}
                >
                  {item.icon} {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Equipment-specific core blocks */}
        {EQUIPMENT_CORE_BLOCKS.filter((block) =>
          coreNearby.includes(block.nearbyId),
        ).map((block) => (
          <Section
            key={block.key}
            title={block.title}
            icon={block.icon}
            isOpen={!!openSections[block.key]}
            onToggle={() => toggleSection(block.key)}
            count={block.exercises.length}
            accent={block.accent}
          >
            {block.exercises.map((name) => renderCoreExercise(name))}
          </Section>
        ))}

        <Callout type="danger">
          ZERO active left hip flexion. Protects femoral neck stress fracture.
          Left leg passive in ALL exercises.
        </Callout>
        <Callout type="info">
          Slow tempo protocol: 4-count movements, time-based sets, continuous
          tension. BASE &rarr; AMP 1 &rarr; AMP 2. Target muscle failure in
          the final 10-15 seconds of each set. If you finish the set
          comfortably, move up an amp level.
        </Callout>

        <Section
          title="Removed Exercises"
          icon={"\uD83D\uDEAB"}
          isOpen={!!openSections["danger-core"]}
          onToggle={() => toggleSection("danger-core")}
        >
          {REMOVED_CORE.map((r) => (
            <RemovedRow key={r.name} name={r.name} reason={r.reason} />
          ))}
        </Section>
      </div>
    );
  }

  function renderEquipTab() {
    return (
      <div>
        {/* UI v2 preview toggle */}
        <div
          className="flex items-center justify-between rounded-lg mb-4"
          style={{
            padding: "12px 14px",
            background: uiV2 ? "#22d3ee11" : "var(--color-card)",
            border: `1px solid ${uiV2 ? "#22d3ee44" : "var(--color-border)"}`,
          }}
        >
          <div>
            <div className="text-[13px] font-semibold text-text">New UI Preview</div>
            <div className="text-[11px] text-text-muted mt-0.5">
              {uiV2 ? "Active — gradient cards, color borders, pill badges" : "Off — using classic UI"}
            </div>
          </div>
          <button
            onClick={() => setUiV2((v) => !v)}
            className="relative cursor-pointer border-none font-[inherit]"
            style={{
              width: 44, height: 24, borderRadius: 12,
              background: uiV2 ? "#22d3ee" : "var(--color-border)",
              transition: "background 0.2s",
              padding: 0,
              position: "relative",
            }}
            title="Toggle new UI preview"
          >
            <span
              style={{
                position: "absolute",
                top: 3, left: uiV2 ? 23 : 3,
                width: 18, height: 18,
                borderRadius: "50%",
                background: "#fff",
                transition: "left 0.2s",
                display: "block",
              }}
            />
          </button>
        </div>

        {/* Week start day picker */}
        <Section
          title="Week Start Day"
          icon={"\uD83D\uDCC5"}
          isOpen={!!openSections["week-start"]}
          onToggle={() => toggleSection("week-start")}
        >
          <div className="text-[11px] text-text-dim mb-2.5">
            Shift the PPL rotation to start on a different day. Push A always
            begins on your chosen start day.
          </div>
          <div className="grid grid-cols-7 gap-1">
            {DAY_ABBR.map((d, i) => {
              const isCurrent = i === startDay;
              return (
                <button
                  key={`sd-${i}`}
                  onClick={() => setStartDay(i)}
                  className="rounded-lg text-[11px] cursor-pointer font-[inherit] min-h-[44px]"
                  style={{
                    padding: "10px 2px",
                    background: isCurrent
                      ? "var(--color-accent)22"
                      : "var(--color-bg)",
                    border: `1px solid ${isCurrent ? "var(--color-accent)" : "var(--color-border)"}`,
                    color: isCurrent
                      ? "var(--color-accent)"
                      : "var(--color-text-muted)",
                    fontWeight: isCurrent ? 700 : 500,
                  }}
                >
                  {d}
                </button>
              );
            })}
          </div>
          {startDay !== 0 && (
            <div className="mt-2.5 text-[11px] text-text-dim leading-relaxed">
              <div className="font-semibold text-accent mb-1">
                Current rotation:
              </div>
              {DAY_ABBR.map((d, i) => {
                const workout = getWorkoutForDay(i);
                return (
                  <span
                    key={`rot-${i}`}
                    className="inline-block mr-1.5 mb-0.5"
                  >
                    {d}={workout.t}
                    {i < 6 ? " \u2192" : ""}
                  </span>
                );
              })}
            </div>
          )}
        </Section>

        <Callout type="info">
          Toggle equipment ON/OFF. Exercises that need unavailable equipment
          will show alternatives.
        </Callout>

        {/* Equipment categories */}
        {Object.keys(EQUIP_CATEGORIES).map((cat) => {
          const items = Object.keys(EQUIPMENT).filter(
            (k) => EQUIPMENT[k].category === cat,
          );
          return (
            <Section
              key={cat}
              title={EQUIP_CATEGORIES[cat]}
              icon={"\uD83C\uDFCB\uFE0F"}
              isOpen={!!openSections[`eq-${cat}`]}
              onToggle={() => toggleSection(`eq-${cat}`)}
            >
              {items.map((eqKey) => {
                const eq = EQUIPMENT[eqKey];
                const isOn = equipment[eqKey] !== false;
                return (
                  <div
                    key={eqKey}
                    onClick={() =>
                      setEquipment((prev) => ({
                        ...prev,
                        [eqKey]: !isOn,
                      }))
                    }
                    className="flex items-center gap-2.5 rounded-lg mb-1 cursor-pointer"
                    style={{
                      padding: "10px 8px",
                      background: isOn
                        ? "var(--color-safe-bg)"
                        : "var(--color-bg)",
                      border: `1px solid ${isOn ? "var(--color-safe-border)" : "var(--color-border)"}`,
                    }}
                  >
                    {/* Toggle switch */}
                    <div
                      className="relative rounded-[10px] transition-colors duration-200"
                      style={{
                        width: 36,
                        height: 20,
                        background: isOn
                          ? "var(--color-safe)"
                          : "var(--color-text-muted)44",
                      }}
                    >
                      <div
                        className="absolute rounded-full bg-white transition-[left] duration-200"
                        style={{
                          width: 16,
                          height: 16,
                          top: 2,
                          left: isOn ? 18 : 2,
                        }}
                      />
                    </div>
                    <span className="text-[15px]">{eq.icon}</span>
                    <span
                      className="text-[13px] font-medium"
                      style={{
                        color: isOn
                          ? "var(--color-text)"
                          : "var(--color-text-muted)",
                      }}
                    >
                      {eq.name}
                    </span>
                  </div>
                );
              })}
            </Section>
          );
        })}

        {/* Gym Bag Essentials */}
        <Section
          title="Gym Bag Essentials"
          icon={"\uD83C\uDF92"}
          isOpen={!!openSections["gym-bag"]}
          onToggle={() => toggleSection("gym-bag")}
        >
          {GYM_BAG.map((item, i) => (
            <div
              key={`bag-${i}`}
              className="rounded-lg mb-1.5"
              style={{
                padding: 10,
                background: "var(--color-bg)",
                borderLeft: "3px solid var(--color-accent)",
              }}
            >
              <div className="font-bold text-xs text-accent">{item.n}</div>
              <div className="text-[11px] text-text-dim mt-0.5">
                {item.d}
              </div>
            </div>
          ))}
        </Section>
      </div>
    );
  }

  function renderSafetyTab() {
    return (
      <div>
        {/* Injury Status */}
        <Section
          title="Injury Status (MRI 3/11/2026)"
          icon={"\uD83E\uDE7B"}
          isOpen={!!openSections["injuries"]}
          onToggle={() => toggleSection("injuries")}
        >
          {INJURIES.map((inj, i) => (
            <div
              key={`inj-${i}`}
              className="rounded-lg mb-1.5"
              style={{
                padding: 12,
                background: "var(--color-card)",
                borderLeft: `3px solid ${inj.c}`,
              }}
            >
              <div
                className="font-bold text-[13px]"
                style={{ color: inj.c }}
              >
                {inj.n}
              </div>
              <div className="text-[11px] mt-1 text-text-dim leading-relaxed">
                {inj.r}
              </div>
            </div>
          ))}
        </Section>

        {/* Absolute Stop Signals */}
        <Section
          title="Absolute Stop Signals"
          icon={"\uD83D\uDEA8"}
          isOpen={!!openSections["stop-signals"]}
          onToggle={() => toggleSection("stop-signals")}
        >
          <Callout type="danger">
            Stop exercise and contact your MD immediately if:
          </Callout>
          {[
            "Groin pain (any side)",
            "Hip clicking or catching sensation",
            "Pain lasting >24 hours after workout",
            "Radiating leg pain or numbness",
            "Sharp pain during any exercise",
            "Swelling in hip or thigh area",
          ].map((s, i) => (
            <p
              key={`s-${i}`}
              className="text-xs text-text-dim py-0.5"
            >
              {"\uD83D\uDD34"} {s}
            </p>
          ))}
        </Section>

        {/* Pool Entry & Exit */}
        <Section
          title="Pool Entry & Exit"
          icon={"\uD83C\uDFCA"}
          isOpen={!!openSections["pool-entry"]}
          onToggle={() => toggleSection("pool-entry")}
        >
          <Callout type="danger">
            Left leg is a passenger at all times. Arms drive every transition.
            Right leg assists but never hops or impacts.
          </Callout>

          {POOL_METHODS.map((method, idx) => (
            <div
              key={`pool-${idx}`}
              className="rounded-[10px] mb-2.5"
              style={{
                padding: 14,
                background: "var(--color-bg)",
                border: "1px solid var(--color-border)",
              }}
            >
              <div className="flex items-center justify-between mb-2.5">
                <div className="font-bold text-sm text-accent">
                  {method.title}
                </div>
                <span
                  className="text-[10px] font-bold rounded-md"
                  style={{
                    padding: "2px 8px",
                    color: method.badgeColor,
                    background: method.badgeBg,
                    border: `1px solid ${method.badgeBorder}`,
                  }}
                >
                  {method.badge}
                </span>
              </div>
              <div className="mb-2">
                <div className="font-bold text-[11px] text-text uppercase tracking-wide mb-1">
                  Entry
                </div>
                <div className="text-xs text-text-dim leading-[1.7]">
                  {method.entry}
                </div>
              </div>
              <div className="mb-2">
                <div className="font-bold text-[11px] text-text uppercase tracking-wide mb-1">
                  Exit
                </div>
                <div className="text-xs text-text-dim leading-[1.7]">
                  {method.exit}
                </div>
              </div>
              {method.warning && (
                <div
                  className="text-[11px] rounded-md"
                  style={{
                    padding: "6px 10px",
                    color: "var(--color-warning)",
                    background: "var(--color-warning-bg)",
                    border: "1px solid var(--color-warning-border)",
                  }}
                >
                  {method.warning}
                </div>
              )}
            </div>
          ))}

          {/* Quick reference table */}
          <div className="font-bold text-[13px] text-text mt-1.5 mb-2">
            Quick Reference
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[11px]">
              <thead>
                <tr
                  style={{
                    borderBottom: "2px solid var(--color-accent)44",
                  }}
                >
                  {["Method", "Requires", "Difficulty"].map((h) => (
                    <th
                      key={h}
                      className="p-1.5 text-left text-accent text-[10px] font-bold"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {POOL_TABLE.map((row, i) => (
                  <tr
                    key={`pe-${i}`}
                    className="border-b border-border"
                  >
                    {row.map((cell, j) => (
                      <td
                        key={`pc-${j}`}
                        className="p-1.5"
                        style={{
                          color:
                            j === 0
                              ? "var(--color-text)"
                              : "var(--color-text-dim)",
                          fontWeight: j === 0 ? 600 : 400,
                        }}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* About */}
        <Section
          title="About"
          icon={"\u2139\uFE0F"}
          isOpen={!!openSections["about"]}
          onToggle={() => toggleSection("about")}
        >
          <div className="text-[13px] text-text-dim leading-[1.8]">
            This app was built by{" "}
            <a
              href="https://github.com/karlmarx"
              target="_blank"
              rel="noopener"
              className="text-accent no-underline"
            >
              me
            </a>
            , for me &mdash; to keep track of what I can actually do at the
            gym while recovering from a compression-side fracture of my left
            femur and a hip labrum tear.
            <br />
            <br />
            Instead of juggling fitness apps, Google searches, and YouTube
            videos to figure out which exercises are safe, I wanted one place
            that knows my injuries, shows me the right movements, and gets out
            of the way.
            <br />
            <br />
            <span className="text-text-muted text-[11px]">
              nfit.93.fyi
            </span>
          </div>
        </Section>

        {/* Nutrition */}
        <Section
          title="Nutrition During NWB"
          icon={"\uD83C\uDF57"}
          isOpen={!!openSections["nutrition"]}
          onToggle={() => toggleSection("nutrition")}
        >
          <div className="text-xs text-text-dim leading-[1.7]">
            <p className="font-bold text-warning mb-1.5">
              Do NOT cut calories. Healing demands energy.
            </p>
            <p>&bull; Calories: 2,800-3,200 kcal/day (25-30 kcal/kg)</p>
            <p>&bull; Protein: 130-205g/day (1.6-2.5 g/kg)</p>
            <p>
              &bull; Timing: 25-35g protein every 3-4 hours (including before
              bed)
            </p>
            <p>
              &bull; Leucine-rich sources (whey, dairy, meat) &mdash;
              immobilized muscles develop &lsquo;anabolic resistance&rsquo;
              requiring stronger protein signal
            </p>
          </div>
        </Section>

        {/* Progressive Overload */}
        <Section
          title="Progressive Overload Rules"
          icon={"\uD83D\uDCC8"}
          isOpen={!!openSections["overload"]}
          onToggle={() => toggleSection("overload")}
        >
          <div className="text-xs text-text-dim leading-[1.7]">
            {OVERLOAD_RULES.map((rule, i) => (
              <div key={`ol-${i}`} className="mb-2">
                <span className="font-bold text-accent">{rule.t}: </span>
                {rule.d}
              </div>
            ))}
          </div>
        </Section>
      </div>
    );
  }

  // ===== RENDER ACTIVE TAB =====
  let content: React.ReactNode = null;
  switch (tab) {
    case 0:
      content = renderTodayTab();
      break;
    case 1:
      content = renderUpperTab();
      break;
    case 2:
      content = renderLowerTab();
      break;
    case 3:
      content = renderCoreTab();
      break;
    case 4:
      content = renderCardioTab();
      break;
    case 5:
      content = renderSafetyTab();
      break;
    case GEAR_TAB_INDEX:
      content = renderEquipTab();
      break;
  }

  const todayColor = getWorkoutForDay(selectedDay).c;

  // ===== MAIN LAYOUT =====
  return (
    <div data-testid="app-container" className="app-container max-w-[600px] mx-auto px-4 pb-24 min-h-screen bg-bg">
      {/* Header */}
      <div className="pt-8 pb-5 text-center">
        <div className="flex items-center justify-center gap-2.5">
          <h1 data-testid="app-title" className="text-2xl font-extrabold tracking-tight text-text">
            Femur Fracture Fitness
          </h1>
          {/* Header icons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setAboutOpen(true)}
              data-testid="about-button"
              className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted cursor-pointer"
              style={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }}
              title="About"
            >
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </button>
            <button
              onClick={toggleTheme}
              data-testid="theme-toggle"
              className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted cursor-pointer"
              style={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? (
                <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
                  <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
                  <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
                  <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
                </svg>
              ) : (
                <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
            {AuthButton && (
              <React.Suspense
                fallback={
                  <div
                    className="w-8 h-8 rounded-full animate-pulse"
                    style={{ background: "var(--color-border)" }}
                  />
                }
              >
                <AuthButton />
              </React.Suspense>
            )}
          </div>
        </div>
        <div className="text-xs text-text-muted mt-1.5 tracking-wide">
          NWB-Adjusted PPL &bull; Left Femur Stress Fracture &bull; 6 Weeks
        </div>
      </div>

      {/* Progress clock */}
      <ProgressClock />

      {/* Phase selector */}
      <div className="flex gap-1.5 mb-4">
        {PHASES.map((p, i) => (
          <div
            key={i}
            onClick={() => setPhase(i)}
            className="flex-1 rounded-xl text-center cursor-pointer transition-all duration-200"
            style={{
              padding: "10px 4px",
              background: phase === i ? p.color + "18" : "var(--color-card)",
              border: `2px solid ${phase === i ? p.color : "var(--color-border)"}`,
              boxShadow: phase === i ? `0 0 12px ${p.color}15` : "none",
            }}
          >
            <div
              className="text-[11px] font-extrabold"
              style={{ color: p.color }}
            >
              WK {p.weeks}
            </div>
            <div
              className="text-[10px] mt-0.5 font-medium"
              style={{
                color:
                  phase === i
                    ? "var(--color-text)"
                    : "var(--color-text-muted)",
              }}
            >
              {p.name}
            </div>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div data-testid="tab-bar" className="flex gap-1 mb-5 items-stretch">
        {TABS.map((t, i) => {
          const isTodayTab = i === 0;
          const activeColor = isTodayTab ? todayColor : "var(--color-accent)";
          const isActive = tab === i;
          return (
            <button
              key={t}
              data-testid={`tab-${t.toLowerCase()}`}
              title={TAB_TIPS[i]}
              onClick={() => setTab(i)}
              className={`flex-1 min-w-0 rounded-xl text-xs font-semibold cursor-pointer font-[inherit] transition-all duration-150 ${isActive ? "tab-active" : ""}`}
              style={{
                padding: "12px 4px",
                background: isActive ? activeColor + "15" : "none",
                border: `1px solid ${isActive ? activeColor + "55" : "var(--color-border)"}`,
                color: isActive ? activeColor : "var(--color-text-muted)",
              }}
            >
              {t}
            </button>
          );
        })}
        {/* Divider */}
        <div className="w-px mx-0.5 self-stretch rounded-full" style={{ background: "var(--color-border)" }} />
        {/* Gear / config */}
        <button
          data-testid="tab-gear"
          title="Equipment & configuration"
          onClick={() => setTab(GEAR_TAB_INDEX)}
          className={`rounded-xl cursor-pointer font-[inherit] flex items-center justify-center transition-all duration-150 ${tab === GEAR_TAB_INDEX ? "tab-active" : ""}`}
          style={{
            width: 44,
            minWidth: 44,
            padding: "12px 0",
            background: tab === GEAR_TAB_INDEX ? "var(--color-accent)15" : "none",
            border: `1px solid ${tab === GEAR_TAB_INDEX ? "var(--color-accent)55" : "var(--color-border)"}`,
            color: tab === GEAR_TAB_INDEX ? "var(--color-accent)" : "var(--color-text-muted)",
          }}
        >
          <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </div>

      {/* Tab content */}
      <div data-testid="tab-content">{content}</div>

      {/* Footer links */}
      <div className="mt-6 mb-2 flex justify-center gap-4 items-center">
        <a
          href="https://github.com/karlmarx/nwb-plan"
          target="_blank"
          rel="noopener noreferrer"
          className="text-text-muted"
          title="GitHub"
        >
          <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
        </a>
        <a
          href="https://hevy.com/user/karl__marx"
          target="_blank"
          rel="noopener noreferrer"
          className="text-text-muted"
          title="Hevy"
        >
          <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor">
            <path d="M2 8h4v8H2zM18 8h4v8h-4zM6 11h12v2H6z" />
          </svg>
        </a>
        <a
          href="https://nyoga.93.fyi"
          target="_blank"
          rel="noopener noreferrer"
          className="text-text-muted"
          title="NWB Yoga Companion App"
        >
          <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,20 C11,14 10,8 12,3 C14,8 13,14 12,20Z M12,20 C9,15 7,10 9,5 C12,9 12,14 12,20Z M12,20 C15,15 17,10 15,5 C12,9 12,14 12,20Z M12,20 C8,16 5,12 6,7 C9,11 11,15 12,20Z M12,20 C16,16 19,12 18,7 C15,11 13,15 12,20Z"/>
          </svg>
        </a>
      </div>

      {/* Rest timer overlay */}
      {timer != null && (
        <RestTimer seconds={timer} onClose={() => setTimer(null)} />
      )}

      {/* About modal */}
      {aboutOpen && (
        <div
          data-testid="about-modal"
          className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center p-0 sm:p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
          onClick={() => setAboutOpen(false)}
        >
          <div
            className="rounded-t-2xl sm:rounded-2xl w-full max-w-md overflow-y-auto max-h-[85vh]"
            style={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag handle for mobile */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 rounded-full" style={{ background: "var(--color-border)" }} />
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-extrabold text-text">About</h2>
                <button
                  onClick={() => setAboutOpen(false)}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-text-muted cursor-pointer text-lg transition-colors duration-150"
                  style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)" }}
                >
                  &times;
                </button>
              </div>
              <div className="text-sm leading-relaxed text-text-dim space-y-4">
                <p>
                  <strong className="text-text">Femur Fracture Fitness</strong> is
                  a personal PWA for tracking a non-weight-bearing Push/Pull/Legs
                  training protocol during recovery from a left femoral neck stress
                  fracture.
                </p>
                <p>
                  Built with Next.js, TypeScript, and Tailwind CSS. All exercise
                  data, safety constraints, and progression phases are baked into
                  the app for offline use.
                </p>
                <div className="flex gap-3 pt-2">
                  <a
                    href="https://github.com/karlmarx/nwb-plan"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent text-xs font-medium"
                  >
                    Source on GitHub &rarr;
                  </a>
                  <a
                    href="https://nyoga.93.fyi"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent text-xs font-medium"
                  >
                    NWB Yoga &rarr;
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Diagram gallery overlay */}
      {diagramOpen === "gallery" && (
        <div
          data-testid="diagram-gallery-overlay"
          className="fixed inset-0 z-[200] overflow-y-auto overflow-x-hidden"
          style={{ background: "var(--color-bg)" }}
        >
          <DiagramGallery onClose={() => setDiagramOpen(null)} />
        </div>
      )}

      {/* Diagram modal (individual exercises) */}
      {diagramOpen && diagramOpen !== "gallery" && (
        <DiagramModal
          diagram={diagramOpen}
          onClose={() => setDiagramOpen(null)}
        />
      )}
    </div>
  );
}
