// Yoga exercise animations (new)

import { C, Floor } from "./helpers";

interface AnimProps { t: number }

export function DolphinPose({ t }: AnimProps) {
  // Subtle breathing/settling
  const breathe = Math.sin(t * Math.PI * 3) * 2;
  const floorY = 220;
  // Forearms on ground
  const elbLX = 100, elbRX = 140, elbY = floorY - 5;
  // Shoulders above forearms
  const shX = 120, shY = floorY - 55 + breathe;
  const hdX = 120, hdY = shY + 20;
  // Hips pike up high
  const hipX = 220, hipY = floorY - 95 + breathe * 0.5;
  // Right foot on ground
  const rFootX = 300, rFootY = floorY;
  // Left leg lifted/hovering
  const lFootX = 280, lFootY = hipY - 15 + breathe;

  return (
    <g>
      <Floor y={floorY} />
      {/* Left forearm */}
      <line x1={elbLX} y1={elbY} x2={shX - 8} y2={shY + 5} stroke={C.body} strokeWidth="4" strokeLinecap="round" />
      {/* Right forearm */}
      <line x1={elbRX} y1={elbY} x2={shX + 8} y2={shY + 5} stroke={C.body} strokeWidth="4" strokeLinecap="round" />
      {/* Elbow dots */}
      <circle cx={elbLX} cy={elbY} r="3" fill={C.body} />
      <circle cx={elbRX} cy={elbY} r="3" fill={C.body} />
      {/* Torso (steep angle up to hips) */}
      <line x1={shX} y1={shY} x2={hipX} y2={hipY} stroke={C.body} strokeWidth="5" strokeLinecap="round" />
      {/* Head between arms */}
      <circle cx={hdX} cy={hdY} r="10" fill="none" stroke={C.body} strokeWidth="2.5" />
      {/* Right leg — bearing weight */}
      <line x1={hipX} y1={hipY} x2={rFootX - 20} y2={hipY + 25} stroke={C.active} strokeWidth="5" strokeLinecap="round" />
      <line x1={rFootX - 20} y1={hipY + 25} x2={rFootX} y2={rFootY} stroke={C.active} strokeWidth="5" strokeLinecap="round" />
      <rect x={rFootX - 6} y={rFootY - 3} width="14" height="4" rx="2" fill={C.active} />
      <text x={rFootX + 10} y={rFootY - 3} fill={C.active} fontSize="9" fontFamily="monospace">R</text>
      {/* Left leg — floating */}
      <line x1={hipX - 5} y1={hipY} x2={lFootX - 20} y2={hipY - 5} stroke={C.leftLeg} strokeWidth="4" strokeLinecap="round" opacity="0.6" />
      <line x1={lFootX - 20} y1={hipY - 5} x2={lFootX} y2={lFootY} stroke={C.leftLeg} strokeWidth="3.5" strokeLinecap="round" opacity="0.6" />
      <circle cx={lFootX} cy={lFootY} r="3" fill={C.leftLeg} opacity="0.5" />
      <text x={lFootX + 5} y={lFootY - 3} fill={C.leftLeg} fontSize="8" fontFamily="monospace" opacity="0.7">L(float)</text>
      {/* Shoulder activation */}
      <ellipse cx={shX} cy={shY} rx="12" ry="6" fill={C.active} opacity={0.25} />
      {/* Pike arrow */}
      <text x={hipX - 5} y={hipY - 12} fill={C.strap} fontSize="10" fontFamily="monospace">{"\u25B2"}</text>
      <text x={hipX + 5} y={hipY - 12} fill={C.strap} fontSize="8" fontFamily="monospace">hips high</text>
    </g>
  );
}

