"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { KeyRound } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AuthBrandHeader } from "@/components/auth/auth-brand-header";
import { AuthSecurityNote } from "@/components/auth/auth-security-note";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import { AuthTextField } from "@/components/auth/auth-text-field";
import {
  emailSendOtpRequest,
  emailVerifyOtpRequest,
  phoneSendOtpRequest,
  phoneVerifyOtpRequest,
} from "@/features/auth/services/auth.client";
import { ApiError } from "@/lib/api/errors";
import { getSafeNextPath } from "@/lib/auth/safe-redirect";

const RESEND_SECONDS = 60;

export function OtpForm() {
  const router = useRouter();
  const params = useSearchParams();
  const channel = params.get("channel") === "email" ? "email" : "phone";
  const next = getSafeNextPath(params.get("next"));
  const phone = params.get("phone") ?? "";
  const dial = params.get("dial") ?? "+971";
  const country = (params.get("country") ?? "AE").toUpperCase();
  const email = params.get("email") ?? "";

  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [secondsLeft]);

  const destinationLabel = useMemo(() => {
    if (channel === "email") return email;
    return `${dial} ${phone}`;
  }, [channel, email, dial, phone]);

  async function onVerify(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const result =
        channel === "email"
          ? await emailVerifyOtpRequest({ email, code, next })
          : await phoneVerifyOtpRequest({
              phone,
              phoneDialCode: dial,
              phoneCountryCode: country,
              code,
              next,
            });
      router.replace(result.redirectTo);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Invalid or expired verification code"
      );
    } finally {
      setPending(false);
    }
  }

  async function onResend() {
    if (secondsLeft > 0) return;
    setPending(true);
    setError(null);
    setInfo(null);
    try {
      if (channel === "email") {
        const res = await emailSendOtpRequest({ email });
        setInfo(res.message);
        setSecondsLeft(Math.min(res.expiresIn, RESEND_SECONDS));
      } else {
        const res = await phoneSendOtpRequest({
          phone,
          phoneDialCode: dial,
          phoneCountryCode: country,
        });
        setInfo(res.message);
        setSecondsLeft(RESEND_SECONDS);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not resend code");
    } finally {
      setPending(false);
    }
  }

  if ((channel === "phone" && !phone) || (channel === "email" && !email)) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Missing details</AlertTitle>
        <AlertDescription>
          Start again from{" "}
          <Link href="/login" className="underline">
            sign in
          </Link>
          .
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-5">
      <AuthBrandHeader
        title="Verify your code"
        description={
          <>
            We sent a code to{" "}
            <span className="font-medium text-foreground">{destinationLabel}</span>
          </>
        }
      />

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Verification failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {info ? (
        <Alert>
          <AlertTitle>Code sent</AlertTitle>
          <AlertDescription>{info}</AlertDescription>
        </Alert>
      ) : null}

      <form className="space-y-4" onSubmit={onVerify}>
        <div className="space-y-2">
          <Label htmlFor="otp" className="sr-only">
            Code
          </Label>
          <AuthTextField
            id="otp"
            icon={KeyRound}
            value={code}
            onChange={(v) => setCode(v.replace(/\D/g, "").slice(0, 8))}
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="Enter 4–8 digit code"
            disabled={pending}
          />
        </div>
        <AuthSubmitButton
          disabled={pending || code.length < 4}
          pending={pending}
          pendingLabel="Verifying…"
        >
          Verify & continue
        </AuthSubmitButton>
      </form>

      <Button
        type="button"
        variant="ghost"
        className="w-full text-muted-foreground"
        disabled={pending || secondsLeft > 0}
        onClick={onResend}
      >
        {secondsLeft > 0 ? `Resend in ${secondsLeft}s` : "Resend code"}
      </Button>

      <AuthSecurityNote />

      <p className="text-center text-sm">
        <Link href="/login" className="auth-link text-sm">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
