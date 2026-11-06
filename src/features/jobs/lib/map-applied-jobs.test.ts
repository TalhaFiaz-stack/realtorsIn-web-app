import { describe, expect, it } from "vitest";
import { mapAppliedJobsPage } from "@/features/jobs/lib/map-applied-jobs";

describe("mapAppliedJobsPage", () => {
  it("unwraps nested job rows from GET /api/jobs/applied", () => {
    const page = mapAppliedJobsPage({
      status: true,
      data: [
        {
          application_id: 9,
          status: "pending",
          applied_at: "2026-01-15T10:00:00.000Z",
          job: {
            id: 42,
            title: "Sales Agent",
            description: "Desc",
            location: "Dubai",
            employment_type: "Full-time",
            job_type: "On-site",
            status: "active",
          },
        },
        { application_id: 10, status: "reviewed", job: null },
      ],
      pagination: { page: 1, totalPages: 2, total: 3 },
    });

    expect(page.jobs).toHaveLength(1);
    expect(page.jobs[0]?.id).toBe(42);
    expect(page.jobs[0]?.hasApplied).toBe(true);
    expect(page.jobs[0]?.applicationStatus).toBe("pending");
    expect(page.jobs[0]?.appliedAt).toBe("2026-01-15T10:00:00.000Z");
    expect(page.total).toBe(3);
    expect(page.totalPages).toBe(2);
  });
});
