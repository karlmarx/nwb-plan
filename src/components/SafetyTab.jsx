import { C } from '../theme';
import Section from './Section';
import Callout from './Callout';

export default function SafetyTab({ openSections, onToggleSection }) {
  return (
    <div>
      <Section
        title="Injury Status (MRI 3/11/2026)"
        icon="🩻"
        isOpen={!!openSections['injuries']}
        onToggle={() => onToggleSection('injuries')}
      >
        {[
          {
            n: 'L Hip Stress Fracture',
            c: C.danger,
            r: 'Compression-sided medial femoral neck. Strict NWB 6+ weeks. Zero hip flexor activation on left side. This drives ALL exercise modifications.',
          },
          {
            n: 'Bilateral FAI + Labral Tears',
            c: C.warning,
            r: 'Cam-type impingement both hips. Anterosuperior labral tear. Keep hip flexion under 90°.',
          },
          {
            n: 'Bilateral Hamstring Tendinosis',
            c: C.textMuted,
            r: 'Minor — no discrete tear. Not restricting programming.',
          },
          {
            n: 'L4-L5 DDD',
            c: C.textMuted,
            r: 'Minor — not restricting programming. Good form is sufficient.',
          },
          {
            n: 'R Hip Labral Tear (mild)',
            c: C.textMuted,
            r: 'Minor — small anterosuperior tear. Not restricting programming.',
          },
        ].map((inj, i) => (
          <div
            key={'inj-' + i}
            style={{
              padding: 12,
              marginBottom: 7,
              borderRadius: 8,
              background: C.card,
              borderLeft: '3px solid ' + inj.c,
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 13, color: inj.c }}>{inj.n}</div>
            <div style={{ fontSize: 11, marginTop: 4, color: C.textDim, lineHeight: 1.6 }}>
              {inj.r}
            </div>
          </div>
        ))}
      </Section>

      <Section
        title="Absolute Stop Signals"
        icon="🚨"
        isOpen={!!openSections['stop-signals']}
        onToggle={() => onToggleSection('stop-signals')}
      >
        <Callout type="danger">Stop exercise and contact your MD immediately if:</Callout>
        {[
          'Groin pain (any side)',
          'Hip clicking or catching sensation',
          'Pain lasting >24 hours after workout',
          'Radiating leg pain or numbness',
          'Sharp pain during any exercise',
          'Swelling in hip or thigh area',
        ].map((s, i) => (
          <p key={'s-' + i} style={{ fontSize: 12, color: C.textDim, padding: '3px 0' }}>
            🔴 {s}
          </p>
        ))}
      </Section>

      <Section
        title="Pool Entry & Exit"
        icon="🏊"
        isOpen={!!openSections['pool-entry']}
        onToggle={() => onToggleSection('pool-entry')}
      >
        <Callout type="danger">
          Left leg is a passenger at all times. Arms drive every transition. Right leg assists
          but never hops or impacts.
        </Callout>

        {/* Method 1 */}
        <div
          style={{
            padding: 14,
            marginBottom: 10,
            borderRadius: 10,
            background: C.bg,
            border: '1px solid ' + C.border,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 10,
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 14, color: C.accent }}>
              Method 1: Sun Chair at Pool Edge
            </div>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: C.safe,
                background: C.safeBg,
                border: '1px solid ' + C.safeBorder,
                borderRadius: 6,
                padding: '2px 8px',
              }}
            >
              RECOMMENDED
            </span>
          </div>
          <div style={{ marginBottom: 8 }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: 11,
                color: C.text,
                marginBottom: 4,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Entry
            </div>
            <div style={{ fontSize: 12, color: C.textDim, lineHeight: 1.7 }}>
              Position heavy chair at pool edge. Sit, then lateral transfer to deck (hands press
              down). Controlled tricep-dip lower into the water. Right foot finds the wall, left
              leg hangs passively.
            </div>
          </div>
          <div>
            <div
              style={{
                fontWeight: 700,
                fontSize: 11,
                color: C.text,
                marginBottom: 4,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Exit
            </div>
            <div style={{ fontSize: 12, color: C.textDim, lineHeight: 1.7 }}>
              Hands on deck, right foot on wall. Straight-arm press up to seated on deck edge.
              Lift left leg with hands. Transfer to chair.
            </div>
          </div>
        </div>

        {/* Method 2 */}
        <div
          style={{
            padding: 14,
            marginBottom: 10,
            borderRadius: 10,
            background: C.bg,
            border: '1px solid ' + C.border,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 10,
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 14, color: C.accent }}>
              Method 2: Steps — Single Rail
            </div>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: C.danger,
                background: C.dangerBg,
                border: '1px solid ' + C.dangerBorder,
                borderRadius: 6,
                padding: '2px 8px',
              }}
            >
              HARDEST EXIT
            </span>
          </div>
          <div style={{ marginBottom: 8 }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: 11,
                color: C.text,
                marginBottom: 4,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Entry
            </div>
            <div style={{ fontSize: 12, color: C.textDim, lineHeight: 1.7 }}>
              Both hands on curved rail. Right foot steps down one step at a time. Hands walk
              down the rail. Left leg trails between steps. Buoyancy helps on lower steps.
            </div>
          </div>
          <div style={{ marginBottom: 8 }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: 11,
                color: C.text,
                marginBottom: 4,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Exit
            </div>
            <div style={{ fontSize: 12, color: C.textDim, lineHeight: 1.7 }}>
              Reverse the entry. Last 2–3 steps are hardest as buoyancy drops. Near-full
              bodyweight pull on one rail.
            </div>
          </div>
          <div
            style={{
              fontSize: 11,
              color: C.warning,
              padding: '6px 10px',
              background: C.warningBg,
              border: '1px solid ' + C.warningBorder,
              borderRadius: 6,
            }}
          >
            ⚠️ Top steps can recruit left hip flexor — stop and reset if felt. Dry hands before
            exit.
          </div>
        </div>

        {/* Method 3 */}
        <div
          style={{
            padding: 14,
            marginBottom: 10,
            borderRadius: 10,
            background: C.bg,
            border: '1px solid ' + C.border,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 10,
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 14, color: C.accent }}>
              Method 3: Wall Press — No Props
            </div>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: C.warning,
                background: C.warningBg,
                border: '1px solid ' + C.warningBorder,
                borderRadius: 6,
                padding: '2px 8px',
              }}
            >
              ANY POOL
            </span>
          </div>
          <div style={{ marginBottom: 8 }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: 11,
                color: C.text,
                marginBottom: 4,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Entry
            </div>
            <div style={{ fontSize: 12, color: C.textDim, lineHeight: 1.7 }}>
              Sit at edge (lower via right knee). Hands on deck, slow tricep-negative dip into
              water. Left leg hangs passively.
            </div>
          </div>
          <div style={{ marginBottom: 8 }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: 11,
                color: C.text,
                marginBottom: 4,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Exit
            </div>
            <div style={{ fontSize: 12, color: C.textDim, lineHeight: 1.7 }}>
              Press up from water, rotate to seated on deck. Lift left leg with hands.
              Floor-to-stand via right knee.
            </div>
          </div>
        </div>

        <div style={{ fontWeight: 700, fontSize: 13, color: C.text, marginTop: 6, marginBottom: 8 }}>
          Quick Reference
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid ' + C.accent + '44' }}>
                {['Method', 'Requires', 'Difficulty'].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: '6px',
                      textAlign: 'left',
                      color: C.accent,
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['Sun Chair', 'Heavy chair at edge', 'Easiest'],
                ['Steps + Rail', 'Pool steps with rail', 'Hard exit'],
                ['Wall Press', 'Any pool edge', 'Hardest'],
              ].map((row, i) => (
                <tr key={'pe-' + i} style={{ borderBottom: '1px solid ' + C.border }}>
                  {row.map((cell, j) => (
                    <td
                      key={'pc-' + j}
                      style={{
                        padding: '6px',
                        color: j === 0 ? C.text : C.textDim,
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

      <Section
        title="About"
        icon="ℹ️"
        isOpen={!!openSections['about']}
        onToggle={() => onToggleSection('about')}
      >
        <div style={{ fontSize: 13, color: C.textDim, lineHeight: 1.8 }}>
          This app was built by{' '}
          <a
            href="https://github.com/karlmarx"
            target="_blank"
            rel="noopener"
            style={{ color: C.accent, textDecoration: 'none' }}
          >
            me
          </a>
          , for me — to keep track of what I can actually do at the gym while recovering from a
          compression-side fracture of my left femur and a hip labrum tear.
          <br />
          <br />
          Instead of juggling fitness apps, Google searches, and YouTube videos to figure out
          which exercises are safe, I wanted one place that knows my injuries, shows me the right
          movements, and gets out of the way.
          <br />
          <br />
          <span style={{ color: C.textMuted, fontSize: 11 }}>nwbfit.vercel.app</span>
        </div>
      </Section>

      <Section
        title="Nutrition During NWB"
        icon="🍗"
        isOpen={!!openSections['nutrition']}
        onToggle={() => onToggleSection('nutrition')}
      >
        <div style={{ fontSize: 12, color: C.textDim, lineHeight: 1.7 }}>
          <p style={{ fontWeight: 700, color: C.warning, marginBottom: 6 }}>
            Do NOT cut calories. Healing demands energy.
          </p>
          <p>• Calories: 2,800-3,200 kcal/day (25-30 kcal/kg)</p>
          <p>• Protein: 130-205g/day (1.6-2.5 g/kg)</p>
          <p>• Timing: 25-35g protein every 3-4 hours (including before bed)</p>
          <p>
            • Leucine-rich sources (whey, dairy, meat) — immobilized muscles develop 'anabolic
            resistance' requiring stronger protein signal
          </p>
        </div>
      </Section>

      <Section
        title="Progressive Overload Rules"
        icon="📈"
        isOpen={!!openSections['overload']}
        onToggle={() => onToggleSection('overload')}
      >
        <div style={{ fontSize: 12, color: C.textDim, lineHeight: 1.7 }}>
          {[
            {
              t: 'Load Progression',
              d: 'Add 2.5kg when all reps/sets hit target RPE across 2 sessions. Single-leg: 5% increments.',
            },
            {
              t: 'Volume Accumulation',
              d: 'Add 1 set/exercise/week over 3-week wave (3×10 → 4×10 → 5×10), then deload.',
            },
            {
              t: 'Tempo Manipulation',
              d: '4-second eccentric on any exercise. Increases TUT by 60-100%.',
            },
            {
              t: 'Rest-Pause Sets',
              d: '8 reps → rack 15s → 3-4 more → rack 15s → 2-3 more. Comparable hypertrophy in less time.',
            },
            {
              t: 'Mechanical Advantage Drop Sets',
              d: 'Cycle harder→easier variations (incline→flat→decline press). Max stimulus from limited exercises.',
            },
            {
              t: 'Density Training',
              d: 'Cut 15 seconds off rest every 2 weeks. Same work in less time = progressive overload.',
            },
          ].map((rule, i) => (
            <div key={'ol-' + i} style={{ marginBottom: 8 }}>
              <span style={{ fontWeight: 700, color: C.accent }}>{rule.t}: </span>
              {rule.d}
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
