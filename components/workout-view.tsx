"use client";

import React, { useState, useEffect, useLayoutEffect, useCallback, useRef, useMemo } from "react";
import dynamic from "next/dynamic";
import { loadState, saveState } from "@/lib/storage";
import {
  EX,
  EQUIPMENT,
  WORKOUTS,
  CORE_FINISHERS,
  NEARBY_EQUIPMENT,
  SCHED,
  PHASES,
  isExerciseAvailable,
} from "@/lib/exercises";
import {
  SUPPLEMENT_CORE,
  SUPPLEMENT_EX,
  CABLE_SUPERSET,
  NEARBY_SUPERSETS,
  MOBILITY_SUPPLEMENTS,
} from "@/lib/supplements";
import type { Exercise } from "@/lib/exercises";
import { computeCurrentPhase, isContentProgramComplete } from "@/lib/program";
import Section from "@/components/section";
import ExerciseRow from "@/components/exercise-row";
import Callout from "@/components/callout";
import RestTimer from "@/components/rest-timer";
import ProgressClock from "@/components/progress-clock";
import Badge from "@/components/badge";
import DiagramModal from "@/components/diagram-modal";
import DiagramGallery from "@/components/diagrams/gallery";
import { EXERCISE_TO_DIAGRAM, EXERCISES as DIAGRAM_EXERCISES } from "@/components/diagrams";
import EditExerciseSheet from "@/components/edit-exercise-sheet";
import AddExercisePicker from "@/components/add-exercise-picker";
import SessionBar from "@/components/session-bar";
import HistoryView from "@/components/history-view";
import { useWorkoutLog } from "@/lib/use-workout-log";
import ComplementPicker, {
  decodeComplement,
  encodeNearbyId,
  encodeSuppId,
  type ComplementId,
} from "@/components/complement-picker";
import { PT_EXERCISES } from "@/lib/pt-exercises";
import { useLongPress } from "@/lib/use-long-press";
import { cssAlpha } from "@/lib/css-utils";
import HevyImportPanel from "@/components/hevy-import-panel";
import RehabTab from "@/components/rehab-tab";
import HEPBlock from "@/components/hep-block";

// Set tracker: same client-only pattern used in ExerciseRow. Disabling SSR
// avoids a Turbopack chunk-init order issue when the tracker is bundled into
// the SSR'd workout-view tree.
const SetTracker = dynamic(() => import("@/components/set-tracker"), {
  ssr: false,
});

// Conditionally import AuthButton when either auth or AI feature flag is on.
// FEATURE_AUTH gates login + cloud sync independently of AI suggestions; the
// older FEATURE_AI_SUGGESTIONS flag is kept for backward compat (AI requires
// auth, so turning AI on must also surface the button).
const AUTH_ENABLED =
  process.env.NEXT_PUBLIC_FEATURE_AUTH === "true" ||
  process.env.NEXT_PUBLIC_FEATURE_AI_SUGGESTIONS === "true";
const AuthButton =
  AUTH_ENABLED
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

// Visual tab order. "Rehab" is rendered between "Workout" and "Upper" but
// uses a non-sequential canonical state index (REHAB_TAB_INDEX below) so
// existing localStorage values and tests for Upper/Lower/Core/Cardio/Safety
// (indices 1-5) remain stable.
const TABS = ["Workout", "Rehab", "Upper", "Lower", "Core", "Cardio"];

const TAB_TIPS = [
  "Today's scheduled workout",
  "PT exercises by rehab phase",
  "Push + Pull exercise library",
  "Legs + Recovery exercise library",
  "Core exercises by body part",
  "NWB cardio options",
];

// Lucide-style stroke icons for each main tab. Rendered as 18px SVGs so the
// tab bar never overflows on narrow phones.
const TAB_ICONS: Record<string, React.ReactNode> = {
  Workout: (
    // Barbell — today's workout
    <>
      <rect x="2" y="9" width="3" height="6" rx="1" />
      <rect x="19" y="9" width="3" height="6" rx="1" />
      <rect x="5" y="11" width="14" height="2" rx="1" />
    </>
  ),
  Rehab: (
    // Heart-pulse line — PT/rehab block
    <path d="M4 12h4l2-5 4 10 2-5h4" />
  ),
  Upper: (
    // Up arrow — upper body library
    <>
      <path d="M12 19V5" />
      <path d="M5 12l7-7 7 7" />
    </>
  ),
  Lower: (
    // Down arrow — lower body library
    <>
      <path d="M12 5v14" />
      <path d="M5 12l7 7 7-7" />
    </>
  ),
  Core: (
    // Abs outline — torso with 6-pack grid
    <>
      <rect x="7" y="4" width="10" height="16" rx="3" />
      <path d="M7 9h10M7 14h10M12 4v16" />
    </>
  ),
  Cardio: (
    // Heart-rate pulse line
    <polyline points="3 12 7 12 10 6 14 18 17 12 21 12" />
  ),
};

// Safety + History + Gear/config live outside the label tab strip as icon buttons
const SAFETY_TAB_INDEX = 5;
const GEAR_TAB_INDEX = 6;
const HISTORY_TAB_INDEX = 7;
// Rehab tab uses a non-sequential canonical state index so existing
// localStorage `nwb_tab` values for Today/Upper/Lower/Core/Cardio/Safety/
// Gear/History (0-7) remain stable. Visual order in TABS still places
// "Rehab" between "Workout" and "Upper".
const REHAB_TAB_INDEX = 9;
// Maps the visible tab label (TABS array) to the canonical tab state index.
const TAB_INDEX_BY_NAME: Record<string, number> = {
  Workout: 0,
  Rehab: REHAB_TAB_INDEX,
  Upper: 1,
  Lower: 2,
  Core: 3,
  Cardio: 4,
};

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

// ===== MAIN COMPONENT =====

