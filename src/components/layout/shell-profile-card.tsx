"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Bookmark, Camera, Loader2, MapPin, Pencil } from "lucide-react";
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


function formatCount(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
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
  const completion =
    profile?.profileCompletionPercentage ?? member.profileCompletionPercentage;
  const viewers = profile?.analytics?.profileViewers ?? null;
  const impressions = profile?.analytics?.postImpressions ?? null;
  const connections = profile?.connectionsCount ?? null;
  const photoUpload = useProfilePhotoUpload(profile?.id, {
    coverCropPreset: "shell",
  });

  return (
    <section className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <div className="relative h-16 bg-[#cfd9de]">
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
          <div className="absolute inset-0 bg-gradient-to-br from-primary/70 via-primary/40 to-sky-300/40" />
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

      <div className="relative flex flex-col items-center px-4 pb-4 pt-0 text-center">
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
          <div className="relative -mt-9 inline-block">
            <button
              type="button"
              onClick={() => setStoryViewerOpen(true)}
              className="block rounded-full text-start"
              aria-label="View your story"
            >
              <StoryAvatarRing
                hasUnseen={ownStoryGroup.hasUnseen}
                stories={ownStoryGroup.stories}
                className="h-[80px] w-[80px]"
              >
                <Avatar className="h-[72px] w-[72px] border-2 border-card">
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
          <div className="relative -mt-9 inline-block">
            <Link href="/me" className="block rounded-full ring-[3px] ring-card">
              <Avatar className="h-[72px] w-[72px]">
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

        <Link href="/me" className="group mt-2 block max-w-full">
          <span className="inline-flex max-w-full items-center justify-center gap-1">
            <p className="truncate text-base font-semibold text-foreground group-hover:underline">
              {displayName}
            </p>
            {profile ? <ProfileNameBadges profile={profile} /> : null}
          </span>
        </Link>

        {handle ? (
          <ProfileHandle userName={handle} className="mt-0.5 text-xs" />
        ) : null}

        {headline ? (
          <p className="mt-1.5 line-clamp-2 text-xs leading-snug text-foreground/80">
            {headline}
          </p>
        ) : null}

        {location ? (
          <p className="mt-1 flex max-w-full items-center gap-1 text-[11px] text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" aria-hidden />
            <span className="truncate">{location}</span>
          </p>
        ) : null}

        {completion < 100 ? (
          <Link
            href="/me"
            className="mt-3 block w-full rounded-lg bg-muted/50 px-3 py-2 text-start transition-colors hover:bg-muted"
          >
            <span className="flex items-center justify-between text-[11px]">
              <span className="font-medium text-foreground">Complete your profile</span>
              <span className="font-semibold text-primary">{completion}%</span>
            </span>
            <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-border">
              <span
                className="block h-full rounded-full bg-primary transition-[width]"
                style={{ width: `${Math.max(4, Math.min(100, completion))}%` }}
              />
            </span>
          </Link>
        ) : null}
      </div>

      <div className="grid grid-cols-3 divide-x divide-border/70 border-t border-border/70">
        <StatTile
          label={t("Viewers")}
          value={viewers != null ? formatCount(viewers) : "—"}
          href="/me/viewers"
        />
        <StatTile
          label={t("Impressions")}
          value={impressions != null ? formatCount(impressions) : "—"}
          href="/me/analytics"
        />
        <StatTile
          label={t("Connections")}
          value={connections != null ? formatCount(connections) : "—"}
          href="/connections"
        />
      </div>

      <Link
        href="/activities"
        className="flex items-center gap-2.5 border-t border-border/70 px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted/60"
      >
        <Bookmark className="h-4 w-4 text-muted-foreground" aria-hidden />
        {t("Saved Posts")}
      </Link>
    </section>
  );
}

function StatTile({
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
      className="flex flex-col items-center gap-0.5 px-1 py-3 transition-colors hover:bg-muted/60"
    >
      <span className="text-sm font-semibold tabular-nums text-foreground">{value}</span>
      <span className="truncate text-[11px] text-muted-foreground">{label}</span>
    </Link>
  );
}
