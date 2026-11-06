import type { ChatShareEntity } from "@/features/chat/types/content-share.types";

export type ContentShareOptionId = "copy" | "msg" | "external";

export const CONTENT_SHARE_OPTIONS: {
  id: ContentShareOptionId;
  title: string;
  description: string;
}[] = [
  {
    id: "copy",
    title: "Copy link",
    description: "Copy the public link to share anywhere",
  },
  {
    id: "msg",
    title: "Share as Message",
    description: "Send as a direct message to your connections",
  },
  {
    id: "external",
    title: "Share Externally",
    description: "Share via WhatsApp, email, or other apps",
  },
];

export function buildGenericShareMessage(title: string, url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return title;
  return `Check out ${title} on Realtor's In:\n${trimmed}`;
}

export function chatShareSuccessLabel(
  entity: ChatShareEntity,
  count: number
): string {
  const noun =
    entity.type === "event"
      ? "Event"
      : entity.type === "job"
        ? "Job"
        : entity.type === "profile"
          ? "Profile"
          : "Post";
  return count === 1
    ? `${noun} shared in chat`
    : `${noun} shared with ${count} connections`;
}
