import React from 'react';
import { EX } from '../data/exercises';
import Callout from './Callout';
import Section from './Section';
import ExerciseCard from './ExerciseCard';
import { C } from '../theme';

export default function CardioTab({ 
  phase, 
  openSections, 
  onToggleSection, 
  expandedEx, 
  onToggleEx, 
  onTimer, 
  onDiagram, 
  isAvailable, 
  equipment 
}) {
  const cardioExercises = Object.keys(EX).filter((k) => EX[k].category === 'cardio');
  const tier1 = cardioExercises.filter((k) => EX[k].tier === 1);

  return (
    <div>
      <Callout type="warning">
        VO2 max drops ~15% in just 2 weeks of inactivity. Aggressive upper-body cardio is non-negotiable.
      </Callout>
      
      <Section 
        title="Tier 1 — Highest Output" 
        icon="🔥" 
        isOpen={!!openSections['cardio-t1']} 
        onToggle={() => onToggleSection('cardio-t1')}
      >
        {tier1.map((k) => (
          <ExerciseCard
            key={k}
            name={k}
            ex={EX[k]}
            phase={phase}
            isExpanded={!!expandedEx[k]}
            onToggle={() => onToggleEx(k)}
            onSwap={(sw) => {
              if (sw.startsWith('__timer__')) onTimer(parseInt(sw.replace('__timer__', '')));
            }}
            onDiagram={onDiagram}
            unavailable={!isAvailable(k)}
            equipment={equipment}
          />
        ))}
      </Section>

      <Section 
        title="Weekly Cardio Schedule" 
        icon="📆" 
        isOpen={!!openSections['cardio-sched']} 
        onToggle={() => onToggleSection('cardio-sched')}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid ' + C.accent + '44' }}>
                {['Day', 'AM', 'PM', '~Cal'].map((h) => (
                  <th key={h} style={{ padding: '6px', textAlign: 'left', color: C.accent, fontSize: 10, fontWeight: 700 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['Mon', '—', 'SkiErg HIIT 25m', '~300'],
                ['Tue', 'Arm Ergo 30m', 'Battle Ropes 15m', '~400'],
                ['Wed', 'SkiErg Intervals', '—', '~350'],
                ['Thu', 'Boxing 20m', 'SkiErg Steady 25m', '~450'],
                ['Fri', 'Arm Ergo HIIT', 'Ropes Tabata', '~400'],
                ['Sat', 'SkiErg Long 40m', 'Boxing 15m', '~500'],
                ['Sun', 'Light Arm Ergo 20m', '—', '~100']
              ].map((row, i) => (
                <tr key={'cr-' + i} style={{ borderBottom: '1px solid ' + C.border }}>
                  {row.map((cell, j) => (
                    <td key={'cc-' + j} style={{ padding: '6px', color: j === 0 ? C.text : C.textDim, fontWeight: j === 0 ? 600 : 400 }}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 10, fontSize: 11, color: C.textMuted }}>
          Estimated weekly total: ~2,500 cal from cardio alone
        </div>
      </Section>

      <Section 
        title="Cardio Protocols" 
        icon="📋" 
        isOpen={!!openSections['cardio-proto']} 
        onToggle={() => onToggleSection('cardio-proto')}
      >
        <div style={{ fontSize: 12, color: C.textDim, lineHeight: 1.7 }}>
          <p style={{ fontWeight: 700, color: C.accent, marginBottom: 4 }}>SkiErg 4-3-2-1 Descending Intervals (20 min)</p>
          <p>4 min moderate → 3 min hard → 2 min very hard → 1 min ALL OUT → 2 min rest → repeat in reverse (1-2-3-4)</p>
          <p style={{ fontWeight: 700, color: C.accent, marginTop: 12, marginBottom: 4 }}>Battle Ropes Tabata (12 min)</p>
          <p>3 rounds of classic Tabata: 20s max effort alternating waves / 10s rest × 8 = 4 min. 1 min rest between rounds.</p>
          <p style={{ fontWeight: 700, color: C.accent, marginTop: 12, marginBottom: 4 }}>Slider Row HIIT</p>
          <p>10-20 rounds of 200m sprints. 30s rest between. Right leg drives, left leg glides on furniture slider.</p>
        </div>
      </Section>
    </div>
  );
}
