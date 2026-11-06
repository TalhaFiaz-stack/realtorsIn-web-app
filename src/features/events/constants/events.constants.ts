import type { EventsHubTab } from "@/features/events/types/event.types";

export const MAX_EVENT_IMAGES = 10;

export const EVENT_TYPES = [
  { label: "In person", value: "in_person" },
  { label: "Online", value: "online" },
  { label: "Hybrid", value: "hybrid" },
] as const;

export const EVENT_CATEGORIES = [
  "Networking",
  "Open House",
  "Training",
  "Launch",
  "Webinar",
  "Other",
] as const;

export const EVENT_VISIBILITY = [
  { label: "Public", value: "public" },
  { label: "Connections", value: "connections" },
] as const;

export const DEFAULT_EVENT_TIMEZONE = "Asia/Dubai";

export const EVENTS_HUB_TABS: { key: EventsHubTab; label: string }[] = [
  { key: "upcoming", label: "Upcoming" },
  { key: "going", label: "Registered" },
  { key: "invited", label: "Invitations" },
  { key: "hosting", label: "Hosting" },
  { key: "past", label: "Past" },
];

export const EVENT_VISIBILITY_LABELS: Record<string, string> = {
  public: "Public",
  connections: "Connections",
  private: "Private",
};
