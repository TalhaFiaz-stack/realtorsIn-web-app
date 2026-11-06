export const OFF_PLAN_BED_OPTIONS = [
  { label: "Studio", value: "studio" },
  { label: "1", value: "1" },
  { label: "2", value: "2" },
  { label: "3", value: "3" },
  { label: "4", value: "4" },
  { label: "5+", value: "5" },
];

export const OFF_PLAN_VISIBILITY_OPTIONS = [
  { label: "All", value: "all" as const },
  { label: "Public", value: "public" as const },
  { label: "Private", value: "private" as const },
];

export const OFF_PLAN_DOWN_PAYMENT_OPTIONS = [
  { label: "Any", value: "" },
  { label: "Under 10%", value: "under_10" },
  { label: "Under 20%", value: "under_20" },
  { label: "Under 30%", value: "under_30" },
  { label: "Under 40%", value: "under_40" },
];

export const OFF_PLAN_POST_HANDOVER_OPTIONS = [
  { label: "Any", value: "" },
  { label: "Yes", value: "yes" },
  { label: "No", value: "no" },
];

/**
 * Same labels/values as mobile `SortOptionBSheet` off-plan menu (`offPlanMenuOptions`).
 */
export const OFF_PLAN_SORT_OPTIONS = [
  { label: "Default", value: "default" },
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
  { label: "Stock Available", value: "inventory" },
  { label: "Resale Units Available", value: "resale" },
] as const;

export const PAYMENT_BREAKDOWN_FIELDS = [
  { key: "pbBooking", label: "On booking (%)" },
  { key: "pbConstruction", label: "During construction (%)" },
  { key: "pbHandover", label: "On handover (%)" },
  { key: "pbPostHandover", label: "Post handover (%)" },
] as const;

export type PaymentBreakdownKey = (typeof PAYMENT_BREAKDOWN_FIELDS)[number]["key"];

export type PaymentBreakdownDraft = Record<PaymentBreakdownKey, string>;

export const EMPTY_PAYMENT_BREAKDOWN: PaymentBreakdownDraft = {
  pbBooking: "",
  pbConstruction: "",
  pbHandover: "",
  pbPostHandover: "",
};
