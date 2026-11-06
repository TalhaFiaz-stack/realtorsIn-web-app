import type { ChatMessage } from "@/features/chat/types/chat.types";

const PREVIEW_MAX = 120;

function trimPreview(text: string): string {
  const t = text.trim();
  if (!t) return "";
  return t.length > PREVIEW_MAX ? `${t.slice(0, PREVIEW_MAX - 1)}…` : t;
}

/** Inbox / conversation list preview from API `last_message` or socket payloads. */
export function previewFromLastMessageRaw(last: unknown): string | null {
  if (typeof last === "string" && last.trim()) {
    return trimPreview(last);
  }
  const row =
    last && typeof last === "object" && !Array.isArray(last)
      ? (last as Record<string, unknown>)
      : null;
  if (!row) return null;

  const content =
    (typeof row.message_content === "string" && row.message_content.trim()) ||
    (typeof row.content === "string" && row.content.trim()) ||
    "";

  return previewFromMessageFields({
    messageType:
      typeof row.message_type === "string" ? row.message_type : null,
    content,
    documentName:
      typeof row.document_name === "string" ? row.document_name : null,
  });
}

export function previewFromMessageFields(input: {
  messageType?: string | null;
  content?: string | null;
  documentName?: string | null;
  imageCount?: number;
}): string {
  const text = trimPreview(input.content ?? "");
  const type = input.messageType ?? "text";

  if (type === "image" || (input.imageCount ?? 0) > 0) {
    return text || "Sent a photo";
  }
  if (type === "document") {
    return text || input.documentName?.trim() || "Sent a document";
  }
  if (type === "post_share" || type === "property_share") {
    return text || "Shared a post";
  }
  if (type === "job_share") {
    return text || "Shared a job";
  }
  if (type === "event_share") {
    return text || "Shared an event";
  }
  if (type === "profile_share") {
    return text || "Shared a profile";
  }
  if (type === "story_reply") {
    return text || "Replied to a story";
  }
  if (text) return text;
  return "New message";
}

export function previewFromChatMessage(message: ChatMessage): string {
  return previewFromMessageFields({
    messageType: message.messageType,
    content: message.content,
    documentName: message.documentName,
    imageCount: message.images.length,
  });
}
