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

export function BirdDogProneBench({ t }: AnimProps) {
  const phase = t < 0.5 ? t / 0.5 : 1 - (t - 0.5) / 0.5;
  const lift = Math.sin(phase * Math.PI * 0.5);
  const hold = phase > 0.4 && phase < 0.6 ? 1 : lift;

  // Bench: horizontal, center-canvas
  const benchX = 80, benchY = 130, benchW = 220, benchH = 18;
  const floorY = 220;

  // Person lies face-down ON bench. Head off the LEFT edge, hips at RIGHT edge.
  const hdX = benchX - 20, hdY = benchY - 2;
  const shX = benchX + 40, shY = benchY - 4;
  const hipX = benchX + benchW - 5, hipY = benchY + 4;

  // Gripping hand (right hand grips bench near shoulder)
  const gripX = shX + 20, gripY = benchY + benchH - 4;

  // Left arm extends forward (toward head side) during the exercise
  const lArmX = shX - 30 - hold * 55, lArmY = shY - 8 - hold * 30;

  // RIGHT leg: hangs vertically at rest, extends to horizontal at peak
  // At phase 0: foot points straight down. At phase 1: foot extends straight back (horizontal).
  const rThighEndX = hipX + 10, rThighEndY = hipY + 35 - hold * 35;
  const rFootX = hipX + 15 + hold * 55, rFootY = rThighEndY + 35 - hold * 55;

  // LEFT leg: passive, hangs freely at all times
  const lThighEndX = hipX - 12, lThighEndY = hipY + 32;
  const lFootX = hipX - 14, lFootY = lThighEndY + 38;

  return (
    <g>
      {/* Floor */}
      <line x1="40" y1={floorY} x2="360" y2={floorY} stroke={C.floor} strokeWidth="1.5" />
      {/* Bench */}
      <rect x={benchX} y={benchY} width={benchW} height={benchH} rx="3" fill="#1e1e1e" stroke={C.equipment} strokeWidth="1.5" />
      {/* Bench legs */}
      <line x1={benchX + 20} y1={benchY + benchH} x2={benchX + 20} y2={floorY} stroke={C.equipLight} strokeWidth="3" strokeLinecap="round" />
      <line x1={benchX + benchW - 20} y1={benchY + benchH} x2={benchX + benchW - 20} y2={floorY} stroke={C.equipLight} strokeWidth="3" strokeLinecap="round" />
      {/* Torso (prone on bench) */}
      <line x1={shX} y1={shY} x2={hipX} y2={hipY} stroke={C.body} strokeWidth="5" strokeLinecap="round" />
      {/* Head (off bench edge) */}
      <circle cx={hdX} cy={hdY - 8} r="11" fill="none" stroke={C.body} strokeWidth="2.5" />
      {/* Neck */}
      <line x1={hdX + 8} y1={hdY - 2} x2={shX - 5} y2={shY} stroke={C.body} strokeWidth="3" strokeLinecap="round" />
      {/* Gripping hand (right, static) */}
      <line x1={shX + 10} y1={shY + 4} x2={gripX} y2={gripY} stroke={C.body} strokeWidth="3" strokeLinecap="round" />
      <circle cx={gripX} cy={gripY} r="4" fill={C.body} />
      {/* Passive left leg — hangs freely, red dashed */}
      <line x1={hipX - 8} y1={hipY + 6} x2={lThighEndX} y2={lThighEndY} stroke={C.leftLeg} strokeWidth="4" strokeLinecap="round" strokeDasharray="6,3" opacity="0.6" />
      <line x1={lThighEndX} y1={lThighEndY} x2={lFootX} y2={lFootY} stroke={C.leftLeg} strokeWidth="3.5" strokeLinecap="round" strokeDasharray="6,3" opacity="0.6" />
      <ellipse cx={lFootX} cy={lFootY + 4} rx="5" ry="3" fill="none" stroke={C.leftLeg} strokeWidth="1.5" strokeDasharray="3,2" opacity="0.5" />
      <text x={lFootX - 18} y={lFootY + 16} fontSize="10" fill={C.leftLeg} fontFamily="monospace">L</text>
      {/* Active left arm extends forward — green when lifting */}
      <line x1={shX - 5} y1={shY + 3} x2={lArmX} y2={lArmY} stroke={hold > 0.05 ? C.active : C.body} strokeWidth="4" strokeLinecap="round" />
      <circle cx={lArmX} cy={lArmY} r="4" fill={hold > 0.05 ? C.active : C.body} />
      {/* Active right leg extends back — green */}
      <line x1={hipX + 5} y1={hipY + 5} x2={rThighEndX} y2={rThighEndY} stroke={C.active} strokeWidth="5" strokeLinecap="round" />
      <line x1={rThighEndX} y1={rThighEndY} x2={rFootX} y2={rFootY} stroke={C.active} strokeWidth="4.5" strokeLinecap="round" />
      <circle cx={rFootX} cy={rFootY} r="4" fill={C.active} />
      <text x={rFootX + 6} y={rFootY + 4} fontSize="11" fontWeight="bold" fill={C.active} fontFamily="monospace">R</text>
      {/* Glute activation glow at right hip */}
      <circle cx={hipX + 8} cy={hipY - 4} r="13" fill={C.active} opacity={hold * 0.3} />
      {/* HOLD label at peak */}
      {hold > 0.85 && (
        <text x={hipX + 25} y={hipY - 18} fontSize="10" fontWeight="bold" fill={C.active} fontFamily="monospace">HOLD</text>
      )}
    </g>
  );
}

