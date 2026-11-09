"use client";

import { useEffect, useState } from "react";
import { BriefcaseBusiness } from "lucide-react";
import {
  CharCount,
  FormChoiceChips,
  FormField,
  FormGrid,
  FormSection,
  FormSelect,
  FormToggleRow,
  ProfileFormDialog,
} from "@/components/profile/profile-form-dialog";
import { Input } from "@/components/ui/input";
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

  const endBeforeStart =
    !isCurrentlyWorking && Boolean(endDate) && Boolean(startDate) && endDate < startDate;
  const canSave =
    Boolean(title.trim()) && Boolean(company.trim()) && Boolean(startDate) && !endBeforeStart;

  return (
    <ProfileFormDialog
      open={open}
      onOpenChange={onOpenChange}
      icon={BriefcaseBusiness}
      title={initial ? "Edit experience" : "Add experience"}
      description="Share the roles that show your real estate track record."
      error={error}
      saving={mutation.isPending}
      canSave={canSave}
      footerStart={<><span className="text-destructive">*</span> Required</>}
      onSave={() => {
        setError(null);
        mutation.mutate(
          {
            id: initial?.id ?? null,
            title: title.trim(),
            company: company.trim(),
            employmentType,
            jobType,
            startDate,
            endDate: isCurrentlyWorking ? null : endDate || null,
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
      <FormSection title="Role">
        <FormField label="Title" required htmlFor="pos-title">
          <Input
            id="pos-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Senior Property Consultant"
            autoFocus
          />
        </FormField>
        <FormField label="Company" required htmlFor="pos-company">
          <Input
            id="pos-company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="e.g. Emaar Properties"
          />
        </FormField>
        <FormGrid>
          <FormField label="Employment type" htmlFor="pos-employment">
            <FormSelect
              id="pos-employment"
              value={employmentType}
              onChange={(v) => setEmploymentType(v as (typeof EMPLOYMENT)[number])}
              options={EMPLOYMENT}
            />
          </FormField>
          <FormField label="Location" htmlFor="pos-location">
            <Input
              id="pos-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Dubai, UAE"
            />
          </FormField>
        </FormGrid>
        <FormField label="Work setup">
          <FormChoiceChips
            value={jobType}
            onChange={setJobType}
            options={JOB_TYPES}
            ariaLabel="Work setup"
          />
        </FormField>
      </FormSection>

      <FormSection title="Dates">
        <FormToggleRow
          checked={isCurrentlyWorking}
          onChange={setIsCurrentlyWorking}
          label="I currently work in this role"
        />
        <FormGrid>
          <FormField label="Start date" required htmlFor="pos-start">
            <Input
              id="pos-start"
              type="date"
              value={startDate}
              max={today()}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </FormField>
          {!isCurrentlyWorking ? (
            <FormField
              label="End date"
              htmlFor="pos-end"
              hint={endBeforeStart ? <span className="text-destructive">End date must be after the start date.</span> : undefined}
            >
              <Input
                id="pos-end"
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </FormField>
          ) : null}
        </FormGrid>
      </FormSection>

      <FormSection title="Details">
        <FormField label="Profile headline" htmlFor="pos-headline" hint="Shown under your name while this is your current role.">
          <Input
            id="pos-headline"
            value={profileHeadline}
            onChange={(e) => setProfileHeadline(e.target.value)}
            placeholder="e.g. Helping families find homes in Dubai Marina"
          />
        </FormField>
        <FormField
          label="Description"
          htmlFor="pos-description"
          hint={<CharCount value={description} max={2000} />}
        >
          <Textarea
            id="pos-description"
            value={description}
            maxLength={2000}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Key responsibilities, deals closed, achievements…"
            className="min-h-24"
          />
        </FormField>
        <ProfileSectionSkillsField
          skills={skills}
          selectedSkillIds={skillIds}
          onSelectedSkillIdsChange={setSkillIds}
          newSkillNames={newSkills}
          onNewSkillNamesChange={setNewSkills}
        />
        <ProfileSectionImagesField
          label="Media"
          existingUrls={initial?.imageUrls ?? []}
          files={imageFiles}
          onFilesChange={setImageFiles}
          hint="Add photos of projects, awards or your team."
        />
      </FormSection>
    </ProfileFormDialog>
  );
}
