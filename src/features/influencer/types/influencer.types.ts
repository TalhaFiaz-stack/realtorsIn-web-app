export type InfluencerChallengeStatus =
  | "not_started"
  | "in_progress"
  | "expired"
  | "earned"
  | string;

export type InfluencerStatus = {
  challengeStatus: InfluencerChallengeStatus;
  hasInfluencerBadge: boolean;
  influencerBadgeEarnedAt: string | null;
  videoCount: number;
  targetVideos: number;
  dailyCap: number;
  windowDays: number;
  daysRemaining: number;
  challengeStartedAt: string | null;
  challengeEndsAt: string | null;
  progressText: string;
  progressRatio: number;
  featureEnabled: boolean;
  shouldShowModal: boolean;
  popupVariant: string | null;
  modalHeadline: string | null;
  modalBody: string | null;
};

/** Extra fields on post-create `influencer_challenge` from SocialProfileREM */
export type InfluencerPostCreateChallenge = InfluencerStatus & {
  shouldShowStartPopup: boolean;
  countedTowardChallenge: boolean;
};
