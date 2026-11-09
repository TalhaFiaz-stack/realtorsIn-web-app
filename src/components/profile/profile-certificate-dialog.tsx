"use client";

import { useEffect, useState } from "react";
import { Award } from "lucide-react";
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
  useUpsertCertificate,
} from "@/features/profile/hooks/use-profile-mutations";
import { ProfileSectionImagesField } from "@/components/profile/profile-section-images-field";
import { ProfileSectionSkillsField } from "@/components/profile/profile-section-skills-field";
import type {
  ProfileCertificate,
  ProfileSkill,
} from "@/features/profile/types/profile.types";

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function ProfileCertificateDialog({
  open,
  onOpenChange,
  initial,
  skills = [],
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: ProfileCertificate | null;
  skills?: ProfileSkill[];
}) {
  const mutation = useUpsertCertificate();
  const [name, setName] = useState("");
  const [issuingOrganization, setIssuingOrganization] = useState("");
  const [issuedDate, setIssuedDate] = useState(today());
  const [expirationDate, setExpirationDate] = useState("");
  const [noExpiry, setNoExpiry] = useState(true);
  const [certificateNumber, setCertificateNumber] = useState("");
  const [description, setDescription] = useState("");
  const [skillIds, setSkillIds] = useState<number[]>([]);
  const [newSkills, setNewSkills] = useState<string[]>([]);
  const [certificateImage, setCertificateImage] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? "");
    setIssuingOrganization(initial?.authority ?? "");
    setCertificateNumber(initial?.certificateNumber ?? "");
    setIssuedDate(initial ? initial.issueDate?.slice(0, 10) ?? "" : today());
    setExpirationDate(initial?.expiryDate?.slice(0, 10) || "");
    setNoExpiry(initial ? !initial.expiryDate : true);
    setDescription(initial?.description ?? "");
    setSkillIds(initial?.skillIds ?? []);
    setNewSkills([]);
    setCertificateImage([]);
    setError(null);
  }, [open, initial]);

  const expiresBeforeIssue =
    !noExpiry && Boolean(expirationDate) && Boolean(issuedDate) && expirationDate < issuedDate;
  const canSave = Boolean(name.trim()) && Boolean(issuingOrganization.trim()) && !expiresBeforeIssue;

  return (
    <ProfileFormDialog
      open={open}
      onOpenChange={onOpenChange}
      icon={Award}
      title={initial ? "Edit license or certificate" : "Add license or certificate"}
      description="RERA, DLD and other credentials that build trust with clients."
      error={error}
      saving={mutation.isPending}
      canSave={canSave}
      footerStart={<><span className="text-destructive">*</span> Required</>}
      onSave={() => {
        setError(null);
        mutation.mutate(
          {
            id: initial?.id ?? null,
            name: name.trim(),
            issuingOrganization: issuingOrganization.trim(),
            issuedDate,
            expirationDate: noExpiry ? null : expirationDate || null,
            description: description.trim(),
            certificateNumber: certificateNumber.trim(),
            skillIds,
            newSkills,
            certificateImage: certificateImage[0] ?? null,
          },
          {
            onSuccess: () => onOpenChange(false),
            onError: (err) => setError(mutationErrorMessage(err)),
          }
        );
      }}
    >
      <FormSection title="Credential">
        <FormField label="Name" required htmlFor="cert-name">
          <Input
            id="cert-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. RERA Certified Broker"
            autoFocus
          />
        </FormField>
        <FormGrid>
          <FormField label="Issuing organization" required htmlFor="cert-org">
            <Input
              id="cert-org"
              value={issuingOrganization}
              onChange={(e) => setIssuingOrganization(e.target.value)}
              placeholder="e.g. Dubai Land Department"
            />
          </FormField>
          <FormField label="Credential ID" htmlFor="cert-number">
            <Input
              id="cert-number"
              value={certificateNumber}
              onChange={(e) => setCertificateNumber(e.target.value)}
              placeholder="License or credential number"
            />
          </FormField>
        </FormGrid>
      </FormSection>

      <FormSection title="Validity">
        <FormToggleRow
          checked={noExpiry}
          onChange={setNoExpiry}
          label="This credential does not expire"
        />
        <FormGrid>
          <FormField label="Issue date" htmlFor="cert-issued">
            <Input
              id="cert-issued"
              type="date"
              value={issuedDate}
              max={today()}
              onChange={(e) => setIssuedDate(e.target.value)}
            />
          </FormField>
          {!noExpiry ? (
            <FormField
              label="Expiration date"
              htmlFor="cert-expiry"
              hint={expiresBeforeIssue ? <span className="text-destructive">Expiration must be after the issue date.</span> : undefined}
            >
              <Input
                id="cert-expiry"
                type="date"
                value={expirationDate}
                min={issuedDate || undefined}
                onChange={(e) => setExpirationDate(e.target.value)}
              />
            </FormField>
          ) : null}
        </FormGrid>
      </FormSection>

      <FormSection title="Details">
        <FormField label="Description" htmlFor="cert-description" hint={<CharCount value={description} max={1000} />}>
          <Textarea
            id="cert-description"
            value={description}
            maxLength={1000}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What this credential covers"
            className="min-h-20"
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
          label="Certificate image"
          maxFiles={1}
          existingUrls={initial?.imageUrl ? [initial.imageUrl] : []}
          files={certificateImage}
          onFilesChange={setCertificateImage}
          hint="A clear photo or scan of the certificate."
        />
      </FormSection>
    </ProfileFormDialog>
  );
}
