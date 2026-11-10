import { describe, expect, it } from "vitest";
import { buildEventFormData } from "@/features/events/lib/build-event-form-data";

const base = {
  title: "Launch",
  description: "Desc",
  event_type: "online",
  category: "Other",
  visibility: "public",
  status: "draft",
  start_at: "2026-12-01T10:00:00.000Z",
  end_at: "2026-12-01T12:00:00.000Z",
  timezone: "Asia/Dubai",
  venue_name: "",
  address: "",
  city: "",
  country: "",
  latitude: "",
  longitude: "",
  online_url: "https://zoom.us/j/1",
  capacity: "",
  contact_email: "",
  contact_phone: "",
} as never;

describe("buildEventFormData", () => {
  it("sends cleared location fields on update so the old venue is removed", () => {
    const form = buildEventFormData(base, [], [], { isUpdate: true });
    expect(form.get("venue_name")).toBe("");
    expect(form.get("latitude")).toBe("");
    expect(form.get("online_url")).toBe("https://zoom.us/j/1");
  });

  it("does not send empty location fields when creating", () => {
    const form = buildEventFormData(base, []);
    expect(form.has("venue_name")).toBe(false);
    expect(form.has("latitude")).toBe(false);
  });
});
