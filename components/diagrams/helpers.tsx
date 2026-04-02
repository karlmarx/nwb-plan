// Shared SVG primitives for exercise diagram animations
// All animations accept { t: number } where t cycles 0→1

// Standard layout constants
export const SL = { cx: 200, hipY: 200, shY: 130, hdY: 105 };

// Smooth ping-pong: 0→1→0 over one cycle
export function pingPong(t: number): number {
  return Math.sin(t * Math.PI * 2) * 0.5 + 0.5;
}

// Half-cycle: goes 0→1 in first half, 1→0 in second half
export function halfCycle(t: number): number {
  return t < 0.5 ? t / 0.5 : 1 - (t - 0.5) / 0.5;
}

// Smooth sinusoidal easing for half-cycle
export function smoothHalf(t: number): number {
  return Math.sin(halfCycle(t) * Math.PI * 0.5);
}

// Colors
export const C = {
  skin: "#d4a574",
  body: "#ddd",
  leftLeg: "#e74c3c",
  active: "#2ecc71",
  equipment: "#3a3a4a",
  equipLight: "#555",
  weight: "#666",
  floor: "#333",
  floorFill: "#1a1a1a",
  strap: "#f39c12",
  label: "#999",
  bg: "#111",
} as const;

// --- Primitives ---

export function Floor({ y = 215 }: { y?: number }) {
  return (
    <line x1="40" y1={y} x2="360" y2={y} stroke={C.floor} strokeWidth="1" strokeDasharray="4,4" />
  );
}

export function FullFloor({ y = 215, width = 400 }: { y?: number; width?: number }) {
  return (
    <>
      <line x1="20" y1={y} x2={width - 20} y2={y} stroke={C.floor} strokeWidth="1.5" />
      <rect x="20" y={y} width={width - 40} height={4} fill={C.floorFill} opacity={0.5} />
    </>
  );
}

export function LeftLegFlat() {
  return (
    <g>
      <line x1={SL.cx - 10} y1={SL.hipY} x2={SL.cx - 55} y2={SL.hipY + 8} stroke={C.leftLeg} strokeWidth="5" strokeLinecap="round" />
      <line x1={SL.cx - 55} y1={SL.hipY + 8} x2={SL.cx - 105} y2={SL.hipY + 10} stroke={C.leftLeg} strokeWidth="4" strokeLinecap="round" />
      <circle cx={SL.cx - 105} cy={SL.hipY + 10} r="4" fill={C.leftLeg} />
    </g>
  );
}

export function RightLegFlat() {
  return (
    <g>
      <line x1={SL.cx + 10} y1={SL.hipY} x2={SL.cx + 55} y2={SL.hipY + 8} stroke={C.body} strokeWidth="5" strokeLinecap="round" />
      <line x1={SL.cx + 55} y1={SL.hipY + 8} x2={SL.cx + 105} y2={SL.hipY + 10} stroke={C.body} strokeWidth="4" strokeLinecap="round" />
      <circle cx={SL.cx + 105} cy={SL.hipY + 10} r="4" fill={C.body} />
    </g>
  );
}

export function Anchor({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x - 3} y={y - 30} width="6" height="30" fill={C.equipLight} rx="2" />
      <rect x={x - 12} y={y - 32} width="24" height="6" fill={C.weight} rx="2" />
      <circle cx={x} cy={y} r="4" fill={C.strap} />
    </g>
  );
}

export function Strap({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return (
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.strap} strokeWidth="2" strokeDasharray="6,3" />
  );
}

export function Pbar({ x, y, h = 50 }: { x: number; y: number; h?: number }) {
  return (
    <g>
      <rect x={x - 2} y={y - h} width="4" height={h} fill="#888" rx="1" />
      <rect x={x - 10} y={y - h - 3} width="20" height="6" fill="#aaa" rx="2" />
      <rect x={x - 8} y={y - 2} width="16" height="4" fill={C.weight} rx="1" />
    </g>
  );
}

