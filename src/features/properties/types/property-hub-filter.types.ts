export type PropertyHubFilterOption = {
  label: string;
  value: string;
};

export type PropertyHubStatusOption = {
  label: string;
  value: number;
};

export type PropertyHubFilterOptions = {
  categories: PropertyHubFilterOption[];
  propertyTypes: PropertyHubFilterOption[];
  statuses: PropertyHubStatusOption[];
};
