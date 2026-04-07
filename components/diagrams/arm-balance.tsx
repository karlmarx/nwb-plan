// Arm balance prep animations
// Migrated from core-demo-guide.tsx

import { C, Floor, Anchor, Strap, Pbar, Fig4Hook } from "./helpers";

interface AnimProps { t: number }

export function TRXKneeTuckFig4({ t }: AnimProps) {
  const phase = t < 0.5 ? t / 0.5 : 1 - (t - 0.5) / 0.5;
  const tuck = Math.sin(phase * Math.PI * 0.5);
  const floorY = 200, anchorX = 340, anchorY = 80;
  const elbX = 100, elbY = floorY - 5;
  const shX = elbX + 15, shY = floorY - 42;
  const hipX = shX + 55 - tuck * 20, hipY = floorY - 35 + tuck * 5;
  const rKneeX = hipX + 30 - tuck * 35, rKneeY = hipY - 5 - tuck * 15;
  const rFootX = rKneeX + 15 - tuck * 5, rFootY = rKneeY + 20 - tuck * 5;
  const rCalfMidX = (rKneeX + rFootX) / 2, rCalfMidY = (rKneeY + rFootY) / 2;
  return (
    <g>
      <line x1="40" y1={floorY + 5} x2="360" y2={floorY + 5} stroke={C.floor} strokeWidth="1" strokeDasharray="4,4" />
      <Anchor x={anchorX} y={anchorY} />
      <line x1={elbX - 15} y1={elbY + 3} x2={elbX} y2={elbY} stroke={C.body} strokeWidth="4" strokeLinecap="round" />
      <line x1={elbX} y1={elbY} x2={shX} y2={shY} stroke={C.body} strokeWidth="4" strokeLinecap="round" />
      <line x1={shX} y1={shY} x2={hipX} y2={hipY} stroke={C.body} strokeWidth="5" strokeLinecap="round" />
      <circle cx={shX - 10} cy={shY - 12} r="10" fill="none" stroke={C.body} strokeWidth="2.5" />
      <line x1={hipX + 3} y1={hipY} x2={rKneeX} y2={rKneeY} stroke={C.active} strokeWidth="4" strokeLinecap="round" />
      <line x1={rKneeX} y1={rKneeY} x2={rFootX} y2={rFootY} stroke={C.active} strokeWidth="4" strokeLinecap="round" />
      <circle cx={rFootX} cy={rFootY} r="4" fill={C.active} />
      <Strap x1={rFootX} y1={rFootY} x2={anchorX} y2={anchorY} />
      <Fig4Hook hipX={hipX} hipY={hipY} rKneeX={rKneeX} rKneeY={rKneeY} rCalfMidX={rCalfMidX} rCalfMidY={rCalfMidY} />
      <ellipse cx={(shX + hipX) / 2} cy={(shY + hipY) / 2 + 5} rx="16" ry="10" fill={C.active} opacity={tuck * 0.45} />
      {tuck > 0.3 && <text x={shX - 5} y={hipY + 18} fill={C.active} fontSize="10" fontWeight="bold" fontFamily="monospace">lower abs</text>}
    </g>
  );
}

export function TRXBodySawFig4({ t }: AnimProps) {
  const rock = Math.sin(t * Math.PI * 2);
  const floorY = 200, anchorX = 340, anchorY = 80;
  const elbX = 100, elbY = floorY - 5;
  const shX = elbX + 15 + rock * 12, shY = floorY - 40 - rock * 5;
  const hipX = shX + 58 + rock * 10, hipY = floorY - 35 - rock * 3;
  const rKneeX = hipX + 35, rKneeY = hipY + 2;
  const rFootX = rKneeX + 20 + rock * 8, rFootY = hipY + 15;
  const rCalfMidX = (rKneeX + rFootX) / 2, rCalfMidY = (rKneeY + rFootY) / 2;
  return (
    <g>
      <line x1="40" y1={floorY + 5} x2="360" y2={floorY + 5} stroke={C.floor} strokeWidth="1" strokeDasharray="4,4" />
      <Anchor x={anchorX} y={anchorY} />
      <line x1={elbX - 15} y1={elbY + 3} x2={elbX} y2={elbY} stroke={C.body} strokeWidth="4" strokeLinecap="round" />
      <line x1={elbX} y1={elbY} x2={shX} y2={shY} stroke={C.body} strokeWidth="4" strokeLinecap="round" />
      <line x1={shX} y1={shY} x2={hipX} y2={hipY} stroke={C.body} strokeWidth="5" strokeLinecap="round" />
      <circle cx={shX - 10} cy={shY - 12} r="10" fill="none" stroke={C.body} strokeWidth="2.5" />
      <line x1={hipX + 3} y1={hipY} x2={rKneeX} y2={rKneeY} stroke={C.active} strokeWidth="4" strokeLinecap="round" />
      <line x1={rKneeX} y1={rKneeY} x2={rFootX} y2={rFootY} stroke={C.active} strokeWidth="4" strokeLinecap="round" />
      <circle cx={rFootX} cy={rFootY} r="4" fill={C.active} />
      <Strap x1={rFootX} y1={rFootY} x2={anchorX} y2={anchorY} />
      <Fig4Hook hipX={hipX} hipY={hipY} rKneeX={rKneeX} rKneeY={rKneeY} rCalfMidX={rCalfMidX} rCalfMidY={rCalfMidY} />
      <ellipse cx={(shX + hipX) / 2} cy={(shY + hipY) / 2} rx="20" ry="8" fill={C.active} opacity={0.3 + Math.abs(rock) * 0.2} />
      <text x={(shX + hipX) / 2 - 10} y={(shY + hipY) / 2 - 12} fill={C.strap} fontSize="13" fontFamily="monospace">{rock > 0 ? "\u2192" : "\u2190"}</text>
    </g>
  );
}

