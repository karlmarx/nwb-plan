"use client";

/**
 * HevyImportPanel — Client-side Hevy CSV import UI.
 *
 * Renders inside the Equipment tab. On file selection:
 *   1. Reads and parses the CSV entirely in the browser.
 *   2. Shows a confirmation panel with match/skip counts.
 *   3. "Import" appends parsed sessions to workout-log:sessions.
 *   4. "Cancel" discards the parse result.
 */

import React, { useRef, useState, useCallback } from "react";
import { parseHevyCsv, type HevyImportResult } from "@/lib/hevy-import";
import { loadSessions, saveSessions } from "@/lib/workout-log";

type ImportState =
  | { phase: "idle" }
  | { phase: "parsed"; result: HevyImportResult; filename: string }
  | { phase: "success"; count: number }
  | { phase: "error"; message: string };

export default function HevyImportPanel() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<ImportState>({ phase: "idle" });

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const text = ev.target?.result as string;
          const result = parseHevyCsv(text);
          setState({ phase: "parsed", result, filename: file.name });
        } catch (err) {
          setState({
            phase: "error",
            message:
              err instanceof Error ? err.message : "Failed to parse CSV",
          });
        }
      };
      reader.onerror = () =>
        setState({ phase: "error", message: "Could not read file" });
      reader.readAsText(file);
      // Reset input so same file can be re-selected after cancel
      e.target.value = "";
    },
    [],
  );

  const handleImport = useCallback(() => {
    if (state.phase !== "parsed") return;
    const existing = loadSessions();
    saveSessions([...existing, ...state.result.matched]);
    setState({ phase: "success", count: state.result.matched.length });
  }, [state]);

  const handleCancel = useCallback(() => {
    setState({ phase: "idle" });
  }, []);

  const handleReset = useCallback(() => {
    setState({ phase: "idle" });
  }, []);

  return (
    <div
      style={{
        borderRadius: 12,
        border: "1px solid var(--color-border)",
        background: "var(--color-card)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "12px 14px 10px",
          borderBottom: "1px solid var(--color-border)",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span style={{ fontSize: 16 }}>📥</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text)" }}>
            Import from Hevy
          </div>
          <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: 1 }}>
            Upload a Hevy CSV export to prefill SetTracker weights
          </div>
        </div>
      </div>

      <div style={{ padding: "12px 14px" }}>
        {/* ── IDLE ── */}
        {state.phase === "idle" && (
          <div>
            <div
              style={{
                fontSize: 11,
                color: "var(--color-text-muted)",
                marginBottom: 10,
                lineHeight: 1.5,
              }}
            >
              In Hevy: Profile → Settings → Export Workouts → CSV. Then upload
              below. Parsing is 100% offline — no data leaves your device.
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                display: "block",
                width: "100%",
                padding: "10px 0",
                borderRadius: 8,
                border: "1.5px dashed var(--color-border)",
                background: "transparent",
                color: "var(--color-accent)",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
                letterSpacing: 0.2,
              }}
            >
              Choose .csv file
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </div>
        )}

        {/* ── PARSED — confirmation panel ── */}
        {state.phase === "parsed" && (
          <ParsedPanel
            result={state.result}
            filename={state.filename}
            onImport={handleImport}
            onCancel={handleCancel}
          />
        )}

        {/* ── SUCCESS ── */}
        {state.phase === "success" && (
          <div>
            <div
              style={{
                padding: "10px 12px",
                borderRadius: 8,
                background: "var(--color-safe-bg)",
                border: "1px solid var(--color-safe-border)",
                color: "var(--color-safe)",
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 10,
              }}
            >
              Imported {state.count} workout session
              {state.count !== 1 ? "s" : ""}. Weights will prefill in
              SetTracker.
            </div>
            <button
              onClick={handleReset}
              style={{
                fontSize: 12,
                color: "var(--color-text-muted)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                fontFamily: "inherit",
                textDecoration: "underline",
              }}
            >
              Import another file
            </button>
          </div>
        )}

        {/* ── ERROR ── */}
        {state.phase === "error" && (
          <div>
            <div
              style={{
                padding: "10px 12px",
                borderRadius: 8,
                background: "var(--color-danger-bg, #fee2e2)",
                border: "1px solid var(--color-danger-border, #fca5a5)",
                color: "var(--color-danger, #dc2626)",
                fontSize: 12,
                marginBottom: 10,
              }}
            >
              {state.message}
            </div>
            <button
              onClick={handleReset}
              style={{
                fontSize: 12,
                color: "var(--color-text-muted)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                fontFamily: "inherit",
                textDecoration: "underline",
              }}
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Confirmation sub-panel ────────────────────────────────────────────────────

interface ParsedPanelProps {
  result: HevyImportResult;
  filename: string;
  onImport: () => void;
  onCancel: () => void;
}

function ParsedPanel({ result, filename, onImport, onCancel }: ParsedPanelProps) {
  const [showSkipped, setShowSkipped] = useState(false);

  const matchedExCount = result.matched.reduce(
    (acc, s) => acc + s.exercises.length,
    0,
  );

  return (
    <div>
      {/* Summary line */}
      <div
        style={{
          fontSize: 12,
          color: "var(--color-text-muted)",
          marginBottom: 8,
          wordBreak: "break-all",
        }}
      >
        {filename}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 6,
          marginBottom: 12,
        }}
      >
        <StatChip
          label="Workouts"
          value={result.matched.length}
          color="var(--color-safe)"
        />
        <StatChip
          label="Exercises matched"
          value={matchedExCount}
          color="var(--color-accent)"
        />
        <StatChip
          label="Exercises skipped"
          value={result.skipped.length}
          color={
            result.skipped.length > 0
              ? "var(--color-caution, #f59e0b)"
              : "var(--color-text-muted)"
          }
        />
      </div>

      {/* Skipped list (collapsible) */}
      {result.skipped.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <button
            onClick={() => setShowSkipped((v) => !v)}
            style={{
              fontSize: 11,
              color: "var(--color-text-muted)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "0 0 4px",
              fontFamily: "inherit",
              textDecoration: "underline",
            }}
          >
            {showSkipped ? "Hide" : "Show"} skipped exercises (
            {result.skipped.length})
          </button>
          {showSkipped && (
            <div
              style={{
                borderRadius: 6,
                border: "1px solid var(--color-border)",
                background: "var(--color-bg)",
                padding: "6px 10px",
                maxHeight: 160,
                overflowY: "auto",
              }}
            >
              {result.skipped.map((s) => (
                <div
                  key={s.name}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 11,
                    color: "var(--color-text-muted)",
                    padding: "3px 0",
                    borderBottom: "1px solid var(--color-border)",
                  }}
                >
                  <span style={{ marginRight: 8 }}>{s.name}</span>
                  <span style={{ flexShrink: 0 }}>
                    {s.sets} set{s.sets !== 1 ? "s" : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {result.matched.length === 0 && (
        <div
          style={{
            fontSize: 12,
            color: "var(--color-caution, #f59e0b)",
            marginBottom: 10,
          }}
        >
          No exercises could be matched to the NWB library. Nothing will be
          imported.
        </div>
      )}

      {/* Buttons */}
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={onImport}
          disabled={result.matched.length === 0}
          style={{
            flex: 1,
            padding: "9px 0",
            borderRadius: 8,
            border: "none",
            background:
              result.matched.length === 0
                ? "var(--color-border)"
                : "var(--color-accent)",
            color:
              result.matched.length === 0
                ? "var(--color-text-muted)"
                : "#fff",
            fontSize: 13,
            fontWeight: 700,
            cursor:
              result.matched.length === 0 ? "not-allowed" : "pointer",
            fontFamily: "inherit",
          }}
        >
          Import {result.matched.length > 0 ? result.matched.length : ""}{" "}
          Session{result.matched.length !== 1 ? "s" : ""}
        </button>
        <button
          onClick={onCancel}
          style={{
            padding: "9px 16px",
            borderRadius: 8,
            border: "1px solid var(--color-border)",
            background: "transparent",
            color: "var(--color-text-muted)",
            fontSize: 13,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

interface StatChipProps {
  label: string;
  value: number;
  color: string;
}

function StatChip({ label, value, color }: StatChipProps) {
  return (
    <div
      style={{
        borderRadius: 8,
        border: "1px solid var(--color-border)",
        background: "var(--color-bg)",
        padding: "8px 6px",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 18, fontWeight: 700, color }}>
        {value}
      </div>
      <div
        style={{
          fontSize: 10,
          color: "var(--color-text-muted)",
          marginTop: 2,
          lineHeight: 1.3,
        }}
      >
        {label}
      </div>
    </div>
  );
}
