import { z } from "zod";

export const openToSchema = z.object({
  openTo: z.enum(["hiring", "open_to_work", "none"]),
});

/** Mobile AddSocialProfile role dropdown values. */
export const PROFILE_USER_ROLES = [
  "Director",
  "Ceo",
  "CEO",
  "Manager",
  "Admin",
  "Agent",
  "Broker",
  "Developer",
  "Consultant",
  "Other",
] as const;

export const editIntroSchema = z.object({
  name: z.string().trim().min(1).max(100),
  lastName: z.string().trim().max(100).optional().or(z.literal("")),
  userName: z.string().trim().max(80).optional().or(z.literal("")),
  email: z
    .string()
    .trim()
    .email()
    .max(150)
    .optional()
    .or(z.literal("")),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  phoneDialCode: z.string().trim().max(8).optional().or(z.literal("")),
  phoneCountryCode: z.string().trim().max(8).optional().or(z.literal("")),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  company: z.string().trim().max(150).optional().or(z.literal("")),
  userRole: z.enum(PROFILE_USER_ROLES).optional().nullable(),
  location: z.string().trim().max(200).optional().or(z.literal("")),
  showCompany: z.boolean().optional(),
  showRole: z.boolean().optional(),
  positionId: z.coerce.number().int().positive().optional().nullable(),
  educationId: z.coerce.number().int().positive().optional().nullable(),
  socialProfileLinks: z.string().trim().max(500).optional().or(z.literal("")),
  agencyName: z.string().trim().max(150).optional().or(z.literal("")),
  reraNumber: z.string().trim().max(80).optional().or(z.literal("")),
  ornNumber: z.string().trim().max(40).optional().or(z.literal("")),
  cities: z.array(z.string().trim().min(1).max(80)).max(20).optional(),
  propertyTypes: z.array(z.string().trim().min(1).max(80)).max(30).optional(),
});

/** UAE emirates used on mobile AddSocialProfile license section. */
export const PROFILE_OPERATING_EMIRATES = [
  "Abu Dhabi",
  "Dubai",
  "Sharjah",
  "Ajman",
  "Umm Al Quwain",
  "Ras Al Khaimah",
  "Fujairah",
] as const;

/** Common property types for license practice chips. */
export const PROFILE_PROPERTY_TYPES = [
  "Apartment",
  "Villa",
  "Townhouse",
  "Penthouse",
  "Studio",
  "Duplex",
  "Office",
  "Retail",
  "Warehouse",
  "Land",
] as const;

export const aboutUpdateSchema = z.object({
  aboutId: z.coerce.number().int().positive().optional().nullable(),
  aboutText: z.string().trim().max(2600),
  topSkillIds: z.array(z.coerce.number().int().positive()).max(5).optional(),
});

export const positionUpsertSchema = z.object({
  id: z.coerce.number().int().positive().optional().nullable(),
  title: z.string().trim().min(1).max(100),
  company: z.string().trim().min(1).max(100),
  employmentType: z
    .enum([
      "Full-time",
      "Part-time",
      "Contract",
      "Freelance",
      "Internship",
      "Temporary",
      "Volunteer",
    ])
    .default("Full-time"),
  jobType: z
    .enum(["Remote", "On-site", "Hybrid", "Flexible"])
    .default("On-site"),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .nullable()
    .or(z.literal("")),
  isCurrentlyWorking: z.boolean().default(true),
  location: z.string().trim().max(200).optional().or(z.literal("")),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  profileHeadline: z.string().trim().max(200).optional().or(z.literal("")),
  skillIds: z.array(z.coerce.number().int().positive()).max(20).optional(),
  newSkills: z.array(z.string().trim().min(2).max(100)).max(10).optional(),
});

export const educationUpsertSchema = z.object({
  id: z.coerce.number().int().positive().optional().nullable(),
  degree: z.string().trim().min(2).max(100),
  school: z.string().trim().min(2).max(150),
  fieldOfStudy: z.string().trim().min(2).max(100).default("General"),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .nullable()
    .or(z.literal("")),
  isCurrentlyStudying: z.boolean().default(false),
  location: z.string().trim().max(200).optional().or(z.literal("")),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  skillIds: z.array(z.coerce.number().int().positive()).max(20).optional(),
  newSkills: z.array(z.string().trim().min(2).max(100)).max(10).optional(),
});

export const skillUpsertSchema = z.object({
  id: z.coerce.number().int().positive().optional().nullable(),
  skill: z.string().trim().min(2).max(100),
  proficiencyLevel: z
    .enum(["Beginner", "Intermediate", "Advanced", "Expert"])
    .optional()
    .nullable(),
  yearsOfExperience: z.coerce.number().min(0).max(50).optional().nullable(),
  educationIds: z.array(z.coerce.number().int().positive()).optional(),
  positionIds: z.array(z.coerce.number().int().positive()).optional(),
});

export const certificateUpsertSchema = z.object({
  id: z.coerce.number().int().positive().optional().nullable(),
  name: z.string().trim().min(1).max(200),
  issuingOrganization: z.string().trim().min(1).max(200),
  issuedDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .or(z.literal("")),
  expirationDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .nullable()
    .or(z.literal("")),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  certificateNumber: z.string().trim().max(120).optional().or(z.literal("")),
  skillIds: z.array(z.coerce.number().int().positive()).max(20).optional(),
  newSkills: z.array(z.string().trim().min(2).max(100)).max(10).optional(),
});

export const sectionDeleteSchema = z.object({
  id: z.coerce.number().int().positive(),
});

/** Matches SocialProfileREM `cvController.updateTemplate` validTemplates. */
export const CV_TEMPLATE_IDS = [
  "resume",
  "resume-v2",
  "resume-v3",
  "resume-v4",
  "resume-v5",
] as const;

export const cvTemplateSchema = z.object({
  template: z.enum(CV_TEMPLATE_IDS),
});

export const cvDownloadPdfSchema = z.object({
  fileName: z
    .string()
    .trim()
    .min(1)
    .max(200)
    .regex(/^[a-zA-Z0-9._-]+\.pdf$/),
});

export type OpenToInput = z.infer<typeof openToSchema>;
export type EditIntroInput = z.infer<typeof editIntroSchema>;
export type AboutUpdateInput = z.infer<typeof aboutUpdateSchema>;
export type PositionUpsertInput = z.infer<typeof positionUpsertSchema>;
export type EducationUpsertInput = z.infer<typeof educationUpsertSchema>;
export type SkillUpsertInput = z.infer<typeof skillUpsertSchema>;
export type CertificateUpsertInput = z.infer<typeof certificateUpsertSchema>;
export type CvTemplateInput = z.infer<typeof cvTemplateSchema>;
export type CvDownloadPdfInput = z.infer<typeof cvDownloadPdfSchema>;
