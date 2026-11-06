import { describe, expect, it } from "vitest";
import {
  isBackendSuccess,
  mapNotification,
  mapNotificationsPage,
} from "@/features/notifications/lib/map-notification";

describe("mapNotification", () => {
  it("maps notification rows", () => {
    const item = mapNotification({
      id: 15,
      type: "like",
      full_name: "Ada",
      user_name: "ada",
      profile_image: "https://cdn.example/a.jpg",
      action_text: "liked your post",
      created_at: "2026-11-03T12:00:00Z",
      is_read: false,
      post_id: 99,
      connection_id: null,
      can_accept_connection: false,
    });
    expect(item).toMatchObject({
      id: 15,
      postId: 99,
      isRead: false,
      actionText: "liked your post",
      storyId: null,
    });
  });

  it("maps story comment notifications", () => {
    const item = mapNotification({
      id: 20,
      type: "comment",
      full_name: "Umar",
      story_id: 44,
      metadata: { source: "story", comment_text: "Hello" },
      created_at: "2026-11-05T12:00:00Z",
      is_read: false,
    });
    expect(item?.actionText).toBe("commented on your story");
    expect(item?.storyId).toBe(44);
  });
});

describe("mapNotificationsPage", () => {
  it("derives hasNextPage from Laravel pagination", () => {
    const page = mapNotificationsPage({
      status: true,
      data: {
        current_page: 1,
        last_page: 2,
        next_page_url: "https://api.example/notifications?page=2",
        per_page: 20,
        total: 21,
        data: [{ id: 1, type: "comment", action_text: "commented" }],
      },
    });
    expect(page.hasNextPage).toBe(true);
    expect(page.notifications).toHaveLength(1);
  });
});

describe("isBackendSuccess", () => {
  it("requires status true", () => {
    expect(isBackendSuccess({ status: true })).toBe(true);
    expect(isBackendSuccess({ success: true })).toBe(false);
  });
});
