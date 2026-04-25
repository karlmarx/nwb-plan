// Rack core exercise animations (new)

import { C, Floor, Rack, Dumbbell, Plate, Box, Strap } from "./helpers";

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

// r6 — Supine McGill curl-up. Tiny ROM — only head + shoulder blades lift.
// RIGHT knee bent, foot flat. LEFT leg straight and passive on the floor.
export function McGillCurlUp({ t }: AnimProps) {
  const phase = t < 0.5 ? t / 0.5 : 1 - (t - 0.5) / 0.5;
  const lift  = Math.sin(phase * Math.PI * 0.5);
  const hold  = phase > 0.4 && phase < 0.6 ? 1 : lift;

  const floorY = 220;

  // Supine: head at left, feet toward right
  // Body lies mostly on the floor; only head/upper-shoulders animate up
  const headX = 70;
  const headY = floorY - 14 - hold * 4;   // lifts ~4px at peak (tiny ROM)

  const neckX = headX + 12, neckY = floorY - 12 - hold * 3;
  const shX   = headX + 30, shY   = floorY - 10 - hold * 2; // upper back lifts slightly
  const midX  = headX + 70, midY  = floorY - 10;             // lower back stays flat
  const hipX  = headX + 120, hipY = floorY - 10;

  // Gap under lumbar arch (constant, represents natural arch)
  const archY  = floorY - 5;   // floor reference
  const lumbarX = midX + 20;   // centre of the arch indicator

  // RIGHT knee bent — foot flat on floor
  const rKneeX = hipX + 50, rKneeY = floorY - 40;
  const rFootX = hipX + 80, rFootY = floorY;

  // LEFT leg — straight, fully extended, flat on floor
  const lFootX = hipX + 100, lFootY = floorY - 2;

  // Hands under lumbar (monitoring position)
  const hnd1X = lumbarX - 8, hnd1Y = floorY - 4;
  const hnd2X = lumbarX + 8, hnd2Y = floorY - 4;

  // Upper-ab activation glow
  const glowCx = shX + 10, glowCy = shY - 5;

  return (
    <g>
      {/* Floor */}
      <line x1="30" y1={floorY} x2="370" y2={floorY} stroke={C.floor} strokeWidth="1" strokeDasharray="4,4" />
      <rect x="30" y={floorY} width="340" height="4" fill={C.floorFill} opacity="0.5" />

      {/* Hands under lumbar (draw before body so they look tucked under) */}
      <circle cx={hnd1X} cy={hnd1Y} r="4" fill="none" stroke={C.body} strokeWidth="1.5" opacity="0.6" />
      <circle cx={hnd2X} cy={hnd2Y} r="4" fill="none" stroke={C.body} strokeWidth="1.5" opacity="0.6" />

      {/* Lumbar arch indicator */}
      <path d={`M ${lumbarX - 15} ${floorY} Q ${lumbarX} ${archY - 5} ${lumbarX + 15} ${floorY}`}
        fill="none" stroke={C.label} strokeWidth="1" strokeDasharray="3,2" opacity="0.6" />
      <text x={lumbarX - 8} y={archY - 9} fontSize="8" fill={C.label} fontFamily="monospace" opacity="0.7">arch</text>

      {/* Torso — lower back stays on floor, upper-back/head lifts */}
      <line x1={hipX} y1={hipY} x2={midX} y2={midY}
        stroke={C.body} strokeWidth="5" strokeLinecap="round" />
      <line x1={midX} y1={midY} x2={shX} y2={shY}
        stroke={C.body} strokeWidth="5" strokeLinecap="round" />
      <line x1={shX} y1={shY} x2={neckX} y2={neckY}
        stroke={C.body} strokeWidth="4" strokeLinecap="round" />

      {/* Head */}
      <circle cx={headX} cy={headY} r="12" fill="none" stroke={C.body} strokeWidth="2.5" />

      {/* RIGHT leg — bent, foot flat (active/supporting side) */}
      <line x1={hipX + 5} y1={hipY} x2={rKneeX} y2={rKneeY}
        stroke={C.body} strokeWidth="5" strokeLinecap="round" />
      <line x1={rKneeX} y1={rKneeY} x2={rFootX} y2={rFootY}
        stroke={C.active} strokeWidth="5" strokeLinecap="round" />
      <rect x={rFootX - 7} y={rFootY - 4} width="16" height="5" rx="2" fill={C.active} />
      <text x={rKneeX + 6} y={rKneeY - 5} fontSize="11" fontWeight="bold"
        fill={C.active} fontFamily="monospace">R</text>

      {/* LEFT leg — straight, passive, flat on floor */}
      <line x1={hipX - 4} y1={hipY + 2} x2={hipX + 55} y2={floorY - 2}
        stroke={C.leftLeg} strokeWidth="4" strokeLinecap="round"
        strokeDasharray="6,3" opacity="0.6" />
      <line x1={hipX + 55} y1={floorY - 2} x2={lFootX} y2={lFootY}
        stroke={C.leftLeg} strokeWidth="4" strokeLinecap="round"
        strokeDasharray="6,3" opacity="0.6" />
      <ellipse cx={lFootX + 4} cy={lFootY + 3} rx="7" ry="3"
        fill="none" stroke={C.leftLeg} strokeWidth="1.5"
        strokeDasharray="3,2" opacity="0.5" />
      <text x={lFootX - 3} y={lFootY + 13} fontSize="10"
        fill={C.leftLeg} fontFamily="monospace">L</text>

      {/* Upper-ab activation glow */}
      <circle cx={glowCx} cy={glowCy} r="13" fill={C.active} opacity={hold * 0.3} />

      {/* Tiny ROM arrow (only visible when not at peak) */}
      {hold < 0.35 && (
        <text x={headX - 10} y={headY - 16} fontSize="9" fill={C.label}
          fontFamily="monospace" opacity="0.7">tiny ROM</text>
      )}

      {/* HOLD at peak */}
      {hold > 0.5 && (
        <text x={shX - 5} y={shY - 16} fontSize="10" fontWeight="bold"
          fill={C.active} fontFamily="monospace">HOLD</text>
      )}
    </g>
  );
}

