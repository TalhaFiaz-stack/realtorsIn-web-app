"use client";

import { HubSegmentTabs } from "@/components/hub/hub-segment-tabs";
import {
  PROPERTY_HUB_TABS,
  type PropertyHubTabId,
} from "@/features/properties/constants/property-hub.constants";

export function PropertyHubTabs({
  value,
  onChange,
  className,
}: {
  value: PropertyHubTabId;
  onChange: (tab: PropertyHubTabId) => void;
  className?: string;
}) {
  return (
    <HubSegmentTabs
      items={PROPERTY_HUB_TABS.map((item) => ({
        id: item.id,
        title: item.title,
      }))}
      value={value}
      onChange={onChange}
      ariaLabel="Listing type"
      className={className}
      gridClassName="grid-cols-2 sm:grid-cols-4"
    />
  );
}
