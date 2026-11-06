export type OffPlanProjectSummary = {
  id: string;
  title: string;
  developerName: string | null;
  developerImage: string | null;
  districtName: string | null;
  location: string | null;
  priceStart: number | null;
  priceEnd: number | null;
  currency: string | null;
  completionDate: string | null;
  projectStatus: string | null;
  completionStatusName: string | null;
  projectCompleted: boolean;
  totalProperties: number | null;
  bannerImage: string | null;
  lat: number | null;
  lng: number | null;
  commissionPercentage: number | null;
};

export type OffPlanProjectsPage = {
  projects: OffPlanProjectSummary[];
  currentPage: number;
  lastPage: number;
  hasMore: boolean;
};

export type OffPlanDetailTabId =
  | "About"
  | "Availability"
  | "Location & Nearby"
  | "Facilities & Amenities"
  | "Attachments"
  | "Commercial Details"
  | "Visual overview"
  | "Sales Agencies"
  | "Sales Executive";

export type OffPlanProjectBuilding = {
  id: string;
  title: string;
  image: string | null;
  totalProperties: number | null;
};

export type OffPlanProjectDetail = OffPlanProjectSummary & {
  description: string | null;
  propertyTypes: string | null;
  formatUpdatedAt: string | null;
  projectCompleted: boolean;
  address: string | null;
  latLong: string | null;
  website: string | null;
  developerEmail: string | null;
  developerId: number | null;
  developerName: string | null;
  developerImage: string | null;
  developerWebsite: string | null;
  developerDescription: string | null;
  developerAddress: string | null;
  developerWorkingTime: string | null;
  images: string[];
  generalPlanImages: string[];
  hasProperty: boolean;
  pdfUrl: string | null;
  offerLink: string | null;
  typicalUnits: OffPlanTypicalUnit[];
  buildings: OffPlanProjectBuilding[];
  facilities: string[];
  facilityItems: OffPlanFacility[];
  amenityLabels: string[];
  attachments: OffPlanAttachment[];
  youtubeLinks: string[];
  nearbyLocations: { name: string; distance: string }[];
  salesExecutives: OffPlanSalesExecutive[];
  salesAgencies: OffPlanSalesAgency[];
  resaleUnitsCount: number;
  hasPaymentPlans: boolean;
  hasParking: boolean;
  hasBrokerInfo: boolean;
  hasInventoryOverview: boolean;
  paymentPlansJson: unknown;
  parkingJson: unknown;
  brokerInfoJson: unknown;
  inventoryJson: unknown;
};

export type OffPlanSalesAgency = {
  id: string;
  name: string;
  image: string | null;
  type: string | null;
  description: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  workingHours: { day: string; time: string }[];
};

export type OffPlanTypicalUnit = {
  id: string;
  title: string;
  beds: string | null;
  area: string | null;
  priceStart: string | null;
  priceEnd: string | null;
  currency: string | null;
  image: string | null;
};

export type OffPlanAttachment = {
  id: number | string;
  title: string;
  url: string | null;
  fileType: string | null;
};

export type OffPlanFacility = {
  id: string;
  name: string;
  image: string | null;
  description: string | null;
};

export type OffPlanSalesExecutive = {
  id: string;
  name: string;
  role: string | null;
  phone: string | null;
  email: string | null;
  image: string | null;
  message: string | null;
  useWhatsappBusinessApi: boolean;
  companyWhatsappUrl: string | null;
};

export type OffPlanInventoryUnit = {
  id: string;
  title: string;
  priceStart: number | null;
  /** Price per sqft when provided by inventory API (mobile `price_sqft`). */
  priceSqft: number | null;
  areaStart: number | null;
  beds: string | null;
  /** Human-readable status when API sends labels. */
  status: string | null;
  /** Numeric sale type: 0 = Sold out, 1 = On sale, 2 = Booked (see mobile `FloorItemDetail`). */
  saleTypeCode: number | null;
  unitType: string | null;
  floorKey: string;
  /** Unit-level currency override from API when present. */
  currency: string | null;
};

export type OffPlanDistrict = {
  /** Mongo id from `rn/districts` (same as mobile `districtsList`). */
  id: string;
  title: string;
  cityId: string | null;
  cityName: string | null;
  polygon: GeoJSONPolygon | null;
};

export type GeoJSONPolygon = {
  type: "Polygon";
  coordinates: number[][][];
};

export type OffPlanListFilters = {
  page?: number;
  perPageAll?: boolean;
  searchText?: string;
  minPrice?: string;
  maxPrice?: string;
  minArea?: string;
  maxArea?: string;
  beds?: string;
  cityId?: string;
  districtId?: string;
  developerIds?: string[];
  /** Mobile `search_project_ids` — filter by picked project(s). */
  searchProjectIds?: string[];
  developmentStatus?: string[];
  completionStatus?: string[];
  propertyTypes?: string[];
  completionDate?: string;
  downPayment?: string;
  postHandover?: string;
  paymentBreakdown?: {
    pbBooking?: string;
    pbConstruction?: string;
    pbHandover?: string;
    pbPostHandover?: string;
  };
  projectVisibility?: "all" | "public" | "private";
  sortBy?: string;
};

export type OffPlanFilterOption = {
  label: string;
  value: string;
  image?: string | null;
};

export type OffPlanFilterMeta = {
  developers: OffPlanFilterOption[];
  developmentStatuses: OffPlanFilterOption[];
  completionStatuses: OffPlanFilterOption[];
  unitTypes: OffPlanFilterOption[];
  cities: OffPlanFilterOption[];
  /** Same as mobile `offPlanFilterList.allDeliveryDates`. */
  deliveryDates: string[];
  minPrice: string | null;
  maxPrice: string | null;
  minArea: string | null;
  maxArea: string | null;
  allowPrivateProjects: boolean;
};

export type PublishedListingSummary = {
  id: number;
  title: string;
  type: string;
  price: string | null;
  currency: string | null;
  location: string | null;
  beds: string | null;
  baths: string | null;
  area: string | null;
  image: string | null;
  verified: boolean;
  remPropertyId: number | null;
};

export type PublishedListingsPage = {
  listings: PublishedListingSummary[];
  hasMore: boolean;
  page: number;
};

export type PublishedPropertyDetail = PublishedListingSummary & {
  description: string | null;
  images: { url: string }[];
  features: string[];
  amenities: string[];
  agentName: string | null;
  youtubeId: string | null;
  videoLink: string | null;
  /** Extra fields from Social `PropertyListing` (browse cards already show some; detail maps the rest). */
  refNo: string | null;
  propertyTypeLabel: string | null;
  propertyStatusLabel: string | null;
  formatUpdatedAt: string | null;
  listingTag: string | null;
  wellFurnished: string | null;
  publicNotes: string | null;
};

export type RemAgentContact = {
  name: string;
  phone: string | null;
  email: string | null;
  profileImage: string | null;
  action: 1 | 2;
  inquiryTitle?: string;
  inquiryMessage?: string;
};
