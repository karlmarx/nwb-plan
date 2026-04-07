// Glute exercise animations (new rAF-based versions)

import { C, Floor, Dumbbell } from "./helpers";

interface AnimProps { t: number }

export function GluteBridge({ t }: AnimProps) {
  const phase = t < 0.5 ? t / 0.5 : 1 - (t - 0.5) / 0.5;
  const lift = Math.sin(phase * Math.PI * 0.5);
  const hold = phase > 0.4 && phase < 0.6 ? 1 : lift;
  const floorY = 220;
  const headX = 100, headY = 195;
  // Upper back stays on ground
  const backX = 160, backY = 208;
  // Hip lifts
  const hipX = 240, hipY = 205 - hold * 30;
  // Right foot planted
  const rFootX = 320, rFootY = floorY;
  const rKneeX = 300, rKneeY = 175 - hold * 10;
  // Left leg hangs
  const lKneeX = 270, lKneeY = hipY - 10;
  const lFootX = 275, lFootY = hipY + 25;

  return (
    <g>
      <Floor y={floorY} />
      {/* Mat */}
      <rect x={60} y={floorY - 3} width={280} height="4" rx="2" fill="#1a2636" />
      {/* Head */}
      <circle cx={headX} cy={headY} r="14" fill="none" stroke={C.body} strokeWidth="3" />
      {/* Upper back on ground */}
      <line x1={headX + 14} y1={headY + 5} x2={backX} y2={backY} stroke={C.body} strokeWidth="5" strokeLinecap="round" />
      {/* Lower torso (lifts) */}
      <line x1={backX} y1={backY} x2={hipX} y2={hipY} stroke={C.body} strokeWidth="5" strokeLinecap="round" />
      {/* Hip joint */}
      <circle cx={hipX} cy={hipY} r="4" fill={C.body} />
      {/* Right leg - thigh */}
      <line x1={hipX} y1={hipY} x2={rKneeX} y2={rKneeY} stroke={C.active} strokeWidth="6" strokeLinecap="round" />
      {/* Right leg - shin */}
      <line x1={rKneeX} y1={rKneeY} x2={rFootX} y2={rFootY} stroke={C.active} strokeWidth="6" strokeLinecap="round" />
      {/* Right foot planted */}
      <rect x={rFootX - 8} y={rFootY - 4} width="18" height="5" rx="2" fill={C.active} />
      {/* Left leg - thigh (passive) */}
      <line x1={hipX} y1={hipY} x2={lKneeX} y2={lKneeY} stroke={C.leftLeg} strokeWidth="4" strokeLinecap="round" strokeDasharray="6,3" opacity="0.6" />
      {/* Left leg - shin hanging */}
      <line x1={lKneeX} y1={lKneeY} x2={lFootX} y2={lFootY} stroke={C.leftLeg} strokeWidth="4" strokeLinecap="round" strokeDasharray="6,3" opacity="0.6" />
      {/* Left foot hovering */}
      <ellipse cx={lFootX + 3} cy={lFootY + 3} rx="6" ry="3" fill="none" stroke={C.leftLeg} strokeWidth="1.5" strokeDasharray="3,2" opacity="0.5" />
      {/* Labels */}
      <text x={rKneeX + 8} y={rKneeY - 5} fontSize="11" fontWeight="bold" fill={C.active} fontFamily="monospace">R</text>
      <text x={lFootX + 8} y={lFootY + 5} fontSize="10" fill={C.leftLeg} fontFamily="monospace">L</text>
      {/* Glute activation glow */}
      <circle cx={hipX + 5} cy={hipY - 5} r="12" fill={C.active} opacity={hold * 0.3} />
      {/* Drive label */}
      {hold > 0.3 && (
        <text x={backX + 10} y={hipY - 20} fontSize="10" fontWeight="bold" fill={C.active} fontFamily="monospace">SQUEEZE</text>
      )}
      {/* Heel drive indicator */}
      <text x={rFootX - 5} y={floorY + 15} fontSize="8" fill={C.strap} fontFamily="monospace">heel drive</text>
    </g>
  );
}

export function BandedClamshell({ t }: AnimProps) {
  const phase = t < 0.5 ? t / 0.5 : 1 - (t - 0.5) / 0.5;
  const open = Math.sin(phase * Math.PI * 0.5);
  const floorY = 220;
  // Side-lying figure (front view)
  const headX = 120, headY = 160;
  const shX = 155, shY = 170;
  const hipX = 230, hipY = 185;

  // Bottom leg (static on floor)
  const bKneeX = 305, bKneeY = 210;
  const bFootX = 340, bFootY = floorY;
  // Top leg (opens)
  const tKneeX = 305 - open * 5, tKneeY = 205 - open * 30;
  const tFootX = 340 - open * 5, tFootY = floorY - 5 - open * 5;

  return (
    <g>
      <Floor y={floorY} />
      {/* Head */}
      <circle cx={headX} cy={headY} r="13" fill="none" stroke={C.body} strokeWidth="3" />
      {/* Bottom arm (under head) */}
      <line x1={headX} y1={headY + 13} x2={headX - 10} y2={headY + 30} stroke={C.body} strokeWidth="3" strokeLinecap="round" opacity="0.5" />
      <line x1={headX - 10} y1={headY + 30} x2={headX} y2={floorY - 5} stroke={C.body} strokeWidth="3" strokeLinecap="round" opacity="0.5" />
      {/* Torso */}
      <line x1={shX} y1={shY} x2={hipX} y2={hipY} stroke={C.body} strokeWidth="6" strokeLinecap="round" />
      {/* Top arm (for stability) */}
      <line x1={shX + 30} y1={shY + 5} x2={shX + 45} y2={shY + 25} stroke={C.body} strokeWidth="3" strokeLinecap="round" opacity="0.5" />
      {/* Hip joint */}
      <circle cx={hipX} cy={hipY} r="4" fill={C.body} />
      {/* Bottom leg */}
      <line x1={hipX} y1={hipY} x2={bKneeX} y2={bKneeY} stroke={C.body} strokeWidth="5" strokeLinecap="round" />
      <line x1={bKneeX} y1={bKneeY} x2={bFootX} y2={bFootY} stroke={C.body} strokeWidth="5" strokeLinecap="round" />
      <ellipse cx={bFootX + 5} cy={bFootY} rx="8" ry="3" fill={C.body} />
      {/* Top leg (animated) */}
      <line x1={hipX} y1={hipY} x2={tKneeX} y2={tKneeY} stroke={C.active} strokeWidth="6" strokeLinecap="round" />
      <line x1={tKneeX} y1={tKneeY} x2={tFootX} y2={tFootY} stroke={C.active} strokeWidth="5" strokeLinecap="round" />
      <ellipse cx={tFootX + 5} cy={tFootY} rx="8" ry="3" fill={C.active} />
      {/* Band between knees */}
      <rect x={bKneeX - 5} y={bKneeY - 4} width="14" height="6" rx="3" fill={C.strap} opacity="0.7" />
      <rect x={tKneeX - 5} y={tKneeY - 2} width="14" height="6" rx="3" fill={C.strap} opacity="0.9" />
      {/* Hip stacking line */}
      <line x1={hipX} y1={hipY - 35} x2={hipX} y2={hipY + 5} stroke={C.active} strokeWidth="1" strokeDasharray="3,3" />
      <text x={hipX - 20} y={hipY - 38} fill={C.active} fontSize="9" fontWeight="bold" fontFamily="monospace">{"\u2713"} stacked</text>
      {/* Glute med target */}
      {open > 0.3 && (
        <>
          <circle cx={hipX + 10} cy={hipY - 8} r="5" fill="none" stroke={C.active} strokeWidth="1.5" />
          <circle cx={hipX + 10} cy={hipY - 8} r="2" fill={C.active} />
          <text x={hipX + 20} y={hipY - 12} fill={C.active} fontSize="9" fontWeight="bold" fontFamily="monospace">glute med</text>
        </>
      )}
      {/* Feet together label */}
      <text x={tFootX + 10} y={tFootY + 15} fill="#4ecdc4" fontSize="8" fontFamily="monospace">feet together</text>
    </g>
  );
}

