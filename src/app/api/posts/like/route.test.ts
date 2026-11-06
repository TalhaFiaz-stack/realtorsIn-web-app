import { beforeEach, describe, expect, it, vi } from "vitest";

const togglePostLike = vi.fn();

vi.mock("@/features/feed/services/posts.server", () => ({
  togglePostLike: (...args: unknown[]) => togglePostLike(...args),
}));

import { POST } from "@/app/api/posts/like/route";

function likeRequest(body: unknown, headers: Record<string, string> = {}) {
  return new Request("http://localhost:3002/api/posts/like", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/posts/like", () => {
  beforeEach(() => {
    togglePostLike.mockReset();
  });

  it("rejects CSRF without Origin", async () => {
    const res = await POST(likeRequest({ postId: 1 }));
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.code).toBe("CSRF");
    expect(togglePostLike).not.toHaveBeenCalled();
  });

  it("validates body and returns like state", async () => {
    togglePostLike.mockResolvedValue({ isLiked: true, userReaction: "like" });
    const res = await POST(
      likeRequest(
        { postId: 42 },
        { origin: "http://localhost:3002", host: "localhost:3002" }
      )
    );
    expect(res.status).toBe(200);
    expect(togglePostLike).toHaveBeenCalledWith(42, { reactionType: null });
    await expect(res.json()).resolves.toMatchObject({
      ok: true,
      isLiked: true,
      userReaction: "like",
    });
  });

  it("rejects invalid postId", async () => {
    const res = await POST(
      likeRequest(
        { postId: 0 },
        { origin: "http://localhost:3002", host: "localhost:3002" }
      )
    );
    expect(res.status).toBe(400);
    expect(togglePostLike).not.toHaveBeenCalled();
  });
});
