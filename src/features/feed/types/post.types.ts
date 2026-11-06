import type { PostReactionType } from "@/features/feed/constants/post-reactions";

export type PostMediaImage = {
  id: string | number | null;
  url: string;
};

export type PostMediaVideo = {
  id: string | number | null;
  url: string;
};

export type PostMention = {
  userId: string | null;
  displayName: string | null;
  userName: string | null;
};

/** Connection repost row in feed (`repost_info.all_reposters`). */
export type PostRepostUser = {
  reposterId: string;
  reposterName: string;
  reposterUserName: string | null;
  reposterImage: string | null;
  repostText: string | null;
  repostedAt: string | null;
};

export type PostRepostInfo = {
  isRepost: boolean;
  totalReposts: number;
  allReposters: PostRepostUser[];
};

export type FeedPost = {
  id: number;
  userId: string | null;
  authorName: string;
  userName: string | null;
  avatarUrl: string | null;
  isVerified: boolean;
  description: string;
  createdAt: string | null;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  /** Active reaction type when liked — mirrors mobile `user_reaction`. */
  userReaction: PostReactionType | null;
  /** Top reaction types on the post for summary icons. */
  reactionSummary: PostReactionType[];
  mentions: PostMention[];
  isSaved: boolean;
  isOwn: boolean;
  /** Viewer has already reposted this post. */
  isReposted: boolean;
  repostCount: number;
  /** Feed item surfaced via a connection repost (original post payload). */
  repostInfo: PostRepostInfo | null;
  /** Embedded original post when this row is a repost-with-thoughts post. */
  repostData: FeedPost | null;
  isRepostWithThoughts: boolean;
  /** Pinned to the author's profile (own posts / profile feed). */
  isPinned: boolean;
  /** `public` | `connections` — used by Send/share sheet. */
  visibility: "public" | "connections" | string;
  images: PostMediaImage[];
  videos: PostMediaVideo[];
  isPropertyShare: boolean;
  isProjectShare: boolean;
  propertyData: Record<string, unknown> | null;
  projectData: Record<string, unknown> | null;
};

export type FeedPage = {
  posts: FeedPost[];
  page: number;
  perPage: number;
  total: number;
  lastPage: number;
  hasNextPage: boolean;
};

export type PostComment = {
  id: number;
  userId: string | null;
  authorName: string;
  userName: string | null;
  avatarUrl: string | null;
  comment: string;
  createdAt: string | null;
  isOwn: boolean;
  likeCount: number;
  isLiked: boolean;
  /** Active comment reaction — mirrors mobile `user_reaction`. */
  userReaction: PostReactionType | null;
  reactionSummary: PostReactionType[];
  mentions: PostMention[];
};

export type PostLiker = {
  userId: number;
  name: string;
  userName: string | null;
  avatarUrl: string | null;
  company: string | null;
  role: string | null;
  isVerified: boolean;
  reactionType: PostReactionType;
  likedAt: string | null;
};

export type PostLikersPage = {
  likers: PostLiker[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
};

export type CommentsPage = {
  comments: PostComment[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
};

export type ReportReason = {
  key: string;
  title: string;
  message: string;
};
