"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { sanitizeOffPlanHtml } from "@/features/off-plan/lib/off-plan-html";

const COLLAPSE_LENGTH = 900;

export function OffPlanHtmlDescription({ html }: { html: string }) {
  const [expanded, setExpanded] = useState(false);
  const safeHtml = useMemo(() => sanitizeOffPlanHtml(html), [html]);
  const needsCollapse = safeHtml.length > COLLAPSE_LENGTH;
  const visibleHtml =
    expanded || !needsCollapse
      ? safeHtml
      : `${safeHtml.slice(0, COLLAPSE_LENGTH)}…`;

  return (
    <div className="space-y-3">
      <div
        className="off-plan-prose locale-text text-sm leading-relaxed text-foreground [&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:mb-2 [&_h3]:mt-3 [&_h3]:text-base [&_h3]:font-semibold [&_li]:mb-1 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:ps-5 [&_p]:mb-3 [&_strong]:font-semibold [&_ul]:my-2 [&_ul]:list-disc [&_ul]:ps-5"
        dangerouslySetInnerHTML={{ __html: visibleHtml }}
      />
      {needsCollapse ? (
        <Button
          type="button"
          variant="link"
          className="h-auto p-0"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? "Show less" : "Read more"}
        </Button>
      ) : null}
    </div>
  );
}
