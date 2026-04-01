// @ts-nocheck
"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";

/* ═══════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════ */

const CATEGORIES = [
  { key: "supine", label: "Supine" },
  { key: "trx", label: "TRX Core" },
  { key: "arm", label: "Arm Bal Prep" },
];

const EXERCISES = [
  // ── SUPINE OBLIQUE ──
  {
    id: "s1", cat: "supine", name: "Cross-Body Reach",
    cue: "Reach opposite hand toward hip, lifting only the shoulder blade.",
    safety: "Left leg stays flat — pure thoracic rotation, zero hip flexor.",
  },
  {
    id: "s2", cat: "supine", name: "Supine Side Bend (Heel Slide)",
    cue: "Slide hand down toward same-side heel by laterally flexing trunk.",
    safety: "Legs stay completely still. No hip involvement.",
  },
  {
    id: "s3", cat: "supine", name: "Knee Drop + Oblique Return",
    cue: "Right knee bent & foot flat. Let knee fall outward, then pull it back using your LEFT oblique.",
    safety: "Left leg flat & passive. Only RIGHT knee moves. Oblique work is pulling it BACK.",
    detail: true,
  },
  {
    id: "s5", cat: "supine", name: "Dead Bug — Right Side Only",
    cue: "Extend right arm + right leg out simultaneously, then return. Left side pinned to the floor.",
    safety: "Left arm & left leg are dead weight the entire time.",
  },
  // ── TRX CORE ──
  {
    id: "t1", cat: "trx", name: "TRX Pallof Press",
    cue: "Stand sideways to anchor on right leg. Press handles from chest straight out. Anti-rotation.",
    safety: "Left leg hangs as dead weight. Single-leg on RIGHT only.",
    position: "Standing (R leg)",
  },
  {
    id: "t2", cat: "trx", name: "TRX Standing Rollout",
    cue: "Face away from anchor on right leg. Lean forward extending arms overhead in straps.",
    safety: "Left leg trails behind passively. Anti-extension core demand.",
    position: "Standing (R leg)",
  },
  {
    id: "t3", cat: "trx", name: "TRX Single-Arm Row",
    cue: "Face anchor on right leg. Row one arm — unilateral pull = massive anti-rotation.",
    safety: "Right leg only. Left leg hangs. Alternate rowing arm each set.",
    position: "Standing (R leg)",
  },
  {
    id: "t4", cat: "trx", name: "TRX Kneeling Rollout",
    cue: "Right knee on pad, hands in straps. Roll forward extending arms, then pull back.",
    safety: "Left leg trails in hip extension — zero iliopsoas. Right knee bears weight.",
    position: "Kneeling (R knee)",
  },
  {
    id: "t5", cat: "trx", name: "TRX Kneeling Chop",
    cue: "Right knee on pad. Hold handles and rotate trunk through a diagonal chop.",
    safety: "Pure rotational core. Left leg trails passively.",
    position: "Kneeling (R knee)",
  },
  {
    id: "t6", cat: "trx", name: "TRX Body Saw",
    cue: "Right foot in strap, forearm plank. Rock body forward and back.",
    safety: "Left leg rests on ground as dead weight. Anti-extension + anti-rotation.",
    position: "Plank (R foot)",
  },
  {
    id: "t7", cat: "trx", name: "TRX Side Plank",
    cue: "Right foot in strap, right forearm down. Stack into side plank.",
    safety: "Left leg is passive weight on top of right. Oblique endurance.",
    position: "Side Plank (R foot)",
  },
  // ── ARM BALANCE PREP ──
  {
    id: "a1", cat: "arm", name: "TRX Knee Tuck (Fig-4 Hook)",
    cue: "Right foot in strap, left hooked eagle/fig-4 behind right. Tuck right knee to chest.",
    safety: "Left hip stays at fixed angle in hook — no active flexion. Lower abs drive the tuck.",
    position: "TRX (fig-4 hook)",
    equipment: "TRX",
  },
  {
    id: "a2", cat: "arm", name: "TRX Body Saw (Fig-4 Hook)",
    cue: "Same fig-4 hook setup. Rock body forward and back in forearm plank.",
    safety: "Left leg hooked passively. Higher anti-extension demand than floor version.",
    position: "TRX (fig-4 hook)",
    equipment: "TRX",
  },
  {
    id: "a3", cat: "arm", name: "L-Sit Knee Tuck",
    cue: "Parallettes. Support hold → drive RIGHT knee up toward chest. Left leg hangs passive under gravity.",
    safety: "Left leg is dead weight hanging down — gravity keeps it extended, zero iliopsoas. Compression strength builder.",
    position: "Parallettes",
    equipment: "Parallettes",
  },
  {
    id: "a4", cat: "arm", name: "L-Sit Hold (R Leg Extended)",
    cue: "Parallettes. Extend RIGHT leg out to L-sit. Left leg hangs passive. Hold for time.",
    safety: "Left leg hangs — no flexion demand. Right quad/hip flexor does all work. Core compression hold.",
    position: "Parallettes",
    equipment: "Parallettes",
  },
  {
    id: "a5", cat: "arm", name: "Tuck Planche Lean",
    cue: "Parallettes. Right knee tucked to chest, lean shoulders forward past hands. Left leg trails behind in extension.",
    safety: "Left hip in extension — zero flexor activation. Builds forward-lean shoulder loading for arm balances.",
    position: "Parallettes",
    equipment: "Parallettes",
  },
  {
    id: "a6", cat: "arm", name: "Support Hold + Protraction",
    cue: "Parallettes or rings. Straight arms, depress & protract scapulae. Pulse protraction in/out.",
    safety: "Legs hang passive. Pure scapular strength — foundational for crow, side crow, flying pigeon.",
    position: "Parallettes / Rings",
    equipment: "Parallettes/Rings",
  },
];

/* ═══════════════════════════════════════════════════════════════
   SHARED SVG HELPERS
   ═══════════════════════════════════════════════════════════════ */

const SL = { cx: 200, hipY: 200, shY: 130, hdY: 105 };

const Floor = ({ y = 215 }) => (
  <line x1="40" y1={y} x2="360" y2={y} stroke="#333" strokeWidth="1" strokeDasharray="4,4" />
);

const LeftLegFlat = () => (
  <g>
    <line x1={SL.cx - 10} y1={SL.hipY} x2={SL.cx - 55} y2={SL.hipY + 8} stroke="#e74c3c" strokeWidth="5" strokeLinecap="round" />
    <line x1={SL.cx - 55} y1={SL.hipY + 8} x2={SL.cx - 105} y2={SL.hipY + 10} stroke="#e74c3c" strokeWidth="4" strokeLinecap="round" />
    <circle cx={SL.cx - 105} cy={SL.hipY + 10} r="4" fill="#e74c3c" />
  </g>
);

const RightLegFlat = () => (
  <g>
    <line x1={SL.cx + 10} y1={SL.hipY} x2={SL.cx + 55} y2={SL.hipY + 8} stroke="#ddd" strokeWidth="5" strokeLinecap="round" />
    <line x1={SL.cx + 55} y1={SL.hipY + 8} x2={SL.cx + 105} y2={SL.hipY + 10} stroke="#ddd" strokeWidth="4" strokeLinecap="round" />
    <circle cx={SL.cx + 105} cy={SL.hipY + 10} r="4" fill="#ddd" />
  </g>
);

