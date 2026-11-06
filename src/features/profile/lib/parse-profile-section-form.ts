function splitCsv(value: FormDataEntryValue | null): string[] {
  if (typeof value !== "string" || !value.trim()) return [];
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function splitIds(value: FormDataEntryValue | null): number[] {
  return splitCsv(value)
    .map((part) => Number(part))
    .filter((id) => Number.isFinite(id) && id > 0);
}

export function collectImageFiles(form: FormData): File[] {
  const files: File[] = [];
  for (const [key, value] of form.entries()) {
    if (!key.startsWith("images")) continue;
    if (value instanceof File && value.size > 0) files.push(value);
  }
  return files;
}

export function collectCertificateImage(form: FormData): File | null {
  const value = form.get("certificate_image");
  if (value instanceof File && value.size > 0) return value;
  return null;
}

export function parseSkillFields(form: FormData): {
  skillIds: number[];
  newSkills: string[];
} {
  return {
    skillIds: splitIds(form.get("skillIds") ?? form.get("skills_ids")),
    newSkills: splitCsv(form.get("newSkills") ?? form.get("new_skills")),
  };
}

export function appendSkillFields(
  form: FormData,
  skillIds: number[],
  newSkills: string[]
) {
  if (skillIds.length) form.append("skills_ids", skillIds.join(","));
  if (newSkills.length) form.append("new_skills", newSkills.join(","));
}

export function appendImageFiles(form: FormData, files: File[]) {
  files.forEach((file, index) => {
    form.append(`images[${index}]`, file, file.name || `image-${index}.jpg`);
  });
}
