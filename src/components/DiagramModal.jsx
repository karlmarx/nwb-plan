function PlancheDiagram({ onClose }) {
  const callouts = [
    {
      key: 'leftleg',
      title: '✓ Left Leg',
      color: '#4ade80',
      bg: '#0d1f14',
      border: '#4ade80',
      text: 'Hangs passively alongside the right leg near the box. Not resting on the box, not pushing, not tensing. Just floating. Your left hip flexors stay completely silent.'
    },
    {
      key: 'lean',
      title: '↗ The Forward Lean',
      color: '#60a5fa',
      bg: '#0d1525',
      border: '#60a5fa',
      text: 'Your shoulders travel well forward of your hands. This shifts your center of gravity over and past the parallettes, making your anterior delts and chest carry enormous load just to stay still.'
    },
    {
      key: 'hip',
      title: '◎ Hip Position',
      color: '#a78bfa',
      bg: '#130d1f',
      border: '#a78bfa',
      text: 'Your hip sits at roughly neutral extension — not flexed, not compressed. The joint is just connecting your torso to your leg. No FAI impingement zone.'
    },
    {
      key: 'sag',
      title: '⚠ Don’t Let Hips Sag',
      color: '#facc15',
      bg: '#1a1700',
      border: '#facc15',
      text: 'If your core goes slack, your hips will pike or sag. Keep your glute and core braced so the body stays in one rigid plank line from head to right foot.'
    }
  ];

  const steps = [
    {
      n: 1,
      text: 'Place parallettes on the floor near your waist level — much further back than a normal push-up. Kneel to get into position.'
    },
    {
      n: 2,
      text: 'Right foot goes on the box behind you. Left leg hangs alongside it — same height roughly, just not bearing weight or touching anything.'
    },
    {
      n: 3,
      text: 'Lean your whole body forward over your wrists. You should feel immediate shoulder tension just holding this position. That’s correct.'
    },
    {
      n: 4,
      text: 'Lower your chest toward the floor, maintaining the forward lean. Do not let your hips drift backward as you descend.'
    },
    {
      n: 5,
      text: 'Press back up to start. AMRAP — if your lean is aggressive, 3–5 reps is genuinely hard. Stop if form breaks.'
    }
  ];

  return (
    <div
      style={{
        padding: '24px 16px 32px',
        color: '#f0ede6',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 'clamp(1.1rem,3.5vw,1.5rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Pseudo Planche Push-Up
          </div>
          <div style={{ fontSize: 10, color: '#666', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 2 }}>
            Side-view mechanics + NWB position
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: '#222',
            border: '1px solid #444',
            color: '#aaa',
            borderRadius: 8,
            padding: '6px 12px',
            fontSize: 12,
            cursor: 'pointer',
            fontFamily: 'inherit',
            flexShrink: 0
          }}
        >
          ✕ Close
        </button>
      </div>

      <div
        style={{
          width: '100%',
          background: '#161616',
          border: '1px solid #2a2a2a',
          borderRadius: 12,
          padding: '20px 12px 12px',
          marginBottom: 16
        }}
      >
        <div style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#555', marginBottom: 8 }}>
          Side View — Top Position (Arms Extended)
        </div>
        <svg viewBox="0 0 760 320" width="100%" xmlns="http://www.w3.org/2000/svg">
          <line x1={30} y1={285} x2={730} y2={285} stroke="#333" strokeWidth={1.5} />
          <rect x={555} y={225} width={100} height={60} rx={4} fill="#1e1e1e" stroke="#444" strokeWidth={1.5} />
          <text x={605} y={262} textAnchor="middle" fontSize={11} fill="#555">box</text>
          <line x1={282} y1={93} x2={542} y2={253} stroke="#f0ede6" strokeWidth={0.6} strokeDasharray="7,5" opacity={0.12} />
          <text x={375} y={148} fontSize={10} fill="#444" transform="rotate(17,375,148)">body rigid / straight</text>
          <line x1={308} y1={70} x2={308} y2={210} stroke="#2a2a2a" strokeWidth={1} strokeDasharray="4,4" />
          <line x1={308} y1={112} x2={418} y2={172} stroke="#f0ede6" strokeWidth={5} strokeLinecap="round" />
          <circle cx={283} cy={95} r={17} fill="none" stroke="#f0ede6" strokeWidth={3} />
          <line x1={293} y1={110} x2={308} y2={112} stroke="#f0ede6" strokeWidth={3} />
          <line x1={308} y1={112} x2={328} y2={172} stroke="#f0ede6" strokeWidth={4} strokeLinecap="round" />
          <line x1={328} y1={172} x2={353} y2={222} stroke="#f0ede6" strokeWidth={4} strokeLinecap="round" />
          <line x1={316} y1={117} x2={336} y2={177} stroke="#aaa" strokeWidth={3} strokeLinecap="round" strokeDasharray="5,3" />
          <line x1={336} y1={177} x2={361} y2={225} stroke="#aaa" strokeWidth={3} strokeLinecap="round" strokeDasharray="5,3" />
          <rect x={338} y={218} width={36} height={9} rx={3} fill="#4ade80" opacity={0.9} />
          <line x1={340} y1={227} x2={340} y2={245} stroke="#4ade80" strokeWidth={2.5} />
          <line x1={372} y1={227} x2={372} y2={245} stroke="#4ade80" strokeWidth={2.5} />
          <line x1={340} y1={245} x2={372} y2={245} stroke="#4ade80" strokeWidth={2} />
          <line x1={418} y1={172} x2={478} y2={225} stroke="#f0ede6" strokeWidth={5} strokeLinecap="round" />
          <line x1={478} y1={225} x2={555} y2={225} stroke="#f0ede6" strokeWidth={5} strokeLinecap="round" />
          <rect x={548} y={219} width={20} height={8} rx={2} fill="#f0ede6" />
          <line x1={418} y1={172} x2={470} y2={238} stroke="#facc15" strokeWidth={4} strokeLinecap="round" strokeDasharray="6,4" />
          <line x1={470} y1={238} x2={540} y2={253} stroke="#facc15" strokeWidth={4} strokeLinecap="round" strokeDasharray="6,4" />
          <ellipse cx={548} cy={257} rx={11} ry={5} fill="none" stroke="#facc15" strokeWidth={2} strokeDasharray="4,3" />
          <line x1={548} y1={262} x2={548} y2={225} stroke="#facc15" strokeWidth={1} strokeDasharray="2,3" opacity={0.4} />
          <text x={524} y={275} fontSize={10} fill="#facc15">hovers</text>
          <line x1={356} y1={214} x2={298} y2={194} stroke="#4ade80" strokeWidth={1} strokeDasharray="3,3" />
          <text x={160} y={184} fontSize={11} fill="#4ade80">hands near</text>
          <text x={163} y={196} fontSize={11} fill="#4ade80">waist / hips</text>
          <text x={155} y={208} fontSize={10} fill="#555">(not under shoulders)</text>
          <circle cx={308} cy={112} r={5} fill="#60a5fa" opacity={0.8} />
          <line x1={302} y1={104} x2={250} y2={78} stroke="#60a5fa" strokeWidth={1} strokeDasharray="3,3" />
          <text x={165} y={74} fontSize={11} fill="#60a5fa">shoulder</text>
          <text x={152} y={86} fontSize={10} fill="#555">forward of hands</text>
          <circle cx={418} cy={172} r={5} fill="#a78bfa" opacity={0.9} />
          <line x1={423} y1={165} x2={468} y2={138} stroke="#a78bfa" strokeWidth={1} strokeDasharray="3,3" />
          <text x={472} y={134} fontSize={11} fill="#a78bfa">hip — neutral</text>
          <text x={472} y={146} fontSize={10} fill="#555">not flexed / not loaded</text>
          <line x1={568} y1={218} x2={618} y2={188} stroke="#f0ede6" strokeWidth={1} strokeDasharray="3,3" />
          <text x={622} y={184} fontSize={11} fill="#f0ede6">right foot</text>
          <text x={622} y={196} fontSize={10} fill="#555">on box — stability</text>
          <line x1={558} y1={257} x2={625} y2={248} stroke="#facc15" strokeWidth={1} strokeDasharray="3,3" />
          <text x={628} y={244} fontSize={11} fill="#facc15">left foot</text>
          <text x={628} y={256} fontSize={10} fill="#555">floats — zero</text>
          <text x={628} y={268} fontSize={10} fill="#555">weight / push</text>
        </svg>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10, marginBottom: 16 }}>
        {callouts.map((c) => (
          <div
            key={c.key}
            style={{
              background: c.bg,
              border: '1px solid #2a2a2a',
              borderLeft: '3px solid ' + c.border,
              borderRadius: 8,
              padding: '12px 14px'
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: c.color, marginBottom: 5 }}>
              {c.title}
            </div>
            <div style={{ fontSize: 11, lineHeight: 1.65, color: '#bbb' }}>{c.text}</div>
          </div>
        ))}
      </div>

      <div style={{ background: '#161616', border: '1px solid #2a2a2a', borderRadius: 12, padding: '16px 14px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#555', marginBottom: 12 }}>
          Movement Sequence
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {steps.map((s) => (
            <div key={s.n} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: '#222',
                  border: '1px solid #444',
                  fontSize: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  color: '#777',
                  marginTop: 1
                }}
              >
                {s.n}
              </div>
              <div style={{ fontSize: 11, lineHeight: 1.65, color: '#bbb' }}>{s.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SidePlankDiagram({ onClose }) {
  const callouts = [
    {
      key: 'rside',
      title: '✓ Right Side Down',
      color: '#2ecc71',
      bg: '#0d1f14',
      border: '#2ecc71',
      text: 'ALL weight goes through your right elbow + right knee (BASE) or right foot (AMP). Right femur is uninjured — load it freely. Your right obliques and QL do the heavy lifting.'
    },
    {
      key: 'lleg',
      title: '⚠ Left Leg',
      color: '#c0392b',
      bg: '#1f0d0d',
      border: '#c0392b',
      text: 'Rests passively on top or in front on the floor. Dead weight. NEVER go left-side-down — that loads the left femoral neck directly through the elbow-hip-knee chain.'
    },
    {
      key: 'loblique',
      title: '↗ Left Oblique Bias',
      color: '#a78bfa',
      bg: '#130d1f',
      border: '#a78bfa',
      text: "Stay right-side-down but reach LEFT arm overhead toward the floor beyond your head. Gravity pulls your top arm down — left obliques work eccentrically to control it. Solves the 'can’t train left obliques' problem."
    },
    {
      key: 'amp',
      title: '🔥 Amplification',
      color: '#facc15',
      bg: '#1a1700',
      border: '#facc15',
      text: 'BASE: Right knee down, isometric hold. AMP 1: Right foot, arm to ceiling. AMP 2: Right foot + weight overhead + 4-count hip dips.'
    }
  ];

  return (
    <div
      style={{
        padding: '24px 16px 32px',
        color: '#f0ede6',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 'clamp(1.1rem,3.5vw,1.5rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Side Plank — Leg Configuration
          </div>
          <div style={{ fontSize: 10, color: '#666', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 2 }}>
            Why right-side-down only + left oblique bias trick
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: '#222',
            border: '1px solid #444',
            color: '#aaa',
            borderRadius: 8,
            padding: '6px 12px',
            fontSize: 12,
            cursor: 'pointer',
            fontFamily: 'inherit',
            flexShrink: 0
          }}
        >
          ✕ Close
        </button>
      </div>

      {/* RIGHT SIDE DOWN diagram */}
      <div
        style={{
          width: '100%',
          background: '#161616',
          border: '1px solid #2a2a2a',
          borderRadius: 12,
          padding: '20px 12px 12px',
          marginBottom: 12
        }}
      >
        <div style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#555', marginBottom: 8 }}>
          Right Side Down — Safe Position
        </div>
        <svg viewBox="0 0 760 240" width="100%" xmlns="http://www.w3.org/2000/svg">
          <line x1={30} y1={210} x2={730} y2={210} stroke="#333" strokeWidth={1.5} />
          <text x={738} y={214} fontSize={10} fill="#555">floor</text>
          <line x1={155} y1={185} x2={380} y2={120} stroke="#f0ede6" strokeWidth={0.6} strokeDasharray="7,5" opacity={0.12} />
          <circle cx={130} cy={170} r={14} fill="none" stroke="#2ecc71" strokeWidth={3} />
          <circle cx={165} cy={198} r={7} fill="#2ecc71" />
          <line x1={165} y1={198} x2={148} y2={178} stroke="#2ecc71" strokeWidth={4} strokeLinecap="round" />
          <line x1={168} y1={194} x2={360} y2={120} stroke="#2ecc71" strokeWidth={5} strokeLinecap="round" />
          <circle cx={360} cy={120} r={5} fill="#2ecc71" />
          <line x1={360} y1={120} x2={420} y2={170} stroke="#2ecc71" strokeWidth={5} strokeLinecap="round" />
          <line x1={420} y1={170} x2={500} y2={208} stroke="#2ecc71" strokeWidth={5} strokeLinecap="round" />
          <circle cx={420} cy={170} r={4} fill="#2ecc71" />
          <line x1={360} y1={120} x2={560} y2={208} stroke="#2ecc71" strokeWidth={3.5} strokeLinecap="round" strokeDasharray="8,6" opacity={0.5} />
          <circle cx={560} cy={208} r={3} fill="#2ecc71" opacity={0.5} />
          <text x={568} y={200} fontSize={10} fill="#2ecc71" opacity={0.7}>R foot (AMP)</text>
          <line x1={360} y1={120} x2={520} y2={92} stroke="#c0392b" strokeWidth={4} strokeLinecap="round" />
          <circle cx={520} cy={92} r={3} fill="#c0392b" />
          <line x1={168} y1={194} x2={105} y2={140} stroke="#a78bfa" strokeWidth={3} strokeLinecap="round" strokeDasharray="6,4" />
          <line x1={105} y1={140} x2={60} y2={90} stroke="#a78bfa" strokeWidth={3} strokeLinecap="round" strokeDasharray="6,4" />
          <circle cx={60} cy={90} r={3} fill="#a78bfa" />
          <text x={165} y={228} textAnchor="middle" fontSize={10} fill="#2ecc71" fontWeight="bold">R elbow</text>
          <text x={445} y={228} textAnchor="middle" fontSize={10} fill="#2ecc71" fontWeight="bold">R knee (BASE)</text>
          <text x={535} y={78} fill="#c0392b" fontSize={10} fontWeight="bold">L leg stacked</text>
          <text x={535} y={90} fill="#c0392b" fontSize={9}>dead weight, zero load</text>
          <text x={40} y={80} fill="#a78bfa" fontSize={9} textAnchor="middle">L arm overhead</text>
          <text x={40} y={92} fill="#a78bfa" fontSize={9} textAnchor="middle">(oblique bias)</text>
          <text x={85} y={228} fill="#888" fontSize={9}>ALL weight →</text>
          <text x={85} y={239} fill="#2ecc71" fontSize={9} fontWeight="bold">R elbow + R knee/foot</text>
          <text x={680} y={120} fill="#2ecc71" fontSize={24}>✓</text>
          <text x={668} y={142} fill="#2ecc71" fontSize={10} fontWeight="bold">SAFE</text>
        </svg>
      </div>

      {/* LEFT SIDE DOWN — NEVER diagram */}
      <div
        style={{
          width: '100%',
          background: '#161616',
          border: '1px solid #c0392b22',
          borderRadius: 12,
          padding: '20px 12px 12px',
          marginBottom: 16
        }}
      >
        <div style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#c0392b', marginBottom: 8 }}>
          Left Side Down — ⛔ Never Do This
        </div>
        <svg viewBox="0 0 760 200" width="100%" xmlns="http://www.w3.org/2000/svg">
          <line x1={30} y1={175} x2={730} y2={175} stroke="#333" strokeWidth={1.5} />
          <circle cx={130} cy={135} r={14} fill="none" stroke="#c0392b" strokeWidth={3} opacity={0.4} />
          <circle cx={165} cy={163} r={7} fill="#c0392b" opacity={0.5} />
          <line x1={165} y1={163} x2={148} y2={143} stroke="#c0392b" strokeWidth={4} strokeLinecap="round" opacity={0.4} />
          <line x1={168} y1={159} x2={360} y2={85} stroke="#c0392b" strokeWidth={5} strokeLinecap="round" opacity={0.4} />
          <circle cx={360} cy={85} r={5} fill="#c0392b" opacity={0.4} />
          <line x1={360} y1={85} x2={420} y2={135} stroke="#c0392b" strokeWidth={5} strokeLinecap="round" opacity={0.4} />
          <line x1={420} y1={135} x2={500} y2={173} stroke="#c0392b" strokeWidth={5} strokeLinecap="round" opacity={0.4} />
          <circle cx={400} cy={115} r={22} fill="none" stroke="#c0392b" strokeWidth={2} strokeDasharray="4,3" />
          <text x={430} y={108} fill="#c0392b" fontSize={9} fontWeight="bold">LOADS LEFT</text>
          <text x={430} y={120} fill="#c0392b" fontSize={9} fontWeight="bold">FEMORAL NECK</text>
          <text x={672} y={90} fill="#c0392b" fontSize={36} fontWeight="bold">✗</text>
          <text x={165} y={192} textAnchor="middle" fontSize={10} fill="#c0392b" fontWeight="bold">L elbow</text>
          <text x={460} y={192} textAnchor="middle" fontSize={10} fill="#c0392b" fontWeight="bold">L knee on ground = fracture load</text>
        </svg>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10, marginBottom: 16 }}>
        {callouts.map((c) => (
          <div
            key={c.key}
            style={{
              background: c.bg,
              border: '1px solid #2a2a2a',
              borderLeft: '3px solid ' + c.border,
              borderRadius: 8,
              padding: '12px 14px'
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: c.color, marginBottom: 5 }}>
              {c.title}
            </div>
            <div style={{ fontSize: 11, lineHeight: 1.65, color: '#bbb' }}>{c.text}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 20, justifyContent: 'center', fontSize: 11, color: '#777' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 12, height: 12, borderRadius: 2, background: '#2ecc71' }} />
          Right side (bears weight)
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 12, height: 12, borderRadius: 2, background: '#c0392b' }} />
          Left side (zero load)
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 12, height: 12, borderRadius: 2, background: '#a78bfa' }} />
          Oblique bias reach
        </div>
      </div>
    </div>
  );
}

export const DIAGRAMS = {
  planche: PlancheDiagram,
  sideplank: SidePlankDiagram
};

export default function DiagramModal({ diagramKey, onClose }) {
  const DiagramComponent = DIAGRAMS[diagramKey];
  if (!DiagramComponent) return null;

  return (
    <div
      className="diagram-modal"
      onClick={(ev) => {
        if (ev.target === ev.currentTarget) onClose();
      }}
    >
      <div className="diagram-sheet">
        <DiagramComponent onClose={onClose} />
      </div>
    </div>
  );
}
