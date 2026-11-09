"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BadgeCheck,
  Briefcase,
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  ImageUp,
  Loader2,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  IntroAddLink,
  IntroChipToggle,
  IntroField,
  IntroPhoneRow,
  IntroSelect,
} from "@/components/profile/profile-edit-intro-fields";
import { FormToggleRow, CharCount } from "@/components/profile/profile-form-dialog";
import { ProfileEducationDialog } from "@/components/profile/profile-education-dialog";
import { ProfilePositionDialog } from "@/components/profile/profile-position-dialog";
import { toggleListItem } from "@/features/profile/lib/edit-intro.utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useEditIntroForm } from "@/features/profile/hooks/use-edit-intro-form";
import {
  mutationErrorMessage,
  useUpdateIntro,
  useUpdateSocialPic,
} from "@/features/profile/hooks/use-profile-mutations";
import type { SocialProfile } from "@/features/profile/types/profile.types";
import {
  PROFILE_OPERATING_EMIRATES,
  PROFILE_PROPERTY_TYPES,
  PROFILE_USER_ROLES,
} from "@/features/profile/validators/profile.validators";
import { cn } from "@/lib/utils";

const ROLE_OPTIONS = PROFILE_USER_ROLES.filter((role) => role !== "CEO");
const ABOUT_MAX = 500;

type StepId = "personal" | "professional" | "about" | "license";

const STEPS: Array<{ id: StepId; label: string; title: string; hint: string; icon: LucideIcon }> = [
  { id: "personal", label: "Personal", title: "Personal information", hint: "How people find and contact you", icon: UserRound },
  { id: "professional", label: "Professional", title: "Professional details", hint: "Company, role and what shows in your intro", icon: Briefcase },
  { id: "about", label: "About", title: "About you", hint: "A short bio and a link to your social profile", icon: FileText },
  { id: "license", label: "License", title: "License & practice", hint: "RERA details, emirates and property types", icon: BadgeCheck },
];

/**
 * Edit intro — split into 4 short steps instead of one long scroll.
 * Steps with required fields must be complete before moving on; Save is on
 * the last step (or any step once everything required is filled).
 */
