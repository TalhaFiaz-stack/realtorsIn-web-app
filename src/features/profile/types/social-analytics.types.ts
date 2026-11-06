export type AnalyticsMetric = {
  value: number;
  period: string | null;
  delta7dPercent?: number | null;
};

export type ProfileViewerRow = {
  viewerId: number;
  name: string | null;
  lastName: string | null;
  userName: string | null;
  profileImage: string | null;
  company: string | null;
  userRole: string | null;
  location: string | null;
  lastViewedAt: string | null;
};

export type SocialAnalyticsDetail = {
  postImpressions: AnalyticsMetric;
  profileViewers: AnalyticsMetric & { viewers: ProfileViewerRow[] };
  searchAppearances: AnalyticsMetric;
  connections: AnalyticsMetric;
  contentSummary: {
    totalPosts: number;
    totalLikesReceived: number;
    totalCommentsReceived: number;
  };
  weeklySharing: {
    suggestedActions: number;
    completedActions: number;
    breakdown: { posts: number; likes: number; comments: number };
  };
  lastUpdated: string | null;
};
