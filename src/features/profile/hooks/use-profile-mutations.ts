"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ownProfileQueryKey } from "@/features/profile/hooks/use-profile";
import {
  deleteCertificateRequest,
  deleteEducationRequest,
  deletePositionRequest,
  deleteSkillRequest,
  downloadCvPdfRequest,
  generateCvPdfRequest,
  updateAboutRequest,
  updateCvTemplateRequest,
  updateIntroRequest,
  updateOpenToRequest,
  updateSocialPicRequest,
  upsertCertificateRequest,
  upsertEducationRequest,
  upsertPositionRequest,
  upsertSkillRequest,
} from "@/features/profile/services/profile.client";
import type {
  AboutUpdateInput,
  CertificateUpsertInput,
  CvTemplateInput,
  EditIntroInput,
  EducationUpsertInput,
  OpenToInput,
  PositionUpsertInput,
  SkillUpsertInput,
} from "@/features/profile/validators/profile.validators";
import { ApiError } from "@/lib/api/errors";
import { showAppToast } from "@/lib/toast/app-toast";

function useInvalidateProfile() {
  const queryClient = useQueryClient();
  return async () => {
    await queryClient.invalidateQueries({ queryKey: ownProfileQueryKey });
  };
}

export function useUpdateOpenTo() {
  const invalidate = useInvalidateProfile();
  return useMutation({
    mutationFn: (input: OpenToInput) => updateOpenToRequest(input),
    onSuccess: () => void invalidate(),
  });
}

export function useUpdateIntro() {
  const invalidate = useInvalidateProfile();
  return useMutation({
    mutationFn: (input: EditIntroInput) => updateIntroRequest(input),
    onSuccess: () => void invalidate(),
  });
}

export function useUpdateSocialPic() {
  const invalidate = useInvalidateProfile();
  return useMutation({
    mutationFn: (input: {
      socialProfileId: number;
      file: File;
      kind: "profile" | "cover" | "rera";
    }) => updateSocialPicRequest(input),
    onSuccess: (_data, variables) => {
      void invalidate();
      showAppToast.success(
        variables.kind === "cover"
          ? "Cover photo updated"
          : "Profile photo updated"
      );
    },
    onError: (error, variables) =>
      showAppToast.fromError(
        error,
        variables.kind === "cover"
          ? "Could not update cover photo"
          : "Could not update profile photo"
      ),
  });
}

export function useUpdateAbout() {
  const invalidate = useInvalidateProfile();
  return useMutation({
    mutationFn: (input: AboutUpdateInput) => updateAboutRequest(input),
    onSuccess: () => void invalidate(),
  });
}

export type PositionUpsertPayload = PositionUpsertInput & {
  imageFiles?: File[];
};

export function useUpsertPosition() {
  const invalidate = useInvalidateProfile();
  return useMutation({
    mutationFn: ({ imageFiles, ...input }: PositionUpsertPayload) =>
      upsertPositionRequest(input, imageFiles ?? []),
    onSuccess: () => void invalidate(),
  });
}

export function useDeletePosition() {
  const invalidate = useInvalidateProfile();
  return useMutation({
    mutationFn: (id: number) => deletePositionRequest(id),
    onSuccess: () => void invalidate(),
  });
}

export type EducationUpsertPayload = EducationUpsertInput & {
  imageFiles?: File[];
};

export function useUpsertEducation() {
  const invalidate = useInvalidateProfile();
  return useMutation({
    mutationFn: ({ imageFiles, ...input }: EducationUpsertPayload) =>
      upsertEducationRequest(input, imageFiles ?? []),
    onSuccess: () => void invalidate(),
  });
}

export function useDeleteEducation() {
  const invalidate = useInvalidateProfile();
  return useMutation({
    mutationFn: (id: number) => deleteEducationRequest(id),
    onSuccess: () => void invalidate(),
  });
}

export function useUpsertSkill() {
  const invalidate = useInvalidateProfile();
  return useMutation({
    mutationFn: (input: SkillUpsertInput) => upsertSkillRequest(input),
    onSuccess: () => void invalidate(),
  });
}

export function useDeleteSkill() {
  const invalidate = useInvalidateProfile();
  return useMutation({
    mutationFn: (id: number) => deleteSkillRequest(id),
    onSuccess: () => void invalidate(),
  });
}

export type CertificateUpsertPayload = CertificateUpsertInput & {
  certificateImage?: File | null;
};

export function useUpsertCertificate() {
  const invalidate = useInvalidateProfile();
  return useMutation({
    mutationFn: ({ certificateImage, ...input }: CertificateUpsertPayload) =>
      upsertCertificateRequest(input, certificateImage ?? null),
    onSuccess: () => void invalidate(),
  });
}

export function useDeleteCertificate() {
  const invalidate = useInvalidateProfile();
  return useMutation({
    mutationFn: (id: number) => deleteCertificateRequest(id),
    onSuccess: () => void invalidate(),
  });
}

export function useUpdateCvTemplate() {
  const invalidate = useInvalidateProfile();
  return useMutation({
    mutationFn: (input: CvTemplateInput) => updateCvTemplateRequest(input),
    onSuccess: () => void invalidate(),
  });
}

export function useGenerateCvPdf() {
  return useMutation({
    mutationFn: () => generateCvPdfRequest(),
  });
}

export function useDownloadCvPdf() {
  return useMutation({
    mutationFn: (fileName: string) => downloadCvPdfRequest(fileName),
  });
}

export function mutationErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  return "Something went wrong. Please try again.";
}
