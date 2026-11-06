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
import { Textarea } from "@/components/ui/textarea";
import {
  mutationErrorMessage,
  useUpsertEducation,
} from "@/features/profile/hooks/use-profile-mutations";
import { ProfileSectionImagesField } from "@/components/profile/profile-section-images-field";
import { ProfileSectionSkillsField } from "@/components/profile/profile-section-skills-field";
import type {
  ProfileEducation,
  ProfileSkill,
} from "@/features/profile/types/profile.types";

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function ProfileEducationDialog({
  open,
  onOpenChange,
  initial,
  skills = [],
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: ProfileEducation | null;
  skills?: ProfileSkill[];
}) {
  const mutation = useUpsertEducation();
  const [degree, setDegree] = useState("");
  const [school, setSchool] = useState("");
  const [fieldOfStudy, setFieldOfStudy] = useState("General");
  const [startDate, setStartDate] = useState(today());
  const [endDate, setEndDate] = useState("");
  const [isCurrentlyStudying, setIsCurrentlyStudying] = useState(false);
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [skillIds, setSkillIds] = useState<number[]>([]);
  const [newSkills, setNewSkills] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setDegree(initial?.degree ?? "");
    setSchool(initial?.school ?? "");
    setFieldOfStudy(initial?.fieldOfStudy || "General");
    setStartDate(initial?.startDate?.slice(0, 10) || today());
    setEndDate(initial?.endDate?.slice(0, 10) || "");
    setIsCurrentlyStudying(initial?.isCurrentlyStudying ?? false);
    setLocation(initial?.location ?? "");
    setDescription(initial?.description ?? "");
    setSkillIds(initial?.skillIds ?? []);
    setNewSkills([]);
    setImageFiles([]);
    setError(null);
  }, [open, initial]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initial ? "Edit education" : "Add education"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Field label="School *">
            <Input value={school} onChange={(e) => setSchool(e.target.value)} />
          </Field>
          <Field label="Degree *">
            <Input value={degree} onChange={(e) => setDegree(e.target.value)} />
          </Field>
          <Field label="Field of study">
            <Input
              value={fieldOfStudy}
              onChange={(e) => setFieldOfStudy(e.target.value)}
            />
          </Field>
          <Field label="Start date *">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={isCurrentlyStudying}
              onCheckedChange={(v) => setIsCurrentlyStudying(v === true)}
            />
            I currently study here
          </label>
          {!isCurrentlyStudying ? (
            <Field label="End date">
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </Field>
          ) : null}
          <Field label="Location">
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </Field>
          <Field label="Description">
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Field>
          <ProfileSectionSkillsField
            skills={skills}
            selectedSkillIds={skillIds}
            onSelectedSkillIdsChange={setSkillIds}
            newSkillNames={newSkills}
            onNewSkillNamesChange={setNewSkills}
          />
          <ProfileSectionImagesField
            existingUrls={initial?.imageUrls ?? []}
            files={imageFiles}
            onFilesChange={setImageFiles}
          />
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
            disabled={
              mutation.isPending ||
              degree.trim().length < 2 ||
              school.trim().length < 2 ||
              !startDate
            }
            onClick={() => {
              setError(null);
              mutation.mutate(
                {
                  id: initial?.id ?? null,
                  degree: degree.trim(),
                  school: school.trim(),
                  fieldOfStudy: fieldOfStudy.trim() || "General",
                  startDate,
                  endDate: endDate || null,
                  isCurrentlyStudying,
                  location: location.trim(),
                  description: description.trim(),
                  skillIds,
                  newSkills,
                  imageFiles,
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

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
