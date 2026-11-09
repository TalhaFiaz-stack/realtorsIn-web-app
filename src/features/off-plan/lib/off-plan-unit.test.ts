import { describe, expect, it } from "vitest";
import {
  buildUnitOfferLink,
  buildUnitPdfPath,
  isReservedCustomKey,
} from "@/features/off-plan/lib/off-plan-unit";

const unit = {
  offerUrl: "https://my.remapp.ae/api/off_plan/unit/offer/u1",
  quotationOfferUrl: "https://my.remapp.ae/api/off_plan/unit/quotation/offer/u1",
};

describe("unit presentation / quotation", () => {
  it("builds a presentation offer link with layout toggles", () => {
    const link = buildUnitOfferLink(unit, "presentation", {
      currency: "USD",
      language: "ar",
      area: "sqm",
      theme: "dark",
      design: "v2",
      toggles: { watermark: false, full_description: true, developer: true, map: false },
    })!;
    const url = new URL(link);
    expect(url.pathname).toBe("/api/off_plan/unit/offer/u1");
    expect(url.searchParams.get("offer_currency")).toBe("USD");
    expect(url.searchParams.get("watermark")).toBe("false");
    expect(url.searchParams.get("design")).toBe("v2");
    expect(url.searchParams.get("notes")).toBeNull();
  });

  it("builds a quotation link with notes and custom fields, skipping reserved keys", () => {
    const link = buildUnitOfferLink(unit, "quotation", {
      currency: "AED",
      language: "en",
      area: "sqft",
      notes: "Valid for 7 days",
      customFields: [
        { key: "Discount Amount", value: "50,000" },
        { key: "theme", value: "x" },
        { key: "", value: "ignored" },
      ],
    })!;
    const url = new URL(link);
    expect(url.pathname).toBe("/api/off_plan/unit/quotation/offer/u1");
    expect(url.searchParams.get("notes")).toBe("Valid for 7 days");
    expect(url.searchParams.get("discount_amount")).toBe("50,000");
    expect(url.searchParams.get("theme")).toBeNull();
    expect(url.searchParams.get("watermark")).toBeNull();
  });

  it("uses the quotation PDF endpoint for quotations", () => {
    expect(buildUnitPdfPath("quotation", "p1", "u1", { currency: "AED", language: "en", area: "sqft" })).toMatch(
      /^off_plan\/unit\/quotation\/pdf\/p1\/u1\?/
    );
    expect(buildUnitPdfPath("presentation", "p1", "u1", { currency: "AED", language: "en", area: "sqft" })).toMatch(
      /^off_plan\/unit\/pdf\/p1\/u1\?/
    );
  });

  it("flags reserved custom keys", () => {
    expect(isReservedCustomKey("Offer Currency")).toBe(true);
    expect(isReservedCustomKey("Discount")).toBe(false);
  });
});
