import { useState } from 'react';
import { C } from './theme';
import { loadState, saveState, initSchema } from './utils/storage';
import { EX } from './data/exercises';
import { SCHED, PHASES } from './data/program';
import ProgramClock from './components/ProgramClock';
import RestTimer from './components/RestTimer';
import DiagramModal from './components/DiagramModal';
import TodayTab from './components/TodayTab';
import WorkoutsTab from './components/WorkoutsTab';
import CardioTab from './components/CardioTab';
import CoreTab from './components/CoreTab';
import EquipmentTab from './components/EquipmentTab';
import SafetyTab from './components/SafetyTab';

initSchema();

const DEFAULT_HEVY_IDS = {
  'Push A': 'T2lMXhz4NFS',
  'Push B': 'j0XrGQzMyF1',
  'Pull A': 'c91UqmMdwz7',
  'Pull B': 'J1rggKx4PIk',
  'Legs A': 'FKCWOPCUE4H',
  'Legs B': 's5QsLGXsVAy',
};

const TABS = ['Today', 'Workouts', 'Cardio', 'Core', 'Equip', 'Safety'];
const TAB_TIPS = [
  "Today's scheduled workout",
  'All push/pull/legs exercises',
  'NWB cardio options',
  'Core & ab routines',
  'Toggle available equipment',
  'Injury cues & safety rules',
];

