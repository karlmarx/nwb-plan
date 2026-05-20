/**
 * POST /api/sms/verify
 *
 * Body: { code: string }
 *
 * Validates the 6-digit code against the active row in
 * sms_verification_codes (10-minute TTL, max 5 attempts). On success:
 *   - marks nfit_users.phone_verified_at
 *   - deletes the code row
 *   - sends a welcome confirmation SMS
 */
import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import {
  checkAndConsumeCode,
  getNfitUser,
  logSms,
  markVerified,
} from "@/lib/sms-users";
import { sendSms } from "@/lib/twilio";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { code?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const code = typeof body.code === "string" ? body.code.trim() : "";
  if (!/^\d{6}$/.test(code)) {
    return NextResponse.json(
      { error: "Enter the 6-digit code." },
      { status: 400 },
    );
  }

  const result = await checkAndConsumeCode(email, code);
  if (!result.ok) {
    const msg: Record<string, string> = {
      no_code: "No pending verification — request a new code.",
      expired: "Code expired. Request a new one.",
      wrong: "Wrong code. Try again.",
      too_many_attempts: "Too many attempts. Request a new code.",
    };
    return NextResponse.json(
      { error: msg[result.reason] ?? "Verification failed." },
      { status: 400 },
    );
  }

  await markVerified(email);

  // Welcome message after successful verification — completes the opt-in flow
  // and is a sample message we cite in the toll-free verification submission.
  const user = await getNfitUser(email);
  if (user?.phone) {
    const welcome =
      "Welcome to nfit reminders! Workout summaries start with your next training day. Reply STOP to opt out, HELP for help.";
    try {
      const sent = await sendSms(user.phone, welcome);
      await logSms("outbound", user.phone, welcome, "welcome", sent.sid, email);
    } catch (err) {
      // Welcome send is best-effort; verification already succeeded.
      console.error("twilio welcome send failed:", err);
    }
  }

  return NextResponse.json({ ok: true });
}