export function ProneHamCurlRight({ t }: AnimProps) {
  const phase = t < 0.5 ? t / 0.5 : 1 - (t - 0.5) / 0.5;
  const lift = Math.sin(phase * Math.PI * 0.5);
  const hold = phase > 0.4 && phase < 0.6 ? 1 : lift;
  const floorY = 220;

  // Machine: flat bench with slight head-down tilt
  const machineX = 70, machineY = 130, machineW = 200, machineH = 16;
  // Ankle roller assembly at foot end (right side)
  const rollerX = machineX + machineW, rollerY = machineY + machineH - 2;

  // Machine legs
  const legHeadY = machineY + machineH;
  const legFootY = floorY;

  // Person lies face-down. Head at left, feet at right.
  const hdX = machineX - 18, hdY = machineY - 6;
  const shX = machineX + 35, shY = machineY - 3;
  const hipX = machineX + 120, hipY = machineY + 2;

  // Right leg: thigh from hip toward roller, shin curls UP
  // At phase 0: leg is straight, foot near the roller pad at ankle height
  // At phase 1: knee bent ~80°, foot arcs up toward glutes
  const rThighEndX = machineX + machineW - 15, rThighEndY = machineY + 12;
  // Shin pivot is at the roller (knee joint at thigh end)
  const shinAngle = hold * 1.4; // radians: 0 = straight back, 1.4 ~ 80°
  const shinLen = 60;
  const rFootX = rThighEndX + Math.cos(Math.PI - shinAngle) * shinLen;
  const rFootY = rThighEndY - Math.sin(shinAngle) * shinLen;

  // Ankle pad follows foot
  const padX = rFootX, padY = rFootY + 2;

  // Left leg: hangs off the side of the machine (to the left of the person)
  const lThighEndX = hipX - 10, lThighEndY = hipY + 30;
  const lFootX = hipX - 18, lFootY = lThighEndY + 35;

  return (
    <g>
      {/* Floor */}
      <line x1="40" y1={floorY} x2="360" y2={floorY} stroke={C.floor} strokeWidth="1.5" />
      {/* Machine bench surface */}
      <rect x={machineX} y={machineY} width={machineW} height={machineH} rx="3" fill="#1e1e1e" stroke={C.equipment} strokeWidth="1.5" />
      {/* Machine legs */}
      <line x1={machineX + 20} y1={legHeadY} x2={machineX + 20} y2={legFootY} stroke={C.equipLight} strokeWidth="3" />
      <line x1={machineX + machineW - 20} y1={legHeadY} x2={machineX + machineW - 20} y2={legFootY} stroke={C.equipLight} strokeWidth="3" />
      {/* Roller housing at foot end */}
      <rect x={rollerX - 4} y={rollerY - 18} width="12" height="30" rx="3" fill={C.equipment} stroke={C.equipLight} strokeWidth="1" />
      <ellipse cx={rollerX + 4} cy={rollerY + 4} rx="7" ry="7" fill={C.equipLight} stroke={C.weight} strokeWidth="1.5" />
      <text x={rollerX + 14} y={rollerY + 8} fontSize="8" fill={C.label} fontFamily="monospace">pad</text>
      {/* Torso */}
      <line x1={shX} y1={shY} x2={hipX} y2={hipY} stroke={C.body} strokeWidth="5" strokeLinecap="round" />
      {/* Head */}
      <circle cx={hdX} cy={hdY - 8} r="11" fill="none" stroke={C.body} strokeWidth="2.5" />
      <line x1={hdX + 8} y1={hdY} x2={shX - 5} y2={shY} stroke={C.body} strokeWidth="3" strokeLinecap="round" />
      {/* Arms resting on bench */}
      <line x1={shX + 10} y1={shY + 4} x2={shX + 35} y2={machineY + machineH - 2} stroke={C.body} strokeWidth="3" strokeLinecap="round" />
      <line x1={shX - 5} y1={shY + 4} x2={shX + 5} y2={machineY + machineH - 2} stroke={C.body} strokeWidth="3" strokeLinecap="round" />
      {/* Passive left leg — off machine, hangs to side */}
      <line x1={hipX - 6} y1={hipY + 6} x2={lThighEndX} y2={lThighEndY} stroke={C.leftLeg} strokeWidth="4" strokeLinecap="round" strokeDasharray="6,3" opacity="0.6" />
      <line x1={lThighEndX} y1={lThighEndY} x2={lFootX} y2={lFootY} stroke={C.leftLeg} strokeWidth="3.5" strokeLinecap="round" strokeDasharray="6,3" opacity="0.6" />
      <ellipse cx={lFootX} cy={lFootY + 4} rx="5" ry="3" fill="none" stroke={C.leftLeg} strokeWidth="1.5" strokeDasharray="3,2" opacity="0.5" />
      <text x={lFootX - 22} y={lFootY + 16} fontSize="10" fill={C.leftLeg} fontFamily="monospace">L off</text>
      {/* Active right leg — thigh + curling shin */}
      <line x1={hipX + 5} y1={hipY + 4} x2={rThighEndX} y2={rThighEndY} stroke={C.active} strokeWidth="5" strokeLinecap="round" />
      <line x1={rThighEndX} y1={rThighEndY} x2={rFootX} y2={rFootY} stroke={C.active} strokeWidth="4.5" strokeLinecap="round" />
      <circle cx={rFootX} cy={rFootY} r="4" fill={C.active} />
      {/* Ankle pad on right foot */}
      <rect x={padX - 6} y={padY - 4} width="12" height="7" rx="3" fill={C.strap} opacity="0.9" />
      <text x={rThighEndX + 10} y={rThighEndY - 8} fontSize="11" fontWeight="bold" fill={C.active} fontFamily="monospace">R</text>
      {/* Hamstring activation glow (back of right thigh) */}
      <circle cx={(hipX + 5 + rThighEndX) / 2} cy={(hipY + 4 + rThighEndY) / 2 - 4} r="14" fill={C.active} opacity={hold * 0.3} />
      {hold > 0.85 && (
        <text x={hipX + 30} y={hipY - 10} fontSize="10" fontWeight="bold" fill={C.active} fontFamily="monospace">HOLD</text>
      )}
    </g>
  );
}

