"use client";

import React, { useState, useEffect } from "react";
import { PROG_START, PROG_DURATION } from "@/lib/program";
import { PHASES } from "@/lib/exercises";

const PROG_END = new Date(PROG_START.getTime() + PROG_DURATION);
const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

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

export default function ProgressClock({ compact }: { compact?: boolean } = {}) {
  const [now, setNow] = useState(() => new Date());
  const [countdown, setCountdown] = useState(false);
  const [flash, setFlash] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

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

  const elapsed = now.getTime() - PROG_START.getTime();
  const remaining = PROG_END.getTime() - now.getTime();
  const progress = Math.min(1, Math.max(0, elapsed / PROG_DURATION));
  const pct = Math.round(progress * 100);
  const weekNum = Math.min(6, Math.floor(elapsed / WEEK_MS) + 1);
  const totalDayNum = Math.min(42, Math.floor(elapsed / DAY_MS) + 1);
  const daysRemaining = Math.max(0, Math.ceil(remaining / DAY_MS));

  const t = fmt(countdown ? remaining : elapsed);

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

  const pctDisplay = countdown
    ? 100 - pct + "% remaining"
    : pct + "% complete";

  function openDetail() {
    if (minimized) setMinimized(false);
    setDetailOpen(true);
  }

  function flashToggle(e: React.MouseEvent) {
    e.stopPropagation();
    setCountdown((v) => !v);
    setFlash(true);
    setTimeout(() => setFlash(false), 300);
  }

  // ===== COMPACT RING (v2) =====
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
          title={`${countdown ? "Remaining" : "Elapsed"}: ${t.d}d ${pad(t.h)}h ${pad(t.m)}m · ${pctDisplay} · tap for details`}
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
              W{weekNum}
            </span>
            <span className="text-[8px] font-bold text-text-muted leading-none mt-0.5">
              D{totalDayNum}
            </span>
          </div>
        </div>
        {detailOpen && (
          <ProgressDetailModal
            now={now}
            elapsed={elapsed}
            remaining={remaining}
            progress={progress}
            pct={pct}
            weekNum={weekNum}
            totalDayNum={totalDayNum}
            daysRemaining={daysRemaining}
            countdown={countdown}
            setCountdown={setCountdown}
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
            W{weekNum} &middot; D{totalDayNum}
          </span>
          <span
            className="text-[11px] text-text-muted tabular-nums"
          >
            {t.d > 0
              ? t.d + "d " + pad(t.h) + "h " + pad(t.m) + "m"
              : pad(t.h) + ":" + pad(t.m) + ":" + pad(t.s)}
            {" \u00B7 "}
            {pctDisplay}
          </span>
          <span className="text-[10px] text-text-muted">{"\u24D8"}</span>
        </div>
        {detailOpen && (
          <ProgressDetailModal
            now={now}
            elapsed={elapsed}
            remaining={remaining}
            progress={progress}
            pct={pct}
            weekNum={weekNum}
            totalDayNum={totalDayNum}
            daysRemaining={daysRemaining}
            countdown={countdown}
            setCountdown={setCountdown}
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
              {progress >= 1
                ? "Program Complete"
                : `Week ${weekNum} \u00B7 Day ${totalDayNum} of 42`}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] text-text-muted uppercase tracking-wide">
              {countdown ? "remaining" : "elapsed"}
            </span>
            <button
              data-testid="progress-toggle"
              onClick={flashToggle}
              aria-label="Toggle elapsed / remaining"
              className="rounded text-[9px] font-bold cursor-pointer font-[inherit]"
              style={{
                padding: "2px 7px",
                background: clrHex + "22",
                border: `1px solid ${clrHex}44`,
                color: clr,
              }}
            >
              {countdown ? "\u2193" : "\u2191"}
            </button>
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
          elapsed={elapsed}
          remaining={remaining}
          progress={progress}
          pct={pct}
          weekNum={weekNum}
          totalDayNum={totalDayNum}
          daysRemaining={daysRemaining}
          countdown={countdown}
          setCountdown={setCountdown}
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
  elapsed: number;
  remaining: number;
  progress: number;
  pct: number;
  weekNum: number;
  totalDayNum: number;
  daysRemaining: number;
  countdown: boolean;
  setCountdown: (v: boolean | ((prev: boolean) => boolean)) => void;
  clr: string;
  clrHex: string;
  onClose: () => void;
}

function ProgressDetailModal({
  elapsed,
  remaining,
  pct,
  weekNum,
  totalDayNum,
  daysRemaining,
  countdown,
  setCountdown,
  clr,
  clrHex,
  onClose,
}: DetailProps) {
  const t = fmt(countdown ? remaining : elapsed);
  const startStr = fmtDate(PROG_START);
  const endStr = fmtDate(PROG_END);

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
              Femur Fracture Fitness
            </div>
            <div className="text-sm font-semibold text-text">
              Week {weekNum} &middot; Day {totalDayNum} of 42
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
          {/* Big number + toggle */}
          <div
            className="rounded-xl p-3 mb-4"
            style={{
              background: clrHex + "12",
              border: `1px solid ${clrHex}33`,
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: clr }}>
                {countdown ? "time remaining" : "time elapsed"}
              </span>
              <button
                onClick={() => setCountdown((v) => !v)}
                className="rounded text-[10px] font-bold cursor-pointer font-[inherit] px-2 py-1"
                style={{
                  background: clrHex + "22",
                  border: `1px solid ${clrHex}44`,
                  color: clr,
                }}
              >
                Show {countdown ? "elapsed" : "remaining"}
              </button>
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
              {countdown
                ? `${daysRemaining} days left · ${100 - pct}% remaining`
                : `Day ${totalDayNum} of 42 · ${pct}% complete`}
            </div>
          </div>

          {/* Phase breakdown */}
          <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">
            Phases
          </div>
          <div className="space-y-1.5 mb-4">
            {PHASES.map((p, i) => {
              const weekStart = i * 2 + 1;
              const weekEnd = weekStart + 1;
              const isCurrent = weekNum >= weekStart && weekNum <= weekEnd;
              const isPast = weekNum > weekEnd;
              return (
                <div
                  key={p.name}
                  className="rounded-xl p-3"
                  style={{
                    background: isCurrent ? p.color + "18" : "var(--color-bg)",
                    border: `1px solid ${isCurrent ? p.color + "66" : "var(--color-border)"}`,
                    opacity: isPast ? 0.55 : 1,
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
                    {isCurrent && (
                      <span className="ml-auto text-[10px] font-bold" style={{ color: p.color }}>
                        ● current
                      </span>
                    )}
                    {isPast && (
                      <span className="ml-auto text-[10px] text-text-muted">done</span>
                    )}
                  </div>
                  <div className="text-[11px] text-text-dim leading-snug">{p.desc}</div>
                </div>
              );
            })}
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
            <StatCell label="Start" value={startStr} />
            <StatCell label="End" value={endStr} />
            <StatCell label="Days done" value={`${totalDayNum} / 42`} />
            <StatCell label="Days left" value={`${daysRemaining}`} />
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
