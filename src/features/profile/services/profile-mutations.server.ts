import "server-only";

import { socialApiRequest } from "@/lib/api/server-client";
import { ApiError } from "@/lib/api/errors";
import {
  backendMessage,
  isBackendSuccess,
} from "@/features/profile/lib/map-profile";
import {
  appendImageFiles,
  appendSkillFields,
} from "@/features/profile/lib/parse-profile-section-form";
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

function appendForm(
  form: FormData,
  fields: Record<string, string | number | boolean | null | undefined>
) {
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === null) continue;
    form.append(key, String(value));
  }
}

async function postForm(path: string, form: FormData) {
  const payload = await socialApiRequest<unknown>({
    path,
    method: "POST",
    auth: true,
    data: form,
    isFormData: true,
  });
  if (!isBackendSuccess(payload)) {
    throw new ApiError(
      "SERVER",
      backendMessage(payload, "Unable to save profile changes"),
      502
    );
  }
  return payload;
}

export async function updateOpenTo(input: OpenToInput) {
  const openToValue =
    input.openTo === "hiring"
      ? "1"
      : input.openTo === "open_to_work"
        ? "0"
        : null;

  const payload = await socialApiRequest<unknown>({
    path: "/api/social_profile/fields",
    method: "POST",
    auth: true,
    data: { fields: { open_to: openToValue } },
  });

  if (!isBackendSuccess(payload)) {
    throw new ApiError(
      "SERVER",
      backendMessage(payload, "Unable to update availability"),
      502
    );
  }
  return payload;
}

export async function updateIntroFields(input: EditIntroInput) {
  const fields: Record<string, string | number | boolean | null> = {
    name: input.name,
    last_name: input.lastName || "",
    user_name: input.userName || "",
    email: input.email || "",
    phone: input.phone || "",
    phone_dial_code: input.phoneDialCode || "",
    phone_country_code: input.phoneCountryCode || "",
    description: input.description || "",
    company: input.company || "",
    location: input.location || "",
    user_role: input.userRole || "",
    position_id:
      input.positionId != null ? String(input.positionId) : "",
    education_id:
      input.educationId != null ? String(input.educationId) : "",
    social_profile_links: input.socialProfileLinks || "",
    agency_name: input.agencyName || "",
    rera_number: input.reraNumber || "",
    orn_number: input.ornNumber || "",
    cities: (input.cities ?? []).join(","),
    property_types: (input.propertyTypes ?? []).join(","),
  };
  if (input.showCompany != null) fields.show_company = input.showCompany ? 1 : 0;
  if (input.showRole != null) fields.show_role = input.showRole ? 1 : 0;

  const payload = await socialApiRequest<unknown>({
    path: "/api/social_profile/fields",
    method: "POST",
    auth: true,
    data: { fields },
  });

  if (!isBackendSuccess(payload)) {
    throw new ApiError(
      "SERVER",
      backendMessage(payload, "Unable to update profile"),
      502
    );
  }
  return payload;
}

export async function upsertAbout(input: AboutUpdateInput) {
  const form = new FormData();
  appendForm(form, {
    about_text: input.aboutText,
    ...(input.aboutId ? { id: input.aboutId } : {}),
    // Always send so omit ≠ accidental wipe; empty clears intentionally.
    top_skills_ids: JSON.stringify(input.topSkillIds ?? []),
  });
  return postForm("/api/about", form);
}

export async function upsertPosition(
  input: PositionUpsertInput,
  imageFiles: File[] = []
) {
  const form = new FormData();
  appendForm(form, {
    ...(input.id ? { id: input.id } : {}),
    title: input.title,
    company: input.company,
    employment_type: input.employmentType,
    job_type: input.jobType,
    start_date: input.startDate,
    is_currently_working: input.isCurrentlyWorking,
    end_date: input.isCurrentlyWorking ? null : input.endDate || null,
    location: input.location || "",
    description: input.description || "",
    profile_headline: input.profileHeadline || "",
  });
  appendSkillFields(form, input.skillIds ?? [], input.newSkills ?? []);
  appendImageFiles(form, imageFiles);
  return postForm("/api/position", form);
}

export async function deletePosition(id: number) {
  const form = new FormData();
  appendForm(form, { id, action: "delete" });
  return postForm("/api/position", form);
}

export async function upsertEducation(
  input: EducationUpsertInput,
  imageFiles: File[] = []
) {
  const form = new FormData();
  appendForm(form, {
    ...(input.id ? { id: input.id } : {}),
    degree: input.degree,
    school: input.school,
    field_of_study: input.fieldOfStudy || "General",
    start_date: input.startDate,
    is_currently_studying: input.isCurrentlyStudying,
    end_date: input.isCurrentlyStudying ? null : input.endDate || null,
    location: input.location || "",
    description: input.description || "",
  });
  appendSkillFields(form, input.skillIds ?? [], input.newSkills ?? []);
  appendImageFiles(form, imageFiles);
  return postForm("/api/education", form);
}

