import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SMS Terms — nfit",
  description:
    "Terms and disclosures for the nfit SMS phone-verification and workout-reminder service.",
};

const LAST_UPDATED = "2026-05-13";

export default function SmsTermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 text-zinc-100">
      <h1 className="text-3xl font-bold tracking-tight mb-2">SMS Terms</h1>
      <p className="text-sm text-zinc-400 mb-8">Last updated: {LAST_UPDATED}</p>

      <section className="space-y-4 mb-10">
        <h2 className="text-xl font-semibold">Program description</h2>
        <p>
          The nfit SMS program (the &quot;Service&quot;) delivers two kinds of
          text messages to phone numbers verified by their owners through the
          nfit.93.fyi onboarding flow:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Account verification.</strong> A one-time 6-digit
            verification code sent immediately after you submit your phone
            number on{" "}
            <a href="/onboard/phone" className="underline">
              /onboard/phone
            </a>
            .
          </li>
          <li>
            <strong>Workout reminders.</strong> Recurring messages summarizing
            your current day&apos;s workout plan, sent on the schedule defined
            in your training program (typically one message per training day).
          </li>
        </ul>
      </section>

      <section className="space-y-4 mb-10">
        <h2 className="text-xl font-semibold">Message frequency</h2>
        <p>
          Message frequency varies. For a typical training program member: one
          (1) verification code at sign-up, one (1) welcome message, and up to
          six (6) workout-reminder messages per week.
        </p>
      </section>

      <section className="space-y-4 mb-10">
        <h2 className="text-xl font-semibold">Cost</h2>
        <p>
          <strong>Msg &amp; data rates may apply.</strong> nfit does not charge
          for these messages, but your carrier may charge you for the messages
          you send and receive depending on your plan.
        </p>
      </section>

      <section className="space-y-4 mb-10">
        <h2 className="text-xl font-semibold">Opt-out (STOP)</h2>
        <p>
          You can cancel the Service at any time by texting{" "}
          <code>STOP</code> to the nfit number. After you send <code>STOP</code>{" "}
          we will not send any more messages, and you will receive a single
          confirmation message acknowledging the opt-out.
        </p>
        <p>
          To re-subscribe later, text <code>START</code> to the same number, or
          visit{" "}
          <a href="/onboard/phone" className="underline">
            /onboard/phone
          </a>{" "}
          while signed in.
        </p>
      </section>

      <section className="space-y-4 mb-10">
        <h2 className="text-xl font-semibold">Help (HELP)</h2>
        <p>
          Text <code>HELP</code> at any time to get a help reply with this
          page&apos;s URL and the email{" "}
          <a href="mailto:karlmarx9193@gmail.com" className="underline">
            karlmarx9193@gmail.com
          </a>{" "}
          for support.
        </p>
      </section>

      <section className="space-y-4 mb-10">
        <h2 className="text-xl font-semibold">Supported carriers</h2>
        <p>
          The Service is delivered via Twilio over the major US wireless
          carriers including AT&amp;T, Verizon Wireless, T-Mobile, Sprint, US
          Cellular, MetroPCS, Boost Mobile, Cricket Wireless, and most regional
          and pre-paid carriers. Carriers are not liable for delayed or
          undelivered messages.
        </p>
      </section>

      <section className="space-y-4 mb-10">
        <h2 className="text-xl font-semibold">Eligibility</h2>
        <p>
          The Service is available to nfit.93.fyi members who are 18 years or
          older and have a US phone number on a supported carrier. By providing
          your phone number you confirm you are the owner or authorized user of
          the number.
        </p>
      </section>

      <section className="space-y-4 mb-10">
        <h2 className="text-xl font-semibold">Consent &amp; data</h2>
        <p>
          We will only send SMS to numbers that have completed both: (1) the
          phone-verification step (a one-time code is sent and you enter it
          back on the website to prove ownership of the number), and (2) the
          consent checkbox at{" "}
          <a href="/onboard/phone" className="underline">
            /onboard/phone
          </a>
          . Mobile information (your phone number and consent state) will not
          be shared with third parties for marketing purposes. See our{" "}
          <a href="/privacy" className="underline">
            Privacy Policy
          </a>{" "}
          for full data-handling terms.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Contact</h2>
        <p>
          Questions about the Service:{" "}
          <a href="mailto:karlmarx9193@gmail.com" className="underline">
            karlmarx9193@gmail.com
          </a>
          .
        </p>
      </section>
    </main>
  );
}
