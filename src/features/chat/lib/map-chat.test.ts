import { describe, expect, it } from "vitest";
import {
  isBackendSuccess,
  mapConversation,
  mapConversationsPage,
  mapMessage,
  mapMessagesPage,
  resolveIsOwn,
} from "@/features/chat/lib/map-chat";

describe("mapConversation", () => {
  it("maps conversation summary", () => {
    const item = mapConversation({
      conversation_id: 3,
      other_user: {
        id: 88,
        first_name: "Alex",
        last_name: "Agent",
        user_name: "alex",
        profile_pic: "https://cdn.example/u.jpg",
        is_online: true,
      },
      last_message: { message_content: "Hello" },
      last_message_at: "2026-11-03T10:00:00Z",
      unread_count: 2,
      is_pinned: false,
      is_muted: false,
    });
    expect(item).toMatchObject({
      id: 3,
      lastMessage: "Hello",
      unreadCount: 2,
      otherUser: { id: 88, name: "Alex Agent", isOnline: true },
    });
  });

  it("uses share-type label when message_content is empty", () => {
    const item = mapConversation({
      conversation_id: 4,
      other_user: { id: 1, first_name: "Umar", last_name: "Farooq" },
      last_message: {
        message_type: "event_share",
        message_content: "",
      },
      last_message_at: "2026-11-05T12:00:00Z",
      unread_count: 0,
    });
    expect(item?.lastMessage).toBe("Shared an event");
  });
});

function messagePayload(overrides: Record<string, unknown>) {
  return {
    id: 1,
    fk_conversation_id: 3,
    fk_sender_id: 10,
    fk_receiver_id: 88,
    message_content: "Hi",
    created_at: "2026-11-03T10:00:00Z",
    is_read: true,
    ...overrides,
  };
}

describe("resolveIsOwn", () => {
  it("forceOwn true classifies as own", () => {
    expect(
      resolveIsOwn({ senderId: 99, currentUserId: null, forceOwn: true })
    ).toBe(true);
  });

  it("forceOwn false classifies as not own even when ids match", () => {
    expect(
      resolveIsOwn({ senderId: 10, currentUserId: 10, forceOwn: false })
    ).toBe(false);
  });

  it("matches currentUserId when present", () => {
    expect(resolveIsOwn({ senderId: 10, currentUserId: 10 })).toBe(true);
    expect(resolveIsOwn({ senderId: 88, currentUserId: 10 })).toBe(false);
  });

  it("does not infer ownership when currentUserId is missing", () => {
    expect(resolveIsOwn({ senderId: 10, currentUserId: null })).toBe(false);
  });
});

