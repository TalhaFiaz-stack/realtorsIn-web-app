import {
  SOCIAL_PROPERTY_STATUS,
  SOCIAL_PROPERTY_STATUS_OPTIONS,
} from "@/features/properties/constants/property-hub.constants";

export function socialPropertyStatusLabel(
  propertyStatusId: number | null | undefined
): string {
  if (propertyStatusId == null) return "Status";
  return (
    SOCIAL_PROPERTY_STATUS_OPTIONS.find((o) => o.value === propertyStatusId)
      ?.label ?? "Status"
  );
}

export function socialPropertyStatusTone(
  propertyStatusId: number | null | undefined
): "active" | "muted" {
  return propertyStatusId === SOCIAL_PROPERTY_STATUS.ACTIVE
    ? "active"
    : "muted";
}
