import { describe, expect, it } from "vitest";
import { isTrustedMediaUrl } from "@/lib/security/media-url";

describe("isTrustedMediaUrl", () => {
  it("accepts https files on our media hosts", () => {
    expect(isTrustedMediaUrl("https://cdn.realtorsin.com/chat/doc.pdf")).toBe(true);
  });
  it("rejects other hosts, http and lookalikes", () => {
    for (const bad of [
      "https://evil.example/doc.pdf",
      "http://cdn.realtorsin.com/doc.pdf",
      "https://cdn.realtorsin.com.evil.net/doc.pdf",
      "javascript:alert(1)",
      "not a url",
    ]) {
      expect(isTrustedMediaUrl(bad)).toBe(false);
    }
  });
});
