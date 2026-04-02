// TRX core exercise animations
// Migrated from core-demo-guide.tsx

import { C, Floor, Anchor, Strap } from "./helpers";

interface AnimProps { t: number }

export function TRXPallofPress({ t }: AnimProps) {
  const phase = t < 0.5 ? t / 0.5 : 1 - (t - 0.5) / 0.5;
  const press = Math.sin(phase * Math.PI * 0.5);
  const floorY = 220, anchorX = 320, anchorY = 60;
  const hipX = 165, hipY = 155, shX = 170, shY = 110;
  const handX = shX + 20 + press * 55, handY = shY + 5;
  return (
    <g>
      <Floor y={floorY} /><Anchor x={anchorX} y={anchorY} />
      <line x1={hipX - 5} y1={hipY} x2={hipX - 15} y2={hipY + 35} stroke={C.leftLeg} strokeWidth="4" strokeLinecap="round" />
      <line x1={hipX - 15} y1={hipY + 35} x2={hipX - 10} y2={hipY + 65} stroke={C.leftLeg} strokeWidth="3" strokeLinecap="round" />
      <line x1={hipX + 5} y1={hipY} x2={170} y2={floorY - 30} stroke={C.body} strokeWidth="5" strokeLinecap="round" />
      <line x1={170} y1={floorY - 30} x2={165} y2={floorY} stroke={C.body} strokeWidth="4" strokeLinecap="round" />
      <line x1={hipX} y1={hipY} x2={shX} y2={shY} stroke={C.body} strokeWidth="5" strokeLinecap="round" />
      <circle cx={172} cy={90} r="12" fill="none" stroke={C.body} strokeWidth="3" />
      <line x1={shX} y1={shY} x2={handX} y2={handY} stroke={C.active} strokeWidth="4" strokeLinecap="round" />
      <circle cx={handX} cy={handY} r="4" fill={C.active} />
      <Strap x1={handX} y1={handY} x2={anchorX} y2={anchorY} />
      <ellipse cx={hipX + 3} cy={(hipY + shY) / 2} rx="8" ry="16" fill={C.active} opacity={press * 0.4} />
      {press > 0.3 && <text x={hipX - 50} y={(hipY + shY) / 2 + 4} fill={C.active} fontSize="10" fontWeight="bold" fontFamily="monospace">anti-rot</text>}
    </g>
  );
}

export function TRXStandingRollout({ t }: AnimProps) {
  const phase = t < 0.5 ? t / 0.5 : 1 - (t - 0.5) / 0.5;
  const lean = Math.sin(phase * Math.PI * 0.5);
  const floorY = 220, anchorX = 80, anchorY = 60;
  const hipX = 195 - lean * 15, hipY = 155 - lean * 5;
  const shX = 185 - lean * 30, shY = 110 + lean * 10;
  const handX = shX - 20 - lean * 50, handY = shY - 15 - lean * 20;
  return (
    <g>
      <Floor y={floorY} /><Anchor x={anchorX} y={anchorY} />
      <line x1={hipX + 8} y1={hipY} x2={hipX + 25} y2={hipY + 30} stroke={C.leftLeg} strokeWidth="4" strokeLinecap="round" />
      <line x1={hipX + 25} y1={hipY + 30} x2={hipX + 30} y2={hipY + 55} stroke={C.leftLeg} strokeWidth="3" strokeLinecap="round" />
      <line x1={hipX + 3} y1={hipY} x2={200} y2={floorY - 30} stroke={C.body} strokeWidth="5" strokeLinecap="round" />
      <line x1={200} y1={floorY - 30} x2={200} y2={floorY} stroke={C.body} strokeWidth="4" strokeLinecap="round" />
      <line x1={hipX} y1={hipY} x2={shX} y2={shY} stroke={C.body} strokeWidth="5" strokeLinecap="round" />
      <circle cx={shX - 5} cy={shY - 18 + lean * 5} r="12" fill="none" stroke={C.body} strokeWidth="3" />
      <line x1={shX} y1={shY} x2={handX} y2={handY} stroke={C.active} strokeWidth="4" strokeLinecap="round" />
      <circle cx={handX} cy={handY} r="4" fill={C.active} />
      <Strap x1={handX} y1={handY} x2={anchorX} y2={anchorY} />
      <ellipse cx={(hipX + shX) / 2} cy={(hipY + shY) / 2} rx="8" ry="16" fill={C.active} opacity={lean * 0.4} />
    </g>
  );
}

