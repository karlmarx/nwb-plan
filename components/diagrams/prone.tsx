// Prone / Plyo Box exercise animations (new)

import { C, Box } from "./helpers";

interface AnimProps { t: number }

export function ProneHipExtension({ t }: AnimProps) {
  const phase = t < 0.5 ? t / 0.5 : 1 - (t - 0.5) / 0.5;
  const lift = Math.sin(phase * Math.PI * 0.5);
  const floorY = 220;
  const boxX = 120, boxY = floorY - 50, boxW = 120, boxH = 50;
  // Person lies prone on box, hips at edge
  const hipX = boxX + boxW - 5, hipY = boxY + 10;
  const shX = boxX + 30, shY = boxY + 8;
  const hdX = boxX + 10, hdY = boxY + 5;
  // Right leg extends back and up
  const rFootX = hipX + 70, rFootY = hipY - lift * 45;
  const rKneeX = hipX + 35, rKneeY = hipY + 5 - lift * 20;
  // Left leg hangs passive
  const lFootX = hipX + 20, lFootY = floorY - 10;
  return (
    <g>
      <line x1="40" y1={floorY} x2="360" y2={floorY} stroke={C.floor} strokeWidth="1.5" />
      <Box x={boxX} y={boxY} w={boxW} h={boxH} />
      <text x={boxX + boxW / 2} y={boxY + boxH / 2 + 4} textAnchor="middle" fontSize="9" fill="#555" fontFamily="monospace">PLYO BOX</text>
      {/* Torso on box */}
      <line x1={hipX} y1={hipY} x2={shX} y2={shY} stroke={C.body} strokeWidth="5" strokeLinecap="round" />
      <circle cx={hdX} cy={hdY} r="10" fill="none" stroke={C.body} strokeWidth="2.5" />
      {/* Arms gripping box sides */}
      <line x1={shX + 15} y1={shY + 5} x2={shX + 15} y2={boxY + boxH - 5} stroke={C.body} strokeWidth="3" strokeLinecap="round" />
      <line x1={shX - 10} y1={shY + 5} x2={shX - 10} y2={boxY + boxH - 5} stroke={C.body} strokeWidth="3" strokeLinecap="round" />
      {/* Left leg hanging passive */}
      <line x1={hipX - 3} y1={hipY + 5} x2={lFootX - 10} y2={hipY + 35} stroke={C.leftLeg} strokeWidth="4" strokeLinecap="round" />
      <line x1={lFootX - 10} y1={hipY + 35} x2={lFootX} y2={lFootY} stroke={C.leftLeg} strokeWidth="3.5" strokeLinecap="round" />
      <circle cx={lFootX} cy={lFootY} r="3" fill={C.leftLeg} />
      <text x={lFootX + 5} y={lFootY + 3} fill={C.leftLeg} fontSize="9" fontFamily="monospace">L(hang)</text>
      {/* Right leg extending */}
      <line x1={hipX + 3} y1={hipY} x2={rKneeX} y2={rKneeY} stroke={C.active} strokeWidth="5" strokeLinecap="round" />
      <line x1={rKneeX} y1={rKneeY} x2={rFootX} y2={rFootY} stroke={C.active} strokeWidth="4.5" strokeLinecap="round" />
      <circle cx={rFootX} cy={rFootY} r="4" fill={C.active} />
      {/* Glute activation */}
      <circle cx={hipX + 5} cy={hipY - 3} r="10" fill={C.active} opacity={lift * 0.35} />
      {lift > 0.3 && <text x={hipX + 18} y={hipY - 10} fill={C.active} fontSize="9" fontWeight="bold" fontFamily="monospace">glute</text>}
    </g>
  );
}

