import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — nfit",
  description:
    "How nfit (nfit.93.fyi) collects, stores, and uses information including phone numbers for SMS verification and workout reminders.",
};

const LAST_UPDATED = "2026-05-13";

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 text-zinc-100">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Privacy Policy</h1>
      <p className="text-sm text-zinc-400 mb-8">Last updated: {LAST_UPDATED}</p>

      <section className="space-y-4 mb-10">
        <h2 className="text-xl font-semibold">Who we are</h2>
        <p>
          <strong>nfit</strong> is a personal-fitness training-plan progressive
          web app operated by Karl Marx (karlmarx9193@gmail.com) at{" "}
          <a href="https://nfit.93.fyi" className="underline">
            nfit.93.fyi
          </a>
          . This policy describes what information nfit collects from its
          members and how it is used.
        </p>
      </section>

      <section className="space-y-4 mb-10">
        <h2 className="text-xl font-semibold">What we collect</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Account info</strong> — name and email, provided by Google
            when you sign in via Google OAuth.
          </li>
          <li>
            <strong>Phone number (optional)</strong> — if you choose to enable
            SMS workout reminders, we collect your phone number and a timestamp
            of your consent.
          </li>
          <li>
            <strong>Workout data</strong> — exercises, sets, reps, and
            equipment context you log inside the app.
          </li>
          <li>
            <strong>Server logs</strong> — standard request metadata (IP,
            user-agent, timestamps) used for security and debugging.
          </li>
        </ul>
      </section>

      <section className="space-y-4 mb-10">
        <h2 className="text-xl font-semibold">How we use phone numbers</h2>
        <p>
          If you provide a phone number, we use it strictly to:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            Send a one-time verification code to confirm the number belongs to
            you.
          </li>
          <li>
            Send workout-session reminders and program updates, if you opted
            in.
          </li>
          <li>
            Honor inbound <code>STOP</code>, <code>HELP</code>, and{" "}
            <code>START</code> keywords as required by US carrier rules.
          </li>
        </ul>
        <p>
          <strong>We do not share, sell, rent, or lease your phone number</strong>{" "}
          to any third party. Your phone number is not used for advertising,
          marketing analytics, or anything other than the SMS service described
          here.
        </p>
        <p>
          Mobile information (phone number and consent state) is{" "}
          <strong>not shared with third parties or affiliates</strong> for
          marketing or promotional purposes. Information sharing to subcontractors
          to support the SMS service (such as Twilio for message delivery) is
          permitted; subcontractors are bound to use this information only for
          the purpose of delivering the service.
        </p>
      </section>

      <section className="space-y-4 mb-10">
        <h2 className="text-xl font-semibold">How to opt out</h2>
        <p>
          Reply <code>STOP</code> to any SMS from us at any time to immediately
          stop further messages. Reply <code>HELP</code> for help. You can also
          remove your phone number from the account settings page after sign-in.
        </p>
      </section>

      <section className="space-y-4 mb-10">
        <h2 className="text-xl font-semibold">Where data is stored</h2>
        <p>
          Application data is stored on Vercel-hosted Postgres (Neon). All
          traffic is encrypted in transit (HTTPS) and at rest. Phone numbers
          are stored in the standard E.164 format; verification codes are
          hashed and expire after 10 minutes.
        </p>
      </section>

      <section className="space-y-4 mb-10">
        <h2 className="text-xl font-semibold">Retention &amp; deletion</h2>
        <p>
          Email karlmarx9193@gmail.com to request deletion of your account or
          phone number. We will remove account-linked data within 30 days of
          the request, except for transaction logs we are required to retain
          for carrier compliance (these are retained for 18 months, then
          deleted).
        </p>
      </section>

      <section className="space-y-4 mb-10">
        <h2 className="text-xl font-semibold">Children</h2>
        <p>
          nfit is not intended for users under 18. We do not knowingly collect
          information from anyone under 18.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Contact</h2>
        <p>
          Privacy questions or removal requests:{" "}
          <a href="mailto:karlmarx9193@gmail.com" className="underline">
            karlmarx9193@gmail.com
          </a>
          . See also our{" "}
          <a href="/sms-terms" className="underline">
            SMS terms
          </a>
          .
        </p>
      </section>
    </main>
  );
}
