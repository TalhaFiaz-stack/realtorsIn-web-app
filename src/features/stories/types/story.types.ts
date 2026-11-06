export type StoryMediaType = "image" | "video";

export type StoryVisibility = "public" | "connections" | "private";

export type StoryItem = {
  id: number;
  mediaUrl: string;
  thumbnailUrl: string | null;
  mediaType: StoryMediaType;
  durationMs: number;
  caption: string | null;
  visibility: StoryVisibility | string;
  createdAt: string | null;
  expiresAt: string | null;
  viewCount: number;
  reactionCount: number;
  hasViewed: boolean;
  hasReacted: boolean;
  isOwn: boolean;
};

export type StoryUserGroup = {
  userId: number;
  name: string;
  userName: string | null;
  avatarUrl: string | null;
  hasUnseen: boolean;
  isOwn: boolean;
  stories: StoryItem[];
};

export type StoriesFeed = {
  groups: StoryUserGroup[];
};

export type StoryViewerRow = {
  userId: number;
  name: string;
  userName: string | null;
  avatarUrl: string | null;
  viewedAt: string | null;
  hasReacted: boolean;
};

export type StoryViewersResult = {
  viewers: StoryViewerRow[];
  total: number;
  reactionCount: number;
};
