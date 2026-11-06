"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSkillsCatalog } from "@/features/jobs/hooks/use-skills-catalog";

export function JobSkillsPicker({
  skillIds,
  customSkills,
  onSkillIdsChange,
  onCustomSkillsChange,
  maxSkills = 8,
}: {
  skillIds: number[];
  customSkills: string[];
  onSkillIdsChange: (ids: number[]) => void;
  onCustomSkillsChange: (names: string[]) => void;
  maxSkills?: number;
}) {
  const catalogQuery = useSkillsCatalog();
  const catalog = catalogQuery.data ?? [];
  const selected = catalog.filter((s) => skillIds.includes(s.id));
  const total = skillIds.length + customSkills.length;
  const canAdd = total < maxSkills;

  function addSkillId(id: string) {
    const num = Number(id);
    if (!Number.isFinite(num) || skillIds.includes(num)) return;
    if (!canAdd) return;
    onSkillIdsChange([...skillIds, num]);
  }

  function addCustom(raw: string) {
    const name = raw.trim();
    if (!name || customSkills.includes(name)) return;
    if (!canAdd) return;
    onCustomSkillsChange([...customSkills, name]);
  }

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-sm">Skills</Label>
        <p className="text-xs text-muted-foreground">
          Add skills from your profile or enter custom labels (up to {maxSkills}
          ).
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {selected.map((skill) => (
          <span
            key={`id-${skill.id}`}
            className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/50 px-2.5 py-1 text-xs font-medium"
          >
            {skill.name}
            <button
              type="button"
              className="rounded-full p-0.5 hover:bg-muted"
              aria-label={`Remove ${skill.name}`}
              onClick={() =>
                onSkillIdsChange(skillIds.filter((id) => id !== skill.id))
              }
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        {customSkills.map((name) => (
          <span
            key={`custom-${name}`}
            className="inline-flex items-center gap-1 rounded-full border border-dashed border-border px-2.5 py-1 text-xs font-medium"
          >
            {name}
            <button
              type="button"
              className="rounded-full p-0.5 hover:bg-muted"
              aria-label={`Remove ${name}`}
              onClick={() =>
                onCustomSkillsChange(customSkills.filter((s) => s !== name))
              }
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>

      {canAdd ? (
        <div className="flex flex-col gap-2 sm:flex-row">
          <Select onValueChange={addSkillId} disabled={catalogQuery.isLoading}>
            <SelectTrigger className="h-10 sm:max-w-xs">
              <SelectValue placeholder="Add from your skills" />
            </SelectTrigger>
            <SelectContent>
              {catalog
                .filter((s) => !skillIds.includes(s.id))
                .map((skill) => (
                  <SelectItem key={skill.id} value={String(skill.id)}>
                    {skill.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <form
            className="flex flex-1 gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const input = e.currentTarget.elements.namedItem(
                "customSkill"
              ) as HTMLInputElement;
              addCustom(input.value);
              input.value = "";
            }}
          >
            <Input
              name="customSkill"
              placeholder="Custom skill"
              className="h-10"
            />
            <Button type="submit" variant="secondary" className="shrink-0">
              Add
            </Button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
