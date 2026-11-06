"use client";

import { useCallback, useRef, useState } from "react";
import type { ProfilePhotoCropSession } from "@/components/profile/profile-photo-crop-dialog";
import {
  PROFILE_PHOTO_CROP_ASPECT,
  type ProfileCoverCropPreset,
  coverCropAspectForPreset,
} from "@/features/profile/constants/profile-photo.constants";
import { useUpdateSocialPic } from "@/features/profile/hooks/use-profile-mutations";
import { showAppToast } from "@/lib/toast/app-toast";

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

export function useProfilePhotoUpload(
  socialProfileId: number | undefined,
  options?: { coverCropPreset?: ProfileCoverCropPreset }
) {
  const coverCropPreset = options?.coverCropPreset ?? "profile";
  const profileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const updatePic = useUpdateSocialPic();
  const [cropSession, setCropSession] = useState<ProfilePhotoCropSession | null>(
    null
  );

  const clearCropSession = useCallback(() => {
    setCropSession((current) => {
      if (current?.objectUrl) {
        URL.revokeObjectURL(current.objectUrl);
      }
      return null;
    });
  }, []);

  const resetFileInput = useCallback((kind: "profile" | "cover") => {
    const ref = kind === "cover" ? coverInputRef : profileInputRef;
    if (ref.current) ref.current.value = "";
  }, []);

  const queueCrop = useCallback(
    (kind: "profile" | "cover", file: File) => {
      const objectUrl = URL.createObjectURL(file);
      setCropSession((current) => {
        if (current?.objectUrl) URL.revokeObjectURL(current.objectUrl);
        return {
          kind,
          objectUrl,
          fileName: file.name,
          aspect:
            kind === "profile"
              ? PROFILE_PHOTO_CROP_ASPECT
              : coverCropAspectForPreset(coverCropPreset),
        };
      });
    },
    [coverCropPreset]
  );

  const onImageSelected = useCallback(
    (kind: "profile" | "cover", file: File | undefined) => {
      if (!file || !socialProfileId) return;
      if (!file.type.startsWith("image/")) {
        showAppToast.error("Please choose an image file");
        resetFileInput(kind);
        return;
      }
      queueCrop(kind, file);
      resetFileInput(kind);
    },
    [queueCrop, resetFileInput, socialProfileId]
  );

  const confirmCrop = useCallback(
    async (file: File) => {
      if (!socialProfileId || !cropSession) return;
      try {
        await updatePic.mutateAsync({
          socialProfileId,
          file,
          kind: cropSession.kind,
        });
        clearCropSession();
      } catch {
        /* Toast handled in useUpdateSocialPic */
      }
    },
    [clearCropSession, cropSession, socialProfileId, updatePic]
  );

  const cancelCrop = useCallback(() => {
    clearCropSession();
  }, [clearCropSession]);

  return {
    accept: ACCEPT,
    isPending: updatePic.isPending,
    cropSession,
    profileInputRef,
    coverInputRef,
    openProfilePicker: () => profileInputRef.current?.click(),
    openCoverPicker: () => coverInputRef.current?.click(),
    onProfileFileChange: (file: File | undefined) =>
      onImageSelected("profile", file),
    onCoverFileChange: (file: File | undefined) =>
      onImageSelected("cover", file),
    confirmCrop,
    cancelCrop,
  };
}
