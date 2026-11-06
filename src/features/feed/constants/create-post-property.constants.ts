export const PROPERTY_PURPOSE_OPTIONS = [
  { label: "For Sell", value: "sell" },
  { label: "For Rent Out", value: "rent_out" },
] as const;

export const PROPERTY_CATEGORY_OPTIONS = [
  { label: "Residential", value: "residential" },
  { label: "Commercial", value: "commercial" },
  { label: "Land", value: "land" },
] as const;

export const PROPERTY_TYPE_OPTIONS = [
  "Apartment",
  "Villa",
  "Townhouse",
  "Penthouse",
  "Studio",
  "Office",
  "Shop",
  "Warehouse",
  "Land",
] as const;

export const PROPERTY_STATUS_OPTIONS = [
  { label: "Ready", value: "1" },
  { label: "Off Plan", value: "0" },
] as const;

export const PROPERTY_BED_OPTIONS = [
  { label: "Studio", value: "0" },
  ...Array.from({ length: 10 }, (_, i) => {
    const n = i + 1;
    return {
      label: n === 1 ? "1 Bed" : `${n} Beds`,
      value: String(n),
    };
  }),
];

export const PROPERTY_BATH_OPTIONS = Array.from({ length: 10 }, (_, i) => {
  const n = i + 1;
  return {
    label: n === 1 ? "1 Bath" : `${n} Baths`,
    value: String(n),
  };
});

export const PROPERTY_FURNISHING_OPTIONS = [
  { label: "Unfurnished", value: "0" },
  { label: "Furnished", value: "1" },
  { label: "Semi-Furnished", value: "2" },
] as const;
