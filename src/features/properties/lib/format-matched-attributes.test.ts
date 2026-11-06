import { describe, expect, it } from "vitest";
import { formatMatchedAttributes } from "@/features/properties/lib/format-matched-attributes";

describe("formatMatchedAttributes", () => {
  it("maps API keys to readable labels and dedupes price/area", () => {
    expect(
      formatMatchedAttributes([
        "price_start",
        "price_end",
        "area_start",
        "bedrooms",
        "studio",
      ])
    ).toEqual(["Price", "Area", "Beds", "Studio"]);
  });
});
