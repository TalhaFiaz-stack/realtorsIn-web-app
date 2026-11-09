"use client";

import { useEffect, useState } from "react";
import { Check, Sparkles } from "lucide-react";
import {
  FormField,
  FormSection,
  ProfileFormDialog,
} from "@/components/profile/profile-form-dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  mutationErrorMessage,
  useUpsertSkill,
} from "@/features/profile/hooks/use-profile-mutations";
import type {
  ProfileEducation,
  ProfilePosition,
  ProfileSkill,
} from "@/features/profile/types/profile.types";

const LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"] as const;

export function ProfileSkillDialog({
  open,
  onOpenChange,
  initial,
  positions,
  educations,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: ProfileSkill | null;
  positions: ProfilePosition[];
  educations: ProfileEducation[];
}) {
  const mutation = useUpsertSkill();
  const [skill, setSkill] = useState("");
  const [proficiencyLevel, setProficiencyLevel] = useState<string>("");
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [positionIds, setPositionIds] = useState<number[]>([]);
  const [educationIds, setEducationIds] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setSkill(initial?.name ?? "");
    setProficiencyLevel(initial?.proficiencyLevel ?? "");
    setYearsOfExperience(
      initial?.yearsOfExperience != null
        ? String(initial.yearsOfExperience)
        : ""
    );
    setPositionIds(
      initial?.positionIds?.length
        ? initial.positionIds
        : !initial && positions[0]
          ? [positions[0].id]
          : []
    );
    setEducationIds(
      initial?.educationIds?.length
        ? initial.educationIds
        : !initial && educations[0]
          ? [educations[0].id]
          : []
    );
    setError(null);
  }, [open, initial, positions, educations]);

  function toggleId(
    list: number[],
    id: number,
    setter: (next: number[]) => void
  ) {
    setter(list.includes(id) ? list.filter((item) => item !== id) : [...list, id]);
  }

  const linkChip = (active: boolean) =>
    cn(
      "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-start text-sm transition-colors",
      active ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
    );

  return (
    <ProfileFormDialog
      open={open}
      onOpenChange={onOpenChange}
      icon={Sparkles}
      title={initial ? "Edit skill" : "Add skill"}
      description="Show what you're great at and where you used it."
      error={error}
      saving={mutation.isPending}
      canSave={skill.trim().length >= 2}
      size="sm"
      onSave={() => {
        setError(null);
        const years = yearsOfExperience.trim() ? Number(yearsOfExperience) : null;
        mutation.mutate(
          {
            id: initial?.id ?? null,
            skill: skill.trim(),
            proficiencyLevel: proficiencyLevel
              ? (proficiencyLevel as (typeof LEVELS)[number])
              : null,
            yearsOfExperience: years != null && !Number.isNaN(years) ? years : null,
            positionIds,
            educationIds,
          },
          {
            onSuccess: () => onOpenChange(false),
            onError: (err) => setError(mutationErrorMessage(err)),
          }
        );
      }}
    >
      <FormField label="Skill" required htmlFor="skill-name">
        <Input
          id="skill-name"
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
          placeholder="e.g. Off-plan sales"
          autoFocus
        />
      </FormField>

      <FormField label="Proficiency">
        <div role="radiogroup" aria-label="Proficiency" className="grid grid-cols-4 gap-1.5">
          {LEVELS.map((level, i) => {
            const active = proficiencyLevel === level;
            return (
              <button
                key={level}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setProficiencyLevel(active ? "" : level)}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-xl border px-1 py-2 text-[11px] font-medium transition-colors",
                  active ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground/80 hover:bg-muted"
                )}
              >
                <span className="flex gap-0.5" aria-hidden>
                  {LEVELS.map((_, bar) => (
                    <span
                      key={bar}
                      className={cn(
                        "h-1.5 w-2.5 rounded-full",
                        bar <= i ? (active ? "bg-primary" : "bg-foreground/50") : "bg-muted-foreground/20"
                      )}
                    />
                  ))}
                </span>
                {level}
              </button>
            );
          })}
        </div>
      </FormField>

      <FormField label="Years of experience" htmlFor="skill-years">
        <Input
          id="skill-years"
          type="number"
          inputMode="decimal"
          min={0}
          max={50}
          step={0.5}
          value={yearsOfExperience}
          onChange={(e) => setYearsOfExperience(e.target.value)}
          placeholder="e.g. 3"
          className="max-w-[10rem]"
        />
      </FormField>

      {positions.length > 0 ? (
        <FormSection title="Used in experience">
          <div className="space-y-1.5">
            {positions.map((item) => {
              const active = positionIds.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={active}
                  className={linkChip(active)}
                  onClick={() => toggleId(positionIds, item.id, setPositionIds)}
                >
                  <SelectDot active={active} />
                  <span className="min-w-0 flex-1 truncate">
                    <span className="font-medium">{item.title}</span>
                    {item.company ? <span className="text-muted-foreground"> · {item.company}</span> : null}
                  </span>
                </button>
              );
            })}
          </div>
        </FormSection>
      ) : null}

      {educations.length > 0 ? (
        <FormSection title="Used in education">
          <div className="space-y-1.5">
            {educations.map((item) => {
              const active = educationIds.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={active}
                  className={linkChip(active)}
                  onClick={() => toggleId(educationIds, item.id, setEducationIds)}
                >
                  <SelectDot active={active} />
                  <span className="min-w-0 flex-1 truncate">
                    <span className="font-medium">{item.school}</span>
                    <span className="text-muted-foreground"> · {item.degree}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </FormSection>
      ) : null}
    </ProfileFormDialog>
  );
}

function SelectDot({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
        active ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40"
      )}
      aria-hidden
    >
      {active ? <Check className="h-3.5 w-3.5" /> : null}
    </span>
  );
}
