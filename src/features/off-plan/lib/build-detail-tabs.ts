import type {
  OffPlanDetailTabId,
  OffPlanProjectDetail,
} from "@/features/off-plan/types/off-plan.types";

export type OffPlanDetailTab = { id: OffPlanDetailTabId; title: OffPlanDetailTabId };

/** Same tab order/rules as mobile `checkDataAndSetTabs`. */
export function buildOffPlanDetailTabs(
  project: OffPlanProjectDetail
): OffPlanDetailTab[] {
  const tabs: OffPlanDetailTab[] = [{ id: "About", title: "About" }];

  if (project.buildings.length > 0 || project.typicalUnits.length > 0) {
    tabs.push({ id: "Availability", title: "Availability" });
  }
  if (project.address && project.latLong) {
    tabs.push({ id: "Location & Nearby", title: "Location & Nearby" });
  }
  if (
    project.facilityItems.length > 0 ||
    project.facilities.length > 0 ||
    project.amenityLabels.length > 0
  ) {
    tabs.push({ id: "Facilities & Amenities", title: "Facilities & Amenities" });
  }
  if (project.attachments.length > 0) {
    tabs.push({ id: "Attachments", title: "Attachments" });
  }
  if (
    project.hasPaymentPlans ||
    project.hasParking ||
    project.hasBrokerInfo ||
    project.hasInventoryOverview
  ) {
    tabs.push({ id: "Commercial Details", title: "Commercial Details" });
  }
  if (project.youtubeLinks.length > 0) {
    tabs.push({ id: "Visual overview", title: "Visual overview" });
  }
  if (project.salesAgencies.length > 0) {
    tabs.push({ id: "Sales Agencies", title: "Sales Agencies" });
  }
  if (project.salesExecutives.length > 0) {
    tabs.push({ id: "Sales Executive", title: "Sales Executive" });
  }

  return tabs;
}

export function offPlanDetailTabDomId(tab: OffPlanDetailTabId): string {
  return `off-plan-tab-${tab.replace(/\s+/g, "-").toLowerCase()}`;
}
