// Supine oblique exercise animations
// Migrated from core-demo-guide.tsx

import { SL, C, Floor, LeftLegFlat, RightLegFlat } from "./helpers";

interface AnimProps { t: number }

export function CrossBodyReach({ t }: AnimProps) {
  const phase = t < 0.5 ? t / 0.5 : (t - 0.5) / 0.5;
  const side = t < 0.5 ? "right" : "left";
  const reach = Math.sin(phase * Math.PI);
  const lift = reach * 8;
  const { cx, hipY, shY, hdY } = SL;
  const sy = shY - lift;
  return (
    <g>
      <Floor /><LeftLegFlat /><RightLegFlat />
      <line x1={cx} y1={hipY} x2={cx} y2={sy} stroke={C.body} strokeWidth="5" strokeLinecap="round" />
      <circle cx={cx} cy={hdY - lift} r="14" fill="none" stroke={C.body} strokeWidth="3" />
      {side === "right" ? (
        <>
          <line x1={cx} y1={sy} x2={cx - 15 - reach * 40} y2={sy + reach * 55} stroke={C.active} strokeWidth="4" strokeLinecap="round" />
          <circle cx={cx - 15 - reach * 40} cy={sy + reach * 55} r="5" fill={C.active} />
          <line x1={cx} y1={sy} x2={cx - 40} y2={sy + 15} stroke={C.body} strokeWidth="4" strokeLinecap="round" />
        </>
      ) : (
        <>
          <line x1={cx} y1={sy} x2={cx + 15 + reach * 40} y2={sy + reach * 55} stroke={C.active} strokeWidth="4" strokeLinecap="round" />
          <circle cx={cx + 15 + reach * 40} cy={sy + reach * 55} r="5" fill={C.active} />
          <line x1={cx} y1={sy} x2={cx + 40} y2={sy + 15} stroke={C.body} strokeWidth="4" strokeLinecap="round" />
        </>
      )}
      <ellipse cx={side === "right" ? cx + 12 : cx - 12} cy={165} rx="10" ry="20" fill={C.active} opacity={reach * 0.35} />
    </g>
  );
}

export function SupineSideBend({ t }: AnimProps) {
  const phase = t < 0.5 ? t / 0.5 : (t - 0.5) / 0.5;
  const side = t < 0.5 ? "right" : "left";
  const bend = Math.sin(phase * Math.PI);
  const { cx, hipY, shY, hdY } = SL;
  const lat = bend * 20 * (side === "right" ? 1 : -1);
  return (
    <g>
      <Floor /><LeftLegFlat /><RightLegFlat />
      <path d={`M ${cx} ${hipY} Q ${cx + lat * 0.8} ${(hipY + shY) / 2} ${cx + lat} ${shY}`} fill="none" stroke={C.body} strokeWidth="5" strokeLinecap="round" />
      <circle cx={cx + lat} cy={hdY} r="14" fill="none" stroke={C.body} strokeWidth="3" />
      {side === "right" ? (
        <>
          <line x1={cx + lat} y1={shY} x2={cx + 40 + bend * 30} y2={shY + 20 + bend * 50} stroke={C.active} strokeWidth="4" strokeLinecap="round" />
          <circle cx={cx + 40 + bend * 30} cy={shY + 20 + bend * 50} r="5" fill={C.active} />
          <line x1={cx + lat} y1={shY} x2={cx - 40 + lat} y2={shY + 15} stroke={C.body} strokeWidth="4" strokeLinecap="round" />
        </>
      ) : (
        <>
          <line x1={cx + lat} y1={shY} x2={cx - 40 - bend * 30} y2={shY + 20 + bend * 50} stroke={C.active} strokeWidth="4" strokeLinecap="round" />
          <circle cx={cx - 40 - bend * 30} cy={shY + 20 + bend * 50} r="5" fill={C.active} />
          <line x1={cx + lat} y1={shY} x2={cx + 40 + lat} y2={shY + 15} stroke={C.body} strokeWidth="4" strokeLinecap="round" />
        </>
      )}
      <ellipse cx={side === "right" ? cx - 12 : cx + 12} cy={170} rx="10" ry="22" fill={C.active} opacity={bend * 0.35} />
    </g>
  );
}

