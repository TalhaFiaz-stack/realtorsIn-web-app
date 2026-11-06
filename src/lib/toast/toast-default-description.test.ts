import { describe, expect, it } from "vitest";
import { defaultToastDescription } from "@/lib/toast/toast-default-description";

describe("defaultToastDescription", () => {
  it("adds clipboard hint for copy toasts", () => {
    expect(defaultToastDescription("success", "Invite message copied to clipboard")).toMatch(
      /paste/i
    );
  });

  it("adds retry hint for errors", () => {
    expect(defaultToastDescription("error", "Unable to share invite")).toMatch(
      /try again/i
    );
  });
});
