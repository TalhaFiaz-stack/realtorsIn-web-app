"use client";

import { Download, Eye, FileText } from "lucide-react";
import type { OffPlanAttachment } from "@/features/off-plan/types/off-plan.types";

export function OffPlanAttachmentsList({
  attachments,
}: {
  attachments: OffPlanAttachment[];
}) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {attachments.map((a) => (
        <li
          key={String(a.id)}
          className="overflow-hidden rounded-[10px] border border-border/80 bg-card shadow-sm"
        >
          <div className="px-3 py-4">
            <div className="flex items-start gap-3 px-1">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-red-500 text-white">
                <FileText className="h-4 w-4" aria-hidden />
              </span>
              <p className="min-w-0 flex-1 pt-0.5 text-base font-semibold leading-snug">
                {a.title}
              </p>
            </div>
            {a.url ? (
              <div className="mt-3 flex gap-2.5 px-1">
                {(a.fileType === "pdf" || a.url.toLowerCase().includes(".pdf")) && (
                  <a
                    href={a.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2.5 text-xs font-bold text-primary-foreground transition hover:brightness-105"
                  >
                    <Eye className="h-4 w-4" aria-hidden />
                    View
                  </a>
                )}
                <a
                  href={a.url}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2.5 text-xs font-bold text-primary-foreground transition hover:brightness-105"
                >
                  <Download className="h-4 w-4" aria-hidden />
                  Download
                </a>
              </div>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
