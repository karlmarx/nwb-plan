import type { Metadata } from "next";

import { auth } from "@/lib/auth";
import { getNfitUser } from "@/lib/sms-users";
import { OnboardPhoneForm } from "./onboard-phone-form";

export const metadata: Metadata = {
  title: "Phone verification — nfit",
  description: "Verify your phone number to enable workout-reminder SMS.",
};

export default async function OnboardPhonePage() {
  const session = await auth();
  const email = session?.user?.email ?? null;
  const user = email ? await getNfitUser(email) : null;
  const alreadyVerified = !!user?.phoneVerifiedAt && !user?.smsOptOutAt;

  return (
    <main className="mx-auto max-w-md px-4 py-12 text-zinc-100">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          Verify your phone
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          Add SMS to your nfit account to receive workout reminders and
          security alerts. Skip for now if you only want web access.
        </p>
      </div>

      <OnboardPhoneForm
        email={email}
        alreadyVerified={alreadyVerified}
        existingPhone={user?.phone ?? null}
      />

      <p className="mt-8 text-xs text-zinc-500">
        By providing your phone number and ticking the consent box, you agree
        to receive recurring SMS workout reminders and security messages from
        nfit. Message frequency varies. Msg &amp; data rates may apply. Reply{" "}
        <code>STOP</code> to cancel, <code>HELP</code> for help. See our{" "}
        <a href="/privacy" className="underline">
          Privacy Policy
        </a>{" "}
        and{" "}
        <a href="/sms-terms" className="underline">
          SMS Terms
        </a>
        .
      </p>
    </main>
  );
}
