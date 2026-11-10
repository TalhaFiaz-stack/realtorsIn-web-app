import { resolveMediaUrl } from "@/lib/media/resolve-media-url";
import type {
  JobApplication,
  JobApplicant,
  JobPost,
  JobPoster,
  JobsListPage,
} from "@/features/jobs/types/job.types";

function mapPoster(raw: unknown): JobPoster | null {
  if (!raw || typeof raw !== "object") return null;
  const p = raw as Record<string, unknown>;
  const id = Number(p.id);
  if (!Number.isFinite(id)) return null;
  return {
    id,
    firstName:
      typeof p.first_name === "string"
        ? p.first_name
        : typeof p.name === "string"
          ? p.name
          : null,
    lastName: typeof p.last_name === "string" ? p.last_name : null,
    userName: typeof p.user_name === "string" ? p.user_name : null,
    profilePicture:
      resolveMediaUrl(p.profile_picture),
  };
}

function normalizeSkills(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((s) => String(s)).filter(Boolean);
}

function mapApplicant(raw: unknown): JobApplicant | null {
  if (!raw || typeof raw !== "object") return null;
  const a = raw as Record<string, unknown>;
  const id = Number(a.id);
  if (!Number.isFinite(id)) return null;
  return {
    id,
    firstName:
      typeof a.first_name === "string"
        ? a.first_name
        : typeof a.name === "string"
          ? a.name
          : null,
    lastName: typeof a.last_name === "string" ? a.last_name : null,
    userName: typeof a.user_name === "string" ? a.user_name : null,
    profilePicture:
      resolveMediaUrl(a.profile_picture),
    userRole: typeof a.user_role === "string" ? a.user_role : null,
  };
}

function mapApplication(raw: unknown): JobApplication | null {
  if (!raw || typeof raw !== "object") return null;
  const app = raw as Record<string, unknown>;
  const id = Number(app.id);
  if (!Number.isFinite(id)) return null;
  return {
    id,
    coverLetter:
      typeof app.cover_letter === "string" ? app.cover_letter : null,
    resumeUrl: typeof app.resume_url === "string" ? app.resume_url : null,
    contactEmail:
      typeof app.contact_email === "string" ? app.contact_email : null,
    contactPhone:
      typeof app.contact_phone === "string" ? app.contact_phone : null,
    status: typeof app.status === "string" ? app.status : null,
    createdAt:
      typeof app.created_at === "string"
        ? app.created_at
        : typeof app.createdAt === "string"
          ? app.createdAt
          : null,
    applicant: mapApplicant(app.applicant),
  };
}

function normalizeImages(raw: unknown): { url: string }[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      // Backend can return bare paths ("realtorsin/jobs/…") — make them loadable.
      if (typeof item === "string") {
        const url = resolveMediaUrl(item);
        return url ? { url } : null;
      }
      if (item && typeof item === "object" && "url" in item) {
        const url = resolveMediaUrl((item as { url?: unknown }).url);
        return url ? { url } : null;
      }
      return null;
    })
    .filter((x): x is { url: string } => Boolean(x));
}

export function mapJob(raw: unknown): JobPost | null {
  if (!raw || typeof raw !== "object") return null;
  const j = raw as Record<string, unknown>;
  const id = Number(j.id);
  if (!Number.isFinite(id)) return null;

  return {
    id,
    title: String(j.title ?? ""),
    description: String(j.description ?? ""),
    company: typeof j.company === "string" ? j.company : null,
    location: String(j.location ?? ""),
    employmentType: String(j.employment_type ?? "Full-time"),
    jobType: String(j.job_type ?? "On-site"),
    experienceLevel: String(j.experience_level ?? ""),
    salaryMin: j.salary_min != null ? Number(j.salary_min) : null,
    salaryMax: j.salary_max != null ? Number(j.salary_max) : null,
    salaryCurrency: String(j.salary_currency ?? "AED"),
    skills: normalizeSkills(j.skills),
    images: normalizeImages(j.images),
    requirements: String(j.requirements ?? ""),
    benefits: String(j.benefits ?? ""),
    applicationEmail: String(j.application_email ?? ""),
    applicationUrl: String(j.application_url ?? ""),
    status: String(j.status ?? "active"),
    viewsCount: Number(j.views_count) || 0,
    applicationsCount: Number(j.applications_count) || 0,
    socialProfileId: Number(j.social_profile_id) || 0,
    poster: mapPoster(j.poster),
    hasApplied: j.has_applied === true || j.user_has_applied === true,
    locationMatch: j.location_match === true,
    applicationStatus:
      typeof j.application_status === "string" ? j.application_status : null,
    appliedAt: typeof j.applied_at === "string" ? j.applied_at : null,
    applications: Array.isArray(j.applications)
      ? j.applications
          .map(mapApplication)
          .filter((row): row is JobApplication => Boolean(row))
      : undefined,
  };
}

export function mapJobsPage(payload: unknown): JobsListPage {
  const body =
    payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : {};
  const rows = Array.isArray(body.data) ? body.data : [];
  const pagination =
    body.pagination && typeof body.pagination === "object"
      ? (body.pagination as Record<string, unknown>)
      : {};

  return {
    jobs: rows.map(mapJob).filter((job): job is JobPost => Boolean(job)),
    page: Number(pagination.page) || 1,
    totalPages: Number(pagination.totalPages) || 1,
    total: Number(pagination.total) || rows.length,
  };
}

export function mapJobsList(payload: unknown): JobPost[] {
  const body =
    payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : {};
  const rows = Array.isArray(body.data) ? body.data : [];
  return rows.map(mapJob).filter((job): job is JobPost => Boolean(job));
}