const Anchor = ({ x, y }) => (
  <g>
    <rect x={x - 3} y={y - 30} width="6" height="30" fill="#555" rx="2" />
    <rect x={x - 12} y={y - 32} width="24" height="6" fill="#666" rx="2" />
    <circle cx={x} cy={y} r="4" fill="#f39c12" />
  </g>
);

const Strap = ({ x1, y1, x2, y2 }) => (
  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#f39c12" strokeWidth="2" strokeDasharray="6,3" />
);

const Pbar = ({ x, y, h = 50 }) => (
  <g>
    <rect x={x - 2} y={y - h} width="4" height={h} fill="#888" rx="1" />
    <rect x={x - 10} y={y - h - 3} width="20" height="6" fill="#aaa" rx="2" />
    <rect x={x - 8} y={y - 2} width="16" height="4" fill="#666" rx="1" />
  </g>
);

/* ═══════════════════════════════════════════════════════════════
   SUPINE ANIMATIONS
   ═══════════════════════════════════════════════════════════════ */

function CrossBodyReach({ t }) {
  const phase = t < 0.5 ? t / 0.5 : (t - 0.5) / 0.5;
  const side = t < 0.5 ? "right" : "left";
  const reach = Math.sin(phase * Math.PI);
  const lift = reach * 8;
  const { cx, hipY, shY, hdY } = SL;
  const sy = shY - lift;
  return (
    <g>
      <Floor /><LeftLegFlat /><RightLegFlat />
      <line x1={cx} y1={hipY} x2={cx} y2={sy} stroke="#ddd" strokeWidth="5" strokeLinecap="round" />
      <circle cx={cx} cy={hdY - lift} r="14" fill="none" stroke="#ddd" strokeWidth="3" />
      {side === "right" ? (
        <>
          <line x1={cx} y1={sy} x2={cx - 15 - reach * 40} y2={sy + reach * 55} stroke="#2ecc71" strokeWidth="4" strokeLinecap="round" />
          <circle cx={cx - 15 - reach * 40} cy={sy + reach * 55} r="5" fill="#2ecc71" />
          <line x1={cx} y1={sy} x2={cx - 40} y2={sy + 15} stroke="#ddd" strokeWidth="4" strokeLinecap="round" />
        </>
      ) : (
        <>
          <line x1={cx} y1={sy} x2={cx + 15 + reach * 40} y2={sy + reach * 55} stroke="#2ecc71" strokeWidth="4" strokeLinecap="round" />
          <circle cx={cx + 15 + reach * 40} cy={sy + reach * 55} r="5" fill="#2ecc71" />
          <line x1={cx} y1={sy} x2={cx + 40} y2={sy + 15} stroke="#ddd" strokeWidth="4" strokeLinecap="round" />
        </>
      )}
      <ellipse cx={side === "right" ? cx + 12 : cx - 12} cy={165} rx="10" ry="20" fill="#2ecc71" opacity={reach * 0.35} />
    </g>
  );
}

function SupineSideBend({ t }) {
  const phase = t < 0.5 ? t / 0.5 : (t - 0.5) / 0.5;
  const side = t < 0.5 ? "right" : "left";
  const bend = Math.sin(phase * Math.PI);
  const { cx, hipY, shY, hdY } = SL;
  const lat = bend * 20 * (side === "right" ? 1 : -1);
  return (
    <g>
      <Floor /><LeftLegFlat /><RightLegFlat />
      <path d={`M ${cx} ${hipY} Q ${cx + lat * 0.8} ${(hipY + shY) / 2} ${cx + lat} ${shY}`} fill="none" stroke="#ddd" strokeWidth="5" strokeLinecap="round" />
      <circle cx={cx + lat} cy={hdY} r="14" fill="none" stroke="#ddd" strokeWidth="3" />
      {side === "right" ? (
        <>
          <line x1={cx + lat} y1={shY} x2={cx + 40 + bend * 30} y2={shY + 20 + bend * 50} stroke="#2ecc71" strokeWidth="4" strokeLinecap="round" />
          <circle cx={cx + 40 + bend * 30} cy={shY + 20 + bend * 50} r="5" fill="#2ecc71" />
          <line x1={cx + lat} y1={shY} x2={cx - 40 + lat} y2={shY + 15} stroke="#ddd" strokeWidth="4" strokeLinecap="round" />
        </>
      ) : (
        <>
          <line x1={cx + lat} y1={shY} x2={cx - 40 - bend * 30} y2={shY + 20 + bend * 50} stroke="#2ecc71" strokeWidth="4" strokeLinecap="round" />
          <circle cx={cx - 40 - bend * 30} cy={shY + 20 + bend * 50} r="5" fill="#2ecc71" />
          <line x1={cx + lat} y1={shY} x2={cx + 40 + lat} y2={shY + 15} stroke="#ddd" strokeWidth="4" strokeLinecap="round" />
        </>
      )}
      <ellipse cx={side === "right" ? cx - 12 : cx + 12} cy={170} rx="10" ry="22" fill="#2ecc71" opacity={bend * 0.35} />
    </g>
  );
}

function KneeDropOblique({ t }) {
  const phase = t < 0.5 ? t / 0.5 : 1 - (t - 0.5) / 0.5;
  const drop = phase * 55;
  const { cx, hipY, shY, hdY } = SL;
  const kx = cx + 15 + Math.sin(drop * Math.PI / 180) * 50;
  const ky = hipY - Math.cos(drop * Math.PI / 180) * 50 + 25;
  const pulling = t >= 0.5;
  return (
    <g>
      <Floor /><LeftLegFlat />
      <line x1={cx + 10} y1={hipY} x2={kx} y2={ky} stroke="#ddd" strokeWidth="5" strokeLinecap="round" />
      <line x1={kx} y1={ky} x2={kx + 10} y2={hipY + 10} stroke="#ddd" strokeWidth="4" strokeLinecap="round" />
      <circle cx={kx + 10} cy={hipY + 10} r="4" fill="#ddd" />
      {!pulling ?
        <text x={kx + 12} y={ky - 5} fill="#f39c12" fontSize="14" fontFamily="sans-serif">{"↘ drop"}</text> :
        <text x={kx + 12} y={ky - 5} fill="#2ecc71" fontSize="14" fontWeight="bold" fontFamily="sans-serif">{"↖ PULL"}</text>
      }
      <line x1={cx} y1={hipY} x2={cx} y2={shY} stroke="#ddd" strokeWidth="5" strokeLinecap="round" />
      <circle cx={cx} cy={hdY} r="14" fill="none" stroke="#ddd" strokeWidth="3" />
      <line x1={cx} y1={shY} x2={cx - 40} y2={shY + 20} stroke="#ddd" strokeWidth="4" strokeLinecap="round" />
      <line x1={cx} y1={shY} x2={cx + 40} y2={shY + 20} stroke="#ddd" strokeWidth="4" strokeLinecap="round" />
      <ellipse cx={cx - 14} cy={170} rx="12" ry="24" fill={pulling ? "#2ecc71" : "transparent"} opacity={pulling ? 0.5 : 0} />
      {pulling && <text x={cx - 55} y={175} fill="#2ecc71" fontSize="11" fontWeight="bold" fontFamily="sans-serif">L oblique</text>}
    </g>
  );
}

