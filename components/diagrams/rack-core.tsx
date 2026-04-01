// Rack core exercise animations (new)

import { C, Floor, Rack, Dumbbell, Plate } from "./helpers";

interface AnimProps { t: number }

export function LandmineRotation({ t }: AnimProps) {
  // Bar arcs from left hip to right hip
  const angle = Math.sin(t * Math.PI * 2) * 0.8;
  const floorY = 220;
  const hipX = 200, hipY = 155, shX = 200, shY = 110;
  const hdY = 88;
  // Landmine pivot at bottom-left
  const pivotX = 80, pivotY = floorY;
  // Bar end follows the person's hands
  const handX = shX + angle * 50, handY = shY - 15;
  const rotX = angle * 5;
  return (
    <g>
      <Floor y={floorY} />
      {/* Landmine base */}
      <rect x={pivotX - 8} y={floorY - 8} width="16" height="8" fill={C.equipment} rx="2" />
      <circle cx={pivotX} cy={floorY - 8} r="4" fill={C.equipLight} />
      {/* Barbell from pivot to hands */}
      <line x1={pivotX} y1={pivotY - 8} x2={handX} y2={handY} stroke="#aaa" strokeWidth="3" strokeLinecap="round" />
      {/* Small plate at end */}
      <circle cx={handX} cy={handY} r="8" fill={C.weight} stroke={C.equipLight} strokeWidth="1" />
      {/* Standing figure on right leg */}
      <line x1={hipX + 3} y1={hipY} x2={hipX + 5} y2={floorY - 10} stroke={C.body} strokeWidth="5" strokeLinecap="round" />
      <line x1={hipX + 5} y1={floorY - 10} x2={hipX + 5} y2={floorY} stroke={C.body} strokeWidth="4" strokeLinecap="round" />
      <rect x={hipX} y={floorY - 4} width="14" height="5" rx="2" fill={C.body} />
      {/* Left leg passive */}
      <line x1={hipX - 3} y1={hipY} x2={hipX - 15} y2={hipY + 35} stroke={C.leftLeg} strokeWidth="4" strokeLinecap="round" />
      <line x1={hipX - 15} y1={hipY + 35} x2={hipX - 10} y2={hipY + 60} stroke={C.leftLeg} strokeWidth="3" strokeLinecap="round" />
      {/* Torso rotates slightly */}
      <line x1={hipX + rotX * 0.3} y1={hipY} x2={shX + rotX} y2={shY} stroke={C.body} strokeWidth="5" strokeLinecap="round" />
      <circle cx={shX + rotX} cy={hdY} r="12" fill="none" stroke={C.body} strokeWidth="3" />
      {/* Arms to bar end */}
      <line x1={shX + rotX} y1={shY} x2={handX} y2={handY} stroke={C.active} strokeWidth="4" strokeLinecap="round" />
      {/* Core activation highlight */}
      <ellipse cx={hipX + rotX * 0.5} cy={(hipY + shY) / 2} rx="8" ry="16" fill={C.active} opacity={Math.abs(angle) * 0.4} />
      {/* Direction arrow */}
      <text x={handX + (angle > 0 ? 12 : -20)} y={handY - 5} fill={C.strap} fontSize="14" fontFamily="monospace">{angle > 0 ? "\u2192" : "\u2190"}</text>
    </g>
  );
}

export function PlateHalos({ t }: AnimProps) {
  // Plate circles around head
  const angle = t * Math.PI * 2;
  const floorY = 220;
  const hipX = 200, hipY = 155, shX = 200, shY = 110, hdY = 88;
  // Plate orbits around head
  const orbitRx = 30, orbitRy = 15;
  const plateX = shX + Math.cos(angle) * orbitRx;
  const plateY = hdY + Math.sin(angle) * orbitRy;
  // Behind head when sin < 0
  const behind = Math.sin(angle) < 0;
  return (
    <g>
      <Floor y={floorY} />
      {/* Standing on right leg */}
      <line x1={hipX + 3} y1={hipY} x2={hipX + 5} y2={floorY - 10} stroke={C.body} strokeWidth="5" strokeLinecap="round" />
      <line x1={hipX + 5} y1={floorY - 10} x2={hipX + 5} y2={floorY} stroke={C.body} strokeWidth="4" strokeLinecap="round" />
      <rect x={hipX} y={floorY - 4} width="14" height="5" rx="2" fill={C.body} />
      {/* Left leg */}
      <line x1={hipX - 3} y1={hipY} x2={hipX - 15} y2={hipY + 35} stroke={C.leftLeg} strokeWidth="4" strokeLinecap="round" />
      <line x1={hipX - 15} y1={hipY + 35} x2={hipX - 10} y2={hipY + 60} stroke={C.leftLeg} strokeWidth="3" strokeLinecap="round" />
      {/* Torso */}
      <line x1={hipX} y1={hipY} x2={shX} y2={shY} stroke={C.body} strokeWidth="5" strokeLinecap="round" />
      {/* Plate behind head (draw before head) */}
      {behind && <Plate cx={plateX} cy={plateY} r={10} />}
      {/* Head */}
      <circle cx={shX} cy={hdY} r="12" fill="none" stroke={C.body} strokeWidth="3" />
      {/* Plate in front of head */}
      {!behind && <Plate cx={plateX} cy={plateY} r={10} />}
      {/* Arms track to plate */}
      <line x1={shX - 8} y1={shY} x2={plateX} y2={plateY} stroke={C.active} strokeWidth="3" strokeLinecap="round" />
      <line x1={shX + 8} y1={shY} x2={plateX} y2={plateY} stroke={C.active} strokeWidth="3" strokeLinecap="round" />
      {/* Core stability */}
      <ellipse cx={hipX} cy={(hipY + shY) / 2} rx="8" ry="14" fill={C.active} opacity={0.25} />
      {/* Orbit path hint */}
      <ellipse cx={shX} cy={hdY} rx={orbitRx} ry={orbitRy} fill="none" stroke={C.active} strokeWidth="0.5" strokeDasharray="3,3" opacity="0.3" />
    </g>
  );
}

