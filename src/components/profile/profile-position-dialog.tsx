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
  useUpsertPosition,
} from "@/features/profile/hooks/use-profile-mutations";
import { ProfileSectionImagesField } from "@/components/profile/profile-section-images-field";
import { ProfileSectionSkillsField } from "@/components/profile/profile-section-skills-field";
import type {
  ProfilePosition,
  ProfileSkill,
} from "@/features/profile/types/profile.types";

const EMPLOYMENT = [
  "Full-time",
  "Part-time",
  "Contract",
  "Freelance",
  "Internship",
  "Temporary",
  "Volunteer",
] as const;

const JOB_TYPES = ["Remote", "On-site", "Hybrid", "Flexible"] as const;

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function ProfilePositionDialog({
  open,
  onOpenChange,
  initial,
  skills = [],
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: ProfilePosition | null;
  skills?: ProfileSkill[];
}) {
  const mutation = useUpsertPosition();
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [employmentType, setEmploymentType] =
    useState<(typeof EMPLOYMENT)[number]>("Full-time");
  const [jobType, setJobType] = useState<(typeof JOB_TYPES)[number]>("On-site");
  const [startDate, setStartDate] = useState(today());
  const [endDate, setEndDate] = useState("");
  const [isCurrentlyWorking, setIsCurrentlyWorking] = useState(true);
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [profileHeadline, setProfileHeadline] = useState("");
  const [skillIds, setSkillIds] = useState<number[]>([]);
  const [newSkills, setNewSkills] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setTitle(initial?.title ?? "");
    setCompany(initial?.company ?? "");
    setEmploymentType(
      (initial?.employmentType as (typeof EMPLOYMENT)[number]) || "Full-time"
    );
    setJobType((initial?.jobType as (typeof JOB_TYPES)[number]) || "On-site");
    setStartDate(initial?.startDate?.slice(0, 10) || today());
    setEndDate(initial?.endDate?.slice(0, 10) || "");
    setIsCurrentlyWorking(initial?.isCurrentlyWorking ?? true);
    setLocation(initial?.location ?? "");
    setDescription(initial?.description ?? "");
    setProfileHeadline(initial?.profileHeadline ?? "");
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
            {initial ? "Edit experience" : "Add experience"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Field label="Title *">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <Field label="Company *">
            <Input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </Field>
          <Field label="Employment type">
            <select
              className="flex h-10 w-full rounded-lg border border-input bg-card px-3 text-sm"
              value={employmentType}
              onChange={(e) =>
                setEmploymentType(e.target.value as (typeof EMPLOYMENT)[number])
              }
            >
              {EMPLOYMENT.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Job type">
            <select
              className="flex h-10 w-full rounded-lg border border-input bg-card px-3 text-sm"
              value={jobType}
              onChange={(e) =>
                setJobType(e.target.value as (typeof JOB_TYPES)[number])
              }
            >
              {JOB_TYPES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
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
              checked={isCurrentlyWorking}
              onCheckedChange={(v) => setIsCurrentlyWorking(v === true)}
            />
            I currently work here
          </label>
          {!isCurrentlyWorking ? (
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
          <Field label="Profile headline">
            <Input
              value={profileHeadline}
              onChange={(e) => setProfileHeadline(e.target.value)}
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
              mutation.isPending || !title.trim() || !company.trim() || !startDate
            }
            onClick={() => {
              setError(null);
              mutation.mutate(
                {
                  id: initial?.id ?? null,
                  title: title.trim(),
                  company: company.trim(),
                  employmentType,
                  jobType,
                  startDate,
                  endDate: endDate || null,
                  isCurrentlyWorking,
                  location: location.trim(),
                  description: description.trim(),
                  profileHeadline: profileHeadline.trim(),
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
