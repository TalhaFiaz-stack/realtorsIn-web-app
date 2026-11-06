import { describe, expect, it } from "vitest";
import {
  getPasswordValidation,
  isPasswordStrong,
} from "@/features/settings/lib/password-strength";

describe("password-strength", () => {
  it("requires all rules for a strong password", () => {
    expect(isPasswordStrong("short")).toBe(false);
    expect(isPasswordStrong("abcdefgh")).toBe(false);
    expect(isPasswordStrong("Abcdefgh1!")).toBe(true);
  });

  it("tracks individual validation flags", () => {
    expect(getPasswordValidation("Aa1!xxxx")).toEqual({
      length: true,
      uppercase: true,
      lowercase: true,
      number: true,
      special: true,
    });
  });
});