export function LSitKneeTuck({ t }: AnimProps) {
  const phase = t < 0.5 ? t / 0.5 : 1 - (t - 0.5) / 0.5;
  const tuck = Math.sin(phase * Math.PI * 0.5);
  const floorY = 220;
  const lBarX = 165, rBarX = 235;
  const hipX = 200, hipY = 130;
  const shX = 200, shY = 95, hdY = 72;
  const lHandY = 128, rHandY = 128;
  const rKneeX = hipX + 15 + tuck * 10, rKneeY = hipY + 20 - tuck * 25;
  const rFootX = rKneeX + 5, rFootY = rKneeY + 25 - tuck * 10;
  const lFootX = hipX - 10, lFootY = floorY - 15;
  const lKneeX = hipX - 8, lKneeY = hipY + 40;
  return (
    <g>
      <line x1="60" y1={floorY} x2="340" y2={floorY} stroke={C.floor} strokeWidth="1" strokeDasharray="4,4" />
      <Pbar x={lBarX} y={floorY} h={floorY - lHandY + 10} />
      <Pbar x={rBarX} y={floorY} h={floorY - rHandY + 10} />
      <line x1={lBarX} y1={lHandY} x2={shX - 5} y2={shY + 5} stroke={C.body} strokeWidth="4" strokeLinecap="round" />
      <line x1={rBarX} y1={rHandY} x2={shX + 5} y2={shY + 5} stroke={C.body} strokeWidth="4" strokeLinecap="round" />
      <circle cx={lBarX} cy={lHandY} r="4" fill={C.body} />
      <circle cx={rBarX} cy={rHandY} r="4" fill={C.body} />
      <line x1={shX} y1={shY} x2={hipX} y2={hipY} stroke={C.body} strokeWidth="5" strokeLinecap="round" />
      <circle cx={shX} cy={hdY} r="12" fill="none" stroke={C.body} strokeWidth="3" />
      <line x1={hipX - 5} y1={hipY} x2={lKneeX} y2={lKneeY} stroke={C.leftLeg} strokeWidth="4" strokeLinecap="round" />
      <line x1={lKneeX} y1={lKneeY} x2={lFootX} y2={lFootY} stroke={C.leftLeg} strokeWidth="3.5" strokeLinecap="round" />
      <circle cx={lFootX} cy={lFootY} r="3" fill={C.leftLeg} />
      <line x1={hipX + 5} y1={hipY} x2={rKneeX} y2={rKneeY} stroke={C.active} strokeWidth="4.5" strokeLinecap="round" />
      <line x1={rKneeX} y1={rKneeY} x2={rFootX} y2={rFootY} stroke={C.active} strokeWidth="4" strokeLinecap="round" />
      <circle cx={rFootX} cy={rFootY} r="4" fill={C.active} />
      <ellipse cx={hipX} cy={hipY - 8} rx="12" ry="10" fill={C.active} opacity={tuck * 0.45} />
      {tuck > 0.3 && <text x={hipX + 20} y={hipY - 5} fill={C.active} fontSize="10" fontWeight="bold" fontFamily="monospace">compress</text>}
    </g>
  );
}

