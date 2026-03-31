"use client";

import React from "react";
import { useSession, signIn, signOut } from "next-auth/react";

export default function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div
        className="w-8 h-8 rounded-full animate-pulse"
        style={{ background: "var(--color-border)" }}
      />
    );
  }

  if (session?.user) {
    return (
      <button
        onClick={() => signOut()}
        className="flex items-center gap-2 rounded-full cursor-pointer min-h-[44px] min-w-[44px] px-1"
        style={{
          background: "none",
          border: "none",
        }}
        title="Sign out"
      >
        {session.user.image ? (
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