export function BarbellRollout({ t }: AnimProps) {
  const phase = t < 0.5 ? t / 0.5 : 1 - (t - 0.5) / 0.5;
  const roll = Math.sin(phase * Math.PI * 0.5);
  const floorY = 220;
  const kneeX = 260, kneeY = floorY - 5;
  const hipX = 240 - roll * 30, hipY = 170 - roll * 15;
  const shX = 220 - roll * 55, shY = 145 + roll * 25;
  const handX = shX - 30 - roll * 50, handY = floorY - 10;
  return (
    <g>
      <Floor y={floorY} />
      {/* Knee pad */}
      <rect x={kneeX - 15} y={floorY - 4} width="30" height="5" rx="2" fill="#3498db" opacity="0.3" />
      {/* Right shin (knee on ground) */}
      <line x1={hipX + 5} y1={hipY} x2={kneeX} y2={kneeY} stroke={C.body} strokeWidth="5" strokeLinecap="round" />
      {/* Left leg trails behind */}
      <line x1={hipX + 8} y1={hipY + 5} x2={kneeX + 30} y2={floorY - 5} stroke={C.leftLeg} strokeWidth="4" strokeLinecap="round" />
      <line x1={kneeX + 30} y1={floorY - 5} x2={kneeX + 70} y2={floorY - 2} stroke={C.leftLeg} strokeWidth="3" strokeLinecap="round" />
      {/* Torso */}
      <line x1={hipX} y1={hipY} x2={shX} y2={shY} stroke={C.body} strokeWidth="5" strokeLinecap="round" />
      <circle cx={shX - 5} cy={shY - 16 + roll * 8} r="11" fill="none" stroke={C.body} strokeWidth="3" />
      {/* Arms to barbell */}
      <line x1={shX} y1={shY} x2={handX} y2={handY} stroke={C.active} strokeWidth="4" strokeLinecap="round" />
      {/* Barbell with plates */}
      <line x1={handX - 20} y1={handY} x2={handX + 20} y2={handY} stroke="#aaa" strokeWidth="3" strokeLinecap="round" />
      <circle cx={handX - 18} cy={handY} r="8" fill={C.weight} stroke={C.equipLight} strokeWidth="1" />
      <circle cx={handX + 18} cy={handY} r="8" fill={C.weight} stroke={C.equipLight} strokeWidth="1" />
      {/* Core activation */}
      <ellipse cx={(hipX + shX) / 2} cy={(hipY + shY) / 2} rx="10" ry="14" fill={C.active} opacity={roll * 0.4} />
      {roll > 0.3 && <text x={shX + 10} y={shY - 5} fill={C.active} fontSize="9" fontWeight="bold" fontFamily="monospace">anti-ext</text>}
    </g>
  );
}

