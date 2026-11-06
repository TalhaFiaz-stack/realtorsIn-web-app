import { describe, expect, it } from "vitest";
import {
  formatNavBadgeLabel,
  navBadgeFromCount,
  normalizeNavBadgeCount,
} from "@/lib/navigation/nav-badge";

describe("navBadgeFromCount", () => {
  it("returns undefined for zero or invalid", () => {
    expect(navBadgeFromCount(0)).toBeUndefined();
    expect(navBadgeFromCount("")).toBeUndefined();
    expect(navBadgeFromCount(null)).toBeUndefined();
  });

  it("returns integer counts from API shapes", () => {
    expect(navBadgeFromCount(5)).toBe(5);
    expect(navBadgeFromCount("1")).toBe(1);
  });

  it("caps display label at 99+", () => {
    expect(formatNavBadgeLabel(normalizeNavBadgeCount(120))).toBe("99+");
  });
});
