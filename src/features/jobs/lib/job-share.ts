import type { JobPost } from "@/features/jobs/types/job.types";

export function buildJobPublicUrl(jobId: number, origin?: string): string {
  const base =
    origin ??
    (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}/jobs/${jobId}`;
}

export function buildJobShareMessage(job: JobPost, url: string): string {
  const lines = [job.title];
  if (job.company) lines.push(job.company);
  if (job.location) lines.push(job.location);
  lines.push("", url.trim());
  return lines.join("\n");
}