export function ProfileEditIntroDialog({
  open,
  onOpenChange,
  profile,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: SocialProfile;
}) {
  const mutation = useUpdateIntro();
  const reraPicMutation = useUpdateSocialPic();
  const form = useEditIntroForm(open, profile);
  const [error, setError] = useState<string | null>(null);
  const [nested, setNested] = useState<"position" | "education" | null>(null);
  const [reraImageFile, setReraImageFile] = useState<File | null>(null);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (!open) {
      setReraImageFile(null);
      setStepIndex(0);
      setError(null);
    }
  }, [open]);

  const stepValid = useMemo<Record<StepId, boolean>>(
    () => ({
      personal:
        !!form.name.trim() &&
        !!form.lastName.trim() &&
        !!form.userName.trim() &&
        !!form.email.trim() &&
        !!form.phone.trim() &&
        !!form.location.trim(),
      professional: !!form.company.trim() && !!form.userRole,
      about: true,
      license: true,
    }),
    [form.name, form.lastName, form.userName, form.email, form.phone, form.location, form.company, form.userRole]
  );

  const step = STEPS[stepIndex];
  const isLast = stepIndex === STEPS.length - 1;
  const saving = mutation.isPending || reraPicMutation.isPending;
  /** A step is reachable when every step before it is valid. */
  const canReach = (index: number) => STEPS.slice(0, index).every((s) => stepValid[s.id]);

  function save() {
    if (!form.canSave || saving) return;
    setError(null);
    mutation.mutate(form.toInput(), {
      onSuccess: () => {
        if (!reraImageFile) {
          onOpenChange(false);
          return;
        }
        reraPicMutation.mutate(
          { socialProfileId: profile.id, file: reraImageFile, kind: "rera" },
          {
            onSuccess: () => onOpenChange(false),
            onError: (err) => setError(mutationErrorMessage(err)),
          }
        );
      },
      onError: (err) => setError(mutationErrorMessage(err)),
    });
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="flex h-[min(92dvh,44rem)] max-w-xl flex-col gap-0 overflow-hidden rounded-2xl p-0"
          closeButtonClassName="end-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <header className="border-b border-border/70 px-5 pb-4 pt-4">
            <div className="flex items-start gap-3 pe-10">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <step.icon className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0 pt-0.5">
                <DialogTitle className="text-base font-semibold leading-tight">Edit intro</DialogTitle>
                <DialogDescription className="mt-1 text-[13px] leading-snug">
                  Step {stepIndex + 1} of {STEPS.length} · {step.title}
                </DialogDescription>
              </div>
            </div>

            {/* Step bar — click a finished/reachable step to jump to it. */}
            <ol className="mt-4 grid grid-cols-4 gap-2" aria-label="Edit intro steps">
              {STEPS.map((s, i) => {
                const done = i < stepIndex && stepValid[s.id];
                const current = i === stepIndex;
                const reachable = canReach(i);
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      disabled={!reachable}
                      onClick={() => setStepIndex(i)}
                      aria-current={current ? "step" : undefined}
                      className="group w-full text-start disabled:cursor-not-allowed"
                    >
                      <span
                        className={cn(
                          "block h-1 rounded-full transition-colors",
                          current || done ? "bg-primary" : "bg-muted"
                        )}
                      />
                      <span
                        className={cn(
                          "mt-1.5 flex items-center gap-1 text-[11px] font-medium",
                          current ? "text-primary" : done ? "text-foreground" : "text-muted-foreground"
                        )}
                      >
                        {done ? <Check className="h-3 w-3" aria-hidden /> : null}
                        {s.label}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </header>

          <form
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={(event) => {
              event.preventDefault();
              if (isLast) save();
              else if (stepValid[step.id]) setStepIndex((i) => i + 1);
            }}
          >
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-5 py-5">
              <p className="text-[13px] text-muted-foreground">{step.hint}</p>

              {step.id === "personal" ? (
                <>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <IntroField label="First name" required>
                      <Input value={form.name} onChange={(e) => form.setName(e.target.value)} autoComplete="given-name" />
                    </IntroField>
                    <IntroField label="Last name" required>
                      <Input value={form.lastName} onChange={(e) => form.setLastName(e.target.value)} autoComplete="family-name" />
                    </IntroField>
                  </div>
                  <IntroField label="Username" required>
                    <div className="relative">
                      <span className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        @
                      </span>
                      <Input
                        className="ps-7"
                        value={form.userName}
                        onChange={(e) => form.setUserName(e.target.value)}
                        placeholder="username"
                        autoComplete="username"
                      />
                    </div>
                  </IntroField>
                  <IntroField label="Email" required>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => form.onEmailChange(e.target.value)}
                      placeholder="your.email@example.com"
                      autoComplete="email"
                    />
                  </IntroField>
                  <IntroField label="Phone number" required hint="Dial code · country · number">
                    <IntroPhoneRow
                      dialCode={form.phoneDialCode}
                      countryCode={form.phoneCountryCode}
                      phone={form.phone}
                      onDialCodeChange={form.setPhoneDialCode}
                      onCountryCodeChange={form.setPhoneCountryCode}
                      onPhoneChange={form.setPhone}
                    />
                  </IntroField>
                  <IntroField label="Location" required>
                    <Input
                      value={form.location}
                      onChange={(e) => form.setLocation(e.target.value)}
                      placeholder="City, country"
                    />
                  </IntroField>
                </>
              ) : null}

              {step.id === "professional" ? (
                <>
                  <IntroField label="Company name" required>
                    <Input
                      value={form.company}
                      onChange={(e) => form.setCompany(e.target.value)}
                      placeholder="Your company name"
                    />
                  </IntroField>
                  <IntroField label="Role" required>
                    <IntroSelect
                      value={form.userRole}
                      onChange={form.setUserRole}
                      placeholder="Select your role"
                      options={ROLE_OPTIONS.map((role) => ({
                        value: role,
                        label: role === "Ceo" ? "CEO" : role,
                      }))}
                    />
                  </IntroField>
                  <div className="space-y-2">
                    <FormToggleRow
                      checked={form.showCompany}
                      onChange={form.setShowCompany}
                      label="Show current company in my intro"
                    />
                    <FormToggleRow
                      checked={form.showRole}
                      onChange={form.setShowRole}
                      label="Show current role in my intro"
                    />
                  </div>
                  <IntroField label="Current position">
                    <IntroSelect
                      value={form.positionId}
                      onChange={form.setPositionId}
                      placeholder="Select your current position"
                      options={profile.positions.map((item) => ({
                        value: String(item.id),
                        label: item.company ? `${item.title} · ${item.company}` : item.title,
                      }))}
                    />
                  </IntroField>
                  <IntroAddLink label="Add new position" onClick={() => setNested("position")} />
                  <IntroField label="Education">
                    <IntroSelect
                      value={form.educationId}
                      onChange={form.setEducationId}
                      placeholder="Select your education"
                      options={profile.educations.map((item) => ({
                        value: String(item.id),
                        label: item.degree ? `${item.school} · ${item.degree}` : item.school,
                      }))}
                    />
                  </IntroField>
                  <IntroAddLink label="Add new education" onClick={() => setNested("education")} />
                </>
              ) : null}

              {step.id === "about" ? (
                <>
                  <IntroField
                    label="Headline / bio"
                    hint={<CharCount value={form.description} max={ABOUT_MAX} />}
                  >
                    <Textarea
                      value={form.description}
                      onChange={(e) => form.setDescription(e.target.value)}
                      maxLength={ABOUT_MAX}
                      rows={6}
                      placeholder="e.g. Off-plan specialist in Dubai Marina · 8 years with Emaar launches"
                    />
                  </IntroField>
                  <IntroField label="Social profile link">
                    <Input
                      value={form.socialProfileLinks}
                      onChange={(e) => form.setSocialProfileLinks(e.target.value)}
                      placeholder="https://linkedin.com/in/yourname"
                      inputMode="url"
                    />
                  </IntroField>
                </>
              ) : null}

              {step.id === "license" ? (
                <>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <IntroField label="RERA number (BRN)">
                      <Input
                        value={form.reraNumber}
                        onChange={(e) => form.setReraNumber(e.target.value)}
                        placeholder="BRN-31847-2019"
                      />
                    </IntroField>
                    <IntroField label="ORN (office reg. no.)">
                      <Input
                        value={form.ornNumber}
                        onChange={(e) => form.setOrnNumber(e.target.value)}
                        placeholder="12447"
                      />
                    </IntroField>
                  </div>
                  <IntroField label="Agency / developer name">
                    <Input
                      value={form.agencyName}
                      onChange={(e) => form.setAgencyName(e.target.value)}
                      placeholder="Emaar Properties"
                    />
                  </IntroField>
                  <IntroField label="RERA certificate">
                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border px-3.5 py-3 transition-colors hover:bg-muted/40">
                      {profile.reraImageUrl && !reraImageFile ? (
                        // eslint-disable-next-line @next/next/no-img-element -- remote certificate thumbnail
                        <img
                          src={profile.reraImageUrl}
                          alt="Current RERA certificate"
                          className="h-12 w-16 shrink-0 rounded-md border border-border bg-muted object-cover"
                        />
                      ) : (
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <ImageUp className="h-5 w-5" aria-hidden />
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-foreground">
                          {reraImageFile
                            ? reraImageFile.name
                            : profile.reraImageUrl
                              ? "Replace certificate image"
                              : "Upload certificate image"}
                        </span>
                        <span className="block text-xs text-muted-foreground">JPG, PNG, WEBP or GIF</span>
                      </span>
                      <input
                        type="file"
                        className="sr-only"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={(e) => setReraImageFile(e.target.files?.[0] ?? null)}
                      />
                    </label>
                  </IntroField>
                  <IntroField label="Operating emirates">
                    <div className="flex flex-wrap gap-1.5">
                      {PROFILE_OPERATING_EMIRATES.map((emirate) => (
                        <IntroChipToggle
                          key={emirate}
                          label={emirate}
                          selected={form.cities.includes(emirate)}
                          onToggle={() => form.setCities((prev) => toggleListItem(prev, emirate))}
                        />
                      ))}
                    </div>
                  </IntroField>
                  <IntroField label="Property types">
                    <div className="flex flex-wrap gap-1.5">
                      {PROFILE_PROPERTY_TYPES.map((type) => (
                        <IntroChipToggle
                          key={type}
                          label={type}
                          selected={form.propertyTypes.includes(type)}
                          onToggle={() => form.setPropertyTypes((prev) => toggleListItem(prev, type))}
                        />
                      ))}
                    </div>
                  </IntroField>
                </>
              ) : null}
            </div>

            {error ? (
              <div
                role="alert"
                className="mx-5 mb-3 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <span>{error}</span>
              </div>
            ) : null}

            <footer className="flex items-center gap-2 border-t border-border/70 bg-muted/30 px-5 py-3">
              <div className="min-w-0 flex-1 text-xs text-muted-foreground">
                {!stepValid[step.id] ? "Fill the required fields (*) to continue" : null}
              </div>
              {stepIndex > 0 ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="rounded-full"
                  onClick={() => setStepIndex((i) => i - 1)}
                >
                  <ChevronLeft className="h-4 w-4 rtl:rotate-180" aria-hidden />
                  Back
                </Button>
              ) : (
                <Button type="button" variant="ghost" className="rounded-full" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
              )}
              {!isLast && form.canSave ? (
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full"
                  disabled={saving}
                  onClick={save}
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
                  Save
                </Button>
              ) : null}
              {isLast ? (
                <Button type="submit" className="min-w-[5.5rem] rounded-full" disabled={!form.canSave || saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
                  {saving ? "Saving…" : "Save"}
                </Button>
              ) : (
                <Button type="submit" className="min-w-[5.5rem] rounded-full" disabled={!stepValid[step.id]}>
                  Next
                  <ChevronRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
                </Button>
              )}
            </footer>
          </form>
        </DialogContent>
      </Dialog>

      <ProfilePositionDialog
        open={nested === "position"}
        onOpenChange={(next) => {
          if (!next) setNested(null);
        }}
        initial={null}
        skills={profile.skills}
      />
      <ProfileEducationDialog
        open={nested === "education"}
        onOpenChange={(next) => {
          if (!next) setNested(null);
        }}
        initial={null}
        skills={profile.skills}
      />
    </>
  );
}