export function CableKickback({ t }: AnimProps) {
  const phase = t < 0.5 ? t / 0.5 : 1 - (t - 0.5) / 0.5;
  const kick = Math.sin(phase * Math.PI * 0.5);
  const floorY = 220;
  // Cable stack on left
  const stackX = 60;
  const hipX = 200, hipY = 140, shX = 195, shY = 105, hdY = 85;
  // Right leg kicks back
  const rKneeX = hipX + 15 + kick * 30, rKneeY = hipY + 5 - kick * 15;
  const rFootX = rKneeX + 15 + kick * 25, rFootY = rKneeY - kick * 10;
  // Cable from stack to right ankle
  const cableEndX = rFootX, cableEndY = rFootY;
  return (
    <g>
      <Floor y={floorY} />
      {/* Cable stack */}
      <rect x={stackX} y={80} width="20" height="130" rx="3" fill={C.equipment} />
      <rect x={stackX + 3} y={85} width="14" height="15" rx="1" fill={C.weight} />
      <rect x={stackX + 3} y={103} width="14" height="15" rx="1" fill={C.weight} />
      <rect x={stackX + 3} y={121} width="14" height="15" rx="1" fill={C.weight} />
      {/* Cable */}
      <line x1={stackX + 10} y1={90} x2={stackX + 10} y2={80} stroke="#aaa" strokeWidth="1.5" />
      <line x1={stackX + 10} y1={80} x2={cableEndX} y2={cableEndY} stroke="#aaa" strokeWidth="1.5" strokeDasharray="5,3" />
      {/* Ankle strap */}
      <circle cx={cableEndX} cy={cableEndY} r="5" fill="none" stroke={C.strap} strokeWidth="2" />
      {/* Standing on left leg (with support) */}
      <line x1={hipX - 5} y1={hipY} x2={hipX - 15} y2={floorY - 10} stroke={C.leftLeg} strokeWidth="5" strokeLinecap="round" />
      <line x1={hipX - 15} y1={floorY - 10} x2={hipX - 15} y2={floorY} stroke={C.leftLeg} strokeWidth="4" strokeLinecap="round" />
      {/* Leaning forward slightly, gripping frame */}
      <line x1={hipX} y1={hipY} x2={shX} y2={shY} stroke={C.body} strokeWidth="5" strokeLinecap="round" />
      <circle cx={shX - 3} cy={hdY} r="11" fill="none" stroke={C.body} strokeWidth="3" />
      {/* Arms gripping frame */}
      <line x1={shX - 8} y1={shY} x2={stackX + 25} y2={shY - 10} stroke={C.body} strokeWidth="3" strokeLinecap="round" />
      <line x1={shX + 5} y1={shY} x2={stackX + 25} y2={shY + 5} stroke={C.body} strokeWidth="3" strokeLinecap="round" />
      {/* Right leg kicking */}
      <line x1={hipX + 5} y1={hipY} x2={rKneeX} y2={rKneeY} stroke={C.active} strokeWidth="5" strokeLinecap="round" />
      <line x1={rKneeX} y1={rKneeY} x2={rFootX} y2={rFootY} stroke={C.active} strokeWidth="4.5" strokeLinecap="round" />
      <circle cx={rFootX} cy={rFootY} r="4" fill={C.active} />
      {/* Glute activation */}
      <circle cx={hipX + 8} cy={hipY - 5} r="10" fill={C.active} opacity={kick * 0.35} />
      {kick > 0.3 && <text x={hipX + 22} y={hipY - 10} fill={C.active} fontSize="9" fontWeight="bold" fontFamily="monospace">glute</text>}
    </g>
  );
}