// r7 — Stir the Pot on stability ball. Continuous forearm circles.
// RIGHT foot/knee grounded at back. LEFT leg extended behind, passive on mat.
export function StirThePot({ t }: AnimProps) {
  // Continuous circular motion — no ping-pong
  const circX = Math.cos(t * Math.PI * 2);
  const circY = Math.sin(t * Math.PI * 2);

  const floorY = 220;

  // Stability ball — centre of ball rests on floor
  const ballCx = 155, ballCy = floorY - 28, ballR = 28;

  // Forearms trace a small circle on top of the ball
  const elbCx = ballCx + circX * 8;
  const elbCy = ballCy - ballR + 4 + circY * 6;  // on top of ball surface, slightly moving

  // Shoulder follows the forearm slightly (tiny wobble)
  const shX = elbCx + 35, shY = elbCy - 25;
  const hipX = shX + 60, hipY = shY + 8;
  const hdX  = elbCx + 12, hdY = elbCy - 35;

  // RIGHT foot/knee grounded — far right
  const rKneeX = hipX + 40, rKneeY = floorY - 12;
  const rFootX = hipX + 75, rFootY = floorY;

  // LEFT leg — extended behind, flat on mat
  const lThighX2 = hipX + 30, lThighY2 = floorY - 4;
  const lFootX   = hipX + 90, lFootY   = floorY - 2;

  // Rotation direction arrow near ball
  const arrowAngle = t * 360; // full rotation label position
  const arrowX = ballCx + 42, arrowY = ballCy - 10;
  const isClockwise = circY > 0; // sin > 0 means going "down" side = CW in standard SVG coords

  return (
    <g>
      {/* Floor / mat */}
      <line x1="30" y1={floorY} x2="370" y2={floorY} stroke={C.floor} strokeWidth="1" strokeDasharray="4,4" />
      <rect x="30" y={floorY} width="340" height="4" fill={C.floorFill} opacity="0.5" />

      {/* Stability ball */}
      <circle cx={ballCx} cy={ballCy} r={ballR}
        fill={C.equipLight} stroke={C.equipment} strokeWidth="2" opacity="0.85" />
      {/* Ball cross-hatch for texture */}
      <ellipse cx={ballCx} cy={ballCy} rx={ballR * 0.9} ry={ballR * 0.5}
        fill="none" stroke={C.equipment} strokeWidth="0.5" opacity="0.4" />
      <line x1={ballCx} y1={ballCy - ballR + 2} x2={ballCx} y2={ballCy + ballR - 2}
        stroke={C.equipment} strokeWidth="0.5" opacity="0.4" />

      {/* Forearms on ball — trace the circle */}
      {/* Left forearm */}
      <line x1={elbCx - 8} y1={elbCy} x2={elbCx + 3} y2={elbCy - 2}
        stroke={C.body} strokeWidth="4" strokeLinecap="round" />
      {/* Right forearm */}
      <line x1={elbCx + 3} y1={elbCy - 2} x2={elbCx + 16} y2={elbCy - 1}
        stroke={C.body} strokeWidth="4" strokeLinecap="round" />

      {/* Torso — plank line from elbows to hip */}
      <line x1={elbCx + 10} y1={elbCy - 5} x2={shX} y2={shY}
        stroke={C.body} strokeWidth="5" strokeLinecap="round" />
      <line x1={shX} y1={shY} x2={hipX} y2={hipY}
        stroke={C.body} strokeWidth="5" strokeLinecap="round" />

      {/* Head */}
      <circle cx={hdX} cy={hdY} r="10" fill="none" stroke={C.body} strokeWidth="2.5" />

      {/* RIGHT foot/knee grounded (active side) */}
      <line x1={hipX + 4} y1={hipY} x2={rKneeX} y2={rKneeY}
        stroke={C.active} strokeWidth="5" strokeLinecap="round" />
      <line x1={rKneeX} y1={rKneeY} x2={rFootX} y2={rFootY}
        stroke={C.active} strokeWidth="5" strokeLinecap="round" />
      <rect x={rFootX - 7} y={rFootY - 4} width="16" height="5" rx="2" fill={C.active} />
      <text x={rKneeX + 6} y={rKneeY - 5} fontSize="11" fontWeight="bold"
        fill={C.active} fontFamily="monospace">R</text>

      {/* LEFT leg — passive, flat on mat */}
      <line x1={hipX - 4} y1={hipY + 2} x2={lThighX2} y2={lThighY2}
        stroke={C.leftLeg} strokeWidth="4" strokeLinecap="round"
        strokeDasharray="6,3" opacity="0.6" />
      <line x1={lThighX2} y1={lThighY2} x2={lFootX} y2={lFootY}
        stroke={C.leftLeg} strokeWidth="4" strokeLinecap="round"
        strokeDasharray="6,3" opacity="0.6" />
      <ellipse cx={lFootX + 4} cy={lFootY + 3} rx="7" ry="3"
        fill="none" stroke={C.leftLeg} strokeWidth="1.5"
        strokeDasharray="3,2" opacity="0.5" />
      <text x={lFootX - 3} y={lFootY + 13} fontSize="10"
        fill={C.leftLeg} fontFamily="monospace">L</text>

      {/* Core anti-rotation / anti-extension glow on trunk */}
      <ellipse cx={(shX + hipX) / 2} cy={(shY + hipY) / 2}
        rx="10" ry="18" fill={C.active} opacity="0.22" />

      {/* Rotation direction arrow near ball */}
      <text x={arrowX} y={arrowY} fontSize="14" fontFamily="monospace"
        fill={C.strap}>{isClockwise ? "↻" : "↺"}</text>

      {/* "slow circles" label */}
      <text x={ballCx - 24} y={ballCy + ballR + 16} fontSize="9"
        fill={C.label} fontFamily="monospace">slow circles</text>
    </g>
  );
}

