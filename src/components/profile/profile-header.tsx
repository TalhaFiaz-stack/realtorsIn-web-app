"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { Avatar, AvatarImage, AvatarPlaceholderFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { OpenToAvatarFrame } from "@/components/profile/open-to-avatar-frame";
import { ProfilePhotoCropDialog } from "@/components/profile/profile-photo-crop-dialog";
import {
  ProfileNameBadges,
  ProfileStatusChips,
} from "@/components/profile/profile-badges";
import { ProfileConnectionActions } from "@/components/profile/profile-connection-actions";
import { ProfileShareMenu } from "@/components/profile/profile-share-menu";
import { ProfileHandle } from "@/components/shared/profile-handle";
import { RemoteImage } from "@/components/shared/remote-image";
import { StoryAvatarRing } from "@/components/stories/story-avatar";
import { StoryViewer } from "@/components/stories/story-viewer";
import { useStoryUserGroup } from "@/features/stories/hooks/use-stories";
import { useProfilePhotoUpload } from "@/features/profile/hooks/use-profile-photo-upload";
import type { SocialProfile } from "@/features/profile/types/profile.types";

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function ProfileHeader({
  profile,
  onEditIntro,
  onOpenTo,
  onAddSection,
}: {
  profile: SocialProfile;
  onEditIntro?: () => void;
  onOpenTo?: () => void;
  onAddSection?: () => void;
}) {
  const photoUpload = useProfilePhotoUpload(
    profile.isOwn ? profile.id : undefined,
    { coverCropPreset: "profile" }
  );
  const { group: storyGroup, groups: storyGroups } = useStoryUserGroup(
    profile.userId
  );
  const [storyOpen, setStoryOpen] = useState(false);
  const hasStories = Boolean(storyGroup?.stories.length);

  const headline =
    profile.description ??
    profile.positions.find((item) => item.isCurrentlyWorking)?.profileHeadline;

  const featuredEducation =
    profile.educations.find((item) => item.id === profile.featuredEducationId)
      ?.school ?? null;
  const featuredPositionTitle =
    profile.positions.find((item) => item.id === profile.featuredPositionId)
      ?.title ?? null;
  const roleCompanyLine = [
    profile.showRole ? profile.userRole : null,
    profile.showCompany ? profile.company : null,
  ]
    .filter(Boolean)
    .join(" - ");

  return (
    <section className="overflow-hidden rounded-[var(--radius)] border border-border bg-card shadow-sm">
      <div className="relative h-36 bg-muted sm:h-48">
        {profile.coverImage?.url ? (
          <RemoteImage
            src={profile.coverImage.url}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 672px"
            className="object-cover"
            fallbackClassName="absolute inset-0"
            unoptimized
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/80 via-primary/40 to-accent" />
        )}
        {profile.isOwn ? (
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
            <button
              type="button"
              onClick={() => photoUpload.openCoverPicker()}
              disabled={photoUpload.isPending}
              className="absolute right-3 top-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background/90 text-foreground shadow-sm backdrop-blur-sm disabled:opacity-60"
              aria-label="Change cover photo"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          </>
        ) : null}
      </div>

      <div className="relative px-4 pb-5 sm:px-6">
        <div className="absolute right-4 top-3 z-10 flex items-center gap-2 sm:right-6 sm:top-4">
          <ProfileShareMenu profile={profile} />
          {profile.isOwn ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="hidden h-9 rounded-full sm:inline-flex"
              onClick={onEditIntro}
            >
              <Pencil className="mr-1.5 h-3.5 w-3.5" />
              Edit profile
            </Button>
          ) : null}
        </div>

        <div className="-mt-11 flex items-end gap-3 pr-[3.25rem] sm:pr-0">
          <div className="relative shrink-0">
            {hasStories && storyGroup ? (
              <button
                type="button"
                onClick={() => setStoryOpen(true)}
                className="block rounded-full"
                aria-label={`View ${profile.fullName}'s story`}
              >
                <StoryAvatarRing
                  hasUnseen={storyGroup.hasUnseen}
                  stories={storyGroup.stories}
                  className="h-[98px] w-[98px]"
                >
                  <div className="h-[90px] w-[90px] overflow-hidden rounded-full border-2 border-card bg-muted shadow-sm">
                    <Avatar className="h-full w-full rounded-full">
                      {profile.profileImage?.url ? (
                        <AvatarImage src={profile.profileImage.url} alt="" />
                      ) : null}
                      <AvatarPlaceholderFallback />
                    </Avatar>
                  </div>
                </StoryAvatarRing>
              </button>
            ) : (
              <div className="relative h-[90px] w-[90px]">
                <div className="h-full w-full overflow-hidden rounded-full border-[3px] border-card bg-muted shadow-sm">
                  <Avatar className="h-full w-full rounded-full">
                    {profile.profileImage?.url ? (
                      <AvatarImage src={profile.profileImage.url} alt="" />
                    ) : null}
                    <AvatarPlaceholderFallback />
                  </Avatar>
                </div>
              </div>
            )}
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
              <OpenToAvatarFrame openTo={profile.openTo} />
            </div>
            {profile.isOwn ? (
              <>
                <input
                  ref={photoUpload.profileInputRef}
                  type="file"
                  accept={photoUpload.accept}
                  className="sr-only"
                  onChange={(event) =>
                    photoUpload.onProfileFileChange(event.target.files?.[0])
                  }
                />
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    photoUpload.openProfilePicker();
                  }}
                  disabled={photoUpload.isPending}
                  className="absolute -bottom-0.5 -right-0.5 z-10 inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground shadow-sm disabled:opacity-60"
                  aria-label="Change profile photo"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </>
            ) : null}
          </div>
        </div>

        <div className="mt-3 space-y-2.5">
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
            <h1 className="text-xl font-semibold leading-none tracking-tight text-foreground sm:text-2xl">
              {profile.fullName}
            </h1>
            <ProfileNameBadges profile={profile} />
          </div>

          <ProfileStatusChips profile={profile} />

          {profile.userName ? (
            <ProfileHandle userName={profile.userName} className="text-sm" />
          ) : null}

          {headline ? (
            <p className="max-w-2xl text-[15px] leading-snug text-foreground/90">
              {headline}
            </p>
          ) : null}

          {/* Mobile SocialProfile detail lines: school, title, role-company */}
          <div className="space-y-1 text-sm font-medium text-foreground">
            {featuredEducation ? <p>{featuredEducation}</p> : null}
            {featuredPositionTitle ? <p>{featuredPositionTitle}</p> : null}
            {roleCompanyLine ? <p>{roleCompanyLine}</p> : null}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-0.5 text-sm">
            <StatLink
              value={profile.connectionsCount}
              label={profile.connectionsCount === 1 ? "connection" : "connections"}
              href={profile.isOwn ? "/connections" : undefined}
            />
            <StatLink value={profile.postsCount} label="posts" />
            <StatLink value={profile.likesCount} label="likes" />
          </div>

          {profile.isOwn ? (
            <div className="flex flex-wrap gap-2 pt-1.5">
              <Button type="button" size="sm" className="h-9 rounded-full px-4" onClick={onOpenTo}>
                Open to
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 rounded-full border-primary/60 px-4 text-primary hover:bg-primary/10 hover:text-primary"
                onClick={onAddSection}
              >
                <Plus className="h-4 w-4" />
                Add section
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 rounded-full px-4 sm:hidden"
                onClick={onEditIntro}
              >
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
              <Button asChild variant="outline" size="sm" className="h-9 rounded-full px-4">
                <Link href="/create">Create post</Link>
              </Button>
            </div>
          ) : (
            <ProfileConnectionActions profile={profile} />
          )}
        </div>
      </div>
      <StoryViewer
        open={storyOpen}
        groups={storyGroups}
        startUserId={storyGroup?.userId ?? null}
        onClose={() => setStoryOpen(false)}
      />
      <ProfilePhotoCropDialog
        session={photoUpload.cropSession}
        isSaving={photoUpload.isPending}
        onCancel={photoUpload.cancelCrop}
        onConfirm={photoUpload.confirmCrop}
      />
    </section>
  );
}

function StatLink({
  value,
  label,
  href,
}: {
  value: number;
  label: string;
  href?: string;
}) {
  const body = (
    <>
      <span className="font-semibold tabular-nums text-foreground">{value.toLocaleString()}</span>{" "}
      {label}
    </>
  );
  if (href) {
    return (
      <Link href={href} className="text-muted-foreground hover:text-primary hover:underline">
        {body}
      </Link>
    );
  }
  return <span className="text-muted-foreground">{body}</span>;
}