// ── Ham Curl Machine Core Exercises (p7–p12) ──
// Person lies face-down on prone ham curl machine, ankles locked under pad.
// Head at left, feet at right. Same machine as p6 but used for core work.

function HamCurlMachine({ floorY = 220 }: { floorY?: number }) {
  const machineX = 70, machineY = 130, machineW = 200, machineH = 16;
  return (
    <g>
      <line x1="40" y1={floorY} x2="360" y2={floorY} stroke={C.floor} strokeWidth="1.5" />
      {/* Bench surface */}
      <rect x={machineX} y={machineY} width={machineW} height={machineH} rx="3" fill="#1e1e1e" stroke={C.equipment} strokeWidth="1.5" />
      {/* Bench legs */}
      <line x1={machineX + 20} y1={machineY + machineH} x2={machineX + 20} y2={floorY} stroke={C.equipLight} strokeWidth="3" />
      <line x1={machineX + machineW - 20} y1={machineY + machineH} x2={machineX + machineW - 20} y2={floorY} stroke={C.equipLight} strokeWidth="3" />
      {/* Ankle pad at foot end (right side) */}
      <rect x={machineX + machineW} y={machineY + machineH - 20} width="12" height="30" rx="3" fill={C.equipment} stroke={C.equipLight} strokeWidth="1" />
      <ellipse cx={machineX + machineW + 10} cy={machineY + machineH + 2} rx="7" ry="7" fill={C.equipLight} stroke={C.weight} strokeWidth="1.5" />
      <text x={machineX + machineW + 20} y={machineY + machineH + 6} fontSize="8" fill={C.label} fontFamily="monospace">pad</text>
    </g>
  );
}