// ── LEFT-OBLIQUE LOADED / SEATED BLOCK ──

// Seated on bench, cable low-left, chop diagonally up-and-across
// to above the right shoulder. Left leg propped passively on scooter.
export function SeatedCableChopLowToHigh({ t }: AnimProps) {
  // Phase 0→0.5 = chop up; 0.5→1 = return
  const phase = t < 0.5 ? t / 0.5 : 1 - (t - 0.5) / 0.5;
  const chop = Math.sin(phase * Math.PI * 0.5);
  const floorY = 220;

  // Bench — seat span horizontal
  const benchX = 170, benchY = floorY - 38, benchW = 120, benchH = 14;
  // Seated figure center on the bench
  const hipX = benchX + benchW / 2;
  const hipY = benchY;
  const shX = hipX, shY = hipY - 55;
  const hdY = shY - 20;

  // Low-left cable anchor (low pulley on left)
  const anchorX = 60, anchorY = floorY - 25;

  // Hands travel diagonally from low-left to upper-right
  const startHX = anchorX + 30, startHY = hipY - 10;
  const endHX   = shX + 55,    endHY   = shY - 40;
  const handX = startHX + (endHX - startHX) * chop;
  const handY = startHY + (endHY - startHY) * chop;

  // Slight trunk rotation to the right
  const rot = chop * 10;

  return (
    <g>
      <Floor y={floorY} />
      {/* Bench */}
      <Box x={benchX} y={benchY} w={benchW} h={benchH} />
      <rect x={benchX + 4} y={benchY + benchH} width="4" height="26" fill={C.equipment} rx="1" />
      <rect x={benchX + benchW - 8} y={benchY + benchH} width="4" height="26" fill={C.equipment} rx="1" />

      {/* Cable stack on the far left */}
      <rect x={30} y={floorY - 100} width={28} height={90} fill={C.equipment} rx="3" />
      <rect x={34} y={floorY - 95} width={20} height="60" fill={C.weight} rx="2" opacity="0.7" />
      {/* Low pulley */}
      <circle cx={anchorX} cy={anchorY} r="5" fill={C.equipLight} stroke={C.equipment} strokeWidth="1.5" />

      {/* Knee scooter on the left of bench for passive left leg */}
      <rect x={benchX - 42} y={floorY - 28} width={38} height={8} fill={C.equipment} rx="2" />
      <circle cx={benchX - 38} cy={floorY - 6} r="6" fill={C.weight} />
      <circle cx={benchX - 10} cy={floorY - 6} r="6" fill={C.weight} />
      <rect x={benchX - 32} y={floorY - 44} width={22} height={12} fill={C.equipLight} rx="2" />
      <text x={benchX - 50} y={floorY - 55} fill={C.label} fontSize="8" fontFamily="monospace">scooter</text>

      {/* Right leg down to floor */}
      <line x1={hipX + 6} y1={hipY} x2={hipX + 6} y2={floorY - 12} stroke={C.body} strokeWidth="5" strokeLinecap="round" />
      <line x1={hipX + 6} y1={floorY - 12} x2={hipX + 18} y2={floorY} stroke={C.body} strokeWidth="4" strokeLinecap="round" />

      {/* Left leg — propped on scooter, passive */}
      <line x1={hipX - 6} y1={hipY} x2={benchX - 20} y2={floorY - 36} stroke={C.leftLeg} strokeWidth="4" strokeLinecap="round" />
      <line x1={benchX - 20} y1={floorY - 36} x2={benchX - 38} y2={floorY - 32} stroke={C.leftLeg} strokeWidth="3" strokeLinecap="round" />
      <circle cx={benchX - 38} cy={floorY - 32} r="3" fill={C.leftLeg} />

      {/* Torso rotated slightly right */}
      <line x1={hipX} y1={hipY} x2={shX + rot * 0.3} y2={shY} stroke={C.body} strokeWidth="5" strokeLinecap="round" />
      <circle cx={shX + rot * 0.3} cy={hdY} r="12" fill="none" stroke={C.body} strokeWidth="3" />

      {/* Arms gripping cable handle — both hands together */}
      <line x1={shX + rot * 0.3 - 6} y1={shY + 3} x2={handX - 3} y2={handY} stroke={C.active} strokeWidth="4" strokeLinecap="round" />
      <line x1={shX + rot * 0.3 + 6} y1={shY + 3} x2={handX + 3} y2={handY} stroke={C.active} strokeWidth="4" strokeLinecap="round" />

      {/* Cable — dashed line from pulley to hands */}
      <Strap x1={anchorX} y1={anchorY} x2={handX} y2={handY} />
      {/* Handle / rope end */}
      <circle cx={handX} cy={handY} r="5" fill={C.strap} />

      {/* Left oblique activation highlight */}
      <ellipse cx={hipX - 10 + rot * 0.2} cy={(hipY + shY) / 2} rx="7" ry="18" fill={C.active} opacity={chop * 0.55} />
      {chop > 0.3 && (
        <text x={hipX - 70} y={(hipY + shY) / 2 + 4} fill={C.active} fontSize="10" fontWeight="bold" fontFamily="monospace">L oblique</text>
      )}

      {/* Chop direction arrow */}
      {chop > 0.5 && (
        <>
          <line x1={startHX + 20} y1={startHY - 10} x2={endHX - 20} y2={endHY + 10} stroke={C.strap} strokeWidth="1.5" strokeDasharray="3,3" />
          <polygon points={`${endHX - 20},${endHY + 6} ${endHX - 12},${endHY + 10} ${endHX - 18},${endHY + 14}`} fill={C.strap} />
        </>
      )}
    </g>
  );
}

