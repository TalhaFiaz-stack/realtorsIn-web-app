import { describe, expect, it } from "vitest";
import { distanceMeters } from "@/features/analytics/hooks/use-user-location-sync";

describe("distanceMeters", () => {
  it("is zero for the same point", () => {
    expect(distanceMeters({ lat: 25.2, lng: 55.27 }, { lat: 25.2, lng: 55.27 })).toBe(0);
  });
  it("is roughly 111 km per degree of latitude", () => {
    const d = distanceMeters({ lat: 25, lng: 55 }, { lat: 26, lng: 55 });
    expect(d).toBeGreaterThan(110_000);
    expect(d).toBeLessThan(112_500);
  });
});
