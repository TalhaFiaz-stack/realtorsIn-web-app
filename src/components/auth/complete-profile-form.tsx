"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  BadgeCheck,
  Briefcase,
  Building2,
  Check,
  ChevronLeft,
  Gift,
  KeyRound,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthSecurityNote } from "@/components/auth/auth-security-note";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import { PasswordField } from "@/components/auth/password-field";
import { RealtorsInAppIcon } from "@/components/brand/realtorsin-app-icon";
import { completeProfileRequest } from "@/features/auth/services/auth.client";
import type { PublicMember } from "@/features/auth/types/auth.types";
import { ApiError } from "@/lib/api/errors";
import { cn } from "@/lib/utils";
import { REFERRAL_CODE_SESSION_KEY } from "@/features/referral/constants/referral.constants";

const ROLES = ["Broker", "Agent", "Sales Manager", "Marketing", "Developer", "Other"];

type StepId = "identity" | "work" | "finish";

const STEPS: Array<{ id: StepId; label: string; title: string; hint: string; icon: LucideIcon }> = [
  {
    id: "identity",
    label: "You",
    title: "Who are you?",
    hint: "Your name and the handle people use to find you.",
    icon: UserRound,
  },
  {
    id: "work",
    label: "Work",
    title: "Where do you work?",
    hint: "Your role and company appear on your profile intro.",
    icon: Briefcase,
  },
  {
    id: "finish",
    label: "Finish",
    title: "Almost done",
    hint: "Optional extras. You can add or change these later.",
    icon: BadgeCheck,
  },
];

const inputClass = "auth-field-input h-[50px] px-3 shadow-none";

