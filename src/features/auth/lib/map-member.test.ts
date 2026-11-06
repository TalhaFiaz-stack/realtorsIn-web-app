import { describe, expect, it } from "vitest";
import {
  extractRealtorsinToken,
  mapToPublicMember,
  resolvePostAuthPath,
} from "@/features/auth/lib/map-member";

describe("mapToPublicMember", () => {
  it("never exposes tokens on the public member", () => {
    const member = mapToPublicMember({
      social_profile_id: 12,
      user_name: "agent",
      realtorsin_token: "secret-token",
      node_token: "other-secret",
      active_status: "active",
      has_profile: true,
      profile_image: { url: "https://cdn.example/a.jpg" },
    });

    expect(member.userName).toBe("agent");
    expect(member.avatarUrl).toBe("https://cdn.example/a.jpg");
    expect(member.needsOnboarding).toBe(false);
    expect(JSON.stringify(member)).not.toContain("secret-token");
    expect(JSON.stringify(member)).not.toContain("other-secret");
  });

  it("flags onboarding when username is missing", () => {
    const member = mapToPublicMember({
      social_profile_id: 1,
      user_name: null,
      has_profile: true,
      active_status: "active",
    });
    expect(member.needsOnboarding).toBe(true);
    expect(resolvePostAuthPath(member, "/feed")).toBe("/onboarding/profile");
  });
});

describe("extractRealtorsinToken", () => {
  it("reads realtorsin_token only", () => {
    expect(
      extractRealtorsinToken({
        realtorsin_token: "abc",
        node_token: "xyz",
      })
    ).toBe("abc");
    expect(extractRealtorsinToken({ node_token: "xyz" })).toBeNull();
  });
});
