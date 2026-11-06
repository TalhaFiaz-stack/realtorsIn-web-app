import { mapJob } from "@/features/jobs/lib/map-jobs";
import type { JobPost, JobsListPage } from "@/features/jobs/types/job.types";

function paginationFromPayload(body: Record<string, unknown>, rowCount: number) {
  const pagination =
    body.pagination && typeof body.pagination === "object"
      ? (body.pagination as Record<string, unknown>)
      : {};

  return {
    page: Number(pagination.page) || 1,
    totalPages: Number(pagination.totalPages) || 1,
    total: Number(pagination.total) || rowCount,
  };
}

/** GET /api/jobs/applied rows: `{ job, status, applied_at, ... }`. */
export function mapAppliedJobRow(raw: unknown): JobPost | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const jobRaw = row.job ?? row.jobPost ?? row.job_post;
  const job = mapJob(jobRaw);
  if (!job) return null;

  const applicationStatus =
    typeof row.status === "string" && row.status.trim()
      ? row.status.trim()
      : null;
  const appliedAt =
    typeof row.applied_at === "string"
      ? row.applied_at
      : typeof row.appliedAt === "string"
        ? row.appliedAt
        : null;

  return {
    ...job,
    hasApplied: true,
    applicationStatus,
    appliedAt,
  };
}

export function mapAppliedJobsPage(payload: unknown): JobsListPage {
  const body =
    payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : {};
  const rows = Array.isArray(body.data) ? body.data : [];
  const jobs = rows
    .map(mapAppliedJobRow)
    .filter((job): job is JobPost => Boolean(job));
  const pageMeta = paginationFromPayload(body, rows.length);

  return {
    jobs,
    ...pageMeta,
  };
}
