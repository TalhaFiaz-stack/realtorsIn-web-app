import { describe, expect, it } from "vitest";
import {
  commentCreateSchema,
  createPostFieldsSchema,
  feedListSchema,
  MAX_UPLOAD_BYTES,
  reportPostSchema,
} from "@/features/feed/validators/feed.validators";

describe("feed validators", () => {
  it("parses feed list defaults", () => {
    const parsed = feedListSchema.parse({});
    expect(parsed.page).toBe(1);
    expect(parsed.perPage).toBe(20);
  });

  it("rejects empty comments", () => {
    expect(() =>
      commentCreateSchema.parse({ postId: 1, comment: "   " })
    ).toThrow();
  });

  it("defaults create visibility to connections", () => {
    expect(createPostFieldsSchema.parse({}).visibility).toBe("connections");
  });

  it("requires report reason", () => {
    expect(() => reportPostSchema.parse({ postId: 1 })).toThrow();
  });

  it("documents 50MB upload cap", () => {
    expect(MAX_UPLOAD_BYTES).toBe(50 * 1024 * 1024);
  });
});