// Seated front-view hip abduction with loop band around knees
export function SeatedHipAbduction({ t }: AnimProps) {
  const phase = t < 0.5 ? t / 0.5 : 1 - (t - 0.5) / 0.5;
  const open = Math.sin(phase * Math.PI * 0.5);
  const floorY = 240;
  // Bench
  const benchX = 110, benchY = 175, benchW = 180, benchH = 12;
  // Seated figure (front view)
  const cx = 200;
  const headY = 95;
  const shY = 125;
  const hipY = benchY; // sitting on bench
  // Knees splay outward
  const lKneeX = cx - 22 - open * 22;
  const rKneeX = cx + 22 + open * 22;
  const kneeY = 200;
  // Feet stay roughly under knees (foot plant moves slightly with knee)
  const lFootX = cx - 28 - open * 24;
  const rFootX = cx + 28 + open * 24;
  return (
    <g>
      <Floor y={floorY} />
      {/* Bench */}
      <rect x={benchX} y={benchY} width={benchW} height={benchH} rx="2" fill={C.equipment} />
      <rect x={benchX + 10} y={benchY + benchH} width="6" height={floorY - benchY - benchH} fill={C.equipLight} />
      <rect x={benchX + benchW - 16} y={benchY + benchH} width="6" height={floorY - benchY - benchH} fill={C.equipLight} />
      {/* Head */}
      <circle cx={cx} cy={headY} r="14" fill="none" stroke={C.body} strokeWidth="3" />
      {/* Torso (slight lean OK, here upright) */}
      <line x1={cx} y1={headY + 14} x2={cx} y2={shY} stroke={C.body} strokeWidth="4" strokeLinecap="round" />
      <line x1={cx} y1={shY} x2={cx} y2={hipY - 5} stroke={C.body} strokeWidth="6" strokeLinecap="round" />
      {/* Shoulders */}
      <line x1={cx - 22} y1={shY} x2={cx + 22} y2={shY} stroke={C.body} strokeWidth="4" strokeLinecap="round" />
      {/* Arms hanging at sides (hands set band, then rest) */}
      <line x1={cx - 22} y1={shY} x2={cx - 30} y2={shY + 35} stroke={C.body} strokeWidth="3" strokeLinecap="round" />
      <line x1={cx + 22} y1={shY} x2={cx + 30} y2={shY + 35} stroke={C.body} strokeWidth="3" strokeLinecap="round" />
      {/* Hip joint marker */}
      <circle cx={cx} cy={hipY} r="4" fill={C.body} />
      {/* RIGHT thigh (active) */}
      <line x1={cx + 4} y1={hipY} x2={rKneeX} y2={kneeY} stroke={C.active} strokeWidth="7" strokeLinecap="round" />
      {/* RIGHT shin */}
      <line x1={rKneeX} y1={kneeY} x2={rFootX} y2={floorY - 4} stroke={C.active} strokeWidth="6" strokeLinecap="round" />
      <ellipse cx={rFootX + 3} cy={floorY - 2} rx="9" ry="3" fill={C.active} />
      {/* LEFT thigh (passive — red dashed) */}
      <line x1={cx - 4} y1={hipY} x2={lKneeX} y2={kneeY} stroke={C.leftLeg} strokeWidth="6" strokeLinecap="round" strokeDasharray="6,3" opacity="0.7" />
      <line x1={lKneeX} y1={kneeY} x2={lFootX} y2={floorY - 4} stroke={C.leftLeg} strokeWidth="5" strokeLinecap="round" strokeDasharray="6,3" opacity="0.7" />
      <ellipse cx={lFootX - 3} cy={floorY - 2} rx="9" ry="3" fill="none" stroke={C.leftLeg} strokeWidth="2" strokeDasharray="3,2" opacity="0.6" />
      {/* Loop band around knees — stretches as knees open */}
      <ellipse
        cx={cx}
        cy={kneeY - 3}
        rx={26 + open * 22}
        ry={6}
        fill="none"
        stroke={C.strap}
        strokeWidth={3 + open * 1.5}
        opacity={0.85}
      />
      {/* Glute med activation glow on RIGHT */}
      <circle cx={cx + 14} cy={hipY - 4} r="11" fill={C.active} opacity={open * 0.35} />
      {open > 0.4 && (
        <text x={cx + 28} y={hipY - 6} fontSize="10" fontWeight="bold" fill={C.active} fontFamily="monospace">glute med</text>
      )}
      {/* Direction arrows when pressing out */}
      {open > 0.2 && (
        <>
          <text x={lKneeX - 18} y={kneeY + 4} fontSize="14" fill={C.active} fontWeight="bold">{"\u2190"}</text>
          <text x={rKneeX + 6} y={kneeY + 4} fontSize="14" fill={C.active} fontWeight="bold">{"\u2192"}</text>
        </>
      )}
      {/* Hip flexion angle label */}
      <text x={cx - 60} y={hipY - 12} fontSize="9" fill={C.label} fontFamily="monospace">{"~80\u00B0 hip"}</text>
      {/* Left leg passive label */}
      <text x={lFootX - 25} y={floorY + 12} fontSize="8" fill={C.leftLeg} fontFamily="monospace">L passive</text>
    </g>
  );
}

