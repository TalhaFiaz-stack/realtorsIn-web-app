import { describe, expect, it } from "vitest";
import { findMentionRanges } from "@/features/feed/lib/mention-query";

describe("findMentionRanges", () => {
  it("finds every occurrence of selected labels", () => {
    const text = "Thanks M Umar Farooq and John Doe! M Umar Farooq again";
    const r = findMentionRanges(text, ["M Umar Farooq", "John Doe"]);
    expect(r.map((x) => text.slice(x.start, x.end))).toEqual([
      "M Umar Farooq",
      "John Doe",
      "M Umar Farooq",
    ]);
  });
  it("prefers the longest label when names overlap", () => {
    const r = findMentionRanges("hi Ali Khan", ["Ali", "Ali Khan"]);
    expect(r).toEqual([{ start: 3, end: 11, label: "Ali Khan" }]);
  });
  it("ignores empty labels", () => {
    expect(findMentionRanges("abc", [""])).toEqual([]);
  });
});