export function TRXSingleArmRow({ t }: AnimProps) {
  const phase = t < 0.5 ? t / 0.5 : 1 - (t - 0.5) / 0.5;
  const pull = Math.sin(phase * Math.PI * 0.5);
  const floorY = 220, anchorX = 320, anchorY = 60;
  const hipX = 205, hipY = 155, shX = 215, shY = 110;
  const handX = shX + 30 - pull * 35, handY = shY + 15 - pull * 10;
  return (
    <g>
      <Floor y={floorY} /><Anchor x={anchorX} y={anchorY} />
      <line x1={hipX - 5} y1={hipY} x2={hipX - 15} y2={hipY + 30} stroke={C.leftLeg} strokeWidth="4" strokeLinecap="round" />
      <line x1={hipX - 15} y1={hipY + 30} x2={hipX - 10} y2={hipY + 55} stroke={C.leftLeg} strokeWidth="3" strokeLinecap="round" />
      <line x1={hipX + 3} y1={hipY} x2={180} y2={floorY - 30} stroke={C.body} strokeWidth="5" strokeLinecap="round" />
      <line x1={180} y1={floorY - 30} x2={180} y2={floorY} stroke={C.body} strokeWidth="4" strokeLinecap="round" />
      <line x1={hipX} y1={hipY} x2={shX} y2={shY} stroke={C.body} strokeWidth="5" strokeLinecap="round" />
      <circle cx={shX + 3} cy={90} r="12" fill="none" stroke={C.body} strokeWidth="3" />
      <line x1={shX} y1={shY} x2={handX} y2={handY} stroke={C.active} strokeWidth="4" strokeLinecap="round" />
      <circle cx={handX} cy={handY} r="4" fill={C.active} />
      <Strap x1={handX} y1={handY} x2={anchorX} y2={anchorY} />
      <line x1={shX} y1={shY} x2={shX + 5} y2={shY + 30} stroke={C.body} strokeWidth="3" strokeLinecap="round" />
      <ellipse cx={(hipX + shX) / 2} cy={(hipY + shY) / 2} rx="8" ry="16" fill={C.active} opacity={pull * 0.45} />
      {pull > 0.3 && <text x={hipX - 55} y={(hipY + shY) / 2} fill={C.active} fontSize="10" fontWeight="bold" fontFamily="monospace">anti-rot</text>}
    </g>
  );
}

export function TRXKneelingRollout({ t }: AnimProps) {
  const phase = t < 0.5 ? t / 0.5 : 1 - (t - 0.5) / 0.5;
  const roll = Math.sin(phase * Math.PI * 0.5);
  const floorY = 220, anchorX = 80, anchorY = 50, kneeX = 220;
  const hipX = 210 - roll * 15, hipY = 165 - roll * 10;
  const shX = 195 - roll * 30, shY = 130 + roll * 15;
  const handX = shX - 25 - roll * 45, handY = shY - 10 - roll * 20;
  return (
    <g>
      <Floor y={floorY} /><Anchor x={anchorX} y={anchorY} />
      <rect x={kneeX - 15} y={floorY - 4} width="30" height="6" rx="3" fill="#3498db" opacity="0.4" />
      <line x1={hipX + 8} y1={hipY + 5} x2={kneeX + 20} y2={floorY - 5} stroke={C.leftLeg} strokeWidth="4" strokeLinecap="round" />
      <line x1={kneeX + 20} y1={floorY - 5} x2={kneeX + 60} y2={floorY - 2} stroke={C.leftLeg} strokeWidth="3" strokeLinecap="round" />
      <line x1={hipX + 3} y1={hipY} x2={kneeX} y2={floorY - 5} stroke={C.body} strokeWidth="5" strokeLinecap="round" />
      <line x1={hipX} y1={hipY} x2={shX} y2={shY} stroke={C.body} strokeWidth="5" strokeLinecap="round" />
      <circle cx={shX - 5} cy={shY - 16 + roll * 5} r="12" fill="none" stroke={C.body} strokeWidth="3" />
      <line x1={shX} y1={shY} x2={handX} y2={handY} stroke={C.active} strokeWidth="4" strokeLinecap="round" />
      <circle cx={handX} cy={handY} r="4" fill={C.active} />
      <Strap x1={handX} y1={handY} x2={anchorX} y2={anchorY} />
      <ellipse cx={(hipX + shX) / 2} cy={(hipY + shY) / 2} rx="8" ry="14" fill={C.active} opacity={roll * 0.45} />
    </g>
  );
}

