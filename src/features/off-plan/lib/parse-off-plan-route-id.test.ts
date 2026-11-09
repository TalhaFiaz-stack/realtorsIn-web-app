import { describe, expect, it } from "vitest";
import { parseOffPlanRouteId } from "@/features/off-plan/lib/parse-off-plan-route-id";

describe("parseOffPlanRouteId", () => {
  it("accepts Mongo-style and numeric ids", () => {
    expect(parseOffPlanRouteId("6ae88a7617d2e06ab734a1c4")).toBe("6ae88a7617d2e06ab734a1c4");
    expect(parseOffPlanRouteId(" 12345 ")).toBe("12345");
  });

  it("rejects anything that could change the upstream path", () => {
    for (const bad of ["../../admin", "a/b", "id?x=1", "id#frag", "", "a b", "%2e%2e"]) {
      expect(parseOffPlanRouteId(bad)).toBeNull();
    }
  });
});
