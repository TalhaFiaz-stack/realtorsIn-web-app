import { z } from "zod";

export const verifiedBrokersListSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  search: z.string().trim().max(120).optional(),
});

export const referralValidateSchema = z.object({
  ref: z.string().trim().min(1).max(40),
});

export type VerifiedBrokersListInput = z.infer<typeof verifiedBrokersListSchema>;
