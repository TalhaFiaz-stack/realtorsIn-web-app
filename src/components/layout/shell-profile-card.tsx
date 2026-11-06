"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Bookmark, Camera, Loader2, Mail, Pencil, Phone } from "lucide-react";
import { ProfilePhotoCropDialog } from "@/components/profile/profile-photo-crop-dialog";
import { ProfileNameBadges } from "@/components/profile/profile-badges";
import { ProfileShareMenu } from "@/components/profile/profile-share-menu";
import { StoryAvatarRing } from "@/components/stories/story-avatar";
import { StoryViewer } from "@/components/stories/story-viewer";
import { ProfileHandle } from "@/components/shared/profile-handle";
import {
  Avatar,
  AvatarImage,
  AvatarPlaceholderFallback,
} from "@/components/ui/avatar";
import { RemoteImage } from "@/components/shared/remote-image";
import type { PublicMember } from "@/features/auth/types/auth.types";
import { useStoriesFeed } from "@/features/stories/hooks/use-stories";
import { useProfilePhotoUpload } from "@/features/profile/hooks/use-profile-photo-upload";
import { useOwnProfile } from "@/features/profile/hooks/use-profile";
import type { SocialProfile } from "@/features/profile/types/profile.types";

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function formatCount(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

function displayPhone(
  profile: SocialProfile | undefined,
  member: PublicMember,
): string | null {
  const formatted = profile?.formattedPhone?.trim();
  if (formatted) return formatted;
  const phone = profile?.phone?.trim() || member.phone?.trim();
  if (!phone) return null;
  if (phone.startsWith("+")) return phone;
  const dial =
    profile?.phoneDialCode?.trim() || member.phoneDialCode?.trim() || "";
  const digits = dial.replace(/\D/g, "");
  if (digits) return `+${digits} ${phone}`;
  return phone;
}

function displayEmail(
  profile: SocialProfile | undefined,
  member: PublicMember,
): string | null {
  const email = profile?.email?.trim() || member.email?.trim();
  return email || null;
}

function headlineFromProfile(
  profile: SocialProfile | undefined,
): string | null {
  if (!profile) return null;
  const roleCompany = [
    profile.showRole ? profile.userRole : null,
    profile.showCompany ? profile.company : null,
  ]
    .filter(Boolean)
    .join(" at ");
  if (roleCompany) return roleCompany;
  if (profile.userRole && profile.company) {
    return `${profile.userRole} at ${profile.company}`;
  }
  return profile.description ?? profile.userRole ?? profile.company;
}

export function ShellProfileCard({ member }: { member: PublicMember }) {
  const { t } = useTranslation();
  const { data: profile } = useOwnProfile();
  const storiesQuery = useStoriesFeed();
  const [storyViewerOpen, setStoryViewerOpen] = useState(false);
  const storyGroups = storiesQuery.data?.groups ?? [];
  const ownStoryGroup = storyGroups.find((group) => group.isOwn) ?? null;
  const hasOwnStory = Boolean(ownStoryGroup?.stories?.length);
  const displayName =
    profile?.fullName ||
    member.fullName ||
    member.name ||
    member.userName ||
    "Member";
  const handle = profile?.userName || member.userName;
  const avatarUrl = profile?.profileImage?.url || member.avatarUrl;
  const coverUrl = profile?.coverImage?.url || member.coverUrl;
  const headline =
    headlineFromProfile(profile) ||
    [member.userRole, member.company].filter(Boolean).join(" at ") ||
    member.description;
  const location = profile?.location || member.location;
  const phone = displayPhone(profile, member);
  const email = displayEmail(profile, member);
  const completion =
    profile?.profileCompletionPercentage ?? member.profileCompletionPercentage;
  const viewers = profile?.analytics?.profileViewers ?? null;
  const impressions = profile?.analytics?.postImpressions ?? null;
  const connections = profile?.connectionsCount ?? null;
  const photoUpload = useProfilePhotoUpload(profile?.id, {
    coverCropPreset: "shell",
  });

  return (
    <section className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="relative h-14 bg-[#cfd9de]">
        {coverUrl ? (
          <RemoteImage
            src={coverUrl}
            alt=""
            fill
            sizes="240px"
            className="object-cover"
            fallbackClassName="absolute inset-0 bg-[#cfd9de]"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-[#b0bec5] via-[#cfd9de] to-[#dfe6ea]" />
        )}
        {profile ? (
          <>
            <input
              ref={photoUpload.coverInputRef}
              type="file"
              accept={photoUpload.accept}
              className="sr-only"
              onChange={(event) =>
                photoUpload.onCoverFileChange(event.target.files?.[0])
              }
            />
            <div className="absolute end-1.5 top-1.5 z-10 flex items-center gap-1">
              <button
                type="button"
                onClick={() => photoUpload.openCoverPicker()}
                disabled={photoUpload.isPending}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/40 bg-black/45 text-white shadow-sm backdrop-blur-sm hover:bg-black/60 disabled:opacity-60"
                aria-label="Change cover photo"
              >
                {photoUpload.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Camera className="h-3.5 w-3.5" />
                )}
              </button>
              <ProfileShareMenu profile={profile} compact />
            </div>
          </>
        ) : null}
      </div>

      <div className="relative px-3 pb-3 pt-0">
        {profile ? (
          <input
            ref={photoUpload.profileInputRef}
            type="file"
            accept={photoUpload.accept}
            className="sr-only"
            onChange={(event) =>
              photoUpload.onProfileFileChange(event.target.files?.[0])
            }
          />
        ) : null}
        {hasOwnStory && ownStoryGroup ? (
          <div className="relative -mt-8 inline-block">
            <button
              type="button"
              onClick={() => setStoryViewerOpen(true)}
              className="block rounded-full text-start"
              aria-label="View your story"
            >
              <StoryAvatarRing
                hasUnseen={ownStoryGroup.hasUnseen}
                className="h-[68px] w-[68px]"
              >
                <Avatar className="h-16 w-16 border-2 border-card">
                  {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
                  <AvatarPlaceholderFallback />
                </Avatar>
              </StoryAvatarRing>
            </button>
            {profile ? (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  photoUpload.openProfilePicker();
                }}
                disabled={photoUpload.isPending}
                className="absolute bottom-0 end-0 z-10 inline-flex h-6 w-6 items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground shadow-sm disabled:opacity-60"
                aria-label="Change profile photo"
              >
                <Pencil className="h-3 w-3" />
              </button>
            ) : null}
          </div>
        ) : (
          <div className="relative -mt-8 inline-block">
            <Link href="/me" className="block rounded-full ring-2 ring-card">
              <Avatar className="h-16 w-16">
                {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
                <AvatarPlaceholderFallback />
              </Avatar>
            </Link>
            {profile ? (
              <button
                type="button"
                onClick={() => photoUpload.openProfilePicker()}
                disabled={photoUpload.isPending}
                className="absolute bottom-0 end-0 z-10 inline-flex h-6 w-6 items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground shadow-sm disabled:opacity-60"
                aria-label="Change profile photo"
              >
                <Pencil className="h-3 w-3" />
              </button>
            ) : null}
          </div>
        )}

        <StoryViewer
          open={storyViewerOpen}
          groups={storyGroups}
          startUserId={ownStoryGroup?.userId ?? null}
          onClose={() => setStoryViewerOpen(false)}
        />

        <ProfilePhotoCropDialog
          session={photoUpload.cropSession}
          isSaving={photoUpload.isPending}
          onCancel={photoUpload.cancelCrop}
          onConfirm={photoUpload.confirmCrop}
        />

        <Link href="/me" className="mt-2 block group">
          <span className="inline-flex max-w-full items-center gap-1">
            <p className="truncate text-[15px] font-semibold text-foreground group-hover:underline">
              {displayName}
            </p>
            {profile ? <ProfileNameBadges profile={profile} /> : null}
          </span>
        </Link>

        {handle ? (
          <ProfileHandle userName={handle} className="mt-0.5 text-xs" />
        ) : null}

        {headline ? (
          <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-muted-foreground">
            {headline}
          </p>
        ) : null}

        {location ? (
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {location}
          </p>
        ) : null}

        {phone ? (
          <a
            href={`tel:${phone.replace(/\s/g, "")}`}
            className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground hover:underline"
          >
            <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="truncate">{phone}</span>
          </a>
        ) : null}

        {email ? (
          <a
            href={`mailto:${email}`}
            className="mt-0.5 flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground hover:underline"
          >
            <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="truncate">{email}</span>
          </a>
        ) : null}

        {completion < 100 ? (
          <Link
            href="/me"
            className="mt-2 block text-xs font-semibold text-primary hover:underline"
          >
            Profile {completion}% complete · Finish setup
          </Link>
        ) : null}
      </div>

      <div className="border-t border-border px-3 py-2">
        <StatRow
          label={t("Profile viewers")}
          value={viewers != null ? formatCount(viewers) : "—"}
          href="/me/viewers"
        />
        <StatRow
          label={t("Post impressions")}
          value={impressions != null ? formatCount(impressions) : "—"}
          href="/me/analytics"
        />
      </div>

      <div className="border-t border-border">
        <Link
          href="/connections"
          className="flex items-center justify-between px-3 py-2.5 text-sm hover:bg-muted"
        >
          <span>
            <span className="block text-xs text-muted-foreground">
              {t("Connections")}
            </span>
            <span className="font-semibold text-foreground">
              {t("Build your professional network")}
            </span>
          </span>
          <span className="text-sm font-semibold text-primary">
            {connections != null ? formatCount(connections) : t("Network")}
          </span>
        </Link>
      </div>

      <div className="border-t border-border">
        <Link
          href="/activities"
          className="flex items-center gap-2 px-3 py-2.5 text-sm font-semibold text-foreground hover:bg-muted"
        >
          <Bookmark className="h-4 w-4 text-muted-foreground" />
          {t("Saved Posts")}
        </Link>
      </div>
    </section>
  );
}

function StatRow({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between py-1 text-xs hover:underline"
    >
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-primary">{value}</span>
    </Link>
  );
}