// Seated front-view hip adduction — knees squeeze inward against band
export function SeatedHipAdduction({ t }: AnimProps) {
  const phase = t < 0.5 ? t / 0.5 : 1 - (t - 0.5) / 0.5;
  const squeeze = Math.sin(phase * Math.PI * 0.5);
  const floorY = 240;
  const benchX = 110, benchY = 175, benchW = 180, benchH = 12;
  const cx = 200;
  const headY = 95;
  const shY = 125;
  const hipY = benchY;
  // Start wide (~44 apart), squeeze toward 6 apart
  const startSpread = 36;
  const endSpread = 8;
  const spread = startSpread - squeeze * (startSpread - endSpread);
  const lKneeX = cx - spread;
  const rKneeX = cx + spread;
  const kneeY = 200;
  const lFootX = cx - spread - 6;
  const rFootX = cx + spread + 6;
  return (
    <g>
      <Floor y={floorY} />
      <rect x={benchX} y={benchY} width={benchW} height={benchH} rx="2" fill={C.equipment} />
      <rect x={benchX + 10} y={benchY + benchH} width="6" height={floorY - benchY - benchH} fill={C.equipLight} />
      <rect x={benchX + benchW - 16} y={benchY + benchH} width="6" height={floorY - benchY - benchH} fill={C.equipLight} />
      <circle cx={cx} cy={headY} r="14" fill="none" stroke={C.body} strokeWidth="3" />
      <line x1={cx} y1={headY + 14} x2={cx} y2={shY} stroke={C.body} strokeWidth="4" strokeLinecap="round" />
      <line x1={cx} y1={shY} x2={cx} y2={hipY - 5} stroke={C.body} strokeWidth="6" strokeLinecap="round" />
      <line x1={cx - 22} y1={shY} x2={cx + 22} y2={shY} stroke={C.body} strokeWidth="4" strokeLinecap="round" />
      <line x1={cx - 22} y1={shY} x2={cx - 30} y2={shY + 35} stroke={C.body} strokeWidth="3" strokeLinecap="round" />
      <line x1={cx + 22} y1={shY} x2={cx + 30} y2={shY + 35} stroke={C.body} strokeWidth="3" strokeLinecap="round" />
      <circle cx={cx} cy={hipY} r="4" fill={C.body} />
      {/* RIGHT thigh active */}
      <line x1={cx + 4} y1={hipY} x2={rKneeX} y2={kneeY} stroke={C.active} strokeWidth="7" strokeLinecap="round" />
      <line x1={rKneeX} y1={kneeY} x2={rFootX} y2={floorY - 4} stroke={C.active} strokeWidth="6" strokeLinecap="round" />
      <ellipse cx={rFootX + 3} cy={floorY - 2} rx="9" ry="3" fill={C.active} />
      {/* LEFT passive */}
      <line x1={cx - 4} y1={hipY} x2={lKneeX} y2={kneeY} stroke={C.leftLeg} strokeWidth="6" strokeLinecap="round" strokeDasharray="6,3" opacity="0.7" />
      <line x1={lKneeX} y1={kneeY} x2={lFootX} y2={floorY - 4} stroke={C.leftLeg} strokeWidth="5" strokeLinecap="round" strokeDasharray="6,3" opacity="0.7" />
      <ellipse cx={lFootX - 3} cy={floorY - 2} rx="9" ry="3" fill="none" stroke={C.leftLeg} strokeWidth="2" strokeDasharray="3,2" opacity="0.6" />
      {/* Loop band — taut even when squeezed */}
      <ellipse
        cx={cx}
        cy={kneeY - 3}
        rx={spread + 4}
        ry={6}
        fill="none"
        stroke={C.strap}
        strokeWidth={3 + (1 - squeeze) * 1.5}
        opacity={0.85}
      />
      {/* Adductor activation glow between thighs */}
      <ellipse cx={cx} cy={hipY + 18} rx={10 + squeeze * 4} ry={6} fill={C.active} opacity={squeeze * 0.35} />
      {squeeze > 0.4 && (
        <text x={cx + 16} y={hipY + 22} fontSize="10" fontWeight="bold" fill={C.active} fontFamily="monospace">adductors</text>
      )}
      {/* Direction arrows when squeezing */}
      {squeeze > 0.2 && (
        <>
          <text x={lKneeX - 14} y={kneeY + 4} fontSize="14" fill={C.active} fontWeight="bold">{"\u2192"}</text>
          <text x={rKneeX + 4} y={kneeY + 4} fontSize="14" fill={C.active} fontWeight="bold">{"\u2190"}</text>
        </>
      )}
      <text x={cx - 60} y={hipY - 12} fontSize="9" fill={C.label} fontFamily="monospace">{"~80\u00B0 hip"}</text>
      <text x={lFootX - 25} y={floorY + 12} fontSize="8" fill={C.leftLeg} fontFamily="monospace">L passive</text>
    </g>
  );
}

// Single-leg hip thrust — shoulders on bench, right foot planted, left passive
export function SLHipThrustRight({ t }: AnimProps) {
  const phase = t < 0.5 ? t / 0.5 : 1 - (t - 0.5) / 0.5;
  const lift = Math.sin(phase * Math.PI * 0.5);
  const hold = phase > 0.4 && phase < 0.6 ? 1 : lift;

  const floorY = 220;
  // Bench on left — shoulders rest on its top edge
  const benchX = 55, benchY = 160, benchW = 60, benchH = 14;
  // Shoulders stay on bench top
  const shX = benchX + benchW - 10, shY = benchY - 4;
  // Head rests on bench, tucked chin
  const headX = benchX + 20, headY = benchY - 16;
  // Hip lifts: at bottom it nearly touches floor, at top it's level with bench
  const hipX = 200;
  const hipYBottom = 210, hipYTop = 168;
  const hipY = hipYBottom - hold * (hipYBottom - hipYTop);
  // Right foot planted on floor, knee ~90° at top
  const rFootX = 290, rFootY = floorY;
  const rKneeX = 260, rKneeY = floorY - 20 - hold * 10;
  // Left leg extended passively forward from hip
  const lThighEndX = hipX - 30, lThighEndY = hipY - 18;
  const lFootX = hipX - 65, lFootY = hipY - 10;
  // Barbell across hips
  const barY = hipY - 6;

  return (
    <g>
      <Floor y={floorY} />
      {/* Bench */}
      <rect x={benchX} y={benchY} width={benchW} height={benchH} rx="2" fill={C.equipment} />
      <rect x={benchX + 6} y={benchY + benchH} width="5" height={floorY - benchY - benchH} fill={C.equipLight} />
      <rect x={benchX + benchW - 11} y={benchY + benchH} width="5" height={floorY - benchY - benchH} fill={C.equipLight} />
      {/* Head (tucked chin) */}
      <circle cx={headX} cy={headY} r="12" fill="none" stroke={C.body} strokeWidth="3" />
      {/* Upper back on bench */}
      <line x1={headX + 10} y1={headY + 6} x2={shX} y2={shY} stroke={C.body} strokeWidth="5" strokeLinecap="round" />
      {/* Torso from shoulders to hip */}
      <line x1={shX} y1={shY} x2={hipX} y2={hipY} stroke={C.body} strokeWidth="5" strokeLinecap="round" />
      {/* Hip joint */}
      <circle cx={hipX} cy={hipY} r="4" fill={C.body} />
      {/* Right thigh (active) */}
      <line x1={hipX} y1={hipY} x2={rKneeX} y2={rKneeY} stroke={C.active} strokeWidth="6" strokeLinecap="round" />
      {/* Right shin */}
      <line x1={rKneeX} y1={rKneeY} x2={rFootX} y2={rFootY} stroke={C.active} strokeWidth="6" strokeLinecap="round" />
      {/* Right foot planted */}
      <rect x={rFootX - 10} y={rFootY - 4} width="20" height="5" rx="2" fill={C.active} />
      {/* Left leg extended forward — passive red dashed */}
      <line x1={hipX} y1={hipY} x2={lThighEndX} y2={lThighEndY} stroke={C.leftLeg} strokeWidth="4" strokeLinecap="round" strokeDasharray="6,3" opacity="0.6" />
      <line x1={lThighEndX} y1={lThighEndY} x2={lFootX} y2={lFootY} stroke={C.leftLeg} strokeWidth="3.5" strokeLinecap="round" strokeDasharray="6,3" opacity="0.6" />
      <ellipse cx={lFootX - 4} cy={lFootY + 2} rx="6" ry="3" fill="none" stroke={C.leftLeg} strokeWidth="1.5" strokeDasharray="3,2" opacity="0.5" />
      {/* Barbell across hips */}
      <rect x={hipX - 55} y={barY} width="110" height="6" rx="2" fill="#aaa" opacity="0.85" />
      <rect x={hipX - 60} y={barY - 7} width="7" height="20" rx="2" fill={C.weight} />
      <rect x={hipX + 53} y={barY - 7} width="7" height="20" rx="2" fill={C.weight} />
      {/* Labels */}
      <text x={rKneeX + 8} y={rKneeY - 6} fontSize="11" fontWeight="bold" fill={C.active} fontFamily="monospace">R</text>
      <text x={lFootX - 18} y={lFootY - 4} fontSize="10" fill={C.leftLeg} fontFamily="monospace">L</text>
      {/* Glute activation glow */}
      <circle cx={hipX + 8} cy={hipY - 6} r="14" fill={C.active} opacity={hold * 0.3} />
      {hold > 0.35 && (
        <text x={hipX - 30} y={hipY - 22} fontSize="10" fontWeight="bold" fill={C.active} fontFamily="monospace">SQUEEZE</text>
      )}
      {/* Heel drive cue */}
      <text x={rFootX - 14} y={floorY + 14} fontSize="8" fill={C.strap} fontFamily="monospace">heel drive</text>
    </g>
  );
}

