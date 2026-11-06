"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ProfileAboutPanel,
  type ProfileAboutPanelVariant,
} from "@/components/profile/profile-about-panel";
import { ProfileAboutDialog } from "@/components/profile/profile-about-dialog";
import { ProfileCertificateDialog } from "@/components/profile/profile-certificate-dialog";
import { ProfileEditIntroDialog } from "@/components/profile/profile-edit-intro-dialog";
import { ProfileEducationDialog } from "@/components/profile/profile-education-dialog";
import { ProfilePositionDialog } from "@/components/profile/profile-position-dialog";
import { ProfileSkillDialog } from "@/components/profile/profile-skill-dialog";
import { useConfirm } from "@/components/common/confirm-provider";
import { ErrorState } from "@/components/states/error-state";
import { SettingsFormSkeleton } from "@/components/settings/settings-detail-skeleton";
import { CONFIRM_DELETE_PROFILE_ITEM } from "@/constants/confirm-copy";
import {
  profileErrorMessage,
  useOwnProfile,
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

type DialogState =
  | { type: "none" }
  | { type: "editIntro" }
  | { type: "about" }
  | { type: "position"; item?: ProfilePosition | null }
  | { type: "education"; item?: ProfileEducation | null }
  | { type: "skill"; item?: ProfileSkill | null }
  | { type: "certificate"; item?: ProfileCertificate | null };

export function OwnProfileManageScreen({
  view,
  autoOpenAbout,
}: {
  view: ProfileAboutPanelVariant | "edit";
  autoOpenAbout?: boolean;
}) {
  const router = useRouter();
  const query = useOwnProfile();
  const { confirm } = useConfirm();
  const [dialog, setDialog] = useState<DialogState>({ type: "none" });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const deletePosition = useDeletePosition();
  const deleteEducation = useDeleteEducation();
  const deleteSkill = useDeleteSkill();
  const deleteCertificate = useDeleteCertificate();

  useEffect(() => {
    if (!query.data) return;
    if (view === "about" && autoOpenAbout) {
      setDialog({ type: "about" });
    }
  }, [autoOpenAbout, query.data, view]);

  if (query.isLoading) {
    return <SettingsFormSkeleton />;
  }

  if (query.error || !query.data) {
    return (
      <ErrorState
        title="Profile unavailable"
        description={profileErrorMessage(query.error)}
        onRetry={() => void query.refetch()}
      />
    );
  }

  const profile = query.data;

  function closeDialog() {
    setDialog({ type: "none" });
    if (view === "about" && autoOpenAbout) {
      router.push("/me/about");
    }
  }

  async function runDelete(key: string, runner: () => Promise<unknown>) {
    const ok = await confirm(CONFIRM_DELETE_PROFILE_ITEM);
    if (!ok) return;
    setDeletingId(key);
    try {
      await runner();
    } finally {
      setDeletingId(null);
    }
  }

  if (view === "edit") {
    return (
      <ProfileEditIntroDialog
        open
        onOpenChange={(open) => {
          if (!open) router.push("/me");
        }}
        profile={profile}
      />
    );
  }

  return (
    <>
      <ProfileAboutPanel
        profile={profile}
        variant={view}
        actions={{
          onEditAbout: () => setDialog({ type: "about" }),
          onAddPosition: () => setDialog({ type: "position", item: null }),
          onEditPosition: (item) => setDialog({ type: "position", item }),
          onDeletePosition: (id) =>
            void runDelete(`position-${id}`, () =>
              deletePosition.mutateAsync(id)
            ),
          onAddEducation: () => setDialog({ type: "education", item: null }),
          onEditEducation: (item) => setDialog({ type: "education", item }),
          onDeleteEducation: (id) =>
            void runDelete(`education-${id}`, () =>
              deleteEducation.mutateAsync(id)
            ),
          onAddSkill: () => setDialog({ type: "skill", item: null }),
          onEditSkill: (item) => setDialog({ type: "skill", item }),
          onDeleteSkill: (id) =>
            void runDelete(`skill-${id}`, () => deleteSkill.mutateAsync(id)),
          onAddCertificate: () =>
            setDialog({ type: "certificate", item: null }),
          onEditCertificate: (item) =>
            setDialog({ type: "certificate", item }),
          onDeleteCertificate: (id) =>
            void runDelete(`certificate-${id}`, () =>
              deleteCertificate.mutateAsync(id)
            ),
          deletingId,
        }}
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
    </>
  );
}
