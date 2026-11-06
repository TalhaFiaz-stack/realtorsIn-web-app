import {
  fetchAppliedJobsPage,
  fetchJobSuggestionsWithLocation,
  fetchMyJobsPage,
} from "@/features/jobs/services/jobs.server";
import type { JobsHubTab } from "@/features/jobs/types/job.types";
import { handleBffError, jsonOk } from "@/lib/auth/bff";

const TABS: JobsHubTab[] = ["discover", "posted", "applied"];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tabParam = searchParams.get("tab") ?? "discover";
    const tab = TABS.includes(tabParam as JobsHubTab)
      ? (tabParam as JobsHubTab)
      : "discover";
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const search = searchParams.get("search")?.trim() || undefined;
    const deviceLat = searchParams.get("deviceLat");
    const deviceLng = searchParams.get("deviceLng");
    const lat =
      deviceLat != null && deviceLat !== ""
        ? Number(deviceLat)
        : undefined;
    const lng =
      deviceLng != null && deviceLng !== ""
        ? Number(deviceLng)
        : undefined;

    if (tab === "discover") {
      const jobs = await fetchJobSuggestionsWithLocation(
        search,
        Number.isFinite(lat) ? lat : undefined,
        Number.isFinite(lng) ? lng : undefined
      );
      return jsonOk({
        ok: true,
        jobs,
        page: 1,
        totalPages: 1,
        total: jobs.length,
      });
    }

    if (tab === "applied") {
      const pageData = await fetchAppliedJobsPage(page, search);
      return jsonOk({ ok: true, ...pageData });
    }

    const status = searchParams.get("status")?.trim() || undefined;
    const pageData = await fetchMyJobsPage(page, { search, status });
    return jsonOk({ ok: true, ...pageData });
  } catch (error) {
    return handleBffError(error);
  }
}