// Single-leg leg press — 45° incline sled, right foot HIGH on plate, left hangs free
export function SLLegPressRight({ t }: AnimProps) {
  const phase = t < 0.5 ? t / 0.5 : 1 - (t - 0.5) / 0.5;
  const press = Math.sin(phase * Math.PI * 0.5);

  const floorY = 230;
  // Seat at lower-left; sled moves along 45° rail
  const seatX = 70, seatY = 175;
  // Rail runs 45° from lower-left to upper-right
  const railX1 = 80, railY1 = 220, railX2 = 320, railY2 = 70;
  // Sled platform position: bottom (near body, ~80° hip) to top (extended)
  // At press=0: sled close → at press=1: sled far
  const sledT = 0.3 + press * 0.5; // fraction along rail
  const sledCx = railX1 + sledT * (railX2 - railX1);
  const sledCy = railY1 + sledT * (railY2 - railY1);
  // Sled platform rect perpendicular to rail (45° tilt)
  const pW = 30, pH = 8;
  // Person seated: body is fixed, right leg connects seat to sled
  const hipX = seatX + 25, hipY = seatY - 10;
  const headX = seatX, headY = seatY - 52;
  // Right knee is midpoint on right leg
  const rKneeX = (hipX + sledCx) / 2 + 10;
  const rKneeY = (hipY + sledCy) / 2 + 8;
  // Left leg hangs down from hip
  const lKneeX = hipX - 15, lKneeY = hipY + 40;
  const lFootX = hipX - 20, lFootY = hipY + 80;

  return (
    <g>
      <Floor y={floorY} />
      {/* Rail tracks (two parallel lines at 45°) */}
      <line x1={railX1 - 4} y1={railY1 + 4} x2={railX2 - 4} y2={railY2 + 4} stroke={C.equipment} strokeWidth="3" strokeLinecap="round" />
      <line x1={railX1 + 4} y1={railY1 - 4} x2={railX2 + 4} y2={railY2 - 4} stroke={C.equipment} strokeWidth="3" strokeLinecap="round" />
      {/* Weight stack at top of rail */}
      <rect x={railX2 - 12} y={railY2 - 28} width="24" height="20" rx="2" fill={C.weight} />
      <rect x={railX2 - 10} y={railY2 - 26} width="20" height="4" rx="1" fill={C.equipLight} />
      <rect x={railX2 - 10} y={railY2 - 20} width="20" height="4" rx="1" fill={C.equipLight} />
      {/* Sled platform (tilted 45°) */}
      <rect
        x={sledCx - pW / 2}
        y={sledCy - pH / 2}
        width={pW}
        height={pH}
        rx="2"
        fill={C.equipLight}
        transform={`rotate(-45 ${sledCx} ${sledCy})`}
      />
      {/* Seat back */}
      <rect x={seatX - 8} y={seatY - 70} width="10" height="55" rx="3" fill={C.equipment} />
      {/* Seat */}
      <rect x={seatX - 8} y={seatY - 15} width="45" height="10" rx="2" fill={C.equipment} />
      {/* Head */}
      <circle cx={headX} cy={headY} r="12" fill="none" stroke={C.body} strokeWidth="3" />
      {/* Torso reclined */}
      <line x1={headX} y1={headY + 12} x2={hipX} y2={hipY} stroke={C.body} strokeWidth="5" strokeLinecap="round" />
      {/* Hip joint */}
      <circle cx={hipX} cy={hipY} r="4" fill={C.body} />
      {/* Right thigh */}
      <line x1={hipX} y1={hipY} x2={rKneeX} y2={rKneeY} stroke={C.active} strokeWidth="6" strokeLinecap="round" />
      {/* Right shin to sled */}
      <line x1={rKneeX} y1={rKneeY} x2={sledCx} y2={sledCy} stroke={C.active} strokeWidth="6" strokeLinecap="round" />
      {/* Right foot on sled */}
      <circle cx={sledCx} cy={sledCy} r="5" fill={C.active} />
      {/* Left leg hanging — passive red dashed */}
      <line x1={hipX} y1={hipY} x2={lKneeX} y2={lKneeY} stroke={C.leftLeg} strokeWidth="4" strokeLinecap="round" strokeDasharray="6,3" opacity="0.6" />
      <line x1={lKneeX} y1={lKneeY} x2={lFootX} y2={lFootY} stroke={C.leftLeg} strokeWidth="3.5" strokeLinecap="round" strokeDasharray="6,3" opacity="0.6" />
      <ellipse cx={lFootX} cy={lFootY + 4} rx="5" ry="3" fill="none" stroke={C.leftLeg} strokeWidth="1.5" strokeDasharray="3,2" opacity="0.5" />
      {/* Labels */}
      <text x={sledCx + 8} y={sledCy - 8} fontSize="9" fontWeight="bold" fill={C.active} fontFamily="monospace">HIGH foot</text>
      <text x={rKneeX + 4} y={rKneeY - 6} fontSize="10" fontWeight="bold" fill={C.active} fontFamily="monospace">R</text>
      <text x={lFootX + 6} y={lFootY + 4} fontSize="10" fill={C.leftLeg} fontFamily="monospace">L</text>
      {/* Hip angle label — shown near hip when close to body */}
      {press < 0.6 && (
        <text x={hipX + 14} y={hipY - 4} fontSize="9" fill={C.label} fontFamily="monospace">{"~80\u00B0"}</text>
      )}
      {/* Glute activation glow at hip */}
      <circle cx={hipX + 6} cy={hipY - 4} r="11" fill={C.active} opacity={press * 0.28} />
      {press > 0.7 && (
        <text x={hipX - 20} y={hipY - 20} fontSize="9" fontWeight="bold" fill={C.active} fontFamily="monospace">PRESS</text>
      )}
    </g>
  );
}

