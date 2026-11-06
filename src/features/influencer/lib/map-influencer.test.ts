import { describe, expect, it } from "vitest";
import {
  mapInfluencerPostCreateChallenge,
  mapInfluencerStatus,
} from "@/features/influencer/lib/map-influencer";

describe("mapInfluencerStatus", () => {
  it("maps challenge fields from API", () => {
    const status = mapInfluencerStatus({
      challenge_status: "in_progress",
      has_influencer_badge: false,
      video_count: 3,
      target_videos: 30,
      days_remaining: 40,
      should_show_modal: true,
      feature_enabled: true,
    });
    expect(status.challengeStatus).toBe("in_progress");
    expect(status.videoCount).toBe(3);
    expect(status.shouldShowModal).toBe(true);
  });

  it("maps post-create start popup flags", () => {
    const challenge = mapInfluencerPostCreateChallenge({
      challenge_status: "not_started",
      should_show_start_popup: true,
      counted_toward_challenge: false,
      video_count: 0,
    });
    expect(challenge?.shouldShowStartPopup).toBe(true);
    expect(challenge?.countedTowardChallenge).toBe(false);
  });
});
