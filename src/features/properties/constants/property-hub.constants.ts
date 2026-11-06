/** Mirrors mobile `propertyHub.constants.js`. */

export const PROPERTY_HUB_TABS = [
  { title: "Buy", id: "buy" as const },
  { title: "Sell", id: "sell" as const },
  { title: "Rent In", id: "rent_in" as const },
  { title: "Rent Out", id: "rent_out" as const },
];

export type PropertyHubTabId = (typeof PROPERTY_HUB_TABS)[number]["id"];

export const PROPERTY_HUB_SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
  { label: "Price (Low)", value: "price_low_to_high" },
  { label: "Price (High)", value: "price_high_to_low" },
] as const;

export const PROPERTY_HUB_AVAILABILITY_OPTIONS = [
  { label: "All", value: "all" as const },
  { label: "Ready", value: "ready" as const },
  { label: "Off plan", value: "offplan" as const },
];

/** Same defaults as mobile `PropertyFilterComp` categories. */
export const PROPERTY_HUB_CATEGORY_OPTIONS = [
  { label: "Residential", value: "residential" },
  { label: "Commercial", value: "commercial" },
  { label: "Land", value: "land" },
];

export const PROPERTY_HUB_UNIT_TYPE_OPTIONS = [
  { label: "Apartment", value: "apartment" },
  { label: "Villa", value: "villa" },
  { label: "Townhouse", value: "townhouse" },
  { label: "Penthouse", value: "penthouse" },
  { label: "Office", value: "office" },
  { label: "Shop", value: "shop" },
  { label: "Warehouse", value: "warehouse" },
  { label: "Land", value: "land" },
];

export const SOCIAL_PROPERTY_STATUS = {
  PENDING: 1,
  SOLD: 2,
  DRAFT: 3,
  NOT_AVAILABLE: 4,
  ACTIVE: 5,
} as const;

export const SOCIAL_PROPERTY_STATUS_OPTIONS = [
  { label: "Active", value: SOCIAL_PROPERTY_STATUS.ACTIVE },
  { label: "Pending", value: SOCIAL_PROPERTY_STATUS.PENDING },
  { label: "Sold", value: SOCIAL_PROPERTY_STATUS.SOLD },
  { label: "Draft", value: SOCIAL_PROPERTY_STATUS.DRAFT },
  { label: "Not Available", value: SOCIAL_PROPERTY_STATUS.NOT_AVAILABLE },
];

export const PROPERTY_HUB_PAGE_SIZE = 30;

/** Public Secondary/Rental browse on Listings tab (mobile `useRealtorsPropertyController`). */
export const SOCIAL_BROWSE_ACTIVE_STATUS_ID = 5;

export const DEFAULT_PRICE_RANGE = { start: "0", end: "" };