export function KneeDropOblique({ t }: AnimProps) {
  const phase = t < 0.5 ? t / 0.5 : 1 - (t - 0.5) / 0.5;
  const drop = phase * 55;
  const { cx, hipY, shY, hdY } = SL;
  const kx = cx + 15 + Math.sin(drop * Math.PI / 180) * 50;
  const ky = hipY - Math.cos(drop * Math.PI / 180) * 50 + 25;
  const pulling = t >= 0.5;
  return (
    <g>
      <Floor /><LeftLegFlat />
      <line x1={cx + 10} y1={hipY} x2={kx} y2={ky} stroke={C.body} strokeWidth="5" strokeLinecap="round" />
      <line x1={kx} y1={ky} x2={kx + 10} y2={hipY + 10} stroke={C.body} strokeWidth="4" strokeLinecap="round" />
      <circle cx={kx + 10} cy={hipY + 10} r="4" fill={C.body} />
      {!pulling ?
        <text x={kx + 12} y={ky - 5} fill="#f39c12" fontSize="14" fontFamily="monospace">{"\u2198 drop"}</text> :
        <text x={kx + 12} y={ky - 5} fill={C.active} fontSize="14" fontWeight="bold" fontFamily="monospace">{"\u2196 PULL"}</text>
      }
      <line x1={cx} y1={hipY} x2={cx} y2={shY} stroke={C.body} strokeWidth="5" strokeLinecap="round" />
      <circle cx={cx} cy={hdY} r="14" fill="none" stroke={C.body} strokeWidth="3" />
      <line x1={cx} y1={shY} x2={cx - 40} y2={shY + 20} stroke={C.body} strokeWidth="4" strokeLinecap="round" />
      <line x1={cx} y1={shY} x2={cx + 40} y2={shY + 20} stroke={C.body} strokeWidth="4" strokeLinecap="round" />
      <ellipse cx={cx - 14} cy={170} rx="12" ry="24" fill={pulling ? C.active : "transparent"} opacity={pulling ? 0.5 : 0} />
      {pulling && <text x={cx - 55} y={175} fill={C.active} fontSize="11" fontWeight="bold" fontFamily="monospace">L oblique</text>}
    </g>
  );
}

export function DeadBugRight({ t }: AnimProps) {
  const phase = t < 0.5 ? t / 0.5 : 1 - (t - 0.5) / 0.5;
  const ext = Math.sin(phase * Math.PI * 0.5);
  const { cx, hipY, shY, hdY } = SL;
  return (
    <g>
      <Floor /><LeftLegFlat />
      <line x1={cx} y1={shY} x2={cx - 50} y2={shY + 5} stroke={C.leftLeg} strokeWidth="4" strokeLinecap="round" />
      <line x1={cx - 50} y1={shY + 5} x2={cx - 85} y2={shY + 8} stroke={C.leftLeg} strokeWidth="3" strokeLinecap="round" />
      <line x1={cx + 10} y1={hipY} x2={cx + 15} y2={hipY - 30 + ext * 25} stroke={C.active} strokeWidth="5" strokeLinecap="round" />
      <line x1={cx + 15} y1={hipY - 30 + ext * 25} x2={cx + 30 + ext * 50} y2={hipY + 5 + ext * 5} stroke={C.active} strokeWidth="4" strokeLinecap="round" />
      <circle cx={cx + 30 + ext * 50} cy={hipY + 5 + ext * 5} r="4" fill={C.active} />
      <line x1={cx} y1={shY} x2={cx + 5 - ext * 30} y2={shY - 30 - ext * 40} stroke={C.active} strokeWidth="4" strokeLinecap="round" />
      <circle cx={cx + 5 - ext * 30} cy={shY - 30 - ext * 40} r="5" fill={C.active} />
      <line x1={cx} y1={hipY} x2={cx} y2={shY} stroke={C.body} strokeWidth="5" strokeLinecap="round" />
      <circle cx={cx} cy={hdY} r="14" fill="none" stroke={C.body} strokeWidth="3" />
      <ellipse cx={cx} cy={170} rx="14" ry="22" fill={C.active} opacity={ext * 0.3} />
    </g>
  );
}

export const SUPINE_ANIMS: Record<string, React.ComponentType<AnimProps>> = {
  s1: CrossBodyReach,
  s2: SupineSideBend,
  s3: KneeDropOblique,
  s5: DeadBugRight,
};