export function SuitcaseHold({ t }: AnimProps) {
  // Subtle sway to show anti-lateral flexion resistance
  const sway = Math.sin(t * Math.PI * 4) * 1.5;
  const floorY = 220;
  const hipX = 200, hipY = 150, shX = 200, shY = 100, hdY = 78;
  // Dumbbell in right hand
  const dbX = hipX + 45, dbY = hipY + 40;
  return (
    <g>
      <Floor y={floorY} />
      {/* Right leg */}
      <line x1={hipX + 5} y1={hipY} x2={hipX + 5} y2={floorY - 10} stroke={C.body} strokeWidth="5" strokeLinecap="round" />
      <line x1={hipX + 5} y1={floorY - 10} x2={hipX + 5} y2={floorY} stroke={C.body} strokeWidth="4" strokeLinecap="round" />
      <rect x={hipX} y={floorY - 4} width="14" height="5" rx="2" fill={C.body} />
      {/* Left leg */}
      <line x1={hipX - 5} y1={hipY} x2={hipX - 15} y2={hipY + 35} stroke={C.leftLeg} strokeWidth="4" strokeLinecap="round" />
      <line x1={hipX - 15} y1={hipY + 35} x2={hipX - 10} y2={hipY + 60} stroke={C.leftLeg} strokeWidth="3" strokeLinecap="round" />
      {/* Torso - stays tall, slight resistance to sway */}
      <line x1={hipX + sway * 0.3} y1={hipY} x2={shX + sway * 0.1} y2={shY} stroke={C.body} strokeWidth="5" strokeLinecap="round" />
      <circle cx={shX + sway * 0.1} cy={hdY} r="12" fill="none" stroke={C.body} strokeWidth="3" />
      {/* Left arm at side */}
      <line x1={shX - 8} y1={shY + 5} x2={hipX - 25} y2={hipY + 30} stroke={C.body} strokeWidth="3" strokeLinecap="round" />
      {/* Right arm holding weight */}
      <line x1={shX + 8} y1={shY + 5} x2={dbX} y2={dbY - 10} stroke={C.active} strokeWidth="4" strokeLinecap="round" />
      {/* Dumbbell */}
      <Dumbbell x={dbX} y={dbY} angle={90} size={24} />
      {/* Anti-lateral flexion highlight (opposite side) */}
      <ellipse cx={hipX - 12} cy={(hipY + shY) / 2} rx="6" ry="18" fill={C.active} opacity={0.35} />
      <text x={hipX - 55} y={(hipY + shY) / 2} fill={C.active} fontSize="9" fontWeight="bold" fontFamily="monospace">anti-lat</text>
      {/* Level shoulders indicator */}
      <line x1={shX - 25} y1={shY - 3} x2={shX + 25} y2={shY - 3} stroke={C.active} strokeWidth="1" strokeDasharray="3,3" opacity="0.5" />
    </g>
  );
}

export function OverheadPlateHold({ t }: AnimProps) {
  // Subtle anti-extension breathing
  const breathe = Math.sin(t * Math.PI * 3) * 2;
  const floorY = 220;
  const hipX = 200, hipY = 155, shX = 200, shY = 110, hdY = 90;
  const plateY = 50 + breathe;
  return (
    <g>
      <Floor y={floorY} />
      {/* Seated on bench */}
      <rect x={165} y={hipY + 5} width="70" height="12" rx="3" fill={C.equipment} />
      <rect x={170} y={hipY + 17} width="8" height={floorY - hipY - 17} fill={C.equipment} />
      <rect x={222} y={hipY + 17} width="8" height={floorY - hipY - 17} fill={C.equipment} />
      {/* Torso */}
      <line x1={hipX} y1={hipY} x2={shX} y2={shY} stroke={C.body} strokeWidth="5" strokeLinecap="round" />
      <circle cx={shX} cy={hdY} r="12" fill="none" stroke={C.body} strokeWidth="3" />
      {/* Arms overhead */}
      <line x1={shX - 8} y1={shY} x2={shX - 12} y2={plateY + 14} stroke={C.active} strokeWidth="4" strokeLinecap="round" />
      <line x1={shX + 8} y1={shY} x2={shX + 12} y2={plateY + 14} stroke={C.active} strokeWidth="4" strokeLinecap="round" />
      {/* Plate overhead */}
      <Plate cx={shX} cy={plateY} r={16} />
      {/* Core anti-extension highlight */}
      <ellipse cx={hipX} cy={(hipY + shY) / 2} rx="8" ry="16" fill={C.active} opacity={0.3} />
      <text x={hipX + 18} y={(hipY + shY) / 2} fill={C.active} fontSize="9" fontWeight="bold" fontFamily="monospace">anti-ext</text>
      {/* Ribs-down cue */}
      <line x1={shX - 15} y1={shY + 8} x2={shX + 15} y2={shY + 8} stroke={C.strap} strokeWidth="1" strokeDasharray="3,2" opacity="0.5" />
      <text x={shX + 20} y={shY + 12} fill={C.strap} fontSize="8" fontFamily="monospace" opacity="0.6">ribs down</text>
    </g>
  );
}

export const RACK_CORE_ANIMS: Record<string, React.ComponentType<AnimProps>> = {
  r1: LandmineRotation,
  r2: PlateHalos,
  r3: BarbellRollout,
  r4: SuitcaseHold,
  r5: OverheadPlateHold,
};