export function LSitHold({ t }: AnimProps) {
  const sway = Math.sin(t * Math.PI * 3) * 2;
  const floorY = 220;
  const lBarX = 165, rBarX = 235;
  const hipX = 200, hipY = 130;
  const shX = 200, shY = 95, hdY = 72;
  const lHandY = 128, rHandY = 128;
  const rFootX = hipX + 70 + sway, rFootY = hipY + 5;
  const lFootX = hipX - 10, lFootY = floorY - 15;
  return (
    <g>
      <line x1="60" y1={floorY} x2="340" y2={floorY} stroke={C.floor} strokeWidth="1" strokeDasharray="4,4" />
      <Pbar x={lBarX} y={floorY} h={floorY - lHandY + 10} />
      <Pbar x={rBarX} y={floorY} h={floorY - rHandY + 10} />
      <line x1={lBarX} y1={lHandY} x2={shX - 5} y2={shY + 5} stroke={C.body} strokeWidth="4" strokeLinecap="round" />
      <line x1={rBarX} y1={rHandY} x2={shX + 5} y2={shY + 5} stroke={C.body} strokeWidth="4" strokeLinecap="round" />
      <circle cx={lBarX} cy={lHandY} r="4" fill={C.body} />
      <circle cx={rBarX} cy={rHandY} r="4" fill={C.body} />
      <line x1={shX} y1={shY} x2={hipX} y2={hipY} stroke={C.body} strokeWidth="5" strokeLinecap="round" />
      <circle cx={shX} cy={hdY} r="12" fill="none" stroke={C.body} strokeWidth="3" />
      <line x1={hipX - 5} y1={hipY} x2={hipX - 8} y2={hipY + 40} stroke={C.leftLeg} strokeWidth="4" strokeLinecap="round" />
      <line x1={hipX - 8} y1={hipY + 40} x2={lFootX} y2={lFootY} stroke={C.leftLeg} strokeWidth="3.5" strokeLinecap="round" />
      <circle cx={lFootX} cy={lFootY} r="3" fill={C.leftLeg} />
      <line x1={hipX + 5} y1={hipY} x2={hipX + 40 + sway * 0.5} y2={hipY + 3} stroke={C.active} strokeWidth="5" strokeLinecap="round" />
      <line x1={hipX + 40 + sway * 0.5} y1={hipY + 3} x2={rFootX} y2={rFootY} stroke={C.active} strokeWidth="4" strokeLinecap="round" />
      <circle cx={rFootX} cy={rFootY} r="4" fill={C.active} />
      <ellipse cx={hipX} cy={hipY - 5} rx="12" ry="10" fill={C.active} opacity={0.35} />
      <text x={hipX + 18} y={hipY - 12} fill={C.active} fontSize="10" fontWeight="bold" fontFamily="monospace">HOLD</text>
    </g>
  );
}

export function TuckPlancheLean({ t }: AnimProps) {
  const phase = t < 0.5 ? t / 0.5 : 1 - (t - 0.5) / 0.5;
  const lean = Math.sin(phase * Math.PI * 0.5);
  const floorY = 220;
  const lBarX = 165, rBarX = 235;
  const handY = floorY - 40;
  const shX = 200 + lean * 25, shY = handY - 35 + lean * 5;
  const hipX = 200 - lean * 5, hipY = handY - 15 + lean * 10;
  const hdX = shX + 5, hdY = shY - 16;
  const rKneeX = shX - 10 + lean * 5, rKneeY = hipY + 5;
  const rFootX = rKneeX - 10, rFootY = rKneeY + 15;
  const lFootX = hipX - 50 - lean * 15, lFootY = hipY + 10;
  return (
    <g>
      <line x1="60" y1={floorY} x2="340" y2={floorY} stroke={C.floor} strokeWidth="1" strokeDasharray="4,4" />
      <Pbar x={lBarX} y={floorY} h={floorY - handY + 5} />
      <Pbar x={rBarX} y={floorY} h={floorY - handY + 5} />
      <line x1={lBarX} y1={handY} x2={shX - 10} y2={shY + 5} stroke={C.body} strokeWidth="4" strokeLinecap="round" />
      <line x1={rBarX} y1={handY} x2={shX + 10} y2={shY + 5} stroke={C.body} strokeWidth="4" strokeLinecap="round" />
      <circle cx={lBarX} cy={handY} r="4" fill={C.body} />
      <circle cx={rBarX} cy={handY} r="4" fill={C.body} />
      <line x1={shX} y1={shY} x2={hipX} y2={hipY} stroke={C.body} strokeWidth="5" strokeLinecap="round" />
      <circle cx={hdX} cy={hdY} r="11" fill="none" stroke={C.body} strokeWidth="2.5" />
      <line x1={hipX + 5} y1={hipY} x2={rKneeX} y2={rKneeY} stroke={C.active} strokeWidth="4" strokeLinecap="round" />
      <line x1={rKneeX} y1={rKneeY} x2={rFootX} y2={rFootY} stroke={C.active} strokeWidth="3.5" strokeLinecap="round" />
      <circle cx={rFootX} cy={rFootY} r="3" fill={C.active} />
      <line x1={hipX - 5} y1={hipY} x2={lFootX} y2={lFootY} stroke={C.leftLeg} strokeWidth="4" strokeLinecap="round" />
      <circle cx={lFootX} cy={lFootY} r="3" fill={C.leftLeg} />
      {lean > 0.2 && <text x={shX + 15} y={shY - 5} fill={C.strap} fontSize="12" fontFamily="monospace">{"\u2192 lean"}</text>}
      <ellipse cx={shX} cy={shY + 5} rx="10" ry="8" fill={C.strap} opacity={lean * 0.3} />
      <ellipse cx={(hipX + shX) / 2} cy={(hipY + shY) / 2} rx="10" ry="8" fill={C.active} opacity={lean * 0.35} />
    </g>
  );
}

