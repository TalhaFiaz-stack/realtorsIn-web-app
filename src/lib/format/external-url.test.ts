import { describe, expect, it } from "vitest";
import { toExternalUrl } from "@/lib/format/external-url";

describe("toExternalUrl", () => {
  it("adds https to bare domains", () => {
    expect(toExternalUrl("Www.google.com")).toBe("https://www.google.com/");
    expect(toExternalUrl("zoom.us/j/123")).toBe("https://zoom.us/j/123");
  });
  it("keeps absolute http(s) links", () => {
    expect(toExternalUrl("https://meet.google.com/abc")).toBe("https://meet.google.com/abc");
  });
  it("rejects free text and unsafe schemes", () => {
    expect(toExternalUrl("Cupiditate nulla sin")).toBeNull();
    expect(toExternalUrl("Cupiditate")).toBeNull();
    expect(toExternalUrl("javascript://x.com")).toBeNull();
    expect(toExternalUrl("")).toBeNull();
  });
});