// Hack squat — diagonal rail, back against pad, right foot on platform, left hangs
export function HackSquatRight({ t }: AnimProps) {
  const phase = t < 0.5 ? t / 0.5 : 1 - (t - 0.5) / 0.5;
  const squat = Math.sin(phase * Math.PI * 0.5);

  const floorY = 225;
  // Hack squat: person faces away from the angled sled backing
  // Rail goes from lower-right to upper-left (opposite of leg press)
  const railX1 = 330, railY1 = 210, railX2 = 120, railY2 = 60;
  // Platform at bottom of rail near floor; body slides up/down
  // squat=0 → low position (knees bent), squat=1 → standing tall
  const bodyT = 0.2 + squat * 0.55;
  // Center of mass travels along rail
  const bodyCx = railX1 + bodyT * (railX2 - railX1);
  const bodyCy = railY1 + bodyT * (railY2 - railY1);
  // Foot platform is below center of mass on the rail
  const platT = 0.05;
  const platX = railX1 + platT * (railX2 - railX1);
  const platY = railY1 + platT * (railY2 - railY1);
  // Person geometry relative to bodyCx/bodyCy
  const hipX = bodyCx, hipY = bodyCy;
  const shX = bodyCx - 8, shY = bodyCy - 40;
  const headX = shX, headY = shY - 22;
  // Right foot stays on the fixed platform, knee bends with position
  const rFootX = platX + 5, rFootY = platY - 4;
  const rKneeX = (hipX + rFootX) / 2 + 12;
  const rKneeY = (hipY + rFootY) / 2 - 10;
  // Left leg hangs off to the side, not on platform
  const lKneeX = hipX + 28, lKneeY = hipY + 22;
  const lFootX = hipX + 35, lFootY = hipY + 52;
  // Shoulder pad position (fixed at top)
  const padY = shY;

  return (
    <g>
      <Floor y={floorY} />
      {/* Machine frame — two diagonal rails */}
      <line x1={railX1 - 6} y1={railY1 - 6} x2={railX2 - 6} y2={railY2 - 6} stroke={C.equipment} strokeWidth="4" strokeLinecap="round" />
      <line x1={railX1 + 6} y1={railY1 + 6} x2={railX2 + 6} y2={railY2 + 6} stroke={C.equipment} strokeWidth="4" strokeLinecap="round" />
      {/* Back pad (angled, fixed to frame) */}
      <rect
        x={shX - 6}
        y={shY - 10}
        width="12"
        height="45"
        rx="4"
        fill={C.equipLight}
        opacity="0.7"
      />
      {/* Shoulder pads */}
      <rect x={shX - 18} y={padY - 6} width="36" height="8" rx="3" fill={C.equipment} />
      {/* Foot platform */}
      <rect x={platX - 5} y={platY - 5} width="30" height="8" rx="2" fill={C.equipLight} />
      {/* Weight stack at top of frame */}
      <rect x={railX2 - 10} y={railY2 - 30} width="20" height="22" rx="2" fill={C.weight} />
      <rect x={railX2 - 8} y={railY2 - 28} width="16" height="4" rx="1" fill={C.equipLight} />
      <rect x={railX2 - 8} y={railY2 - 22} width="16" height="4" rx="1" fill={C.equipLight} />
      {/* Head */}
      <circle cx={headX} cy={headY} r="12" fill="none" stroke={C.body} strokeWidth="3" />
      {/* Torso against pad */}
      <line x1={headX} y1={headY + 12} x2={shX} y2={shY} stroke={C.body} strokeWidth="4" strokeLinecap="round" />
      <line x1={shX} y1={shY} x2={hipX} y2={hipY} stroke={C.body} strokeWidth="5" strokeLinecap="round" />
      {/* Hip joint */}
      <circle cx={hipX} cy={hipY} r="4" fill={C.body} />
      {/* Right thigh (active) */}
      <line x1={hipX} y1={hipY} x2={rKneeX} y2={rKneeY} stroke={C.active} strokeWidth="6" strokeLinecap="round" />
      {/* Right shin */}
      <line x1={rKneeX} y1={rKneeY} x2={rFootX} y2={rFootY} stroke={C.active} strokeWidth="6" strokeLinecap="round" />
      <rect x={rFootX - 6} y={rFootY - 4} width="14" height="5" rx="2" fill={C.active} />
      {/* Left leg hanging off side — passive red dashed */}
      <line x1={hipX} y1={hipY} x2={lKneeX} y2={lKneeY} stroke={C.leftLeg} strokeWidth="4" strokeLinecap="round" strokeDasharray="6,3" opacity="0.6" />
      <line x1={lKneeX} y1={lKneeY} x2={lFootX} y2={lFootY} stroke={C.leftLeg} strokeWidth="3.5" strokeLinecap="round" strokeDasharray="6,3" opacity="0.6" />
      <ellipse cx={lFootX + 2} cy={lFootY + 4} rx="5" ry="3" fill="none" stroke={C.leftLeg} strokeWidth="1.5" strokeDasharray="3,2" opacity="0.5" />
      {/* Labels */}
      <text x={rKneeX + 6} y={rKneeY - 6} fontSize="10" fontWeight="bold" fill={C.active} fontFamily="monospace">R</text>
      <text x={lFootX + 6} y={lFootY + 4} fontSize="10" fill={C.leftLeg} fontFamily="monospace">L</text>
      {/* Hip angle warning when squatting low */}
      {squat < 0.5 && (
        <text x={hipX + 14} y={hipY + 6} fontSize="9" fill={C.label} fontFamily="monospace">{"~80\u00B0"}</text>
      )}
      {/* Glute activation glow */}
      <circle cx={hipX - 4} cy={hipY - 8} r="12" fill={C.active} opacity={squat * 0.28} />
      {squat > 0.6 && (
        <text x={hipX - 30} y={hipY - 24} fontSize="9" fontWeight="bold" fill={C.active} fontFamily="monospace">DRIVE</text>
      )}
    </g>
  );
}