/** Prone person on ham curl machine. Head at left, ankles under pad at right. */
function HamCurlPerson({ chestLift = 0, sideShift = 0 }: { chestLift?: number; sideShift?: number }) {
  const machineX = 70, machineY = 130;
  const hipX = machineX + 120, hipY = machineY + 2;
  const shX = machineX + 35, shY = machineY - 3 - chestLift;
  const hdX = machineX - 18, hdY = shY - 8 + sideShift * 0.3;
  return (
    <g>
      {/* Legs on bench — shins locked under ankle pad */}
      <line x1={hipX + 5} y1={hipY + 4} x2={machineX + 185} y2={machineY + 12} stroke={C.body} strokeWidth="5" strokeLinecap="round" />
      <line x1={machineX + 185} y1={machineY + 12} x2={machineX + 200} y2={machineY + 14} stroke={C.body} strokeWidth="4.5" strokeLinecap="round" />
      {/* Second leg slightly offset */}
      <line x1={hipX - 3} y1={hipY + 8} x2={machineX + 182} y2={machineY + 14} stroke={C.body} strokeWidth="4" strokeLinecap="round" opacity="0.5" />
      {/* Torso */}
      <line
        x1={hipX}
        y1={hipY}
        x2={shX + sideShift}
        y2={shY + sideShift * 0.3}
        stroke={C.body}
        strokeWidth="5"
        strokeLinecap="round"
      />
      {/* Head */}
      <circle cx={hdX + sideShift} cy={hdY} r="10" fill="none" stroke={C.body} strokeWidth="2.5" />
      <line x1={hdX + 8 + sideShift} y1={hdY + 4} x2={shX - 5 + sideShift} y2={shY + sideShift * 0.3} stroke={C.body} strokeWidth="3" strokeLinecap="round" />
    </g>
  );
}

export function ProneYRaise({ t }: AnimProps) {
  const phase = t < 0.5 ? t / 0.5 : 1 - (t - 0.5) / 0.5;
  const lift = Math.sin(phase * Math.PI * 0.5);
  const machineX = 70, machineY = 130;
  const shX = machineX + 35, shY = machineY - 3 - lift * 12;

  // Y-raise: arms extend overhead at ~45° angle, thumbs up
  const lArmX = shX - 30 - lift * 40, lArmY = shY - 10 - lift * 45;
  const rArmX = shX + 10 + lift * 30, rArmY = shY - 10 - lift * 45;

  return (
    <g>
      <HamCurlMachine />
      <HamCurlPerson chestLift={lift * 12} />
      {/* Arms — Y shape */}
      <line x1={shX - 5} y1={shY + 3} x2={lArmX} y2={lArmY} stroke={C.active} strokeWidth="3.5" strokeLinecap="round" />
      <circle cx={lArmX} cy={lArmY} r="3.5" fill={C.active} />
      <line x1={shX + 5} y1={shY + 3} x2={rArmX} y2={rArmY} stroke={C.active} strokeWidth="3.5" strokeLinecap="round" />
      <circle cx={rArmX} cy={rArmY} r="3.5" fill={C.active} />
      {/* Scapular activation glow */}
      <ellipse cx={shX} cy={shY + 10} rx="14" ry="6" fill={C.active} opacity={lift * 0.3} />
      {/* Letter label */}
      <text x={330} y={60} fontSize="24" fontWeight="bold" fill={C.active} fontFamily="monospace" opacity="0.5">Y</text>
      {lift > 0.3 && <text x={shX - 10} y={shY - 18} fill={C.active} fontSize="9" fontWeight="bold" fontFamily="monospace">lower traps</text>}
    </g>
  );
}

