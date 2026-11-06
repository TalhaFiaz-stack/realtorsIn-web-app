"use client";

import { InteractionsSection } from "@/components/activities/interactions-section";
import { InfluencerProgressBanner } from "@/components/influencer/influencer-progress-banner";

export function ActivitiesHubScreen({
  showHeader = true,
}: {
  showHeader?: boolean;
}) {
  return (
    <>
      <InfluencerProgressBanner />
      <InteractionsSection showHeader={showHeader} />
    </>
  );
}
