import { bffRequest } from "@/lib/api/client";
import type { ProfileSkill } from "@/features/profile/types/profile.types";
import type { JobPost, JobsHubTab, JobsListPage } from "@/features/jobs/types/job.types";

export async function fetchJobsPageRequest(
  tab: JobsHubTab,
  page: number,
  search: string | undefined,
  signal?: AbortSignal,
  geo?: { lat: number; lng: number },
  postedStatus?: string
) {
  return bffRequest<{ ok: true; jobs: JobPost[] } & JobsListPage>({
    path: "jobs",
    method: "GET",
    signal,
    params: {
      tab,
      page,
      ...(search ? { search } : {}),
      ...(postedStatus && postedStatus !== "All"
        ? { status: postedStatus }
        : {}),
      ...(geo
        ? { deviceLat: geo.lat, deviceLng: geo.lng }
        : {}),
    },
  });
}

export async function fetchJobByIdRequest(id: number, signal?: AbortSignal) {
  return bffRequest<{ ok: true; job: JobPost }>({
    path: `jobs/${id}`,
    method: "GET",
    signal,
  });
}

export async function applyForJobRequest(
  jobId: number,
  data: {
    coverLetter?: string;
    contactEmail?: string;
    contactPhone?: string;
  }
) {
  return bffRequest<{ ok: true }>({
    path: `jobs/${jobId}/apply`,
    method: "POST",
    data: {
      cover_letter: data.coverLetter,
      contact_email: data.contactEmail,
      contact_phone: data.contactPhone,
    },
  });
}

export async function changeJobStatusRequest(jobId: number, status: string) {
  return bffRequest<{ ok: true }>({
    path: "jobs/status",
    method: "POST",
    data: { id: jobId, status },
  });
}

export async function createJobRequest(form: FormData) {
  return bffRequest<{ ok: true; job: JobPost }>({
    path: "jobs/create",
    method: "POST",
    data: form,
    timeoutMs: 120_000,
  });
}

export async function updateJobRequest(jobId: number, form: FormData) {
  return bffRequest<{ ok: true; job: JobPost }>({
    path: `jobs/${jobId}/update`,
    method: "POST",
    data: form,
    timeoutMs: 120_000,
  });
}

export async function deleteJobRequest(jobId: number) {
  return bffRequest<{ ok: true }>({
    path: `jobs/${jobId}/delete`,
    method: "POST",
    data: {},
  });
}

export async function fetchSkillsCatalogRequest(signal?: AbortSignal) {
  return bffRequest<{
    ok: true;
    skills: ProfileSkill[];
  }>({
    path: "skills",
    method: "GET",
    signal,
  });
}
