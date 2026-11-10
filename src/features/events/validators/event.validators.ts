import { z } from "zod";
import {
  EVENT_CATEGORIES,
  EVENT_TYPES,
  EVENT_VISIBILITY,
} from "@/features/events/constants/events.constants";

const typeValues = EVENT_TYPES.map((t) => t.value);
const visibilityValues = EVENT_VISIBILITY.map((v) => v.value);

export const eventFormSchema = z
  .object({
    title: z.string().trim().min(3).max(120),
    description: z.string().trim().min(10).max(5000),
    category: z.enum([...EVENT_CATEGORIES] as [string, ...string[]]),
    event_type: z.enum([...typeValues] as [string, ...string[]]),
    visibility: z.enum([...visibilityValues] as [string, ...string[]]),
    start_at: z.string().min(1),
    end_at: z.string().min(1),
    timezone: z.string().min(1),
    venue_name: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    online_url: z.string().optional(),
    capacity: z.string().optional(),
    contact_email: z
      .string()
      .trim()
      .optional()
      .refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Enter a valid contact email"),
    contact_phone: z.string().optional(),
    rem_lead_sync_enabled: z.boolean().optional(),
    rem_campaign_hash: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const start = new Date(data.start_at);
    const end = new Date(data.end_at);
    if (Number.isNaN(start.getTime())) {
      ctx.addIssue({ code: "custom", message: "Invalid start date", path: ["start_at"] });
    }
    if (Number.isNaN(end.getTime())) {
      ctx.addIssue({ code: "custom", message: "Invalid end date", path: ["end_at"] });
    }
    if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && end <= start) {
      ctx.addIssue({
        code: "custom",
        message: "End must be after start",
        path: ["end_at"],
      });
    }
    const needsLocation =
      data.event_type === "in_person" || data.event_type === "hybrid";
    const needsOnline =
      data.event_type === "online" || data.event_type === "hybrid";
    if (needsLocation && !data.city?.trim() && !data.venue_name?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Add a venue or city for in-person events",
        path: ["city"],
      });
    }
    // Mobile event.validator: hash required when sync is on, 16–128 hex chars.
    if (data.rem_lead_sync_enabled) {
      const hash = data.rem_campaign_hash?.trim() ?? "";
      if (!hash) {
        ctx.addIssue({
          code: "custom",
          message: "REM campaign hash is required when sync is on",
          path: ["rem_campaign_hash"],
        });
      } else if (!/^[a-f0-9]{16,128}$/i.test(hash)) {
        ctx.addIssue({
          code: "custom",
          message: "Enter a valid REM campaign hash (from /api/create-lead/...)",
          path: ["rem_campaign_hash"],
        });
      }
    }
    if (needsOnline && !data.online_url?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Online URL is required",
        path: ["online_url"],
      });
    }
  });

export type EventFormInput = z.infer<typeof eventFormSchema>;
