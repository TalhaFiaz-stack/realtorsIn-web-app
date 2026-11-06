import type { OffPlanListFilters } from "@/features/off-plan/types/off-plan.types";

function appendPaymentBreakdown(form: FormData, pb: OffPlanListFilters["paymentBreakdown"]) {
  if (!pb) return;
  (["pbBooking", "pbConstruction", "pbHandover", "pbPostHandover"] as const).forEach(
    (key) => {
      const raw = pb[key];
      if (!raw) return;
      const numeric = String(raw).replace(/[^0-9]/g, "");
      if (numeric) form.append(key, numeric);
    }
  );
}

export function buildOffPlanProjectsFormData(
  filters: OffPlanListFilters
): FormData {
  const form = new FormData();
  const page = filters.page ?? 1;
  form.append("page", String(page));
  form.append("per_page", filters.perPageAll ? "all" : "30");

  if (filters.searchText?.trim()) {
    form.append("search_text", filters.searchText.trim());
  }
  if (filters.beds) form.append("beds", filters.beds);
  if (filters.minPrice && filters.minPrice !== "0") {
    form.append("min_price", filters.minPrice);
  }
  if (filters.maxPrice && filters.maxPrice !== "0") {
    form.append("max_price", filters.maxPrice);
  }
  if (filters.minArea && filters.minArea !== "0" && filters.minArea !== "No min") {
    form.append("min_area", filters.minArea);
  }
  if (filters.maxArea && filters.maxArea !== "0" && filters.maxArea !== "No max") {
    form.append("max_area", filters.maxArea);
  }
  if (filters.cityId) form.append("city_id", filters.cityId);
  if (filters.districtId) form.append("district_id", filters.districtId);

  filters.developerIds?.forEach((id, index) => {
    form.append(`developer_id[${index}]`, String(id));
  });

  if (filters.searchProjectIds?.length) {
    form.append("search_project_ids", filters.searchProjectIds.join(","));
  }

  if (filters.developmentStatus?.length) {
    form.append("development_status", filters.developmentStatus.join(","));
  }

  if (filters.completionStatus?.length) {
    form.append("completionStatus", filters.completionStatus.join(","));
  }

  filters.propertyTypes?.forEach((type, index) => {
    form.append(`property_type[${index}]`, type);
  });

  if (filters.completionDate && filters.completionDate !== "all") {
    form.append("completion_date", filters.completionDate);
  }
  if (filters.downPayment) {
    const dp = filters.downPayment.split("_")[1];
    if (dp) form.append("down_payment", dp);
  }
  if (filters.postHandover) {
    form.append("on_post_handover", filters.postHandover);
  }

  appendPaymentBreakdown(form, filters.paymentBreakdown);

  if (filters.projectVisibility && filters.projectVisibility !== "all") {
    form.append("project_visibility", filters.projectVisibility);
  }
  if (filters.sortBy && filters.sortBy !== "default") {
    form.append("sortBy", filters.sortBy);
  }

  return form;
}
