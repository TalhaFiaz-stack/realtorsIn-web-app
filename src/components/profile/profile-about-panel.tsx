"use client";

import { useState } from "react";
import {
  Award,
  BriefcaseBusiness,
  ChevronDown,
  GraduationCap,
  MapPin,
  MoreHorizontal,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProfileImageLightbox } from "@/components/profile/profile-image-lightbox";
import { formatProfileDateRange } from "@/features/profile/lib/map-profile";
import type {
  ProfileCertificate,
  ProfileEducation,
  ProfilePosition,
  ProfileSkill,
  SocialProfile,
} from "@/features/profile/types/profile.types";
import { cn } from "@/lib/utils";

export type ProfileAboutPanelVariant = "full" | "about" | "skills" | "resume";

export type ProfileAboutActions = {
  onEditAbout: () => void;
  onAddPosition: () => void;
  onEditPosition: (item: ProfilePosition) => void;
  onDeletePosition: (id: number) => void;
  onAddEducation: () => void;
  onEditEducation: (item: ProfileEducation) => void;
  onDeleteEducation: (id: number) => void;
  onAddSkill: () => void;
  onEditSkill: (item: ProfileSkill) => void;
  onDeleteSkill: (id: number) => void;
  onAddCertificate: () => void;
  onEditCertificate: (item: ProfileCertificate) => void;
  onDeleteCertificate: (id: number) => void;
  deletingId?: string | null;
};

/** Entries shown before "Show all". */
const PREVIEW_COUNT = 3;

type Viewer = { images: string[]; index: number; title: string } | null;