// Low box step-up — right foot on box, right leg drives, left hangs passive behind
export function LowBoxStepUpRight({ t }: AnimProps) {
  const phase = t < 0.5 ? t / 0.5 : 1 - (t - 0.5) / 0.5;
  const rise = Math.sin(phase * Math.PI * 0.5);

  const floorY = 220;
  // Low box: height ~28px (below knee)
  const boxX = 155, boxW = 70, boxH = 28;
  const boxY = floorY - boxH;
  // Right foot always on top of box, center-ish
  const rFootX = boxX + boxW / 2, rFootY = boxY;
  // Phase 0: body low, knee ~90°; phase 1: standing tall on box
  // Hip rises from near-floor level to above box
  const hipYBottom = floorY - 20, hipYTop = boxY - 55;
  const hipX = rFootX - 10, hipY = hipYBottom - rise * (hipYBottom - hipYTop);
  // Right knee between hip and foot
  const rKneeX = rFootX - 5, rKneeY = (hipY + rFootY) / 2 + (1 - rise) * 12;
  // Torso rises with hips
  const shX = hipX + 5, shY = hipY - 42;
  const headX = shX, headY = shY - 20;
  // Left leg hangs BEHIND body — passive
  const lHipX = hipX + 12;
  const lKneeX = lHipX + 18, lKneeY = hipY + 30 + rise * 10;
  const lFootX = lKneeX + 8, lFootY = lKneeY + 30;
  // Dumbbells at sides
  const lDBx = shX - 22, lDBy = shY + 28;
  const rDBx = shX + 18, rDBy = shY + 28;

  return (
    <g>
      <Floor y={floorY} />
      {/* Box */}
      <rect x={boxX} y={boxY} width={boxW} height={boxH} rx="3" fill="#1e1e1e" stroke={C.equipment} strokeWidth="1.5" />
      {/* Box top highlight */}
      <rect x={boxX} y={boxY} width={boxW} height="3" rx="2" fill={C.equipLight} opacity="0.4" />
      {/* Head */}
      <circle cx={headX} cy={headY} r="12" fill="none" stroke={C.body} strokeWidth="3" />
      {/* Torso */}
      <line x1={headX} y1={headY + 12} x2={shX} y2={shY} stroke={C.body} strokeWidth="4" strokeLinecap="round" />
      <line x1={shX} y1={shY} x2={hipX} y2={hipY} stroke={C.body} strokeWidth="5" strokeLinecap="round" />
      {/* Arms with dumbbells */}
      <line x1={shX - 8} y1={shY} x2={lDBx} y2={lDBy} stroke={C.body} strokeWidth="3" strokeLinecap="round" />
      <Dumbbell x={lDBx} y={lDBy} angle={90} size={22} />
      <line x1={shX + 8} y1={shY} x2={rDBx} y2={rDBy} stroke={C.body} strokeWidth="3" strokeLinecap="round" />
      <Dumbbell x={rDBx} y={rDBy} angle={90} size={22} />
      {/* Hip joint */}
      <circle cx={hipX} cy={hipY} r="4" fill={C.body} />
      {/* Right thigh (active) */}
      <line x1={hipX} y1={hipY} x2={rKneeX} y2={rKneeY} stroke={C.active} strokeWidth="6" strokeLinecap="round" />
      {/* Right shin */}
      <line x1={rKneeX} y1={rKneeY} x2={rFootX} y2={rFootY} stroke={C.active} strokeWidth="6" strokeLinecap="round" />
      {/* Right foot on box */}
      <rect x={rFootX - 10} y={rFootY - 4} width="20" height="5" rx="2" fill={C.active} />
      {/* Left leg hanging behind — passive red dashed */}
      <line x1={lHipX} y1={hipY} x2={lKneeX} y2={lKneeY} stroke={C.leftLeg} strokeWidth="4" strokeLinecap="round" strokeDasharray="6,3" opacity="0.6" />
      <line x1={lKneeX} y1={lKneeY} x2={lFootX} y2={lFootY} stroke={C.leftLeg} strokeWidth="3.5" strokeLinecap="round" strokeDasharray="6,3" opacity="0.6" />
      <ellipse cx={lFootX + 2} cy={lFootY + 4} rx="5" ry="3" fill="none" stroke={C.leftLeg} strokeWidth="1.5" strokeDasharray="3,2" opacity="0.5" />
      {/* Labels */}
      <text x={rKneeX + 8} y={rKneeY - 6} fontSize="10" fontWeight="bold" fill={C.active} fontFamily="monospace">R</text>
      <text x={lFootX + 6} y={lFootY + 4} fontSize="10" fill={C.leftLeg} fontFamily="monospace">L</text>
      {/* Box label */}
      <text x={boxX + 2} y={floorY + 13} fontSize="8" fill={C.label} fontFamily="monospace">BELOW knee</text>
      {/* Passive left leg warning */}
      <text x={lFootX - 4} y={lFootY + 16} fontSize="8" fill={C.leftLeg} fontFamily="monospace">passive</text>
      {/* Glute activation glow */}
      <circle cx={hipX + 6} cy={hipY - 6} r="13" fill={C.active} opacity={rise * 0.3} />
      {rise > 0.5 && (
        <text x={hipX - 30} y={hipY - 20} fontSize="10" fontWeight="bold" fill={C.active} fontFamily="monospace">DRIVE</text>
      )}
    </g>
  );
}

