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

  it("sends cleared contact details on update", () => {
    const form = buildEventFormData(base, [], [], { isUpdate: true });
    expect(form.get("contact_email")).toBe("");
    expect(form.get("contact_phone")).toBe("");
  });
});


import { eventFormSchema } from "@/features/events/validators/event.validators";

describe("event contact validation", () => {
  const valid = {
    title: "Launch",
    description: "Project launch evening for brokers",
    timezone: "Asia/Dubai",
    event_type: "online",
    category: "Other",
    visibility: "public",
    status: "draft",
    start_at: "2026-12-01T10:00:00.000Z",
    end_at: "2026-12-01T12:00:00.000Z",
    online_url: "https://zoom.us/j/1",
  };
  it("accepts an empty or valid contact email", () => {
    expect(eventFormSchema.safeParse({ ...valid, contact_email: "" }).success).toBe(true);
    expect(eventFormSchema.safeParse({ ...valid, contact_email: "events@realtorsin.com" }).success).toBe(true);
  });
  it("rejects a malformed contact email", () => {
    expect(eventFormSchema.safeParse({ ...valid, contact_email: "not-an-email" }).success).toBe(false);
  });
});

describe("REM lead sync validation (mobile parity)", () => {
  const base = {
    title: "Launch",
    description: "Project launch evening for brokers",
    timezone: "Asia/Dubai",
    event_type: "online",
    category: "Other",
    visibility: "public",
    start_at: "2026-12-01T10:00:00.000Z",
    end_at: "2026-12-01T12:00:00.000Z",
    online_url: "https://zoom.us/j/1",
  };
  it("requires a hash when sync is on", () => {
    const r = eventFormSchema.safeParse({ ...base, rem_lead_sync_enabled: true, rem_campaign_hash: "" });
    expect(r.success).toBe(false);
  });
  it("rejects a full URL or non-hex value", () => {
    const r = eventFormSchema.safeParse({
      ...base,
      rem_lead_sync_enabled: true,
      rem_campaign_hash: "https://rem.example/api/create-lead/abc",
    });
    expect(r.success).toBe(false);
  });
  it("accepts a valid hex hash, and ignores the hash when sync is off", () => {
    expect(
      eventFormSchema.safeParse({ ...base, rem_lead_sync_enabled: true, rem_campaign_hash: "1e94147132c145e31b3b88a22a24ce9d" }).success
    ).toBe(true);
    expect(eventFormSchema.safeParse({ ...base, rem_lead_sync_enabled: false, rem_campaign_hash: "" }).success).toBe(true);
  });
});
