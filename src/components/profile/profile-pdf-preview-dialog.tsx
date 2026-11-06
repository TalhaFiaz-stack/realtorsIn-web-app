"use client";

import { Download, Loader2 } from "lucide-react";
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
  useDownloadCvPdf,
} from "@/features/profile/hooks/use-profile-mutations";
import type { GeneratedCvPdf } from "@/features/profile/types/profile.types";

export function ProfilePdfPreviewDialog({
  open,
  onOpenChange,
  pdf,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pdf: GeneratedCvPdf | null;
}) {
  const download = useDownloadCvPdf();

  async function onDownload() {
    if (!pdf) return;
    try {
      const blob = await download.mutateAsync(pdf.fileName);
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = pdf.fileName;
      anchor.rel = "noopener";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      window.alert(mutationErrorMessage(error));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-3xl flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="border-b border-border px-5 py-4">
          <DialogTitle>Download PDF</DialogTitle>
          <DialogDescription>
            Preview your generated profile PDF, then download a copy.
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-[50vh] flex-1 bg-muted/40">
          {pdf?.previewUrl ? (
            <iframe
              title="Profile PDF preview"
              src={pdf.previewUrl}
              className="h-[min(60vh,640px)] w-full border-0"
            />
          ) : (
            <div className="flex h-[min(60vh,640px)] items-center justify-center text-sm text-muted-foreground">
              PDF preview unavailable
            </div>
          )}
        </div>
        <DialogFooter className="border-t border-border px-5 py-4">
          <Button
            type="button"
            onClick={() => void onDownload()}
            disabled={!pdf || download.isPending}
          >
            {download.isPending ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-1.5 h-4 w-4" />
            )}
            Download PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
