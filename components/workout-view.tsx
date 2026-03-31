"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { loadState, saveState } from "@/lib/storage";
import {
  EX,
  EQUIPMENT,
  WORKOUTS,
  CORE_FINISHERS,
  SCHED,
  PHASES,
} from "@/lib/exercises";
import {
  SUPPLEMENT_LEFT_LEG,
  SUPPLEMENT_CORE,
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

const TABS = ["Today", "Workouts", "Cardio", "Core", "Equip", "Safety"];

const TAB_TIPS = [
  "Today's scheduled workout",
  "All push/pull/legs exercises",
  "NWB cardio options",
  "Core & ab routines",
  "Toggle available equipment",
  "Injury cues & safety rules",
];

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
  ["Mon", "\u2014", "SkiErg HIIT 25m", "~300"],
  ["Tue", "Arm Ergo 30m", "Battle Ropes 15m", "~400"],
  ["Wed", "SkiErg Intervals", "\u2014", "~350"],
  ["Thu", "Boxing 20m", "SkiErg Steady 25m", "~450"],
  ["Fri", "Arm Ergo HIIT", "Ropes Tabata", "~400"],
  ["Sat", "SkiErg Long 40m", "Boxing 15m", "~500"],
  ["Sun", "Light Arm Ergo 20m", "\u2014", "~100"],
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

// ===== CORE BLOCKS =====
const CORE_BLOCKS = [
  {
    key: "core-antiext",
    title: "Block 1: Anti-Extension",
    icon: "\uD83D\uDC80",
    accent: "var(--color-danger)",
    count: 8,
    exercises: [
      "Forearm Plank Saw",
      "Plank Knee Tuck (R only)",
      "Wheelbarrow Hold",
      "Spiderman Plank (R only)",
      "Slow Mountain Climber (R)",
      "Dead Bug (R Leg Only)",
      "Hollow Body Hold",
      "Body Saw (Sliders)",
    ],
  },
  {
    key: "core-antirot",
    title: "Block 2: Anti-Rotation",
    icon: "\uD83D\uDD04",
    accent: "var(--color-accent)",
    count: 3,
    exercises: [
      "Pallof Press (Seated)",
      "Pallof Overhead Reach",
      "Bird-Dog (Prone Bench)",
    ],
  },
  {
    key: "core-antilat",
    title: "Block 3: Anti-Lateral-Flexion",
    icon: "\u2194\uFE0F",
    accent: "var(--color-warning)",
    count: 3,
    exercises: [
      "Side Plank (R Side Down)",
      "Side Plank (L Oblique Bias \u2014 R Side Down)",
      "Suitcase Hold (Seated)",
    ],
  },
  {
    key: "core-rotation",
    title: "Block 4: Rotation + Integrated",
    icon: "\uD83C\uDF00",
    accent: "#a78bfa",
    count: 5,
    exercises: [
      "Russian Twist (Seated Bench)",
      "Cable Woodchop (Seated)",
      "Bicycle Crunch (R Leg Only)",
      "Stir the Pot",
      "McGill Curl-Up",
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
  const [supplementToggles, setSupplementToggles] = useState<{
    leftLeg: boolean;
    core: boolean;
  }>(() => loadState("nwb_supplements", { leftLeg: true, core: true }));
  const [aboutOpen, setAboutOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window === "undefined") return "dark";
    return (localStorage.getItem("nwb_theme") as "dark" | "light") || "dark";
  });

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
    saveState("nwb_supplements", supplementToggles);
  }, [supplementToggles]);
  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
    localStorage.setItem("nwb_theme", theme);
  }, [theme]);

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
          <div className="mb-2.5">
            <a
              href={`https://hevy.com/routine/${hevyId}`}
              target="_blank"
              rel="noopener"
              onClick={(ev) => ev.stopPropagation()}
              className="block text-center rounded-lg text-[13px] font-semibold no-underline min-h-[44px] leading-[44px]"
              style={{
                padding: "0 8px",
                background: "#a78bfa22",
                border: "1px solid #a78bfa44",
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
            href="https://nwb-yoga.vercel.app"
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
              <svg
                width={28}
                height={28}
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <circle cx="12" cy="4.5" r="2.5" />
                <path
                  d="M12 1.5c-2.5 0-4.5 1.5-5 3.5 0 .3.2.5.5.4C8.5 5 10.2 4.5 12 4.5s3.5.5 4.5.9c.3.1.5-.1.5-.4-.5-2-2.5-3.5-5-3.5z"
                  opacity="0.6"
                />
                <path d="M10.5 7.5h3v4.5h-3z" />
                <path d="M10.5 9L7 12h2l1.5-2zM13.5 9L17 12h-2l-1.5-2z" />
                <path d="M5.5 17c0-2.8 2.9-5 6.5-5s6.5 2.2 6.5 5c0 1.5-1 2.8-2.5 3.5-1.2-.8-2.5-1.2-4-1.2s-2.8.4-4 1.2C6.5 19.8 5.5 18.5 5.5 17z" />
              </svg>
              <div>
                <div className="text-[13px] font-semibold text-text">
                  NWB Yoga &mdash; Companion App
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
          <div className="flex gap-1.5 mb-2.5 flex-wrap">
            <button
              onClick={(ev) => {
                ev.stopPropagation();
                toggleSupplement("leftLeg");
              }}
              className="text-[10px] rounded-[10px] cursor-pointer font-[inherit]"
              style={{
                padding: "4px 10px",
                background: supplementToggles.leftLeg
                  ? "#14b8a618"
                  : "transparent",
                border: `1px solid ${supplementToggles.leftLeg ? "#14b8a644" : "var(--color-border)"}`,
                color: supplementToggles.leftLeg
                  ? "#14b8a6"
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
              className="text-[10px] rounded-[10px] cursor-pointer font-[inherit]"
              style={{
                padding: "4px 10px",
                background: supplementToggles.core
                  ? "#f9731618"
                  : "transparent",
                border: `1px solid ${supplementToggles.core ? "#f9731644" : "var(--color-border)"}`,
                color: supplementToggles.core
                  ? "#f97316"
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

          // Equipment-specific superset (driven by machineVariants selection)
          let ssInfo: VariantSuperset | null = null;
          if (supplementToggles.leftLeg) {
            if (ex.cableSuperset && exName === firstCableName) {
              ssInfo = { ...CABLE_SUPERSET };
              // Check if selected machine variant is a lat pulldown machine (no low cable)
              const selMachine = machineSelections[exName];
              if (selMachine === "band_rack") {
                ssInfo.note =
                  "No cable available with band setup \u2014 do ankle dorsiflexion at nearest cable column between sets.";
              }
            } else if (ex.machineVariants) {
              const selId =
                machineSelections[exName] || ex.machineVariants[0]?.id;
              const selectedVariant = ex.machineVariants.find(
                (v) => v.id === selId
              );
              if (selectedVariant?.superset) {
                ssInfo = { ...selectedVariant.superset };
              }
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

          return (
            <div key={origName}>
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
              />

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

              {/* Collapsed supplement indicator */}
              {!isExp && activeSuppCards.length > 0 && (
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
                    return (
                      <span
                        key={`ind-${si}`}
                        className="inline-flex items-center gap-0.5"
                      >
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

              {/* Inline supplement superset cards (expanded) */}
              {isExp &&
                suppCards.length > 0 &&
                suppCards.map((supp) => {
                  const isLL = supp.type === "leftleg";
                  if (isLL && !supplementToggles.leftLeg) return null;
                  if (!isLL && !supplementToggles.core) return null;
                  const suppEx = EX[supp.name];
                  if (!suppEx) return null;
                  const accent = isLL ? "#14b8a6" : "#f97316";
                  const suppSets = suppEx.sets[phase] || suppEx.sets[0];
                  const suppExpKey = "supp_" + supp.name;
                  const suppIsExp = !!expandedEx[suppExpKey];

                  const groupTotal = isLL
                    ? llExercises.length
                    : coreExData.length;
                  const groupIdx = isLL
                    ? llExercises.indexOf(supp.name) + 1
                    : coreExData.findIndex((c) => c.name === supp.name) + 1;
                  const groupLabel = `${groupIdx}/${groupTotal}`;

                  if (isLL) {
                    return (
                      <div
                        key={`supp-${supp.name}`}
                        className="mx-1 my-0.5 rounded-lg overflow-hidden"
                        style={{
                          background: "#14b8a609",
                          border: "1px solid #14b8a628",
                          borderLeft: "3px solid #14b8a6",
                        }}
                      >
                        <div
                          onClick={() => toggleEx(suppExpKey)}
                          className="cursor-pointer flex items-center gap-1.5"
                          style={{ padding: "8px 10px" }}
                        >
                          <span
                            className="inline-flex items-center justify-center rounded text-[9px] font-extrabold shrink-0"
                            style={{
                              width: 18,
                              height: 18,
                              background: "#14b8a622",
                              border: "1px solid #14b8a644",
                              color: "#14b8a6",
                            }}
                          >
                            L
                          </span>
                          <span
                            className="text-[9px] font-bold"
                            style={{ color: "#14b8a6", opacity: 0.7 }}
                          >
                            {groupLabel}
                          </span>
                          <span
                            className="text-[10px] font-semibold uppercase tracking-wide"
                            style={{ color: "#14b8a6" }}
                          >
                            Left Leg
                          </span>
                          <span className="font-semibold text-xs text-text flex-1">
                            {supp.name}
                          </span>
                          <span className="text-[10px] text-text-dim">
                            {suppSets[0]}&times;{suppSets[1]}
                          </span>
                          <span
                            className="text-[9px] ml-1"
                            style={{ color: "#14b8a6" }}
                          >
                            {suppIsExp ? "\u25B2" : "\u25BC"}
                          </span>
                        </div>
                        {suppIsExp && (
                          <div
                            className="text-[11px] leading-relaxed"
                            style={{ padding: "0 10px 10px" }}
                          >
                            <div className="mb-1.5">
                              <span
                                className="font-bold text-[10px]"
                                style={{ color: "#14b8a6" }}
                              >
                                {"\uD83D\uDCCD"} Setup:{" "}
                              </span>
                              <span className="text-text-dim">
                                {suppEx.setup}
                              </span>
                            </div>
                            <div className="mb-1.5">
                              <span className="font-bold text-[10px] text-safe">
                                {"\uD83D\uDD04"} Execute:{" "}
                              </span>
                              <span className="text-text-dim">
                                {suppEx.execution}
                              </span>
                            </div>
                            <div>
                              <span
                                className="font-bold text-[10px]"
                                style={{ color: "#14b8a6" }}
                              >
                                {"\uD83D\uDEE1\uFE0F"} Safety:{" "}
                              </span>
                              <span className="text-text-dim">
                                {suppEx.nwbCues}
                              </span>
                            </div>
                            {suppEx.rest > 0 && (
                              <button
                                onClick={(ev) => {
                                  ev.stopPropagation();
                                  setTimer(suppEx.rest);
                                }}
                                className="mt-2 w-full rounded-md text-[11px] font-semibold cursor-pointer font-[inherit]"
                                style={{
                                  padding: 7,
                                  background: "#14b8a618",
                                  border: "1px solid #14b8a633",
                                  color: "#14b8a6",
                                }}
                              >
                                {"\u23F1"} Start {suppEx.rest}s Rest
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  } else {
                    // Core supplement card
                    const regionColors: Record<string, string> = {
                      "Upper Abs": "#f59e0b",
                      "Lower Abs": "#ec4899",
                      Obliques: "#a78bfa",
                    };
                    const regionColor =
                      regionColors[supp.region || ""] || "#f97316";
                    return (
                      <div
                        key={`supp-${supp.name}`}
                        className="mx-1 my-0.5 rounded-lg overflow-hidden"
                        style={{
                          border: "1px dashed #f9731633",
                          background:
                            "linear-gradient(135deg, #f9731608 0%, #f9731603 100%)",
                        }}
                      >
                        <div
                          style={{
                            height: 3,
                            background: `linear-gradient(90deg, ${regionColor}, ${regionColor}66)`,
                          }}
                        />
                        <div
                          onClick={() => toggleEx(suppExpKey)}
                          className="cursor-pointer flex items-center gap-1.5"
                          style={{ padding: "8px 10px" }}
                        >
                          <span
                            className="inline-flex items-center justify-center rounded-full text-[8px] font-extrabold shrink-0"
                            style={{
                              minWidth: 20,
                              height: 20,
                              padding: "0 4px",
                              background: "#f9731622",
                              border: "1px solid #f9731644",
                              color: "#f97316",
                            }}
                          >
                            {groupLabel}
                          </span>
                          <span
                            className="text-[8px] font-bold uppercase tracking-wider shrink-0 rounded-lg"
                            style={{
                              padding: "2px 6px",
                              background: regionColor + "22",
                              border: `1px solid ${regionColor}44`,
                              color: regionColor,
                            }}
                          >
                            {supp.region || "Core"}
                          </span>
                          <span className="font-semibold text-xs text-text flex-1">
                            {supp.name}
                          </span>
                          <span className="text-[10px] text-text-dim">
                            {suppSets[0]}&times;{suppSets[1]}
                          </span>
                          <span
                            className="text-[9px] ml-1"
                            style={{ color: "#f97316" }}
                          >
                            {suppIsExp ? "\u25B2" : "\u25BC"}
                          </span>
                        </div>
                        {suppIsExp && (
                          <div
                            className="text-[11px] leading-relaxed"
                            style={{ padding: "0 10px 10px" }}
                          >
                            <div className="mb-1.5">
                              <span
                                className="font-bold text-[10px]"
                                style={{ color: "#f97316" }}
                              >
                                {"\uD83D\uDCCD"} Setup:{" "}
                              </span>
                              <span className="text-text-dim">
                                {suppEx.setup}
                              </span>
                            </div>
                            <div className="mb-1.5">
                              <span className="font-bold text-[10px] text-safe">
                                {"\uD83D\uDD04"} Execute:{" "}
                              </span>
                              <span className="text-text-dim">
                                {suppEx.execution}
                              </span>
                            </div>
                            <div>
                              <span
                                className="font-bold text-[10px]"
                                style={{ color: "#f97316" }}
                              >
                                {"\uD83D\uDEE1\uFE0F"} Safety:{" "}
                              </span>
                              <span className="text-text-dim">
                                {suppEx.nwbCues}
                              </span>
                            </div>
                            {suppEx.rest > 0 && (
                              <button
                                onClick={(ev) => {
                                  ev.stopPropagation();
                                  setTimer(suppEx.rest);
                                }}
                                className="mt-2 w-full rounded-md text-[11px] font-semibold cursor-pointer font-[inherit]"
                                style={{
                                  padding: 7,
                                  background: "#f9731618",
                                  border: "1px solid #f9731633",
                                  color: "#f97316",
                                }}
                              >
                                {"\u23F1"} Start {suppEx.rest}s Rest
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  }
                })}
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
            className="mt-3 rounded-lg"
            style={{
              padding: 10,
              paddingTop: 10,
              borderTop: "1px dashed #334155",
              background: "#0d131f",
              border: "1px solid var(--color-border)",
            }}
          >
            <div className="text-xs font-bold text-warning mb-2 tracking-wide">
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
        <div className="text-center mb-4">
          <div className="text-[11px] text-text-muted uppercase tracking-widest">
            {isToday ? "Today \u2014 " : ""}
            {DAY_NAMES[selectedDay]}
          </div>
          <div
            className="text-[22px] font-extrabold mt-1"
            style={{ color: selSched.c }}
          >
            {selSched.i} {selSched.t}
          </div>
        </div>

        {/* Day picker grid */}
        <div className="grid grid-cols-7 gap-[3px] mb-4">
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
                className="rounded-[7px] text-center cursor-pointer"
                style={{
                  padding: "7px 3px",
                  background: isSel
                    ? dayWorkout.c + "22"
                    : "var(--color-card)",
                  border: `1px solid ${isSel ? dayWorkout.c : isReal ? dayWorkout.c + "44" : "var(--color-border)66"}`,
                }}
              >
                <div
                  className="text-[9px] font-bold uppercase"
                  style={{
                    color: isSel ? dayWorkout.c : "var(--color-text-muted)",
                  }}
                >
                  {isReal ? "\u2022 " + d : d}
                </div>
                <div className="text-sm my-0.5">{dayWorkout.i}</div>
                <div
                  className="text-[8px] font-semibold"
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

  function renderWorkoutsTab() {
    return (
      <div>
        {[
          "Push A",
          "Push B",
          "Pull A",
          "Pull B",
          "Legs A",
          "Legs B",
          "Recovery",
        ].map((k) => (
          <div key={k}>{renderWorkout(k)}</div>
        ))}
      </div>
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
          upper-body cardio is non-negotiable.
        </Callout>

        <Section
          title="Tier 1 \u2014 Highest Output"
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
              nwbfit.vercel.app
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
      content = renderWorkoutsTab();
      break;
    case 2:
      content = renderCardioTab();
      break;
    case 3:
      content = renderCoreTab();
      break;
    case 4:
      content = renderEquipTab();
      break;
    case 5:
      content = renderSafetyTab();
      break;
  }

  const todayColor = getWorkoutForDay(selectedDay).c;

  // ===== MAIN LAYOUT =====
  return (
    <div className="app-container max-w-[600px] mx-auto px-2.5 pb-20 min-h-screen bg-bg">
      {/* Header */}
      <div className="pt-6 pb-4 text-center">
        <div className="flex items-center justify-center gap-2">
          <h1 className="text-[22px] font-extrabold tracking-tight text-text">
            Femur Fracture Fitness
          </h1>
          {/* Header icons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setAboutOpen(true)}
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
        <div className="text-[11px] text-text-muted mt-1">
          NWB-Adjusted PPL &bull; Left Femur Stress Fracture &bull; 6 Weeks
        </div>
      </div>

      {/* Progress clock */}
      <ProgressClock />

      {/* Phase selector */}
      <div className="flex gap-1 mb-3">
        {PHASES.map((p, i) => (
          <div
            key={i}
            onClick={() => setPhase(i)}
            className="flex-1 rounded-lg text-center cursor-pointer transition-all duration-200"
            style={{
              padding: "8px 4px",
              background: phase === i ? p.color + "22" : "var(--color-card)",
              border: `2px solid ${phase === i ? p.color : "var(--color-border)"}`,
            }}
          >
            <div
              className="text-[10px] font-extrabold"
              style={{ color: p.color }}
            >
              WK {p.weeks}
            </div>
            <div
              className="text-[9px] mt-0.5"
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
      <div className="flex gap-0.5 mb-4 overflow-x-auto pb-1">
        {TABS.map((t, i) => {
          const isTodayTab = i === 0;
          const activeColor = isTodayTab ? todayColor : "var(--color-accent)";
          const isActive = tab === i;
          return (
            <button
              key={t}
              title={TAB_TIPS[i]}
              onClick={() => setTab(i)}
              className="flex-1 min-w-[60px] rounded-lg text-[11px] font-semibold cursor-pointer font-[inherit]"
              style={{
                padding: "10px 4px",
                background: isActive ? activeColor + "22" : "none",
                border: `1px solid ${isActive ? activeColor : "var(--color-border)"}`,
                color: isActive ? activeColor : "var(--color-text-muted)",
              }}
            >
              {t}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {content}

      {/* Footer links */}
      <div className="mt-3 flex justify-center gap-3.5 items-center">
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
          href="https://nwb-yoga.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="text-text-muted"
          title="NWB Yoga \u2014 Companion App"
        >
          <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="4.5" r="2.5" />
            <path
              d="M12 1.5c-2.5 0-4.5 1.5-5 3.5 0 .3.2.5.5.4C8.5 5 10.2 4.5 12 4.5s3.5.5 4.5.9c.3.1.5-.1.5-.4-.5-2-2.5-3.5-5-3.5z"
              opacity="0.6"
            />
            <path d="M10.5 7.5h3v4.5h-3z" />
            <path d="M10.5 9L7 12h2l1.5-2zM13.5 9L17 12h-2l-1.5-2z" />
            <path d="M5.5 17c0-2.8 2.9-5 6.5-5s6.5 2.2 6.5 5c0 1.5-1 2.8-2.5 3.5-1.2-.8-2.5-1.2-4-1.2s-2.8.4-4 1.2C6.5 19.8 5.5 18.5 5.5 17z" />
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
          className="fixed inset-0 z-[300] flex items-center justify-center p-3"
          style={{ background: "rgba(0,0,0,0.85)" }}
          onClick={() => setAboutOpen(false)}
        >
          <div
            className="rounded-2xl w-full max-w-md overflow-y-auto max-h-[90vh]"
            style={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-extrabold text-text">About</h2>
                <button
                  onClick={() => setAboutOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted cursor-pointer"
                  style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)" }}
                >
                  &times;
                </button>
              </div>
              <div className="text-[13px] leading-relaxed text-text-dim space-y-3">
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
                <p className="text-text-muted text-[11px]">
                  <a
                    href="https://github.com/karlmarx/nwb-plan"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent"
                  >
                    Source on GitHub
                  </a>
                  {" "}&bull;{" "}
                  <a
                    href="https://nwb-yoga.vercel.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent"
                  >
                    NWB Yoga Companion
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Diagram modal */}
      {diagramOpen && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center p-3"
          style={{ background: "rgba(0,0,0,0.85)" }}
          onClick={() => setDiagramOpen(null)}
        >
          <div
            className="rounded-2xl w-full max-w-[760px] max-h-[92vh] overflow-y-auto"
            style={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-extrabold text-text capitalize">
                  {diagramOpen} Diagram
                </h2>
                <button
                  onClick={() => setDiagramOpen(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted cursor-pointer"
                  style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)" }}
                >
                  &times;
                </button>
              </div>
              <div className="text-center text-text-dim text-sm py-8">
                Diagram coming soon
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
