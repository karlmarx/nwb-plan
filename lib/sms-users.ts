/**
 * SMS-opt-in user state. Keyed on the email NextAuth's session provides.
 *
 * Why this file (vs co-locating with the SMS API routes): the auth callback
 * and the SMS routes both need to read/write the same `nfit_users` rows.
 * Putting the queries here keeps the SQL in one place.
 */

import { createHash, randomInt } from "crypto";

import { sql } from "@vercel/postgres";

// ---- types ---------------------------------------------------------------

export interface NfitUser {
  email: string;
  phone: string | null;
  phoneVerifiedAt: string | null;
  smsConsentAt: string | null;
  smsOptOutAt: string | null;
}

// ---- queries -------------------------------------------------------------

export async function getNfitUser(email: string): Promise<NfitUser | null> {
  const { rows } = await sql<{
    email: string;
    phone: string | null;
    phone_verified_at: string | null;
    sms_consent_at: string | null;
    sms_opt_out_at: string | null;
  }>`
    SELECT email, phone, phone_verified_at, sms_consent_at, sms_opt_out_at
    FROM nfit_users
    WHERE email = ${email}
    LIMIT 1
  `;
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    email: r.email,
    phone: r.phone,
    phoneVerifiedAt: r.phone_verified_at,
    smsConsentAt: r.sms_consent_at,
    smsOptOutAt: r.sms_opt_out_at,
  };
}

export async function findUserByPhone(phone: string): Promise<NfitUser | null> {
  const { rows } = await sql<{
    email: string;
    phone: string | null;
    phone_verified_at: string | null;
    sms_consent_at: string | null;
    sms_opt_out_at: string | null;
  }>`
    SELECT email, phone, phone_verified_at, sms_consent_at, sms_opt_out_at
    FROM nfit_users
    WHERE phone = ${phone}
    LIMIT 1
  `;
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    email: r.email,
    phone: r.phone,
    phoneVerifiedAt: r.phone_verified_at,
    smsConsentAt: r.sms_consent_at,
    smsOptOutAt: r.sms_opt_out_at,
  };
}

/**
 * Stage a phone + consent for verification. Does NOT mark verified yet —
 * /api/sms/verify does that after the code is confirmed.
 */
export async function stagePhone(
  email: string,
  phone: string,
  consentTicked: boolean,
): Promise<void> {
  await sql`
    INSERT INTO nfit_users (email, phone, sms_consent_at)
    VALUES (
      ${email},
      ${phone},
      ${consentTicked ? new Date().toISOString() : null}
    )
    ON CONFLICT (email) DO UPDATE SET
      phone = EXCLUDED.phone,
      sms_consent_at = COALESCE(EXCLUDED.sms_consent_at, nfit_users.sms_consent_at),
      sms_opt_out_at = NULL,
      updated_at = NOW()
  `;
}

export async function markVerified(email: string): Promise<void> {
  await sql`
    UPDATE nfit_users
    SET phone_verified_at = NOW(), updated_at = NOW()
    WHERE email = ${email}
  `;
}

export async function markOptedOut(phone: string): Promise<void> {
  await sql`
    UPDATE nfit_users
    SET sms_opt_out_at = NOW(), updated_at = NOW()
    WHERE phone = ${phone}
  `;
}

// ---- verification codes --------------------------------------------------

export function generateCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

function hashCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

const CODE_TTL_MIN = 10;
const MAX_ATTEMPTS = 5;

export async function storeCode(email: string, code: string): Promise<void> {
  const hash = hashCode(code);
  const expires = new Date(Date.now() + CODE_TTL_MIN * 60_000).toISOString();
  await sql`
    INSERT INTO sms_verification_codes (email, code_hash, expires_at, attempts)
    VALUES (${email}, ${hash}, ${expires}, 0)
    ON CONFLICT (email) DO UPDATE SET
      code_hash = EXCLUDED.code_hash,
      expires_at = EXCLUDED.expires_at,
      attempts = 0,
      created_at = NOW()
  `;
}

export type VerifyResult =
  | { ok: true }
  | { ok: false; reason: "no_code" | "expired" | "wrong" | "too_many_attempts" };

export async function checkAndConsumeCode(
  email: string,
  submitted: string,
): Promise<VerifyResult> {
  const submittedHash = hashCode(submitted);
  const { rows } = await sql<{
    code_hash: string;
    expires_at: string;
    attempts: number;
  }>`
    SELECT code_hash, expires_at, attempts
    FROM sms_verification_codes
    WHERE email = ${email}
    LIMIT 1
  `;
  if (rows.length === 0) return { ok: false, reason: "no_code" };
  const r = rows[0];
  if (r.attempts >= MAX_ATTEMPTS) return { ok: false, reason: "too_many_attempts" };
  if (new Date(r.expires_at).getTime() < Date.now()) {
    return { ok: false, reason: "expired" };
  }
  if (r.code_hash !== submittedHash) {
    await sql`
      UPDATE sms_verification_codes
      SET attempts = attempts + 1
      WHERE email = ${email}
    `;
    return { ok: false, reason: "wrong" };
  }
  // Single-use: delete on success.
  await sql`DELETE FROM sms_verification_codes WHERE email = ${email}`;
  return { ok: true };
}

// ---- audit log -----------------------------------------------------------

type SmsKind =
  | "verification"
  | "welcome"
  | "reminder"
  | "reply"
  | "stop"
  | "help"
  | "start"
  | "unknown";

export async function logSms(
  direction: "outbound" | "inbound",
  phone: string,
  body: string,
  kind: SmsKind,
  twilioSid: string | null,
  email: string | null,
): Promise<void> {
  await sql`
    INSERT INTO sms_messages (email, phone, direction, kind, body, twilio_sid)
    VALUES (${email}, ${phone}, ${direction}, ${kind}, ${body}, ${twilioSid})
  `;
}
