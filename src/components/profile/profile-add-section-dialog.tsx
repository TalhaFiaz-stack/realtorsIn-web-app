"use client";

import { Award, BriefcaseBusiness, ChevronRight, GraduationCap, LayoutList, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ProfileFormDialog } from "@/components/profile/profile-form-dialog";

export type ProfileAddSectionTarget =
  | "position"
  | "education"
  | "skill"
  | "certificate";

const ITEMS: Array<{
  id: ProfileAddSectionTarget;
  title: string;
  description: string;
  icon: LucideIcon;
  tone: string;
}> = [
  {
    id: "position",
    title: "Experience",
    description: "Roles, agencies and your current position",
    icon: BriefcaseBusiness,
    tone: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  },
  {
    id: "education",
    title: "Education",
    description: "Schools, degrees and courses",
    icon: GraduationCap,
    tone: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  },
  {
    id: "certificate",
    title: "License & certification",
    description: "RERA, DLD and other credentials",
    icon: Award,
    tone: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  {
    id: "skill",
    title: "Skill",
    description: "Professional skills clients search for",
    icon: Sparkles,
    tone: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
];

export function ProfileAddSectionDialog({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (target: ProfileAddSectionTarget) => void;
}) {
  return (
    <ProfileFormDialog
      open={open}
      onOpenChange={onOpenChange}
      icon={LayoutList}
      title="Add to profile"
      description="Complete profiles get more views and connection requests."
      size="sm"
    >
      <div className="-mx-1 space-y-1">
        {ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            className="locale-text group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-start transition-colors hover:bg-muted/60"
            onClick={() => {
              onOpenChange(false);
              onSelect(item.id);
            }}
          >
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.tone}`}>
              <item.icon className="h-5 w-5" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-foreground">{item.title}</span>
              <span className="block text-xs text-muted-foreground">{item.description}</span>
            </span>
            <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden />
          </button>
        ))}
      </div>
    </ProfileFormDialog>
  );
}
