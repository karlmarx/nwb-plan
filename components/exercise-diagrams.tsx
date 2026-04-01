"use client";

import { useState, useRef, type CSSProperties, type MouseEvent, type ReactNode } from "react";

interface DiagramProps {
  onClose?: () => void;
}

interface Callout {
  key: string;
  title: string;
  color: string;
  bg: string;
  border: string;
  text: string;
}

interface Step {
  n: number;
  parts: ReactNode[];
}

// ===== GLUTE BRIDGE DIAGRAM =====

const gluteBridgeKeyframes = `
@keyframes bridgeUp {
  0%, 100% { transform: translateY(0); }
  25% { transform: translateY(-18px); }
  50% { transform: translateY(-18px); }
  75% { transform: translateY(0); }
}
@keyframes fadeInMid {
  0%, 10% { opacity: 0; }
  25% { opacity: 1; }
  50% { opacity: 1; }
  65%, 100% { opacity: 0; }
}
@keyframes fadeInTop {
  0%, 20% { opacity: 0; }
  35% { opacity: 1; }
  50% { opacity: 1; }
  60%, 100% { opacity: 0; }
}
`;

export function GluteBridgeDiagram({ onClose }: DiagramProps) {
  const paused = useRef(false);
  const [isPaused, setIsPaused] = useState(false);
  const dur = "4s";

  const callouts: Callout[] = [
    { key: "right", title: "Right Leg (Working)", color: "#48c78e", bg: "#0d1f14", border: "#48c78e", text: "Drive through the RIGHT heel to lift hips. Foot stays flat, knee tracks over toes. This leg does 100% of the work." },
    { key: "left", title: "Left Leg (NWB \u00b7 Passive)", color: "#465060", bg: "#0d1119", border: "#465060", text: "Bend knee ~90\u00b0 and lift foot off the floor. Let the shin hang like dead weight. Do NOT rest foot on the ground \u2014 this causes hip flexor engagement on the injured side." },
    { key: "squeeze", title: "Squeeze at Top", color: "#dc5046", bg: "#1a0d0c", border: "#dc5046", text: "Hold the bridge for 2 full seconds at the top. Consciously squeeze glutes. If you feel it in your lower back, you\u2019re over-arching \u2014 drop hips slightly." },
    { key: "breath", title: "Breathing", color: "#daa53c", bg: "#1a1500", border: "#daa53c", text: "Exhale on the drive up. Before each rep, exhale and consciously let the entire left side go slack. If you catch it tensing mid-rep, reset." },
  ];

  const steps: Step[] = [
    { n: 1, parts: ["Lie on your back on a mat. ", <strong key="s1" style={{ color: "#48c78e" }}>RIGHT knee bent</strong>, ", foot flat on the floor. Arms at sides, palms down."] },
    { n: 2, parts: ["Bend your LEFT knee ~90\u00b0 and ", <strong key="s2" style={{ color: "#465060" }}>lift your left foot off the floor</strong>, ". Let the shin hang straight down like dead weight. Do NOT rest it anywhere."] },
    { n: 3, parts: ["Drive through your ", <strong key="s3" style={{ color: "#daa53c" }}>right heel</strong>, " to lift hips until your torso forms a straight line from shoulders to right knee."] },
    { n: 4, parts: [<strong key="s4" style={{ color: "#dc5046" }}>Squeeze glutes hard</strong>, " at the top for 2 seconds. Don\u2019t over-arch \u2014 ribs stay down."] },
    { n: 5, parts: ["Lower with control (~2 seconds down). Brief pause at bottom. Repeat for all reps."] },
  ];

  function togglePause(ev: MouseEvent) {
    ev.stopPropagation();
    setIsPaused(!isPaused);
  }

  const anim = (name: string, extraStyle?: CSSProperties): CSSProperties => {
    const s: CSSProperties = {
      animationName: name,
      animationDuration: dur,
      animationTimingFunction: "ease-in-out",
      animationIterationCount: "infinite",
    };
    if (isPaused) s.animationPlayState = "paused";
    return { ...s, ...extraStyle };
  };

  const green = "#48c78e";
  const grey = "#465060";
  const teal = "#4ecdc4";
  const orange = "#daa53c";
  const red = "#dc5046";
  const bg = "#0d141e";
  const dimText = "#788c9e";

  return (
    <div style={{ padding: "24px 16px 32px", color: "#dce4eb", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}>
      <style>{gluteBridgeKeyframes}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: "clamp(1.1rem,3.5vw,1.5rem)", fontWeight: 800, letterSpacing: "-0.02em" }}>SL Glute Bridge (Right)</div>
          <div style={{ fontSize: 10, color: "#666", letterSpacing: "0.15em", textTransform: "uppercase", marginTop: 2 }}>Unilateral {"\u00b7"} NWB Safe</div>
        </div>
        <button onClick={onClose} style={{ background: "#222", border: "1px solid #444", color: "#aaa", borderRadius: 8, padding: "6px 12px", fontSize: 12, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}>{"\u2715"} Close</button>
      </div>

      {/* SVG Animation */}
      <div onClick={togglePause} style={{ width: "100%", background: bg, border: "1px solid #23374b", borderRadius: 12, padding: "16px 12px 8px", marginBottom: 16, cursor: "pointer", position: "relative" }}>
        <div style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "#555", marginBottom: 8 }}>Side View {"\u2014"} Animated {"\u00b7"} Tap to {isPaused ? "play" : "pause"}</div>
        <svg viewBox="0 0 640 280" width="100%" xmlns="http://www.w3.org/2000/svg" className="anim-bridge" style={{ fontFamily: "-apple-system, monospace", display: "block" }}>

          {/* Floor / mat */}
          <rect x={40} y={228} width={560} height={4} rx={2} fill="#1a2636" />
          <text x={320} y={250} textAnchor="middle" fontSize={9} fill="#333">MAT</text>

          {/* === STATIC PARTS (upper back, head, arms stay on ground) === */}
          {/* Head */}
          <circle cx={108} cy={200} r={18} fill="none" stroke={teal} strokeWidth={4} />
          {/* Upper back on ground */}
          <line x1={126} y1={206} x2={220} y2={216} stroke={teal} strokeWidth={6} strokeLinecap="round" />
          {/* Left arm (on ground) */}
          <line x1={150} y1={210} x2={130} y2={226} stroke={teal} strokeWidth={4} strokeLinecap="round" opacity={0.5} />
          {/* Right arm (on ground) */}
          <line x1={190} y1={214} x2={175} y2={228} stroke={teal} strokeWidth={4} strokeLinecap="round" opacity={0.5} />

          {/* === ANIMATED HIP GROUP (torso from mid-back to hip, lifts up) === */}
          <g style={anim("bridgeUp")}>
            {/* Lower torso / hip area */}
            <line x1={220} y1={216} x2={310} y2={210} stroke={teal} strokeWidth={6} strokeLinecap="round" />

            {/* Hip joint dot */}
            <circle cx={310} cy={210} r={4} fill={teal} />

            {/* RIGHT leg - thigh (hip to knee) */}
            <line x1={310} y1={210} x2={410} y2={175} stroke={green} strokeWidth={7} strokeLinecap="round" />
            {/* RIGHT leg - shin (knee down to foot on ground) */}
            <line x1={410} y1={175} x2={430} y2={228} stroke={green} strokeWidth={7} strokeLinecap="round" />

            {/* RIGHT foot (planted) */}
            <rect x={420} y={224} width={24} height={6} rx={3} fill={green} />

            {/* LEFT leg - thigh (hip to knee, passive, rides with hip) */}
            <line x1={310} y1={210} x2={370} y2={180} stroke={grey} strokeWidth={5} strokeLinecap="round" strokeDasharray="8,4" />
            {/* LEFT leg - shin hanging down like dead weight */}
            <line x1={370} y1={180} x2={372} y2={225} stroke={grey} strokeWidth={5} strokeLinecap="round" strokeDasharray="8,4" />
            {/* LEFT foot (hovering) */}
            <ellipse cx={373} cy={228} rx={8} ry={3} fill="none" stroke={grey} strokeWidth={1.5} strokeDasharray="3,2" />

            {/* "R" label near right knee */}
            <text x={415} y={168} fontSize={14} fontWeight={800} fill={green}>R</text>
            {/* "L" label near left foot */}
            <text x={383} y={233} fontSize={12} fontWeight={700} fill={grey}>L</text>
            {/* "DEAD WEIGHT" label */}
            <text x={385} y={195} fontSize={9} fontWeight={700} fill={grey} letterSpacing="0.08em">DEAD</text>
            <text x={381} y={206} fontSize={9} fontWeight={700} fill={grey} letterSpacing="0.08em">WEIGHT</text>
          </g>

          {/* === ANIMATED LABELS (fade in/out with phases) === */}
          {/* "DRIVE" arrow - fades in during rise */}
          <g style={anim("fadeInMid")}>
            <text x={270} y={175} fontSize={12} fontWeight={800} fill={teal} letterSpacing="0.1em">DRIVE</text>
            <line x1={285} y1={178} x2={285} y2={196} stroke={teal} strokeWidth={2} markerEnd="url(#arrowUp)" />
            {/* Arrow marker */}
            <defs>
              <marker id="arrowUp" viewBox="0 0 10 10" refX={5} refY={10} markerWidth={6} markerHeight={6} orient="auto">
                <path d="M0,10 L5,0 L10,10" fill="none" stroke={teal} strokeWidth={2} />
              </marker>
            </defs>
          </g>

          {/* "SQUEEZE 2s" - fades in at top hold */}
          <g style={anim("fadeInTop")}>
            <text x={238} y={155} fontSize={11} fontWeight={800} fill={red} letterSpacing="0.08em">SQUEEZE 2s</text>
          </g>

          {/* "HEEL DRIVE" below right foot - fades in during rise */}
          <g style={anim("fadeInMid")}>
            <text x={405} y={260} fontSize={10} fontWeight={700} fill={orange} letterSpacing="0.06em" textAnchor="middle">HEEL DRIVE</text>
            <line x1={432} y1={232} x2={432} y2={244} stroke={orange} strokeWidth={1.5} strokeDasharray="2,2" />
          </g>
        </svg>

        {/* Legend bar */}
        <div style={{ display: "flex", gap: 24, justifyContent: "center", padding: "10px 0 4px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: green }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: green, letterSpacing: "0.05em" }}>RIGHT (WORKING)</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: grey }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: grey, letterSpacing: "0.05em" }}>LEFT (NWB {"\u00b7"} HOVERING)</span>
          </div>
        </div>
      </div>

      {/* Callout cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, marginBottom: 16 }}>
        {callouts.map((c) => (
          <div key={c.key} style={{ background: c.bg, border: "1px solid #2a2a2a", borderLeft: "3px solid " + c.border, borderRadius: 8, padding: "12px 14px" }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: c.color, marginBottom: 5 }}>{c.title}</div>
            <div style={{ fontSize: 11, lineHeight: 1.65, color: "#bbb" }}>{c.text}</div>
          </div>
        ))}
      </div>

      {/* Movement sequence */}
      <div style={{ background: "#161616", border: "1px solid #2a2a2a", borderRadius: 12, padding: "16px 14px" }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#555", marginBottom: 12 }}>Movement Sequence</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {steps.map((s) => (
            <div key={s.n} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#222", border: "1px solid #444", fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#777", marginTop: 1 }}>{s.n}</div>
              <div style={{ fontSize: 11, lineHeight: 1.65, color: "#bbb" }}>{s.parts}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ===== BANDED CLAMSHELLS DIAGRAM =====

const clamshellKeyframes = `
@keyframes clamOpen {
  0%, 100% { transform: rotate(0deg); }
  30% { transform: rotate(-25deg); }
  50% { transform: rotate(-25deg); }
  80% { transform: rotate(0deg); }
}
@keyframes clamFadeOpen {
  0%, 15% { opacity: 0; }
  30% { opacity: 1; }
  50% { opacity: 1; }
  70%, 100% { opacity: 0; }
}
`;

export function ClamshellDiagram({ onClose }: DiagramProps) {
  const [isPaused, setIsPaused] = useState(false);
  const dur = "3s";

  const callouts: Callout[] = [
    { key: "stack", title: "\u2713 Hips Stacked", color: "#48c78e", bg: "#0d1f14", border: "#48c78e", text: "Hip bones balanced directly on top of each other. If the top hip rolls backward, you\u2019re cheating the rep and loading the low back instead of the glute med. A wall behind your back can help you stay honest." },
    { key: "band", title: "Band Placement", color: "#daa53c", bg: "#1a1500", border: "#daa53c", text: "Band goes just ABOVE the knees, never on the kneecap. If it slides down mid-set, stop and reposition \u2014 shearing force on the joint." },
    { key: "feet", title: "Feet Together", color: "#4ecdc4", bg: "#0d1a1e", border: "#4ecdc4", text: "Feet stay glued together throughout the movement \u2014 they are the hinge point. If feet separate, you\u2019re using hip flexors instead of glute med." },
    { key: "target", title: "Target: Glute Med", color: "#48c78e", bg: "#0d1f14", border: "#48c78e", text: "The burn should be deep in the side of the glute. If you feel hip flexor engagement instead, reset your hip stacking and reduce range of motion." },
  ];

  const steps: Step[] = [
    { n: 1, parts: ["Lie on your side with ", <strong key="c1" style={{ color: "#dce4eb" }}>hips and knees bent ~45{"\u00b0"}</strong>, ". Bottom arm under head for support."] },
    { n: 2, parts: ["Place resistance band ", <strong key="c2" style={{ color: "#daa53c" }}>just above both knees</strong>, ". Not on the kneecap."] },
    { n: 3, parts: ["Keep feet glued together. ", <strong key="c3" style={{ color: "#4ecdc4" }}>Open top knee upward</strong>, " like a clamshell. Control the movement."] },
    { n: 4, parts: [<strong key="c4" style={{ color: "#48c78e" }}>Squeeze glute med</strong>, " at the top. Brief hold. Lower with control (~1s)."] },
    { n: 5, parts: ["Tempo: 1s open, brief hold, 1s close. ", <strong key="c5" style={{ color: "#dc5046" }}>No snapping</strong>, ". 20 reps per side."] },
  ];

  function togglePause(ev: MouseEvent) {
    ev.stopPropagation();
    setIsPaused(!isPaused);
  }

  const anim = (name: string, extraStyle?: CSSProperties): CSSProperties => {
    const s: CSSProperties = {
      animationName: name,
      animationDuration: dur,
      animationTimingFunction: "ease-in-out",
      animationIterationCount: "infinite",
    };
    if (isPaused) s.animationPlayState = "paused";
    return { ...s, ...extraStyle };
  };

  const green = "#48c78e";
  const grey = "#465060";
  const teal = "#4ecdc4";
  const orange = "#daa53c";
  const bg = "#0d141e";
  const dimText = "#788c9e";
  const body = "#4ecdc4";

  return (
    <div style={{ padding: "24px 16px 32px", color: "#dce4eb", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}>
      <style>{clamshellKeyframes}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: "clamp(1.1rem,3.5vw,1.5rem)", fontWeight: 800, letterSpacing: "-0.02em" }}>Banded Clamshells</div>
          <div style={{ fontSize: 10, color: "#666", letterSpacing: "0.15em", textTransform: "uppercase", marginTop: 2 }}>Bilateral {"\u00b7"} NWB Safe {"\u00b7"} Glute Med</div>
        </div>
        <button onClick={onClose} style={{ background: "#222", border: "1px solid #444", color: "#aaa", borderRadius: 8, padding: "6px 12px", fontSize: 12, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}>{"\u2715"} Close</button>
      </div>

      {/* SVG Animation */}
      <div onClick={togglePause} style={{ width: "100%", background: bg, border: "1px solid #23374b", borderRadius: 12, padding: "16px 12px 8px", marginBottom: 16, cursor: "pointer", position: "relative" }}>
        <div style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "#555", marginBottom: 8 }}>Front View {"\u2014"} Animated {"\u00b7"} Tap to {isPaused ? "play" : "pause"}</div>
        <svg viewBox="0 0 640 300" width="100%" xmlns="http://www.w3.org/2000/svg" className="anim-clam" style={{ fontFamily: "-apple-system, monospace", display: "block" }}>

          {/* Floor */}
          <rect x={40} y={260} width={560} height={3} rx={1.5} fill="#1a2636" />

          {/* === BODY (side-lying, viewed from front) === */}
          {/* Head (bottom, resting on arm) */}
          <circle cx={160} cy={170} r={18} fill="none" stroke={body} strokeWidth={4} />
          {/* Bottom arm (under head) */}
          <line x1={160} y1={188} x2={140} y2={220} stroke={body} strokeWidth={4} strokeLinecap="round" opacity={0.5} />
          <line x1={140} y1={220} x2={160} y2={258} stroke={body} strokeWidth={4} strokeLinecap="round" opacity={0.5} />
          {/* Torso (side-lying) */}
          <line x1={178} y1={175} x2={310} y2={195} stroke={body} strokeWidth={7} strokeLinecap="round" />
          {/* Top arm (hand on floor for stability) */}
          <line x1={240} y1={185} x2={260} y2={220} stroke={body} strokeWidth={4} strokeLinecap="round" opacity={0.6} />
          <line x1={260} y1={220} x2={270} y2={258} stroke={body} strokeWidth={4} strokeLinecap="round" opacity={0.6} />

          {/* Hip joint */}
          <circle cx={310} cy={195} r={5} fill={body} />

          {/* === BOTTOM LEG (static, on floor) === */}
          {/* Thigh */}
          <line x1={310} y1={195} x2={410} y2={225} stroke={body} strokeWidth={6} strokeLinecap="round" />
          {/* Shin (bent) */}
          <line x1={410} y1={225} x2={460} y2={258} stroke={body} strokeWidth={6} strokeLinecap="round" />
          {/* Foot */}
          <ellipse cx={465} cy={258} rx={10} ry={4} fill={body} />

          {/* === TOP LEG (animated - rotates open from hip) === */}
          <g style={{ transformOrigin: "310px 195px", ...anim("clamOpen") }}>
            {/* Thigh */}
            <line x1={310} y1={195} x2={410} y2={220} stroke={green} strokeWidth={7} strokeLinecap="round" />
            {/* Shin (bent, matches bottom leg angle) */}
            <line x1={410} y1={220} x2={458} y2={252} stroke={green} strokeWidth={6} strokeLinecap="round" />
            {/* Foot (stays near bottom foot) */}
            <ellipse cx={463} cy={252} rx={10} ry={4} fill={green} />

            {/* Band (between knees - short strip) */}
            <rect x={395} y={216} width={22} height={8} rx={3} fill={orange} opacity={0.9} />

            {/* Knee marker */}
            <circle cx={410} cy={220} r={4} fill={green} />
          </g>

          {/* Band on bottom knee too */}
          <rect x={397} y={222} width={20} height={7} rx={3} fill={orange} opacity={0.6} />

          {/* === HIP STACKING LINE (vertical dotted) === */}
          <line x1={310} y1={140} x2={310} y2={210} stroke={green} strokeWidth={1.5} strokeDasharray="4,4" />
          <text x={310} y={133} textAnchor="middle" fontSize={12} fontWeight={800} fill={green}>{"\u2713"}</text>
          <text x={310} y={122} textAnchor="middle" fontSize={9} fontWeight={700} fill={dimText} letterSpacing="0.1em">HIPS STACKED</text>

          {/* "FEET TOGETHER" label */}
          <text x={475} y={275} fontSize={9} fontWeight={700} fill={teal} letterSpacing="0.06em">FEET TOGETHER</text>

          {/* "BAND ABOVE KNEES" label */}
          <line x1={430} y1={218} x2={480} y2={200} stroke={dimText} strokeWidth={1} strokeDasharray="3,3" />
          <text x={484} y={198} fontSize={9} fill={dimText} letterSpacing="0.06em">BAND ABOVE</text>
          <text x={484} y={209} fontSize={9} fill={dimText} letterSpacing="0.06em">KNEES</text>

          {/* "GLUTE MED" target - fades in during open phase */}
          <g style={anim("clamFadeOpen")}>
            <circle cx={325} cy={185} r={6} fill="none" stroke={green} strokeWidth={2} />
            <circle cx={325} cy={185} r={2} fill={green} />
            <line x1={331} y1={181} x2={370} y2={160} stroke={green} strokeWidth={1} strokeDasharray="3,3" />
            <text x={374} y={157} fontSize={11} fontWeight={800} fill={green} letterSpacing="0.06em">GLUTE MED</text>
            <text x={374} y={169} fontSize={9} fill={dimText}>feel the burn here</text>
          </g>
        </svg>

        {/* Legend bar */}
        <div style={{ display: "flex", gap: 24, justifyContent: "center", padding: "10px 0 4px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: orange }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: orange, letterSpacing: "0.05em" }}>RESISTANCE BAND</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: green }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: green, letterSpacing: "0.05em" }}>TARGET: GLUTE MED</span>
          </div>
        </div>
      </div>

      {/* NWB Safety Note */}
      <div style={{ background: "#1a0d0c", border: "1px solid #7f1d1d", borderRadius: 8, padding: "12px 14px", marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#dc5046", marginBottom: 6 }}>{"\u26A0"} NWB Safety Notes</div>
        <div style={{ fontSize: 11, lineHeight: 1.7, color: "#bbb" }}>
          <div style={{ marginBottom: 4 }}>{"\u2022"} When lying on your LEFT (injured) side: place a pillow under the left hip if pressure is uncomfortable</div>
          <div style={{ marginBottom: 4 }}>{"\u2022"} If any groin pain {"\u2014"} STOP immediately</div>
          <div style={{ marginBottom: 4 }}>{"\u2022"} If you feel hip flexor engagement instead of glute med, reset your hip stacking and reduce range of motion</div>
          <div>{"\u2022"} Tempo: 1s open, brief hold, 1s close. No snapping. The burn should be deep in the side of the glute.</div>
        </div>
      </div>

      {/* Callout cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, marginBottom: 16 }}>
        {callouts.map((c) => (
          <div key={c.key} style={{ background: c.bg, border: "1px solid #2a2a2a", borderLeft: "3px solid " + c.border, borderRadius: 8, padding: "12px 14px" }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: c.color, marginBottom: 5 }}>{c.title}</div>
            <div style={{ fontSize: 11, lineHeight: 1.65, color: "#bbb" }}>{c.text}</div>
          </div>
        ))}
      </div>

      {/* Movement sequence */}
      <div style={{ background: "#161616", border: "1px solid #2a2a2a", borderRadius: 12, padding: "16px 14px" }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#555", marginBottom: 12 }}>Movement Sequence</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {steps.map((s) => (
            <div key={s.n} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#222", border: "1px solid #444", fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#777", marginTop: 1 }}>{s.n}</div>
              <div style={{ fontSize: 11, lineHeight: 1.65, color: "#bbb" }}>{s.parts}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