export function TRXKneelingChop({ t }: AnimProps) {
  const angle = Math.sin(t * Math.PI * 2) * 0.9;
  const floorY = 220, anchorX = 80, anchorY = 50, kneeX = 220;
  const hipX = 210, hipY = 165, shX = 200, shY = 125;
  const handX = shX - 30 + angle * 40, handY = shY - 20 - angle * 25;
  const rotX = angle * 6;
  return (
    <g>
      <Floor y={floorY} /><Anchor x={anchorX} y={anchorY} />
      <rect x={kneeX - 15} y={floorY - 4} width="30" height="6" rx="3" fill="#3498db" opacity="0.4" />
      <line x1={hipX + 8} y1={hipY + 5} x2={kneeX + 20} y2={floorY - 5} stroke={C.leftLeg} strokeWidth="4" strokeLinecap="round" />
      <line x1={kneeX + 20} y1={floorY - 5} x2={kneeX + 60} y2={floorY - 2} stroke={C.leftLeg} strokeWidth="3" strokeLinecap="round" />
      <line x1={hipX + 3} y1={hipY} x2={kneeX} y2={floorY - 5} stroke={C.body} strokeWidth="5" strokeLinecap="round" />
      <line x1={hipX + rotX * 0.3} y1={hipY} x2={shX + rotX} y2={shY} stroke={C.body} strokeWidth="5" strokeLinecap="round" />
      <circle cx={shX + rotX - 2} cy={105} r="12" fill="none" stroke={C.body} strokeWidth="3" />
      <line x1={shX + rotX} y1={shY} x2={handX} y2={handY} stroke={C.active} strokeWidth="4" strokeLinecap="round" />
      <circle cx={handX} cy={handY} r="4" fill={C.active} />
      <Strap x1={handX} y1={handY} x2={anchorX} y2={anchorY} />
      <ellipse cx={hipX - 8} cy={(hipY + shY) / 2} rx="7" ry="14" fill={C.active} opacity={Math.abs(angle) * 0.4} />
      <ellipse cx={hipX + 8} cy={(hipY + shY) / 2} rx="7" ry="14" fill={C.active} opacity={Math.abs(angle) * 0.3} />
    </g>
  );
}