// Seated Pallof with rotation away from the stack (cable anchor on LEFT).
// Trunk rotates right while arms press straight out.
export function SeatedPallofPressWithRotation({ t }: AnimProps) {
  // t 0→0.4 press out; 0.4→0.6 rotate right + pause; 0.6→1 return
  const pressPhase = Math.min(1, t / 0.25);
  const rotPhase = t < 0.4 ? 0 : t < 0.7 ? (t - 0.4) / 0.3 : 1 - (t - 0.7) / 0.3;
  const press = pressPhase;
  const rot = Math.sin(rotPhase * Math.PI * 0.5);
  const floorY = 220;

  const benchX = 170, benchY = floorY - 38, benchW = 120, benchH = 14;
  const hipX = benchX + benchW / 2;
  const hipY = benchY;
  const shX = hipX, shY = hipY - 55;
  const hdY = shY - 20;

  // Cable anchor on left at sternum height
  const anchorX = 55, anchorY = shY + 5;

  // Hands extend straight out from sternum, then rotate right
  const extOutX = shX + 50, extOutY = shY + 5;
  const rotX = rot * 28;
  const rotY = rot * 5;
  const handX = (shX + (extOutX - shX) * press) + rotX;
  const handY = extOutY + rotY;

  return (
    <g>
      <Floor y={floorY} />
      <Box x={benchX} y={benchY} w={benchW} h={benchH} />
      <rect x={benchX + 4} y={benchY + benchH} width="4" height="26" fill={C.equipment} rx="1" />
      <rect x={benchX + benchW - 8} y={benchY + benchH} width="4" height="26" fill={C.equipment} rx="1" />

      {/* Cable stack */}
      <rect x={25} y={floorY - 170} width={28} height={160} fill={C.equipment} rx="3" />
      <rect x={29} y={floorY - 165} width={20} height="110" fill={C.weight} rx="2" opacity="0.7" />
      <circle cx={anchorX} cy={anchorY} r="5" fill={C.equipLight} stroke={C.equipment} strokeWidth="1.5" />

      {/* Scooter — left leg passive */}
      <rect x={benchX - 42} y={floorY - 28} width={38} height={8} fill={C.equipment} rx="2" />
      <circle cx={benchX - 38} cy={floorY - 6} r="6" fill={C.weight} />
      <circle cx={benchX - 10} cy={floorY - 6} r="6" fill={C.weight} />
      <rect x={benchX - 32} y={floorY - 44} width={22} height={12} fill={C.equipLight} rx="2" />

      {/* Right leg down */}
      <line x1={hipX + 6} y1={hipY} x2={hipX + 6} y2={floorY - 12} stroke={C.body} strokeWidth="5" strokeLinecap="round" />
      <line x1={hipX + 6} y1={floorY - 12} x2={hipX + 18} y2={floorY} stroke={C.body} strokeWidth="4" strokeLinecap="round" />

      {/* Left leg passive on scooter */}
      <line x1={hipX - 6} y1={hipY} x2={benchX - 20} y2={floorY - 36} stroke={C.leftLeg} strokeWidth="4" strokeLinecap="round" />
      <line x1={benchX - 20} y1={floorY - 36} x2={benchX - 38} y2={floorY - 32} stroke={C.leftLeg} strokeWidth="3" strokeLinecap="round" />
      <circle cx={benchX - 38} cy={floorY - 32} r="3" fill={C.leftLeg} />

      {/* Torso rotates right */}
      <line x1={hipX} y1={hipY} x2={shX + rot * 14} y2={shY} stroke={C.body} strokeWidth="5" strokeLinecap="round" />
      <circle cx={shX + rot * 14} cy={hdY} r="12" fill="none" stroke={C.body} strokeWidth="3" />

      {/* Arms pressing handle out, then rotated */}
      <line x1={shX + rot * 14 - 6} y1={shY + 5} x2={handX - 3} y2={handY} stroke={C.active} strokeWidth="4" strokeLinecap="round" />
      <line x1={shX + rot * 14 + 6} y1={shY + 5} x2={handX + 3} y2={handY} stroke={C.active} strokeWidth="4" strokeLinecap="round" />

      {/* Cable — anchor to hands */}
      <Strap x1={anchorX} y1={anchorY} x2={handX} y2={handY} />
      <circle cx={handX} cy={handY} r="5" fill={C.strap} />

      {/* Left oblique highlight — lights up hardest during rotation hold */}
      <ellipse cx={hipX - 9} cy={(hipY + shY) / 2} rx="7" ry="17" fill={C.active} opacity={rot * 0.6} />
      {rot > 0.4 && (
        <text x={hipX - 70} y={(hipY + shY) / 2 + 4} fill={C.active} fontSize="10" fontWeight="bold" fontFamily="monospace">L oblique</text>
      )}

      {/* Rotation arrow */}
      {rot > 0.6 && press > 0.9 && (
        <text x={shX + 30} y={shY - 18} fill={C.strap} fontSize="14" fontFamily="monospace">{"↻"}</text>
      )}
    </g>
  );
}

