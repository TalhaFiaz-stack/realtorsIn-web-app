export type OffPlanSearchDetailType =
  | "city"
  | "district"
  | "developer"
  | "project"
  | "text";

export type OffPlanSearchChoice = {
  detailType: OffPlanSearchDetailType;
  id: string | number;
  label: string;
  subtitle?: string;
  imageUrl?: string;
  developerName?: string;
  statusLabel?: string;
  count?: number;
};

export type OffPlanSearchSections = {
  featuredProjects: OffPlanSearchChoice[];
  projects: OffPlanSearchChoice[];
  cities: OffPlanSearchChoice[];
  districts: OffPlanSearchChoice[];
  developers: OffPlanSearchChoice[];
};

export type OffPlanSearchApplyPayload = {
  searchText: string;
  cityId?: string;
  cityLabel?: string;
  districtId?: string;
  districtLabel?: string;
  developerIds: string[];
  searchProjectIds: string[];
};
