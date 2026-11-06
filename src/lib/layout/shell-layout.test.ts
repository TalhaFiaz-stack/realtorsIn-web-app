import { describe, expect, it } from "vitest";
import {
  shouldShowLeftRail,
  shouldShowRightRail,
} from "@/lib/layout/shell-layout";

describe("shell-layout settings-style pages", () => {
  it("shows left rail and hides right rail on broker verification (settings)", () => {
    expect(shouldShowLeftRail("/settings/broker-verification")).toBe(true);
    expect(shouldShowRightRail("/settings/broker-verification")).toBe(false);
  });

  it("matches invite friends layout", () => {
    expect(shouldShowLeftRail("/invite")).toBe(true);
    expect(shouldShowRightRail("/invite")).toBe(false);
  });

  it("shows left rail on listings and off-plan (same as properties)", () => {
    expect(shouldShowLeftRail("/listings")).toBe(true);
    expect(shouldShowLeftRail("/listings/property/1")).toBe(true);
    expect(shouldShowLeftRail("/off-plan/abc123")).toBe(true);
    expect(shouldShowRightRail("/listings")).toBe(false);
  });
});
