/**
 * POST /api/sms/inbound — Twilio webhook (application/x-www-form-urlencoded)
 *
 * Twilio invokes this URL when an SMS lands on our toll-free number. Body
 * contains at minimum: From, To, Body, MessageSid, AccountSid.
 *
 * Responsibilities:
 *   - Verify the X-Twilio-Signature header (HMAC-SHA1).
 *   - Recognize STOP/HELP/START keywords (carrier-mandated).
 *   - Update opt-in state in nfit_users and audit-log every inbound.
 *   - Respond with TwiML <Message> for keyword replies — Twilio will deliver
 *     the response automatically over our same toll-free number.
 *
 * Non-keyword inbound bodies are logged as `reply` for future handling
 * (e.g. workout-DONE acknowledgements) but not auto-responded to here.
 */
import { NextRequest, NextResponse } from "next/server";

import {
  findUserByPhone,
  logSms,
  markOptedOut,
} from "@/lib/sms-users";
import { sql } from "@vercel/postgres";
import { verifyTwilioSignature } from "@/lib/twilio";

export const runtime = "nodejs";

const STOP_KEYWORDS = new Set(["STOP", "STOPALL", "UNSUBSCRIBE", "CANCEL", "END", "QUIT"]);
const HELP_KEYWORDS = new Set(["HELP", "INFO"]);
const START_KEYWORDS = new Set(["START", "YES", "UNSTOP"]);

function twiml(message: string | null): string {
  if (!message) {
    return '<?xml version="1.0" encoding="UTF-8"?><Response/>';
  }
  // Escape the bare minimum for XML content. Our message bodies are static
  // English with no XML-significant chars, but defensive: < > & " '
  const safe = message
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
  return `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${safe}</Message></Response>`;
}

function twimlResponse(message: string | null): NextResponse {
  return new NextResponse(twiml(message), {
    status: 200,
    headers: { "Content-Type": "text/xml; charset=utf-8" },
  });
}

export async function POST(request: NextRequest) {
  // Twilio sends form-encoded.
  const form = await request.formData();
  const params: Record<string, string> = {};
  for (const [k, v] of form.entries()) {
    if (typeof v === "string") params[k] = v;
  }

  const signature = request.headers.get("x-twilio-signature");
  // Twilio signs against the URL Twilio called — which is what NextRequest
  // exposes via request.url, after any vercel proxy rewrites.
  const isValid = verifyTwilioSignature(request.url, params, signature);

  // In dev / preview without TWILIO_AUTH_TOKEN we skip signature enforcement
  // so manual curl testing works. Production env always has the token, so
  // any unsigned request is rejected.
  const enforce = !!process.env.TWILIO_AUTH_TOKEN;
  if (enforce && !isValid) {
    return new NextResponse("invalid signature", { status: 403 });
  }

  const from = params.From ?? "";
  const messageSid = params.MessageSid ?? null;
  const rawBody = (params.Body ?? "").trim();
  const keyword = rawBody.toUpperCase();
  const firstWord = keyword.split(/\s+/)[0] ?? "";

  // Find any user owning this phone (for opt-out state + audit linking).
  const user = await findUserByPhone(from);
  const email = user?.email ?? null;

  // STOP — carrier-required immediate unsubscribe.
  if (STOP_KEYWORDS.has(firstWord)) {
    await markOptedOut(from);
    await logSms("inbound", from, rawBody, "stop", messageSid, email);
    const reply =
      "You have been unsubscribed from nfit messages and will not receive any more. Reply START to resubscribe.";
    await logSms("outbound", from, reply, "stop", null, email);
    return twimlResponse(reply);
  }

  // HELP — carrier-required.
  if (HELP_KEYWORDS.has(firstWord)) {
    await logSms("inbound", from, rawBody, "help", messageSid, email);
    const reply =
      "nfit: SMS workout reminders for nfit.93.fyi members. Reply STOP to opt out. Support: karlmarx9193@gmail.com. Terms: nfit.93.fyi/sms-terms.";
    await logSms("outbound", from, reply, "help", null, email);
    return twimlResponse(reply);
  }

  // START / re-subscribe.
  if (START_KEYWORDS.has(firstWord)) {
    if (user) {
      await sql`
        UPDATE nfit_users SET sms_opt_out_at = NULL, updated_at = NOW()
        WHERE phone = ${from}
      `;
    }
    await logSms("inbound", from, rawBody, "start", messageSid, email);
    const reply =
      "Welcome back to nfit. You'll receive workout reminders again. Reply STOP to opt out, HELP for help.";
    await logSms("outbound", from, reply, "start", null, email);
    return twimlResponse(reply);
  }

  // Non-keyword inbound — just log. (Future: dispatch DONE/SKIP/QUESTION
  // replies into the workout-session log.)
  await logSms("inbound", from, rawBody, "reply", messageSid, email);
  return twimlResponse(null);
}
