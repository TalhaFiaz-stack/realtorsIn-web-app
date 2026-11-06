import { MAX_JOB_IMAGES } from "@/features/jobs/constants/jobs.constants";
import type { JobFormImage } from "@/features/jobs/types/job-form.types";

const SCALAR_FIELDS = [
  "title",
  "description",
  "company",
  "location",
  "lat_lng",
  "employment_type",
  "job_type",
  "experience_level",
  "salary_min",
  "salary_max",
  "salary_currency",
  "requirements",
  "benefits",
  "application_email",
  "application_url",
  "status",
] as const;

export type JobFormPayload = Partial<
  Record<(typeof SCALAR_FIELDS)[number], string>
> & {
  skills_ids?: number[];
  new_skills?: string[];
};

export function buildJobFormData(
  payload: JobFormPayload,
  images: JobFormImage[],
  options?: { jobId?: number }
): FormData {
  const form = new FormData();

  for (const field of SCALAR_FIELDS) {
    const value = payload[field];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      form.append(field, String(value).trim());
    }
  }

  payload.skills_ids?.forEach((id) => {
    if (Number.isFinite(id)) form.append("skills_ids", String(id));
  });
  payload.new_skills?.forEach((name) => {
    const trimmed = name.trim();
    if (trimmed) form.append("new_skills", trimmed);
  });

  const remoteUrls = images
    .filter((img) => !img.isLocal && img.url)
    .map((img) => img.url as string);
  if (remoteUrls.length > 0) {
    form.append("existing_images", JSON.stringify(remoteUrls));
  }

  let uploadIndex = 0;
  images.slice(0, MAX_JOB_IMAGES).forEach((image) => {
    if (!image.isLocal || !image.file) return;
    form.append(
      `images[${uploadIndex}]`,
      image.file,
      image.file.name || `job-${uploadIndex + 1}.jpg`
    );
    uploadIndex += 1;
  });

  if (options?.jobId) {
    form.append("id", String(options.jobId));
  }

  return form;
}

export function buildJobDeleteFormData(jobId: number): FormData {
  const form = new FormData();
  form.append("id", String(jobId));
  form.append("action", "delete");
  return form;
}