function Field({
  id,
  label,
  optional,
  hint,
  children,
}: {
  id?: string;
  label: string;
  optional?: boolean;
  hint?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="flex items-baseline gap-1.5">
        {label}
        {optional ? (
          <span className="text-xs font-normal text-muted-foreground">Optional</span>
        ) : null}
      </Label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

/**
 * Onboarding "Complete your profile" — three short steps (like Edit intro)
 * instead of one long scroll. Required fields gate each step; submit is on
 * the last step.
 */
export function CompleteProfileForm({ member }: { member: PublicMember }) {
  const router = useRouter();
  const [name, setName] = useState(member.name ?? "");
  const [lastName, setLastName] = useState(member.lastName ?? "");
  const [userName, setUserName] = useState(member.userName ?? "");
  const [company, setCompany] = useState("");
  const [agencyName, setAgencyName] = useState("");
  const [userRole, setUserRole] = useState("Agent");
  const [reraNumber, setReraNumber] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(REFERRAL_CODE_SESSION_KEY);
      if (stored?.trim()) setReferralCode(stored.trim().toUpperCase());
    } catch {
      /* ignore */
    }
  }, []);

  const stepValid = useMemo<Record<StepId, boolean>>(
    () => ({
      identity: !!name.trim() && !!lastName.trim() && !!userName.trim(),
      work: !!company.trim() && !!userRole,
      finish: true,
    }),
    [name, lastName, userName, company, userRole]
  );

  const step = STEPS[stepIndex];
  const isLast = stepIndex === STEPS.length - 1;
  const canReach = (index: number) => STEPS.slice(0, index).every((s) => stepValid[s.id]);

  async function submit() {
    setPending(true);
    setError(null);
    try {
      const result = await completeProfileRequest({
        name,
        lastName,
        userName,
        company,
        agencyName: agencyName || undefined,
        userRole,
        reraNumber: reraNumber || undefined,
        password: password || undefined,
        referralCode: referralCode || undefined,
      });
      router.replace(result.redirectTo);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save profile");
    } finally {
      setPending(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stepValid[step.id] || pending) return;
    if (isLast) void submit();
    else setStepIndex((i) => i + 1);
  }

  const fullName = `${name} ${lastName}`.trim();

  return (
    <form className="space-y-6" onSubmit={onSubmit} noValidate>
      {/* Header */}
      <div className="text-center">
        <div className="mb-4 inline-flex">
          <RealtorsInAppIcon size={56} />
        </div>
        <h1 className="text-[22px] font-bold tracking-tight text-foreground">
          Complete your profile
        </h1>
        <p className="auth-brand-subtitle mt-1 text-sm">
          Step {stepIndex + 1} of {STEPS.length} · takes less than a minute
        </p>
      </div>

      {/* Stepper — click a reachable step to jump to it. */}
      <ol className="grid grid-cols-3 gap-2" aria-label="Profile steps">
        {STEPS.map((s, i) => {
          const done = i < stepIndex && stepValid[s.id];
          const current = i === stepIndex;
          const reachable = canReach(i) && !pending;
          return (
            <li key={s.id}>
              <button
                type="button"
                disabled={!reachable}
                onClick={() => setStepIndex(i)}
                aria-current={current ? "step" : undefined}
                className="w-full text-start disabled:cursor-not-allowed"
              >
                <span
                  className={cn(
                    "block h-1 rounded-full transition-colors",
                    current || done ? "bg-primary" : "bg-muted"
                  )}
                />
                <span
                  className={cn(
                    "mt-2 flex items-center gap-1.5 text-xs font-medium",
                    current ? "text-primary" : done ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-semibold",
                      current
                        ? "bg-primary text-primary-foreground"
                        : done
                          ? "bg-primary/15 text-primary"
                          : "bg-muted text-muted-foreground"
                    )}
                  >
                    {done ? <Check className="h-2.5 w-2.5" aria-hidden /> : i + 1}
                  </span>
                  {s.label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      {/* Step heading */}
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <step.icon className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0 pt-0.5">
          <h2 className="text-base font-semibold leading-tight text-foreground">{step.title}</h2>
          <p className="mt-1 text-[13px] leading-snug text-muted-foreground">{step.hint}</p>
        </div>
      </div>

      <div key={step.id} className="space-y-4 animate-in fade-in slide-in-from-bottom-1 duration-200">
        {step.id === "identity" ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="name" label="First name">
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="First name"
                  autoComplete="given-name"
                  autoFocus
                  className={inputClass}
                />
              </Field>
              <Field id="lastName" label="Last name">
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                  autoComplete="family-name"
                  className={inputClass}
                />
              </Field>
            </div>
            <Field id="userName" label="Username" hint="Letters, numbers and underscores. Must be unique.">
              <div className="relative">
                <span className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  @
                </span>
                <Input
                  id="userName"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="username"
                  autoComplete="username"
                  className={cn(inputClass, "ps-7")}
                />
              </div>
            </Field>
          </>
        ) : null}

        {step.id === "work" ? (
          <>
            <Field label="Your role">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Your role">
                {ROLES.map((role) => {
                  const selected = userRole === role;
                  return (
                    <button
                      key={role}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setUserRole(role)}
                      className={cn(
                        "flex h-11 items-center justify-center gap-1.5 rounded-xl border px-2 text-[13px] font-medium transition-colors",
                        selected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-[var(--auth-input-border)] bg-[var(--auth-input-bg)] text-foreground/80 hover:border-primary/40"
                      )}
                    >
                      {selected ? <Check className="h-3.5 w-3.5" aria-hidden /> : null}
                      {role}
                    </button>
                  );
                })}
              </div>
            </Field>
            <Field id="company" label="Company">
              <div className="relative">
                <Building2 className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <Input
                  id="company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Your company name"
                  autoComplete="organization"
                  autoFocus
                  className={cn(inputClass, "ps-9")}
                />
              </div>
            </Field>
            <Field id="agencyName" label="Agency or brokerage" optional>
              <Input
                id="agencyName"
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                placeholder="e.g. Emaar Properties"
                className={inputClass}
              />
            </Field>
          </>
        ) : null}

        {step.id === "finish" ? (
          <>
            <Field id="rera" label="RERA number (BRN)" optional hint="Adds a verified-license badge once reviewed.">
              <div className="relative">
                <BadgeCheck className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <Input
                  id="rera"
                  value={reraNumber}
                  onChange={(e) => setReraNumber(e.target.value)}
                  placeholder="BRN-31847-2019"
                  autoFocus
                  className={cn(inputClass, "ps-9")}
                />
              </div>
            </Field>
            <Field id="newPassword" label="Create a password" optional hint="Lets you sign in with email as well as your current method.">
              <PasswordField
                id="newPassword"
                variant="auth"
                value={password}
                onChange={setPassword}
                autoComplete="new-password"
                placeholder="Create a password"
              />
            </Field>
            <Field id="referral" label="Referral code" optional>
              <div className="relative">
                <Gift className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <Input
                  id="referral"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  placeholder="Referral code"
                  className={cn(inputClass, "ps-9 uppercase placeholder:normal-case")}
                />
              </div>
            </Field>

            {/* Summary of what was entered in earlier steps */}
            <div className="rounded-xl border border-[var(--auth-input-border)] bg-[var(--auth-input-bg)] px-4 py-3">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <KeyRound className="h-3.5 w-3.5" aria-hidden />
                Your profile
              </div>
              <p className="mt-1.5 truncate text-sm font-semibold text-foreground">
                {fullName || "—"} <span className="font-normal text-muted-foreground">@{userName}</span>
              </p>
              <p className="truncate text-[13px] text-muted-foreground">
                {[userRole, company, agencyName].filter(Boolean).join(" · ")}
              </p>
            </div>
          </>
        ) : null}
      </div>

      {error ? (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>{error}</span>
        </div>
      ) : null}

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          {stepIndex > 0 ? (
            <button
              type="button"
              disabled={pending}
              onClick={() => setStepIndex((i) => i - 1)}
              className="flex h-[50px] shrink-0 items-center gap-1 rounded-xl border border-[var(--auth-input-border)] px-4 text-sm font-medium text-foreground/90 transition-colors hover:bg-muted disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4 rtl:rotate-180" aria-hidden />
              Back
            </button>
          ) : null}
          <AuthSubmitButton
            pending={pending}
            pendingLabel="Saving…"
            disabled={!stepValid[step.id]}
            className="mt-0 flex-1"
          >
            {isLast ? "Finish setup" : "Continue"}
          </AuthSubmitButton>
        </div>
        {!stepValid[step.id] ? (
          <p className="text-center text-xs text-muted-foreground">
            Fill in the fields above to continue
          </p>
        ) : null}
      </div>

      <AuthSecurityNote />
    </form>
  );
}
