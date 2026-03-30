import { C } from '../theme';
import { EX } from '../data/exercises';
import { EQUIPMENT } from '../data/equipment';
import Callout from './Callout';
import Section from './Section';
import ExerciseCard from './ExerciseCard';

function RemovedRow({ name, reason }) {
  return (
    <div
      style={{
        padding: '8px 11px',
        marginBottom: 4,
        borderRadius: 8,
        background: C.dangerBg,
        border: '1px solid ' + C.dangerBorder,
        opacity: 0.7,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <span
          style={{
            textDecoration: 'line-through',
            color: C.danger,
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {name}
        </span>
        <span
          style={{
            fontSize: 10,
            padding: '1px 5px',
            borderRadius: 4,
            background: C.dangerBg,
            border: '1px solid ' + C.danger,
            color: C.danger,
            fontWeight: 700,
          }}
        >
          REMOVED
        </span>
      </div>
      <div style={{ fontSize: 11, color: C.danger, marginTop: 2 }}>⚠ {reason}</div>
    </div>
  );
}

const CORE_BLOCKS = [
  {
    key: 'core-antiext',
    title: 'Block 1: Anti-Extension',
    icon: '💀',
    accent: C.danger,
    exercises: [
      'Forearm Plank Saw',
      'Plank Knee Tuck (R only)',
      'Wheelbarrow Hold',
      'Spiderman Plank (R only)',
      'Slow Mountain Climber (R)',
      'Dead Bug (R Leg Only)',
      'Hollow Body Hold',
      'Body Saw (Sliders)',
    ],
  },
  {
    key: 'core-antirot',
    title: 'Block 2: Anti-Rotation',
    icon: '🔄',
    accent: C.accent,
    exercises: ['Pallof Press (Seated)', 'Pallof Overhead Reach', 'Bird-Dog (Prone Bench)'],
  },
  {
    key: 'core-antilat',
    title: 'Block 3: Anti-Lateral-Flexion',
    icon: '↔️',
    accent: C.warning,
    exercises: [
      'Side Plank (R Side Down)',
      'Side Plank (L Oblique Bias — R Side Down)',
      'Suitcase Hold (Seated)',
    ],
  },
  {
    key: 'core-rotation',
    title: 'Block 4: Rotation + Integrated',
    icon: '🌀',
    accent: '#a78bfa',
    exercises: [
      'Russian Twist (Seated Bench)',
      'Cable Woodchop (Seated)',
      'Bicycle Crunch (R Leg Only)',
      'Stir the Pot',
      'McGill Curl-Up',
    ],
  },
  {
    key: 'core-trx',
    title: 'Block 5: TRX Core',
    icon: '🪢',
    accent: '#06b6d4',
    exercises: [
      'TRX Pallof Press',
      'TRX Standing Rollout',
      'TRX Single-Arm Row',
      'TRX Kneeling Rollout',
      'TRX Kneeling Chop',
      'TRX Body Saw',
      'TRX Side Plank',
    ],
  },
  {
    key: 'core-armbalance',
    title: 'Block 6: Arm Balance Prep',
    icon: '🤸',
    accent: '#f472b6',
    exercises: [
      'TRX Knee Tuck (Fig-4 Hook)',
      'TRX Body Saw (Fig-4 Hook)',
      'L-Sit Knee Tuck',
      'L-Sit Hold (R Leg Extended)',
      'Tuck Planche Lean',
      'Support Hold + Protraction Pulses',
    ],
  },
  {
    key: 'core-supineoblique',
    title: 'Block 7: Supine Oblique',
    icon: '🔃',
    accent: '#facc15',
    exercises: [
      'Cross-Body Reach',
      'Supine Side Bend (Heel Slide)',
      'Right Knee Drop + Oblique Return',
      'Dead Bug — Right Side Only',
    ],
  },
];

export default function CoreTab({
  phase,
  openSections,
  onToggleSection,
  expandedEx,
  onToggleEx,
  onTimer,
  onDiagram,
  equipment,
  coreFilter,
  setCoreFilter,
}) {
  // Build equipment filter keys from all core exercises
  const coreEquipSet = {};
  CORE_BLOCKS.forEach((b) => {
    b.exercises.forEach((name) => {
      const ex = EX[name];
      if (ex) ex.requires.forEach((r) => { if (r !== 'mat') coreEquipSet[r] = true; });
    });
  });
  const coreEquipKeys = Object.keys(coreEquipSet);

  const coreFilterFn = (name) => {
    if (coreFilter === 'all') return true;
    const ex = EX[name];
    if (!ex) return false;
    if (coreFilter === 'floor')
      return ex.requires.length === 0 || ex.requires.every((r) => r === 'mat');
    return ex.requires.indexOf(coreFilter) >= 0;
  };

  let coreFilterCount = 0;
  CORE_BLOCKS.forEach((b) => {
    b.exercises.forEach((n) => { if (coreFilterFn(n)) coreFilterCount++; });
  });

  const isAvailable = (name) => {
    const ex = EX[name];
    if (!ex) return true;
    return ex.requires.every((r) => equipment[r] !== false);
  };

  return (
    <div>
      <Callout type="danger">
        ZERO active left hip flexion. Protects femoral neck stress fracture. Left leg passive in
        ALL exercises.
      </Callout>
      <Callout type="info">
        Slow tempo protocol: 4-count movements, time-based sets, continuous tension. BASE → AMP 1
        → AMP 2. Target muscle failure in the final 10-15 seconds of each set. If you finish the
        set comfortably, move up an amp level.
      </Callout>

      {/* Equipment filter */}
      <div style={{ marginBottom: 12 }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: C.textMuted,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: 6,
          }}
        >
          Filter by equipment —{' '}
          {coreFilter === 'all' ? 'showing all' : coreFilterCount + ' matching'}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          <button
            onClick={() => setCoreFilter('all')}
            style={{
              fontSize: 10,
              padding: '5px 10px',
              borderRadius: 10,
              background: coreFilter === 'all' ? C.accent + '22' : 'transparent',
              border: '1px solid ' + (coreFilter === 'all' ? C.accent : C.border),
              color: coreFilter === 'all' ? C.accent : C.textMuted,
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontWeight: coreFilter === 'all' ? 700 : 400,
            }}
          >
            All
          </button>
          <button
            onClick={() => setCoreFilter('floor')}
            style={{
              fontSize: 10,
              padding: '5px 10px',
              borderRadius: 10,
              background: coreFilter === 'floor' ? '#10b98122' : 'transparent',
              border: '1px solid ' + (coreFilter === 'floor' ? '#10b981' : C.border),
              color: coreFilter === 'floor' ? '#10b981' : C.textMuted,
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontWeight: coreFilter === 'floor' ? 700 : 400,
            }}
          >
            🧘 Floor / Mat Only
          </button>
          {coreEquipKeys.map((eqKey) => {
            const eq = EQUIPMENT[eqKey];
            const isSel = coreFilter === eqKey;
            return (
              <button
                key={eqKey}
                onClick={() => setCoreFilter(isSel ? 'all' : eqKey)}
                style={{
                  fontSize: 10,
                  padding: '5px 10px',
                  borderRadius: 10,
                  background: isSel ? C.accent + '22' : 'transparent',
                  border: '1px solid ' + (isSel ? C.accent : C.border),
                  color: isSel ? C.accent : C.textMuted,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontWeight: isSel ? 700 : 400,
                }}
              >
                {eq ? eq.icon + ' ' : ''}
                {eq ? eq.name : eqKey}
              </button>
            );
          })}
        </div>
      </div>

      {CORE_BLOCKS.map((block) => {
        const filtered = block.exercises.filter(coreFilterFn);
        if (coreFilter !== 'all' && filtered.length === 0) return null;
        return (
          <Section
            key={block.key}
            title={block.title}
            icon={block.icon}
            isOpen={!!openSections[block.key]}
            onToggle={() => onToggleSection(block.key)}
            count={filtered.length}
            accent={block.accent}
          >
            {filtered.map((name) => {
              const ex = EX[name];
              return (
                <ExerciseCard
                  key={name}
                  name={name}
                  ex={ex}
                  phase={phase}
                  isExpanded={!!expandedEx[name]}
                  onToggle={() => onToggleEx(name)}
                  onSwap={(sw) => {
                    if (sw.startsWith('__timer__'))
                      onTimer(parseInt(sw.replace('__timer__', '')));
                  }}
                  onDiagram={onDiagram}
                  unavailable={!ex || (ex.requires || []).some((r) => equipment[r] === false)}
                  equipment={equipment}
                />
              );
            })}
          </Section>
        );
      })}

      <Section
        title="Removed Exercises"
        icon="🚫"
        isOpen={!!openSections['danger-core']}
        onToggle={() => onToggleSection('danger-core')}
      >
        <RemovedRow
          name="Active Straight Leg Raises"
          reason="Hip flexor contraction compresses femoral neck stress fracture. NEVER do these."
        />
        <RemovedRow
          name="Hanging Leg Raises"
          reason="Deep hip flexion + massive hip flexor force = fracture danger."
        />
        <RemovedRow
          name="Standard Navasana / V-Ups / Tuck-Ups"
          reason="Bilateral hip flexor activation. Use Modified Navasana (parallette press) instead."
        />
        <RemovedRow
          name="Standard Bird-Dog (quadruped)"
          reason="Left knee at 90° hip flexion approaches FAI limit + loads femoral neck. Use Prone Bench version instead. Quadruped needs PT clearance."
        />
        <RemovedRow
          name="Both Feet in TRX Straps"
          reason="Reflexive left iliopsoas firing when both feet are suspended. Always use RIGHT foot only in TRX strap."
        />
      </Section>
    </div>
  );
}