export function SupportProtraction({ t }: AnimProps) {
  const pulse = Math.sin(t * Math.PI * 4) * 0.5 + 0.5;
  const floorY = 220;
  const lBarX = 165, rBarX = 235;
  const handY = floorY - 40;
  const hipX = 200, hipY = 140;
  const shX = 200, shY = 100;
  const hdY = 78;
  const protr = pulse * 6;
  return (
    <g>
      <line x1="60" y1={floorY} x2="340" y2={floorY} stroke={C.floor} strokeWidth="1" strokeDasharray="4,4" />
      <Pbar x={lBarX} y={floorY} h={floorY - handY + 5} />
      <Pbar x={rBarX} y={floorY} h={floorY - handY + 5} />
      <line x1={lBarX} y1={handY} x2={shX - 8 - protr} y2={shY + 5} stroke={C.body} strokeWidth="4" strokeLinecap="round" />
      <line x1={rBarX} y1={handY} x2={shX + 8 + protr} y2={shY + 5} stroke={C.body} strokeWidth="4" strokeLinecap="round" />
      <circle cx={lBarX} cy={handY} r="4" fill={C.body} />
      <circle cx={rBarX} cy={handY} r="4" fill={C.body} />
      <line x1={shX} y1={shY - protr * 0.5} x2={hipX} y2={hipY} stroke={C.body} strokeWidth="5" strokeLinecap="round" />
      <circle cx={shX} cy={hdY - protr * 0.5} r="12" fill="none" stroke={C.body} strokeWidth="3" />
      <ellipse cx={shX - 15} cy={shY - protr * 0.3} rx="8" ry="10" fill={C.strap} opacity={pulse * 0.4} />
      <ellipse cx={shX + 15} cy={shY - protr * 0.3} rx="8" ry="10" fill={C.strap} opacity={pulse * 0.4} />
      {pulse > 0.6 && <text x={shX - 25} y={shY - 15} fill={C.strap} fontSize="9" fontWeight="bold" fontFamily="monospace">protract</text>}
      <line x1={hipX - 5} y1={hipY} x2={hipX - 10} y2={hipY + 35} stroke={C.leftLeg} strokeWidth="4" strokeLinecap="round" />
      <line x1={hipX - 10} y1={hipY + 35} x2={hipX - 12} y2={floorY - 15} stroke={C.leftLeg} strokeWidth="3" strokeLinecap="round" />
      <line x1={hipX + 5} y1={hipY} x2={hipX + 10} y2={hipY + 35} stroke={C.body} strokeWidth="4" strokeLinecap="round" />
      <line x1={hipX + 10} y1={hipY + 35} x2={hipX + 12} y2={floorY - 15} stroke={C.body} strokeWidth="3" strokeLinecap="round" />
    </g>
  );
}

