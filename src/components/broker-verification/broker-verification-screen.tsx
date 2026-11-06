"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Circle,
  FileUp,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { BrokerVerificationDetailSkeleton } from "@/components/settings/settings-detail-skeleton";
import { ErrorState } from "@/components/states/error-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  isAllowedBrokerCardDocument,
  isAllowedNicDocument,
  isAllowedProfileImage,
} from "@/features/broker-verification/lib/broker-document-accept";
import {
  useBrokerVerificationStatus,
  useBrokerVerificationSubmit,
} from "@/features/broker-verification/hooks/use-broker-verification";
import { useOwnProfile } from "@/features/profile/hooks/use-profile";
import { cn } from "@/lib/utils";

function PrerequisiteRow({
  done,
  label,
  detail,
}: {
  done: boolean;
  label: string;
  detail?: string;
}) {
  return (
    <li className="flex gap-3 text-sm">
      {done ? (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#059669]" aria-hidden />
      ) : (
        <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
      )}
      <div>
        <p className={cn("font-medium", done && "text-foreground")}>{label}</p>
        {detail ? (
          <p className="text-xs text-muted-foreground">{detail}</p>
        ) : null}
      </div>
    </li>
  );
}

function FilePickButton({
  id,
  label,
  accept,
  disabled,
  onPick,
  hint,
}: {
  id: string;
  label: string;
  accept: string;
  disabled?: boolean;
  onPick: (file: File | null) => void;
  hint: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" disabled={disabled} asChild>
          <label htmlFor={id} className="cursor-pointer">
            <FileUp className="mr-2 h-4 w-4" aria-hidden />
            Choose file
          </label>
        </Button>
        <input
          id={id}
          type="file"
          accept={accept}
          className="sr-only"
          disabled={disabled}
          onChange={(event) => {
            const file = event.target.files?.[0] ?? null;
            onPick(file);
            event.target.value = "";
          }}
        />
        <span className="text-xs text-muted-foreground">{hint}</span>
      </div>
    </div>
  );
}

