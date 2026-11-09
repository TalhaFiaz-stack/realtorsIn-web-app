import { describe, expect, it } from "vitest";
import {
  formatOffPlanPrice,
  offPlanCommissionLabel,
  offPlanHandoverLabel,
} from "@/features/off-plan/lib/format-off-plan-price";

describe("formatOffPlanPrice", () => {
  it("formats a price with currency", () => {
    expect(formatOffPlanPrice(1409724, "AED")).toBe("AED 1,409,724");
  });
  it("falls back to Inquire", () => {
    expect(formatOffPlanPrice(null, "AED")).toBe("Inquire");
    expect(formatOffPlanPrice(0, null)).toBe("Inquire");
  });
});

describe("offPlanHandoverLabel", () => {
  it("shows the date when set", () => {
    expect(offPlanHandoverLabel("2029-03-31")).toBe("2029-03-31");
  });
  it("shows Launching soon like mobile when missing", () => {
    expect(offPlanHandoverLabel(null)).toBe("Launching soon");
    expect(offPlanHandoverLabel("  ")).toBe("Launching soon");
  });
});

describe("offPlanCommissionLabel", () => {
  it("labels a positive commission", () => {
    expect(offPlanCommissionLabel(5)).toBe("5% commission");
    expect(offPlanCommissionLabel(2.5)).toBe("2.5% commission");
  });
  it("hides zero or missing commission", () => {
    expect(offPlanCommissionLabel(0)).toBeNull();
    expect(offPlanCommissionLabel(null)).toBeNull();
  });
});
