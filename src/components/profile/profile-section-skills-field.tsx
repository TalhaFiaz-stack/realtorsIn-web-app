"use client";

import { useMemo, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ProfileSkill } from "@/features/profile/types/profile.types";

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
    for (const part of parts) {
      const exists =
        merged.some((n) => n.toLowerCase() === part.toLowerCase()) ||
        sortedSkills.some((s) => s.name.toLowerCase() === part.toLowerCase());
      if (!exists) merged.push(part);
    }
    onNewSkillNamesChange(merged);
    setNewSkillsText("");
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {sortedSkills.length > 0 ? (
        <div className="max-h-36 space-y-2 overflow-y-auto rounded-lg border border-border p-3">
          {sortedSkills.map((skill) => (
            <label
              key={skill.id}
              className="flex cursor-pointer items-center gap-2 text-sm"
            >
              <Checkbox
                checked={selectedSkillIds.includes(skill.id)}
                onCheckedChange={() => toggleSkill(skill.id)}
              />
              <span>{skill.name}</span>
            </label>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          No skills on your profile yet. Add new skill names below.
        </p>
      )}
      <div className="flex gap-2">
        <Input
          value={newSkillsText}
          onChange={(e) => setNewSkillsText(e.target.value)}
          placeholder="New skills (comma-separated)"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commitNewSkills();
            }
          }}
        />
        <button
          type="button"
          className="shrink-0 rounded-lg border border-border px-3 text-sm font-medium hover:bg-muted"
          onClick={commitNewSkills}
        >
          Add
        </button>
      </div>
      {newSkillNames.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {newSkillNames.map((name) => (
            <span
              key={name}
              className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium"
            >
              {name}
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground"
                aria-label={`Remove ${name}`}
                onClick={() =>
                  onNewSkillNamesChange(
                    newSkillNames.filter((item) => item !== name)
                  )
                }
              >
                ×
              </button>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
