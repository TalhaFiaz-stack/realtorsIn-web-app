"use client";

import { useEffect, useState } from "react";
import { Check, FileText } from "lucide-react";
import {
  CharCount,
  FormField,
  ProfileFormDialog,
} from "@/components/profile/profile-form-dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  mutationErrorMessage,
  useUpdateAbout,
} from "@/features/profile/hooks/use-profile-mutations";
import type { SocialProfile } from "@/features/profile/types/profile.types";
import { cn } from "@/lib/utils";

export function ProfileAboutDialog({
  open,
  onOpenChange,
  profile,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: SocialProfile;
}) {
  const mutation = useUpdateAbout();
  const [aboutText, setAboutText] = useState(profile.aboutText ?? "");
  const [topSkillIds, setTopSkillIds] = useState<number[]>(profile.topSkillIds);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setAboutText(profile.aboutText ?? "");
    setTopSkillIds(profile.topSkillIds);
    setError(null);
  }, [open, profile]);

  function toggleSkill(id: number) {
    setTopSkillIds((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length >= 5) return current;
      return [...current, id];
    });
  }

  return (
    <ProfileFormDialog
      open={open}
      onOpenChange={onOpenChange}
      icon={FileText}
      title="Edit about"
      description="Your story in a few lines: experience, focus areas and what clients can expect."
      error={error}
      saving={mutation.isPending}
      onSave={() => {
        setError(null);
        mutation.mutate(
          {
            aboutId: profile.aboutId,
            aboutText: aboutText.trim(),
            topSkillIds,
          },
          {
            onSuccess: () => onOpenChange(false),
            onError: (err) => setError(mutationErrorMessage(err)),
          }
        );
      }}
    >
      <FormField label="Summary" htmlFor="about-text" hint={<CharCount value={aboutText} max={2600} />}>
        <Textarea
          id="about-text"
          value={aboutText}
          onChange={(e) => setAboutText(e.target.value)}
          maxLength={2600}
          className="min-h-48 leading-relaxed"
          placeholder="e.g. Dubai-based broker with 8 years in off-plan and luxury secondary sales…"
          autoFocus
        />
      </FormField>
      {profile.skills.length > 0 ? (
        <FormField
          label="Top skills"
          hint={`Pick up to 5 · ${topSkillIds.length}/5 selected`}
        >
          <div className="flex flex-wrap gap-1.5">
            {profile.skills.map((skill) => {
              const selected = topSkillIds.includes(skill.id);
              const disabled = !selected && topSkillIds.length >= 5;
              return (
                <button
                  key={skill.id}
                  type="button"
                  aria-pressed={selected}
                  disabled={disabled}
                  onClick={() => toggleSkill(skill.id)}
                  className={cn(
                    "inline-flex h-8 items-center gap-1 rounded-full border px-3 text-[13px] font-medium transition-colors disabled:opacity-40",
                    selected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-foreground/80 hover:bg-muted"
                  )}
                >
                  {selected ? <Check className="h-3.5 w-3.5" aria-hidden /> : null}
                  {skill.name}
                </button>
              );
            })}
          </div>
        </FormField>
      ) : null}
    </ProfileFormDialog>
  );
}
