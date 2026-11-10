"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  BadgeCheck,
  Briefcase,
  Building2,
  Camera,
  Check,
  ChevronLeft,
  FileText,
  Gift,
  KeyRound,
  Upload,
  UserRound,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthSecurityNote } from "@/components/auth/auth-security-note";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import { PasswordField } from "@/components/auth/password-field";
import { RealtorsInAppIcon } from "@/components/brand/realtorsin-app-icon";
import { completeProfileRequest } from "@/features/auth/services/auth.client";
import { updateSocialPicRequest } from "@/features/profile/services/profile.client";
import {
  PROFILE_OPERATING_EMIRATES,
  PROFILE_PROPERTY_TYPES,
} from "@/features/profile/validators/profile.validators";
import { showAppToast } from "@/lib/toast/app-toast";
import type { PublicMember } from "@/features/auth/types/auth.types";
import { ApiError } from "@/lib/api/errors";
import { cn } from "@/lib/utils";
import { REFERRAL_CODE_SESSION_KEY } from "@/features/referral/constants/referral.constants";

const ROLES = ["Broker", "Agent", "Sales Manager", "Marketing", "Developer", "Other"];

type StepId = "identity" | "work" | "license" | "finish";

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
    id: "license",
    label: "License",
    title: "License & practice",
    hint: "Optional. Adds a verified-license badge once reviewed. You can add these later.",
    icon: BadgeCheck,
  },
  {
    id: "finish",
    label: "Finish",
    title: "Almost done",
    hint: "Optional extras. You can add or change these later.",
    icon: KeyRound,
  },
];

/** Same limits as POST /api/profile/photo. */
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

/** Same rules as completeProfileSchema.password, so problems show before submitting. */
function passwordProblem(value: string): string | null {
  if (value.length < 8) return "At least 8 characters";
  if (!/[A-Z]/.test(value)) return "Include an uppercase letter";
  if (!/[a-z]/.test(value)) return "Include a lowercase letter";
  if (!/[0-9]/.test(value)) return "Include a number";
  if (!/[^A-Za-z0-9]/.test(value)) return "Include a special character";
  return null;
}

function toggleItem(list: string[], item: string): string[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

/** Object URL for a picked file, released when it changes or the form unmounts. */
function usePreviewUrl(file: File | null): string | null {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!file) {
      setUrl(null);
      return;
    }
    const next = URL.createObjectURL(file);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [file]);
  return url;
}

function ChipToggle({
  label,
  selected,
  onToggle,
}: {
  label: string;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      onClick={onToggle}
      className={cn(
        "flex h-9 items-center gap-1.5 rounded-full border px-3 text-[13px] font-medium transition-colors",
        selected
          ? "border-primary bg-primary/10 text-primary"
          : "border-[var(--auth-input-border)] bg-[var(--auth-input-bg)] text-foreground/80 hover:border-primary/40"
      )}
    >
      {selected ? <Check className="h-3.5 w-3.5" aria-hidden /> : null}
      {label}
    </button>
  );
}

