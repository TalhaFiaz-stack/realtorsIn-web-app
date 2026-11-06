export type JobFormImage = {
  key: string;
  url?: string;
  file?: File;
  isLocal: boolean;
};

export type JobFormValues = {
  title: string;
  description: string;
  company: string;
  location: string;
  latLng: string;
  employmentType: string;
  jobType: string;
  experienceLevel: string;
  salaryMin: string;
  salaryMax: string;
  salaryCurrency: string;
  requirements: string;
  benefits: string;
  applicationEmail: string;
  applicationUrl: string;
  status: string;
  skillIds: number[];
  customSkills: string[];
};
