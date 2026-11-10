import { afterEach, describe, expect, it, vi } from "vitest";
import { resolveMediaUrl } from "@/lib/media/resolve-media-url";

describe("resolveMediaUrl", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("resolves bare backend paths against the files base", () => {
    vi.stubEnv("NEXT_PUBLIC_SOCIAL_FILES_BASE_URL", "https://api.realtorsin.com/");
    expect(resolveMediaUrl("realtorsin/jobs/29/images0.png")).toBe(
      "https://api.realtorsin.com/realtorsin/jobs/29/images0.png"
    );
    expect(resolveMediaUrl("/realtorsin/jobs/29/a.png")).toBe(
      "https://api.realtorsin.com/realtorsin/jobs/29/a.png"
    );
  });

  it("keeps absolute URLs and repairs the missing-slash backend bug", () => {
    expect(resolveMediaUrl("https://cdn.realtorsin.com/x.png")).toBe("https://cdn.realtorsin.com/x.png");
    expect(resolveMediaUrl("https://cdn.realtorsin.comrealtorsin/jobs/1.png")).toBe(
      "https://cdn.realtorsin.com/realtorsin/jobs/1.png"
    );
  });

  it("returns null for empty or non-string values", () => {
    expect(resolveMediaUrl("")).toBeNull();
    expect(resolveMediaUrl(null)).toBeNull();
    expect(resolveMediaUrl(42)).toBeNull();
  });
});