export function ProfileAboutPanel({
  profile,
  actions,
  variant = "full",
}: {
  profile: SocialProfile;
  actions?: ProfileAboutActions;
  variant?: ProfileAboutPanelVariant;
}) {
  const editable = Boolean(profile.isOwn && actions);
  const [viewer, setViewer] = useState<Viewer>(null);
  const topSkills = profile.skills.filter((skill) => profile.topSkillIds.includes(skill.id));
  const otherSkills = profile.skills.filter((skill) => !profile.topSkillIds.includes(skill.id));
  const skillName = (id: number) => profile.skills.find((s) => s.id === id)?.name;

  const showAbout = variant === "full" || variant === "about";
  const showResume = variant === "full" || variant === "resume";
  const showSkills = variant === "full" || variant === "skills";

  const openImages = (images: string[], index: number, title: string) =>
    setViewer({ images, index, title });

  return (
    <div className="space-y-3">
      {showAbout ? (
        <Section title="About" icon={null} onEdit={editable ? actions?.onEditAbout : undefined}>
          {profile.aboutText ? (
            <div className="space-y-4">
              <ExpandableText text={profile.aboutText} lines={4} className="text-[15px] leading-relaxed" />
              {topSkills.length > 0 ? (
                <div className="flex items-start gap-3 rounded-xl border border-border/70 px-3.5 py-3">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">Top skills</p>
                    <p className="text-sm text-muted-foreground">
                      {topSkills.map((skill) => skill.name).join(" • ")}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <Empty
              icon={Sparkles}
              text="Tell clients and peers about your experience and focus areas."
              actionLabel={editable ? "Write a summary" : undefined}
              onAction={actions?.onEditAbout}
              viewerText="No summary yet."
              editable={editable}
            />
          )}
        </Section>
      ) : null}

      {showResume ? (
        <>
          <Section
            title="Experience"
            icon={BriefcaseBusiness}
            count={profile.positions.length}
            onAdd={editable ? actions?.onAddPosition : undefined}
          >
            {profile.positions.length === 0 ? (
              <Empty
                icon={BriefcaseBusiness}
                text="Add your roles to show your track record."
                actionLabel={editable ? "Add experience" : undefined}
                onAction={actions?.onAddPosition}
                viewerText="No experience added yet."
                editable={editable}
              />
            ) : (
              <EntryList
                items={profile.positions}
                noun="experiences"
                render={(item) => (
                  <Entry
                    logo={<LogoTile name={item.company || item.title} icon={BriefcaseBusiness} />}
                    title={item.title}
                    subtitle={[item.company, item.employmentType].filter(Boolean).join(" · ")}
                    meta={[
                      formatProfileDateRange(item.startDate, item.endDate, item.isCurrentlyWorking || !item.endDate ? "Present" : ""),
                      durationLabel(item.startDate, item.isCurrentlyWorking ? null : item.endDate),
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                    location={[item.location, item.jobType].filter(Boolean).join(" · ")}
                    badge={item.isCurrentlyWorking ? "Current" : null}
                    description={item.description}
                    skills={item.skillIds.map(skillName).filter((n): n is string => Boolean(n))}
                    images={item.imageUrls}
                    onOpenImage={(i) => openImages(item.imageUrls, i, item.title)}
                    actions={
                      editable ? (
                        <RowActions
                          label={item.title}
                          onEdit={() => actions?.onEditPosition(item)}
                          onDelete={() => actions?.onDeletePosition(item.id)}
                          deleting={actions?.deletingId === `position-${item.id}`}
                        />
                      ) : null
                    }
                  />
                )}
              />
            )}
          </Section>

          <Section
            title="Education"
            icon={GraduationCap}
            count={profile.educations.length}
            onAdd={editable ? actions?.onAddEducation : undefined}
          >
            {profile.educations.length === 0 ? (
              <Empty
                icon={GraduationCap}
                text="Add schools, degrees and courses."
                actionLabel={editable ? "Add education" : undefined}
                onAction={actions?.onAddEducation}
                viewerText="No education added yet."
                editable={editable}
              />
            ) : (
              <EntryList
                items={profile.educations}
                noun="education entries"
                render={(item) => (
                  <Entry
                    logo={<LogoTile name={item.school} icon={GraduationCap} />}
                    title={item.school}
                    subtitle={[item.degree, item.fieldOfStudy && item.fieldOfStudy !== "General" ? item.fieldOfStudy : null]
                      .filter(Boolean)
                      .join(", ")}
                    meta={formatProfileDateRange(item.startDate, item.endDate, item.isCurrentlyStudying || !item.endDate ? "Present" : "")}
                    location={item.location}
                    badge={item.isCurrentlyStudying ? "Studying" : null}
                    description={item.description}
                    skills={item.skillIds.map(skillName).filter((n): n is string => Boolean(n))}
                    images={item.imageUrls}
                    onOpenImage={(i) => openImages(item.imageUrls, i, item.school)}
                    actions={
                      editable ? (
                        <RowActions
                          label={item.school}
                          onEdit={() => actions?.onEditEducation(item)}
                          onDelete={() => actions?.onDeleteEducation(item.id)}
                          deleting={actions?.deletingId === `education-${item.id}`}
                        />
                      ) : null
                    }
                  />
                )}
              />
            )}
          </Section>

          <Section
            title="Licenses & certifications"
            icon={Award}
            count={profile.certificates.length}
            onAdd={editable ? actions?.onAddCertificate : undefined}
          >
            {profile.certificates.length === 0 ? (
              <Empty
                icon={Award}
                text="Add RERA, DLD and other credentials to build trust."
                actionLabel={editable ? "Add certificate" : undefined}
                onAction={actions?.onAddCertificate}
                viewerText="No certificates added yet."
                editable={editable}
              />
            ) : (
              <EntryList
                items={profile.certificates}
                noun="certificates"
                render={(item) => {
                  const expired = isPast(item.expiryDate);
                  return (
                    <Entry
                      logo={
                        item.imageUrl ? (
                          <button
                            type="button"
                            onClick={() => openImages([item.imageUrl!], 0, item.name)}
                            className="group relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-border bg-muted"
                            aria-label={`View ${item.name}`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={item.imageUrl}
                              alt=""
                              loading="lazy"
                              className="h-full w-full object-cover transition group-hover:scale-105"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          </button>
                        ) : (
                          <LogoTile name={item.authority || item.name} icon={Award} />
                        )
                      }
                      title={item.name}
                      subtitle={item.authority}
                      meta={certificateDates(item)}
                      location={item.certificateNumber ? `Credential ID ${item.certificateNumber}` : null}
                      badge={expired ? "Expired" : null}
                      badgeTone={expired ? "warn" : "default"}
                      description={item.description}
                      skills={item.skillIds.map(skillName).filter((n): n is string => Boolean(n))}
                      images={[]}
                      footer={
                        item.imageUrl ? (
                          <button
                            type="button"
                            onClick={() => openImages([item.imageUrl!], 0, item.name)}
                            className="mt-2 inline-flex h-8 items-center rounded-full border border-border px-3 text-xs font-semibold text-foreground hover:bg-muted"
                          >
                            Show credential
                          </button>
                        ) : null
                      }
                      actions={
                        editable ? (
                          <RowActions
                            label={item.name}
                            onEdit={() => actions?.onEditCertificate(item)}
                            onDelete={() => actions?.onDeleteCertificate(item.id)}
                            deleting={actions?.deletingId === `certificate-${item.id}`}
                          />
                        ) : null
                      }
                    />
                  );
                }}
              />
            )}
          </Section>
        </>
      ) : null}

      {showSkills ? (
        <Section
          title="Skills"
          icon={Sparkles}
          count={profile.skills.length}
          onAdd={editable ? actions?.onAddSkill : undefined}
        >
          {profile.skills.length === 0 ? (
            <Empty
              icon={Sparkles}
              text="Add skills clients search for, like off-plan sales or leasing."
              actionLabel={editable ? "Add skill" : undefined}
              onAction={actions?.onAddSkill}
              viewerText="No skills added yet."
              editable={editable}
            />
          ) : (
            <div className="space-y-4">
              {topSkills.length > 0 ? (
                <SkillGroup
                  title="Top skills"
                  skills={topSkills}
                  editable={editable}
                  positions={profile.positions}
                  educations={profile.educations}
                  actions={actions}
                />
              ) : null}
              {otherSkills.length > 0 ? (
                <SkillGroup
                  title={topSkills.length > 0 ? "More skills" : null}
                  skills={otherSkills}
                  editable={editable}
                  positions={profile.positions}
                  educations={profile.educations}
                  actions={actions}
                />
              ) : null}
            </div>
          )}
        </Section>
      ) : null}

      <ProfileImageLightbox
        images={viewer?.images ?? []}
        startIndex={viewer?.index ?? null}
        title={viewer?.title}
        onClose={() => setViewer(null)}
      />
    </div>
  );
}

/* ───────────────────────── building blocks ───────────────────────── */

function Section({
  title,
  icon: Icon,
  count,
  children,
  onEdit,
  onAdd,
}: {
  title: string;
  icon: LucideIcon | null;
  count?: number;
  children: React.ReactNode;
  onEdit?: () => void;
  onAdd?: () => void;
}) {
  return (
    <section className="rounded-[var(--radius)] border border-border bg-card p-4 shadow-sm sm:p-5">
      <div className="mb-3.5 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
          {Icon ? <Icon className="h-4 w-4 text-muted-foreground" aria-hidden /> : null}
          {title}
          {count && count > 0 ? (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold tabular-nums text-muted-foreground">
              {count}
            </span>
          ) : null}
        </h2>
        <div className="flex items-center gap-0.5">
          {onAdd ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full"
              onClick={onAdd}
              aria-label={`Add ${title.toLowerCase()}`}
              title={`Add ${title.toLowerCase()}`}
            >
              <Plus className="h-5 w-5" />
            </Button>
          ) : null}
          {onEdit ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full"
              onClick={onEdit}
              aria-label={`Edit ${title.toLowerCase()}`}
              title={`Edit ${title.toLowerCase()}`}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      </div>
      {children}
    </section>
  );
}

function EntryList<T extends { id: number }>({
  items,
  noun,
  render,
}: {
  items: T[];
  noun: string;
  render: (item: T) => React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? items : items.slice(0, PREVIEW_COUNT);
  const hidden = items.length - PREVIEW_COUNT;
  return (
    <>
      <ul className="divide-y divide-border/70">
        {shown.map((item) => (
          <li key={item.id} className="py-4 first:pt-0 last:pb-0">
            {render(item)}
          </li>
        ))}
      </ul>
      {hidden > 0 ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="-mx-4 -mb-4 mt-4 flex w-[calc(100%+2rem)] items-center justify-center gap-1 border-t border-border/70 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground sm:-mx-5 sm:-mb-5 sm:w-[calc(100%+2.5rem)]"
        >
          {expanded ? "Show less" : `Show all ${items.length} ${noun}`}
          <ChevronDown className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")} aria-hidden />
        </button>
      ) : null}
    </>
  );
}

function Entry({
  logo,
  title,
  subtitle,
  meta,
  location,
  badge,
  badgeTone = "default",
  description,
  skills,
  images,
  onOpenImage,
  footer,
  actions,
}: {
  logo: React.ReactNode;
  title: string;
  subtitle?: string | null;
  meta?: string | null;
  location?: string | null;
  badge?: string | null;
  badgeTone?: "default" | "warn";
  description?: string | null;
  skills: string[];
  images: string[];
  onOpenImage?: (index: number) => void;
  footer?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      {logo}
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px] font-semibold leading-snug text-foreground">
              <span className="min-w-0 break-words">{title}</span>
              {badge ? (
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                    badgeTone === "warn"
                      ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                      : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                  )}
                >
                  {badge}
                </span>
              ) : null}
            </p>
            {subtitle ? <p className="text-sm text-foreground/90">{subtitle}</p> : null}
            {meta ? <p className="text-[13px] text-muted-foreground">{meta}</p> : null}
            {location ? (
              <p className="flex items-center gap-1 text-[13px] text-muted-foreground">
                {location.startsWith("Credential") ? null : <MapPin className="h-3 w-3 shrink-0" aria-hidden />}
                <span className="truncate">{location}</span>
              </p>
            ) : null}
          </div>
          {actions}
        </div>

        {description ? (
          <ExpandableText text={description} lines={3} className="mt-2 text-sm leading-relaxed text-foreground/90" />
        ) : null}

        {skills.length > 0 ? (
          <p className="mt-2 flex items-start gap-1.5 text-[13px] text-foreground/80">
            <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
            <span>
              <span className="font-semibold">Skills:</span> {skills.join(" · ")}
            </span>
          </p>
        ) : null}

        {images.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {images.slice(0, 4).map((url, i) => {
              const more = i === 3 && images.length > 4 ? images.length - 4 : 0;
              return (
                <button
                  key={url + i}
                  type="button"
                  onClick={() => onOpenImage?.(i)}
                  className="group relative h-16 w-24 overflow-hidden rounded-lg border border-border bg-muted sm:h-20 sm:w-28"
                  aria-label={`View image ${i + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                  {more ? (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-sm font-semibold text-white">
                      +{more}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        ) : null}
        {footer}
      </div>
    </div>
  );
}

const LOGO_TONES = [
  "bg-sky-500/12 text-sky-700 dark:text-sky-300",
  "bg-violet-500/12 text-violet-700 dark:text-violet-300",
  "bg-amber-500/12 text-amber-700 dark:text-amber-300",
  "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
  "bg-rose-500/12 text-rose-700 dark:text-rose-300",
  "bg-indigo-500/12 text-indigo-700 dark:text-indigo-300",
];

/** Company / school placeholder logo: tinted tile with initials (no logo API). */
function LogoTile({ name, icon: Icon }: { name: string; icon: LucideIcon }) {
  const letters = name
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return (
    <span
      className={cn(
        "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold",
        LOGO_TONES[hash % LOGO_TONES.length]
      )}
      aria-hidden
    >
      {letters || <Icon className="h-5 w-5" />}
    </span>
  );
}

function ExpandableText({
  text,
  lines,
  className,
}: {
  text: string;
  lines: 3 | 4;
  className?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  // Rough threshold: avoid a "see more" for text that fits anyway.
  const long = text.length > (lines === 4 ? 320 : 220) || text.split("\n").length > lines;
  return (
    <div className={className}>
      <p
        className={cn(
          "whitespace-pre-wrap break-words",
          !expanded && long && (lines === 4 ? "line-clamp-4" : "line-clamp-3")
        )}
      >
        {text}
      </p>
      {long ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-1 text-sm font-semibold text-muted-foreground hover:text-foreground hover:underline"
        >
          {expanded ? "Show less" : "…see more"}
        </button>
      ) : null}
    </div>
  );
}

function Empty({
  icon: Icon,
  text,
  viewerText,
  actionLabel,
  onAction,
  editable,
}: {
  icon: LucideIcon;
  text: string;
  viewerText: string;
  actionLabel?: string;
  onAction?: () => void;
  editable: boolean;
}) {
  if (!editable) {
    return <p className="text-sm text-muted-foreground">{viewerText}</p>;
  }
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border px-4 py-6 text-center">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <p className="max-w-xs text-sm text-muted-foreground">{text}</p>
      {actionLabel && onAction ? (
        <Button type="button" variant="outline" size="sm" className="mt-1 rounded-full" onClick={onAction}>
          <Plus className="h-4 w-4" />
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

function RowActions({
  label,
  onEdit,
  onDelete,
  deleting,
}: {
  label: string;
  onEdit: () => void;
  onDelete: () => void;
  deleting?: boolean;
}) {
  return (
    <div className="flex shrink-0 items-center">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
        onClick={onEdit}
        aria-label={`Edit ${label}`}
        title="Edit"
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
            aria-label={`More options for ${label}`}
            disabled={deleting}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          {/* Defer so the menu finishes closing before a dialog opens (Radix focus trap). */}
          <DropdownMenuItem className="gap-2" onSelect={() => window.setTimeout(onEdit, 0)}>
            <Pencil className="h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => window.setTimeout(onDelete, 0)}
            className="gap-2 text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            {deleting ? "Deleting…" : "Delete"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

const LEVEL_ORDER = ["Beginner", "Intermediate", "Advanced", "Expert"];

function SkillGroup({
  title,
  skills,
  editable,
  positions,
  educations,
  actions,
}: {
  title: string | null;
  skills: ProfileSkill[];
  editable: boolean;
  positions: ProfilePosition[];
  educations: ProfileEducation[];
  actions?: ProfileAboutActions;
}) {
  return (
    <div>
      {title ? (
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </p>
      ) : null}
      <ul className="divide-y divide-border/70">
        {skills.map((skill) => {
          const usedIn = [
            ...positions.filter((p) => skill.positionIds.includes(p.id)).map((p) => p.company || p.title),
            ...educations.filter((e) => skill.educationIds.includes(e.id)).map((e) => e.school),
          ];
          const level = skill.proficiencyLevel
            ? LEVEL_ORDER.findIndex((l) => l.toLowerCase() === skill.proficiencyLevel!.toLowerCase())
            : -1;
          return (
            <li key={skill.id} className="flex items-start gap-3 py-2.5 first:pt-0 last:pb-0">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">{skill.name}</p>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                  {level >= 0 ? (
                    <span className="inline-flex items-center gap-1.5">
                      <span className="flex gap-0.5" aria-hidden>
                        {LEVEL_ORDER.map((_, i) => (
                          <span
                            key={i}
                            className={cn("h-1.5 w-2.5 rounded-full", i <= level ? "bg-primary" : "bg-muted-foreground/20")}
                          />
                        ))}
                      </span>
                      {skill.proficiencyLevel}
                    </span>
                  ) : null}
                  {skill.yearsOfExperience != null && skill.yearsOfExperience > 0 ? (
                    <span>
                      {skill.yearsOfExperience} yr{skill.yearsOfExperience === 1 ? "" : "s"}
                    </span>
                  ) : null}
                  {usedIn.length > 0 ? <span className="truncate">Used at {usedIn.join(", ")}</span> : null}
                </div>
              </div>
              {editable ? (
                <RowActions
                  label={skill.name}
                  onEdit={() => actions?.onEditSkill(skill)}
                  onDelete={() => actions?.onDeleteSkill(skill.id)}
                  deleting={actions?.deletingId === `skill-${skill.id}`}
                />
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ───────────────────────── formatting ───────────────────────── */

function parseDate(value: string | null): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isPast(value: string | null): boolean {
  const date = parseDate(value);
  return date ? date.getTime() < Date.now() : false;
}

/** "2 yrs 3 mos" between start and end (or today). */
function durationLabel(start: string | null, end: string | null): string | null {
  const from = parseDate(start);
  if (!from) return null;
  const to = parseDate(end) ?? new Date();
  let months = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth()) + 1;
  if (months <= 0) return null;
  const years = Math.floor(months / 12);
  months %= 12;
  const parts = [
    years ? `${years} yr${years === 1 ? "" : "s"}` : null,
    months ? `${months} mo${months === 1 ? "" : "s"}` : null,
  ].filter(Boolean);
  return parts.join(" ") || null;
}

function monthYear(value: string | null): string | null {
  const date = parseDate(value);
  return date ? date.toLocaleDateString(undefined, { month: "short", year: "numeric" }) : null;
}

function certificateDates(item: ProfileCertificate): string | null {
  const issued = monthYear(item.issueDate);
  const expires = monthYear(item.expiryDate);
  if (issued && expires) return `Issued ${issued} · ${isPast(item.expiryDate) ? "Expired" : "Expires"} ${expires}`;
  if (issued) return `Issued ${issued} · No expiration date`;
  if (expires) return `${isPast(item.expiryDate) ? "Expired" : "Expires"} ${expires}`;
  return null;
}