export function ProneTRaise({ t }: AnimProps) {
  const phase = t < 0.5 ? t / 0.5 : 1 - (t - 0.5) / 0.5;
  const lift = Math.sin(phase * Math.PI * 0.5);
  const machineX = 70, machineY = 130;
  const shX = machineX + 35, shY = machineY - 3 - lift * 8;

  // T-raise: arms straight out to sides (perpendicular to torso)
  const armUp = shY - lift * 35;
  const armDown = shY + 15 + lift * 5;

  return (
    <g>
      <HamCurlMachine />
      <HamCurlPerson chestLift={lift * 8} />
      {/* Arms — T shape (top and bottom of person, since they're prone facing left) */}
      <line x1={shX} y1={shY} x2={shX} y2={armUp} stroke={C.active} strokeWidth="3.5" strokeLinecap="round" />
      <circle cx={shX} cy={armUp} r="3.5" fill={C.active} />
      <line x1={shX} y1={shY + 5} x2={shX} y2={armDown} stroke={C.active} strokeWidth="3.5" strokeLinecap="round" />
      <circle cx={shX} cy={armDown} r="3.5" fill={C.active} />
      {/* Mid-trap activation glow */}
      <ellipse cx={shX + 15} cy={shY + 8} rx="14" ry="6" fill={C.active} opacity={lift * 0.3} />
      {/* Letter label */}
      <text x={330} y={60} fontSize="24" fontWeight="bold" fill={C.active} fontFamily="monospace" opacity="0.5">T</text>
      {lift > 0.3 && <text x={shX + 35} y={shY} fill={C.active} fontSize="9" fontWeight="bold" fontFamily="monospace">mid traps</text>}
    </g>
  );
}

export function ProneWRaise({ t }: AnimProps) {
  const phase = t < 0.5 ? t / 0.5 : 1 - (t - 0.5) / 0.5;
  const lift = Math.sin(phase * Math.PI * 0.5);
  const machineX = 70, machineY = 130;
  const shX = machineX + 35, shY = machineY - 3 - lift * 10;

  // W-raise: elbows bent ~90°, externally rotated. Two-segment arms.
  // Upper arm goes slightly out, forearm angles back (external rotation)
  const elbowUpX = shX - 10, elbowUpY = shY - 12 - lift * 12;
  const handUpX = shX - 25 - lift * 8, handUpY = elbowUpY - 5 - lift * 8;
  const elbowDownX = shX - 5, elbowDownY = shY + 18 + lift * 5;
  const handDownX = shX - 20 - lift * 8, handDownY = elbowDownY + 5 + lift * 8;

  return (
    <g>
      <HamCurlMachine />
      <HamCurlPerson chestLift={lift * 10} />
      {/* Arms — W shape (elbows bent, externally rotated) */}
      <line x1={shX - 3} y1={shY - 2} x2={elbowUpX} y2={elbowUpY} stroke={C.active} strokeWidth="3.5" strokeLinecap="round" />
      <line x1={elbowUpX} y1={elbowUpY} x2={handUpX} y2={handUpY} stroke={C.active} strokeWidth="3" strokeLinecap="round" />
      <circle cx={handUpX} cy={handUpY} r="3" fill={C.active} />
      <line x1={shX - 3} y1={shY + 5} x2={elbowDownX} y2={elbowDownY} stroke={C.active} strokeWidth="3.5" strokeLinecap="round" />
      <line x1={elbowDownX} y1={elbowDownY} x2={handDownX} y2={handDownY} stroke={C.active} strokeWidth="3" strokeLinecap="round" />
      <circle cx={handDownX} cy={handDownY} r="3" fill={C.active} />
      {/* Rotator cuff glow */}
      <ellipse cx={shX + 10} cy={shY + 6} rx="12" ry="8" fill={C.active} opacity={lift * 0.3} />
      {/* Letter label */}
      <text x={330} y={60} fontSize="24" fontWeight="bold" fill={C.active} fontFamily="monospace" opacity="0.5">W</text>
      {lift > 0.3 && <text x={shX + 28} y={shY - 2} fill={C.active} fontSize="9" fontWeight="bold" fontFamily="monospace">ext rotate</text>}
    </g>
  );
}

