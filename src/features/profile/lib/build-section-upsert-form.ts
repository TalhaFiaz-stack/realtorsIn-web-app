import type {
  CertificateUpsertInput,
  EducationUpsertInput,
  PositionUpsertInput,
} from "@/features/profile/validators/profile.validators";
import {
  appendImageFiles,
  appendSkillFields,
} from "@/features/profile/lib/parse-profile-section-form";

function appendScalar(form: FormData, key: string, value: string | boolean) {
  form.append(key, String(value));
}

export function buildPositionUpsertForm(
  input: PositionUpsertInput,
  imageFiles: File[]
) {
  const form = new FormData();
  if (input.id) form.append("id", String(input.id));
  form.append("title", input.title);
  form.append("company", input.company);
  form.append("employmentType", input.employmentType);
  form.append("jobType", input.jobType);
  form.append("startDate", input.startDate);
  appendScalar(form, "isCurrentlyWorking", input.isCurrentlyWorking);
  if (!input.isCurrentlyWorking && input.endDate) {
    form.append("endDate", input.endDate);
  }
  form.append("location", input.location || "");
  form.append("description", input.description || "");
  form.append("profileHeadline", input.profileHeadline || "");
  appendSkillFields(form, input.skillIds ?? [], input.newSkills ?? []);
  appendImageFiles(form, imageFiles);
  return form;
}

export function buildEducationUpsertForm(
  input: EducationUpsertInput,
  imageFiles: File[]
) {
  const form = new FormData();
  if (input.id) form.append("id", String(input.id));
  form.append("degree", input.degree);
  form.append("school", input.school);
  form.append("fieldOfStudy", input.fieldOfStudy || "General");
  form.append("startDate", input.startDate);
  appendScalar(form, "isCurrentlyStudying", input.isCurrentlyStudying);
  if (!input.isCurrentlyStudying && input.endDate) {
    form.append("endDate", input.endDate);
  }
  form.append("location", input.location || "");
  form.append("description", input.description || "");
  appendSkillFields(form, input.skillIds ?? [], input.newSkills ?? []);
  appendImageFiles(form, imageFiles);
  return form;
}

export function buildCertificateUpsertForm(
  input: CertificateUpsertInput,
  certificateImage: File | null
) {
  const form = new FormData();
  if (input.id) form.append("id", String(input.id));
  form.append("name", input.name);
  form.append("issuingOrganization", input.issuingOrganization);
  if (input.issuedDate) form.append("issuedDate", input.issuedDate);
  if (input.expirationDate) form.append("expirationDate", input.expirationDate);
  form.append("description", input.description || "");
  form.append("certificateNumber", input.certificateNumber || "");
  appendSkillFields(form, input.skillIds ?? [], input.newSkills ?? []);
  if (certificateImage) {
    form.append(
      "certificate_image",
      certificateImage,
      certificateImage.name || "certificate.jpg"
    );
  }
  return form;
}
