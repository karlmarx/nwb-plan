"use client";

import { useState } from "react";

interface Props {
  email: string | null;
  alreadyVerified: boolean;
  existingPhone: string | null;
}

type Stage = "phone" | "code" | "done";

export function OnboardPhoneForm({ email, alreadyVerified, existingPhone }: Props) {
  const [stage, setStage] = useState<Stage>(alreadyVerified ? "done" : "phone");
  const [phone, setPhone] = useState(existingPhone ?? "");
  const [consent, setConsent] = useState(false);
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signedIn = !!email;

  if (stage === "done") {
    return (
      <div className="rounded border border-emerald-700 bg-emerald-950 p-4 text-sm">
        <p className="font-semibold">✓ Phone verified.</p>
        <p className="mt-1 text-emerald-200">
          You&apos;ll start receiving workout reminders on the schedule of your
          training program. Reply <code>STOP</code> to any message to opt out.
        </p>
        <a
          href="/"
          className="mt-3 inline-block rounded bg-emerald-700 px-3 py-1 text-white"
        >
          Continue to nfit
        </a>
      </div>
    );
  }

  async function submitPhone(e: React.FormEvent) {
    e.preventDefault();
    if (!signedIn) {
      setError("Sign in with Google to send a verification code.");
      return;
    }
    if (!consent) {
      setError("Please tick the consent checkbox to continue.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/sms/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, consent }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not send verification code.");
        return;
      }
      setStage("code");
    } finally {
      setSubmitting(false);
    }
  }

  async function submitCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/sms/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Verification failed. Try again.");
        return;
      }
      setStage("done");
    } finally {
      setSubmitting(false);
    }
  }

  if (stage === "code") {
    return (
      <form onSubmit={submitCode} className="space-y-4">
        <p className="text-sm text-zinc-300">
          We texted a 6-digit code to <strong>{phone}</strong>. Enter it below
          to confirm.
        </p>
        <input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          required
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/[^\d]/g, ""))}
          className="w-full rounded border border-zinc-700 bg-zinc-900 p-3 text-center text-2xl tracking-[0.5em] font-mono"
          placeholder="000000"
        />
        {error && (
          <p className="text-sm text-rose-400">{error}</p>
        )}
        <button
          type="submit"
          disabled={submitting || code.length !== 6}
          className="w-full rounded bg-emerald-600 px-4 py-3 font-semibold text-white disabled:opacity-50"
        >
          {submitting ? "Verifying…" : "Verify"}
        </button>
        <button
          type="button"
          onClick={() => { setStage("phone"); setCode(""); }}
          className="block w-full text-center text-xs text-zinc-400 underline"
        >
          ← Change phone number
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={submitPhone} className="space-y-4">
      {!signedIn && (
        <div className="rounded border border-amber-700 bg-amber-950 p-3 text-sm text-amber-200">
          <a href="/api/auth/signin" className="font-semibold underline">
            Sign in with Google
          </a>{" "}
          to send a verification code.
        </div>
      )}
      <label className="block">
        <span className="text-sm text-zinc-300">Mobile phone (US)</span>
        <input
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="mt-1 w-full rounded border border-zinc-700 bg-zinc-900 p-3 text-lg"
          placeholder="+1 555 555 1212"
        />
      </label>

      <label className="flex items-start gap-3 text-xs text-zinc-300">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-1 h-5 w-5 shrink-0"
        />
        <span>
          I agree to receive recurring workout-reminder SMS messages from nfit
          at the number above. Message frequency varies. Msg &amp; data rates
          may apply. Reply <code>STOP</code> to cancel,{" "}
          <code>HELP</code> for help.
        </span>
      </label>

      {error && (
        <p className="text-sm text-rose-400">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting || !phone || !consent || !signedIn}
        className="w-full rounded bg-emerald-600 px-4 py-3 font-semibold text-white disabled:opacity-50"
      >
        {submitting ? "Sending…" : "Send verification code"}
      </button>

      <a
        href="/"
        className="block text-center text-xs text-zinc-400 underline"
      >
        Skip for now — I&apos;ll set this up later
      </a>
    </form>
  );
}
