import { describe, expect, it } from "vitest";
import { appendMessage } from "@/features/chat/lib/thread-cache";
import { createOptimisticChatMessage } from "@/features/chat/lib/create-optimistic-message";

const msg = (id: number) => ({
  ...createOptimisticChatMessage({ tempId: -1, conversationId: 7, receiverId: 2, content: "hi" }),
  id,
});

describe("thread cache", () => {
  const base = {
    pages: [{ messages: [msg(1)], otherUser: null, page: 1, limit: 50, total: 1, hasMore: false }],
    pageParams: [1],
  };
  it("appends to the newest page", () => {
    expect(appendMessage(base, msg(2))?.pages[0].messages.map((m) => m.id)).toEqual([1, 2]);
  });
  it("dedupes by id (socket + HTTP both deliver)", () => {
    expect(appendMessage(base, msg(1))).toBe(base);
  });
  it("leaves an unloaded thread alone", () => {
    expect(appendMessage(undefined, msg(3))).toBeUndefined();
  });
});
