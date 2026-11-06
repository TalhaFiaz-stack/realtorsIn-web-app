import { z } from "zod";

export const startInfluencerChallengeSchema = z.object({
  fromFirstVideoPopup: z.boolean().optional().default(false),
});
