"use client";

import { useEffect, useState } from "react";
import { Check, FileDown, Loader2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  mutationErrorMessage,
  useGenerateCvPdf,
  useUpdateCvTemplate,
} from "@/features/profile/hooks/use-profile-mutations";
import type {
  GeneratedCvPdf,
  ProfileResumeTemplate,
  SocialProfile,
} from "@/features/profile/types/profile.types";
import {
  CV_TEMPLATE_IDS,
  type CvTemplateInput,
} from "@/features/profile/validators/profile.validators";
import { copyTextToClipboard } from "@/lib/clipboard";
import { RemoteImg } from "@/components/shared/remote-img";
import { cn } from "@/lib/utils";

function isCvTemplateId(value: string): value is CvTemplateInput["template"] {
  return (CV_TEMPLATE_IDS as readonly string[]).includes(value);
}

function templateLabel(template: ProfileResumeTemplate) {
  return template.name?.trim() || String(template.id);
}

export function ProfileResumeTemplatesDialog({
  open,
  onOpenChange,
  profile,
  onPdfGenerated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: SocialProfile;
  onPdfGenerated: (pdf: GeneratedCvPdf) => void;
}) {
  const updateTemplate = useUpdateCvTemplate();
  const generatePdf = useGenerateCvPdf();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const templates = profile.resumeTemplates;
  const busy = updateTemplate.isPending || generatePdf.isPending;
  const accountActive = profile.activeStatus === "active";

  useEffect(() => {
    if (!open) return;
    setError(null);
    const selected = templates.find((item) => item.isSelected);
    setSelectedId(selected ? String(selected.id) : null);
  }, [open, templates]);

  const selectedTemplate =
    templates.find((item) => String(item.id) === selectedId) ??
    templates.find((item) => item.isSelected) ??
    null;

  async function onSelect(template: ProfileResumeTemplate) {
    if (!accountActive) {
      setError(
        "Your account is currently inactive. Please contact support for assistance."
      );
      return;
    }
    if (busy) return;
    const id = String(template.id);
    if (selectedId === id) return;
    if (!isCvTemplateId(id)) {
      setError("This template is not supported");
      return;
    }
    setError(null);
    try {
      await updateTemplate.mutateAsync({ template: id });
      setSelectedId(id);
    } catch (err) {
      setError(mutationErrorMessage(err));
    }
  }

  async function onShareLink() {
    if (!accountActive) {
      setError(
        "Your account is currently inactive. Please contact support for assistance."
      );
      return;
    }
    const url = selectedTemplate?.url;
    if (!url) {
      setError("Please select a template first");
      return;
    }
    const ok = await copyTextToClipboard(url);
    if (!ok) {
      setError("Unable to copy template link");
      return;
    }
    onOpenChange(false);
  }

  async function onGeneratePdf() {
    if (!accountActive) {
      setError(
        "Your account is currently inactive. Please contact support for assistance."
      );
      return;
    }
    if (!selectedTemplate) {
      setError("Please select a template first");
      return;
    }
    setError(null);
    try {
      const result = await generatePdf.mutateAsync();
      onOpenChange(false);
      onPdfGenerated(result.pdf);
    } catch (err) {
      setError(mutationErrorMessage(err));
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setError(null);
        onOpenChange(next);
      }}
    >
      <DialogContent className="flex max-h-[90vh] max-w-lg flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="border-b border-border px-5 py-4">
          <DialogTitle>Choose Template</DialogTitle>
          <DialogDescription>
            Select a professional template to showcase your profile
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
          {templates.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center">
              <p className="font-medium text-foreground">No templates available</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Templates will appear here once they are available.
              </p>
            </div>
          ) : (
            templates.map((template) => {
              const id = String(template.id);
              const selected = selectedId === id;
              return (
                <button
                  key={id}
                  type="button"
                  disabled={busy}
                  onClick={() => void onSelect(template)}
                  className={cn(
                    "locale-text w-full overflow-hidden rounded-xl border text-start transition-colors",
                    selected
                      ? "border-primary ring-1 ring-primary"
                      : "border-border hover:bg-muted/40"
                  )}
                >
                  <div className="relative h-36 w-full overflow-hidden bg-muted">
                    {template.dummyUrl ? (
                      <RemoteImg
                        src={template.dummyUrl}
                        alt=""
                        wrapperClassName="absolute inset-0"
                        className="h-full w-full object-cover object-top"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                        Preview unavailable
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2 px-3.5 py-3">
                    <p className="truncate text-[15px] font-semibold">
                      {templateLabel(template)}
                    </p>
                    {selected ? (
                      <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="h-3 w-3" />
                      </span>
                    ) : null}
                  </div>
                </button>
              );
            })
          )}
          {error ? (
            <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}
        </div>

        {templates.length > 0 ? (
          <DialogFooter className="gap-2 border-t border-border px-5 py-4 sm:justify-between">
            <Button
              type="button"
              variant="outline"
              className="sm:flex-1"
              disabled={busy}
              onClick={() => void onShareLink()}
            >
              <Share2 className="mr-1.5 h-4 w-4" />
              Share as link
            </Button>
            <Button
              type="button"
              className="sm:flex-1"
              disabled={busy}
              onClick={() => void onGeneratePdf()}
            >
              {generatePdf.isPending ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <FileDown className="mr-1.5 h-4 w-4" />
              )}
              {generatePdf.isPending ? "Generating" : "Generate PDF"}
            </Button>
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
