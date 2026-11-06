import { z } from "zod";
import { isPasswordStrong } from "@/features/settings/lib/password-strength";

export const passwordUpdateSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128)
    .refine(isPasswordStrong, {
      message:
        "Password must include upper and lower case, a number, and a special character",
    }),
});

export const notificationSettingPatchSchema = z.object({
  key: z.string().min(1),
  value: z.boolean(),
});

export const notificationSettingsBatchSchema = z.object({
  settings: z
    .array(
      z.object({
        key: z.string().min(1),
        value: z.boolean(),
      })
    )
    .min(1)
    .max(20),
});

export const accountDeleteSchema = z.object({
  confirmation: z.literal("DELETE"),
});
