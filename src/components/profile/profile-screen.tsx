"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import {
  ShellBackButton,
  ShellBackLink,
} from "@/components/navigation/shell-back-link";
import { ShellBackRow } from "@/components/navigation/shell-back-row";
import { ProfileAboutDialog } from "@/components/profile/profile-about-dialog";
import { ProfileAboutPanel } from "@/components/profile/profile-about-panel";
import {
  ProfileAddSectionDialog,
  type ProfileAddSectionTarget,
} from "@/components/profile/profile-add-section-dialog";
import { ProfileAnalyticsCards } from "@/components/profile/profile-analytics-cards";
import { ProfileCertificateDialog } from "@/components/profile/profile-certificate-dialog";
import { ProfileEditIntroDialog } from "@/components/profile/profile-edit-intro-dialog";
import { ProfileEducationDialog } from "@/components/profile/profile-education-dialog";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileOpenToDialog } from "@/components/profile/profile-open-to-dialog";
import { ProfilePositionDialog } from "@/components/profile/profile-position-dialog";
import { ProfilePostsPanel } from "@/components/profile/profile-posts-panel";
import { ProfileSkillDialog } from "@/components/profile/profile-skill-dialog";
import { ProfileConnectionSuggestions } from "@/components/profile/profile-connection-suggestions";
import { MeProfileLinksPanel } from "@/components/profile/me-profile-links-panel";
import { useConfirm } from "@/components/common/confirm-provider";
import { ErrorState } from "@/components/states/error-state";
import { CONFIRM_DELETE_PROFILE_ITEM } from "@/constants/confirm-copy";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  profileErrorMessage,
  useOwnProfile,
  useProfileById,
  useProfileByUsername,
} from "@/features/profile/hooks/use-profile";
import {
  useDeleteCertificate,
  useDeleteEducation,
  useDeletePosition,
  useDeleteSkill,
} from "@/features/profile/hooks/use-profile-mutations";
import type {
  ProfileCertificate,
  ProfileEducation,
  ProfilePosition,
  ProfileSkill,
} from "@/features/profile/types/profile.types";
import { ApiError } from "@/lib/api/errors";

type DialogState =
  | { type: "none" }
  | { type: "openTo" }
  | { type: "editIntro" }
  | { type: "addSection" }
  | { type: "about" }
  | { type: "position"; item?: ProfilePosition | null }
  | { type: "education"; item?: ProfileEducation | null }
  | { type: "skill"; item?: ProfileSkill | null }
  | { type: "certificate"; item?: ProfileCertificate | null };

