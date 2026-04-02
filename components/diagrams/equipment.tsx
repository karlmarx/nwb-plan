// Equipment identification diagrams (static/minimal animation)

import { C, Pbar, Box } from "./helpers";

interface AnimProps { t: number }

export function PseudoPlanchePushUp({ t }: AnimProps) {
  // Push-up motion
  const phase = t < 0.5 ? t / 0.5 : 1 - (t - 0.5) / 0.5;
  const dip = Math.sin(phase * Math.PI * 0.5);
  const floorY = 220;
  const lBarX = 250, rBarX = 290;
  const handY = floorY - 35;
  // Body leans forward — key feature
  const shX = 200 + dip * 5, shY = handY - 30 - dip * 20;
  const hipX = 310, hipY = handY - 20 - dip * 8;
  const hdX = shX - 15, hdY = shY - 14;
  // Right foot on box
  const boxX = 330, boxY = floorY - 40;
  const rFootX = boxX + 15, rFootY = boxY;
  // Left leg floats
  const lFootX = boxX + 5, lFootY = boxY + 15;

  return (
    <g>
      <line x1="40" y1={floorY} x2="380" y2={floorY} stroke={C.floor} strokeWidth="1.5" />
      {/* Box */}
      <Box x={boxX} y={boxY} w={50} h={floorY - boxY} />
      <text x={boxX + 25} y={boxY + 20} textAnchor="middle" fontSize="8" fill="#555" fontFamily="monospace">box</text>
      {/* Parallettes */}
      <Pbar x={lBarX} y={floorY} h={floorY - handY + 5} />
      <Pbar x={rBarX} y={floorY} h={floorY - handY + 5} />
      {/* Straight body line (ghost) */}
      <line x1={shX - 20} y1={shY + 10} x2={rFootX} y2={rFootY} stroke={C.body} strokeWidth="0.5" strokeDasharray="5,5" opacity="0.15" />
      {/* Arms — locked or bending */}
      <line x1={lBarX} y1={handY} x2={shX - 5} y2={shY + 8} stroke={C.body} strokeWidth="4" strokeLinecap="round" />
      <line x1={rBarX} y1={handY} x2={shX + 15} y2={shY + 8} stroke={C.body} strokeWidth="4" strokeLinecap="round" />
      <circle cx={lBarX} cy={handY} r="3" fill={C.body} />
      <circle cx={rBarX} cy={handY} r="3" fill={C.body} />
      {/* Torso */}
      <line x1={shX} y1={shY} x2={hipX} y2={hipY} stroke={C.body} strokeWidth="5" strokeLinecap="round" />
      <circle cx={hdX} cy={hdY} r="10" fill="none" stroke={C.body} strokeWidth="2.5" />
      {/* Right foot on box */}
      <line x1={hipX} y1={hipY} x2={rFootX - 10} y2={(hipY + rFootY) / 2} stroke={C.body} strokeWidth="4.5" strokeLinecap="round" />
      <line x1={rFootX - 10} y1={(hipY + rFootY) / 2} x2={rFootX} y2={rFootY} stroke={C.body} strokeWidth="4" strokeLinecap="round" />
      <rect x={rFootX - 5} y={rFootY - 3} width="12" height="4" rx="2" fill={C.body} />
      {/* Left leg floating alongside */}
      <line x1={hipX - 3} y1={hipY + 3} x2={lFootX - 10} y2={(hipY + lFootY) / 2 + 5} stroke={C.leftLeg} strokeWidth="3.5" strokeLinecap="round" opacity="0.5" />
      <line x1={lFootX - 10} y1={(hipY + lFootY) / 2 + 5} x2={lFootX} y2={lFootY} stroke={C.leftLeg} strokeWidth="3" strokeLinecap="round" opacity="0.5" />
      <ellipse cx={lFootX} cy={lFootY + 3} rx="6" ry="3" fill="none" stroke={C.leftLeg} strokeWidth="1.5" strokeDasharray="3,2" opacity="0.4" />
      {/* Forward lean annotation */}
      <line x1={270} y1={handY + 5} x2={270} y2={shY - 10} stroke="#60a5fa" strokeWidth="1" strokeDasharray="3,3" opacity="0.5" />
      <text x={200} y={shY - 20} fill="#60a5fa" fontSize="9" fontFamily="monospace">shoulder forward of hands</text>
      {/* Hip annotation */}
      <circle cx={hipX} cy={hipY} r="4" fill="#a78bfa" opacity="0.7" />
      <text x={hipX - 40} y={hipY - 8} fill="#a78bfa" fontSize="8" fontFamily="monospace">hip neutral</text>
      {/* Left foot annotation */}
      <text x={lFootX - 30} y={lFootY + 18} fill={C.leftLeg} fontSize="8" fontFamily="monospace" opacity="0.7">hovers</text>
    </g>
  );
}

