import { describe, expect, it } from "vitest";
import { formatEventSchedule } from "@/features/events/lib/format-event";

describe("formatEventSchedule", () => {
  it("shows only the end time when the event ends the same day", () => {
    const out = formatEventSchedule("2026-11-19T06:00:00Z", "2026-11-19T08:00:00Z", "Asia/Dubai");
    expect(out.split("–")[1]).not.toMatch(/Nov/);
  });
  it("includes the end date for multi-day events", () => {
    const out = formatEventSchedule("2026-11-18T06:00:00Z", "2026-11-20T08:00:00Z", "Asia/Dubai");
    expect(out.split("–")[1]).toMatch(/Nov/);
  });
});
