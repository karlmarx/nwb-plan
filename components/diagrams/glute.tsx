// Glute exercise animations (new rAF-based versions)

import { C, Floor } from "./helpers";

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

export const GLUTE_ANIMS: Record<string, React.ComponentType<AnimProps>> = {
  g1: GluteBridge,
  g2: BandedClamshell,
  g3: CableKickback,
  g4: SeatedHipAbduction,
  g5: SeatedHipAdduction,
};
