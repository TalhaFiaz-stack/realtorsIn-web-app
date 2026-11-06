import "server-only";

import { mapAppliedJobsPage } from "@/features/jobs/lib/map-applied-jobs";
import {
  mapJob,
  mapJobsList,
  mapJobsPage,
} from "@/features/jobs/lib/map-jobs";
import type { JobPost, JobsListPage } from "@/features/jobs/types/job.types";
import {
  backendMessage,
  isBackendSuccess,
} from "@/features/profile/lib/map-profile";
import { socialApiRequest } from "@/lib/api/server-client";
import { ApiError } from "@/lib/api/errors";

function assertSuccess(payload: unknown, fallback: string) {
  if (!isBackendSuccess(payload)) {
    throw new ApiError("SERVER", backendMessage(payload, fallback), 502);
  }
}

export async function fetchJobSuggestions(search?: string): Promise<JobPost[]> {
  const payload = await socialApiRequest<unknown>({
    path: "/api/jobs/suggestions",
    method: "GET",
    auth: true,
    params: {
      limit: 30,
      ...(search ? { search } : {}),
    },
  });
  assertSuccess(payload, "Unable to load jobs");
  return mapJobsList(payload);
}

export async function fetchMyJobsPage(
  page: number,
  options: { status?: string; search?: string } = {}
): Promise<JobsListPage> {
  const payload = await socialApiRequest<unknown>({
    path: "/api/jobs",
    method: "GET",
    auth: true,
    params: {
      page,
      limit: 20,
      ...(options.status && options.status !== "All"
        ? { status: options.status }
        : {}),
      ...(options.search ? { search: options.search } : {}),
    },
  });
  assertSuccess(payload, "Unable to load your jobs");
  return mapJobsPage(payload);
}

export async function fetchAppliedJobsPage(
  page: number,
  search?: string
): Promise<JobsListPage> {
  const payload = await socialApiRequest<unknown>({
    path: "/api/jobs/applied",
    method: "GET",
    auth: true,
    params: {
      page,
      limit: 20,
      ...(search ? { search } : {}),
    },
  });
  assertSuccess(payload, "Unable to load applied jobs");
  return mapAppliedJobsPage(payload);
}

export async function fetchJobById(jobId: number): Promise<JobPost> {
  const payload = await socialApiRequest<unknown>({
    path: `/api/jobs/${jobId}`,
    method: "GET",
    auth: true,
  });
  assertSuccess(payload, "Unable to load job");
  const body = payload as Record<string, unknown>;
  const job = mapJob(body.data);
  if (!job) {
    throw new ApiError("SERVER", "Job not found", 404);
  }
  return job;
}

export async function applyForJob(
  jobId: number,
  data: {
    cover_letter?: string;
    contact_email?: string;
    contact_phone?: string;
  }
) {
  const payload = await socialApiRequest<unknown>({
    path: `/api/jobs/${jobId}/apply`,
    method: "POST",
    auth: true,
    data,
  });
  assertSuccess(payload, "Unable to apply for job");
  return payload;
}

export async function createJobMultipart(form: FormData) {
  const payload = await socialApiRequest<unknown>({
    path: "/api/jobs",
    method: "POST",
    auth: true,
    data: form,
    isFormData: true,
    timeoutMs: 120_000,
  });
  assertSuccess(payload, "Unable to create job");
  const body = payload as Record<string, unknown>;
  const job = mapJob(body.data);
  if (!job) throw new ApiError("SERVER", "Invalid job response", 502);
  return job;
}

export async function updateJobMultipart(jobId: number, form: FormData) {
  if (!form.has("id")) {
    form.append("id", String(jobId));
  }
  return createJobMultipart(form);
}

export async function deleteJob(jobId: number) {
  const form = new FormData();
  form.append("id", String(jobId));
  form.append("action", "delete");
  const payload = await socialApiRequest<unknown>({
    path: "/api/jobs",
    method: "POST",
    auth: true,
    data: form,
    isFormData: true,
  });
  assertSuccess(payload, "Unable to delete job");
  return payload;
}

export async function fetchJobSuggestionsWithLocation(
  search: string | undefined,
  deviceLat?: number,
  deviceLng?: number
): Promise<JobPost[]> {
  const payload = await socialApiRequest<unknown>({
    path: "/api/jobs/suggestions",
    method: "GET",
    auth: true,
    params: {
      limit: 30,
      ...(search ? { search } : {}),
      ...(deviceLat != null ? { device_lat: deviceLat } : {}),
      ...(deviceLng != null ? { device_lng: deviceLng } : {}),
    },
  });
  assertSuccess(payload, "Unable to load jobs");
  return mapJobsList(payload);
}

export async function changeJobStatus(jobId: number, status: string) {
  const payload = await socialApiRequest<unknown>({
    path: "/api/jobs/status",
    method: "POST",
    auth: true,
    data: { id: jobId, status },
  });
  assertSuccess(payload, "Unable to update job status");
  return payload;
}
