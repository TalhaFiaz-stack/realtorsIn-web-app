import { z } from "zod";
import { MAX_STORY_CAPTION_LENGTH } from "@/features/stories/constants/story.constants";

export const storyIdSchema = z.object({
  storyId: z.coerce.number().int().positive(),
});

export const storyReactionSchema = z.object({
  storyId: z.coerce.number().int().positive(),
  reaction: z.string().trim().min(1).max(40).default("heart"),
});

export const storyCreateFieldsSchema = z.object({
  caption: z.string().trim().max(MAX_STORY_CAPTION_LENGTH).optional().default(""),
  visibility: z.enum(["public", "connections", "private"]).default("connections"),
  mediaType: z.enum(["image", "video"]),
  durationMs: z.coerce.number().int().min(1000).max(60_000).optional(),
});

export type StoryCreateFieldsInput = z.infer<typeof storyCreateFieldsSchema>;
export type StoryReactionInput = z.infer<typeof storyReactionSchema>;
