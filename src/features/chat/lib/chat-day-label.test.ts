import { describe, expect, it } from "vitest";
import { chatDayLabel, isSameChatDay } from "@/features/chat/lib/chat-day-label";

const now = new Date(2026, 10, 6, 15, 0, 0);

describe("chat day separators", () => {
  it("labels today and yesterday", () => {
    expect(chatDayLabel(new Date(2026, 10, 6, 9).toISOString(), now)).toBe("Today");
    expect(chatDayLabel(new Date(2026, 10, 5, 23).toISOString(), now)).toBe("Yesterday");
  });
  it("uses a date for older messages", () => {
    expect(chatDayLabel(new Date(2026, 9, 1).toISOString(), now)).toMatch(/Oct/);
  });
  it("groups by calendar day", () => {
    expect(
      isSameChatDay(new Date(2026, 10, 6, 1).toISOString(), new Date(2026, 10, 6, 23).toISOString())
    ).toBe(true);
    expect(
      isSameChatDay(new Date(2026, 10, 5, 23).toISOString(), new Date(2026, 10, 6, 1).toISOString())
    ).toBe(false);
  });
});