export default function WorkoutView() {
  // ----- State -----
  const [tab, setTab] = useState(() => loadState<number>("nwb_tab", 0));
  // Phase is derived from the program start date — opens on the week that
  // matches the calendar. Once the 8-week content program is complete (FWB
  // era), it opens deselected (`null`) since the week-1–8 phases no longer
  // apply. Tapping a pill overrides within the session but doesn't persist;
  // next mount re-syncs.
  const [phase, setPhase] = useState<number | null>(() =>
    isContentProgramComplete() ? null : computeCurrentPhase(),
  );
  // Effective phase for exercise gating + set-scheme indexing: when no tab is
  // selected (FWB era) everything is unlocked, so fall back to the last phase.
  const effPhase = phase ?? PHASES.length - 1;
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    () => {
      const sd = loadState<number>("nwb_startDay", 0);
      const rd = loadState<number | null>("nwb_restDay", null);
      const rt = getRealToday();
      const defaultRest = (sd + 6) % 7;
      const effectiveRest = rd ?? defaultRest;
      if (rt === effectiveRest) return { [SCHED[6].t]: true };
      let ti = 0;
      for (let d = sd; ; d = (d + 1) % 7) {
        if (d === effectiveRest) continue;
        if (d === rt) break;
        ti++;
      }
      return { [SCHED[ti].t]: true };
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
  const [restDay, setRestDay] = useState<number | null>(() =>
    loadState<number | null>("nwb_restDay", null),
  );
  const [selectedDay, setSelectedDay] = useState(getRealToday);
  const [machineSelections, setMachineSelections] = useState<
    Record<string, string>
  >(() => loadState("nwb_machines", {}));
  const [nearbySelections] = useState<
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
  const [fontSize, setFontSize] = useState(() => loadState<number>("nwb_font_size", 16));

  // Edit sheet (swap / machine / move / remove) — opened via long-press or ⋮ button
  const [editSheetFor, setEditSheetFor] = useState<
    { workoutKey: string; origName: string; exName: string } | null
  >(null);

  // Complement picker (add equipment-aware supersets / mobility / stretches)
  const [complementPickerFor, setComplementPickerFor] = useState<
    {
      exName: string;
      exerciseRequires: string[];
      exerciseCategory: string;
      workoutKey?: string;
    } | null
  >(null);

  // ----- Consolidated day state (date-scoped, clears daily) -----
  type DayState = {
    complements: Record<string, ComplementId[]>;
    removed: Record<string, string[]>;
    completedSupersets: string[];
  };
  const dayKey = `nwb_day_${new Date().toISOString().slice(0, 10)}`;
  const [dayState, setDayState] = useState<DayState>(() => {
    const stored = loadState<DayState | null>(dayKey, null);
    if (stored) return stored;
    // Migrate from legacy per-field keys
    const dateStr = new Date().toISOString().slice(0, 10);
    return {
      complements: loadState<Record<string, ComplementId[]>>(`nwb_complements_${dateStr}`, {}),
      removed: loadState<Record<string, string[]>>(`nwb_removed_${dateStr}`, {}),
      completedSupersets: loadState<string[]>(`nwb_done_ss_${dateStr}`, []),
    };
  });

  // Per-workout exercise reorder (persistent)
  const [exerciseOrder, setExerciseOrder] = useState<Record<string, string[]>>(
    () => loadState<Record<string, string[]>>("nwb_order", {}),
  );

  // Per-workout extra exercises added from the catalog (persistent)
  const [addedExercises, setAddedExercises] = useState<Record<string, string[]>>(
    () => loadState<Record<string, string[]>>("nwb_added", {}),
  );

  // Add-exercise picker — workoutKey the user is adding into
  const [addPickerFor, setAddPickerFor] = useState<string | null>(null);

  // Focus mode: fullscreen exercise walkthrough
  type FocusSupplement = {
    type: "leftleg" | "core" | "cable" | "variant" | "nearby";
    name: string;
    sets: string;
    instruction: string;
    safety: string;
    region?: string;
    rest?: number;
  };
  type FocusItem = { name: string; ex: Exercise; supplements?: FocusSupplement[] };
  const [focusState, setFocusState] = useState<{ items: FocusItem[]; index: number } | null>(null);

  // Keyboard navigation for focus mode
  useEffect(() => {
    if (!focusState) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFocusState(null);
      if (e.key === "ArrowRight" || e.key === "ArrowDown")
        setFocusState((prev) => prev && prev.index < prev.items.length - 1
          ? { ...prev, index: prev.index + 1 } : prev);
      if (e.key === "ArrowLeft" || e.key === "ArrowUp")
        setFocusState((prev) => prev && prev.index > 0
          ? { ...prev, index: prev.index - 1 } : prev);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [focusState]);

  // ----- Sliding tab pill -----
  const tabBarRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [pillPos, setPillPos] = useState({ left: 0, width: 0 });
  const pillInitialized = useRef(false);

  useLayoutEffect(() => {
    const activeIdx = tab; // 0..4 word tabs, 5 safety icon, 6 gear, 7 history, 9 rehab
    const btn = tabRefs.current[activeIdx];
    const bar = tabBarRef.current;
    if (!btn || !bar) return;
    const barRect = bar.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    setPillPos({ left: btnRect.left - barRect.left, width: btnRect.width });
    // Enable transitions after first measurement
    if (!pillInitialized.current) {
      requestAnimationFrame(() => { pillInitialized.current = true; });
    }
  }, [tab]);

  // ----- Persistence -----
  useEffect(() => {
    saveState("nwb_tab", tab);
  }, [tab]);
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
    if (restDay === null) {
      localStorage.removeItem("nwb_restDay");
    } else {
      saveState("nwb_restDay", restDay);
    }
  }, [restDay]);
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
    saveState(dayKey, dayState);
  }, [dayState, dayKey]);
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
    saveState("nwb_font_size", fontSize);
  }, [fontSize]);
  useEffect(() => {
    saveState("nwb_order", exerciseOrder);
  }, [exerciseOrder]);
  useEffect(() => {
    saveState("nwb_added", addedExercises);
  }, [addedExercises]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }, []);

  // ----- Helpers -----
  const realToday = getRealToday();

  const getWorkoutForDay = useCallback(
    (dayIdx: number) => {
      const defaultRestDay = (startDay + 6) % 7;
      const effectiveRestDay = restDay ?? defaultRestDay;

      // If this day is the rest day, return Recovery
      if (dayIdx === effectiveRestDay) return SCHED[6];

      // Count training slots from startDay up to dayIdx, skipping rest day
      let trainingIdx = 0;
      for (let d = startDay; ; d = (d + 1) % 7) {
        if (d === effectiveRestDay) continue;
        if (d === dayIdx) break;
        trainingIdx++;
      }
      return SCHED[trainingIdx];
    },
    [startDay, restDay],
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
      return isExerciseAvailable(ex, equipment);
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

  // ----- New helpers for unified UI -----

  /** Return the effective order of original exercise names for a workout. */
  const getOrderedExercises = useCallback(
    (workoutKey: string): string[] => {
      const w = WORKOUTS[workoutKey];
      if (!w) return [];
      // Base list = shipped defaults + user-added extras (in the order they were added)
      const added = addedExercises[workoutKey] ?? [];
      const base = [...w.exercises, ...added];
      const saved = exerciseOrder[workoutKey];
      if (!saved) return base;
      // Merge saved order with base: saved first (if still in base), then any new exercises
      const savedSet = new Set(saved);
      const merged: string[] = [];
      for (const n of saved) if (base.includes(n)) merged.push(n);
      for (const n of base) if (!savedSet.has(n)) merged.push(n);
      return merged;
    },
    [exerciseOrder, addedExercises],
  );

  /**
   * Add an arbitrary exercise (by name in the EX catalog) to a workout. Persists
   * in nwb_added so it survives across sessions. No-op if it's already in the
   * workout (default or previously added).
   */
  const addExerciseToWorkout = useCallback(
    (workoutKey: string, name: string) => {
      if (!EX[name]) return;
      const w = WORKOUTS[workoutKey];
      if (!w) return;
      const currentBase = [
        ...w.exercises,
        ...(addedExercises[workoutKey] ?? []),
      ];
      if (currentBase.includes(name)) return;
      setAddedExercises((prev) => ({
        ...prev,
        [workoutKey]: [...(prev[workoutKey] ?? []), name],
      }));
    },
    [addedExercises],
  );

  const moveExercise = useCallback(
    (workoutKey: string, origName: string, direction: -1 | 1) => {
      const current = getOrderedExercises(workoutKey);
      const idx = current.indexOf(origName);
      if (idx === -1) return;
      const target = idx + direction;
      if (target < 0 || target >= current.length) return;
      const next = [...current];
      [next[idx], next[target]] = [next[target], next[idx]];
      setExerciseOrder((prev) => ({ ...prev, [workoutKey]: next }));
    },
    [getOrderedExercises],
  );

  const removeExerciseToday = useCallback(
    (workoutKey: string, origName: string) => {
      setDayState((prev) => {
        const cur = prev.removed[workoutKey] ?? [];
        if (cur.includes(origName)) return prev;
        return { ...prev, removed: { ...prev.removed, [workoutKey]: [...cur, origName] } };
      });
    },
    [],
  );

  const toggleComplement = useCallback(
    (exName: string, id: ComplementId) => {
      setDayState((prev) => {
        const cur = prev.complements[exName] ?? [];
        const next = cur.includes(id)
          ? cur.filter((x) => x !== id)
          : [...cur, id];
        return { ...prev, complements: { ...prev.complements, [exName]: next } };
      });
    },
    [],
  );

  /**
   * Build superset cards for an exercise — combines auto supersets (cable,
   * variant-specific) with user-opted-in complements from dayState.complements.
   */
  const buildSupersetCards = useCallback(
    (
      exName: string,
      ex: Exercise,
      workoutKey: string,
      firstCableName: string | null,
    ): React.ReactElement[] => {
      type Card = {
        key: string;
        kind: "cable" | "variant" | "nearby" | "leftleg" | "core" | "mobility";
        label: string;
        color: string;
        title: string;
        sets: string;
        instruction: string;
        safety?: string;
        note?: string;
        removable?: boolean;
        complementId?: ComplementId;
      };
      const cards: Card[] = [];

      const selMachineId = machineSelections[exName];
      const selectedVariant =
        ex.machineVariants?.find((v) => v.id === selMachineId) ?? null;

      // 1. Auto cable superset (first cable exercise)
      const isFirstCable = ex.cableSuperset && exName === firstCableName;
      if (isFirstCable && supplementToggles.leftLeg) {
        cards.push({
          key: "auto-cable",
          kind: "cable",
          label: "AUTO",
          color: "#14b8a6",
          title: CABLE_SUPERSET.title,
          sets: CABLE_SUPERSET.sets,
          instruction: CABLE_SUPERSET.instruction,
          safety: CABLE_SUPERSET.safety,
        });
      }

      // 2. Auto variant superset (only if no cable one already)
      if (
        !isFirstCable &&
        supplementToggles.leftLeg &&
        selectedVariant?.superset
      ) {
        const vs = selectedVariant.superset;
        cards.push({
          key: "auto-variant",
          kind: "variant",
          label: "AUTO",
          color: "#14b8a6",
          title: vs.title,
          sets: vs.sets,
          instruction: vs.instruction,
          safety: vs.safety,
          note: vs.note,
        });
      }

      // 3. User-opted-in complements
      const userComps = dayState.complements[exName] ?? [];
      for (const id of userComps) {
        const decoded = decodeComplement(id);
        if (decoded.kind === "nearby") {
          const ns = NEARBY_SUPERSETS.find(
            (n) => n.nearbyId === decoded.value && n.title === decoded.sub,
          );
          if (!ns) continue;
          cards.push({
            key: id,
            kind: "nearby",
            label: "NEARBY",
            color: "#14b8a6",
            title: ns.title,
            sets: ns.sets,
            instruction: ns.instruction,
            safety: ns.safety,
            removable: true,
            complementId: id,
          });
        } else if (decoded.kind === "supp") {
          const data = SUPPLEMENT_EX[decoded.value];
          if (!data) continue;
          const s = data.sets[0];
          cards.push({
            key: id,
            kind: "leftleg",
            label: "L-LEG",
            color: "#14b8a6",
            title: decoded.value,
            sets: `${s[0]}\u00D7${s[1]}`,
            instruction: data.execution,
            safety: data.nwbCues,
            removable: true,
            complementId: id,
          });
        } else if (decoded.kind === "core") {
          const data = SUPPLEMENT_EX[decoded.value];
          if (!data) continue;
          const s = data.sets[0];
          const region = SUPPLEMENT_CORE[workoutKey]?.exercises.find(
            (ce) => ce.name === decoded.value,
          )?.region;
          cards.push({
            key: id,
            kind: "core",
            label: region ? region.toUpperCase() : "CORE",
            color: "#f97316",
            title: decoded.value,
            sets: `${s[0]}\u00D7${s[1]}`,
            instruction: data.execution,
            safety: data.nwbCues,
            removable: true,
            complementId: id,
          });
        } else if (decoded.kind === "mobility") {
          const m = MOBILITY_SUPPLEMENTS.find((mm) => mm.id === decoded.value);
          if (!m) continue;
          const color =
            m.kind === "breathing"
              ? "#8b5cf6"
              : m.kind === "stretch"
                ? "#f59e0b"
                : "#0ea5e9";
          const label =
            m.kind === "breathing"
              ? "BREATH"
              : m.kind === "stretch"
                ? "STRETCH"
                : "MOBILITY";
          cards.push({
            key: id,
            kind: "mobility",
            label,
            color,
            title: m.name,
            sets: m.sets,
            instruction: m.instruction,
            safety: m.safety,
            removable: true,
            complementId: id,
          });
        } else if (decoded.kind === "pt") {
          const pt = PT_EXERCISES[decoded.value];
          if (!pt) continue;
          cards.push({
            key: id,
            kind: "leftleg",
            label: "PT",
            color: "#34d399",
            title: pt.name,
            sets: pt.sets,
            instruction: pt.execution,
            safety: pt.ptCues,
            removable: true,
            complementId: id,
          });
        } else if (decoded.kind === "lib") {
          const data = EX[decoded.value];
          if (!data) continue;
          const s = data.sets[0];
          cards.push({
            key: id,
            kind: "leftleg",
            label: "CATALOG",
            color: "#3b82f6",
            title: decoded.value,
            sets: s ? `${s[0]}×${s[1]}` : "",
            instruction: data.execution ?? "",
            removable: true,
            complementId: id,
          });
        } else if (decoded.kind === "text") {
          cards.push({
            key: id,
            kind: "leftleg",
            label: "CUSTOM",
            color: "#71717a",
            title: decoded.value,
            sets: "",
            instruction: "",
            removable: true,
            complementId: id,
          });
        }
      }

      if (cards.length === 0) return [];

      return cards.map((c) => (
        <div
          key={`${exName}-${c.key}`}
          data-testid="superset-card"
          className="mb-2 ml-3 rounded-xl overflow-hidden"
          style={{
            background: c.color + "10",
            borderLeft: `3px solid ${c.color}`,
            border: `1px solid ${c.color}33`,
            borderLeftWidth: 3,
          }}
        >
          <div className="px-3.5 py-2.5">
            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
              <span
                className="text-[10px] text-text-muted"
                title={`Paired with ${exName}`}
              >
                {"\u21B3"}
              </span>
              <span
                className="text-[9px] font-extrabold rounded px-1.5 py-0.5"
                style={{
                  background: c.color + "22",
                  border: `1px solid ${c.color}44`,
                  color: c.color,
                }}
              >
                {c.label}
              </span>
              <span
                className="text-[12px] font-semibold flex-1 min-w-0"
                style={{ color: c.color }}
              >
                {c.title}
              </span>
              <span className="text-[10px] text-text-dim tabular-nums flex-shrink-0">
                {c.sets}
              </span>
              {c.removable && c.complementId && (
                <button
                  onClick={(ev) => {
                    ev.stopPropagation();
                    toggleComplement(exName, c.complementId!);
                  }}
                  aria-label="Remove complement"
                  className="text-[11px] rounded-md cursor-pointer font-[inherit] w-6 h-6 flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "var(--color-bg)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-text-muted)",
                  }}
                >
                  ×
                </button>
              )}
            </div>
            <div className="text-[11px] text-text-dim leading-snug pl-4">
              {c.instruction}
            </div>
            {c.safety && (
              <div
                className="text-[10px] mt-1 pl-4"
                style={{ color: c.color }}
              >
                {"\u{1F6E1}\uFE0F"} {c.safety}
              </div>
            )}
            {c.note && (
              <div className="text-[10px] mt-1 pl-4 text-warning">
                {"\u26A0\uFE0F"} {c.note}
              </div>
            )}
          </div>
        </div>
      ));
    },
    [
      dayState.complements,
      machineSelections,
      supplementToggles.leftLeg,
      toggleComplement,
    ],
  );

  /** Render the "+ Add complement" pill. */
  const buildAddComplementPill = useCallback(
    (exName: string, ex: Exercise, workoutKey?: string): React.ReactNode => {
      return (
        <button
          data-testid="add-complement"
          onClick={(ev) => {
            ev.stopPropagation();
            setComplementPickerFor({
              exName,
              exerciseRequires: ex.requires,
              exerciseCategory: ex.category,
              workoutKey,
            });
          }}
          className="w-full mb-3 rounded-xl text-[12px] font-semibold cursor-pointer font-[inherit] min-h-[40px] transition-colors duration-150 flex items-center justify-center gap-1.5"
          style={{
            background: "var(--color-bg)",
            border: "1px dashed var(--color-border)",
            color: "var(--color-text-muted)",
          }}
        >
          <span className="text-base leading-none">+</span>
          Add complement
        </button>
      );
    },
    [],
  );

  // ----- Core exercise renderer (used in Core and workout tabs) -----
  function renderCoreExercise(name: string) {
    const ex = EX[name];
    if (!ex) return null;
    const unavail = !isExerciseAvailable(ex, equipment);
    const selMachineId = machineSelections[name];
    const selectedVariant =
      ex.machineVariants?.find((v) => v.id === selMachineId) ?? null;
    return (
      <div key={name}>
        <ExerciseRow
          name={name}
          ex={ex}
          phase={effPhase}
          isExpanded={!!expandedEx[name]}
          onToggle={() => toggleEx(name)}
          onLongPress={() =>
            setEditSheetFor({
              workoutKey: "__core__",
              origName: name,
              exName: name,
            })
          }
          onStartTimer={(sec) => setTimer(sec)}
          onDiagram={(d) => setDiagramOpen(d)}
          onOpenDiagram={(id) => setDiagramOpen(id)}
          unavailable={unavail}
          equipment={equipment}
          variantSetupCues={selectedVariant?.setupCues}
          variantLabel={selectedVariant?.label}
          variantRequires={selectedVariant?.requires}
          variantId={selectedVariant?.id}
          log={log}
          addComplementSlot={buildAddComplementPill(name, ex)}
        />
        {buildSupersetCards(name, ex, "__core__", null)}
      </div>
    );
  }

  // ----- Render workout section -----
  function renderWorkout(workoutKey: string) {
    const w = WORKOUTS[workoutKey];
    if (!w) return null;
    const hevyId = parseHevyId(hevyIds[workoutKey] || w.hevy);
    const isTrainingDay = SUPPLEMENT_CORE[workoutKey] != null;

    // Effective exercise order with removals applied
    const orderedOrigs = getOrderedExercises(workoutKey).filter(
      (o) => !(dayState.removed[workoutKey] ?? []).includes(o),
    );

    // Find first cable exercise for cable superset
    const firstCableEx = orderedOrigs.find((orig) => {
      const en = getExName(workoutKey, orig);
      return EX[en]?.cableSuperset;
    });
    const firstCableName = firstCableEx
      ? getExName(workoutKey, firstCableEx)
      : null;

    const coreSubtitle = isTrainingDay
      ? SUPPLEMENT_CORE[workoutKey].subtitle
      : "";

    return (
      <Section
        title={w.title}
        icon={w.icon}
        accent={w.color}
        isOpen={!!openSections[workoutKey]}
        onToggle={() => toggleSection(workoutKey)}
        count={w.exercises.length}
        onFocus={() => {
          const activeExercises = orderedOrigs
            .map((orig) => {
              const nm = getExName(workoutKey, orig);
              const exItem = EX[nm];
              return { orig, name: nm, ex: exItem };
            })
            .filter(({ ex: exItem }) => exItem && (exItem.phase == null || effPhase >= exItem.phase));

          // Build focus items with supplements attached (auto + user-opted-in only)
          const items: FocusItem[] = activeExercises.map(({ name: nm, ex: exItem }) => {
            const supps: FocusSupplement[] = [];

            // Auto: cable superset (first cable exercise only)
            if (supplementToggles.leftLeg && exItem.cableSuperset && nm === firstCableName) {
              supps.push({
                type: "cable",
                name: CABLE_SUPERSET.title,
                sets: CABLE_SUPERSET.sets,
                instruction: CABLE_SUPERSET.instruction,
                safety: CABLE_SUPERSET.safety,
              });
            }

            // Auto: machine variant superset
            const selMachineId = machineSelections[nm];
            const selectedVariant = exItem.machineVariants?.find((v) => v.id === selMachineId) ?? null;
            if (supplementToggles.leftLeg && selectedVariant?.superset && !(exItem.cableSuperset && nm === firstCableName)) {
              const vs = selectedVariant.superset;
              supps.push({
                type: "variant",
                name: vs.title,
                sets: vs.sets,
                instruction: vs.instruction,
                safety: vs.safety,
              });
            }

            // User-opted-in complements
            const userComps = dayState.complements[nm] ?? [];
            for (const id of userComps) {
              const decoded = decodeComplement(id);
              if (decoded.kind === "nearby") {
                const ns = NEARBY_SUPERSETS.find(
                  (n) => n.nearbyId === decoded.value && n.title === decoded.sub,
                );
                if (!ns) continue;
                supps.push({
                  type: "nearby",
                  name: ns.title,
                  sets: ns.sets,
                  instruction: ns.instruction,
                  safety: ns.safety,
                });
              } else if (decoded.kind === "supp") {
                const data = SUPPLEMENT_EX[decoded.value];
                if (!data) continue;
                const s = data.sets[0];
                supps.push({
                  type: "leftleg",
                  name: decoded.value,
                  sets: `${s[0]}\u00D7${s[1]}`,
                  instruction: data.execution,
                  safety: data.nwbCues,
                  rest: data.rest,
                });
              } else if (decoded.kind === "core") {
                const data = SUPPLEMENT_EX[decoded.value];
                if (!data) continue;
                const s = data.sets[0];
                const region = SUPPLEMENT_CORE[workoutKey]?.exercises.find(
                  (ce) => ce.name === decoded.value,
                )?.region;
                supps.push({
                  type: "core",
                  name: decoded.value,
                  sets: `${s[0]}\u00D7${s[1]}`,
                  instruction: data.execution,
                  safety: data.nwbCues,
                  region,
                  rest: data.rest,
                });
              } else if (decoded.kind === "mobility") {
                const m = MOBILITY_SUPPLEMENTS.find((mm) => mm.id === decoded.value);
                if (!m) continue;
                supps.push({
                  type: "nearby",
                  name: m.name,
                  sets: m.sets,
                  instruction: m.instruction,
                  safety: m.safety,
                });
              } else if (decoded.kind === "pt") {
                const pt = PT_EXERCISES[decoded.value];
                if (!pt) continue;
                supps.push({
                  type: "leftleg",
                  name: pt.name,
                  sets: pt.sets,
                  instruction: pt.execution,
                  safety: pt.ptCues,
                });
              } else if (decoded.kind === "lib") {
                const data = EX[decoded.value];
                if (!data) continue;
                const s = data.sets[0];
                supps.push({
                  type: "leftleg",
                  name: decoded.value,
                  sets: s ? `${s[0]}×${s[1]}` : "",
                  instruction: data.execution ?? "",
                  safety: "",
                });
              } else if (decoded.kind === "text") {
                supps.push({
                  type: "leftleg",
                  name: decoded.value,
                  sets: "",
                  instruction: "",
                  safety: "",
                });
              }
            }

            return { name: nm, ex: exItem, supplements: supps.length > 0 ? supps : undefined };
          });

          if (items.length > 0) setFocusState({ items, index: 0 });
        }}
      >

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

        {/* Supplement toggle controls — always visible on training days */}
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
                  ? cssAlpha("var(--color-ll)", 8)
                  : "transparent",
                border: `1.5px solid ${supplementToggles.leftLeg ? "var(--color-ll)" : "var(--color-border)"}`,
                color: supplementToggles.leftLeg
                  ? "var(--color-ll)"
                  : "var(--color-text-muted)",
                fontWeight: supplementToggles.leftLeg ? 600 : 400,
              }}
            >
              {"\uD83E\uDDBF"} Auto L-Leg Supersets{" "}
              {supplementToggles.leftLeg ? "ON" : "OFF"}
            </button>
            {coreSubtitle && (
              <span className="text-[10px] text-text-muted self-center">
                Core: {coreSubtitle} &mdash; tap ＋ Add complement on any
                exercise to pair
              </span>
            )}
          </div>
        )}

        {/* Exercise rows */}
        {orderedOrigs.map((origName) => {
          const exName = getExName(workoutKey, origName);
          const ex = EX[exName];
          if (!ex) return null;
          if (ex.phase != null && effPhase < ex.phase) return null;
          const unavail = !isAvailable(exName);
          const isExp = !!expandedEx[exName];

          // Resolve selected machine variant (for setup cues)
          const selMachineId = machineSelections[exName];
          const selectedVariant =
            ex.machineVariants?.find((v) => v.id === selMachineId) ?? null;

          return (
            <div key={origName} data-exercise-name={exName}>
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
                phase={effPhase}
                isExpanded={isExp}
                onToggle={() => toggleEx(exName)}
                onLongPress={() =>
                  setEditSheetFor({ workoutKey, origName, exName })
                }
                onStartTimer={(sec) => setTimer(sec)}
                onDiagram={(d) => setDiagramOpen(d)}
                onOpenDiagram={(id) => setDiagramOpen(id)}
                unavailable={unavail}
                equipment={equipment}
                variantSetupCues={selectedVariant?.setupCues}
                variantLabel={selectedVariant?.label}
                variantRequires={selectedVariant?.requires}
                variantId={selectedVariant?.id}
                log={log}
                addComplementSlot={buildAddComplementPill(exName, ex, workoutKey)}
              />
              {buildSupersetCards(exName, ex, workoutKey, firstCableName)}
            </div>
          );
        })}

        {/* Add exercise */}
        <button
          data-testid="add-exercise"
          onClick={() => setAddPickerFor(workoutKey)}
          className="mt-2 w-full rounded-xl cursor-pointer font-[inherit] flex items-center justify-center gap-2 text-[13px] font-semibold min-h-[44px] transition-colors duration-150"
          style={{
            background: "var(--color-bg)",
            border: `1px dashed ${cssAlpha("var(--color-accent)", 40)}`,
            color: "var(--color-accent)",
          }}
          title="Pick any exercise from the catalog to add to this workout"
        >
          <span className="text-base leading-none">＋</span>
          Add exercise
        </button>

        {/* Core finishers */}
        {CORE_FINISHERS[workoutKey] && (
          <div
            className="mt-4 rounded-xl"
            style={{
              padding: "14px",
              background: "var(--color-bg)",
              border: `1px dashed ${cssAlpha("var(--color-warning)", 20)}`,
            }}
          >
            <div className="text-[13px] font-bold text-warning mb-3 tracking-wide">
              {"\uD83D\uDD25"} Core Finisher &mdash; pick 1&ndash;2
            </div>
            {CORE_FINISHERS[workoutKey].map((name) => {
              const ex = EX[name];
              if (!ex) return null;
              const selMachineId = machineSelections[name];
              const selectedVariant =
                ex.machineVariants?.find((v) => v.id === selMachineId) ?? null;
              return (
                <div key={`cf-${name}`}>
                  <ExerciseRow
                    name={name}
                    ex={ex}
                    phase={effPhase}
                    isExpanded={!!expandedEx[name]}
                    onToggle={() => toggleEx(name)}
                    onLongPress={() =>
                      setEditSheetFor({
                        workoutKey: "__finisher__",
                        origName: name,
                        exName: name,
                      })
                    }
                    onStartTimer={(sec) => setTimer(sec)}
                    onDiagram={(d) => setDiagramOpen(d)}
                    onOpenDiagram={(id) => setDiagramOpen(id)}
                    unavailable={!isAvailable(name)}
                    equipment={equipment}
                    variantSetupCues={selectedVariant?.setupCues}
                    variantLabel={selectedVariant?.label}
                    variantRequires={selectedVariant?.requires}
                    variantId={selectedVariant?.id}
                    log={log}
                    addComplementSlot={buildAddComplementPill(name, ex)}
                  />
                  {buildSupersetCards(name, ex, "__finisher__", null)}
                </div>
              );
            })}
          </div>
        )}

        {/* Daily HEP reminder strip */}
        <HEPBlock mode="strip" workoutKey={workoutKey} />
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
          style={{
            padding: "16px 12px 14px",
            background: `linear-gradient(135deg, ${selSched.c}15 0%, ${selSched.c}08 50%, transparent 100%)`,
            border: `1px solid ${selSched.c}22`,
          }}
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

        {/* Daily HEP pill */}
        <HEPBlock mode="pill" />

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
            background: `linear-gradient(135deg, ${accentColor}18 0%, ${accentColor}08 60%, transparent 100%)`,
            border: `1px solid ${accentColor}33`,
            boxShadow: `0 0 16px ${accentColor}08`,
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

        {/* Filter pills — centered flex pills with count badges */}
        <div className="flex flex-wrap gap-1.5 mb-3">
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
            coloredBorder
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
      "Push, pull, legs, core, recovery \u00B7 animated diagrams",
    );
  }

  function renderLowerTab() {
    return renderExerciseLibrary(
      LOWER_GROUPS,
      lowerFilter,
      setLowerFilter,
      "#10b981",
      "Exercise Diagram Gallery",
      "Push, pull, legs, core, recovery \u00B7 animated diagrams",
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
          {tier1.map((k) => {
            const ex = EX[k];
            const selMachineId = machineSelections[k];
            const selectedVariant =
              ex.machineVariants?.find((v) => v.id === selMachineId) ?? null;
            return (
              <div key={k}>
                <ExerciseRow
                  name={k}
                  ex={ex}
                  phase={effPhase}
                  isExpanded={!!expandedEx[k]}
                  onToggle={() => toggleEx(k)}
                  onLongPress={() =>
                    setEditSheetFor({
                      workoutKey: "__cardio__",
                      origName: k,
                      exName: k,
                    })
                  }
                  onStartTimer={(sec) => setTimer(sec)}
                  onDiagram={(d) => setDiagramOpen(d)}
                  onOpenDiagram={(id) => setDiagramOpen(id)}
                  unavailable={!isAvailable(k)}
                  equipment={equipment}
                  variantSetupCues={selectedVariant?.setupCues}
                  variantLabel={selectedVariant?.label}
                  variantRequires={selectedVariant?.requires}
                  variantId={selectedVariant?.id}
                  log={log}
                  addComplementSlot={buildAddComplementPill(k, ex)}
                />
                {buildSupersetCards(k, ex, "__cardio__", null)}
              </div>
            );
          })}
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
                    borderBottom: `2px solid ${cssAlpha("var(--color-accent)", 27)}`,
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
                Push, pull, legs, core, recovery &middot; animated diagrams
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
                      ? cssAlpha("var(--color-accent)", 13)
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
      </div>
    );
  }

  function renderEquipTab() {
    return (
      <div>
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
                      ? cssAlpha("var(--color-accent)", 13)
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
          {(startDay !== 0 || restDay !== null) && (
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

        {/* Rest Day This Week */}
        <Section
          title="Rest Day This Week"
          icon={"\uD83D\uDECF\uFE0F"}
          isOpen={!!openSections["rest-day"]}
          onToggle={() => toggleSection("rest-day")}
        >
          <div className="text-[11px] text-text-dim mb-2.5">
            Move your rest day to a different day this week. Training
            workouts shift around it, keeping their order.
          </div>
          <div data-testid="rest-day-picker" className="grid grid-cols-7 gap-1">
            {DAY_ABBR.map((d, i) => {
              const defaultRestDay = (startDay + 6) % 7;
              const isDefault = i === defaultRestDay;
              const isActive = restDay === null ? isDefault : i === restDay;
              return (
                <button
                  key={`rd-${i}`}
                  data-testid={`rest-day-${i}`}
                  onClick={() => {
                    if (i === defaultRestDay) {
                      setRestDay(null); // clicking default clears override
                    } else {
                      setRestDay(i);
                    }
                  }}
                  className="rounded-lg text-[11px] cursor-pointer font-[inherit] min-h-[44px]"
                  style={{
                    padding: "10px 2px",
                    background: isActive ? "#64748b22" : "var(--color-bg)",
                    border: `1px solid ${isActive ? "#64748b" : "var(--color-border)"}`,
                    color: isActive ? "#94a3b8" : "var(--color-text-muted)",
                    fontWeight: isActive ? 700 : 500,
                  }}
                >
                  {d}
                </button>
              );
            })}
          </div>
          {restDay !== null && (
            <>
              <div className="mt-2.5 text-[11px] text-text-dim leading-relaxed">
                <div className="font-semibold mb-1" style={{ color: "#64748b" }}>
                  Adjusted rotation:
                </div>
                {DAY_ABBR.map((d, i) => {
                  const workout = getWorkoutForDay(i);
                  return (
                    <span key={`rdrot-${i}`} className="inline-block mr-1.5 mb-0.5">
                      {d}={workout.t}{i < 6 ? " \u2192" : ""}
                    </span>
                  );
                })}
              </div>
              <button
                onClick={() => setRestDay(null)}
                className="mt-2 text-[11px] cursor-pointer font-[inherit] rounded-lg"
                style={{
                  padding: "6px 12px",
                  background: "var(--color-bg)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text-muted)",
                }}
              >
                Reset to default
              </button>
            </>
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
                          : cssAlpha("var(--color-text-muted)", 27),
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

        {/* Hevy CSV import */}
        <div style={{ marginTop: 8 }}>
          <HevyImportPanel />
        </div>
      </div>
    );
  }

  function renderSafetyTab() {
    return (
      <div>

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
                    borderBottom: `2px solid ${cssAlpha("var(--color-accent)", 27)}`,
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

  // ===== ACTIVE WORKOUT-LOG SESSION =====
  // Must be declared BEFORE the render-tab switch — renderTodayTab() and
  // renderWorkout() iterate exercises and pass `log` into ExerciseRow as a
  // prop, so the const has to be initialised before those functions execute.
  const todayWorkoutKey = getWorkoutForDay(selectedDay).t;
  const log = useWorkoutLog(todayWorkoutKey);

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
    case SAFETY_TAB_INDEX:
      content = renderSafetyTab();
      break;
    case GEAR_TAB_INDEX:
      content = renderEquipTab();
      break;
    case HISTORY_TAB_INDEX:
      content = <HistoryView />;
      break;
    case REHAB_TAB_INDEX:
      content = <RehabTab />;
      break;
  }

  const todayColor = getWorkoutForDay(selectedDay).c;

  // ===== MAIN LAYOUT =====
  return (
    <div data-testid="app-container" className="app-container max-w-[600px] mx-auto px-4 pb-24 min-h-screen bg-bg">
      <SessionBar log={log} workoutLabel={log.active?.workoutKey ?? todayWorkoutKey} />

      {/* Header */}
      <div className="pt-8 pb-5 text-center">
        <div className="flex items-center justify-center gap-2.5">
          {/* Compact progress ring in header */}
          <ProgressClock compact />
          <h1 data-testid="app-title" className="text-2xl font-extrabold tracking-tight text-text">
            Femur Fracture Fitness
          </h1>
          {/* Header icons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFontSize((s) => Math.max(12, s - 1))}
              className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted cursor-pointer text-xs font-bold"
              style={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }}
              title="Decrease font size"
            >
              A-
            </button>
            <button
              onClick={() => setFontSize((s) => Math.min(24, s + 1))}
              className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted cursor-pointer text-xs font-bold"
              style={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }}
              title="Increase font size"
            >
              A+
            </button>
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
          NWB-Adjusted PPL &bull; Left Femur Stress Fracture &bull; 8 Weeks
        </div>
      </div>

      {/* Phase selector */}
      <div className={`flex gap-1.5 ${phase === null ? "mb-1.5" : "mb-4"}`}>
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

      {/* FWB era: the 8-week content phases no longer apply, so no tab is
          selected. A note explains the deselected state. */}
      {phase === null && (
        <div
          data-testid="phase-selector-fwb-note"
          className="text-[10px] text-text-muted mb-4 px-1 leading-snug"
        >
          <span className="font-semibold" style={{ color: "#facc15" }}>
            FWB
          </span>{" "}
          — base 8-week program complete. Phases above are kept for reference;
          tap one to preview its set scheme.
        </div>
      )}

      {/* Tab bar */}
      <div ref={tabBarRef} data-testid="tab-bar" className="relative flex gap-1 mb-5 items-stretch">
        {/* Sliding pill indicator */}
        {pillPos.width > 0 && (
          <div
            data-testid="tab-pill"
            className="absolute top-0 bottom-0 rounded-xl pointer-events-none"
            style={{
              left: pillPos.left,
              width: pillPos.width,
              background:
                (tab === 0
                  ? todayColor
                  : tab === SAFETY_TAB_INDEX
                    ? "var(--color-warning)"
                    : "var(--color-accent)") + "15",
              border: `1px solid ${
                tab === 0
                  ? todayColor
                  : tab === SAFETY_TAB_INDEX
                    ? "var(--color-warning)"
                    : "var(--color-accent)"
              }55`,
              transition: pillInitialized.current ? "left 0.3s cubic-bezier(.4,0,.2,1), width 0.3s cubic-bezier(.4,0,.2,1)" : "none",
            }}
          />
        )}
        {TABS.map((t, i) => {
          const isTodayTab = i === 0;
          const activeColor = isTodayTab ? todayColor : "var(--color-accent)";
          // Map visual position → canonical state index (Rehab is out-of-band).
          const stateIdx = TAB_INDEX_BY_NAME[t] ?? i;
          const isActive = tab === stateIdx;
          return (
            <button
              key={t}
              ref={(el) => {
                // Store ref at canonical state index so pillPos lookup works
                // for the out-of-band Rehab tab (state idx 9).
                tabRefs.current[stateIdx] = el;
              }}
              data-testid={`tab-${t.toLowerCase()}`}
              title={TAB_TIPS[i]}
              aria-label={t}
              onClick={() => setTab(stateIdx)}
              className={`flex-1 min-w-0 rounded-xl text-xs font-semibold cursor-pointer font-[inherit] flex items-center justify-center transition-all duration-150 ${isActive ? "tab-active" : ""}`}
              style={{
                padding: "12px 4px",
                background: "transparent",
                border: "1px solid transparent",
                color: isActive ? activeColor : "var(--color-text-muted)",
              }}
            >
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                {TAB_ICONS[t]}
              </svg>
            </button>
          );
        })}
        {/* Divider */}
        <div className="w-px mx-0.5 self-stretch rounded-full" style={{ background: "var(--color-border)" }} />
        {/* Safety (icon) */}
        <button
          ref={(el) => { tabRefs.current[SAFETY_TAB_INDEX] = el; }}
          data-testid="tab-safety"
          title="Injury cues & safety rules"
          onClick={() => setTab(SAFETY_TAB_INDEX)}
          className={`rounded-xl cursor-pointer font-[inherit] flex items-center justify-center transition-all duration-150 ${tab === SAFETY_TAB_INDEX ? "tab-active" : ""}`}
          style={{
            width: 44,
            minWidth: 44,
            padding: "12px 0",
            background: "transparent",
            border: "1px solid transparent",
            color: tab === SAFETY_TAB_INDEX ? "var(--color-warning)" : "var(--color-text-muted)",
          }}
        >
          {/* Shield */}
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </button>
        {/* History (icon) */}
        <button
          ref={(el) => { tabRefs.current[HISTORY_TAB_INDEX] = el; }}
          data-testid="tab-history"
          title="Workout history"
          aria-label="History"
          onClick={() => setTab(HISTORY_TAB_INDEX)}
          className={`rounded-xl cursor-pointer font-[inherit] flex items-center justify-center transition-all duration-150 ${tab === HISTORY_TAB_INDEX ? "tab-active" : ""}`}
          style={{
            width: 44,
            minWidth: 44,
            padding: "12px 0",
            background: "transparent",
            border: "1px solid transparent",
            color: tab === HISTORY_TAB_INDEX ? "var(--color-accent)" : "var(--color-text-muted)",
          }}
        >
          {/* Clock with rewind arrow */}
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
            <path d="M3 3v5h5" />
            <path d="M12 7v5l3 2" />
          </svg>
        </button>
        {/* Gear / config */}
        <button
          ref={(el) => { tabRefs.current[GEAR_TAB_INDEX] = el; }}
          data-testid="tab-gear"
          title="Equipment & configuration"
          onClick={() => setTab(GEAR_TAB_INDEX)}
          className={`rounded-xl cursor-pointer font-[inherit] flex items-center justify-center transition-all duration-150 ${tab === GEAR_TAB_INDEX ? "tab-active" : ""}`}
          style={{
            width: 44,
            minWidth: 44,
            padding: "12px 0",
            background: "transparent",
            border: "1px solid transparent",
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
        <a
          href="https://pwbpb.93.fyi"
          target="_blank"
          rel="noopener noreferrer"
          className="text-text-muted"
          title="Stationary Pickleball Drills"
        >
          <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor">
            <ellipse cx="9" cy="11" rx="5.5" ry="7" />
            <rect x="11.5" y="15" width="2" height="6" rx="1" transform="rotate(-25 12.5 18)" />
            <circle cx="18" cy="6.5" r="2" opacity="0.7" />
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
                  <a
                    href="https://pwbpb.93.fyi"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent text-xs font-medium"
                  >
                    Pickleball Drills &rarr;
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen focus overlay */}
      {focusState && (() => {
        const { items, index } = focusState;
        const item = items[index];
        if (!item) return null;
        const s = item.ex.sets[effPhase] ?? item.ex.sets[0];
        return (
          <div
            className="fixed inset-0 z-[250] flex flex-col"
            style={{ background: "#0a0a0a" }}
          >
            {/* Top bar: position dots + close */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-white/40 text-[10px] font-medium uppercase tracking-wider">
                  {index + 1} of {items.length}
                </span>
                <div className="flex gap-1.5 ml-1">
                  {items.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setFocusState((prev) => prev ? { ...prev, index: i } : null)}
                      className="rounded-full transition-all duration-300 border-none cursor-pointer p-0"
                      style={{
                        width: i === index ? 20 : 6,
                        height: 6,
                        background: i === index ? "#38bdf8" : "rgba(255,255,255,0.2)",
                      }}
                    />
                  ))}
                </div>
              </div>
              <button
                onClick={() => setFocusState(null)}
                className="w-11 h-11 flex items-center justify-center rounded-full cursor-pointer border-none text-base font-bold"
                style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}
              >
                ✕
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-6 pb-4">
              <div
                className="text-[clamp(28px,8vw,40px)] font-extrabold text-white leading-tight mb-2 mt-1"
                style={{ letterSpacing: "-0.02em" }}
              >
                {item.name}
              </div>

              <div className="flex items-baseline gap-4 mb-7">
                <span className="text-2xl font-bold" style={{ color: "#38bdf8" }}>
                  {s[0]} &times; {s[1]}
                </span>
                {item.ex.rest > 0 && (
                  <span className="text-base font-medium" style={{ color: "rgba(255,255,255,0.35)" }}>
                    {item.ex.rest}s rest
                  </span>
                )}
              </div>

              <div className="mb-6">
                <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "#38bdf8" }}>
                  {"\uD83D\uDCCD"} Setup &amp; Position
                </div>
                <div className="text-white/80 text-[15px] leading-relaxed">{item.ex.setup}</div>
              </div>

              <div className="mb-6">
                <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "#4ade80" }}>
                  {"\uD83D\uDD04"} How to Execute
                </div>
                <div className="text-white/80 text-[15px] leading-relaxed">{item.ex.execution}</div>
              </div>

              <div
                className="mb-6 rounded-2xl p-4"
                style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)" }}
              >
                <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "#fbbf24" }}>
                  {"\uD83D\uDEE1\uFE0F"} NWB Safety
                </div>
                <div className="text-white/75 text-[14px] leading-relaxed">{item.ex.nwbCues}</div>
              </div>

              {/* In-app set tracker — primary action surface in play mode.
                  `key` re-keys on exercise change so the draft state, prefill,
                  and inputs reset cleanly when navigating between focus items. */}
              <div className="mb-4">
                <SetTracker
                  key={item.ex.id}
                  exerciseId={item.ex.id}
                  exerciseName={item.name}
                  variantId={
                    item.ex.machineVariants?.find(
                      (v) => v.id === machineSelections[item.name],
                    )?.id
                  }
                  defaultRest={item.ex.rest}
                  prescribedReps={s[1]}
                  log={log}
                  onStartTimer={(sec) => setTimer(sec)}
                />
              </div>

              <div
                className="mb-4 rounded-2xl p-4"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.3)" }}>
                  Breathing
                </div>
                <div className="text-[13px] leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
                  Exhale on effort &mdash; inhale on return. Brace core throughout.
                </div>
              </div>

              {EXERCISE_TO_DIAGRAM[item.ex.id] && (
                <button
                  onClick={() => setDiagramOpen(EXERCISE_TO_DIAGRAM[item.ex.id])}
                  className="w-full rounded-2xl text-[13px] font-bold cursor-pointer font-[inherit] flex items-center justify-center gap-2 mb-4"
                  style={{
                    minHeight: 48,
                    background: "rgba(56,189,248,0.12)",
                    border: "1px solid rgba(56,189,248,0.25)",
                    color: "#38bdf8",
                  }}
                >
                  {"\u{1F4D0}"} View Movement Diagram
                </button>
              )}

              {/* Supersets / supplements */}
              {item.supplements && item.supplements.length > 0 && (
                <div className="mt-2 mb-4 space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>
                    Supersets
                  </div>
                  {item.supplements.map((supp, si) => {
                    const isLL = supp.type === "leftleg" || supp.type === "cable" || supp.type === "variant" || supp.type === "nearby";
                    const accentColor = isLL ? "#14b8a6" : "#f97316";
                    const regionColors: Record<string, string> = { "Upper Abs": "#f59e0b", "Lower Abs": "#ec4899", Obliques: "#a78bfa" };
                    const labelColor = supp.region ? (regionColors[supp.region] || accentColor) : accentColor;
                    const typeLabel = supp.type === "leftleg" ? "LEFT LEG"
                      : supp.type === "cable" ? "CABLE SUPERSET"
                      : supp.type === "variant" ? "MACHINE SUPERSET"
                      : supp.type === "nearby" ? "NEARBY"
                      : supp.region || "CORE";
                    return (
                      <div
                        key={`focus-supp-${si}`}
                        className="rounded-2xl p-4"
                        style={{
                          background: `${accentColor}0d`,
                          border: `1px solid ${accentColor}33`,
                          borderLeft: `3px solid ${accentColor}`,
                        }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className="text-[9px] font-extrabold rounded px-1.5 py-0.5"
                            style={{
                              background: `${labelColor}22`,
                              border: `1px solid ${labelColor}44`,
                              color: labelColor,
                            }}
                          >
                            {typeLabel}
                          </span>
                          <span className="text-sm font-semibold text-white">{supp.name}</span>
                          <span className="ml-auto text-xs font-medium" style={{ color: accentColor }}>
                            {supp.sets}
                          </span>
                        </div>
                        <div className="text-white/70 text-[13px] leading-relaxed mb-1.5">
                          {supp.instruction}
                        </div>
                        <div className="text-[12px]" style={{ color: accentColor }}>
                          {"\uD83D\uDEE1\uFE0F"} {supp.safety}
                        </div>
                        {supp.rest != null && supp.rest > 0 && (
                          <button
                            onClick={() => setTimer(supp.rest!)}
                            className="mt-2 w-full rounded-xl text-[12px] font-semibold cursor-pointer font-[inherit]"
                            style={{
                              padding: "8px",
                              background: `${accentColor}18`,
                              border: `1px solid ${accentColor}33`,
                              color: accentColor,
                            }}
                          >
                            {"\u23F1"} Start {supp.rest}s Rest
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Nav buttons */}
            <div
              className="flex-shrink-0 flex items-center gap-3 px-5 pt-3 pb-8"
              style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
            >
              <button
                onClick={() => setFocusState((prev) => prev ? { ...prev, index: Math.max(0, prev.index - 1) } : null)}
                disabled={index === 0}
                className="flex-1 rounded-2xl text-base font-bold cursor-pointer font-[inherit] transition-all duration-150 border-none"
                style={{
                  minHeight: 62,
                  background: index > 0 ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)",
                  color: index > 0 ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.2)",
                }}
              >
                &#8249; Prev
              </button>
              <div className="text-center w-16 text-sm font-medium" style={{ color: "rgba(255,255,255,0.3)" }}>
                {index + 1}&thinsp;/&thinsp;{items.length}
              </div>
              <button
                onClick={() => setFocusState((prev) => prev ? { ...prev, index: Math.min(prev.items.length - 1, prev.index + 1) } : null)}
                disabled={index === items.length - 1}
                className="flex-1 rounded-2xl text-base font-bold cursor-pointer font-[inherit] transition-all duration-150 border-none"
                style={{
                  minHeight: 62,
                  background: index < items.length - 1 ? "rgba(56,189,248,0.2)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${index < items.length - 1 ? "rgba(56,189,248,0.3)" : "transparent"}`,
                  color: index < items.length - 1 ? "#38bdf8" : "rgba(255,255,255,0.2)",
                }}
              >
                Next &#8250;
              </button>
            </div>
          </div>
        );
      })()}

      {/* Diagram gallery overlay — also handles deep-linked exercise IDs */}
      {diagramOpen && (diagramOpen === "gallery" || DIAGRAM_EXERCISES.some(e => e.id === diagramOpen)) && (
        <div
          data-testid="diagram-gallery-overlay"
          className={`fixed inset-0 ${focusState ? "z-[300]" : "z-[200]"} overflow-y-auto overflow-x-hidden`}
          style={{ background: "var(--color-bg)" }}
        >
          <DiagramGallery
            initialExercise={diagramOpen !== "gallery" ? diagramOpen : undefined}
            onClose={() => setDiagramOpen(null)}
          />
        </div>
      )}

      {/* Diagram modal (individual exercises — legacy modal keys) */}
      {diagramOpen && diagramOpen !== "gallery" && !DIAGRAM_EXERCISES.some(e => e.id === diagramOpen) && (
        <DiagramModal
          diagram={diagramOpen}
          onClose={() => setDiagramOpen(null)}
        />
      )}

      {/* Edit exercise sheet — long-press / ⋮ button opens this */}
      {editSheetFor && (() => {
        const { workoutKey: wk, origName } = editSheetFor;
        const exName = getExName(wk, origName);
        const ex = EX[exName];
        if (!ex) return null;
        const w = WORKOUTS[wk];
        const siblingOrigs = w
          ? getOrderedExercises(wk).filter(
              (o) => !(dayState.removed[wk] ?? []).includes(o),
            )
          : [origName];
        const idx = siblingOrigs.indexOf(origName);
        const siblingNames = siblingOrigs.map((o) => getExName(wk, o));
        return (
          <EditExerciseSheet
            exerciseName={exName}
            exercise={ex}
            workoutExercises={siblingNames}
            equipment={equipment}
            selectedVariantId={machineSelections[exName] ?? null}
            onSelectVariant={(id) =>
              setMachineSelections((prev) => ({ ...prev, [exName]: id }))
            }
            onSwap={(newName) => {
              if (w) handleSwap(wk, origName, newName);
            }}
            onMoveUp={() => {
              if (w) moveExercise(wk, origName, -1);
            }}
            onMoveDown={() => {
              if (w) moveExercise(wk, origName, 1);
            }}
            canMoveUp={!!w && idx > 0}
            canMoveDown={!!w && idx >= 0 && idx < siblingOrigs.length - 1}
            onRemove={() => {
              if (w) removeExerciseToday(wk, origName);
            }}
            onClose={() => setEditSheetFor(null)}
          />
        );
      })()}

      {/* Complement picker — "+ Add complement" pill opens this */}
      {complementPickerFor && (
        <ComplementPicker
          exerciseRequires={complementPickerFor.exerciseRequires}
          exerciseCategory={complementPickerFor.exerciseCategory}
          workoutKey={complementPickerFor.workoutKey}
          nearbySelections={nearbySelections[complementPickerFor.exName] ?? []}
          activeIds={dayState.complements[complementPickerFor.exName] ?? []}
          onToggle={(id) =>
            toggleComplement(complementPickerFor.exName, id)
          }
          onClose={() => setComplementPickerFor(null)}
        />
      )}

      {/* Add-exercise picker — "＋ Add exercise" button opens this.
          The picker itself is intentionally lean (search + tap-to-add). To
          let the user log a set immediately on the new exercise without a
          separate tap to expand it, we (a) make sure the workout section is
          open, (b) auto-expand the freshly added row, and (c) scroll it
          into view. The picker auto-closes on add (existing behavior), so
          when the user lands back on the today view the new ExerciseRow is
          already expanded with SetTracker visible at the top of its panel. */}
      {addPickerFor && (() => {
        const wk = addPickerFor;
        const w = WORKOUTS[wk];
        const current = w
          ? [...w.exercises, ...(addedExercises[wk] ?? [])]
          : [];
        const preferred =
          wk.startsWith("Push") ? "push"
            : wk.startsWith("Pull") ? "pull"
              : wk.startsWith("Legs") ? "legs"
                : undefined;
        return (
          <AddExercisePicker
            currentExercises={current}
            preferredCategory={preferred}
            onAdd={(name) => {
              addExerciseToWorkout(wk, name);
              // Ensure the workout section is open so the row is visible.
              setOpenSections((prev) =>
                prev[wk] ? prev : { ...prev, [wk]: true },
              );
              // Auto-expand the new exercise row so its SetTracker is
              // immediately tappable. Note: getExName(wk, name) === name
              // for freshly added exercises (no swap mapping yet).
              setExpandedEx((prev) =>
                prev[name] ? prev : { ...prev, [name]: true },
              );
              // Scroll the new row into view after the picker closes.
              // Each row in renderWorkout is tagged with data-exercise-name
              // so we can find it deterministically without a ref. The
              // double rAF gives React a tick to paint the new addition +
              // expanded panel before we scroll.
              if (typeof window !== "undefined") {
                requestAnimationFrame(() => {
                  requestAnimationFrame(() => {
                    const el = document.querySelector(
                      `[data-exercise-name="${CSS.escape(name)}"]`,
                    );
                    if (el && "scrollIntoView" in el) {
                      (el as HTMLElement).scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      });
                    }
                  });
                });
              }
            }}
            onClose={() => setAddPickerFor(null)}
          />
        );
      })()}
    </div>
  );
}