export function TRXBodySaw({ t }: AnimProps) {
  const rock = Math.sin(t * Math.PI * 2);
  const floorY = 200, anchorX = 340, anchorY = 80;
  const elbX = 100, elbY = floorY - 5;
  const shX = elbX + 15 + rock * 12, shY = floorY - 40 - rock * 5;
  const hipX = shX + 60 + rock * 10, hipY = floorY - 35 - rock * 3;
  const rFootX = hipX + 60 + rock * 8, rFootY = floorY - 15;
  return (
    <g>
      <line x1="40" y1={floorY + 5} x2="360" y2={floorY + 5} stroke={C.floor} strokeWidth="1" strokeDasharray="4,4" />
      <Anchor x={anchorX} y={anchorY} />
      <line x1={elbX} y1={elbY} x2={elbX - 15} y2={elbY + 3} stroke={C.body} strokeWidth="4" strokeLinecap="round" />
      <line x1={elbX} y1={elbY} x2={shX} y2={shY} stroke={C.body} strokeWidth="4" strokeLinecap="round" />
      <line x1={shX} y1={shY} x2={hipX} y2={hipY} stroke={C.body} strokeWidth="5" strokeLinecap="round" />
      <circle cx={shX - 10} cy={shY - 12} r="10" fill="none" stroke={C.body} strokeWidth="2.5" />
      <line x1={hipX} y1={hipY} x2={hipX + 55} y2={floorY} stroke={C.leftLeg} strokeWidth="4" strokeLinecap="round" />
      <circle cx={hipX + 55} cy={floorY} r="3" fill={C.leftLeg} />
      <line x1={hipX} y1={hipY} x2={rFootX} y2={rFootY} stroke={C.active} strokeWidth="4" strokeLinecap="round" />
      <circle cx={rFootX} cy={rFootY} r="4" fill={C.active} />
      <Strap x1={rFootX} y1={rFootY} x2={anchorX} y2={anchorY} />
      <ellipse cx={(shX + hipX) / 2} cy={(shY + hipY) / 2} rx="20" ry="8" fill={C.active} opacity={0.3 + Math.abs(rock) * 0.2} />
      <text x={(shX + hipX) / 2 - 10} y={(shY + hipY) / 2 - 12} fill={C.strap} fontSize="13" fontFamily="monospace">{rock > 0 ? "\u2192" : "\u2190"}</text>
    </g>
  );
}

export function TRXSidePlank({ t }: AnimProps) {
  const breathe = Math.sin(t * Math.PI * 4) * 0.15;
  const floorY = 210, anchorX = 340, anchorY = 80;
  const elbX = 140, elbY = floorY - 5;
  const shX = 155, shY = floorY - 55 + breathe * 5;
  const hipX = 220, hipY = floorY - 45 + breathe * 8;
  const rFootX = 280, rFootY = floorY - 10;
  return (
    <g>
      <line x1="40" y1={floorY + 5} x2="360" y2={floorY + 5} stroke={C.floor} strokeWidth="1" strokeDasharray="4,4" />
      <Anchor x={anchorX} y={anchorY} />
      <line x1={elbX - 10} y1={elbY + 2} x2={elbX} y2={elbY} stroke={C.body} strokeWidth="4" strokeLinecap="round" />
      <line x1={elbX} y1={elbY} x2={shX} y2={shY} stroke={C.body} strokeWidth="4" strokeLinecap="round" />
      <line x1={shX} y1={shY} x2={hipX} y2={hipY} stroke={C.body} strokeWidth="5" strokeLinecap="round" />
      <circle cx={shX - 8} cy={shY - 14} r="10" fill="none" stroke={C.body} strokeWidth="2.5" />
      <line x1={hipX} y1={hipY} x2={rFootX} y2={rFootY} stroke={C.active} strokeWidth="4" strokeLinecap="round" />
      <circle cx={rFootX} cy={rFootY} r="4" fill={C.active} />
      <Strap x1={rFootX} y1={rFootY} x2={anchorX} y2={anchorY} />
      <line x1={hipX - 3} y1={hipY - 5} x2={275} y2={floorY - 18} stroke={C.leftLeg} strokeWidth="3.5" strokeLinecap="round" />
      <circle cx={275} cy={floorY - 18} r="3" fill={C.leftLeg} />
      <line x1={shX + 3} y1={shY} x2={shX - 5} y2={shY - 40} stroke={C.body} strokeWidth="3" strokeLinecap="round" />
      <ellipse cx={(shX + hipX) / 2} cy={(shY + hipY) / 2} rx="18" ry="7" fill={C.active} opacity={0.35} />
      <text x={(shX + hipX) / 2 - 15} y={(shY + hipY) / 2 - 10} fill={C.active} fontSize="10" fontWeight="bold" fontFamily="monospace">obliques</text>
    </g>
  );
}

export const TRX_ANIMS: Record<string, React.ComponentType<AnimProps>> = {
  t1: TRXPallofPress,
  t2: TRXStandingRollout,
  t3: TRXSingleArmRow,
  t4: TRXKneelingRollout,
  t5: TRXKneelingChop,
  t6: TRXBodySaw,
  t7: TRXSidePlank,
};
