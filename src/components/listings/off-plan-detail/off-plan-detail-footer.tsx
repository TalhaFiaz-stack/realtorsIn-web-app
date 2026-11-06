"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Download, Link2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OffPlanOfferPreviewDialog } from "@/components/listings/off-plan-detail/off-plan-offer-preview-dialog";
import {
  OffPlanPresentationDialog,
  type OffPlanPresentationDialogMode,
} from "@/components/listings/off-plan-detail/off-plan-presentation-dialog";
import { OffPlanShareProjectDialog } from "@/components/listings/off-plan-detail/off-plan-share-project-dialog";
import {
  buildOffPlanOfferUrl,
  type OffPlanPresentationOptions,
} from "@/features/off-plan/lib/off-plan-presentation";
import {
  fetchOffPlanPresentationContextClient,
  requestOffPlanProjectPdfClient,
} from "@/features/off-plan/services/off-plan.client";
import { trackOffPlanActivity } from "@/features/off-plan/services/off-plan-track.client";
import { fetchSession } from "@/features/auth/services/auth.client";
import type { OffPlanProjectDetail } from "@/features/off-plan/types/off-plan.types";
import { cn } from "@/lib/utils";

export function OffPlanDetailFooter({
  project,
}: {
  project: OffPlanProjectDetail;
}) {
  const [presentationMode, setPresentationMode] =
    useState<OffPlanPresentationDialogMode | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [offerUrl, setOfferUrl] = useState<string | null>(null);
  const [offerPreviewOpen, setOfferPreviewOpen] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const sessionQuery = useQuery({
    queryKey: ["session"],
    queryFn: ({ signal }) => fetchSession(signal),
  });

  const presentationQuery = useQuery({
    queryKey: ["off-plan", "presentation-context"],
    queryFn: ({ signal }) => fetchOffPlanPresentationContextClient(signal),
    enabled: sessionQuery.data?.authenticated === true,
    retry: false,
  });

  const authenticated = sessionQuery.data?.authenticated === true;
  const presentationContext = presentationQuery.data?.context;

  const openPresentation = (mode: OffPlanPresentationDialogMode) => {
    setActionError(null);
    if (!authenticated) {
      setActionError("Sign in to use offer links, PDFs, and sharing.");
      return;
    }
    setPresentationMode(mode);
  };

  const handlePresentationConfirm = async (
    result: Omit<OffPlanPresentationOptions, "toggles"> & {
      toggles: OffPlanPresentationOptions["toggles"];
      paymentPlanIds: string[];
    }
  ) => {
    if (!presentationContext) {
      setActionError("Still loading your presentation profile. Try again.");
      return;
    }
    const options: OffPlanPresentationOptions = {
      currency: result.currency,
      language: result.language,
      theme: result.theme,
      design: result.design,
      area: result.area,
      toggles: result.toggles,
      paymentPlanIds: result.paymentPlanIds,
    };

    if (presentationMode === "offer") {
      const url = buildOffPlanOfferUrl({
        remApiBase: presentationContext.remOfferApiBase,
        projectId: project.id,
        encryptId: presentationContext.encryptId,
        options,
      });
      setOfferUrl(url);
      setPresentationMode(null);
      // Mobile parity: offer link generation counts as copy_offer_link / project_pdf_link_copy.
      trackOffPlanActivity({
        projectId: project.id,
        projectName: project.title,
        eventType: "copy_offer_link",
        analyticsAction: "project_pdf_link_copy",
      });
      setOfferPreviewOpen(true);
      return;
    }

    setPdfLoading(true);
    try {
      const response = await requestOffPlanProjectPdfClient({
        projectId: project.id,
        currency: result.currency,
        language: result.language,
        theme: result.theme,
        design: result.design,
        area: result.area,
        toggles: result.toggles.map((t) => ({
          value: t.value,
          isOn: t.isOn,
        })),
        paymentPlanIds: result.paymentPlanIds,
        hasPaymentPlans: project.hasPaymentPlans,
      });
      setPresentationMode(null);
      trackOffPlanActivity({
        projectId: project.id,
        projectName: project.title,
        eventType: "quick_pdf_download",
        analyticsAction: "project_pdf_generate",
      });
      window.open(response.url, "_blank", "noopener,noreferrer");
    } catch (e) {
      setActionError(
        e instanceof Error ? e.message : "Unable to generate project PDF"
      );
    } finally {
      setPdfLoading(false);
    }
  };

  const actionButtonClass = cn(
    "h-10 min-w-0 shadow-none",
    "md:h-11 md:flex-1"
  );

  return (
    <>
      <section
        className="py-1.5"
        aria-label="Share and export"
      >
        <h2 className="locale-text mb-2 hidden px-1 text-sm font-bold tracking-tight text-foreground md:block md:text-base">
          Share & export
        </h2>

        {/* Mobile: sticky bar aligned with shell padding */}
        <div className="fixed inset-x-0 bottom-[calc(3.5rem+1px+env(safe-area-inset-bottom))] z-30 border-t border-border/80 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/90 md:hidden">
          <div className="mx-auto grid w-full max-w-[var(--shell-max)] grid-cols-3 gap-2 px-3 py-2.5">
            <Button
              type="button"
              size="sm"
              className="h-auto flex-col gap-1 px-1 py-2 text-[10px] font-semibold leading-tight"
              onClick={() => openPresentation("offer")}
            >
              <Link2 className="h-4 w-4 shrink-0" aria-hidden />
              Offer link
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-auto flex-col gap-1 px-1 py-2 text-[10px] font-semibold leading-tight"
              onClick={() => openPresentation("pdf")}
              disabled={pdfLoading}
            >
              <Download className="h-4 w-4 shrink-0" aria-hidden />
              {pdfLoading ? "PDF…" : "PDF"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-auto flex-col gap-1 border border-border/60 px-1 py-2 text-[10px] font-semibold leading-tight"
              onClick={() => {
                if (!authenticated) {
                  setActionError("Sign in to share this project to your feed.");
                  return;
                }
                setShareOpen(true);
                trackOffPlanActivity({
                  projectId: project.id,
                  projectName: project.title,
                  analyticsAction: "project_share",
                });
              }}
            >
              <Share2 className="h-4 w-4 shrink-0" aria-hidden />
              Share
            </Button>
          </div>
          {actionError ? (
            <p
              className="border-t border-border/60 px-3 py-2 text-center text-xs text-destructive"
              role="alert"
            >
              {actionError}
            </p>
          ) : null}
        </div>

        {/* Desktop: same card language as detail sections */}
        <div className="hidden overflow-hidden rounded-xl border border-border/80 bg-card p-4 shadow-sm md:block">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Client-ready outputs
          </p>
          <div className="flex flex-col gap-2 lg:flex-row lg:items-stretch">
            <Button
              type="button"
              className={actionButtonClass}
              onClick={() => openPresentation("offer")}
            >
              <Link2 className="me-2 h-4 w-4 shrink-0" aria-hidden />
              Get offer link
            </Button>
            <Button
              type="button"
              variant="outline"
              className={actionButtonClass}
              onClick={() => openPresentation("pdf")}
              disabled={pdfLoading}
            >
              <Download className="me-2 h-4 w-4 shrink-0" aria-hidden />
              {pdfLoading ? "Generating PDF…" : "Download PDF"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className={cn(actionButtonClass, "border border-border/70 bg-muted/20")}
              onClick={() => {
                if (!authenticated) {
                  setActionError("Sign in to share this project to your feed.");
                  return;
                }
                setShareOpen(true);
                trackOffPlanActivity({
                  projectId: project.id,
                  projectName: project.title,
                  analyticsAction: "project_share",
                });
              }}
            >
              <Share2 className="me-2 h-4 w-4 shrink-0" aria-hidden />
              Share to feed
            </Button>
          </div>

          {actionError ? (
            <p className="mt-3 text-sm text-destructive" role="alert">
              {actionError}{" "}
              {!authenticated ? (
                <Link href="/login" className="underline">
                  Sign in
                </Link>
              ) : null}
            </p>
          ) : null}

          {project.pdfUrl || project.offerLink ? (
            <p className="mt-3 text-xs text-muted-foreground">
              Legacy links from catalog:{" "}
              {project.offerLink ? (
                <a
                  href={project.offerLink}
                  className="underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  presentation
                </a>
              ) : null}
              {project.pdfUrl && project.offerLink ? " · " : null}
              {project.pdfUrl ? (
                <a
                  href={project.pdfUrl}
                  className="underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  static PDF
                </a>
              ) : null}
            </p>
          ) : null}
        </div>
      </section>

      {presentationMode ? (
        <OffPlanPresentationDialog
          open
          mode={presentationMode}
          projectTitle={project.title}
          hasPaymentPlans={project.hasPaymentPlans}
          paymentPlansJson={project.paymentPlansJson}
          defaultCurrency={
            presentationContext?.defaultCurrency ?? project.currency ?? "AED"
          }
          pdfLoading={pdfLoading}
          onOpenChange={(open) => {
            if (!open) setPresentationMode(null);
          }}
          onConfirm={handlePresentationConfirm}
        />
      ) : null}

      <OffPlanOfferPreviewDialog
        open={offerPreviewOpen}
        url={offerUrl}
        onOpenChange={setOfferPreviewOpen}
      />

      <OffPlanShareProjectDialog
        open={shareOpen}
        projectId={project.id}
        projectTitle={project.title}
        onOpenChange={setShareOpen}
      />
    </>
  );
}