describe("mapMessagesPage ownership", () => {
  it("marks own messages when sender matches currentUserId", () => {
    const page = mapMessagesPage(
      {
        status: true,
        data: {
          messages: [
            messagePayload({
              id: 1,
              fk_sender_id: 88,
              fk_receiver_id: 10,
              message_content: "Hi",
            }),
            messagePayload({
              id: 2,
              fk_sender_id: 10,
              fk_receiver_id: 88,
              message_type: "image",
              message_content: "Hey",
              created_at: "2026-11-03T10:01:00Z",
              is_read: false,
              images: [{ image_url: "https://cdn.example/a.jpg" }],
            }),
          ],
          other_user: { id: 88, first_name: "Alex", last_name: "Agent" },
          pagination: { page: 1, limit: 50, total: 2, has_more: false },
        },
      },
      10
    );
    expect(page.messages[0]?.isOwn).toBe(false);
    expect(page.messages[1]?.isOwn).toBe(true);
    expect(page.messages[1]?.images[0]?.url).toContain("cdn.example");
    expect(page.otherUser?.name).toBe("Alex Agent");
    expect(page.hasMore).toBe(false);
  });

  it("marks other participant as not own when currentUserId is known", () => {
    const page = mapMessagesPage(
      {
        status: true,
        data: {
          messages: [messagePayload({ fk_sender_id: 88 })],
          other_user: { id: 88, first_name: "Alex", last_name: "Agent" },
          pagination: { page: 1, limit: 50, total: 1, has_more: false },
        },
      },
      10
    );
    expect(page.messages[0]?.isOwn).toBe(false);
  });

  it("never infers isOwn from other_user when currentUserId is missing", () => {
    const page = mapMessagesPage(
      {
        status: true,
        data: {
          messages: [
            messagePayload({
              id: 1,
              fk_sender_id: 10,
              fk_receiver_id: 88,
              message_content: "not inferred as mine",
            }),
            messagePayload({
              id: 2,
              fk_sender_id: 88,
              fk_receiver_id: 10,
              message_content: "theirs",
            }),
          ],
          other_user: { id: 88, first_name: "Alex", last_name: "Agent" },
          pagination: { page: 1, limit: 50, total: 2, has_more: false },
        },
      },
      null
    );
    expect(page.messages[0]?.isOwn).toBe(false);
    expect(page.messages[1]?.isOwn).toBe(false);
  });

  it("does not mark unknown third-party as own without currentUserId", () => {
    const page = mapMessagesPage(
      {
        status: true,
        data: {
          messages: [
            messagePayload({
              id: 1,
              fk_sender_id: 999,
              fk_receiver_id: 88,
              message_content: "third party",
            }),
          ],
          other_user: { id: 88, first_name: "Alex", last_name: "Agent" },
          pagination: { page: 1, limit: 50, total: 1, has_more: false },
        },
      },
      null
    );
    expect(page.messages[0]?.isOwn).toBe(false);
  });

  it("keeps isOwn false when currentUserId and other_user are both missing", () => {
    const page = mapMessagesPage(
      {
        status: true,
        data: {
          messages: [messagePayload({ fk_sender_id: 10 })],
          pagination: { page: 1, limit: 50, total: 1, has_more: false },
        },
      },
      null
    );
    expect(page.messages[0]?.isOwn).toBe(false);
    expect(page.otherUser).toBeNull();
  });

  it("returns null for missing or malformed sender id", () => {
    expect(mapMessage({}, 1)).toBeNull();
    expect(
      mapMessage(
        {
          id: 1,
          fk_conversation_id: 3,
          fk_sender_id: "bad",
          message_content: "x",
        },
        10
      )
    ).toBeNull();
    expect(
      mapMessage(
        {
          id: 1,
          fk_conversation_id: 3,
          message_content: "no sender",
        },
        10
      )
    ).toBeNull();
  });

  it("honors trusted forceOwn acknowledgement", () => {
    const mapped = mapMessage(
      messagePayload({ fk_sender_id: 999 }),
      null,
      { forceOwn: true }
    );
    expect(mapped?.isOwn).toBe(true);
  });

  it("honors explicit forceOwn false", () => {
    const mapped = mapMessage(messagePayload({ fk_sender_id: 10 }), 10, {
      forceOwn: false,
    });
    expect(mapped?.isOwn).toBe(false);
  });

  it("maps story reply sharedStory preview and owner", () => {
    const mapped = mapMessage(
      messagePayload({
        message_type: "story_reply",
        message_content: "test",
        sharedStory: {
          id: 12,
          media_type: "video",
          owner_name: "John Doe",
          preview_url: "https://cdn.example/story-thumb.jpg",
          media_url: "https://cdn.example/story.mp4",
          is_expired: false,
        },
      }),
      10
    );
    expect(mapped?.messageType).toBe("story_reply");
    expect(mapped?.sharedStory?.ownerName).toBe("John Doe");
    expect(mapped?.sharedStory?.previewUrl).toBe(
      "https://cdn.example/story-thumb.jpg"
    );
    expect(mapped?.sharedStory?.mediaType).toBe("video");
  });
});

describe("mapConversationsPage", () => {
  it("maps empty conversations safely", () => {
    const page = mapConversationsPage({
      status: true,
      data: { conversations: [], pagination: { page: 1, has_more: false } },
    });
    expect(page.conversations).toEqual([]);
  });
});

describe("isBackendSuccess", () => {
  it("accepts status flags", () => {
    expect(isBackendSuccess({ status: true })).toBe(true);
    expect(isBackendSuccess({ success: "true" })).toBe(true);
  });
});