export function ProneTrunkExtension({ t }: AnimProps) {
  const phase = t < 0.5 ? t / 0.5 : 1 - (t - 0.5) / 0.5;
  const ext = Math.sin(phase * Math.PI * 0.5);
  const machineX = 70, machineY = 130;
  const hipX = machineX + 120, hipY = machineY + 2;
  const shX = machineX + 35, shY = machineY - 3 - ext * 22;
  const hdX = machineX - 18, hdY = shY - 12;

  return (
    <g>
      <HamCurlMachine />
      {/* Legs on bench */}
      <line x1={hipX + 5} y1={hipY + 4} x2={machineX + 185} y2={machineY + 12} stroke={C.body} strokeWidth="5" strokeLinecap="round" />
      <line x1={machineX + 185} y1={machineY + 12} x2={machineX + 200} y2={machineY + 14} stroke={C.body} strokeWidth="4.5" strokeLinecap="round" />
      <line x1={hipX - 3} y1={hipY + 8} x2={machineX + 182} y2={machineY + 14} stroke={C.body} strokeWidth="4" strokeLinecap="round" opacity="0.5" />
      {/* Ghost of start position (flat torso) */}
      <line x1={hipX} y1={hipY} x2={shX} y2={machineY - 3} stroke={C.body} strokeWidth="4" strokeLinecap="round" opacity="0.12" />
      {/* Torso lifting */}
      <line x1={hipX} y1={hipY} x2={shX} y2={shY} stroke={C.body} strokeWidth="5" strokeLinecap="round" />
      {/* Head */}
      <circle cx={hdX} cy={hdY} r="10" fill="none" stroke={C.body} strokeWidth="2.5" />
      <line x1={hdX + 8} y1={hdY + 6} x2={shX - 5} y2={shY} stroke={C.body} strokeWidth="3" strokeLinecap="round" />
      {/* Hands behind head (plate optional) */}
      <line x1={shX - 5} y1={shY + 3} x2={hdX + 12} y2={hdY + 5} stroke={C.body} strokeWidth="3" strokeLinecap="round" />
      <line x1={shX + 5} y1={shY + 6} x2={hdX + 10} y2={hdY + 8} stroke={C.body} strokeWidth="3" strokeLinecap="round" />
      <circle cx={hdX + 14} cy={hdY + 2} r="5" fill="none" stroke={C.label} strokeWidth="1.5" strokeDasharray="2,2" />
      <text x={hdX + 22} y={hdY + 4} fill={C.label} fontSize="7" fontFamily="monospace">plate</text>
      {/* Erector spinae glow */}
      <ellipse cx={(hipX + shX) / 2} cy={(hipY + shY) / 2} rx="6" ry="18" fill={C.active} opacity={ext * 0.35} />
      {ext > 0.3 && <text x={(hipX + shX) / 2 + 12} y={(hipY + shY) / 2 - 5} fill={C.active} fontSize="9" fontWeight="bold" fontFamily="monospace">erectors</text>}
    </g>
  );
}

