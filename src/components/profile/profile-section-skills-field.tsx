"use client";

import { useMemo, useState } from "react";
import { Check, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ProfileSkill } from "@/features/profile/types/profile.types";
import { cn } from "@/lib/utils";

/** Pick existing skills as toggle chips, or type new ones (comma separated). */
export function ProfileSectionSkillsField({
  label = "Skills",
  skills,
  selectedSkillIds,
  onSelectedSkillIdsChange,
  newSkillNames,
  onNewSkillNamesChange,
}: {
  label?: string;
  skills: ProfileSkill[];
  selectedSkillIds: number[];
  onSelectedSkillIdsChange: (ids: number[]) => void;
  newSkillNames: string[];
  onNewSkillNamesChange: (names: string[]) => void;
}) {
  const [newSkillsText, setNewSkillsText] = useState("");

  const sortedSkills = useMemo(
    () => [...skills].sort((a, b) => a.name.localeCompare(b.name)),
    [skills]
  );

  function toggleSkill(id: number) {
    onSelectedSkillIdsChange(
      selectedSkillIds.includes(id)
        ? selectedSkillIds.filter((item) => item !== id)
        : [...selectedSkillIds, id]
    );
  }

  function commitNewSkills() {
    const parts = newSkillsText
      .split(",")
      .map((part) => part.trim())
      .filter((part) => part.length >= 2);
    if (parts.length === 0) return;
    const merged = [...newSkillNames];
    const nextSelected = [...selectedSkillIds];
    for (const part of parts) {
      const existing = sortedSkills.find((s) => s.name.toLowerCase() === part.toLowerCase());
      if (existing) {
        if (!nextSelected.includes(existing.id)) nextSelected.push(existing.id);
        continue;
      }
      if (!merged.some((n) => n.toLowerCase() === part.toLowerCase())) merged.push(part);
    }
    onNewSkillNamesChange(merged);
    if (nextSelected.length !== selectedSkillIds.length) onSelectedSkillIdsChange(nextSelected);
    setNewSkillsText("");
  }

  const count = selectedSkillIds.length + newSkillNames.length;

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <Label className="text-[13px] font-medium">{label}</Label>
        {count > 0 ? (
          <span className="text-xs text-muted-foreground">{count} selected</span>
        ) : null}
      </div>

      {sortedSkills.length > 0 || newSkillNames.length > 0 ? (
        <div className="flex max-h-40 flex-wrap gap-1.5 overflow-y-auto">
          {sortedSkills.map((skill) => {
            const active = selectedSkillIds.includes(skill.id);
            return (
              <button
                key={skill.id}
                type="button"
                aria-pressed={active}
                onClick={() => toggleSkill(skill.id)}
                className={cn(
                  "inline-flex h-8 items-center gap-1 rounded-full border px-3 text-[13px] font-medium transition-colors",
                  active
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-foreground/80 hover:bg-muted"
                )}
              >
                {active ? <Check className="h-3.5 w-3.5" aria-hidden /> : null}
                {skill.name}
              </button>
            );
          })}
          {newSkillNames.map((name) => (
            <span
              key={name}
              className="inline-flex h-8 items-center gap-1 rounded-full border border-primary bg-primary/10 pe-1.5 ps-3 text-[13px] font-medium text-primary"
            >
              {name}
              <span className="rounded bg-primary/15 px-1 text-[10px] uppercase">new</span>
              <button
                type="button"
                className="inline-flex h-5 w-5 items-center justify-center rounded-full hover:bg-primary/20"
                aria-label={`Remove ${name}`}
                onClick={() => onNewSkillNamesChange(newSkillNames.filter((item) => item !== name))}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      ) : null}

      <div className="relative">
        <Input
          value={newSkillsText}
          onChange={(e) => setNewSkillsText(e.target.value)}
          placeholder={sortedSkills.length ? "Add another skill, e.g. Negotiation" : "Add skills, e.g. Negotiation, Leasing"}
          className="pe-20"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              commitNewSkills();
            }
          }}
        />
        <button
          type="button"
          disabled={newSkillsText.trim().length < 2}
          className="absolute end-1.5 top-1/2 inline-flex h-7 -translate-y-1/2 items-center gap-1 rounded-full bg-muted px-2.5 text-xs font-semibold text-foreground hover:bg-muted/70 disabled:opacity-40"
          onClick={commitNewSkills}
        >
          <Plus className="h-3.5 w-3.5" aria-hidden />
          Add
        </button>
      </div>
    </div>
  );
}
