export type OffPlanPresentationToggle = {
  title: string;
  value: string;
  isOn: boolean;
};

export type OffPlanPresentationOptions = {
  currency: string;
  language: string;
  theme: "light" | "dark";
  design: "v1" | "v2";
  area: "sqft" | "sqm";
  toggles: OffPlanPresentationToggle[];
  paymentPlanIds: string[];
};

export type OffPlanPaymentPlanOption = {
  id: string;
  title: string;
};

export const OFF_PLAN_PRESENTATION_CURRENCIES = [
  "AED",
  "USD",
  "EUR",
  "GBP",
  "SAR",
  "QAR",
  "OMR",
  "KWD",
  "BHD",
] as const;

export const OFF_PLAN_PRESENTATION_LANGUAGES = [
  { value: "en", label: "English" },
  { value: "ar", label: "Arabic" },
  { value: "ru", label: "Russian" },
  { value: "zh", label: "Chinese" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "it", label: "Italian" },
  { value: "tr", label: "Turkish" },
  { value: "hi", label: "Hindi" },
  { value: "ur", label: "Urdu" },
] as const;

export function buildDefaultPresentationToggles(
  mode: "offer" | "pdf",
  hasPaymentPlans: boolean
): OffPlanPresentationToggle[] {
  const core: OffPlanPresentationToggle[] = [
    { title: "Full Description", value: "full_description", isOn: true },
    { title: "Units", value: "units", isOn: true },
    { title: "Developer", value: "developer", isOn: true },
    { title: "Prices", value: "prices", isOn: true },
    { title: "Map", value: "map", isOn: true },
  ];
  const withWatermark: OffPlanPresentationToggle[] =
    mode === "pdf"
      ? [
          {
            title: "Show company logo as Watermark",
            value: "watermark",
            isOn: true,
          },
          ...core,
        ]
      : core;
  if (hasPaymentPlans) {
    return [
      ...withWatermark,
      {
        title: "Display Payment Plans",
        value: "payment_plans",
        isOn: false,
      },
    ];
  }
  return withWatermark;
}

export function parsePaymentPlanOptions(raw: unknown): OffPlanPaymentPlanOption[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const id =
        typeof row.id === "number"
          ? String(row.id)
          : typeof row.id === "string"
            ? row.id
            : null;
      if (!id) return null;
      const title =
        (typeof row.title === "string" && row.title) ||
        (typeof row.name === "string" && row.name) ||
        `Plan ${id}`;
      return { id, title };
    })
    .filter((p): p is OffPlanPaymentPlanOption => Boolean(p));
}

export function buildOffPlanPresentationQuery(
  options: OffPlanPresentationOptions
): string {
  const params = new URLSearchParams();
  options.toggles.forEach((t) => {
    params.set(t.value, String(t.isOn));
  });
  params.set("offer_currency", options.currency);
  params.set("offer_language", options.language);
  params.set("theme", options.theme);
  params.set("design", options.design);
  params.set("area", options.area);
  const paymentPlansOn = options.toggles.find(
    (t) => t.value === "payment_plans"
  )?.isOn;
  if (paymentPlansOn && options.paymentPlanIds.length > 0) {
    params.set("payment_plans_ids", options.paymentPlanIds.join(","));
  }
  return params.toString();
}

export function buildOffPlanOfferUrl(input: {
  remApiBase: string;
  projectId: string;
  encryptId: string;
  options: OffPlanPresentationOptions;
}): string {
  const query = buildOffPlanPresentationQuery(input.options);
  const base = input.remApiBase.replace(/\/$/, "");
  return `${base}/api/realtorsin/project/offer/${input.projectId}/${input.encryptId}?${query}`;
}

export function buildOffPlanProjectPdfPath(
  projectId: string,
  options: OffPlanPresentationOptions
): string {
  const query = buildOffPlanPresentationQuery(options);
  return `realtorsin/project/pdf/${encodeURIComponent(projectId)}?${query}&phone=true`;
}