export function ProneYTW({ t }: AnimProps) {
  // Cycle through Y, T, W positions
  const cycle = t * 3; // 0-1=Y, 1-2=T, 2-3=W
  const floorY = 220;
  const boxX = 120, boxY = floorY - 45, boxW = 120, boxH = 45;
  const hipX = boxX + boxW - 10, hipY = boxY + 12;
  const shX = boxX + 40, shY = boxY + 8;
  const hdX = boxX + 20, hdY = boxY + 2;

  let lArmX: number, lArmY: number, rArmX: number, rArmY: number;
  let letter: string;

  if (cycle < 1) {
    // Y - arms overhead at 45°
    const p = Math.sin(cycle * Math.PI);
    lArmX = shX - 30 - p * 25; lArmY = shY - 10 - p * 40;
    rArmX = shX + 10 + p * 25; rArmY = shY - 10 - p * 40;
    letter = "Y";
  } else if (cycle < 2) {
    // T - arms straight out
    const p = Math.sin((cycle - 1) * Math.PI);
    lArmX = shX - 20 - p * 45; lArmY = shY + p * 5;
    rArmX = shX + 20 + p * 45; rArmY = shY + p * 5;
    letter = "T";
  } else {
    // W - elbows bent, squeeze
    const p = Math.sin((cycle - 2) * Math.PI);
    lArmX = shX - 15 - p * 20; lArmY = shY - 5 + p * 15;
    rArmX = shX + 15 + p * 20; rArmY = shY - 5 + p * 15;
    letter = "W";
  }

  return (
    <g>
      <line x1="40" y1={floorY} x2="360" y2={floorY} stroke={C.floor} strokeWidth="1.5" />
      <Box x={boxX} y={boxY} w={boxW} h={boxH} />
      {/* Torso prone */}
      <line x1={hipX} y1={hipY} x2={shX} y2={shY} stroke={C.body} strokeWidth="5" strokeLinecap="round" />
      <circle cx={hdX} cy={hdY} r="10" fill="none" stroke={C.body} strokeWidth="2.5" />
      {/* Legs resting */}
      <line x1={hipX} y1={hipY + 5} x2={hipX + 40} y2={floorY - 5} stroke={C.body} strokeWidth="4" strokeLinecap="round" />
      <line x1={hipX - 5} y1={hipY + 5} x2={hipX + 30} y2={floorY - 5} stroke={C.leftLeg} strokeWidth="3.5" strokeLinecap="round" />
      {/* Arms */}
      <line x1={shX - 5} y1={shY} x2={lArmX} y2={lArmY} stroke={C.active} strokeWidth="4" strokeLinecap="round" />
      <circle cx={lArmX} cy={lArmY} r="4" fill={C.active} />
      <line x1={shX + 5} y1={shY} x2={rArmX} y2={rArmY} stroke={C.active} strokeWidth="4" strokeLinecap="round" />
      <circle cx={rArmX} cy={rArmY} r="4" fill={C.active} />
      {/* Scapular activation */}
      <ellipse cx={shX} cy={shY + 8} rx="14" ry="6" fill={C.active} opacity={0.3} />
      {/* Letter label */}
      <text x={320} y={60} fontSize="28" fontWeight="bold" fill={C.active} fontFamily="monospace" opacity="0.6">{letter}</text>
    </g>
  );
}

export function ProneBackExtension({ t }: AnimProps) {
  const phase = t < 0.5 ? t / 0.5 : 1 - (t - 0.5) / 0.5;
  const ext = Math.sin(phase * Math.PI * 0.5);
  const floorY = 220;
  const boxX = 100, boxY = floorY - 50, boxW = 140, boxH = 50;
  const hipX = boxX + boxW / 2, hipY = boxY + 5;
  // Torso lifts up
  const shX = hipX - 40 + ext * 15, shY = hipY + 10 - ext * 40;
  const hdX = shX - 15, hdY = shY - 15 + ext * 5;
  return (
    <g>
      <line x1="40" y1={floorY} x2="360" y2={floorY} stroke={C.floor} strokeWidth="1.5" />
      <Box x={boxX} y={boxY} w={boxW} h={boxH} />
      {/* Right foot anchored */}
      <line x1={hipX + 20} y1={hipY + 10} x2={hipX + 60} y2={floorY - 10} stroke={C.body} strokeWidth="5" strokeLinecap="round" />
      <line x1={hipX + 60} y1={floorY - 10} x2={hipX + 60} y2={floorY} stroke={C.body} strokeWidth="4" strokeLinecap="round" />
      {/* Left leg hanging */}
      <line x1={hipX + 10} y1={hipY + 10} x2={hipX + 45} y2={floorY - 15} stroke={C.leftLeg} strokeWidth="4" strokeLinecap="round" />
      <circle cx={hipX + 45} cy={floorY - 15} r="3" fill={C.leftLeg} />
      {/* Torso extending up */}
      <line x1={hipX} y1={hipY} x2={shX} y2={shY} stroke={C.body} strokeWidth="5" strokeLinecap="round" />
      <circle cx={hdX} cy={hdY} r="10" fill="none" stroke={C.body} strokeWidth="2.5" />
      {/* Arms crossed at chest */}
      <line x1={shX - 5} y1={shY + 3} x2={shX + 10} y2={shY + 10} stroke={C.body} strokeWidth="3" strokeLinecap="round" />
      <line x1={shX + 5} y1={shY + 3} x2={shX - 10} y2={shY + 10} stroke={C.body} strokeWidth="3" strokeLinecap="round" />
      {/* Erector spinae highlight */}
      <ellipse cx={(hipX + shX) / 2} cy={(hipY + shY) / 2} rx="6" ry="18" fill={C.active} opacity={ext * 0.35} />
      {ext > 0.3 && <text x={hipX + 25} y={(hipY + shY) / 2 - 5} fill={C.active} fontSize="9" fontWeight="bold" fontFamily="monospace">erectors</text>}
    </g>
  );
}

