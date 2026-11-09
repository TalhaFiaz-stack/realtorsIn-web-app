export type ProfileMedia = {
  url: string | null;
  caption: string | null;
};

export type ProfileSkill = {
  id: number;
  name: string;
  proficiencyLevel: string | null;
  yearsOfExperience: number | null;
  educationIds: number[];
  positionIds: number[];
};

export type ProfilePosition = {
  id: number;
  title: string;
  company: string | null;
  employmentType: string | null;
  jobType: string | null;
  location: string | null;
  description: string | null;
  profileHeadline: string | null;
  startDate: string | null;
  endDate: string | null;
  isCurrentlyWorking: boolean;
  skillIds: number[];
  imageUrls: string[];
};

export type ProfileEducation = {
  id: number;
  degree: string;
  school: string;
  fieldOfStudy: string | null;
  location: string | null;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  isCurrentlyStudying: boolean;
  skillIds: number[];
  imageUrls: string[];
};

export type ProfileCertificate = {
  id: number;
  name: string;
  authority: string | null;
  issueDate: string | null;
  expiryDate: string | null;
  certificateNumber: string | null;
  description: string | null;
  skillIds: number[];
  imageUrl: string | null;
};

export type ProfileAnalyticsSummary = {
  postImpressions: number;
  profileViewers: number;
  searchAppearances: number;
  connectionsDelta: number;
};

export type SocialProfile = {
  id: number;
  userId: number;
  remUserId: number | null;
  name: string;
  lastName: string | null;
  fullName: string;
  userName: string | null;
  email: string | null;
  phone: string | null;
  formattedPhone: string | null;
  phoneDialCode: string | null;
  phoneCountryCode: string | null;
  description: string | null;
  location: string | null;
  company: string | null;
  agencyName: string | null;
  reraNumber: string | null;
  reraImageUrl: string | null;
  ornNumber: string | null;
  cities: string[];
  propertyTypes: string[];
  socialProfileLinks: string | null;
  userRole: string | null;
  showRole: boolean;
  showCompany: boolean;
  isVerified: boolean;
  phoneVerified: boolean;
  emailVerified: boolean;
  openTo: "hiring" | "open_to_work" | null;
  profileCompletionPercentage: number;
  isProfileComplete: boolean;
  postsCount: number;
  likesCount: number;
  commentsCount: number;
  connectionsCount: number;
  activeStatus: string | null;
  deletionRequestPending: boolean;
  deletionRequestedAt: string | null;
  profileImage: ProfileMedia | null;
  coverImage: ProfileMedia | null;
  aboutId: number | null;
  aboutText: string | null;
  topSkillIds: number[];
  /** Featured position/education ids from social profile (mobile header lines). */
  featuredPositionId: number | null;
  featuredEducationId: number | null;
  positions: ProfilePosition[];
  educations: ProfileEducation[];
  certificates: ProfileCertificate[];
  skills: ProfileSkill[];
  analytics: ProfileAnalyticsSummary | null;
  cvLink: string | null;
  cvPdfLink: string | null;
  resumeTemplates: ProfileResumeTemplate[];
  publicProfileUrl: string | null;
  brokerCardVerified: boolean;
  brokerCardStatus: string | null;
  nicDocumentUrl: string | null;
  nicDocumentType: string | null;
  brokerCardDocumentUrl: string | null;
  brokerCardDocumentType: string | null;
  hasConnectorBadge: boolean;
  hasInfluencerBadge: boolean;
  isOwn: boolean;
};

export type ProfileResumeTemplate = {
  id: number | string;
  name: string | null;
  url: string;
  dummyUrl: string | null;
  isSelected: boolean;
};

export type GeneratedCvPdf = {
  previewUrl: string;
  downloadUrl: string;
  fileName: string;
  template: string | null;
};
