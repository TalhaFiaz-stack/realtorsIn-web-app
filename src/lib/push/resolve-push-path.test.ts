import { describe, expect, it } from "vitest";
import { resolvePushPath } from "@/lib/push/resolve-push-path";

describe("resolvePushPath (mobile notificationNavigation parity)", () => {
  it("routes legacy social types", () => {
    expect(resolvePushPath({ type: "like", post_id: "12" })).toBe("/posts/12");
    expect(resolvePushPath({ type: "comment", activity_id: "7" })).toBe("/posts/7");
    expect(resolvePushPath({ type: "connection_request", user_id: "5" })).toBe("/profile/5");
    expect(resolvePushPath({ type: "message", conversation_id: "9" })).toBe("/messages/9");
    expect(resolvePushPath({ type: "message" })).toBe("/messages");
    expect(resolvePushPath({ type: "open_project", offPlanProjectId: "321" })).toBe("/off-plan/321");
    expect(resolvePushPath({ type: "event_reminder", event_id: "4" })).toBe("/events/4");
    expect(resolvePushPath({ type: "event_deleted", event_id: "4" })).toBe("/events");
    expect(resolvePushPath({ type: "broker_verification" })).toBe("/me/broker-verification");
    expect(resolvePushPath({ type: "referral_progress" })).toBe("/invite");
  });

  it("opens campaign HTML designs (view_content)", () => {
    expect(resolvePushPath({ type: "view_content", design_id: "14" })).toBe(
      "/feed?campaign_design=14"
    );
  });

  it("routes campaign deep links", () => {
    expect(resolvePushPath({ deep_link: "https://realtorsin.com/posts/55" })).toBe("/posts/55");
    expect(resolvePushPath({ path: "/projects/88" })).toBe("/off-plan/88");
    expect(resolvePushPath({ link: "realtorsin://events/3" })).toBe("/events/3");
    expect(resolvePushPath({ deep_link: "/properties/rent_in/41" })).toBe(
      "/listings/property/41?type=rent_in"
    );
    expect(resolvePushPath({ deep_link: "/invite_friends" })).toBe("/invite");
  });

  it("routes screen and screen_key campaigns", () => {
    expect(
      resolvePushPath({ screen: "postDetail", params_json: '{"id":"19"}' })
    ).toBe("/posts/19");
    expect(resolvePushPath({ screen: "socialChatScreen", param_conversationId: "2" })).toBe(
      "/messages/2"
    );
    expect(resolvePushPath({ screen: "offPlanDetail", params: { item: { id: 6 } } })).toBe(
      "/off-plan/6"
    );
    expect(resolvePushPath({ screen_key: "influencer_challenge" })).toBe("/growth/influencer");
  });

  it("falls back to notifications", () => {
    expect(resolvePushPath(null)).toBe("/notifications");
    expect(resolvePushPath({ type: "view_content" })).toBe("/notifications");
    expect(resolvePushPath({ type: "like" })).toBe("/notifications");
    expect(resolvePushPath({ screen: "unknownScreen" })).toBe("/notifications");
  });

  it("rejects unsafe ids", () => {
    expect(resolvePushPath({ type: "like", post_id: "../../x" })).toBe("/notifications");
  });

  it("is self-contained so the service worker can embed it", () => {
    const rebuilt = new Function(`return (${resolvePushPath.toString()})`)() as typeof resolvePushPath;
    expect(rebuilt({ type: "like", post_id: "3" })).toBe("/posts/3");
  });
});