export function ProneSingleArmReach({ t }: AnimProps) {
  const phase = t < 0.5 ? t / 0.5 : (t - 0.5) / 0.5;
  const side = t < 0.5 ? "right" : "left";
  const reach = Math.sin(phase * Math.PI);
  const floorY = 220;
  const boxX = 120, boxY = floorY - 45, boxW = 120, boxH = 45;
  const hipX = boxX + boxW - 10, hipY = boxY + 12;
  const shX = boxX + 40, shY = boxY + 8;
  const hdX = boxX + 20, hdY = boxY + 2;
  return (
    <g>
      <line x1="40" y1={floorY} x2="360" y2={floorY} stroke={C.floor} strokeWidth="1.5" />
      <Box x={boxX} y={boxY} w={boxW} h={boxH} />
      {/* Torso */}
      <line x1={hipX} y1={hipY} x2={shX} y2={shY} stroke={C.body} strokeWidth="5" strokeLinecap="round" />
      <circle cx={hdX} cy={hdY} r="10" fill="none" stroke={C.body} strokeWidth="2.5" />
      {/* Legs */}
      <line x1={hipX} y1={hipY + 5} x2={hipX + 40} y2={floorY - 5} stroke={C.body} strokeWidth="4" strokeLinecap="round" />
      <line x1={hipX - 5} y1={hipY + 5} x2={hipX + 30} y2={floorY - 5} stroke={C.leftLeg} strokeWidth="3.5" strokeLinecap="round" />
      {/* Reaching arm */}
      {side === "right" ? (
        <>
          <line x1={shX + 5} y1={shY} x2={shX - 20 - reach * 50} y2={shY - 10 - reach * 35} stroke={C.active} strokeWidth="4" strokeLinecap="round" />
          <circle cx={shX - 20 - reach * 50} cy={shY - 10 - reach * 35} r="4" fill={C.active} />
          <line x1={shX - 5} y1={shY + 5} x2={shX - 15} y2={boxY + boxH - 5} stroke={C.body} strokeWidth="3" strokeLinecap="round" />
        </>
      ) : (
        <>
          <line x1={shX - 5} y1={shY} x2={shX - 20 - reach * 50} y2={shY - 10 - reach * 35} stroke={C.active} strokeWidth="4" strokeLinecap="round" />
          <circle cx={shX - 20 - reach * 50} cy={shY - 10 - reach * 35} r="4" fill={C.active} />
          <line x1={shX + 5} y1={shY + 5} x2={shX + 15} y2={boxY + boxH - 5} stroke={C.body} strokeWidth="3" strokeLinecap="round" />
        </>
      )}
      {/* Anti-rotation core highlight */}
      <ellipse cx={(hipX + shX) / 2} cy={(hipY + shY) / 2 + 5} rx="14" ry="7" fill={C.active} opacity={reach * 0.35} />
      {reach > 0.3 && <text x={shX + 25} y={shY + 3} fill={C.active} fontSize="9" fontWeight="bold" fontFamily="monospace">anti-rot</text>}
    </g>
  );
}

export const PRONE_ANIMS: Record<string, React.ComponentType<AnimProps>> = {
  p1: ProneHipExtension,
  p2: ProneYTW,
  p3: ProneBackExtension,
  p4: ProneSingleArmReach,
};
