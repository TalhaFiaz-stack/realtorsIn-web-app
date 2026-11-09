import { describe, expect, it } from "vitest";
import { mapMessage, mapMessageReactions } from "@/features/chat/lib/map-chat";

describe("chat message reactions / edit / delete", () => {
  it("groups reactions by emoji", () => {
    expect(
      mapMessageReactions([
        { emoji: "👍", fk_user_id: 1 },
        { emoji: "👍", fk_user_id: 2 },
        { emoji: "❤️", fk_user_id: 1 },
      ])
    ).toEqual([
      { emoji: "👍", count: 2, userIds: [1, 2] },
      { emoji: "❤️", count: 1, userIds: [1] },
    ]);
    expect(mapMessageReactions(undefined)).toEqual([]);
  });

  it("maps edited and deleted flags", () => {
    const msg = mapMessage(
      {
        id: 5,
        conversation_id: 2,
        sender_id: 9,
        receiver_id: 3,
        message_content: "",
        is_edited: true,
        deleted_for_everyone: true,
        reactions: [{ emoji: "😂", fk_user_id: 3 }],
      },
      9
    );
    expect(msg).toMatchObject({ isEdited: true, isDeleted: true, isOwn: true });
    expect(msg?.reactions).toHaveLength(1);
  });
});
