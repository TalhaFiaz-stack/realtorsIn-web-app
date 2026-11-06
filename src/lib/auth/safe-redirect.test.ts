import { describe, expect, it } from "vitest";
import { getSafeNextPath } from "@/lib/auth/safe-redirect";

describe("getSafeNextPath", () => {
  it("allows relative app paths", () => {
    expect(getSafeNextPath("/feed")).toBe("/feed");
    expect(getSafeNextPath("/me/edit")).toBe("/me/edit");
  });

  it("blocks open redirects", () => {
    expect(getSafeNextPath("https://evil.example")).toBe("/feed");
    expect(getSafeNextPath("//evil.example")).toBe("/feed");
    expect(getSafeNextPath("/\\evil")).toBe("/feed");
    expect(getSafeNextPath("javascript:alert(1)")).toBe("/feed");
  });

  it("falls back for empty values", () => {
    expect(getSafeNextPath(null)).toBe("/feed");
    expect(getSafeNextPath(undefined, "/login")).toBe("/login");
  });
});
