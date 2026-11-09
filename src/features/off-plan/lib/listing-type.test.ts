import { describe, expect, it } from "vitest";
import {
  formatListingArea,
  formatListingPrice,
  listingAvailability,
  listingTypeMeta,
} from "@/features/off-plan/lib/listing-type";

describe("listing card helpers (mobile parity)", () => {
  it("labels every transaction type", () => {
    expect(listingTypeMeta("buy")?.label).toBe("BUY");
    expect(listingTypeMeta("sell")?.label).toBe("SELL");
    expect(listingTypeMeta("rent_in")?.label).toBe("RENT IN");
    expect(listingTypeMeta("RENT_OUT")?.label).toBe("RENT OUT");
    expect(listingTypeMeta("secondary")).toBeNull();
  });
  it("maps availability like mobile", () => {
    expect(listingAvailability("1")).toBe("ready");
    expect(listingAvailability(0)).toBe("offplan");
    expect(listingAvailability(null)).toBeNull();
  });
  it("formats prices and areas", () => {
    expect(formatListingPrice(68000, null, "AED")).toBe("AED 68,000");
    expect(formatListingPrice(1200000, 1500000, null)).toBe("AED 1,200,000 – 1,500,000");
    expect(formatListingPrice(null, null, "AED")).toBeNull();
    expect(formatListingArea(580, null)).toBe("580");
    expect(formatListingArea(500, 900)).toBe("500–900");
  });
});