export function ProneIsoHold({ t }: AnimProps) {
  // Subtle breathing oscillation rather than big movement
  const breath = Math.sin(t * Math.PI * 4) * 0.15; // gentle sway
  const machineX = 70, machineY = 130;
  const holdLift = 14; // constant slight lift
  const shX = machineX + 35, shY = machineY - 3 - holdLift - breath;

  return (
    <g>
      <HamCurlMachine />
      <HamCurlPerson chestLift={holdLift + breath} />
      {/* Arms hanging down (relaxed) */}
      <line x1={shX - 5} y1={shY + 5} x2={shX - 15} y2={shY + 25} stroke={C.body} strokeWidth="3" strokeLinecap="round" opacity="0.6" />
      <line x1={shX + 5} y1={shY + 7} x2={shX - 5} y2={shY + 27} stroke={C.body} strokeWidth="3" strokeLinecap="round" opacity="0.6" />
      {/* Erector glow (sustained) */}
      <ellipse cx={(machineX + 120 + shX) / 2} cy={(machineY + 2 + shY) / 2} rx="6" ry="18" fill={C.active} opacity={0.3} />
      {/* Timer indicator */}
      <rect x={300} y={50} width="62" height="18" rx="4" fill="none" stroke={C.active} strokeWidth="1" strokeDasharray="3,2" />
      <text x={331} y={62} textAnchor="middle" fill={C.active} fontSize="10" fontWeight="bold" fontFamily="monospace">20-45s</text>
      {/* HOLD label */}
      <text x={shX - 10} y={shY - 18} fill={C.active} fontSize="10" fontWeight="bold" fontFamily="monospace">HOLD</text>
    </g>
  );
}

export function ProneLateralTrunkRaise({ t }: AnimProps) {
  // Alternate left-right side bend
  const phase = t < 0.5 ? t / 0.5 : (t - 0.5) / 0.5;
  const side = t < 0.5 ? -1 : 1; // -1 = shift up in SVG (one side), +1 = shift down (other side)
  const bend = Math.sin(phase * Math.PI) * side;
  const sideShift = bend * 12;
  const lift = Math.abs(bend) * 10;

  return (
    <g>
      <HamCurlMachine />
      <HamCurlPerson chestLift={lift} sideShift={sideShift} />
      {/* Arms hanging */}
      {(() => {
        const machineX = 70, machineY = 130;
        const shX = machineX + 35 + sideShift, shY = machineY - 3 - lift + sideShift * 0.3;
        return (
          <>
            <line x1={shX - 5} y1={shY + 5} x2={shX - 15} y2={shY + 25} stroke={C.body} strokeWidth="3" strokeLinecap="round" opacity="0.6" />
            <line x1={shX + 5} y1={shY + 7} x2={shX - 5} y2={shY + 27} stroke={C.body} strokeWidth="3" strokeLinecap="round" opacity="0.6" />
            {/* Oblique/QL glow */}
            <ellipse cx={(machineX + 120 + shX) / 2} cy={(machineY + 2 + shY) / 2} rx="10" ry="12" fill={C.active} opacity={Math.abs(bend) * 0.3} />
            {Math.abs(bend) > 0.3 && (
              <text x={(machineX + 120 + shX) / 2 + 16} y={(machineY + 2 + shY) / 2 - 5} fill={C.active} fontSize="9" fontWeight="bold" fontFamily="monospace">
                {side < 0 ? "L oblique" : "R oblique"}
              </text>
            )}
          </>
        );
      })()}
      {/* Direction label */}
      <text x={330} y={60} fontSize="11" fill={C.active} fontFamily="monospace" opacity="0.6">
        {t < 0.5 ? "← bend" : "bend →"}
      </text>
    </g>
  );
}

export const PRONE_ANIMS: Record<string, React.ComponentType<AnimProps>> = {
  p1: ProneHipExtension,
  p2: ProneYTW,
  p3: ProneBackExtension,
  p4: ProneSingleArmReach,
  p5: BirdDogProneBench,
  p6: ProneHamCurlRight,
  p7: ProneYRaise,
  p8: ProneTRaise,
  p9: ProneWRaise,
  p10: ProneTrunkExtension,
  p11: ProneIsoHold,
  p12: ProneLateralTrunkRaise,
};
