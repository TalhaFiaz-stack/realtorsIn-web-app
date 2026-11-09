"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CampaignDesignDialog } from "@/components/campaigns/campaign-design-dialog";
import {
  fetchActiveCampaignsRequest,
  fetchCampaignDesignRequest,
  markCampaignReadRequest,
} from "@/features/campaigns/services/campaigns.client";
import type { InAppCampaign } from "@/features/campaigns/types";

export const CAMPAIGN_DESIGN_PARAM = "campaign_design";
const ACTIVE_KEY = ["campaigns", "active"] as const;

function parseDesignId(raw: string | null): number | null {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

/**
 * Mobile parity for campaign HTML:
 * - `view_content` push → `?campaign_design=<id>` opens that design
 * - in-app campaigns → one unread campaign per arrival on the feed,
 *   marked read when dismissed (mobile `tryShowNextUnreadCampaign`)
 */
export function CampaignHost() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const designId = parseDesignId(searchParams.get(CAMPAIGN_DESIGN_PARAM));
  const onFeed = pathname === "/feed";

  const designQuery = useQuery({
    queryKey: ["campaigns", "design", designId],
    queryFn: ({ signal }) => fetchCampaignDesignRequest(designId!, signal),
    enabled: designId != null,
    retry: 1,
  });

  const activeQuery = useQuery({
    queryKey: ACTIVE_KEY,
    queryFn: ({ signal }) => fetchActiveCampaignsRequest(signal),
    enabled: onFeed,
    staleTime: 5 * 60 * 1000,
  });

  const [campaign, setCampaign] = useState<InAppCampaign | null>(null);
  const shownThisVisit = useRef(false);

  useEffect(() => {
    if (!onFeed) shownThisVisit.current = false;
  }, [onFeed]);

  useEffect(() => {
    if (!onFeed || designId != null || campaign || shownThisVisit.current) return;
    const next = activeQuery.data?.campaigns.find((c) => c.htmlContent);
    if (!next) return;
    shownThisVisit.current = true;
    const timer = window.setTimeout(() => setCampaign(next), 600);
    return () => window.clearTimeout(timer);
  }, [onFeed, designId, campaign, activeQuery.data]);

  const closeCampaign = useCallback(() => {
    if (!campaign) return;
    const id = campaign.id;
    setCampaign(null);
    queryClient.setQueryData<{ ok: true; campaigns: InAppCampaign[] }>(ACTIVE_KEY, (prev) =>
      prev ? { ...prev, campaigns: prev.campaigns.filter((c) => c.id !== id) } : prev
    );
    void markCampaignReadRequest(id).catch(() => undefined);
  }, [campaign, queryClient]);

  const closeDesign = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(CAMPAIGN_DESIGN_PARAM);
    const q = params.toString();
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  if (designId != null) {
    const design = designQuery.data?.design;
    return (
      <CampaignDesignDialog
        open
        title={design?.title ?? "Announcement"}
        html={design?.htmlContent ?? null}
        loading={designQuery.isLoading}
        error={designQuery.isError}
        onRetry={() => void designQuery.refetch()}
        onClose={closeDesign}
      />
    );
  }

  return (
    <CampaignDesignDialog
      open={campaign != null}
      title={campaign?.title ?? "Announcement"}
      html={campaign?.htmlContent ?? null}
      onClose={closeCampaign}
    />
  );
}
