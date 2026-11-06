"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit skill" : "Add skill"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Skill *</Label>
            <Input
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              placeholder="Enter skill name"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Proficiency level</Label>
            <select
              className="flex h-10 w-full rounded-lg border border-input bg-card px-3 text-sm"
              value={proficiencyLevel}
              onChange={(e) => setProficiencyLevel(e.target.value)}
            >
              <option value="">Choose proficiency level</option>
              {LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label>Years of experience</Label>
            <Input
              type="number"
              min={0}
              max={50}
              step={0.5}
              value={yearsOfExperience}
              onChange={(e) => setYearsOfExperience(e.target.value)}
              placeholder="e.g. 3"
            />
          </div>

          {positions.length > 0 ? (
            <div className="space-y-2">
              <Label>Link to experience</Label>
              <div className="space-y-2 rounded-xl border border-border p-3">
                {positions.map((item) => (
                  <label
                    key={item.id}
                    className="flex cursor-pointer items-start gap-2 text-sm"
                  >
                    <Checkbox
                      checked={positionIds.includes(item.id)}
                      onCheckedChange={() =>
                        toggleId(positionIds, item.id, setPositionIds)
                      }
                    />
                    <span>
                      <span className="font-medium">{item.title}</span>
                      {item.company ? (
                        <span className="text-muted-foreground">
                          {" "}
                          at {item.company}
                        </span>
                      ) : null}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ) : null}

          {educations.length > 0 ? (
            <div className="space-y-2">
              <Label>Link to education</Label>
              <div className="space-y-2 rounded-xl border border-border p-3">
                {educations.map((item) => (
                  <label
                    key={item.id}
                    className="flex cursor-pointer items-start gap-2 text-sm"
                  >
                    <Checkbox
                      checked={educationIds.includes(item.id)}
                      onCheckedChange={() =>
                        toggleId(educationIds, item.id, setEducationIds)
                      }
                    />
                    <span>
                      <span className="font-medium">{item.school}</span>
                      <span className="text-muted-foreground">
                        {" "}
                        · {item.degree}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ) : null}
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={mutation.isPending || skill.trim().length < 2}
            onClick={() => {
              setError(null);
              const years = yearsOfExperience.trim()
                ? Number(yearsOfExperience)
                : null;
              mutation.mutate(
                {
                  id: initial?.id ?? null,
                  skill: skill.trim(),
                  proficiencyLevel: proficiencyLevel
                    ? (proficiencyLevel as (typeof LEVELS)[number])
                    : null,
                  yearsOfExperience:
                    years != null && !Number.isNaN(years) ? years : null,
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
            {mutation.isPending ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
