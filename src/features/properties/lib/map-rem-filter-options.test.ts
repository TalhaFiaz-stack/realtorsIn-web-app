import { describe, expect, it } from "vitest";
import { mergePropertyHubFilterOptions } from "@/features/properties/lib/map-rem-filter-options";

describe("mergePropertyHubFilterOptions", () => {
  it("maps REM property types and statuses", () => {
    const result = mergePropertyHubFilterOptions({
      propertyTypesRaw: [{ name: "Apartment" }, "Villa"],
      statusesRaw: [
        { property_status_id: 5, status: "Active" },
        { property_status_id: 1, status: "Pending" },
      ],
    });
    expect(result.propertyTypes).toEqual([
      { label: "Apartment", value: "Apartment" },
      { label: "Villa", value: "Villa" },
    ]);
    expect(result.statuses).toEqual([
      { label: "Active", value: 5 },
      { label: "Pending", value: 1 },
    ]);
  });
});
