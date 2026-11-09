"use client";

import { useEffect, useState } from "react";
import { GraduationCap } from "lucide-react";
import {
  CharCount,
  FormField,
  FormGrid,
  FormSection,
  FormToggleRow,
  ProfileFormDialog,
} from "@/components/profile/profile-form-dialog";
import { Input } from "@/components/ui/input";
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

  const endBeforeStart =
    !isCurrentlyStudying && Boolean(endDate) && Boolean(startDate) && endDate < startDate;
  const canSave =
    degree.trim().length >= 2 && school.trim().length >= 2 && Boolean(startDate) && !endBeforeStart;

  return (
    <ProfileFormDialog
      open={open}
      onOpenChange={onOpenChange}
      icon={GraduationCap}
      title={initial ? "Edit education" : "Add education"}
      description="Schools, degrees and real estate courses you've completed."
      error={error}
      saving={mutation.isPending}
      canSave={canSave}
      footerStart={<><span className="text-destructive">*</span> Required</>}
      onSave={() => {
        setError(null);
        mutation.mutate(
          {
            id: initial?.id ?? null,
            degree: degree.trim(),
            school: school.trim(),
            fieldOfStudy: fieldOfStudy.trim() || "General",
            startDate,
            endDate: isCurrentlyStudying ? null : endDate || null,
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
      <FormSection title="School">
        <FormField label="School" required htmlFor="edu-school" hint={school && school.trim().length < 2 ? "At least 2 characters." : undefined}>
          <Input
            id="edu-school"
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            placeholder="e.g. Dubai Real Estate Institute"
            autoFocus
          />
        </FormField>
        <FormGrid>
          <FormField label="Degree" required htmlFor="edu-degree">
            <Input
              id="edu-degree"
              value={degree}
              onChange={(e) => setDegree(e.target.value)}
              placeholder="e.g. Bachelor's"
            />
          </FormField>
          <FormField label="Field of study" htmlFor="edu-field">
            <Input
              id="edu-field"
              value={fieldOfStudy}
              onChange={(e) => setFieldOfStudy(e.target.value)}
              placeholder="e.g. Business Administration"
            />
          </FormField>
        </FormGrid>
        <FormField label="Location" htmlFor="edu-location">
          <Input
            id="edu-location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Dubai, UAE"
          />
        </FormField>
      </FormSection>

      <FormSection title="Dates">
        <FormToggleRow
          checked={isCurrentlyStudying}
          onChange={setIsCurrentlyStudying}
          label="I currently study here"
        />
        <FormGrid>
          <FormField label="Start date" required htmlFor="edu-start">
            <Input
              id="edu-start"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </FormField>
          {!isCurrentlyStudying ? (
            <FormField
              label="End date (or expected)"
              htmlFor="edu-end"
              hint={endBeforeStart ? <span className="text-destructive">End date must be after the start date.</span> : undefined}
            >
              <Input
                id="edu-end"
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
        <FormField label="Description" htmlFor="edu-description" hint={<CharCount value={description} max={2000} />}>
          <Textarea
            id="edu-description"
            value={description}
            maxLength={2000}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Activities, honours, coursework…"
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
          hint="Add your diploma, transcript or campus photos."
        />
      </FormSection>
    </ProfileFormDialog>
  );
}
