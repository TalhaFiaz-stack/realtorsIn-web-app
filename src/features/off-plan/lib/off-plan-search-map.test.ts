import { describe, expect, it } from "vitest";
import { mapOffPlanPopularSearch } from "@/features/off-plan/lib/off-plan-search-map";

describe("mapOffPlanPopularSearch", () => {
  it("resolves project titles from catalog when popular rows are id-only", () => {
    const sections = mapOffPlanPopularSearch(
      {
        projects: [{ id: "abc123", is_featured: true }, { id: "def456" }],
        cities: [],
        districts: [],
        developers: [],
      },
      [],
      [
        {
          id: "abc123",
          title: "Featured Tower",
          developerName: "Dev Co",
          developerImage: null,
          districtName: null,
          location: "Dubai Marina",
          priceStart: null,
          priceEnd: null,
          currency: null,
          completionDate: null,
          projectStatus: "On Sale",
          completionStatusName: null,
          projectCompleted: false,
          totalProperties: null,
          bannerImage: "https://example.com/a.jpg",
          lat: null,
          lng: null,
          commissionPercentage: null,
        },
        {
          id: "def456",
          title: "Regular Project",
          developerName: null,
          developerImage: null,
          districtName: null,
          location: null,
          priceStart: null,
          priceEnd: null,
          currency: null,
          completionDate: null,
          projectStatus: "Announced",
          completionStatusName: null,
          projectCompleted: false,
          totalProperties: null,
          bannerImage: null,
          lat: null,
          lng: null,
          commissionPercentage: null,
        },
      ]
    );

    expect(sections.featuredProjects).toHaveLength(1);
    expect(sections.featuredProjects[0]?.label).toBe("Featured Tower");
    expect(sections.projects).toHaveLength(1);
    expect(sections.projects[0]?.label).toBe("Regular Project");
  });
});