export function WarriorIII({ t }: AnimProps) {
  // Subtle balance sway
  const sway = Math.sin(t * Math.PI * 3) * 1.5;
  const floorY = 220;
  const footX = 160, footY = floorY;
  const hipX = 165 + sway, hipY = 130;
  const shX = 160 + sway * 0.5, shY = 120;
  const hdX = shX - 10, hdY = shY - 5;
  // T shape — torso horizontal, arms forward
  const armX = shX - 60, armY = shY - 5 + sway;
  // Left leg extends back as counterweight
  const lFootX = hipX + 100, lFootY = hipY + 5 - sway;

  return (
    <g>
      <Floor y={floorY} />
      {/* Right leg — standing */}
      <line x1={hipX} y1={hipY} x2={footX + 5} y2={floorY - 30} stroke={C.active} strokeWidth="5" strokeLinecap="round" />
      <line x1={footX + 5} y1={floorY - 30} x2={footX} y2={footY} stroke={C.active} strokeWidth="5" strokeLinecap="round" />
      <rect x={footX - 6} y={footY - 3} width="14" height="4" rx="2" fill={C.active} />
      {/* Torso — nearly horizontal */}
      <line x1={hipX} y1={hipY} x2={shX} y2={shY} stroke={C.body} strokeWidth="5" strokeLinecap="round" />
      <circle cx={hdX} cy={hdY} r="10" fill="none" stroke={C.body} strokeWidth="2.5" />
      {/* Arms extending forward */}
      <line x1={shX} y1={shY} x2={armX} y2={armY} stroke={C.body} strokeWidth="4" strokeLinecap="round" />
      <circle cx={armX} cy={armY} r="3" fill={C.body} />
      {/* Left leg — passive counterweight extending back */}
      <line x1={hipX} y1={hipY} x2={hipX + 50} y2={hipY + 2} stroke={C.leftLeg} strokeWidth="4.5" strokeLinecap="round" opacity="0.6" />
      <line x1={hipX + 50} y1={hipY + 2} x2={lFootX} y2={lFootY} stroke={C.leftLeg} strokeWidth="4" strokeLinecap="round" opacity="0.6" />
      <circle cx={lFootX} cy={lFootY} r="3" fill={C.leftLeg} opacity="0.5" />
      {/* T-shape guide line */}
      <line x1={armX - 5} y1={armY} x2={lFootX + 5} y2={lFootY} stroke={C.body} strokeWidth="0.5" strokeDasharray="5,5" opacity="0.15" />
      {/* Labels */}
      <text x={footX + 12} y={floorY - 15} fill={C.active} fontSize="9" fontWeight="bold" fontFamily="monospace">R leg</text>
      <text x={lFootX - 5} y={lFootY + 14} fill={C.leftLeg} fontSize="8" fontFamily="monospace" opacity="0.7">passive</text>
      {/* Balance indicator */}
      <text x={hipX - 25} y={hipY - 8} fill={C.strap} fontSize="8" fontFamily="monospace" opacity="0.6">{"\u25C4\u25BA"} balance</text>
    </g>
  );
}

export function FeetUpLegLower({ t }: AnimProps) {
  const phase = t < 0.5 ? t / 0.5 : 1 - (t - 0.5) / 0.5;
  const lower = Math.sin(phase * Math.PI * 0.5);
  const floorY = 220;
  // FeetUp trainer (inverted, person is upside down)
  const baseX = 160, baseY = floorY;
  const padY = baseY - 100;

  // Person inverted — head at bottom, feet at top
  const shX = 200, shY = padY + 15;
  const hipX = 200, hipY = padY - 40;
  // Right leg lowers forward
  const rFootX = hipX - 20 - lower * 50, rFootY = hipY - 20 + lower * 40;
  // Left leg stays vertical
  const lFootX = hipX + 5, lFootY = hipY - 60;

  return (
    <g>
      <Floor y={floorY} />
      {/* FeetUp trainer frame */}
      <rect x={baseX} y={padY - 5} width="80" height="10" rx="4" fill={C.equipment} />
      <rect x={baseX + 10} y={padY + 5} width="10" height={floorY - padY - 5} fill={C.equipment} />
      <rect x={baseX + 60} y={padY + 5} width="10" height={floorY - padY - 5} fill={C.equipment} />
      {/* Pad */}
      <rect x={baseX + 5} y={padY - 8} width="70" height="8" rx="3" fill="#3498db" opacity="0.4" />
      <text x={baseX + 40} y={padY + 25} textAnchor="middle" fontSize="8" fill="#555" fontFamily="monospace">FeetUp</text>
      {/* Head resting on pad */}
      <circle cx={shX} cy={shY + 10} r="10" fill="none" stroke={C.body} strokeWidth="2.5" />
      {/* Shoulders/arms on pad */}
      <line x1={shX - 20} y1={shY} x2={shX + 20} y2={shY} stroke={C.body} strokeWidth="4" strokeLinecap="round" />
      {/* Torso going up */}
      <line x1={shX} y1={shY} x2={hipX} y2={hipY} stroke={C.body} strokeWidth="5" strokeLinecap="round" />
      {/* Left leg — stays vertical */}
      <line x1={hipX + 3} y1={hipY} x2={lFootX} y2={hipY - 30} stroke={C.leftLeg} strokeWidth="4" strokeLinecap="round" opacity="0.6" />
      <line x1={lFootX} y1={hipY - 30} x2={lFootX} y2={lFootY} stroke={C.leftLeg} strokeWidth="3.5" strokeLinecap="round" opacity="0.6" />
      <circle cx={lFootX} cy={lFootY} r="3" fill={C.leftLeg} opacity="0.5" />
      {/* Right leg — lowering forward */}
      <line x1={hipX - 3} y1={hipY} x2={(hipX + rFootX) / 2} y2={(hipY + rFootY) / 2 - 5} stroke={C.active} strokeWidth="5" strokeLinecap="round" />
      <line x1={(hipX + rFootX) / 2} y1={(hipY + rFootY) / 2 - 5} x2={rFootX} y2={rFootY} stroke={C.active} strokeWidth="4.5" strokeLinecap="round" />
      <circle cx={rFootX} cy={rFootY} r="4" fill={C.active} />
      {/* Core highlight */}
      <ellipse cx={hipX} cy={hipY + 10} rx="8" ry="12" fill={C.active} opacity={lower * 0.35} />
      {lower > 0.3 && <text x={hipX + 15} y={hipY + 10} fill={C.active} fontSize="9" fontWeight="bold" fontFamily="monospace">core</text>}
    </g>
  );
}

