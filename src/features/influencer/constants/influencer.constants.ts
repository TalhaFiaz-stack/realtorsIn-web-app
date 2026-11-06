/** Defaults — API status also returns target_videos, window_days, daily_cap. */
export const INFLUENCER_TARGET_VIDEOS = 30;
export const INFLUENCER_WINDOW_DAYS = 45;
export const INFLUENCER_DAILY_CAP = 2;

export const INFLUENCER_CHALLENGE_DESCRIPTION =
  "Grow your presence on RealtorsIn so more brokers notice you and your network grows. Complete the challenge to earn the Influencer Badge on your profile.";

export const INFLUENCER_CHALLENGE_SHORT = `Post ${INFLUENCER_TARGET_VIDEOS} videos in ${INFLUENCER_WINDOW_DAYS} days to earn the Influencer Badge — max ${INFLUENCER_DAILY_CAP} videos count per day.`;

export const INFLUENCER_CHALLENGE_GUIDE = [
  {
    title: "Post video content",
    body: `Share up to ${INFLUENCER_TARGET_VIDEOS} videos during the challenge window.`,
  },
  {
    title: "Daily cap",
    body: `Only ${INFLUENCER_DAILY_CAP} videos count toward the challenge each day — quality over spam.`,
  },
  {
    title: "Finish in time",
    body: `You have ${INFLUENCER_WINDOW_DAYS} days from the day you start. Keep an eye on days remaining.`,
  },
  {
    title: "Earn the badge",
    body: "Hit the video target before time runs out to unlock the Influencer Badge on your profile and posts.",
  },
] as const;