export function ProfileScreen({
  userId,
  username,
  defaultTab = "about",
}: {
  /** Another member's social profile id (`/profile/[id]`). */
  userId?: number;
  /** Handle route (`/u/[username]`). */
  username?: string;
  defaultTab?: "about" | "posts";
} = {}) {
  const { t } = useTranslation();
  const viewingByUsername = Boolean(username?.trim());
  const viewingById = userId != null && userId > 0;
  const viewingOther = viewingByUsername || viewingById;

  const ownQuery = useOwnProfile();
  const byIdQuery = useProfileById(viewingById ? userId! : null);
  const byUsernameQuery = useProfileByUsername(
    viewingByUsername ? username! : null
  );

  const query = viewingByUsername
    ? byUsernameQuery
    : viewingById
      ? byIdQuery
      : ownQuery;

  const router = useRouter();
  const { confirm } = useConfirm();
  const [dialog, setDialog] = useState<DialogState>({ type: "none" });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const deletePosition = useDeletePosition();
  const deleteEducation = useDeleteEducation();
  const deleteSkill = useDeleteSkill();
  const deleteCertificate = useDeleteCertificate();

  function goBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/feed");
  }

  if (query.isLoading || query.isPending) {
    return (
      <div className="space-y-3">
        {viewingOther ? <ProfileBackNav onBack={goBack} /> : null}
        <ProfileSkeleton />
      </div>
    );
  }

  if (query.error || !query.data) {
    const sessionExpired =
      query.error instanceof ApiError &&
      query.error.code === "SESSION_EXPIRED";
    const notFound =
      query.error instanceof ApiError && query.error.code === "NOT_FOUND";
    const nextPath = viewingByUsername
      ? `/u/${encodeURIComponent(username!.trim())}`
      : viewingById
        ? `/profile/${userId}`
        : "/me";
    return (
      <div className="space-y-4">
        {viewingOther ? <ProfileBackNav onBack={goBack} /> : null}
        <ErrorState
          title={
            sessionExpired
              ? "Session expired"
              : notFound
                ? "Profile not found"
                : "Profile unavailable"
          }
          description={profileErrorMessage(query.error)}
          onRetry={sessionExpired ? undefined : () => void query.refetch()}
        />
        {sessionExpired ? (
          <div className="flex justify-center">
            <Button asChild>
              <Link href={`/login?next=${encodeURIComponent(nextPath)}`}>
                Sign in
              </Link>
            </Button>
          </div>
        ) : viewingOther ? (
          <div className="flex justify-center gap-2">
            <Button asChild variant="outline">
              <ShellBackLink href="/feed" label={t("Home")} />
            </Button>
            <Button asChild>
              <Link href="/search">Search people</Link>
            </Button>
          </div>
        ) : null}
      </div>
    );
  }

  const profile = query.data;

  function closeDialog() {
    setDialog({ type: "none" });
  }

  function onSelectAddSection(target: ProfileAddSectionTarget) {
    setDialog({ type: target, item: null });
  }

  async function runDelete(
    key: string,
    runner: () => Promise<unknown>
  ) {
    const ok = await confirm(CONFIRM_DELETE_PROFILE_ITEM);
    if (!ok) return;
    setDeletingId(key);
    try {
      await runner();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-3">
      {viewingOther ? <ProfileBackNav onBack={goBack} /> : null}
      <ProfileHeader
        profile={profile}
        onEditIntro={
          profile.isOwn ? () => setDialog({ type: "editIntro" }) : undefined
        }
        onOpenTo={
          profile.isOwn ? () => setDialog({ type: "openTo" }) : undefined
        }
        onAddSection={
          profile.isOwn ? () => setDialog({ type: "addSection" }) : undefined
        }
      />
      {profile.isOwn && profile.analytics ? (
        <ProfileAnalyticsCards analytics={profile.analytics} />
      ) : null}

      {profile.isOwn ? <MeProfileLinksPanel /> : null}

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="posts">Realtor&apos;s In</TabsTrigger>
        </TabsList>
        <TabsContent value="about" className="mt-3 space-y-3">
          <ProfileAboutPanel
            profile={profile}
            actions={
              profile.isOwn
                ? {
                    onEditAbout: () => setDialog({ type: "about" }),
                    onAddPosition: () =>
                      setDialog({ type: "position", item: null }),
                    onEditPosition: (item) =>
                      setDialog({ type: "position", item }),
                    onDeletePosition: (id) =>
                      void runDelete(`position-${id}`, () =>
                        deletePosition.mutateAsync(id)
                      ),
                    onAddEducation: () =>
                      setDialog({ type: "education", item: null }),
                    onEditEducation: (item) =>
                      setDialog({ type: "education", item }),
                    onDeleteEducation: (id) =>
                      void runDelete(`education-${id}`, () =>
                        deleteEducation.mutateAsync(id)
                      ),
                    onAddSkill: () => setDialog({ type: "skill", item: null }),
                    onEditSkill: (item) => setDialog({ type: "skill", item }),
                    onDeleteSkill: (id) =>
                      void runDelete(`skill-${id}`, () =>
                        deleteSkill.mutateAsync(id)
                      ),
                    onAddCertificate: () =>
                      setDialog({ type: "certificate", item: null }),
                    onEditCertificate: (item) =>
                      setDialog({ type: "certificate", item }),
                    onDeleteCertificate: (id) =>
                      void runDelete(`certificate-${id}`, () =>
                        deleteCertificate.mutateAsync(id)
                      ),
                    deletingId,
                  }
                : undefined
            }
          />
          {profile.isOwn ? <ProfileConnectionSuggestions /> : null}
        </TabsContent>
        <TabsContent value="posts" className="mt-3 space-y-3">
          <ProfilePostsPanel
            userProfileId={profile.userId}
            isOwn={profile.isOwn}
            composerDisplayName={profile.fullName}
            composerAvatarUrl={profile.profileImage?.url}
          />
        </TabsContent>
      </Tabs>

      <ProfileOpenToDialog
        open={dialog.type === "openTo"}
        onOpenChange={(open) => !open && closeDialog()}
        current={profile.openTo}
      />
      <ProfileEditIntroDialog
        open={dialog.type === "editIntro"}
        onOpenChange={(open) => !open && closeDialog()}
        profile={profile}
      />
      <ProfileAddSectionDialog
        open={dialog.type === "addSection"}
        onOpenChange={(open) => !open && closeDialog()}
        onSelect={onSelectAddSection}
      />
      <ProfileAboutDialog
        open={dialog.type === "about"}
        onOpenChange={(open) => !open && closeDialog()}
        profile={profile}
      />
      <ProfilePositionDialog
        open={dialog.type === "position"}
        onOpenChange={(open) => !open && closeDialog()}
        initial={dialog.type === "position" ? dialog.item : null}
        skills={profile.skills}
      />
      <ProfileEducationDialog
        open={dialog.type === "education"}
        onOpenChange={(open) => !open && closeDialog()}
        initial={dialog.type === "education" ? dialog.item : null}
        skills={profile.skills}
      />
      <ProfileSkillDialog
        open={dialog.type === "skill"}
        onOpenChange={(open) => !open && closeDialog()}
        initial={dialog.type === "skill" ? dialog.item : null}
        positions={profile.positions}
        educations={profile.educations}
      />
      <ProfileCertificateDialog
        open={dialog.type === "certificate"}
        onOpenChange={(open) => !open && closeDialog()}
        initial={dialog.type === "certificate" ? dialog.item : null}
        skills={profile.skills}
      />
    </div>
  );
}

function ProfileBackNav({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  return (
    <ShellBackRow className="mb-0.5">
      <ShellBackButton label={t("Back")} onClick={onBack} />
    </ShellBackRow>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-3" aria-busy aria-label="Loading profile">
      <div className="overflow-hidden rounded-[var(--radius)] border border-border bg-card shadow-sm">
        <Skeleton className="h-40 w-full rounded-none sm:h-52" />
        <div className="space-y-3 px-4 pb-4 pt-0">
          <Skeleton className="-mt-12 h-24 w-24 rounded-full border-4 border-card" />
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
      <Skeleton className="h-28 w-full rounded-[var(--radius)]" />
      <Skeleton className="h-64 w-full rounded-[var(--radius)]" />
    </div>
  );
}
