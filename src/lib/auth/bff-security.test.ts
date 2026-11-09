import { describe, expect, it } from "vitest";
import { assertSameOrigin, CsrfError } from "@/lib/auth/csrf";
import { getSafeNextPath } from "@/lib/auth/safe-redirect";
import { handleBffError } from "@/lib/auth/bff";
import { ApiError } from "@/lib/api/errors";
import { z } from "zod";

describe("auth security helpers", () => {
  it("blocks open redirects", () => {
    expect(getSafeNextPath("https://evil.example")).toBe("/feed");
    expect(getSafeNextPath("//evil.example")).toBe("/feed");
    expect(getSafeNextPath("/feed?tab=1")).toBe("/feed?tab=1");
  });

  it("rejects CSRF without origin on POST", () => {
    expect(() =>
      assertSameOrigin(
        new Request("http://localhost:3002/api/posts/like", { method: "POST" })
      )
    ).toThrow(CsrfError);
  });

  it("maps ApiError without leaking token material", async () => {
    const apiRes = handleBffError(
      new ApiError("SESSION_EXPIRED", "Session expired or invalid", 401)
    );
    expect(apiRes.status).toBe(401);
    const apiBody = await apiRes.json();
    expect(apiBody.code).toBe("SESSION_EXPIRED");
    expect(JSON.stringify(apiBody)).not.toMatch(/Bearer|realtorsin_token/i);
  });

  it("maps Zod validation failures to 400", async () => {
    const parsed = z.object({ a: z.string() }).safeParse({});
    expect(parsed.success).toBe(false);
    if (parsed.success) return;
    const zodRes = handleBffError(parsed.error);
    expect(zodRes.status).toBe(400);
  });

  it("hides raw upstream DB/runtime errors but keeps friendly messages", async () => {
    const leak = handleBffError(
      new ApiError("SERVER", "SequelizeDatabaseError: column \"x\" does not exist", 500)
    );
    expect((await leak.json()).message).toBe("Something went wrong. Please try again.");

    const friendly = handleBffError(new ApiError("SERVER", "Unable to block this user", 502));
    expect((await friendly.json()).message).toBe("Unable to block this user");
  });
});

