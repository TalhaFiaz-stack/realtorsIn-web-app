"use client";

import { useEffect, useState } from "react";
import { BriefcaseBusiness, EyeOff, Megaphone, UserSearch } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ProfileFormDialog } from "@/components/profile/profile-form-dialog";
import {
  mutationErrorMessage,
  useUpdateOpenTo,
} from "@/features/profile/hooks/use-profile-mutations";
import type { SocialProfile } from "@/features/profile/types/profile.types";
import { cn } from "@/lib/utils";

type OpenToValue = "hiring" | "open_to_work" | "none";

const OPTIONS: Array<{ value: OpenToValue; title: string; description: string; icon: LucideIcon; tone: string }> = [
  {
    value: "hiring",
    title: "Hiring",
    description: "Show a #HIRING frame — you’re open to candidates.",
    icon: Megaphone,
    tone: "bg-violet-500/12 text-violet-600 dark:text-violet-400",
  },
  {
    value: "open_to_work",
    title: "Open to work",
    description: "Show an #OPENTOWORK frame — you’re looking for new opportunities.",
    icon: UserSearch,
    tone: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
  },
  {
    value: "none",
    title: "Not now",
    description: "Remove the availability frame from your profile.",
    icon: EyeOff,
    tone: "bg-muted text-muted-foreground",
  },
];

export function ProfileOpenToDialog({
  open,
  onOpenChange,
  current,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  current: SocialProfile["openTo"];
}) {
  const mutation = useUpdateOpenTo();
  const [selected, setSelected] = useState<OpenToValue>(current ?? "none");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setSelected(current ?? "none");
      setError(null);
    }
  }, [open, current]);

  return (
    <ProfileFormDialog
      open={open}
      onOpenChange={onOpenChange}
      icon={BriefcaseBusiness}
      title="Open to"
      description="Choose how your availability appears on your profile photo."
      size="sm"
      error={error}
      saving={mutation.isPending}
      canSave={selected !== (current ?? "none")}
      onSave={() => {
        setError(null);
        mutation.mutate(
          { openTo: selected },
          {
            onSuccess: () => onOpenChange(false),
            onError: (err) => setError(mutationErrorMessage(err)),
          }
        );
      }}
    >
      <div role="radiogroup" aria-label="Availability" className="space-y-2">
        {OPTIONS.map((option) => {
          const active = selected === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setSelected(option.value)}
              className={cn(
                "locale-text flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-start transition-colors",
                active ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border hover:bg-muted/50"
              )}
            >
              <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", option.tone)}>
                <option.icon className="h-4 w-4" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-foreground">{option.title}</span>
                <span className="block text-xs text-muted-foreground">{option.description}</span>
              </span>
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                  active ? "border-primary" : "border-muted-foreground/40"
                )}
                aria-hidden
              >
                {active ? <span className="h-2.5 w-2.5 rounded-full bg-primary" /> : null}
              </span>
            </button>
          );
        })}
      </div>
    </ProfileFormDialog>
  );
}
