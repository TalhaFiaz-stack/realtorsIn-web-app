import { describe, expect, it } from "vitest";
import {
  notificationStoryCommentPreview,
  resolveNotificationActionText,
} from "@/features/notifications/lib/notification-action-text";

describe("resolveNotificationActionText", () => {
  it("uses API action_text when present", () => {
    expect(
      resolveNotificationActionText({
        type: "like",
        actionText: "liked your post",
      })
    ).toBe("liked your post");
  });

  it("labels story comments", () => {
    expect(
      resolveNotificationActionText({
        type: "comment",
        metadata: { source: "story" },
        storyId: 12,
      })
    ).toBe("commented on your story");
  });

  it("labels story replies stored as message type", () => {
    expect(
      resolveNotificationActionText({
        type: "message",
        metadata: { message_type: "story_reply", story_id: 5 },
      })
    ).toBe("commented on your story");
  });

  it("falls back for unknown types instead of showing raw type", () => {
    expect(
      resolveNotificationActionText({
        type: "unknown",
        actionText: null,
      })
    ).toBe("shared an update with you");
  });
});

describe("notificationStoryCommentPreview", () => {
  it("shows quoted comment text when available", () => {
    expect(
      notificationStoryCommentPreview({
        source: "story",
        comment_text: "Nice story!",
      })
    ).toBe("Nice story!");
  });
});
