"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Phone, User } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuthBrandHeader } from "@/components/auth/auth-brand-header";
import { AuthSecurityNote } from "@/components/auth/auth-security-note";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import { AuthTextField } from "@/components/auth/auth-text-field";
import { CountryCodePicker } from "@/components/auth/country-code-picker";
import { PasswordField } from "@/components/auth/password-field";
import {
  emailSendOtpRequest,
  passwordLoginRequest,
  phoneSendOtpRequest,
} from "@/features/auth/services/auth.client";
import {
  clearRememberLoginPrefs,
  persistRememberLoginPrefs,
  readRememberLoginPrefs,
} from "@/features/auth/lib/remember-login.storage";
import { ApiError } from "@/lib/api/errors";
import { getSafeNextPath } from "@/lib/auth/safe-redirect";
import { DEFAULT_COUNTRY_CALLING_CODE } from "@/constants/country-calling-codes";
import { REFERRAL_CODE_SESSION_KEY } from "@/features/referral/constants/referral.constants";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = getSafeNextPath(searchParams.get("next"));
  const referralRef = searchParams.get("ref")?.trim();

  useEffect(() => {
    if (!referralRef) return;
    try {
      sessionStorage.setItem(REFERRAL_CODE_SESSION_KEY, referralRef);
    } catch {
      /* private mode */
    }
  }, [referralRef]);

  useEffect(() => {
    const prefs = readRememberLoginPrefs();
    setRememberMe(prefs.rememberMe);
    if (prefs.loginId) {
      setUsernameOrEmail(prefs.loginId);
    }
  }, []);

  const inactiveError = searchParams.get("error") === "inactive";

  const [tab, setTab] = useState("password");
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState(DEFAULT_COUNTRY_CALLING_CODE);
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(
    inactiveError ? "This account is inactive. Contact support." : null
  );

  const headerDescription = useMemo(() => {
    if (tab === "password") return "Sign in to access your account";
    if (tab === "phone") {
      return "We’ll text you a one-time code to sign in or create your account.";
    }
    return "We’ll email you a one-time code to sign in or create your account.";
  }, [tab]);

  const canSubmitPassword = useMemo(
    () => usernameOrEmail.trim().length > 0 && password.length > 0 && !pending,
    [usernameOrEmail, password, pending]
  );

  function onRememberMeChange(checked: boolean) {
    setRememberMe(checked);
    if (!checked) {
      clearRememberLoginPrefs();
    }
  }

  async function onPasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const result = await passwordLoginRequest({
        usernameOrEmail,
        password,
        next,
      });
      persistRememberLoginPrefs(rememberMe, usernameOrEmail);
      router.replace(result.redirectTo);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Unable to sign in"
      );
    } finally {
      setPending(false);
    }
  }

  async function onPhoneSend(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      await phoneSendOtpRequest({
        phone: phone.replace(/\D/g, ""),
        phoneDialCode: `+${country.dial}`,
        phoneCountryCode: country.cca2,
      });
      const q = new URLSearchParams({
        channel: "phone",
        phone: phone.replace(/\D/g, ""),
        dial: `+${country.dial}`,
        country: country.cca2,
        next,
      });
      router.push(`/otp?${q.toString()}`);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to send code"
      );
    } finally {
      setPending(false);
    }
  }

  async function onEmailSend(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      await emailSendOtpRequest({ email: email.trim() });
      const q = new URLSearchParams({
        channel: "email",
        email: email.trim(),
        next,
      });
      router.push(`/otp?${q.toString()}`);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to send email code"
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-5">
      <AuthBrandHeader title="Welcome Back" description={headerDescription} />

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Could not continue</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="auth-method-tabs grid w-full grid-cols-3 !bg-transparent">
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="phone">Phone</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
        </TabsList>

        <TabsContent value="password" className="space-y-4 pt-3">
          <form className="space-y-4" onSubmit={onPasswordSubmit}>
            <AuthTextField
              id="identifier"
              name="username"
              icon={User}
              value={usernameOrEmail}
              onChange={setUsernameOrEmail}
              autoComplete="username"
              placeholder="Email or username"
              disabled={pending}
            />
            <PasswordField
              id="password"
              name="password"
              variant="auth"
              value={password}
              onChange={setPassword}
              placeholder="Password"
              autoComplete="current-password"
              disabled={pending}
            />
            <div className="flex items-center gap-2.5 pt-0.5">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => onRememberMeChange(e.target.checked)}
                className="auth-remember-checkbox h-4 w-4 cursor-pointer rounded"
              />
              <label
                htmlFor="remember-me"
                className="cursor-pointer select-none text-sm text-muted-foreground"
              >
                Remember me
              </label>
            </div>
            <AuthSubmitButton
              disabled={!canSubmitPassword}
              pending={pending}
              pendingLabel="Signing in…"
            >
              Sign In
            </AuthSubmitButton>
          </form>
        </TabsContent>

        <TabsContent value="phone" className="space-y-4 pt-3">
          <form className="space-y-4" onSubmit={onPhoneSend}>
            <div className="flex items-stretch gap-2">
              <CountryCodePicker
                variant="auth"
                className="w-[7.25rem] shrink-0 sm:w-[8rem]"
                value={country}
                onChange={setCountry}
                disabled={pending}
              />
              <AuthTextField
                id="phone"
                icon={Phone}
                value={phone}
                onChange={setPhone}
                inputMode="tel"
                placeholder="Phone number"
                disabled={pending}
                autoComplete="tel-national"
                className="min-w-0 flex-1"
              />
            </div>
            <AuthSubmitButton
              disabled={pending || phone.replace(/\D/g, "").length < 6}
              pending={pending}
              pendingLabel="Sending code…"
            >
              Send OTP
            </AuthSubmitButton>
          </form>
        </TabsContent>

        <TabsContent value="email" className="space-y-4 pt-3">
          <form className="space-y-4" onSubmit={onEmailSend}>
            <AuthTextField
              id="email"
              type="email"
              icon={Mail}
              value={email}
              onChange={setEmail}
              autoComplete="email"
              placeholder="Email"
              disabled={pending}
            />
            <AuthSubmitButton
              disabled={pending || !email.includes("@")}
              pending={pending}
              pendingLabel="Sending code…"
            >
              Send verification code
            </AuthSubmitButton>
          </form>
        </TabsContent>
      </Tabs>

      <AuthSecurityNote />

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/welcome" className="auth-link text-sm">
          Back to welcome
        </Link>
      </p>
    </div>
  );
}
