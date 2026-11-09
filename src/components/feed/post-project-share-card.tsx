"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin } from "lucide-react";
import { useBrokerGate } from "@/components/broker-verification/broker-gate-provider";
import { RemoteImg } from "@/components/shared/remote-img";
import { mapFeedProjectShare } from "@/features/feed/lib/map-share-cards";

export function PostProjectShareCard({
  projectData,
  variant = "feed",
  /** When false, use a div + router (avoids `<a>` inside parent links). */
  linkable = true,
}: {
  projectData: Record<string, unknown> | null;
  /** `embed` — activity/comment previews without feed margins. */
  variant?: "feed" | "embed";
  linkable?: boolean;
}) {
  const router = useRouter();
  const gate = useBrokerGate();
  const project = mapFeedProjectShare(projectData);
  if (!project) return null;

  const isEmbed = variant === "embed";
  const projectId =
    project.id != null && String(project.id).trim()
      ? String(project.id).trim()
      : null;
  const detailHref = projectId ? `/off-plan/${encodeURIComponent(projectId)}` : null;

  const card = (
    <div
      className={
        isEmbed || detailHref
          ? "overflow-hidden rounded-xl border border-border bg-card"
          : "mx-4 mb-3 overflow-hidden rounded-xl border border-border bg-card"
      }
    >
      <div className={`relative bg-muted ${isEmbed ? "h-32" : "h-44"}`}>
        {project.bannerImage ? (
          <RemoteImg
            src={project.bannerImage}
            alt=""
            wrapperClassName="absolute inset-0"
            className="h-full w-full object-cover"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
        {project.projectStatus ? (
          <span className="absolute start-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-semibold text-neutral-900 shadow-sm">
            {project.projectStatus}
          </span>
        ) : null}
        <div className="absolute inset-x-0 bottom-0 px-3 pb-3 text-white">
          <p
            className={`locale-text line-clamp-2 font-semibold ${isEmbed ? "text-sm" : "text-base"}`}
          >
            {project.title || "Off-plan project"}
          </p>
          {project.developerName ? (
            <p className="locale-text mt-0.5 truncate text-xs text-white/85">
              by {project.developerName}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
        <div className="px-2 py-2.5 text-center">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
            From
          </p>
          <p className="mt-0.5 truncate text-xs font-semibold text-foreground">
            {project.fromPriceLabel || "Inquire"}
          </p>
        </div>
        <div className="px-2 py-2.5 text-center">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Handover
          </p>
          <p className="mt-0.5 truncate text-xs font-semibold text-foreground">
            {project.handoverLabel || "—"}
          </p>
        </div>
        <div className="px-2 py-2.5 text-center">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Commission
          </p>
          <p className="mt-0.5 truncate text-xs font-semibold text-foreground">
            {project.commissionLabel || "—"}
          </p>
        </div>
      </div>

      {project.location ? (
        <p
          dir="ltr"
          className="flex items-start gap-1.5 px-3 py-2.5 text-xs text-muted-foreground"
        >
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          <span dir="auto" className="locale-text line-clamp-2">
            {project.location}
          </span>
        </p>
      ) : null}
    </div>
  );

  if (!detailHref) return card;

  const shellClass = `block ${isEmbed ? "" : "mx-4 mb-3"} rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`;

  if (!linkable) {
    return (
      <div
        role="link"
        tabIndex={0}
        className={`${shellClass} cursor-pointer`}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          if (gate.guard(null, detailHref)) router.push(detailHref);
        }}
        onKeyDown={(event) => {
          if (event.key !== "Enter" && event.key !== " ") return;
          event.preventDefault();
          event.stopPropagation();
          if (gate.guard(null, detailHref)) router.push(detailHref);
        }}
      >
        {card}
      </div>
    );
  }

  return (
    <Link
      href={detailHref}
      className={shellClass}
      onClick={(event) => gate.guard(event, detailHref)}
    >
      {card}
    </Link>
  );
}
