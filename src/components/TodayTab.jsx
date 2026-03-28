import { C } from '../theme';
import { SCHED } from '../data/program';
import Section from './Section';
import Callout from './Callout';
import WorkoutView from './WorkoutView';
import NutritionSection from './NutritionSection';

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_ABBR = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function TodayTab({
  phase,
  realToday,
  selectedDay,
  setSelectedDay,
  startDay,
  openSections,
  onToggleSection,
  expandedEx,
  onToggleEx,
  equipment,
  swaps,
  onSwap,
  onDiagram,
  supplementToggles,
  onToggleSupplement,
  variantSelections,
  onVariantChange,
  onTimer,
}) {
  function getWorkoutForDay(dayIdx) {
    const rotationIdx = (dayIdx - startDay + 7) % 7;
    return SCHED[rotationIdx];
  }

  const selSched = getWorkoutForDay(selectedDay);
  const isToday2 = selectedDay === realToday;

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <div
          style={{
            fontSize: 11,
            color: C.textMuted,
            textTransform: 'uppercase',
            letterSpacing: 1,
          }}
        >
          {(isToday2 ? 'Today — ' : '') + DAY_NAMES[selectedDay]}
        </div>
        <div
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: selSched.c,
            marginTop: 4,
          }}
        >
          {selSched.i} {selSched.t}
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7,1fr)',
          gap: 3,
          marginBottom: 16,
        }}
      >
        {DAY_ABBR.map((d, i) => {
          const dayWorkout = getWorkoutForDay(i);
          const isSel = i === selectedDay;
          const isReal = i === realToday;
          return (
            <div
              key={'day-' + i}
              onClick={() => {
                setSelectedDay(i);
                if (!openSections[dayWorkout.t]) onToggleSection(dayWorkout.t);
              }}
              style={{
                padding: '7px 3px',
                borderRadius: 7,
                background: isSel ? dayWorkout.c + '22' : C.card,
                border:
                  '1px solid ' +
                  (isSel ? dayWorkout.c : isReal ? dayWorkout.c + '44' : C.border + '66'),
                textAlign: 'center',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: isSel ? dayWorkout.c : C.textMuted,
                  textTransform: 'uppercase',
                }}
              >
                {isReal ? '• ' + d : d}
              </div>
              <div style={{ fontSize: 14, margin: '2px 0' }}>{dayWorkout.i}</div>
              <div
                style={{
                  fontSize: 8,
                  color: isSel ? C.text : C.textMuted,
                  fontWeight: 600,
                }}
              >
                {dayWorkout.t}
              </div>
            </div>
          );
        })}
      </div>

      <WorkoutView
        workoutKey={selSched.t}
        phase={phase}
        isOpen={!!openSections[selSched.t]}
        onToggle={() => onToggleSection(selSched.t)}
        hevyIds={{}}
        expandedEx={expandedEx}
        onToggleEx={onToggleEx}
        equipment={equipment}
        swaps={swaps}
        onSwap={onSwap}
        onDiagram={onDiagram}
        supplementToggles={supplementToggles}
        onToggleSupplement={onToggleSupplement}
        variantSelections={variantSelections}
        onVariantChange={onVariantChange}
        onTimer={onTimer}
      />

      <NutritionSection
        isOpen={!!openSections['nutrition-daily']}
        onToggle={() => onToggleSection('nutrition-daily')}
      />

      <Section
        title="Cross-Education Protocol"
        icon="🧠"
        isOpen={!!openSections['cross-ed']}
        onToggle={() => onToggleSection('cross-ed')}
      >
        <Callout type="info">
          Manca et al. meta-analysis: 11.9% strength gains in untrained limb. Eccentric-focused
          work → 17.7% crossover.
        </Callout>
        <div style={{ fontSize: 12, color: C.textDim, lineHeight: 1.7 }}>
          {[
            'Intensity: ≥80% 1RM (Weeks 3+)',
            'Tempo: 4-second eccentric on leg exercises',
            'Rest: 2+ minutes between heavy sets',
            'ROM: <90° hip flexion (protects left hip)',
            'Mental focus on injured limb during right-leg training',
          ].map((r, i) => (
            <p key={'r-' + i}>• {r}</p>
          ))}
        </div>
      </Section>
    </div>
  );
}
