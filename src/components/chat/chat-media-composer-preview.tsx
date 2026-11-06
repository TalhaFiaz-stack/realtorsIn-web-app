"use client";

import { FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type PendingChatImages = {
  kind: "images";
  files: File[];
  previewUrl: string;
};

export type PendingChatDocuments = {
  kind: "documents";
  files: File[];
};

export type PendingChatAttachment = PendingChatImages | PendingChatDocuments;

export function ChatMediaComposerPreview({
  attachment,
  onRemove,
  className,
}: {
  attachment: PendingChatAttachment;
  onRemove: () => void;
  className?: string;
}) {
  const extraCount =
    attachment.kind === "images"
      ? attachment.files.length - 1
      : attachment.files.length - 1;

  return (
    <div
      className={cn(
        "flex items-start gap-3 border-t border-border bg-muted/30 px-3 py-2.5",
        className
      )}
    >
      <div className="relative shrink-0">
        {attachment.kind === "images" ? (
          <div className="relative h-[4.5rem] w-[4.5rem] overflow-hidden rounded-lg border border-border bg-muted shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element -- blob preview */}
            <img
              src={attachment.previewUrl}
              alt=""
              className="h-full w-full object-cover"
            />
            {extraCount > 0 ? (
              <span className="absolute bottom-1 right-1 rounded-md bg-black/65 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                +{extraCount}
              </span>
            ) : null}
          </div>
        ) : (
          <div className="flex h-[4.5rem] w-[4.5rem] flex-col items-center justify-center gap-1 rounded-lg border border-border bg-card px-1 text-center shadow-sm">
            <FileText className="h-6 w-6 text-muted-foreground" aria-hidden />
            <span className="line-clamp-2 w-full text-[9px] leading-tight text-muted-foreground">
              {attachment.files[0]?.name ?? "File"}
            </span>
          </div>
        )}
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="absolute -right-2 -top-2 h-7 w-7 rounded-full shadow-md"
          aria-label="Remove attachment"
          onClick={onRemove}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
      <p className="min-w-0 flex-1 pt-1 text-xs text-muted-foreground">
        {attachment.kind === "images"
          ? attachment.files.length === 1
            ? "Photo ready to send — add a caption below if you like."
            : `${attachment.files.length} photos ready — add a caption below if you like.`
          : attachment.files.length === 1
            ? "Document ready to send — add a caption below if you like."
            : `${attachment.files.length} documents ready — add a caption below if you like.`}
      </p>
    </div>
  );
}