export function ChairPoseWall({ t }: AnimProps) {
  // Isometric hold with subtle breathing
  const breathe = Math.sin(t * Math.PI * 3) * 1;
  const floorY = 220;
  // Wall on right side
  const wallX = 280;
  const hipX = 260, hipY = 155 + breathe;
  const shX = 270, shY = 100 + breathe * 0.5;
  const hdY = 78 + breathe * 0.3;
  // Right foot planted
  const rFootX = 230, rFootY = floorY;
  const rKneeX = 235, rKneeY = hipY + 25;

  return (
    <g>
      <Floor y={floorY} />
      {/* Wall */}
      <rect x={wallX} y={50} width="8" height={floorY - 50} fill={C.equipment} opacity="0.4" />
      <text x={wallX + 15} y={130} fill="#555" fontSize="8" fontFamily="monospace" transform={`rotate(90, ${wallX + 15}, 130)`}>WALL</text>
      {/* Back against wall */}
      <line x1={hipX} y1={hipY} x2={shX} y2={shY} stroke={C.body} strokeWidth="5" strokeLinecap="round" />
      <circle cx={shX + 2} cy={hdY} r="12" fill="none" stroke={C.body} strokeWidth="3" />
      {/* Right leg — bearing weight, ~90° bend */}
      <line x1={hipX} y1={hipY} x2={rKneeX} y2={rKneeY} stroke={C.active} strokeWidth="5" strokeLinecap="round" />
      <line x1={rKneeX} y1={rKneeY} x2={rFootX} y2={rFootY} stroke={C.active} strokeWidth="5" strokeLinecap="round" />
      <rect x={rFootX - 8} y={rFootY - 3} width="16" height="4" rx="2" fill={C.active} />
      {/* Left leg — hovering */}
      <line x1={hipX - 5} y1={hipY + 3} x2={hipX - 15} y2={hipY + 35} stroke={C.leftLeg} strokeWidth="4" strokeLinecap="round" opacity="0.5" />
      <line x1={hipX - 15} y1={hipY + 35} x2={hipX - 10} y2={hipY + 60} stroke={C.leftLeg} strokeWidth="3.5" strokeLinecap="round" opacity="0.5" />
      <circle cx={hipX - 10} cy={hipY + 60} r="3" fill={C.leftLeg} opacity="0.4" />
      {/* Arms overhead */}
      <line x1={shX - 5} y1={shY} x2={shX - 10} y2={shY - 35} stroke={C.body} strokeWidth="3.5" strokeLinecap="round" />
      <line x1={shX + 5} y1={shY} x2={shX + 5} y2={shY - 35} stroke={C.body} strokeWidth="3.5" strokeLinecap="round" />
      {/* Quad burn highlight */}
      <ellipse cx={rKneeX - 5} cy={(hipY + rKneeY) / 2} rx="6" ry="14" fill={C.active} opacity={0.3} />
      <text x={rKneeX + 10} y={(hipY + rKneeY) / 2} fill={C.active} fontSize="8" fontWeight="bold" fontFamily="monospace">quads</text>
      {/* Right foot label */}
      <text x={rFootX - 15} y={rFootY + 14} fill={C.active} fontSize="8" fontFamily="monospace">R only</text>
      {/* 90° angle indicator */}
      <path d={`M ${rKneeX - 8} ${rKneeY - 8} L ${rKneeX - 8} ${rKneeY} L ${rKneeX} ${rKneeY}`} fill="none" stroke={C.active} strokeWidth="1" opacity="0.5" />
      <text x={rKneeX - 22} y={rKneeY - 10} fill={C.active} fontSize="8" fontFamily="monospace" opacity="0.6">90°</text>
    </g>
  );
}

export const YOGA_ANIMS: Record<string, React.ComponentType<AnimProps>> = {
  y1: DolphinPose,
  y2: WarriorIII,
  y3: FeetUpLegLower,
  y4: ChairPoseWall,
};
