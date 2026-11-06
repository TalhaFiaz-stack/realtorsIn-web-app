export const EMPLOYMENT_TYPE_OPTIONS = [
  "Full-time",
  "Part-time",
  "Contract",
  "Freelance",
  "Internship",
  "Temporary",
  "Volunteer",
] as const;

export const JOB_TYPE_OPTIONS = [
  "Remote",
  "On-site",
  "Hybrid",
  "Flexible",
] as const;

export const EXPERIENCE_LEVEL_OPTIONS = [
  "Entry Level",
  "Mid Level",
  "Senior Level",
  "Director",
  "Executive",
] as const;

export const SALARY_CURRENCY_OPTIONS = [
  "AED",
  "GBP",
  "USD",
  "SAR",
  "QAR",
  "KWD",
  "BHD",
  "OMR",
] as const;

export const MAX_JOB_IMAGES = 6;

/** Listing statuses the owner can set (POST /api/jobs/status). */
export const JOB_LISTING_STATUS_OPTIONS = [
  "active",
  "paused",
  "closed",
  "draft",
] as const;

export type JobListingStatus = (typeof JOB_LISTING_STATUS_OPTIONS)[number];

/** Posted tab list filter — matches mobile MyJobsScreen chips. */
export const JOB_POSTED_STATUS_FILTERS = [
  "All",
  "active",
  "paused",
  "closed",
  "draft",
] as const;

export type JobPostedStatusFilter =
  (typeof JOB_POSTED_STATUS_FILTERS)[number];
