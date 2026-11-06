import { describe, expect, it } from "vitest";
import {
  mapReferralHistoryPayload,
  mapReferralStatus,
} from "@/features/referral/lib/map-referral";

describe("mapReferralStatus", () => {
  it("maps backend snake_case fields", () => {
    const status = mapReferralStatus({
      referral_code: "RIX7K9M2",
      referral_count: 1,
      referral_target: 2,
      has_connector_badge: false,
      can_refer: true,
      should_show_modal: false,
      progress_text: "1 of 2 joined",
    });
    expect(status.referralCode).toBe("RIX7K9M2");
    expect(status.referralCount).toBe(1);
    expect(status.canRefer).toBe(true);
  });
});

describe("mapReferralHistoryPayload", () => {
  it("maps referral list", () => {
    const page = mapReferralHistoryPayload({
      status: true,
      data: {
        referral_code: "RIX7K9M2",
        referral_count: 0,
        referral_target: 2,
        has_connector_badge: false,
        referrals: [
          {
            id: 9,
            status: "pending",
            status_label: "Sign-up started",
            referred_user: {
              user_id: 42,
              name: "Alex Broker",
              short_name: "Alex B.",
              user_name: "alex",
            },
            progress: {
              all_complete: false,
              steps: [{ key: "signup", label: "Sign Up", done: true }],
            },
          },
        ],
      },
    });
    expect(page.referrals).toHaveLength(1);
    expect(page.referrals[0]?.referredUser.userName).toBe("alex");
  });
});