// a7 — Forearm plank on right knee, draw right knee toward right elbow.
// Left leg stays flat and dead on the mat the entire time.
export function PlankKneeTuckR({ t }: AnimProps) {
  const phase = t < 0.5 ? t / 0.5 : 1 - (t - 0.5) / 0.5;
  const lift = Math.sin(phase * Math.PI * 0.5);
  const hold = phase > 0.4 && phase < 0.6 ? 1 : lift;

  const floorY = 220;

  // Forearms on mat — left side of canvas, head at far left
  const headX = 60,  headY = 170;
  const lElbX  = 90, lElbY = floorY - 8;   // left forearm (near head)
  const rElbX  = 130, rElbY = floorY - 8;  // right forearm

  // Shoulder sits above forearms
  const shX = 125, shY = 180;

  // Hip rises slightly in plank; stays roughly constant (it's plank position)
  const hipX = 210, hipY = 175;

  // RIGHT knee: starts extended (behind hip) → draws forward toward right elbow
  const rKneeX = hipX - 10 - hold * 55; // pulls forward (toward left/shoulder side)
  const rKneeY = hipY - 5  - hold * 25; // rises as it tucks
  const rFootX = rKneeX + 18 + hold * 10;
  const rFootY = rKneeY + 25 - hold * 10;

  // LEFT leg: FLAT on the mat, straight back — never moves
  const lThighX2 = 275, lThighY2 = floorY - 3;
  const lFootX   = 345, lFootY   = floorY - 2;

  // Hip flexor / oblique activation glow on right side of trunk
  const glowCx = (shX + hipX) / 2 + 5;
  const glowCy = (shY + hipY) / 2;

  return (
    <g>
      {/* Mat / floor */}
      <line x1="30" y1={floorY} x2="370" y2={floorY} stroke={C.floor} strokeWidth="1" strokeDasharray="4,4" />
      <rect x="30" y={floorY} width="340" height="4" fill={C.floorFill} opacity="0.5" />

      {/* ── Body (element order: floor → body → right leg → left leg → labels → glow) ── */}

      {/* Head */}
      <circle cx={headX} cy={headY} r="11" fill="none" stroke={C.body} strokeWidth="2.5" />

      {/* Forearms on floor */}
      <line x1={headX + 11} y1={headY + 5} x2={lElbX} y2={lElbY}
        stroke={C.body} strokeWidth="4" strokeLinecap="round" />
      <line x1={lElbX} y1={lElbY} x2={shX - 6} y2={shY}
        stroke={C.body} strokeWidth="4" strokeLinecap="round" />
      <line x1={rElbX} y1={rElbY} x2={shX + 6} y2={shY}
        stroke={C.body} strokeWidth="4" strokeLinecap="round" />

      {/* Torso — plank line */}
      <line x1={shX} y1={shY} x2={hipX} y2={hipY}
        stroke={C.body} strokeWidth="5" strokeLinecap="round" />

      {/* RIGHT leg (active) — knee tucks forward */}
      <line x1={hipX + 4} y1={hipY} x2={rKneeX} y2={rKneeY}
        stroke={C.active} strokeWidth="6" strokeLinecap="round" />
      <line x1={rKneeX} y1={rKneeY} x2={rFootX} y2={rFootY}
        stroke={C.active} strokeWidth="5" strokeLinecap="round" />
      <rect x={rFootX - 6} y={rFootY - 3} width="14" height="5" rx="2" fill={C.active} />
      <text x={rKneeX - 18} y={rKneeY - 6} fontSize="11" fontWeight="bold"
        fill={C.active} fontFamily="monospace">R</text>

      {/* LEFT leg — dead weight, flat on the mat */}
      <line x1={hipX - 4} y1={hipY + 2} x2={lThighX2} y2={lThighY2}
        stroke={C.leftLeg} strokeWidth="4" strokeLinecap="round"
        strokeDasharray="6,3" opacity="0.6" />
      <line x1={lThighX2} y1={lThighY2} x2={lFootX} y2={lFootY}
        stroke={C.leftLeg} strokeWidth="4" strokeLinecap="round"
        strokeDasharray="6,3" opacity="0.6" />
      <ellipse cx={lFootX + 4} cy={lFootY + 3} rx="7" ry="3"
        fill="none" stroke={C.leftLeg} strokeWidth="1.5"
        strokeDasharray="3,2" opacity="0.5" />
      <text x={lFootX - 4} y={lFootY + 14} fontSize="10"
        fill={C.leftLeg} fontFamily="monospace">L</text>

      {/* Activation glow — right hip flexor / oblique */}
      <circle cx={glowCx} cy={glowCy} r="14" fill={C.active} opacity={hold * 0.3} />

      {/* HOLD label at peak */}
      {hold > 0.5 && (
        <text x={rKneeX - 10} y={rKneeY - 18} fontSize="10" fontWeight="bold"
          fill={C.active} fontFamily="monospace">HOLD</text>
      )}
    </g>
  );
}

export const ARM_BALANCE_ANIMS: Record<string, React.ComponentType<AnimProps>> = {
  a1: TRXKneeTuckFig4,
  a2: TRXBodySawFig4,
  a3: LSitKneeTuck,
  a4: LSitHold,
  a5: TuckPlancheLean,
  a6: SupportProtraction,
  a7: PlankKneeTuckR,
};
