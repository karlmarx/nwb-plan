"use client";

import React, { useState, useEffect } from "react";
import Badge from "@/components/badge";

interface Suggestion {
  name: string;
  category: "core" | "left_leg" | "mobility";
  description: string;
  sets_reps: string;
  setup_cues: string[];
  safety_cues: string[];
  equipment_rationale: string;
  safety_rationale: string;
}

interface SuggestionCardProps {
  suggestion: Suggestion | null;
  loading: boolean;
  onRefresh: () => void;
  onSave: () => void;
  saved: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  core: "#38bdf8",
  left_leg: "#10b981",
  mobility: "#a78bfa",
};

export default function SuggestionCard({
  suggestion,
  loading,
  onRefresh,
  onSave,
  saved,
}: SuggestionCardProps) {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
    }
    function handleOffline() {
      setIsOnline(false);
    }

    setIsOnline(navigator.onLine);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Loading skeleton
  if (loading) {
    return (
      <div
        className="rounded-xl p-4 border"
        style={{
          background: "var(--color-card)",
          borderColor: "var(--color-border)",
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <div
            className="h-4 w-20 rounded animate-pulse"
            style={{ background: "var(--color-border)" }}
          />
          <div
            className="h-4 w-12 rounded animate-pulse"
            style={{ background: "var(--color-border)" }}
          />
        </div>
        <div
          className="h-3 w-full rounded animate-pulse mb-2"
          style={{ background: "var(--color-border)" }}
        />
        <div
          className="h-3 w-3/4 rounded animate-pulse mb-2"
          style={{ background: "var(--color-border)" }}
        />
        <div
          className="h-3 w-1/2 rounded animate-pulse mb-4"
          style={{ background: "var(--color-border)" }}
        />
        <div className="flex gap-2">
          <div
            className="h-9 w-24 rounded-lg animate-pulse"
            style={{ background: "var(--color-border)" }}
          />
          <div
            className="h-9 w-24 rounded-lg animate-pulse"
            style={{ background: "var(--color-border)" }}
          />
        </div>
      </div>
    );
  }

  // No suggestion yet
  if (!suggestion) {
    return null;
  }

  const catColor = CATEGORY_COLORS[suggestion.category] ?? "#38bdf8";

  return (
    <div
      className="rounded-xl p-4 border"
      style={{
        background: "var(--color-card)",
        borderColor: "var(--color-border)",
      }}
    >
      {/* Header with badge */}
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className="text-sm font-bold text-text">{suggestion.name}</span>
        <Badge color={catColor}>{suggestion.category.replace("_", " ")}</Badge>
      </div>

      {/* Description */}
      <p className="text-xs text-text-dim leading-relaxed mb-3">
        {suggestion.description}
      </p>

      {/* Sets/reps */}
      <div className="text-[11px] mb-3">
        <span className="text-text-muted uppercase font-bold mr-2">
          Sets/Reps
        </span>
        <span className="text-accent font-semibold font-mono">
          {suggestion.sets_reps}
        </span>
      </div>

      {/* Setup cues */}
      {suggestion.setup_cues.length > 0 && (
        <div className="mb-3">
          <div className="text-[10px] text-text-muted uppercase font-bold mb-1">
            Setup
          </div>
          <ul className="list-none p-0 m-0">
            {suggestion.setup_cues.map((cue, i) => (
              <li
                key={i}
                className="text-[11px] text-text-dim leading-relaxed pl-3 relative before:content-['\u2022'] before:absolute before:left-0 before:text-accent"
              >
                {cue}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Safety rationale */}
      {suggestion.safety_rationale && (
        <div className="mb-3">
          <div className="text-[10px] text-text-muted uppercase font-bold mb-1">
            Safety
          </div>
          <p className="text-[11px] text-text-dim leading-relaxed">
            {suggestion.safety_rationale}
          </p>
        </div>
      )}

      {/* Offline indicator */}
      {!isOnline && (
        <div
          className="text-[10px] px-2 py-1 rounded mb-3 inline-block"
          style={{
            background: "var(--color-warning-bg)",
            color: "var(--color-warning)",
            border: "1px solid var(--color-warning-border)",
          }}
        >
          {"\u{1F4F4}"} Offline &mdash; cached suggestion
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={onRefresh}
          disabled={!isOnline}
          className="rounded-lg text-xs font-semibold cursor-pointer font-[inherit] min-h-[44px] px-4 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: "var(--color-accent)" + "22",
            color: "var(--color-accent)",
            border: "1px solid var(--color-accent)" + "44",
          }}
        >
          {"\u{1F504}"} Refresh
        </button>
        <button
          onClick={onSave}
          className="rounded-lg text-xs font-semibold cursor-pointer font-[inherit] min-h-[44px] px-4"
          style={{
            background: saved
              ? "var(--color-safe-bg)"
              : "var(--color-accent)" + "22",
            color: saved ? "var(--color-safe)" : "var(--color-accent)",
            border: `1px solid ${saved ? "var(--color-safe-border)" : "var(--color-accent)" + "44"}`,
          }}
        >
          {saved ? "\u{1F4CC} Pinned" : "\u{1F4BE} Save"}
        </button>
      </div>
    </div>
  );
}
