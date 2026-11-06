import { describe, expect, it } from "vitest";
import {
  formatPropertyAreaDisplay,
  formatPropertyPriceDisplay,
} from "@/features/properties/lib/format-property-display";

describe("formatPropertyPriceDisplay", () => {
  it("uses single formatted price when range is unrealistically wide", () => {
    const label = formatPropertyPriceDisplay({
      priceLabel: "AED 123.2K – 321.2M",
      priceStart: 123_200,
      priceEnd: 321_200_000,
      currency: "AED",
    });
    expect(label).toBe("AED 123,200");
  });
});

describe("formatPropertyAreaDisplay", () => {
  it("uses single area when range is unrealistically wide", () => {
    const label = formatPropertyAreaDisplay({
      areaLabel: "1.2K – 32432.2M sqft",
      areaStart: 1_200,
      areaEnd: 32_432_200_000,
    });
    expect(label).toBe("1,200 sqft");
  });
});
