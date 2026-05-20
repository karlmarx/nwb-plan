/**
 * POST /api/sms/send-verification
 *
 * Auth: requires a NextAuth session (Google OAuth). The session's
 * `user.email` is the row key in nfit_users.
 *
 * Body: { phone: string, consent: boolean }
 *
 * Side effects:
 *   - normalizes & stages the phone in nfit_users (clears any prior opt-out)
 *   - generates a 6-digit code, stores SHA-256 hash with 10-min TTL
 *   - sends the code via Twilio to the staged phone (uses our toll-free
 *     number — required by the toll-free verification submission)
 *   - audit-logs the outbound message
 */
import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import {
  generateCode,
  logSms,
  stagePhone,
  storeCode,
} from "@/lib/sms-users";
import { normalizePhone, sendSms } from "@/lib/twilio";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { phone?: unknown; consent?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const rawPhone = typeof body.phone === "string" ? body.phone : "";
  const consent = body.consent === true;

  if (!consent) {
    return NextResponse.json(
      { error: "Consent required to receive SMS." },
      { status: 400 },
    );
  }

  const phone = normalizePhone(rawPhone);
  if (!phone) {
    return NextResponse.json(
      { error: "Enter a valid US phone number." },
      { status: 400 },
    );
  }

  await stagePhone(email, phone, true);

  const code = generateCode();
  await storeCode(email, code);

  const body_text = `Your nfit verification code: ${code}. Reply STOP to opt out, HELP for help.`;

  try {
    const sent = await sendSms(phone, body_text);
    await logSms("outbound", phone, body_text, "verification", sent.sid, email);
  } catch (err) {
    // Don't leak Twilio internals to client; log server-side.
    console.error("twilio send-verification failed:", err);
    return NextResponse.json(
      { error: "Could not send code. Try again in a moment." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
