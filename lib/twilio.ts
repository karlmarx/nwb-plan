/**
 * Thin Twilio Programmable Messaging wrapper. No SDK — bare `fetch` against
 * the REST API to keep the bundle small and edge-runtime compatible.
 *
 * We use Programmable Messaging (not the Verify API) so the verification
 * code goes out through our own toll-free number — that's what gives the
 * toll-free verification submission proof-of-use.
 *
 * Env reads happen at call time (not module init) so `next build` works
 * in CI environments where the Twilio env vars aren't populated.
 */

import { createHmac, timingSafeEqual } from "crypto";

const TWILIO_API = "https://api.twilio.com/2010-04-01";

interface TwilioConfig {
  sid: string;
  token: string;
  from: string;
}

function readConfig(): TwilioConfig {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  if (!sid || !token || !from) {
    throw new Error(
      "Twilio not configured: set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER"
    );
  }
  return { sid, token, from };
}

export interface SendSmsResult {
  sid: string;
  status: string;
}

export async function sendSms(to: string, body: string): Promise<SendSmsResult> {
  const { sid, token, from } = readConfig();
  const auth = Buffer.from(`${sid}:${token}`).toString("base64");
  const params = new URLSearchParams({ From: from, To: to, Body: body });

  const res = await fetch(`${TWILIO_API}/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`twilio send failed: ${res.status} ${errText.slice(0, 300)}`);
  }

  const data = (await res.json()) as { sid: string; status: string };
  return { sid: data.sid, status: data.status };
}

/**
 * Validate the X-Twilio-Signature header on an inbound webhook request.
 *
 * Twilio signs requests with HMAC-SHA1 over (full request URL || sorted
 * concatenated param keys+values). We re-derive and compare in constant
 * time. Returns false if env isn't configured (caller decides whether to
 * reject or pass through).
 *
 * See: https://www.twilio.com/docs/usage/webhooks/webhooks-security
 */
export function verifyTwilioSignature(
  fullUrl: string,
  params: Record<string, string>,
  signatureHeader: string | null,
): boolean {
  if (!signatureHeader) return false;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!token) return false;

  const sortedKeys = Object.keys(params).sort();
  const data = fullUrl + sortedKeys.map((k) => k + params[k]).join("");
  const expected = createHmac("sha1", token).update(data).digest("base64");

  const a = Buffer.from(expected);
  const b = Buffer.from(signatureHeader);
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/** E.164 normalize: strip spaces / dashes / parens; prepend +1 if 10 digits. */
export function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) {
    return digits.length >= 11 && digits.length <= 16 ? digits : null;
  }
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return null;
}
