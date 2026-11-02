import { Suspense } from "react";
import { OtpStep } from "@/components/buyer/onboarding";

export const metadata = { title: "Code de vérification" };

/** A6 · Code OTP and E8 · Code incorrect ou expiré. */
export default function Page() {
  return (
    <Suspense>
      <OtpStep />
    </Suspense>
  );
}