export async function deleteEducation(id: number) {
  const form = new FormData();
  appendForm(form, { id, action: "delete" });
  return postForm("/api/education", form);
}

export async function upsertSkill(input: SkillUpsertInput) {
  const form = new FormData();
  appendForm(form, {
    ...(input.id ? { id: input.id } : {}),
    skill: input.skill,
    proficiency_level: input.proficiencyLevel || "",
    years_of_experience:
      input.yearsOfExperience != null ? input.yearsOfExperience : "",
    position_ids: (input.positionIds ?? []).join(","),
    education_ids: (input.educationIds ?? []).join(","),
  });
  return postForm("/api/skills", form);
}

export async function deleteSkill(id: number) {
  const form = new FormData();
  appendForm(form, { id, action: "delete" });
  return postForm("/api/skills", form);
}

export async function upsertCertificate(
  input: CertificateUpsertInput,
  certificateImage: File | null = null
) {
  const form = new FormData();
  const issued =
    input.issuedDate || new Date().toISOString().slice(0, 10);
  appendForm(form, {
    ...(input.id ? { id: input.id } : {}),
    name: input.name,
    issuing_organization: input.issuingOrganization,
    issued_date: issued,
    expiration_date: input.expirationDate || "",
    description: input.description || "",
    certificate_number: input.certificateNumber || "",
  });
  appendSkillFields(form, input.skillIds ?? [], input.newSkills ?? []);
  if (certificateImage) {
    form.append(
      "certificate_image",
      certificateImage,
      certificateImage.name || "certificate.jpg"
    );
  }
  return postForm("/api/certificate", form);
}

export async function deleteCertificate(id: number) {
  const form = new FormData();
  appendForm(form, { id, action: "delete" });
  return postForm("/api/certificate", form);
}

/** Mobile SocialProfile `updateSocialPic` — POST /api/social_profile multipart. */
export async function updateSocialPic(input: {
  socialProfileId: number;
  file: File;
  kind: "profile" | "cover" | "rera";
}) {
  const form = new FormData();
  form.append("id", String(input.socialProfileId));
  const field =
    input.kind === "cover"
      ? "cover_image"
      : input.kind === "rera"
        ? "rera_image"
        : "profile_image";
  form.append(field, input.file, input.file.name || "image.jpg");
  return postForm("/api/social_profile", form);
}

/** Mobile TemplateBTSheet — POST /api/cv/template. */
export async function updateCvTemplate(input: CvTemplateInput) {
  const form = new FormData();
  form.append("template", input.template);
  return postForm("/api/cv/template", form);
}

function mapGeneratedCvPdf(payload: unknown): GeneratedCvPdf {
  const root = payload as { data?: unknown };
  const data =
    root?.data && typeof root.data === "object"
      ? (root.data as Record<string, unknown>)
      : null;
  const previewUrl =
    typeof data?.preview_url === "string" ? data.preview_url.trim() : "";
  const downloadUrl =
    typeof data?.download_url === "string" ? data.download_url.trim() : "";
  const fileName =
    typeof data?.file_name === "string" ? data.file_name.trim() : "";
  if (!previewUrl || !downloadUrl || !fileName) {
    throw new ApiError(
      "SERVER",
      "PDF was generated but download links are missing",
      502
    );
  }
  return {
    previewUrl,
    downloadUrl,
    fileName,
    template: typeof data?.template === "string" ? data.template : null,
  };
}

/** Mobile generatePdfUrl — POST /api/cv/generate-pdf (Puppeteer; slow). */
export async function generateCvPdf(): Promise<GeneratedCvPdf> {
  const payload = await socialApiRequest<unknown>({
    path: "/api/cv/generate-pdf",
    method: "POST",
    auth: true,
    timeoutMs: 120_000,
  });
  if (!isBackendSuccess(payload)) {
    throw new ApiError(
      "SERVER",
      backendMessage(payload, "Unable to generate profile PDF"),
      502
    );
  }
  return mapGeneratedCvPdf(payload);
}

/** Proxy authenticated one-shot PDF download (mobile SocialPdfModal download). */
export async function downloadCvPdfBuffer(fileName: string): Promise<{
  buffer: ArrayBuffer;
  fileName: string;
}> {
  const safeName = fileName.trim();
  if (!safeName || safeName.includes("..") || safeName.includes("/")) {
    throw new ApiError("VALIDATION", "Invalid PDF filename", 400);
  }
  const buffer = await socialApiRequest<ArrayBuffer>({
    path: `/api/cv/download-pdf/${encodeURIComponent(safeName)}`,
    method: "GET",
    auth: true,
    timeoutMs: 60_000,
    responseType: "arraybuffer",
  });
  return { buffer, fileName: safeName };
}