// Seated single-side suitcase iso-hold — DB in right hand only, upright.
export function SeatedSuitcaseIsoHoldR({ t }: AnimProps) {
  // Subtle tremor to telegraph the isometric effort
  const tremor = Math.sin(t * Math.PI * 8) * 0.6;
  const floorY = 220;

  const benchX = 170, benchY = floorY - 38, benchW = 120, benchH = 14;
  const hipX = benchX + benchW / 2;
  const hipY = benchY;
  const shX = hipX, shY = hipY - 55;
  const hdY = shY - 20;

  // DB in right hand, hanging at side
  const dbX = hipX + 38, dbY = hipY + 25;

  return (
    <g>
      <Floor y={floorY} />
      <Box x={benchX} y={benchY} w={benchW} h={benchH} />
      <rect x={benchX + 4} y={benchY + benchH} width="4" height="26" fill={C.equipment} rx="1" />
      <rect x={benchX + benchW - 8} y={benchY + benchH} width="4" height="26" fill={C.equipment} rx="1" />

      {/* Right leg down */}
      <line x1={hipX + 6} y1={hipY} x2={hipX + 6} y2={floorY - 12} stroke={C.body} strokeWidth="5" strokeLinecap="round" />
      <line x1={hipX + 6} y1={floorY - 12} x2={hipX + 18} y2={floorY} stroke={C.body} strokeWidth="4" strokeLinecap="round" />

      {/* Left leg passive on floor (or scooter) */}
      <line x1={hipX - 6} y1={hipY} x2={hipX - 20} y2={floorY - 10} stroke={C.leftLeg} strokeWidth="4" strokeLinecap="round" />
      <line x1={hipX - 20} y1={floorY - 10} x2={hipX - 40} y2={floorY} stroke={C.leftLeg} strokeWidth="3" strokeLinecap="round" />
      <circle cx={hipX - 40} cy={floorY} r="3" fill={C.leftLeg} />

      {/* Torso — stays tall, resists tipping (tiny tremor) */}
      <line x1={hipX + tremor * 0.2} y1={hipY} x2={shX + tremor * 0.1} y2={shY} stroke={C.body} strokeWidth="5" strokeLinecap="round" />
      <circle cx={shX + tremor * 0.1} cy={hdY} r="12" fill="none" stroke={C.body} strokeWidth="3" />

      {/* Left arm — empty, hangs relaxed */}
      <line x1={shX - 8} y1={shY + 5} x2={hipX - 18} y2={hipY + 10} stroke={C.body} strokeWidth="3" strokeLinecap="round" />

      {/* Right arm — loaded with DB */}
      <line x1={shX + 8} y1={shY + 5} x2={dbX} y2={dbY - 8} stroke={C.active} strokeWidth="4" strokeLinecap="round" />
      <Dumbbell x={dbX} y={dbY} angle={90} size={24} />

      {/* LEFT oblique + QL glow — lights up hard, this is the working side */}
      <ellipse cx={hipX - 10} cy={(hipY + shY) / 2} rx="7" ry="20" fill={C.active} opacity={0.6} />
      <text x={hipX - 82} y={(hipY + shY) / 2 + 4} fill={C.active} fontSize="10" fontWeight="bold" fontFamily="monospace">L QL + oblique</text>

      {/* Level shoulders reference */}
      <line x1={shX - 25} y1={shY - 3} x2={shX + 25} y2={shY - 3} stroke={C.active} strokeWidth="1" strokeDasharray="3,3" opacity="0.4" />

      {/* Tip arrow (what you resist) */}
      <text x={dbX + 8} y={dbY - 14} fill={C.strap} fontSize="12" fontFamily="monospace">{"↓"}</text>
    </g>
  );
}

