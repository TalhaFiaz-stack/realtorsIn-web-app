export type NotificationMetadata = Record<string, unknown>;

export function parseNotificationMetadata(
  metadata: unknown
): NotificationMetadata {
  if (metadata == null) return {};
  if (typeof metadata === "object" && !Array.isArray(metadata)) {
    return metadata as NotificationMetadata;
  }
  if (typeof metadata === "string") {
    const trimmed = metadata.trim();
    if (!trimmed) return {};
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
        return parsed as NotificationMetadata;
      }
    } catch {
      return {};
    }
  }
  return {};
}

export function isStoryCommentNotification(input: {
  type: string;
  storyId?: number | null;
  postId?: number | null;
  metadata?: NotificationMetadata;
}): boolean {
  const meta = input.metadata ?? {};
  if (input.type === "story_comment") return true;
  if (input.storyId != null && input.storyId > 0) {
    if (input.type === "comment" || input.type === "message") return true;
  }
  if (meta.source === "story") return true;
  if (meta.message_type === "story_reply") return true;
  if (meta.story_id != null && Number(meta.story_id) > 0) return true;
  return false;
}
