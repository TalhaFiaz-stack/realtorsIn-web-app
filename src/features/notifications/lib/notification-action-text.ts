import {
  isStoryCommentNotification,
  parseNotificationMetadata,
  type NotificationMetadata,
} from "@/features/notifications/lib/notification-metadata";

/** Mirrors mobile `resolveActionTextFallback` / backend `getInAppActionText`. */
export function resolveNotificationActionText(input: {
  type: string;
  actionText?: string | null;
  metadata?: unknown;
  storyId?: number | null;
  postId?: number | null;
}): string {
  const fromApi = String(input.actionText ?? "").trim();
  if (fromApi) return fromApi;

  const meta = parseNotificationMetadata(input.metadata);
  const type = input.type || "unknown";
  const eventTitle =
    typeof meta.event_title === "string" ? meta.event_title.trim() : "";

  if (isStoryCommentNotification({ type, storyId: input.storyId, postId: input.postId, metadata: meta })) {
    return "commented on your story";
  }

  switch (type) {
    case "like":
      if (meta.source === "comment_reaction") {
        return "reacted to your comment";
      }
      return "liked your post";
    case "story_reaction":
      return "liked your story";
    case "comment":
      return "commented on your post";
    case "connection_request":
      return "sent you a connection request";
    case "connection_accepted":
      return "accepted your connection request";
    case "repost":
      return "reposted your post";
    case "mention":
      return meta.source === "comment"
        ? "mentioned you in a comment"
        : "mentioned you in a post";
    case "message":
      return typeof meta.message === "string" && meta.message.trim()
        ? meta.message.trim()
        : "sent you a message";
    case "event_invite":
      return eventTitle
        ? `invited you to ${eventTitle}`
        : "invited you to an event";
    case "event_reminder":
      return eventTitle
        ? `${eventTitle} starts in ${String(meta.reminder_label ?? "soon")}`
        : "you have an upcoming event";
    default:
      break;
  }

  if (typeof meta.message === "string" && meta.message.trim()) {
    return meta.message.trim();
  }
  if (eventTitle) return `updated ${eventTitle}`;
  if (type.startsWith("event_")) return "sent an event update";
  if (type.includes("connection")) return "sent a connection update";
  return "shared an update with you";
}

export function notificationStoryCommentPreview(
  metadata?: NotificationMetadata | unknown
): string | null {
  const meta = parseNotificationMetadata(metadata);
  const text =
    (typeof meta.comment_text === "string" && meta.comment_text.trim()) ||
    (typeof meta.message === "string" &&
      meta.message_type === "story_reply" &&
      meta.message.trim()) ||
    null;
  return text;
}