/** Pick one image (photo or certificate) with a preview. */
function ImagePick({
  id,
  previewUrl,
  title,
  description,
  round,
  icon: Icon,
  onPick,
  onClear,
  removable,
  disabled,
}: {
  id: string;
  previewUrl: string | null;
  title: string;
  description: string;
  round?: boolean;
  icon: LucideIcon;
  onPick: (file: File | null) => void;
  onClear: () => void;
  /** Show the remove button (only for a file picked here, not an existing photo). */
  removable: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[var(--auth-input-border)] bg-[var(--auth-input-bg)] p-3">
      <div
        className={cn(
          "relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden bg-muted text-muted-foreground",
          round ? "rounded-full" : "rounded-lg"
        )}
      >
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <Icon className="h-6 w-6" aria-hidden />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <label
          htmlFor={id}
          className={cn(
            "inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-[var(--auth-input-border)] px-3 text-[13px] font-medium text-foreground transition-colors hover:bg-muted",
            disabled && "pointer-events-none opacity-50"
          )}
        >
          <Upload className="h-3.5 w-3.5" aria-hidden />
          {previewUrl ? "Change" : "Upload"}
        </label>
        <input
          id={id}
          type="file"
          accept={IMAGE_TYPES.join(",")}
          className="sr-only"
          disabled={disabled}
          onChange={(e) => {
            onPick(e.target.files?.[0] ?? null);
            e.target.value = ""; // allow picking the same file again
          }}
        />
        {removable ? (
          <button
            type="button"
            onClick={onClear}
            disabled={disabled}
            aria-label={`Remove ${title.toLowerCase()}`}
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        ) : null}
      </div>
    </div>
  );
}

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
  const [ornNumber, setOrnNumber] = useState("");
  const [emirates, setEmirates] = useState<string[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<string[]>([]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [reraFile, setReraFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const photoPreview = usePreviewUrl(photoFile);
  const reraPreview = usePreviewUrl(reraFile);

  /** Validate a picked image the same way the upload route does. */
  function pickImage(file: File | null, set: (file: File | null) => void) {
    if (!file) return;
    if (file.type && !IMAGE_TYPES.includes(file.type)) {
      setImageError("Use a JPG, PNG, WebP or GIF image.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError("Image must be 10MB or smaller.");
      return;
    }
    setImageError(null);
    set(file);
  }

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(REFERRAL_CODE_SESSION_KEY);
      if (stored?.trim()) setReferralCode(stored.trim().toUpperCase());
    } catch {
      /* ignore */
    }
  }, []);

  const passwordError = password ? passwordProblem(password) : null;
  const confirmError =
    confirmPassword && password !== confirmPassword ? "Passwords do not match" : null;

  const stepValid = useMemo<Record<StepId, boolean>>(
    () => ({
      identity: !!name.trim() && !!lastName.trim() && !!userName.trim(),
      work: !!company.trim() && !!userRole,
      license: true,
      // The password is optional; if one is typed it must be strong and confirmed.
      finish: !password || (!passwordProblem(password) && password === confirmPassword),
    }),
    [name, lastName, userName, company, userRole, password, confirmPassword]
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
        ornNumber: ornNumber || undefined,
        cities: emirates.length ? emirates : undefined,
        propertyTypes: propertyTypes.length ? propertyTypes : undefined,
        password: password || undefined,
        referralCode: referralCode || undefined,
      });

      // Images go to the profile that was just saved. A failed upload must not
      // lose the saved profile — tell the member and let them add it later.
      const socialProfileId = result.member.socialProfileId ?? member.socialProfileId;
      const uploads: Array<{ kind: "profile" | "rera"; file: File; label: string }> = [];
      if (photoFile) uploads.push({ kind: "profile", file: photoFile, label: "profile photo" });
      if (reraFile) uploads.push({ kind: "rera", file: reraFile, label: "RERA certificate" });
      const failed: string[] = [];
      for (const upload of uploads) {
        if (!socialProfileId) {
          failed.push(upload.label);
          continue;
        }
        try {
          await updateSocialPicRequest({
            socialProfileId,
            file: upload.file,
            kind: upload.kind,
          });
        } catch {
          failed.push(upload.label);
        }
      }
      if (failed.length) {
        showAppToast.error(
          "Profile saved",
          `Your ${failed.join(" and ")} could not be uploaded. You can add it from your profile.`
        );
      }

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
      <ol className="grid grid-cols-4 gap-2" aria-label="Profile steps">
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
            <Field label="Profile photo" optional hint={imageError ? <span className="text-destructive">{imageError}</span> : null}>
              <ImagePick
                id="profilePhoto"
                previewUrl={photoPreview ?? member.avatarUrl}
                title="Add a professional photo"
                description="Helps people recognise you. JPG, PNG or WebP, up to 10MB."
                round
                icon={Camera}
                removable={!!photoFile}
                disabled={pending}
                onPick={(file) => pickImage(file, setPhotoFile)}
                onClear={() => setPhotoFile(null)}
              />
            </Field>
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

        {step.id === "license" ? (
          <>
            <Field id="rera" label="RERA number (BRN)" optional>
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
            <Field label="RERA certificate" optional hint={imageError ? <span className="text-destructive">{imageError}</span> : null}>
              <ImagePick
                id="reraCertificate"
                previewUrl={reraPreview}
                title="RERA certificate"
                description="A clear photo or scan. We use it to verify your RERA registration."
                icon={FileText}
                removable={!!reraFile}
                disabled={pending}
                onPick={(file) => pickImage(file, setReraFile)}
                onClear={() => setReraFile(null)}
              />
            </Field>
            <Field id="orn" label="ORN (Office Registration No.)" optional>
              <Input
                id="orn"
                value={ornNumber}
                onChange={(e) => setOrnNumber(e.target.value)}
                placeholder="e.g. 12345"
                className={inputClass}
              />
            </Field>
            <Field label="Operating emirates" optional>
              <div className="flex flex-wrap gap-2">
                {PROFILE_OPERATING_EMIRATES.map((emirate) => (
                  <ChipToggle
                    key={emirate}
                    label={emirate}
                    selected={emirates.includes(emirate)}
                    onToggle={() => setEmirates((prev) => toggleItem(prev, emirate))}
                  />
                ))}
              </div>
            </Field>
            <Field label="Property types" optional>
              <div className="flex flex-wrap gap-2">
                {PROFILE_PROPERTY_TYPES.map((type) => (
                  <ChipToggle
                    key={type}
                    label={type}
                    selected={propertyTypes.includes(type)}
                    onToggle={() => setPropertyTypes((prev) => toggleItem(prev, type))}
                  />
                ))}
              </div>
            </Field>
          </>
        ) : null}

        {step.id === "finish" ? (
          <>
            <Field
              id="newPassword"
              label="Create a password"
              optional
              hint={
                passwordError ? (
                  <span className="text-destructive">{passwordError}</span>
                ) : (
                  "Lets you sign in with email as well as your current method. Use 8+ characters with upper and lower case, a number and a symbol."
                )
              }
            >
              <PasswordField
                id="newPassword"
                variant="auth"
                value={password}
                onChange={setPassword}
                autoComplete="new-password"
                placeholder="Create a password"
              />
            </Field>
            <Field
              id="confirmPassword"
              label="Confirm password"
              optional
              hint={confirmError ? <span className="text-destructive">{confirmError}</span> : null}
            >
              <PasswordField
                id="confirmPassword"
                variant="auth"
                value={confirmPassword}
                onChange={setConfirmPassword}
                autoComplete="new-password"
                placeholder="Re-enter your password"
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
              {emirates.length || propertyTypes.length ? (
                <p className="truncate text-[13px] text-muted-foreground">
                  {[...emirates, ...propertyTypes].join(" · ")}
                </p>
              ) : null}
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
            {step.id === "finish"
              ? "Fix the password above, or clear it to skip"
              : "Fill in the fields above to continue"}
          </p>
        ) : null}
      </div>

      <AuthSecurityNote />
    </form>
  );
}
