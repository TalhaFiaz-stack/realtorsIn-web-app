import { z } from "zod";

export const passwordLoginSchema = z.object({
  usernameOrEmail: z.string().trim().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
});

export const phoneSendOtpSchema = z.object({
  phone: z
    .string()
    .trim()
    .min(6, "Enter a valid phone number")
    .max(20)
    .regex(/^\d+$/, "Phone must contain digits only"),
  phoneDialCode: z
    .string()
    .trim()
    .min(1, "Dial code is required")
    .max(6)
    .regex(/^\+?\d+$/, "Invalid dial code"),
  phoneCountryCode: z.string().trim().min(2).max(3).optional(),
});

export const phoneVerifyOtpSchema = phoneSendOtpSchema.extend({
  code: z
    .string()
    .trim()
    .min(4, "Enter the verification code")
    .max(8)
    .regex(/^\d+$/, "Code must be numeric"),
});

export const emailSendOtpSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
});

export const emailVerifyOtpSchema = emailSendOtpSchema.extend({
  code: z
    .string()
    .trim()
    .min(4, "Enter the verification code")
    .max(8)
    .regex(/^\d+$/, "Code must be numeric"),
});

export const completeProfileSchema = z.object({
  name: z.string().trim().min(1, "First name is required").max(80),
  lastName: z.string().trim().min(1, "Last name is required").max(80),
  userName: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(40)
    .regex(/^[a-zA-Z0-9._]+$/, "Use letters, numbers, dots, or underscores"),
  company: z.string().trim().min(1, "Company is required").max(120),
  agencyName: z.string().trim().max(120).optional(),
  userRole: z.string().trim().min(1, "Role is required").max(80),
  reraNumber: z.string().trim().max(80).optional(),
  ornNumber: z.string().trim().max(80).optional(),
  cities: z.array(z.string()).optional(),
  propertyTypes: z.array(z.string()).optional(),
  password: z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    z
      .string()
      .min(8, "At least 8 characters")
      .regex(/[A-Z]/, "Include an uppercase letter")
      .regex(/[a-z]/, "Include a lowercase letter")
      .regex(/[0-9]/, "Include a number")
      .regex(/[^A-Za-z0-9]/, "Include a special character")
      .optional()
  ),
  referralCode: z.string().trim().max(40).optional(),
});

export type PasswordLoginInput = z.infer<typeof passwordLoginSchema>;
export type PhoneSendOtpInput = z.infer<typeof phoneSendOtpSchema>;
export type PhoneVerifyOtpInput = z.infer<typeof phoneVerifyOtpSchema>;
export type EmailSendOtpInput = z.infer<typeof emailSendOtpSchema>;
export type EmailVerifyOtpInput = z.infer<typeof emailVerifyOtpSchema>;
export type CompleteProfileInput = z.infer<typeof completeProfileSchema>;
