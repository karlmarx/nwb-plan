"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import {
  loadSyncState,
  syncWorkoutSessions,
  type SyncState,
} from "@/lib/workout-sync";

export default function AuthButton() {
  const { data: session, status } = useSession();
  const [syncState, setSyncState] = useState<SyncState>(() => loadSyncState());
  const didInitialSync = useRef(false);

  // First successful auth → run a full pull-merge-push.
  useEffect(() => {
    if (status !== "authenticated" || didInitialSync.current) return;
    didInitialSync.current = true;
    syncWorkoutSessions().then(() => setSyncState(loadSyncState()));
  }, [status]);

  // Refresh the indicator periodically (cheap localStorage read).
  useEffect(() => {
    if (status !== "authenticated") return;
    const t = setInterval(() => setSyncState(loadSyncState()), 5000);
    return () => clearInterval(t);
  }, [status]);

  if (status === "loading") {
    return (
      <div
        className="w-8 h-8 rounded-full animate-pulse"
        style={{ background: "var(--color-border)" }}
      />
    );
  }

  if (session?.user) {
    const dotColor = syncState.lastError
      ? "#ef4444"
      : syncState.inFlight
        ? "#f59e0b"
        : syncState.lastSyncAt > 0
          ? "#10b981"
          : "var(--color-border)";
    const tooltip = syncState.lastError
      ? `Sync error: ${syncState.lastError}`
      : syncState.inFlight
        ? "Syncing…"
        : syncState.lastSyncAt > 0
          ? `Last sync ${new Date(syncState.lastSyncAt).toLocaleTimeString()}`
          : "Not yet synced";
    return (
      <button
        onClick={() => signOut()}
        className="relative flex items-center gap-2 rounded-full cursor-pointer min-h-[44px] min-w-[44px] px-1"
        style={{
          background: "none",
          border: "none",
        }}
        title={`Sign out — ${tooltip}`}
      >
        {session.user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={session.user.image}
            alt={session.user.name ?? "User avatar"}
            className="w-8 h-8 rounded-full"
            style={{ border: "2px solid var(--color-accent)" }}
            referrerPolicy="no-referrer"
          />
        ) : (
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
            style={{
              background: "var(--color-accent-dim)",
              color: "var(--color-accent)",
              border: "2px solid var(--color-accent)",
            }}
          >
            {(session.user.name ?? "U")[0].toUpperCase()}
          </div>
        )}
        <span
          aria-label={tooltip}
          className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full"
          style={{
            background: dotColor,
            border: "2px solid var(--color-bg)",
          }}
        />
      </button>
    );
  }

  return (
    <button
      onClick={() => signIn("google")}
      className="rounded-lg text-xs font-semibold cursor-pointer font-[inherit] min-h-[44px] px-3"
      style={{
        background: "var(--color-card)",
        color: "var(--color-text-dim)",
        border: "1px solid var(--color-border)",
      }}
    >
      Sign in
    </button>
  );
}
