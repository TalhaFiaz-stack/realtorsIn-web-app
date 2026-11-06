import { z } from "zod";
import {
  FEED_LIST_MAX_PAGE_SIZE,
  FEED_LIST_PAGE_SIZE,
} from "@/features/feed/constants/feed.constants";

export const feedListSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce
    .number()
    .int()
    .min(1)
    .max(FEED_LIST_MAX_PAGE_SIZE)
    .default(FEED_LIST_PAGE_SIZE),
  refreshFeed: z.boolean().optional(),
  searchText: z.string().trim().max(200).optional(),
  feedType: z
    .enum(["off_plan", "properties", "inquiries", "video"])
    .optional(),
  /** SearchFeeds tabs — mirrors mobile `type`. */
  searchType: z.enum(["foryou", "account", "tags"]).optional(),
  propertyCategory: z
    .enum(["apartment", "villa", "townhouse", "penthouse"])
    .optional(),
  listingTransaction: z.enum(["sale", "rent"]).optional(),
  inquiryType: z.enum(["buy", "rent"]).optional(),
});

export const postReactionTypeSchema = z.enum([
  "like",
  "love",
  "care",
  "haha",
  "wow",
  "sad",
  "angry",
]);

export const postIdSchema = z.object({
  postId: z.coerce.number().int().positive(),
});

/** Like tap (no type) or reaction pick — mirrors mobile `posts/like/store`. */
export const postLikeSchema = z.object({
  postId: z.coerce.number().int().positive(),
  reactionType: postReactionTypeSchema.optional().nullable(),
  isTapToggle: z.boolean().optional(),
});

export const commentCreateSchema = z.object({
  postId: z.coerce.number().int().positive(),
  comment: z.string().trim().min(1).max(2000),
  mentionedUserIds: z
    .array(z.coerce.number().int().positive())
    .max(50)
    .optional()
    .default([]),
  mentionedUsers: z
    .array(
      z.object({
        user_id: z.coerce.number().int().positive(),
        display_name: z.string().trim().max(120).optional().default(""),
        user_name: z.string().trim().max(120).optional().default(""),
      })
    )
    .max(50)
    .optional()
    .default([]),
});

export const commentReactionSchema = z.object({
  commentId: z.coerce.number().int().positive(),
  reactionType: postReactionTypeSchema.optional().nullable(),
  isTapToggle: z.boolean().optional(),
});

export const createPostFieldsSchema = z.object({
  description: z.string().trim().max(5000).optional().default(""),
  visibility: z.enum(["public", "connections"]).default("connections"),
  scheduledAt: z.string().trim().optional(),
});

export const scheduledPostsListSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(50).optional().default(20),
});

export const scheduledPostUpdateSchema = z.object({
  postId: z.coerce.number().int().positive(),
  scheduledAt: z.string().trim().min(1),
});

export const reportPostSchema = z.object({
  postId: z.coerce.number().int().positive(),
  reportReason: z.string().trim().min(1).max(120),
  reportMessage: z.string().trim().max(1000).optional(),
});

export const hidePostSchema = z.object({
  postId: z.coerce.number().int().positive(),
});

export const notInterestedSchema = z.object({
  postId: z.coerce.number().int().positive(),
});

export const repostStoreSchema = z.object({
  postId: z.coerce.number().int().positive(),
  repostText: z.string().trim().max(5000).optional(),
});

export const commentDeleteSchema = z.object({
  commentId: z.coerce.number().int().positive(),
});

export const pinPostSchema = z.object({
  postId: z.coerce.number().int().positive(),
  pinned: z.boolean(),
});

export type HidePostInput = z.infer<typeof hidePostSchema>;
export type NotInterestedInput = z.infer<typeof notInterestedSchema>;
export type RepostStoreInput = z.infer<typeof repostStoreSchema>;
export type CommentDeleteInput = z.infer<typeof commentDeleteSchema>;
export type PinPostInput = z.infer<typeof pinPostSchema>;

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/heic",
  "image/heif",
] as const;

export const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/quicktime",
  "video/x-msvideo",
  "video/x-matroska",
  "video/m4v",
] as const;

/** Matches backend default MAX_FILE_SIZE (50MB). */
export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

export type FeedListInput = z.infer<typeof feedListSchema>;
export type CommentCreateInput = z.infer<typeof commentCreateSchema>;
export type CommentReactionInput = z.infer<typeof commentReactionSchema>;
export type CreatePostFieldsInput = z.infer<typeof createPostFieldsSchema>;
export type ReportPostInput = z.infer<typeof reportPostSchema>;
