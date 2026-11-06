import {
  certificateUpsertSchema,
  educationUpsertSchema,
  positionUpsertSchema,
} from "@/features/profile/validators/profile.validators";
import {
  collectCertificateImage,
  collectImageFiles,
  parseSkillFields,
} from "@/features/profile/lib/parse-profile-section-form";

function formString(form: FormData, key: string): string {
  const value = form.get(key);
  return typeof value === "string" ? value : "";
}

function formOptionalId(form: FormData): number | null {
  const raw = formString(form, "id").trim();
  if (!raw) return null;
  const id = Number(raw);
  return Number.isFinite(id) && id > 0 ? id : null;
}

function formBool(form: FormData, key: string): boolean {
  const value = formString(form, key).toLowerCase();
  return value === "true" || value === "1";
}

export function parsePositionUpsertForm(form: FormData) {
  const { skillIds, newSkills } = parseSkillFields(form);
  const body = positionUpsertSchema.parse({
    id: formOptionalId(form),
    title: formString(form, "title"),
    company: formString(form, "company"),
    employmentType: formString(form, "employmentType") || "Full-time",
    jobType: formString(form, "jobType") || "On-site",
    startDate: formString(form, "startDate"),
    endDate: formString(form, "endDate") || "",
    isCurrentlyWorking: formBool(form, "isCurrentlyWorking"),
    location: formString(form, "location"),
    description: formString(form, "description"),
    profileHeadline: formString(form, "profileHeadline"),
    skillIds,
    newSkills,
  });
  return { body, imageFiles: collectImageFiles(form) };
}

export function parseEducationUpsertForm(form: FormData) {
  const { skillIds, newSkills } = parseSkillFields(form);
  const body = educationUpsertSchema.parse({
    id: formOptionalId(form),
    degree: formString(form, "degree"),
    school: formString(form, "school"),
    fieldOfStudy: formString(form, "fieldOfStudy") || "General",
    startDate: formString(form, "startDate"),
    endDate: formString(form, "endDate") || "",
    isCurrentlyStudying: formBool(form, "isCurrentlyStudying"),
    location: formString(form, "location"),
    description: formString(form, "description"),
    skillIds,
    newSkills,
  });
  return { body, imageFiles: collectImageFiles(form) };
}

export function parseCertificateUpsertForm(form: FormData) {
  const { skillIds, newSkills } = parseSkillFields(form);
  const body = certificateUpsertSchema.parse({
    id: formOptionalId(form),
    name: formString(form, "name"),
    issuingOrganization: formString(form, "issuingOrganization"),
    issuedDate: formString(form, "issuedDate") || undefined,
    expirationDate: formString(form, "expirationDate") || "",
    description: formString(form, "description"),
    certificateNumber: formString(form, "certificateNumber"),
    skillIds,
    newSkills,
  });
  return { body, certificateImage: collectCertificateImage(form) };
}
