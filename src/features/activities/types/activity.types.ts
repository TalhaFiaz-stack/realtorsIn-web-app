import type { PostReactionType } from "@/features/feed/constants/post-reactions";
import type { FeedPost, PostMention } from "@/features/feed/types/post.types";

export type ActivitySummary = {
  likedPostsCount: number;
  commentsCount: number;
  repostsCount: number;
  postsCount: number;
  savedPostsCount: number;
};

export type ActivityPostsKind = "saved";

export type ActivityRepostItem = {
  id: number;
  postId: number;
  repostText: string | null;
  repostedAt: string | null;
  post: FeedPost;
};

export type ActivityRepostsPage = {
  reposts: ActivityRepostItem[];
  page: number;
  lastPage: number;
  hasNextPage: boolean;
  total: number;
};

export type ActivityCommentItem = {
  id: number;
  comment: string;
  createdAt: string | null;
  timeAgo: string | null;
  likeCount: number;
  isLiked: boolean;
  userReaction: PostReactionType | null;
  reactionSummary: PostReactionType[];
  authorName: string;
  avatarUrl: string | null;
  mentions: PostMention[];
  post: FeedPost | null;
};

export type ActivityCommentsPage = {
  comments: ActivityCommentItem[];
  page: number;
  lastPage: number;
  hasNextPage: boolean;
  total: number;
};