// Stability ball hamstring curl — supine, hips bridged, right heel on ball, curl toward glutes
export function StabBallHamCurlRight({ t }: AnimProps) {
  const phase = t < 0.5 ? t / 0.5 : 1 - (t - 0.5) / 0.5;
  const curl = Math.sin(phase * Math.PI * 0.5);

  const floorY = 220;
  const matY = floorY - 2;
  // Ball animates: extended (far right) to curled (closer to hips)
  const ballR = 22;
  const ballXFar = 310, ballXNear = 255;
  const ballX = ballXFar - curl * (ballXFar - ballXNear);
  const ballY = floorY - ballR;
  // Hips stay bridged (raised) throughout
  const hipX = 210, hipY = floorY - 45;
  // Torso horizontal on mat
  const shX = 145, shY = floorY - 18;
  const headX = 110, headY = floorY - 22;
  // Right heel on top of ball
  const rHeelX = ballX, rHeelY = ballY - ballR + 4;
  // Right knee: extended when curl=0, bent when curl=1
  const rKneeX = (hipX + rHeelX) / 2 + (1 - curl) * 10;
  const rKneeY = hipY - 10 - (1 - curl) * 8;
  // Left leg: bent knee, foot resting on floor (not loading)
  const lKneeX = hipX - 45, lKneeY = hipY + 10;
  const lFootX = hipX - 50, lFootY = floorY;

  return (
    <g>
      {/* Mat / floor */}
      <Floor y={floorY} />
      <rect x={70} y={matY - 2} width={260} height="4" rx="2" fill="#1a2636" opacity="0.7" />
      {/* Stability ball */}
      <circle cx={ballX} cy={ballY} r={ballR} fill="none" stroke={C.equipLight} strokeWidth="2.5" />
      <circle cx={ballX} cy={ballY} r={ballR - 4} fill="none" stroke={C.equipLight} strokeWidth="1" opacity="0.4" />
      {/* Ball cross-lines for sphere effect */}
      <ellipse cx={ballX} cy={ballY} rx={ballR} ry={ballR * 0.35} fill="none" stroke={C.equipLight} strokeWidth="1" opacity="0.3" />
      {/* Head */}
      <circle cx={headX} cy={headY} r="12" fill="none" stroke={C.body} strokeWidth="3" />
      {/* Upper back / torso on mat */}
      <line x1={headX + 10} y1={headY + 4} x2={shX} y2={shY} stroke={C.body} strokeWidth="5" strokeLinecap="round" />
      {/* Torso to bridged hips */}
      <line x1={shX} y1={shY} x2={hipX} y2={hipY} stroke={C.body} strokeWidth="5" strokeLinecap="round" />
      {/* Hip joint */}
      <circle cx={hipX} cy={hipY} r="4" fill={C.body} />
      {/* Right thigh */}
      <line x1={hipX} y1={hipY} x2={rKneeX} y2={rKneeY} stroke={C.active} strokeWidth="6" strokeLinecap="round" />
      {/* Right shin to ball */}
      <line x1={rKneeX} y1={rKneeY} x2={rHeelX} y2={rHeelY} stroke={C.active} strokeWidth="6" strokeLinecap="round" />
      {/* Right heel on ball */}
      <circle cx={rHeelX} cy={rHeelY} r="5" fill={C.active} />
      {/* Left leg — passive red dashed (foot on floor, not loading) */}
      <line x1={hipX - 6} y1={hipY} x2={lKneeX} y2={lKneeY} stroke={C.leftLeg} strokeWidth="4" strokeLinecap="round" strokeDasharray="6,3" opacity="0.6" />
      <line x1={lKneeX} y1={lKneeY} x2={lFootX} y2={lFootY} stroke={C.leftLeg} strokeWidth="3.5" strokeLinecap="round" strokeDasharray="6,3" opacity="0.6" />
      <ellipse cx={lFootX} cy={lFootY} rx="6" ry="3" fill="none" stroke={C.leftLeg} strokeWidth="1.5" strokeDasharray="3,2" opacity="0.5" />
      {/* Labels */}
      <text x={rKneeX + 6} y={rKneeY - 8} fontSize="10" fontWeight="bold" fill={C.active} fontFamily="monospace">R</text>
      <text x={lKneeX - 16} y={lKneeY - 4} fontSize="10" fill={C.leftLeg} fontFamily="monospace">L</text>
      {/* Hamstring / glute activation glow — back of right thigh */}
      <circle
        cx={(hipX + rKneeX) / 2 + 4}
        cy={(hipY + rKneeY) / 2}
        r="14"
        fill={C.active}
        opacity={curl * 0.3}
      />
      {curl > 0.35 && (
        <text x={hipX + 14} y={hipY - 16} fontSize="9" fontWeight="bold" fill={C.active} fontFamily="monospace">CURL</text>
      )}
      {/* Hips-up cue */}
      <text x={shX - 10} y={hipY - 10} fontSize="8" fill={C.strap} fontFamily="monospace">hips up</text>
    </g>
  );
}

export const GLUTE_ANIMS: Record<string, React.ComponentType<AnimProps>> = {
  g1: GluteBridge,
  g2: BandedClamshell,
  g3: CableKickback,
  g4: SeatedHipAbduction,
  g5: SeatedHipAdduction,
  g6: SLHipThrustRight,
  g7: SLLegPressRight,
  g8: HackSquatRight,
  g9: LowBoxStepUpRight,
  g10: StabBallHamCurlRight,
};