export function BrokerVerificationScreen() {
  const profileQuery = useOwnProfile();
  const statusQuery = useBrokerVerificationStatus(profileQuery.isSuccess);
  const submit = useBrokerVerificationSubmit();

  const profile = profileQuery.data;
  const status = statusQuery.data;

  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [nicFile, setNicFile] = useState<File | null>(null);
  const [brokerCardFile, setBrokerCardFile] = useState<File | null>(null);
  const [socialLink, setSocialLink] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.socialProfileLinks) {
      setSocialLink(profile.socialProfileLinks);
    }
  }, [profile?.socialProfileLinks]);

  const hasProfileImage = Boolean(profile?.profileImage?.url || profileImageFile);
  const hasNic = Boolean(profile?.nicDocumentUrl || nicFile);
  const hasSocialLink = Boolean(
    profile?.socialProfileLinks?.trim() || socialLink.trim()
  );
  const hasBrokerCardOnFile = Boolean(profile?.brokerCardDocumentUrl);

  const brokerCardVerified = Boolean(profile?.brokerCardVerified);
  const brokerStatus = profile?.brokerCardStatus;
  const isPending = brokerStatus === "pending";
  const isRejected = brokerStatus === "rejected";
  const showWait =
    hasBrokerCardOnFile && !brokerCardVerified && isPending && !isRejected;
  const showSubmitForm = !brokerCardVerified && !showWait;

  const prereqsMet = hasProfileImage && hasNic && hasSocialLink;

  const canSavePrereqs = useMemo(() => {
    if (!profile) return false;
    const linkChanged =
      socialLink.trim() &&
      socialLink.trim() !== (profile.socialProfileLinks ?? "").trim();
    return Boolean(profileImageFile || nicFile || linkChanged);
  }, [profile, profileImageFile, nicFile, socialLink]);

  if (profileQuery.isLoading) {
    return <BrokerVerificationDetailSkeleton />;
  }

  if (profileQuery.isError || !profile) {
    return (
      <ErrorState
        title="Unable to load profile"
        description="We need your profile to verify documents. Try again in a moment."
        onRetry={() => void profileQuery.refetch()}
      />
    );
  }

  function validateFiles(input: {
    profileImage?: File | null;
    nic?: File | null;
    brokerCard?: File | null;
  }) {
    if (input.profileImage && !isAllowedProfileImage(input.profileImage)) {
      return "Profile photo must be JPG, PNG, or WebP (10MB max).";
    }
    if (input.nic && !isAllowedNicDocument(input.nic)) {
      return "NIC must be an image or PDF (10MB max).";
    }
    if (input.brokerCard && !isAllowedBrokerCardDocument(input.brokerCard)) {
      return "Broker card must be an image or PDF (10MB max).";
    }
    return null;
  }

  function runSubmit(input: {
    profileImage?: File;
    nicDocument?: File;
    brokerCardDocument?: File;
    socialProfileLinks?: string;
  }) {
    if (!profile) return;
    setLocalError(null);
    const validation = validateFiles({
      profileImage: input.profileImage,
      nic: input.nicDocument,
      brokerCard: input.brokerCardDocument,
    });
    if (validation) {
      setLocalError(validation);
      return;
    }
    submit.mutate(
      {
        socialProfileId: profile.id,
        ...input,
      },
      {
        onSuccess: () => {
          setProfileImageFile(null);
          setNicFile(null);
          setBrokerCardFile(null);
        },
      }
    );
  }

  if (brokerCardVerified) {
    return (
      <div className="space-y-2">
        <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="flex gap-3">
            <ShieldCheck
              className="h-7 w-7 shrink-0 text-[#059669]"
              aria-hidden
            />
            <div className="min-w-0 space-y-1">
              <h2 className="text-base font-semibold">Verified broker</h2>
              <p className="text-sm text-muted-foreground">
                Your broker card is verified. The badge appears on your profile,
                same as mobile.
              </p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (showWait) {
    return (
      <div className="space-y-2">
        <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="flex gap-3">
            <Loader2
              className="h-7 w-7 shrink-0 animate-spin text-amber-600"
              aria-hidden
            />
            <div className="min-w-0 space-y-1">
              <h2 className="text-base font-semibold">Verification in review</h2>
              <p className="text-sm text-muted-foreground">
                We received your broker card. Our team will review it — you will
                see the verified badge once approved.
              </p>
              {status?.latestRequest?.adminNotes ? (
                <p className="text-xs text-muted-foreground">
                  Note: {status.latestRequest.adminNotes}
                </p>
              ) : null}
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {isRejected ? (
        <section className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 shadow-sm">
          <p className="text-sm text-destructive">
            Your previous submission was rejected. Update any missing items and
            submit a new broker card.
          </p>
        </section>
      ) : null}

      <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
        <h3 className="text-sm font-semibold">Requirements</h3>
        <ul className="mt-3 space-y-3">
          <PrerequisiteRow
            done={hasProfileImage}
            label="Profile photo"
            detail={
              profile.profileImage?.url
                ? "Photo on file"
                : profileImageFile
                  ? profileImageFile.name
                  : "Required before broker card upload"
            }
          />
          <PrerequisiteRow
            done={hasNic}
            label="NIC / ID document"
            detail={
              profile.nicDocumentUrl
                ? "Document on file"
                : nicFile
                  ? nicFile.name
                  : "Image or PDF"
            }
          />
          <PrerequisiteRow
            done={hasSocialLink}
            label="Social profile link"
            detail="LinkedIn or similar public profile"
          />
        </ul>
      </section>

      {showSubmitForm ? (
        <form
          className="space-y-4 rounded-lg border border-border bg-card p-4 shadow-sm"
          onSubmit={(event) => event.preventDefault()}
        >
          {!profile.profileImage?.url ? (
            <FilePickButton
              id="broker-profile-photo"
              label="Profile photo"
              accept="image/jpeg,image/png,image/webp"
              disabled={submit.isPending}
              onPick={setProfileImageFile}
              hint={profileImageFile?.name ?? "JPG, PNG, or WebP · 10MB max"}
            />
          ) : null}

          {!profile.nicDocumentUrl ? (
            <FilePickButton
              id="broker-nic"
              label="NIC / ID"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              disabled={submit.isPending}
              onPick={setNicFile}
              hint={nicFile?.name ?? "Image or PDF · 10MB max"}
            />
          ) : null}

          <div className="space-y-1.5">
            <Label htmlFor="broker-social-link">Social profile link</Label>
            <Input
              id="broker-social-link"
              type="url"
              placeholder="https://linkedin.com/in/your-handle"
              value={socialLink}
              onChange={(event) => setSocialLink(event.target.value)}
              disabled={submit.isPending}
            />
          </div>

          {canSavePrereqs ? (
            <Button
              type="button"
              variant="secondary"
              disabled={submit.isPending}
              onClick={() =>
                runSubmit({
                  profileImage: profileImageFile ?? undefined,
                  nicDocument: nicFile ?? undefined,
                  socialProfileLinks: socialLink.trim() || undefined,
                })
              }
            >
              {submit.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
              ) : null}
              Save requirements
            </Button>
          ) : null}

          <div className="border-t border-border pt-4">
            <FilePickButton
              id="broker-card-doc"
              label="Broker card"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              disabled={submit.isPending || !prereqsMet}
              onPick={setBrokerCardFile}
              hint={
                brokerCardFile?.name ??
                (prereqsMet
                  ? "Image or PDF · 10MB max"
                  : "Complete requirements above first")
              }
            />
            <Button
              type="button"
              className="mt-4 w-full sm:w-auto"
              disabled={
                submit.isPending || !prereqsMet || !brokerCardFile
              }
              onClick={() =>
                runSubmit({
                  profileImage: profileImageFile ?? undefined,
                  nicDocument: nicFile ?? undefined,
                  brokerCardDocument: brokerCardFile ?? undefined,
                  socialProfileLinks: socialLink.trim() || undefined,
                })
              }
            >
              {submit.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
              ) : null}
              Submit for verification
            </Button>
          </div>

          {localError ? (
            <p className="text-sm text-destructive" role="alert">
              {localError}
            </p>
          ) : null}
        </form>
      ) : null}
    </div>
  );
}