export default function App() {
  const [tab, setTab] = useState(0);
  const [phase, setPhase] = useState(() => loadState('nwb_phase', 0));
  const [openSections, setOpenSections] = useState(() => {
    const sd = loadState('nwb_startDay', 0);
    const rt = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
    const rotIdx = (rt - sd + 7) % 7;
    const init = {};
    init[SCHED[rotIdx].t] = true;
    return init;
  });
  const [expandedEx, setExpandedEx] = useState({});
  const [equipment, setEquipment] = useState(() => loadState('nwb_equipment', {}));
  const [timer, setTimer] = useState(null);
  const [diagramOpen, setDiagramOpen] = useState(null);
  const [swaps, setSwaps] = useState(() => loadState('nwb_swaps', {}));
  const [hevyIds, setHevyIds] = useState(() => loadState('nwb_hevy', DEFAULT_HEVY_IDS));
  const [startDay, setStartDay] = useState(() => loadState('nwb_startDay', 0));
  const [supplementToggles, setSupplementToggles] = useState(() =>
    loadState('nwb_supplements', { leftLeg: true, core: true })
  );
  const [variantSelections, setVariantSelections] = useState(() =>
    loadState('nwb_variants', {})
  );
  const [coreFilter, setCoreFilter] = useState('all');

  const realToday = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
  const [selectedDay, setSelectedDay] = useState(realToday);

  // Persist state
  const setPhaseP = (v) => { setPhase(v); saveState('nwb_phase', v); };
  const setEquipmentP = (fn) => {
    setEquipment((prev) => {
      const next = typeof fn === 'function' ? fn(prev) : fn;
      saveState('nwb_equipment', next);
      return next;
    });
  };
  const setStartDayP = (v) => { setStartDay(v); saveState('nwb_startDay', v); };
  const setSupplementTogglesP = (fn) => {
    setSupplementToggles((prev) => {
      const next = typeof fn === 'function' ? fn(prev) : fn;
      saveState('nwb_supplements', next);
      return next;
    });
  };
  const setVariantSelectionsP = (fn) => {
    setVariantSelections((prev) => {
      const next = typeof fn === 'function' ? fn(prev) : fn;
      saveState('nwb_variants', next);
      return next;
    });
  };
  const setSwapsP = (fn) => {
    setSwaps((prev) => {
      const next = typeof fn === 'function' ? fn(prev) : fn;
      saveState('nwb_swaps', next);
      return next;
    });
  };

  function toggleSection(t) {
    setOpenSections((s) => Object.assign({}, s, { [t]: !s[t] }));
  }

  function toggleEx(n) {
    setExpandedEx((s) => Object.assign({}, s, { [n]: !s[n] }));
  }

  function toggleSupplement(key) {
    setSupplementTogglesP((prev) => Object.assign({}, prev, { [key]: !prev[key] }));
  }

  function handleSwap(workoutKey, origName, newName) {
    if (newName && newName.startsWith('__timer__')) {
      setTimer(parseInt(newName.replace('__timer__', '')));
      return;
    }
    const key = workoutKey + ':' + origName;
    if (newName === null) {
      setSwapsP((s) => {
        const n = Object.assign({}, s);
        delete n[key];
        return n;
      });
    } else {
      setSwapsP((s) => Object.assign({}, s, { [key]: newName }));
    }
  }

  function handleVariantChange(exName, vid) {
    setVariantSelectionsP((prev) => Object.assign({}, prev, { [exName]: vid }));
  }

  function getWorkoutForDay(dayIdx) {
    const rotationIdx = (dayIdx - startDay + 7) % 7;
    return SCHED[rotationIdx];
  }

  const todayColor = getWorkoutForDay(selectedDay).c;

  const isAvailable = (exName, ex) => {
    if (!ex) return true;
    return ex.requires.every((r) => equipment[r] !== false);
  };

  const sharedProps = {
    phase,
    openSections,
    onToggleSection: toggleSection,
    expandedEx,
    onToggleEx: toggleEx,
    equipment,
    swaps,
    onSwap: handleSwap,
    onDiagram: setDiagramOpen,
    supplementToggles,
    onToggleSupplement: toggleSupplement,
    variantSelections,
    onVariantChange: handleVariantChange,
    onTimer: setTimer,
  };

  let content;
  switch (tab) {
    case 0:
      content = (
        <TodayTab
          {...sharedProps}
          realToday={realToday}
          selectedDay={selectedDay}
          setSelectedDay={setSelectedDay}
          startDay={startDay}
        />
      );
      break;
    case 1:
      content = (
        <WorkoutsTab
          {...sharedProps}
          hevyIds={hevyIds}
        />
      );
      break;
    case 2:
      content = (
        <CardioTab
          {...sharedProps}
          isAvailable={(name) => isAvailable(name, EX[name])}
        />
      );
      break;
    case 3:
      content = (
        <CoreTab
          {...sharedProps}
          coreFilter={coreFilter}
          setCoreFilter={setCoreFilter}
        />
      );
      break;
    case 4:
      content = (
        <EquipmentTab
          equipment={equipment}
          setEquipment={setEquipmentP}
          startDay={startDay}
          setStartDay={setStartDayP}
          openSections={openSections}
          onToggleSection={toggleSection}
        />
      );
      break;
    case 5:
      content = (
        <SafetyTab
          openSections={openSections}
          onToggleSection={toggleSection}
        />
      );
      break;
    default:
      content = null;
  }

  return (
    <div
      style={{
        maxWidth: 500,
        margin: '0 auto',
        padding: '0 10px 80px',
        minHeight: '100vh',
        background: C.bg,
      }}
    >
      {/* Header */}
      <div style={{ padding: '24px 0 16px', textAlign: 'center' }}>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: '-0.5px',
            color: C.white,
          }}
        >
          Femur Fracture Fitness
        </h1>
        <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>
          NWB-Adjusted PPL • Left Femur Stress Fracture • 6 Weeks
        </div>
      </div>

      {/* Program Clock */}
      <ProgramClock />

      {/* Phase selector */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
        {PHASES.map((p, i) => (
          <div
            key={i}
            onClick={() => setPhaseP(i)}
            style={{
              flex: 1,
              padding: '8px 4px',
              borderRadius: 8,
              background: phase === i ? p.color + '22' : C.card,
              border: '2px solid ' + (phase === i ? p.color : C.border),
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ fontSize: 10, fontWeight: 800, color: p.color }}>WK {p.weeks}</div>
            <div style={{ fontSize: 9, color: phase === i ? C.text : C.textMuted, marginTop: 2 }}>
              {p.name}
            </div>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div
        style={{
          display: 'flex',
          gap: 2,
          marginBottom: 16,
          overflowX: 'auto',
          paddingBottom: 4,
        }}
      >
        {TABS.map((t, i) => {
          const isTodayTab = i === 0;
          const activeColor = isTodayTab ? todayColor : C.accent;
          return (
            <button
              key={t}
              title={TAB_TIPS[i]}
              onClick={() => setTab(i)}
              style={{
                flex: 1,
                minWidth: 60,
                padding: '10px 4px',
                background: tab === i ? activeColor + '22' : 'none',
                border: '1px solid ' + (tab === i ? activeColor : C.border),
                color: tab === i ? activeColor : C.textMuted,
                borderRadius: 8,
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {t}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {content}

      {/* Medical disclaimer */}
      <div
        style={{
          marginTop: 20,
          padding: 12,
          borderRadius: 10,
          background: C.dangerBg,
          border: '1px solid ' + C.dangerBorder,
          fontSize: 11,
          textAlign: 'center',
          color: C.danger,
        }}
      >
        <b>Medical Disclaimer: </b>Confirm all exercises with your PT/Orthopedic Surgeon. Groin
        pain = Absolute Stop.
      </div>

      {/* Footer links */}
      <div
        style={{
          marginTop: 12,
          display: 'flex',
          justifyContent: 'center',
          gap: 14,
          alignItems: 'center',
        }}
      >
        <a
          href="https://github.com/karlmarx/nwb-plan"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: C.textMuted }}
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
          style={{ color: C.textMuted }}
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
          style={{ color: C.textMuted }}
          title="NWB Yoga — Companion App"
        >
          <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,20 C11,14 10,8 12,3 C14,8 13,14 12,20Z M12,20 C9,15 7,10 9,5 C12,9 12,14 12,20Z M12,20 C15,15 17,10 15,5 C12,9 12,14 12,20Z M12,20 C8,16 5,12 6,7 C9,11 11,15 12,20Z M12,20 C16,16 19,12 18,7 C15,11 13,15 12,20Z" />
          </svg>
        </a>
      </div>

      {/* Rest Timer */}
      {timer && <RestTimer seconds={timer} onClose={() => setTimer(null)} />}

      {/* Diagram Modal */}
      {diagramOpen && (
        <DiagramModal diagramKey={diagramOpen} onClose={() => setDiagramOpen(null)} />
      )}
    </div>
  );
}
