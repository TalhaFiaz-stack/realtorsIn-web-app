export type JobApplicant = {
  id: number;
  firstName?: string | null;
  lastName?: string | null;
  userName?: string | null;
  profilePicture?: string | null;
  userRole?: string | null;
};

export type JobApplication = {
  id: number;
  coverLetter?: string | null;
  resumeUrl?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  status?: string | null;
  createdAt?: string | null;
  applicant: JobApplicant | null;
};

export type JobPoster = {
  id: number;
  firstName?: string | null;
  lastName?: string | null;
  userName?: string | null;
  profilePicture?: string | null;
};

export type JobPost = {
  id: number;
  title: string;
  description: string;
  company?: string | null;
  location: string;
  employmentType: string;
  jobType: string;
  experienceLevel: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  skills: string[];
  images: { url: string }[];
  requirements: string;
  benefits: string;
  applicationEmail: string;
  applicationUrl: string;
  status: string;
  viewsCount: number;
  applicationsCount: number;
  socialProfileId: number;
  poster: JobPoster | null;
  hasApplied?: boolean;
  locationMatch?: boolean;
  applicationStatus?: string | null;
  appliedAt?: string | null;
  applications?: JobApplication[];
};

export type JobsListPage = {
  jobs: JobPost[];
  page: number;
  totalPages: number;
  total: number;
};

export type JobsHubTab = "discover" | "posted" | "applied";