function DeadBugRight({ t }) {
  const phase = t < 0.5 ? t / 0.5 : 1 - (t - 0.5) / 0.5;
  const ext = Math.sin(phase * Math.PI * 0.5);
  const { cx, hipY, shY, hdY } = SL;
  return (
    <g>
      <Floor /><LeftLegFlat />
      <line x1={cx} y1={shY} x2={cx - 50} y2={shY + 5} stroke="#e74c3c" strokeWidth="4" strokeLinecap="round" />
      <line x1={cx - 50} y1={shY + 5} x2={cx - 85} y2={shY + 8} stroke="#e74c3c" strokeWidth="3" strokeLinecap="round" />
      <line x1={cx + 10} y1={hipY} x2={cx + 15} y2={hipY - 30 + ext * 25} stroke="#2ecc71" strokeWidth="5" strokeLinecap="round" />
      <line x1={cx + 15} y1={hipY - 30 + ext * 25} x2={cx + 30 + ext * 50} y2={hipY + 5 + ext * 5} stroke="#2ecc71" strokeWidth="4" strokeLinecap="round" />
      <circle cx={cx + 30 + ext * 50} cy={hipY + 5 + ext * 5} r="4" fill="#2ecc71" />
      <line x1={cx} y1={shY} x2={cx + 5 - ext * 30} y2={shY - 30 - ext * 40} stroke="#2ecc71" strokeWidth="4" strokeLinecap="round" />
      <circle cx={cx + 5 - ext * 30} cy={shY - 30 - ext * 40} r="5" fill="#2ecc71" />
      <line x1={cx} y1={hipY} x2={cx} y2={shY} stroke="#ddd" strokeWidth="5" strokeLinecap="round" />
      <circle cx={cx} cy={hdY} r="14" fill="none" stroke="#ddd" strokeWidth="3" />
      <ellipse cx={cx} cy={170} rx="14" ry="22" fill="#2ecc71" opacity={ext * 0.3} />
    </g>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TRX ANIMATIONS
   ═══════════════════════════════════════════════════════════════ */

function TRXPallofPress({ t }) {
  const phase = t < 0.5 ? t / 0.5 : 1 - (t - 0.5) / 0.5;
  const press = Math.sin(phase * Math.PI * 0.5);
  const floorY = 220, anchorX = 320, anchorY = 60;
  const hipX = 165, hipY = 155, shX = 170, shY = 110;
  const handX = shX + 20 + press * 55, handY = shY + 5;
  return (
    <g>
      <Floor y={floorY} /><Anchor x={anchorX} y={anchorY} />
      <line x1={hipX - 5} y1={hipY} x2={hipX - 15} y2={hipY + 35} stroke="#e74c3c" strokeWidth="4" strokeLinecap="round" />
      <line x1={hipX - 15} y1={hipY + 35} x2={hipX - 10} y2={hipY + 65} stroke="#e74c3c" strokeWidth="3" strokeLinecap="round" />
      <line x1={hipX + 5} y1={hipY} x2={170} y2={floorY - 30} stroke="#ddd" strokeWidth="5" strokeLinecap="round" />
      <line x1={170} y1={floorY - 30} x2={165} y2={floorY} stroke="#ddd" strokeWidth="4" strokeLinecap="round" />
      <line x1={hipX} y1={hipY} x2={shX} y2={shY} stroke="#ddd" strokeWidth="5" strokeLinecap="round" />
      <circle cx={172} cy={90} r="12" fill="none" stroke="#ddd" strokeWidth="3" />
      <line x1={shX} y1={shY} x2={handX} y2={handY} stroke="#2ecc71" strokeWidth="4" strokeLinecap="round" />
      <circle cx={handX} cy={handY} r="4" fill="#2ecc71" />
      <Strap x1={handX} y1={handY} x2={anchorX} y2={anchorY} />
      <ellipse cx={hipX + 3} cy={(hipY + shY) / 2} rx="8" ry="16" fill="#2ecc71" opacity={press * 0.4} />
      {press > 0.3 && <text x={hipX - 50} y={(hipY + shY) / 2 + 4} fill="#2ecc71" fontSize="10" fontWeight="bold" fontFamily="sans-serif">anti-rot</text>}
    </g>
  );
}

function TRXStandingRollout({ t }) {
  const phase = t < 0.5 ? t / 0.5 : 1 - (t - 0.5) / 0.5;
  const lean = Math.sin(phase * Math.PI * 0.5);
  const floorY = 220, anchorX = 80, anchorY = 60;
  const hipX = 195 - lean * 15, hipY = 155 - lean * 5;
  const shX = 185 - lean * 30, shY = 110 + lean * 10;
  const handX = shX - 20 - lean * 50, handY = shY - 15 - lean * 20;
  return (
    <g>
      <Floor y={floorY} /><Anchor x={anchorX} y={anchorY} />
      <line x1={hipX + 8} y1={hipY} x2={hipX + 25} y2={hipY + 30} stroke="#e74c3c" strokeWidth="4" strokeLinecap="round" />
      <line x1={hipX + 25} y1={hipY + 30} x2={hipX + 30} y2={hipY + 55} stroke="#e74c3c" strokeWidth="3" strokeLinecap="round" />
      <line x1={hipX + 3} y1={hipY} x2={200} y2={floorY - 30} stroke="#ddd" strokeWidth="5" strokeLinecap="round" />
      <line x1={200} y1={floorY - 30} x2={200} y2={floorY} stroke="#ddd" strokeWidth="4" strokeLinecap="round" />
      <line x1={hipX} y1={hipY} x2={shX} y2={shY} stroke="#ddd" strokeWidth="5" strokeLinecap="round" />
      <circle cx={shX - 5} cy={shY - 18 + lean * 5} r="12" fill="none" stroke="#ddd" strokeWidth="3" />
      <line x1={shX} y1={shY} x2={handX} y2={handY} stroke="#2ecc71" strokeWidth="4" strokeLinecap="round" />
      <circle cx={handX} cy={handY} r="4" fill="#2ecc71" />
      <Strap x1={handX} y1={handY} x2={anchorX} y2={anchorY} />
      <ellipse cx={(hipX + shX) / 2} cy={(hipY + shY) / 2} rx="8" ry="16" fill="#2ecc71" opacity={lean * 0.4} />
    </g>
  );
}

function TRXSingleArmRow({ t }) {
  const phase = t < 0.5 ? t / 0.5 : 1 - (t - 0.5) / 0.5;
  const pull = Math.sin(phase * Math.PI * 0.5);
  const floorY = 220, anchorX = 320, anchorY = 60;
  const hipX = 205, hipY = 155, shX = 215, shY = 110;
  const handX = shX + 30 - pull * 35, handY = shY + 15 - pull * 10;
  return (
    <g>
      <Floor y={floorY} /><Anchor x={anchorX} y={anchorY} />
      <line x1={hipX - 5} y1={hipY} x2={hipX - 15} y2={hipY + 30} stroke="#e74c3c" strokeWidth="4" strokeLinecap="round" />
      <line x1={hipX - 15} y1={hipY + 30} x2={hipX - 10} y2={hipY + 55} stroke="#e74c3c" strokeWidth="3" strokeLinecap="round" />
      <line x1={hipX + 3} y1={hipY} x2={180} y2={floorY - 30} stroke="#ddd" strokeWidth="5" strokeLinecap="round" />
      <line x1={180} y1={floorY - 30} x2={180} y2={floorY} stroke="#ddd" strokeWidth="4" strokeLinecap="round" />
      <line x1={hipX} y1={hipY} x2={shX} y2={shY} stroke="#ddd" strokeWidth="5" strokeLinecap="round" />
      <circle cx={shX + 3} cy={90} r="12" fill="none" stroke="#ddd" strokeWidth="3" />
      <line x1={shX} y1={shY} x2={handX} y2={handY} stroke="#2ecc71" strokeWidth="4" strokeLinecap="round" />
      <circle cx={handX} cy={handY} r="4" fill="#2ecc71" />
      <Strap x1={handX} y1={handY} x2={anchorX} y2={anchorY} />
      <line x1={shX} y1={shY} x2={shX + 5} y2={shY + 30} stroke="#ddd" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx={(hipX + shX) / 2} cy={(hipY + shY) / 2} rx="8" ry="16" fill="#2ecc71" opacity={pull * 0.45} />
      {pull > 0.3 && <text x={hipX - 55} y={(hipY + shY) / 2} fill="#2ecc71" fontSize="10" fontWeight="bold" fontFamily="sans-serif">anti-rot</text>}
    </g>
  );
}

function TRXKneelingRollout({ t }) {
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
      <line x1={hipX + 8} y1={hipY + 5} x2={kneeX + 20} y2={floorY - 5} stroke="#e74c3c" strokeWidth="4" strokeLinecap="round" />
      <line x1={kneeX + 20} y1={floorY - 5} x2={kneeX + 60} y2={floorY - 2} stroke="#e74c3c" strokeWidth="3" strokeLinecap="round" />
      <line x1={hipX + 3} y1={hipY} x2={kneeX} y2={floorY - 5} stroke="#ddd" strokeWidth="5" strokeLinecap="round" />
      <line x1={hipX} y1={hipY} x2={shX} y2={shY} stroke="#ddd" strokeWidth="5" strokeLinecap="round" />
      <circle cx={shX - 5} cy={shY - 16 + roll * 5} r="12" fill="none" stroke="#ddd" strokeWidth="3" />
      <line x1={shX} y1={shY} x2={handX} y2={handY} stroke="#2ecc71" strokeWidth="4" strokeLinecap="round" />
      <circle cx={handX} cy={handY} r="4" fill="#2ecc71" />
      <Strap x1={handX} y1={handY} x2={anchorX} y2={anchorY} />
      <ellipse cx={(hipX + shX) / 2} cy={(hipY + shY) / 2} rx="8" ry="14" fill="#2ecc71" opacity={roll * 0.45} />
    </g>
  );
}

function TRXKneelingChop({ t }) {
  const angle = Math.sin(t * Math.PI * 2) * 0.9;
  const floorY = 220, anchorX = 80, anchorY = 50, kneeX = 220;
  const hipX = 210, hipY = 165, shX = 200, shY = 125;
  const handX = shX - 30 + angle * 40, handY = shY - 20 - angle * 25;
  const rotX = angle * 6;
  return (
    <g>
      <Floor y={floorY} /><Anchor x={anchorX} y={anchorY} />
      <rect x={kneeX - 15} y={floorY - 4} width="30" height="6" rx="3" fill="#3498db" opacity="0.4" />
      <line x1={hipX + 8} y1={hipY + 5} x2={kneeX + 20} y2={floorY - 5} stroke="#e74c3c" strokeWidth="4" strokeLinecap="round" />
      <line x1={kneeX + 20} y1={floorY - 5} x2={kneeX + 60} y2={floorY - 2} stroke="#e74c3c" strokeWidth="3" strokeLinecap="round" />
      <line x1={hipX + 3} y1={hipY} x2={kneeX} y2={floorY - 5} stroke="#ddd" strokeWidth="5" strokeLinecap="round" />
      <line x1={hipX + rotX * 0.3} y1={hipY} x2={shX + rotX} y2={shY} stroke="#ddd" strokeWidth="5" strokeLinecap="round" />
      <circle cx={shX + rotX - 2} cy={105} r="12" fill="none" stroke="#ddd" strokeWidth="3" />
      <line x1={shX + rotX} y1={shY} x2={handX} y2={handY} stroke="#2ecc71" strokeWidth="4" strokeLinecap="round" />
      <circle cx={handX} cy={handY} r="4" fill="#2ecc71" />
      <Strap x1={handX} y1={handY} x2={anchorX} y2={anchorY} />
      <ellipse cx={hipX - 8} cy={(hipY + shY) / 2} rx="7" ry="14" fill="#2ecc71" opacity={Math.abs(angle) * 0.4} />
      <ellipse cx={hipX + 8} cy={(hipY + shY) / 2} rx="7" ry="14" fill="#2ecc71" opacity={Math.abs(angle) * 0.3} />
    </g>
  );
}

function TRXBodySaw({ t }) {
  const rock = Math.sin(t * Math.PI * 2);
  const floorY = 200, anchorX = 340, anchorY = 80;
  const elbX = 100, elbY = floorY - 5;
  const shX = elbX + 15 + rock * 12, shY = floorY - 40 - rock * 5;
  const hipX = shX + 60 + rock * 10, hipY = floorY - 35 - rock * 3;
  const rFootX = hipX + 60 + rock * 8, rFootY = floorY - 15;
  return (
    <g>
      <line x1="40" y1={floorY + 5} x2="360" y2={floorY + 5} stroke="#333" strokeWidth="1" strokeDasharray="4,4" />
      <Anchor x={anchorX} y={anchorY} />
      <line x1={elbX} y1={elbY} x2={elbX - 15} y2={elbY + 3} stroke="#ddd" strokeWidth="4" strokeLinecap="round" />
      <line x1={elbX} y1={elbY} x2={shX} y2={shY} stroke="#ddd" strokeWidth="4" strokeLinecap="round" />
      <line x1={shX} y1={shY} x2={hipX} y2={hipY} stroke="#ddd" strokeWidth="5" strokeLinecap="round" />
      <circle cx={shX - 10} cy={shY - 12} r="10" fill="none" stroke="#ddd" strokeWidth="2.5" />
      <line x1={hipX} y1={hipY} x2={hipX + 55} y2={floorY} stroke="#e74c3c" strokeWidth="4" strokeLinecap="round" />
      <circle cx={hipX + 55} cy={floorY} r="3" fill="#e74c3c" />
      <line x1={hipX} y1={hipY} x2={rFootX} y2={rFootY} stroke="#2ecc71" strokeWidth="4" strokeLinecap="round" />
      <circle cx={rFootX} cy={rFootY} r="4" fill="#2ecc71" />
      <Strap x1={rFootX} y1={rFootY} x2={anchorX} y2={anchorY} />
      <ellipse cx={(shX + hipX) / 2} cy={(shY + hipY) / 2} rx="20" ry="8" fill="#2ecc71" opacity={0.3 + Math.abs(rock) * 0.2} />
      <text x={(shX + hipX) / 2 - 10} y={(shY + hipY) / 2 - 12} fill="#f39c12" fontSize="13" fontFamily="sans-serif">{rock > 0 ? "→" : "←"}</text>
    </g>
  );
}

function TRXSidePlank({ t }) {
  const breathe = Math.sin(t * Math.PI * 4) * 0.15;
  const floorY = 210, anchorX = 340, anchorY = 80;
  const elbX = 140, elbY = floorY - 5;
  const shX = 155, shY = floorY - 55 + breathe * 5;
  const hipX = 220, hipY = floorY - 45 + breathe * 8;
  const rFootX = 280, rFootY = floorY - 10;
  return (
    <g>
      <line x1="40" y1={floorY + 5} x2="360" y2={floorY + 5} stroke="#333" strokeWidth="1" strokeDasharray="4,4" />
      <Anchor x={anchorX} y={anchorY} />
      <line x1={elbX - 10} y1={elbY + 2} x2={elbX} y2={elbY} stroke="#ddd" strokeWidth="4" strokeLinecap="round" />
      <line x1={elbX} y1={elbY} x2={shX} y2={shY} stroke="#ddd" strokeWidth="4" strokeLinecap="round" />
      <line x1={shX} y1={shY} x2={hipX} y2={hipY} stroke="#ddd" strokeWidth="5" strokeLinecap="round" />
      <circle cx={shX - 8} cy={shY - 14} r="10" fill="none" stroke="#ddd" strokeWidth="2.5" />
      <line x1={hipX} y1={hipY} x2={rFootX} y2={rFootY} stroke="#2ecc71" strokeWidth="4" strokeLinecap="round" />
      <circle cx={rFootX} cy={rFootY} r="4" fill="#2ecc71" />
      <Strap x1={rFootX} y1={rFootY} x2={anchorX} y2={anchorY} />
      <line x1={hipX - 3} y1={hipY - 5} x2={275} y2={floorY - 18} stroke="#e74c3c" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx={275} cy={floorY - 18} r="3" fill="#e74c3c" />
      <line x1={shX + 3} y1={shY} x2={shX - 5} y2={shY - 40} stroke="#ddd" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx={(shX + hipX) / 2} cy={(shY + hipY) / 2} rx="18" ry="7" fill="#2ecc71" opacity={0.35} />
      <text x={(shX + hipX) / 2 - 15} y={(shY + hipY) / 2 - 10} fill="#2ecc71" fontSize="10" fontWeight="bold" fontFamily="sans-serif">obliques</text>
    </g>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ARM BALANCE PREP ANIMATIONS
   ═══════════════════════════════════════════════════════════════ */

// helper: draw fig-4 hooked left leg behind right calf
function Fig4Hook({ hipX, hipY, rKneeX, rKneeY, rCalfMidX, rCalfMidY }) {
  // left thigh goes from hip down and slightly behind right knee
  const lKneeX = rKneeX - 5;
  const lKneeY = rKneeY + 8;
  // left shin crosses behind right calf
  const lFootX = rCalfMidX + 8;
  const lFootY = rCalfMidY + 5;
  return (
    <g>
      <line x1={hipX - 3} y1={hipY} x2={lKneeX} y2={lKneeY} stroke="#e74c3c" strokeWidth="3.5" strokeLinecap="round" />
      <line x1={lKneeX} y1={lKneeY} x2={lFootX} y2={lFootY} stroke="#e74c3c" strokeWidth="3" strokeLinecap="round" />
      <circle cx={lFootX} cy={lFootY} r="3" fill="#e74c3c" />
    </g>
  );
}

function TRXKneeTuckFig4({ t }) {
  const phase = t < 0.5 ? t / 0.5 : 1 - (t - 0.5) / 0.5;
  const tuck = Math.sin(phase * Math.PI * 0.5);
  const floorY = 200, anchorX = 340, anchorY = 80;
  const elbX = 100, elbY = floorY - 5;
  const shX = elbX + 15, shY = floorY - 42;
  const hipX = shX + 55 - tuck * 20, hipY = floorY - 35 + tuck * 5;
  // right leg tucks in
  const rKneeX = hipX + 30 - tuck * 35, rKneeY = hipY - 5 - tuck * 15;
  const rFootX = rKneeX + 15 - tuck * 5, rFootY = rKneeY + 20 - tuck * 5;
  // calf midpoint for fig-4 hook
  const rCalfMidX = (rKneeX + rFootX) / 2, rCalfMidY = (rKneeY + rFootY) / 2;
  return (
    <g>
      <line x1="40" y1={floorY + 5} x2="360" y2={floorY + 5} stroke="#333" strokeWidth="1" strokeDasharray="4,4" />
      <Anchor x={anchorX} y={anchorY} />
      {/* forearm */}
      <line x1={elbX - 15} y1={elbY + 3} x2={elbX} y2={elbY} stroke="#ddd" strokeWidth="4" strokeLinecap="round" />
      <line x1={elbX} y1={elbY} x2={shX} y2={shY} stroke="#ddd" strokeWidth="4" strokeLinecap="round" />
      {/* torso */}
      <line x1={shX} y1={shY} x2={hipX} y2={hipY} stroke="#ddd" strokeWidth="5" strokeLinecap="round" />
      <circle cx={shX - 10} cy={shY - 12} r="10" fill="none" stroke="#ddd" strokeWidth="2.5" />
      {/* right leg — tucking */}
      <line x1={hipX + 3} y1={hipY} x2={rKneeX} y2={rKneeY} stroke="#2ecc71" strokeWidth="4" strokeLinecap="round" />
      <line x1={rKneeX} y1={rKneeY} x2={rFootX} y2={rFootY} stroke="#2ecc71" strokeWidth="4" strokeLinecap="round" />
      <circle cx={rFootX} cy={rFootY} r="4" fill="#2ecc71" />
      <Strap x1={rFootX} y1={rFootY} x2={anchorX} y2={anchorY} />
      {/* left leg fig-4 hook */}
      <Fig4Hook hipX={hipX} hipY={hipY} rKneeX={rKneeX} rKneeY={rKneeY} rCalfMidX={rCalfMidX} rCalfMidY={rCalfMidY} />
      {/* core highlight */}
      <ellipse cx={(shX + hipX) / 2} cy={(shY + hipY) / 2 + 5} rx="16" ry="10" fill="#2ecc71" opacity={tuck * 0.45} />
      {tuck > 0.3 && <text x={shX - 5} y={hipY + 18} fill="#2ecc71" fontSize="10" fontWeight="bold" fontFamily="sans-serif">lower abs</text>}
    </g>
  );
}

function TRXBodySawFig4({ t }) {
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
      <line x1="40" y1={floorY + 5} x2="360" y2={floorY + 5} stroke="#333" strokeWidth="1" strokeDasharray="4,4" />
      <Anchor x={anchorX} y={anchorY} />
      <line x1={elbX - 15} y1={elbY + 3} x2={elbX} y2={elbY} stroke="#ddd" strokeWidth="4" strokeLinecap="round" />
      <line x1={elbX} y1={elbY} x2={shX} y2={shY} stroke="#ddd" strokeWidth="4" strokeLinecap="round" />
      <line x1={shX} y1={shY} x2={hipX} y2={hipY} stroke="#ddd" strokeWidth="5" strokeLinecap="round" />
      <circle cx={shX - 10} cy={shY - 12} r="10" fill="none" stroke="#ddd" strokeWidth="2.5" />
      <line x1={hipX + 3} y1={hipY} x2={rKneeX} y2={rKneeY} stroke="#2ecc71" strokeWidth="4" strokeLinecap="round" />
      <line x1={rKneeX} y1={rKneeY} x2={rFootX} y2={rFootY} stroke="#2ecc71" strokeWidth="4" strokeLinecap="round" />
      <circle cx={rFootX} cy={rFootY} r="4" fill="#2ecc71" />
      <Strap x1={rFootX} y1={rFootY} x2={anchorX} y2={anchorY} />
      <Fig4Hook hipX={hipX} hipY={hipY} rKneeX={rKneeX} rKneeY={rKneeY} rCalfMidX={rCalfMidX} rCalfMidY={rCalfMidY} />
      <ellipse cx={(shX + hipX) / 2} cy={(shY + hipY) / 2} rx="20" ry="8" fill="#2ecc71" opacity={0.3 + Math.abs(rock) * 0.2} />
      <text x={(shX + hipX) / 2 - 10} y={(shY + hipY) / 2 - 12} fill="#f39c12" fontSize="13" fontFamily="sans-serif">{rock > 0 ? "→" : "←"}</text>
    </g>
  );
}

function LSitKneeTuck({ t }) {
  const phase = t < 0.5 ? t / 0.5 : 1 - (t - 0.5) / 0.5;
  const tuck = Math.sin(phase * Math.PI * 0.5);
  const floorY = 220;
  const lBarX = 165, rBarX = 235;
  const hipX = 200, hipY = 130;
  const shX = 200, shY = 95, hdY = 72;
  // hands on bars
  const lHandY = 128, rHandY = 128;
  // right knee tucks up
  const rKneeX = hipX + 15 + tuck * 10, rKneeY = hipY + 20 - tuck * 25;
  const rFootX = rKneeX + 5, rFootY = rKneeY + 25 - tuck * 10;
  // left leg hangs passive
  const lFootX = hipX - 10, lFootY = floorY - 15;
  const lKneeX = hipX - 8, lKneeY = hipY + 40;
  return (
    <g>
      <line x1="60" y1={floorY} x2="340" y2={floorY} stroke="#333" strokeWidth="1" strokeDasharray="4,4" />
      <Pbar x={lBarX} y={floorY} h={floorY - lHandY + 10} />
      <Pbar x={rBarX} y={floorY} h={floorY - rHandY + 10} />
      {/* arms */}
      <line x1={lBarX} y1={lHandY} x2={shX - 5} y2={shY + 5} stroke="#ddd" strokeWidth="4" strokeLinecap="round" />
      <line x1={rBarX} y1={rHandY} x2={shX + 5} y2={shY + 5} stroke="#ddd" strokeWidth="4" strokeLinecap="round" />
      <circle cx={lBarX} cy={lHandY} r="4" fill="#ddd" />
      <circle cx={rBarX} cy={rHandY} r="4" fill="#ddd" />
      {/* torso */}
      <line x1={shX} y1={shY} x2={hipX} y2={hipY} stroke="#ddd" strokeWidth="5" strokeLinecap="round" />
      <circle cx={shX} cy={hdY} r="12" fill="none" stroke="#ddd" strokeWidth="3" />
      {/* left leg — hanging passive */}
      <line x1={hipX - 5} y1={hipY} x2={lKneeX} y2={lKneeY} stroke="#e74c3c" strokeWidth="4" strokeLinecap="round" />
      <line x1={lKneeX} y1={lKneeY} x2={lFootX} y2={lFootY} stroke="#e74c3c" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx={lFootX} cy={lFootY} r="3" fill="#e74c3c" />
      {/* right leg — tucking */}
      <line x1={hipX + 5} y1={hipY} x2={rKneeX} y2={rKneeY} stroke="#2ecc71" strokeWidth="4.5" strokeLinecap="round" />
      <line x1={rKneeX} y1={rKneeY} x2={rFootX} y2={rFootY} stroke="#2ecc71" strokeWidth="4" strokeLinecap="round" />
      <circle cx={rFootX} cy={rFootY} r="4" fill="#2ecc71" />
      {/* core highlight */}
      <ellipse cx={hipX} cy={hipY - 8} rx="12" ry="10" fill="#2ecc71" opacity={tuck * 0.45} />
      {tuck > 0.3 && <text x={hipX + 20} y={hipY - 5} fill="#2ecc71" fontSize="10" fontWeight="bold" fontFamily="sans-serif">compress</text>}
    </g>
  );
}

function LSitHold({ t }) {
  // subtle sway
  const sway = Math.sin(t * Math.PI * 3) * 2;
  const floorY = 220;
  const lBarX = 165, rBarX = 235;
  const hipX = 200, hipY = 130;
  const shX = 200, shY = 95, hdY = 72;
  const lHandY = 128, rHandY = 128;
  // right leg extended forward (L-sit)
  const rFootX = hipX + 70 + sway, rFootY = hipY + 5;
  // left leg hangs
  const lFootX = hipX - 10, lFootY = floorY - 15;
  return (
    <g>
      <line x1="60" y1={floorY} x2="340" y2={floorY} stroke="#333" strokeWidth="1" strokeDasharray="4,4" />
      <Pbar x={lBarX} y={floorY} h={floorY - lHandY + 10} />
      <Pbar x={rBarX} y={floorY} h={floorY - rHandY + 10} />
      <line x1={lBarX} y1={lHandY} x2={shX - 5} y2={shY + 5} stroke="#ddd" strokeWidth="4" strokeLinecap="round" />
      <line x1={rBarX} y1={rHandY} x2={shX + 5} y2={shY + 5} stroke="#ddd" strokeWidth="4" strokeLinecap="round" />
      <circle cx={lBarX} cy={lHandY} r="4" fill="#ddd" />
      <circle cx={rBarX} cy={rHandY} r="4" fill="#ddd" />
      <line x1={shX} y1={shY} x2={hipX} y2={hipY} stroke="#ddd" strokeWidth="5" strokeLinecap="round" />
      <circle cx={shX} cy={hdY} r="12" fill="none" stroke="#ddd" strokeWidth="3" />
      {/* left leg hanging */}
      <line x1={hipX - 5} y1={hipY} x2={hipX - 8} y2={hipY + 40} stroke="#e74c3c" strokeWidth="4" strokeLinecap="round" />
      <line x1={hipX - 8} y1={hipY + 40} x2={lFootX} y2={lFootY} stroke="#e74c3c" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx={lFootX} cy={lFootY} r="3" fill="#e74c3c" />
      {/* right leg extended */}
      <line x1={hipX + 5} y1={hipY} x2={hipX + 40 + sway * 0.5} y2={hipY + 3} stroke="#2ecc71" strokeWidth="5" strokeLinecap="round" />
      <line x1={hipX + 40 + sway * 0.5} y1={hipY + 3} x2={rFootX} y2={rFootY} stroke="#2ecc71" strokeWidth="4" strokeLinecap="round" />
      <circle cx={rFootX} cy={rFootY} r="4" fill="#2ecc71" />
      {/* core */}
      <ellipse cx={hipX} cy={hipY - 5} rx="12" ry="10" fill="#2ecc71" opacity={0.35} />
      <text x={hipX + 18} y={hipY - 12} fill="#2ecc71" fontSize="10" fontWeight="bold" fontFamily="sans-serif">HOLD</text>
    </g>
  );
}

function TuckPlancheLean({ t }) {
  const phase = t < 0.5 ? t / 0.5 : 1 - (t - 0.5) / 0.5;
  const lean = Math.sin(phase * Math.PI * 0.5);
  const floorY = 220;
  const lBarX = 165, rBarX = 235;
  const handY = floorY - 40;
  // body leans forward
  const shX = 200 + lean * 25, shY = handY - 35 + lean * 5;
  const hipX = 200 - lean * 5, hipY = handY - 15 + lean * 10;
  const hdX = shX + 5, hdY = shY - 16;
  // right knee tucked to chest
  const rKneeX = shX - 10 + lean * 5, rKneeY = hipY + 5;
  const rFootX = rKneeX - 10, rFootY = rKneeY + 15;
  // left leg trails behind in extension
  const lFootX = hipX - 50 - lean * 15, lFootY = hipY + 10;
  return (
    <g>
      <line x1="60" y1={floorY} x2="340" y2={floorY} stroke="#333" strokeWidth="1" strokeDasharray="4,4" />
      <Pbar x={lBarX} y={floorY} h={floorY - handY + 5} />
      <Pbar x={rBarX} y={floorY} h={floorY - handY + 5} />
      {/* arms — locked straight */}
      <line x1={lBarX} y1={handY} x2={shX - 10} y2={shY + 5} stroke="#ddd" strokeWidth="4" strokeLinecap="round" />
      <line x1={rBarX} y1={handY} x2={shX + 10} y2={shY + 5} stroke="#ddd" strokeWidth="4" strokeLinecap="round" />
      <circle cx={lBarX} cy={handY} r="4" fill="#ddd" />
      <circle cx={rBarX} cy={handY} r="4" fill="#ddd" />
      {/* torso */}
      <line x1={shX} y1={shY} x2={hipX} y2={hipY} stroke="#ddd" strokeWidth="5" strokeLinecap="round" />
      <circle cx={hdX} cy={hdY} r="11" fill="none" stroke="#ddd" strokeWidth="2.5" />
      {/* right knee tucked */}
      <line x1={hipX + 5} y1={hipY} x2={rKneeX} y2={rKneeY} stroke="#2ecc71" strokeWidth="4" strokeLinecap="round" />
      <line x1={rKneeX} y1={rKneeY} x2={rFootX} y2={rFootY} stroke="#2ecc71" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx={rFootX} cy={rFootY} r="3" fill="#2ecc71" />
      {/* left leg trailing — extension */}
      <line x1={hipX - 5} y1={hipY} x2={lFootX} y2={lFootY} stroke="#e74c3c" strokeWidth="4" strokeLinecap="round" />
      <circle cx={lFootX} cy={lFootY} r="3" fill="#e74c3c" />
      {/* forward lean arrow */}
      {lean > 0.2 && <text x={shX + 15} y={shY - 5} fill="#f39c12" fontSize="12" fontFamily="sans-serif">→ lean</text>}
      {/* shoulder highlight */}
      <ellipse cx={shX} cy={shY + 5} rx="10" ry="8" fill="#f39c12" opacity={lean * 0.3} />
      <ellipse cx={(hipX + shX) / 2} cy={(hipY + shY) / 2} rx="10" ry="8" fill="#2ecc71" opacity={lean * 0.35} />
    </g>
  );
}

function SupportProtraction({ t }) {
  const pulse = Math.sin(t * Math.PI * 4) * 0.5 + 0.5; // 0→1 pulsing
  const floorY = 220;
  const lBarX = 165, rBarX = 235;
  const handY = floorY - 40;
  const hipX = 200, hipY = 140;
  const shX = 200, shY = 100;
  const hdY = 78;
  // protraction moves shoulders forward/apart
  const protr = pulse * 6;
  return (
    <g>
      <line x1="60" y1={floorY} x2="340" y2={floorY} stroke="#333" strokeWidth="1" strokeDasharray="4,4" />
      <Pbar x={lBarX} y={floorY} h={floorY - handY + 5} />
      <Pbar x={rBarX} y={floorY} h={floorY - handY + 5} />
      {/* arms */}
      <line x1={lBarX} y1={handY} x2={shX - 8 - protr} y2={shY + 5} stroke="#ddd" strokeWidth="4" strokeLinecap="round" />
      <line x1={rBarX} y1={handY} x2={shX + 8 + protr} y2={shY + 5} stroke="#ddd" strokeWidth="4" strokeLinecap="round" />
      <circle cx={lBarX} cy={handY} r="4" fill="#ddd" />
      <circle cx={rBarX} cy={handY} r="4" fill="#ddd" />
      {/* torso — rises with protraction */}
      <line x1={shX} y1={shY - protr * 0.5} x2={hipX} y2={hipY} stroke="#ddd" strokeWidth="5" strokeLinecap="round" />
      <circle cx={shX} cy={hdY - protr * 0.5} r="12" fill="none" stroke="#ddd" strokeWidth="3" />
      {/* scapular highlight */}
      <ellipse cx={shX - 15} cy={shY - protr * 0.3} rx="8" ry="10" fill="#f39c12" opacity={pulse * 0.4} />
      <ellipse cx={shX + 15} cy={shY - protr * 0.3} rx="8" ry="10" fill="#f39c12" opacity={pulse * 0.4} />
      {pulse > 0.6 && <text x={shX - 25} y={shY - 15} fill="#f39c12" fontSize="9" fontWeight="bold" fontFamily="sans-serif">protract</text>}
      {/* legs hanging */}
      <line x1={hipX - 5} y1={hipY} x2={hipX - 10} y2={hipY + 35} stroke="#e74c3c" strokeWidth="4" strokeLinecap="round" />
      <line x1={hipX - 10} y1={hipY + 35} x2={hipX - 12} y2={floorY - 15} stroke="#e74c3c" strokeWidth="3" strokeLinecap="round" />
      <line x1={hipX + 5} y1={hipY} x2={hipX + 10} y2={hipY + 35} stroke="#ddd" strokeWidth="4" strokeLinecap="round" />
      <line x1={hipX + 10} y1={hipY + 35} x2={hipX + 12} y2={floorY - 15} stroke="#ddd" strokeWidth="3" strokeLinecap="round" />
    </g>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ANIMATION MAP
   ═══════════════════════════════════════════════════════════════ */

const ANIM_MAP = {
  s1: CrossBodyReach, s2: SupineSideBend, s3: KneeDropOblique, s5: DeadBugRight,
  t1: TRXPallofPress, t2: TRXStandingRollout, t3: TRXSingleArmRow,
  t4: TRXKneelingRollout, t5: TRXKneelingChop, t6: TRXBodySaw, t7: TRXSidePlank,
  a1: TRXKneeTuckFig4, a2: TRXBodySawFig4, a3: LSitKneeTuck, a4: LSitHold,
  a5: TuckPlancheLean, a6: SupportProtraction,
};

/* ═══════════════════════════════════════════════════════════════
   MAIN
   ═══════════════════════════════════════════════════════════════ */

export default function NWBCoreGuide() {
  const [cat, setCat] = useState("supine");
  const [active, setActive] = useState("s1");
  const [t, setT] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const iv = setInterval(() => setT(p => (p + 0.006) % 1), 25);
    return () => clearInterval(iv);
  }, [paused]);

  useEffect(() => { setT(0); setPaused(false); }, [active]);
  useEffect(() => {
    const first = EXERCISES.find(e => e.cat === cat);
    if (first) setActive(first.id);
  }, [cat]);

  const catExercises = EXERCISES.filter(e => e.cat === cat);
  const ex = EXERCISES.find(e => e.id === active);
  const AnimComponent = ANIM_MAP[active];

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0a0a", color: "#e8e8e8",
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      padding: "16px", boxSizing: "border-box",
    }}>
      <div style={{ maxWidth: 460, margin: "0 auto" }}>
        {/* header */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, letterSpacing: 3, color: "#555", textTransform: "uppercase", marginBottom: 4 }}>
            NWB Safe · Core Training
          </div>
          <h1 style={{
            fontSize: 20, fontWeight: 700, margin: 0,
            background: "linear-gradient(90deg, #2ecc71, #1abc9c)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            Exercise Demos
          </h1>
        </div>

        {/* category tabs */}
        <div style={{ display: "flex", gap: 0, marginBottom: 12, borderRadius: 8, overflow: "hidden", border: "1px solid #222" }}>
          {CATEGORIES.map(c => (
            <button key={c.key} onClick={() => setCat(c.key)} style={{
              flex: 1, padding: "7px 0", fontSize: 11, fontFamily: "inherit", border: "none",
              background: cat === c.key ? "#1a2e22" : "#111",
              color: cat === c.key ? "#2ecc71" : "#666",
              cursor: "pointer", fontWeight: cat === c.key ? 700 : 400,
              borderBottom: cat === c.key ? "2px solid #2ecc71" : "2px solid transparent",
              transition: "all 0.2s",
            }}>
              {c.label}
            </button>
          ))}
        </div>

        {/* exercise selector */}
        <div style={{ display: "flex", gap: 5, marginBottom: 12, flexWrap: "wrap" }}>
          {catExercises.map((e, i) => (
            <button key={e.id} onClick={() => setActive(e.id)} style={{
              padding: "5px 10px", fontSize: 11, fontFamily: "inherit",
              border: active === e.id ? "1.5px solid #2ecc71" : "1.5px solid #282828",
              borderRadius: 6,
              background: active === e.id ? "#2ecc7115" : "#141414",
              color: active === e.id ? "#2ecc71" : "#777",
              cursor: "pointer", transition: "all 0.15s",
            }}>
              {i + 1}
            </button>
          ))}
        </div>

        {/* title + cue */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, margin: 0, color: "#f0f0f0" }}>{ex.name}</h2>
            {ex.position && (
              <span style={{
                fontSize: 9, padding: "2px 6px", borderRadius: 4,
                background: "#1a1a2e", color: "#7c8cf5", border: "1px solid #2a2a4e",
              }}>{ex.position}</span>
            )}
            {ex.equipment && (
              <span style={{
                fontSize: 9, padding: "2px 6px", borderRadius: 4,
                background: "#2e1a1a", color: "#f5a07c", border: "1px solid #4e2a2a",
              }}>{ex.equipment}</span>
            )}
          </div>
          <p style={{ fontSize: 12, margin: 0, color: "#999", lineHeight: 1.5 }}>{ex.cue}</p>
        </div>

        {/* SVG animation */}
        <div style={{
          background: "#0e0e0e", borderRadius: 10, border: "1px solid #1a1a1a",
          overflow: "hidden", marginBottom: 10, position: "relative",
        }}>
          <svg viewBox="0 0 400 240" width="100%" style={{ display: "block" }}>
            {AnimComponent && <AnimComponent t={t} />}
          </svg>
          <div style={{
            position: "absolute", bottom: 6, left: 8,
            display: "flex", gap: 10, fontSize: 9, color: "#666",
          }}>
            <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#e74c3c", display: "inline-block" }} />
              Left (passive)
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#2ecc71", display: "inline-block" }} />
              Active
            </span>
            {(cat === "trx" || (cat === "arm" && (active === "a1" || active === "a2"))) && (
              <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                <span style={{ width: 12, height: 2, background: "#f39c12", display: "inline-block" }} />
                TRX
              </span>
            )}
          </div>
          <button onClick={() => setPaused(!paused)} style={{
            position: "absolute", bottom: 6, right: 8,
            background: "#1a1a1a", border: "1px solid #333", color: "#aaa",
            borderRadius: 5, padding: "2px 8px", fontSize: 10,
            cursor: "pointer", fontFamily: "inherit",
          }}>
            {paused ? "▶" : "⏸"}
          </button>
        </div>

        {/* progress */}
        <div style={{ height: 2, background: "#1a1a1a", borderRadius: 2, marginBottom: 12 }}>
          <div style={{ height: "100%", width: `${t * 100}%`, background: "#2ecc71", borderRadius: 2 }} />
        </div>

        {/* safety */}
        <div style={{
          background: "#1a1308", border: "1px solid #f39c1230", borderRadius: 7,
          padding: "8px 12px", fontSize: 11, lineHeight: 1.5, color: "#e8c34a", marginBottom: 12,
        }}>
          <span style={{ fontWeight: 700, marginRight: 5 }}>⚠</span>{ex.safety}
        </div>

        {/* knee drop explainer */}
        {active === "s3" && (
          <div style={{
            background: "#0c1610", border: "1px solid #2ecc7130", borderRadius: 7,
            padding: "10px 12px", fontSize: 11, lineHeight: 1.6, color: "#a0c8b0",
          }}>
            <div style={{ fontWeight: 700, color: "#2ecc71", marginBottom: 5 }}>How this works:</div>
            <div style={{ marginBottom: 5 }}>1. Right foot flat, right knee at ceiling.</div>
            <div style={{ marginBottom: 5 }}>2. <span style={{ color: "#f39c12" }}>Drop:</span> Gravity pulls knee outward. Passive.</div>
            <div>3. <span style={{ color: "#2ecc71", fontWeight: 700 }}>Pull:</span> Left oblique fires across to drag knee back. That's the rep.</div>
          </div>
        )}

        {/* TRX contraindication */}
        {cat === "trx" && (
          <div style={{
            marginTop: 4, background: "#1a0808", border: "1px solid #e74c3c30", borderRadius: 7,
            padding: "8px 12px", fontSize: 10, lineHeight: 1.5, color: "#c77",
          }}>
            <span style={{ fontWeight: 700, color: "#e74c3c" }}>⛔ AVOID:</span> Both feet in straps — left iliopsoas will reflexively fire to stabilize.
          </div>
        )}

        {/* fig-4 explainer */}
        {(active === "a1" || active === "a2") && (
          <div style={{
            background: "#0c1610", border: "1px solid #2ecc7130", borderRadius: 7,
            padding: "10px 12px", fontSize: 11, lineHeight: 1.6, color: "#a0c8b0", marginTop: 4,
          }}>
            <div style={{ fontWeight: 700, color: "#2ecc71", marginBottom: 5 }}>Fig-4 Hook Setup:</div>
            <div style={{ marginBottom: 4 }}>Left leg wraps loosely eagle-style or figure-4 behind the right calf.</div>
            <div style={{ marginBottom: 4 }}>Left hip stays at a fixed angle — shortened + externally rotated, so iliopsoas is mechanically disadvantaged and won't fire.</div>
            <div>All movement comes from right leg + lower abs. Left side is along for the ride.</div>
          </div>
        )}
      </div>
    </div>
  );
}

export { NWBCoreGuide as CoreDemoGuide };
