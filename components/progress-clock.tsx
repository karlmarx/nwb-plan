"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  DEFAULT_PROGRAM_PHASES,
  ProgramPhase,
  activePhase,
  ensureFwbPhase,
  phaseDayNumber,
  phaseDurationMs,
  phaseElapsedMs,
  phaseProgressFraction,
  parsePhases,
} from "@/lib/program";
import { PHASES } from "@/lib/exercises";
import { loadState, saveState } from "@/lib/storage";

const STORAGE_KEY = "nwb_programPhases";

const DAY_MS = 24 * 60 * 60 * 1000;

function fmt(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return {
    d: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
  };
}

function pad(n: number): string {
  return n < 10 ? "0" + n : "" + n;
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function loadPhases(): ProgramPhase[] {
  // loadState returns the raw JSON-parsed object (Dates are strings until rehydrated).
  const raw = loadState<unknown>(STORAGE_KEY, null);
  const parsed = parsePhases(raw);
  if (parsed && parsed.length > 0) {
    // Forward-migrate arrays persisted before the FWB phase existed.
    const migrated = ensureFwbPhase(parsed);
    if (migrated !== parsed && typeof window !== "undefined") {
      saveState(STORAGE_KEY, migrated);
    }
    return migrated;
  }
  // First-run fallback: write defaults so future sessions are stable.
  if (typeof window !== "undefined") {
    saveState(STORAGE_KEY, DEFAULT_PROGRAM_PHASES);
  }
  return DEFAULT_PROGRAM_PHASES;
}

export default function ProgressClock({ compact }: { compact?: boolean } = {}) {
  const [now, setNow] = useState(() => new Date());
  const [flash, setFlash] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  // Phases come from localStorage with sensible defaults. Memoized so we
  // don't reparse JSON every render. (The user can mutate phases by
  // editing localStorage; a future settings UI may surface this.)
  const phases = useMemo(loadPhases, []);
  const active = useMemo(() => activePhase(phases), [phases]);
  const prior = useMemo(
    () => phases.filter((p) => p.id !== active.id && p.status === "completed"),
    [phases, active.id],
  );

  // Tick every second
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Minimize on scroll
  useEffect(() => {
    function onScroll() {
      if (window.scrollY > 20) setMinimized(true);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const elapsed = phaseElapsedMs(active, now);
  const duration = phaseDurationMs(active);
  const progress = phaseProgressFraction(active, now);
  const pct = Math.round(progress * 100);
  const dayNum = phaseDayNumber(active, now);
  const dayCapped = Math.min(active.durationDays, dayNum);
  const reached = elapsed >= duration;

  // Big counter always counts UP (elapsed since active phase start).
  const t = fmt(elapsed);

  // Color shifts: green (0-33%) -> blue (33-66%) -> amber (66-100%)
  const clr =
    progress < 0.33
      ? "var(--color-safe)"
      : progress < 0.66
        ? "var(--color-accent)"
        : "var(--color-warning)";

  // Raw hex for inline computed styles
  const clrHex =
    progress < 0.33 ? "#10b981" : progress < 0.66 ? "#38bdf8" : "#f59e0b";

  const headerLabel = reached
    ? `${active.name} target reached · Day ${dayNum}`
    : `${active.name} · Day ${dayCapped} of ${active.durationDays}`;

  const pctDisplay = reached ? "target reached" : pct + "% complete";

  function openDetail() {
    if (minimized) setMinimized(false);
    setDetailOpen(true);
    setFlash(true);
    setTimeout(() => setFlash(false), 300);
  }

  // ===== COMPACT RING =====
  if (compact) {
    const size = 44;
    const strokeW = 3.5;
    const r = (size - strokeW) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ * (1 - progress);
    return (
      <>
        <div
          data-testid="progress-ring"
          onClick={openDetail}
          className="relative cursor-pointer"
          style={{ width: size, height: size }}
          title={`${active.longName} · Day ${dayNum} · ${pctDisplay} · tap for details`}
        >
          <svg width={size} height={size} className="block" style={{ transform: "rotate(-90deg)" }}>
            <circle
              cx={size / 2} cy={size / 2} r={r}
              fill="none"
              stroke="var(--color-border)"
              strokeWidth={strokeW}
            />
            <circle
              cx={size / 2} cy={size / 2} r={r}
              fill="none"
              stroke={clrHex}
              strokeWidth={strokeW}
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={offset}
              style={{ transition: "stroke-dashoffset 1s linear" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[10px] font-extrabold leading-none" style={{ color: clr }}>
              {active.name}
            </span>
            <span className="text-[8px] font-bold text-text-muted leading-none mt-0.5">
              D{dayNum}
            </span>
          </div>
        </div>
        {detailOpen && (
          <ProgressDetailModal
            now={now}
            active={active}
            prior={prior}
            elapsed={elapsed}
            duration={duration}
            progress={progress}
            pct={pct}
            dayNum={dayNum}
            reached={reached}
            clr={clr}
            clrHex={clrHex}
            onClose={() => setDetailOpen(false)}
          />
        )}
      </>
    );
  }

  // ===== MINIMIZED STATE =====
  if (minimized) {
    return (
      <>
        <div
          data-testid="progress-clock"
          onClick={openDetail}
          className="cursor-pointer mb-4 rounded-xl px-4 py-2.5 flex items-center justify-between min-h-[44px] transition-all duration-200"
          style={{
            background: "var(--color-card)",
            border: `1px solid ${clrHex}33`,
          }}
        >
          <span
            className="text-[11px] font-bold"
            style={{ color: clr }}
          >
            {active.name} &middot; D{dayNum}
          </span>
          <span
            className="text-[11px] text-text-muted tabular-nums"
          >
            {t.d > 0
              ? t.d + "d " + pad(t.h) + "h " + pad(t.m) + "m"
              : pad(t.h) + ":" + pad(t.m) + ":" + pad(t.s)}
            {" · "}
            {pctDisplay}
          </span>
          <span className="text-[10px] text-text-muted">{"ⓘ"}</span>
        </div>
        {detailOpen && (
          <ProgressDetailModal
            now={now}
            active={active}
            prior={prior}
            elapsed={elapsed}
            duration={duration}
            progress={progress}
            pct={pct}
            dayNum={dayNum}
            reached={reached}
            clr={clr}
            clrHex={clrHex}
            onClose={() => setDetailOpen(false)}
          />
        )}
      </>
    );
  }

  // ===== EXPANDED STATE =====
  return (
    <>
      <div
        data-testid="progress-clock"
        onClick={openDetail}
        className="cursor-pointer mb-5 rounded-2xl overflow-hidden transition-all duration-200"
        style={{
          background: flash
            ? clrHex + "18"
            : "var(--color-card)",
          border: `1px solid ${clrHex}55`,
          boxShadow: `0 0 24px ${clrHex}18, inset 0 1px 0 ${clrHex}22`,
          transition: "background 0.25s, box-shadow 0.25s",
        }}
      >
        {/* Header row */}
        <div className="flex items-center justify-between px-3.5 pt-2.5">
          <div className="flex items-center gap-1.5">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: clrHex,
                boxShadow: `0 0 6px ${clrHex}`,
                animation: "pulse-glow 2s infinite",
              }}
            />
            <span
              className="text-[10px] font-bold uppercase tracking-wide"
              style={{ color: clr }}
            >
              {headerLabel}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {/* Prior-phase badges (e.g. NWB complete) */}
            {prior.map((p) => (
              <span
                key={p.id}
                data-testid={`prior-phase-${p.id}`}
                className="text-[9px] font-bold uppercase tracking-wide rounded px-1.5 py-0.5"
                style={{
                  background: (p.color ?? "#a78bfa") + "18",
                  border: `1px solid ${(p.color ?? "#a78bfa")}44`,
                  color: p.color ?? "#a78bfa",
                }}
                title={`${p.longName} complete · ${p.durationDays}d`}
              >
                {p.name} done
              </span>
            ))}
            <span className="text-[9px] text-text-muted uppercase tracking-wide">
              elapsed
            </span>
          </div>
        </div>

        {/* Time display */}
        <div className="flex items-center justify-center gap-0 px-3.5 pt-2.5 pb-2">
          {t.d > 0 && (
            <>
              <TimeUnit value={t.d.toString()} label="days" color={clrHex} />
              <TimeSep color={clrHex} />
            </>
          )}
          <TimeUnit value={pad(t.h)} label="hrs" color={clrHex} />
          <TimeSep color={clrHex} />
          <TimeUnit value={pad(t.m)} label="min" color={clrHex} />
          <TimeSep color={clrHex} />
          <TimeUnit value={pad(t.s)} label="sec" color={clrHex} />
        </div>

        {/* Progress bar */}
        <div
          className="relative h-1.5"
          style={{ background: "var(--color-border)" }}
        >
          <div
            className="absolute left-0 top-0 h-full rounded-r-sm"
            style={{
              width: pct + "%",
              background: `linear-gradient(90deg, ${clrHex}99, ${clrHex})`,
              boxShadow: `0 0 8px ${clrHex}66`,
              transition: "width 1s linear",
            }}
          />
          {/* Glowing tip */}
          {pct > 0 && pct < 100 && (
            <div
              className="absolute rounded-sm"
              style={{
                top: -1,
                width: 4,
                height: 8,
                background: clrHex,
                boxShadow: `0 0 6px ${clrHex}`,
                left: `calc(${pct}% - 2px)`,
                transition: "left 1s linear",
              }}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-3.5 py-1.5">
          <span className="text-[9px] text-text-muted" />
          <span className="text-[9px] text-text-muted uppercase tracking-wide">
            {pctDisplay} &middot; tap for details
          </span>
          <span className="text-[9px] text-text-muted" />
        </div>
      </div>
      {detailOpen && (
        <ProgressDetailModal
          now={now}
          active={active}
          prior={prior}
          elapsed={elapsed}
          duration={duration}
          progress={progress}
          pct={pct}
          dayNum={dayNum}
          reached={reached}
          clr={clr}
          clrHex={clrHex}
          onClose={() => setDetailOpen(false)}
        />
      )}
    </>
  );
}

// ===== Detail modal =====

interface DetailProps {
  now: Date;
  active: ProgramPhase;
  prior: ProgramPhase[];
  elapsed: number;
  duration: number;
  progress: number;
  pct: number;
  dayNum: number;
  reached: boolean;
  clr: string;
  clrHex: string;
  onClose: () => void;
}

function ProgressDetailModal({
  active,
  prior,
  elapsed,
  pct,
  dayNum,
  reached,
  clr,
  clrHex,
  onClose,
}: DetailProps) {
  const t = fmt(elapsed);
  const startStr = fmtDate(active.startDate);
  const targetEnd = new Date(
    active.startDate.getTime() + active.durationDays * DAY_MS,
  );
  const targetEndStr = fmtDate(targetEnd);

  return (
    <div
      data-testid="progress-detail"
      className="fixed inset-0 z-[220] flex items-end sm:items-center justify-center"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[520px] rounded-t-2xl sm:rounded-2xl overflow-hidden max-h-[90vh] flex flex-col"
        style={{
          background: "var(--color-card)",
          border: `1px solid ${clrHex}55`,
          boxShadow: `0 0 40px ${clrHex}22`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div
            className="w-10 h-1 rounded-full"
            style={{ background: "var(--color-border)" }}
          />
        </div>

        {/* Header */}
        <div
          className="flex items-center justify-between px-4 pt-3 pb-3 border-b"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div className="min-w-0 flex-1">
            <div
              className="text-[10px] font-bold uppercase tracking-wider"
              style={{ color: clr }}
            >
              {active.longName}
            </div>
            <div className="text-sm font-semibold text-text">
              Day {dayNum} of {active.durationDays}
              {reached && " · target reached"}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 rounded-full flex items-center justify-center text-text-muted cursor-pointer text-lg font-bold flex-shrink-0 ml-2"
            style={{
              background: "var(--color-bg)",
              border: "1px solid var(--color-border)",
            }}
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-4 pb-6 pt-3">
          {/* Big number — count-up only */}
          <div
            className="rounded-xl p-3 mb-4"
            style={{
              background: clrHex + "12",
              border: `1px solid ${clrHex}33`,
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: clr }}>
                time in this phase
              </span>
              <span
                className="text-[10px] font-bold rounded px-2 py-1"
                style={{
                  background: clrHex + "22",
                  border: `1px solid ${clrHex}44`,
                  color: clr,
                }}
              >
                {active.name}
              </span>
            </div>
            <div className="flex items-baseline gap-2 tabular-nums" style={{ color: clr }}>
              <span className="text-3xl font-extrabold" style={{ letterSpacing: "-1px" }}>
                {t.d}
              </span>
              <span className="text-[10px] uppercase font-bold text-text-muted">d</span>
              <span className="text-3xl font-extrabold" style={{ letterSpacing: "-1px" }}>
                {pad(t.h)}
              </span>
              <span className="text-[10px] uppercase font-bold text-text-muted">h</span>
              <span className="text-3xl font-extrabold" style={{ letterSpacing: "-1px" }}>
                {pad(t.m)}
              </span>
              <span className="text-[10px] uppercase font-bold text-text-muted">m</span>
              <span className="text-2xl font-bold opacity-70" style={{ letterSpacing: "-1px" }}>
                {pad(t.s)}
              </span>
              <span className="text-[10px] uppercase font-bold text-text-muted">s</span>
            </div>
            <div className="mt-2 text-[11px] text-text-muted">
              Day {dayNum} of {active.durationDays} · {pct}% of phase target
            </div>
          </div>

          {/* Rehab phase history */}
          {prior.length > 0 && (
            <>
              <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">
                Phase history
              </div>
              <div className="space-y-1.5 mb-4">
                {prior.map((p) => {
                  const pColor = p.color ?? "#a78bfa";
                  const pEnd = new Date(
                    p.startDate.getTime() + p.durationDays * DAY_MS,
                  );
                  return (
                    <div
                      key={p.id}
                      data-testid={`prior-phase-card-${p.id}`}
                      className="rounded-xl p-3"
                      style={{
                        background: "var(--color-bg)",
                        border: "1px solid var(--color-border)",
                        opacity: 0.75,
                      }}
                    >
                      <div className="flex items-center gap-2 mb-0.5">
                        <span
                          className="text-[9px] font-extrabold rounded px-1.5 py-0.5"
                          style={{
                            background: pColor + "22",
                            border: `1px solid ${pColor}44`,
                            color: pColor,
                          }}
                        >
                          {p.name}
                        </span>
                        <span className="text-sm font-semibold" style={{ color: pColor }}>
                          {p.longName}
                        </span>
                        <span className="ml-auto text-[10px] text-text-muted">
                          completed
                        </span>
                      </div>
                      <div className="text-[11px] text-text-dim leading-snug">
                        {fmtDate(p.startDate)} → {fmtDate(pEnd)} · {p.durationDays}d
                      </div>
                      {p.desc && (
                        <div className="text-[11px] text-text-dim leading-snug mt-1">
                          {p.desc}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Workout-content phase breakdown (Foundation / Build / Peak / PWB Prep) */}
          <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">
            Workout phases
          </div>
          <div className="space-y-1.5 mb-4">
            {PHASES.map((p) => (
              <div
                key={p.name}
                className="rounded-xl p-3"
                style={{
                  background: "var(--color-bg)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className="text-[9px] font-extrabold rounded px-1.5 py-0.5"
                    style={{
                      background: p.color + "22",
                      border: `1px solid ${p.color}44`,
                      color: p.color,
                    }}
                  >
                    WK {p.weeks}
                  </span>
                  <span className="text-sm font-semibold" style={{ color: p.color }}>
                    {p.name}
                  </span>
                </div>
                <div className="text-[11px] text-text-dim leading-snug">{p.desc}</div>
              </div>
            ))}
          </div>

          {/* Dates + stats */}
          <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">
            Timeline
          </div>
          <div
            className="rounded-xl p-3 grid grid-cols-2 gap-3 text-[11px]"
            style={{
              background: "var(--color-bg)",
              border: "1px solid var(--color-border)",
            }}
          >
            <StatCell label="Phase" value={active.longName} />
            <StatCell label="Status" value={reached ? "target reached" : "active"} />
            <StatCell label="Started" value={startStr} />
            <StatCell label="Target end" value={targetEndStr} />
            <StatCell label="Day" value={`${dayNum} / ${active.durationDays}`} />
            <StatCell label="Progress" value={`${pct}%`} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[9px] text-text-muted uppercase tracking-wider mb-0.5">{label}</div>
      <div className="text-text font-semibold tabular-nums">{value}</div>
    </div>
  );
}

// ===== Sub-components =====

function TimeUnit({
  value,
  label,
  color,
}: {
  value: string;
  label: string;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5 min-w-[46px]">
      <div
        className="text-[28px] font-extrabold leading-none"
        style={{
          fontVariantNumeric: "tabular-nums",
          color: color,
          letterSpacing: "-1px",
        }}
      >
        {value}
      </div>
      <div className="text-[8px] font-bold text-text-muted uppercase tracking-[1.5px]">
        {label}
      </div>
    </div>
  );
}

function TimeSep({ color }: { color: string }) {
  return (
    <div
      className="text-2xl font-light self-start mt-1 leading-none"
      style={{ color: color + "66" }}
    >
      :
    </div>
  );
}
