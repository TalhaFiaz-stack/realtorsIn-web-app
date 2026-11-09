import { describe, expect, it } from "vitest";
import {
  buildCampaignSrcDoc,
  classifyCampaignLink,
} from "@/features/campaigns/lib/build-campaign-srcdoc";

const ORIGIN = "https://app.realtorsin.com";
const resolve = (u: string) => (u.includes("posts/5") ? "/posts/5" : null);

describe("campaign HTML", () => {
  it("embeds content and the click bridge", () => {
    const doc = buildCampaignSrcDoc("<h1>Hi</h1>");
    expect(doc).toContain("<h1>Hi</h1>");
    expect(doc).toContain("rin-campaign-link");
  });

  it("routes links like the mobile sheet", () => {
    expect(classifyCampaignLink("https://example.com/x", ORIGIN, resolve)).toEqual({
      kind: "external",
      url: "https://example.com/x",
    });
    expect(classifyCampaignLink(`${ORIGIN}/events/2?a=1`, ORIGIN, resolve)).toEqual({
      kind: "internal",
      path: "/events/2?a=1",
    });
    expect(classifyCampaignLink("realtorsin://posts/5", ORIGIN, resolve)).toEqual({
      kind: "internal",
      path: "/posts/5",
    });
    expect(classifyCampaignLink("javascript:alert(1)", ORIGIN, resolve)).toEqual({ kind: "ignore" });
    expect(classifyCampaignLink("mailto:a@b.co", ORIGIN, resolve).kind).toBe("external");
    expect(classifyCampaignLink("//evil.com", ORIGIN, resolve)).toEqual({ kind: "ignore" });
  });
});
