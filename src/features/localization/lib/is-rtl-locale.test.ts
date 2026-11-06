import { describe, expect, it } from "vitest";
import { isRtlLocale } from "@/features/localization/lib/is-rtl-locale";

describe("isRtlLocale", () => {
  it("marks RTL languages", () => {
    expect(isRtlLocale("ar")).toBe(true);
    expect(isRtlLocale("ur")).toBe(true);
    expect(isRtlLocale("fa")).toBe(true);
  });

  it("marks LTR languages", () => {
    expect(isRtlLocale("en")).toBe(false);
    expect(isRtlLocale("de")).toBe(false);
  });
});