// Right-side-down side plank on bench, DB in left (top) hand threading under torso
export function SidePlankThreadTheNeedle({ t }: AnimProps) {
  // Phase 0→0.5 thread under, pause, return
  const phase = t < 0.5 ? t / 0.5 : 1 - (t - 0.5) / 0.5;
  const thread = Math.sin(phase * Math.PI * 0.5);
  const floorY = 220;

  // Bench runs horizontally; forearm rests on it
  const benchX = 80, benchY = floorY - 30, benchW = 140, benchH = 12;

  // Right elbow on bench
  const elbX = benchX + 35, elbY = benchY;
  const shX = elbX + 50, shY = benchY - 32;
  const hdX = shX + 40, hdY = shY - 12;

  // Hip along the diagonal line
  const hipX = shX + 70, hipY = benchY + 18;
  // Stacked legs — both extend from hip outward to the right (feet end)
  const footX = hipX + 85, footY = hipY + 18;

  // Top (left) arm — DB starts at ceiling, threads under torso, returns
  const ceilingX = shX + 10, ceilingY = shY - 55;
  const underX = shX + 35,   underY = shY + 30;
  const dbX = ceilingX + (underX - ceilingX) * thread;
  const dbY = ceilingY + (underY - ceilingY) * thread;

  return (
    <g>
      <Floor y={floorY} />

      {/* Bench */}
      <Box x={benchX} y={benchY} w={benchW} h={benchH} />
      <rect x={benchX + 6} y={benchY + benchH} width="4" height="18" fill={C.equipment} rx="1" />
      <rect x={benchX + benchW - 10} y={benchY + benchH} width="4" height="18" fill={C.equipment} rx="1" />

      {/* Right forearm on bench — supporting arm */}
      <line x1={elbX} y1={elbY} x2={shX} y2={shY} stroke={C.body} strokeWidth="5" strokeLinecap="round" />
      {/* Forearm along bench surface */}
      <line x1={elbX} y1={elbY} x2={elbX + 40} y2={elbY} stroke={C.body} strokeWidth="5" strokeLinecap="round" />

      {/* Torso — diagonal from shoulder to hip */}
      <line x1={shX} y1={shY} x2={hipX} y2={hipY} stroke={C.body} strokeWidth="5" strokeLinecap="round" />
      {/* Head */}
      <circle cx={hdX} cy={hdY} r="12" fill="none" stroke={C.body} strokeWidth="3" />

      {/* Stacked legs — RIGHT leg underneath (body color) */}
      <line x1={hipX} y1={hipY} x2={footX} y2={footY} stroke={C.body} strokeWidth="5" strokeLinecap="round" />
      <rect x={footX - 2} y={footY - 2} width="10" height="6" fill={C.body} rx="1" />

      {/* LEFT leg — stacked PASSIVELY on top of right, drawn just above */}
      <line x1={hipX + 2} y1={hipY - 6} x2={footX - 2} y2={footY - 8} stroke={C.leftLeg} strokeWidth="4" strokeLinecap="round" />
      <circle cx={footX - 2} cy={footY - 8} r="3" fill={C.leftLeg} />
      <text x={footX + 10} y={footY - 6} fill={C.leftLeg} fontSize="8" fontFamily="monospace">L stacked passive</text>

      {/* Top (left) arm from shoulder to DB position */}
      <line x1={shX} y1={shY} x2={dbX} y2={dbY - 6} stroke={C.active} strokeWidth="4" strokeLinecap="round" />
      <Dumbbell x={dbX} y={dbY} angle={thread * 90} size={22} />

      {/* Trunk rotation arc — dashed path showing the thread motion */}
      <path
        d={`M ${ceilingX} ${ceilingY} Q ${shX + 50} ${shY - 10} ${underX} ${underY}`}
        fill="none" stroke={C.strap} strokeWidth="1.5" strokeDasharray="3,3" opacity="0.6"
      />

      {/* Left oblique activation glow — bulges at midpoint of thread */}
      <ellipse cx={(shX + hipX) / 2} cy={(shY + hipY) / 2 - 8} rx="10" ry="6" fill={C.active} opacity={thread * 0.55} />
      {thread > 0.3 && (
        <text x={(shX + hipX) / 2 - 25} y={(shY + hipY) / 2 - 18} fill={C.active} fontSize="10" fontWeight="bold" fontFamily="monospace">L oblique</text>
      )}
    </g>
  );
}

export const RACK_CORE_ANIMS: Record<string, React.ComponentType<AnimProps>> = {
  r1: LandmineRotation,
  r2: PlateHalos,
  r3: BarbellRollout,
  r4: SuitcaseHold,
  r5: OverheadPlateHold,
  r6: McGillCurlUp,
  r7: StirThePot,
  r8: SeatedCableChopLowToHigh,
  r9: SeatedPallofPressWithRotation,
  r10: SeatedSuitcaseIsoHoldR,
  r11: SidePlankThreadTheNeedle,
};
