import { z } from "zod";

export const networkListSchema = z.object({
  type: z
    .enum(["all", "pending-sent", "pending-received"])
    .default("all"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  search: z.string().trim().max(120).optional(),
});

export const suggestionsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const peopleSearchSchema = z.object({
  searchText: z.string().trim().min(1).max(120),
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(50).default(20),
});

export const sendRequestSchema = z.object({
  receiverUserId: z.coerce.number().int().positive(),
  message: z.string().trim().max(500).optional(),
});

export const connectionIdSchema = z.object({
  connectionId: z.coerce.number().int().positive(),
});

export const connectionStatusSchema = z.object({
  socialProfileId: z.coerce.number().int().positive(),
});

export type NetworkListInput = z.infer<typeof networkListSchema>;
export type PeopleSearchInput = z.infer<typeof peopleSearchSchema>;
export type SendRequestInput = z.infer<typeof sendRequestSchema>;
export type ConnectionStatusInput = z.infer<typeof connectionStatusSchema>;
