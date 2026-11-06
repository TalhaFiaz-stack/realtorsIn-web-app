import { z } from "zod";

/** Mirrors mobile passwordScreen rules from sign-in documentation. */
export const passwordSchema = z
  .string()
  .min(8, "At least 8 characters")
  .regex(/[A-Z]/, "Include an uppercase letter")
  .regex(/[a-z]/, "Include a lowercase letter")
  .regex(/[0-9]/, "Include a number")
  .regex(/[^A-Za-z0-9]/, "Include a special character");

export const loginPasswordFormSchema = z.object({
  identifier: z.string().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginPasswordFormValues = z.infer<typeof loginPasswordFormSchema>;
