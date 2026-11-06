import { bffRequest } from "@/lib/api/client";
import type { SocialProfile } from "@/features/profile/types/profile.types";
import type { FeedPage } from "@/features/feed/types/post.types";
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
import type { GeneratedCvPdf } from "@/features/profile/types/profile.types";
import {
  buildCertificateUpsertForm,
  buildEducationUpsertForm,
  buildPositionUpsertForm,
} from "@/features/profile/lib/build-section-upsert-form";
import { getBrowserApiClient } from "@/lib/api/client";
import { toApiError } from "@/lib/api/errors";

export async function fetchOwnProfileRequest(signal?: AbortSignal) {
  return bffRequest<{ ok: true; profile: SocialProfile }>({
    path: "profile/me",
    method: "GET",
    signal,
  });
}

export async function fetchProfileByIdRequest(
  socialProfileId: number,
  signal?: AbortSignal
) {
  return bffRequest<{ ok: true; profile: SocialProfile }>({
    path: `profile/${socialProfileId}`,
    method: "GET",
    signal,
  });
}

export async function fetchProfileByUsernameRequest(
  username: string,
  signal?: AbortSignal
) {
  const handle = encodeURIComponent(username.trim().replace(/^@/, ""));
  return bffRequest<{ ok: true; profile: SocialProfile }>({
    path: `profile/u/${handle}`,
    method: "GET",
    signal,
  });
}

export async function fetchProfilePostsRequest(input: {
  userProfileId: number;
  page?: number;
  signal?: AbortSignal;
}) {
  return bffRequest<{ ok: true } & FeedPage>({
    path: "profile/posts",
    method: "GET",
    params: {
      userProfileId: input.userProfileId,
      page: input.page ?? 1,
      perPage: 20,
    },
    signal: input.signal,
  });
}

export async function updateOpenToRequest(input: OpenToInput) {
  return bffRequest<{ ok: true }>({
    path: "profile/open-to",
    method: "POST",
    data: input,
  });
}

export async function updateIntroRequest(input: EditIntroInput) {
  return bffRequest<{ ok: true }>({
    path: "profile/intro",
    method: "POST",
    data: input,
  });
}

export async function updateSocialPicRequest(input: {
  socialProfileId: number;
  file: File;
  kind: "profile" | "cover" | "rera";
}) {
  const form = new FormData();
  form.append("socialProfileId", String(input.socialProfileId));
  form.append("kind", input.kind);
  const field =
    input.kind === "cover"
      ? "cover_image"
      : input.kind === "rera"
        ? "rera_image"
        : "profile_image";
  form.append(field, input.file, input.file.name || "image.jpg");
  return bffRequest<{ ok: true }>({
    path: "profile/photo",
    method: "POST",
    data: form,
    timeoutMs: 60_000,
  });
}

export async function updateAboutRequest(input: AboutUpdateInput) {
  return bffRequest<{ ok: true }>({
    path: "profile/about",
    method: "POST",
    data: input,
  });
}

export async function upsertPositionRequest(
  input: PositionUpsertInput,
  imageFiles: File[] = []
) {
  return bffRequest<{ ok: true }>({
    path: "profile/position",
    method: "POST",
    data: buildPositionUpsertForm(input, imageFiles),
    timeoutMs: 60_000,
  });
}

export async function deletePositionRequest(id: number) {
  return bffRequest<{ ok: true }>({
    path: "profile/position",
    method: "POST",
    data: { action: "delete", id },
  });
}

export async function upsertEducationRequest(
  input: EducationUpsertInput,
  imageFiles: File[] = []
) {
  return bffRequest<{ ok: true }>({
    path: "profile/education",
    method: "POST",
    data: buildEducationUpsertForm(input, imageFiles),
    timeoutMs: 60_000,
  });
}

export async function deleteEducationRequest(id: number) {
  return bffRequest<{ ok: true }>({
    path: "profile/education",
    method: "POST",
    data: { action: "delete", id },
  });
}

export async function upsertSkillRequest(input: SkillUpsertInput) {
  return bffRequest<{ ok: true }>({
    path: "profile/skill",
    method: "POST",
    data: input,
  });
}

export async function deleteSkillRequest(id: number) {
  return bffRequest<{ ok: true }>({
    path: "profile/skill",
    method: "POST",
    data: { action: "delete", id },
  });
}

export async function upsertCertificateRequest(
  input: CertificateUpsertInput,
  certificateImage: File | null = null
) {
  return bffRequest<{ ok: true }>({
    path: "profile/certificate",
    method: "POST",
    data: buildCertificateUpsertForm(input, certificateImage),
    timeoutMs: 60_000,
  });
}

export async function deleteCertificateRequest(id: number) {
  return bffRequest<{ ok: true }>({
    path: "profile/certificate",
    method: "POST",
    data: { action: "delete", id },
  });
}

export async function updateCvTemplateRequest(input: CvTemplateInput) {
  return bffRequest<{ ok: true }>({
    path: "profile/cv/template",
    method: "POST",
    data: input,
  });
}

export async function generateCvPdfRequest() {
  return bffRequest<{ ok: true; pdf: GeneratedCvPdf }>({
    path: "profile/cv/generate-pdf",
    method: "POST",
    timeoutMs: 120_000,
  });
}

export async function downloadCvPdfRequest(fileName: string): Promise<Blob> {
  const client = getBrowserApiClient();
  try {
    const response = await client.request<Blob>({
      url: "profile/cv/download-pdf",
      method: "GET",
      params: { fileName },
      responseType: "blob",
      timeout: 60_000,
    });
    return response.data;
  } catch (error) {
    throw toApiError(error);
  }
}