// Power rack uprights
export function Rack({ x, y, h = 160, w = 120 }: { x: number; y: number; h?: number; w?: number }) {
  return (
    <g>
      {/* Left upright */}
      <rect x={x} y={y - h} width="6" height={h} fill={C.equipment} rx="1" />
      {/* Right upright */}
      <rect x={x + w} y={y - h} width="6" height={h} fill={C.equipment} rx="1" />
      {/* Top crossbar */}
      <rect x={x} y={y - h} width={w + 6} height="5" fill={C.equipLight} rx="1" />
      {/* J-hooks */}
      <rect x={x + 2} y={y - h + 60} width="10" height="4" fill={C.weight} rx="1" />
      <rect x={x + w - 6} y={y - h + 60} width="10" height="4" fill={C.weight} rx="1" />
    </g>
  );
}

// Barbell
export function Barbell({ x1, y1, x2, y2, plateSize = 12 }: { x1: number; y1: number; x2: number; y2: number; plateSize?: number }) {
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#aaa" strokeWidth="3" strokeLinecap="round" />
      {/* Left plate */}
      <rect x={x1 - 2} y={y1 - plateSize} width="4" height={plateSize * 2} fill={C.weight} stroke={C.equipLight} strokeWidth="1" rx="1" />
      {/* Right plate */}
      <rect x={x2 - 2} y={y2 - plateSize} width="4" height={plateSize * 2} fill={C.weight} stroke={C.equipLight} strokeWidth="1" rx="1" />
    </g>
  );
}

// Plyo box / bench
export function Box({ x, y, w = 80, h = 40 }: { x: number; y: number; w?: number; h?: number }) {
  return (
    <rect x={x} y={y} width={w} height={h} rx="3" fill="#1e1e1e" stroke={C.equipment} strokeWidth="1.5" />
  );
}

// Weight plate (circular)
export function Plate({ cx, cy, r = 14 }: { cx: number; cy: number; r?: number }) {
  return (
    <circle cx={cx} cy={cy} r={r} fill={C.weight} stroke={C.equipLight} strokeWidth="1.5" />
  );
}

// Glute activation glow
export function GluteGlow({ cx, cy, opacity = 0.25 }: { cx: number; cy: number; opacity?: number }) {
  return (
    <circle cx={cx} cy={cy} r="10" fill={C.active} opacity={opacity} />
  );
}

// Fig-4 hooked left leg behind right calf
export function Fig4Hook({ hipX, hipY, rKneeX, rKneeY, rCalfMidX, rCalfMidY }: {
  hipX: number; hipY: number; rKneeX: number; rKneeY: number; rCalfMidX: number; rCalfMidY: number;
}) {
  const lKneeX = rKneeX - 5;
  const lKneeY = rKneeY + 8;
  const lFootX = rCalfMidX + 8;
  const lFootY = rCalfMidY + 5;
  return (
    <g>
      <line x1={hipX - 3} y1={hipY} x2={lKneeX} y2={lKneeY} stroke={C.leftLeg} strokeWidth="3.5" strokeLinecap="round" />
      <line x1={lKneeX} y1={lKneeY} x2={lFootX} y2={lFootY} stroke={C.leftLeg} strokeWidth="3" strokeLinecap="round" />
      <circle cx={lFootX} cy={lFootY} r="3" fill={C.leftLeg} />
    </g>
  );
}

// Movement direction arrow
export function Arrow({ x, y, angle = 0, color = C.active, label }: {
  x: number; y: number; angle?: number; color?: string; label?: string;
}) {
  return (
    <g transform={`translate(${x},${y}) rotate(${angle})`}>
      <line x1={0} y1={0} x2={20} y2={0} stroke={color} strokeWidth="2" strokeDasharray="4,2" />
      <polygon points="20,-4 28,0 20,4" fill={color} />
      {label && <text x={15} y={-8} fontSize="9" fill={color} fontWeight="bold" fontFamily="monospace" textAnchor="middle">{label}</text>}
    </g>
  );
}

// Dumbbell (for suitcase hold, etc.)
export function Dumbbell({ x, y, angle = 0, size = 30 }: { x: number; y: number; angle?: number; size?: number }) {
  const half = size / 2;
  return (
    <g transform={`translate(${x},${y}) rotate(${angle})`}>
      <rect x={-half} y={-3} width={size} height="6" fill="#aaa" rx="2" />
      <rect x={-half - 4} y={-6} width="8" height="12" fill={C.weight} rx="2" />
      <rect x={half - 4} y={-6} width="8" height="12" fill={C.weight} rx="2" />
    </g>
  );
}
