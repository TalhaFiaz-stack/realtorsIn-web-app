"use client";

import {
  Mail as MailIcon,
  MessageCircle,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RemoteImg } from "@/components/shared/remote-img";
import {
  offPlanSalesExecMailto,
  offPlanSalesExecWhatsappUrl,
} from "@/features/off-plan/lib/off-plan-sales-exec-contact";
import { trackOffPlanActivity } from "@/features/off-plan/services/off-plan-track.client";
import type { OffPlanSalesExecutive } from "@/features/off-plan/types/off-plan.types";

/**
 * Matches mobile `OffPlanUserComp` / sticky footer: role, tappable email, icon-only contact.
 * No separate Call/Email text buttons (those duplicated actions and looked like extra CTAs).
 */
export type OffPlanSalesExecTracking = {
  projectId: string;
  projectName: string;
  developerId?: number | null;
  developerName?: string | null;
};

export function OffPlanSalesExecutiveRow({
  exec,
  avatarClassName = "h-12 w-12",
  tracking,
}: {
  exec: OffPlanSalesExecutive;
  avatarClassName?: string;
  /** When set, call / WhatsApp / email taps are recorded (mobile `sales_exec_*`). */
  tracking?: OffPlanSalesExecTracking;
}) {
  const track = (
    eventType: "sales_exec_call" | "sales_exec_whatsapp" | "sales_exec_email"
  ) => {
    if (!tracking) return;
    trackOffPlanActivity({
      projectId: tracking.projectId,
      projectName: tracking.projectName,
      eventType,
      metadata: {
        projectId: tracking.projectId,
        projectName: tracking.projectName,
        salesExecutiveId: exec.id,
        salesExecutiveName: exec.name,
        developerId: tracking.developerId ?? null,
        developerName: tracking.developerName ?? null,
      },
    });
  };
  const whatsappUrl = offPlanSalesExecWhatsappUrl(exec);
  const mailto = offPlanSalesExecMailto(exec);
  const showEmailLine = Boolean(exec.email) && !exec.useWhatsappBusinessApi;

  return (
    <div className="flex items-center gap-3">
      <RemoteImg
        src={exec.image ?? undefined}
        alt=""
        wrapperClassName={`${avatarClassName} shrink-0 overflow-hidden rounded-full bg-muted`}
        className="h-full w-full object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{exec.name}</p>
        <p className="truncate text-sm text-muted-foreground">
          {exec.role ?? "Sales executive"}
        </p>
        {showEmailLine && mailto ? (
          <a
            href={mailto}
            onClick={() => track("sales_exec_email")}
            className="truncate text-xs text-primary hover:underline"
          >
            {exec.email}
          </a>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-0.5">
        {exec.phone && !exec.useWhatsappBusinessApi ? (
          <Button variant="ghost" size="icon" asChild>
            <a
              href={`tel:${exec.phone}`}
              onClick={() => track("sales_exec_call")}
              aria-label="Call sales executive"
            >
              <Phone className="h-5 w-5" />
            </a>
          </Button>
        ) : null}
        {whatsappUrl ? (
          <Button variant="ghost" size="icon" asChild>
            <a
              href={whatsappUrl}
              onClick={() => track("sales_exec_whatsapp")}
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp sales executive"
            >
              <MessageCircle className="h-5 w-5" />
            </a>
          </Button>
        ) : null}
        {showEmailLine && mailto ? (
          <Button variant="ghost" size="icon" asChild>
            <a
              href={mailto}
              onClick={() => track("sales_exec_email")}
              aria-label="Email sales executive"
            >
              <MailIcon className="h-5 w-5" aria-hidden />
            </a>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
