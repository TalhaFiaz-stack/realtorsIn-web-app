import { Suspense } from "react";
import { OtpForm } from "@/components/auth/otp-form";
import { LoadingState } from "@/components/states/loading-state";

export const metadata = { title: "Verify code" };

export default function OtpPage() {
  return (
    <Suspense fallback={<LoadingState label="Loading verification" />}>
      <OtpForm />
    </Suspense>
  );
}
