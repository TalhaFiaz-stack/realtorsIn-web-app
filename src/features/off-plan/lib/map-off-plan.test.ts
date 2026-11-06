import { describe, expect, it } from "vitest";
import { mapOffPlanProjectsPage } from "@/features/off-plan/lib/map-off-plan";

describe("mapOffPlanProjectsPage", () => {
  it("maps Mongo string project ids from paginated REM payload", () => {
    const page = mapOffPlanProjectsPage({
      status: true,
      data: {
        current_page: 1,
        last_page: 3,
        data: [
          {
            id: "6aec9293f845dfc84a7c357b",
            title: "The Level",
            project_location: "Bukadra, Dubai",
            lat_lng: "25.180442,55.3241",
            price_start: "1370000.00",
            currency: "AED",
          },
        ],
      },
    });

    expect(page.projects).toHaveLength(1);
    expect(page.projects[0]?.id).toBe("6aec9293f845dfc84a7c357b");
    expect(page.projects[0]?.title).toBe("The Level");
    expect(page.hasMore).toBe(true);
  });
});