export function SidePlankConfig({ t }: AnimProps) {
  // Alternates between safe (right-side-down) and unsafe (left-side-down)
  const showSafe = t < 0.65; // Show safe position longer
  const floorY = 210;

  if (showSafe) {
    // Right side down — SAFE
    const elbX = 110, elbY = floorY - 5;
    const shX = 125, shY = floorY - 55;
    const hipX = 210, hipY = floorY - 45;
    const rKneeX = 270, rKneeY = floorY - 5;

    return (
      <g>
        <line x1="40" y1={floorY} x2="360" y2={floorY} stroke={C.floor} strokeWidth="1.5" />
        {/* SAFE badge */}
        <rect x={300} y={60} width="55" height="22" rx="4" fill="#2ecc7122" stroke="#2ecc71" strokeWidth="1" />
        <text x={327} y={75} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#2ecc71" fontFamily="monospace">{"\u2713"} SAFE</text>
        {/* Title */}
        <text x={50} y={70} fontSize="11" fontWeight="bold" fill="#2ecc71" fontFamily="monospace">Right Side Down</text>
        {/* Head */}
        <circle cx={elbX - 20} cy={shY + 15} r="11" fill="none" stroke="#2ecc71" strokeWidth="2.5" />
        {/* Right elbow on ground */}
        <circle cx={elbX} cy={elbY} r="5" fill="#2ecc71" />
        {/* Right arm (forearm on ground) */}
        <line x1={elbX} y1={elbY} x2={shX - 5} y2={shY + 10} stroke="#2ecc71" strokeWidth="4" strokeLinecap="round" />
        {/* Torso */}
        <line x1={shX} y1={shY} x2={hipX} y2={hipY} stroke="#2ecc71" strokeWidth="5" strokeLinecap="round" />
        {/* Right leg (bearing weight) */}
        <line x1={hipX} y1={hipY} x2={rKneeX} y2={rKneeY} stroke="#2ecc71" strokeWidth="5" strokeLinecap="round" />
        <circle cx={rKneeX} cy={rKneeY} r="3" fill="#2ecc71" />
        {/* Left leg stacked on top (passive) */}
        <line x1={hipX - 3} y1={hipY - 8} x2={rKneeX - 10} y2={rKneeY - 15} stroke={C.leftLeg} strokeWidth="3.5" strokeLinecap="round" opacity="0.6" />
        {/* Top arm up */}
        <line x1={shX + 5} y1={shY - 3} x2={shX} y2={shY - 35} stroke="#2ecc71" strokeWidth="3" strokeLinecap="round" />
        {/* Weight arrow */}
        <text x={elbX - 5} y={floorY + 15} fill="#2ecc71" fontSize="8" fontWeight="bold" fontFamily="monospace">R elbow</text>
        <text x={rKneeX - 15} y={floorY + 15} fill="#2ecc71" fontSize="8" fontWeight="bold" fontFamily="monospace">R knee</text>
        {/* Left leg label */}
        <text x={rKneeX - 50} y={rKneeY - 22} fill={C.leftLeg} fontSize="8" fontFamily="monospace">L: dead weight</text>
      </g>
    );
  } else {
    // Left side down — NEVER
    const elbX = 110, elbY = floorY - 5;
    const shX = 125, shY = floorY - 50;
    const hipX = 200, hipY = floorY - 42;
    const lKneeX = 260, lKneeY = floorY - 5;

    return (
      <g>
        <line x1="40" y1={floorY} x2="360" y2={floorY} stroke={C.floor} strokeWidth="1.5" />
        {/* NEVER badge */}
        <rect x={290} y={60} width="65" height="22" rx="4" fill="#c0392b22" stroke="#c0392b" strokeWidth="1" />
        <text x={322} y={75} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#c0392b" fontFamily="monospace">{"\u26D4"} NEVER</text>
        {/* Title */}
        <text x={50} y={70} fontSize="11" fontWeight="bold" fill="#c0392b" fontFamily="monospace">Left Side Down</text>
        {/* All in red/dim */}
        <circle cx={elbX - 20} cy={shY + 15} r="11" fill="none" stroke="#c0392b" strokeWidth="2.5" opacity="0.4" />
        <circle cx={elbX} cy={elbY} r="5" fill="#c0392b" opacity="0.5" />
        <line x1={elbX} y1={elbY} x2={shX - 5} y2={shY + 10} stroke="#c0392b" strokeWidth="4" strokeLinecap="round" opacity="0.4" />
        <line x1={shX} y1={shY} x2={hipX} y2={hipY} stroke="#c0392b" strokeWidth="5" strokeLinecap="round" opacity="0.4" />
        <line x1={hipX} y1={hipY} x2={lKneeX} y2={lKneeY} stroke="#c0392b" strokeWidth="5" strokeLinecap="round" opacity="0.4" />
        {/* Danger zone at hip */}
        <circle cx={hipX - 5} cy={hipY + 5} r="18" fill="none" stroke="#c0392b" strokeWidth="1.5" strokeDasharray="4,3" />
        <text x={hipX + 18} y={hipY} fill="#c0392b" fontSize="8" fontWeight="bold" fontFamily="monospace">LOADS LEFT</text>
        <text x={hipX + 18} y={hipY + 10} fill="#c0392b" fontSize="8" fontWeight="bold" fontFamily="monospace">FEMORAL NECK</text>
        {/* Labels */}
        <text x={elbX - 5} y={floorY + 15} fill="#c0392b" fontSize="8" fontWeight="bold" fontFamily="monospace">L elbow</text>
        <text x={lKneeX - 20} y={floorY + 15} fill="#c0392b" fontSize="8" fontWeight="bold" fontFamily="monospace">L knee = fracture</text>
      </g>
    );
  }
}

export const EQUIPMENT_ANIMS: Record<string, React.ComponentType<AnimProps>> = {
  e1: PseudoPlanchePushUp,
  e2: SidePlankConfig,
};
