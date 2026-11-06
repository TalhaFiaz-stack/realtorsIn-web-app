import { describe, expect, it } from "vitest";
import { formatSuggestionReason } from "@/features/network/lib/format-suggestion-reason";

describe("formatSuggestionReason", () => {
  it("maps known backend slugs", () => {
    expect(formatSuggestionReason("friends_of_friends")).toBe(
      "Friends of friends"
    );
    expect(formatSuggestionReason("in_your_contacts")).toBe(
      "In your contacts"
    );
  });

  it("title-cases unknown slugs", () => {
    expect(formatSuggestionReason("shared_agency")).toBe("Shared Agency");
  });

  it("returns null for empty values", () => {
    expect(formatSuggestionReason(null)).toBeNull();
    expect(formatSuggestionReason("  ")).toBeNull();
  });
});
