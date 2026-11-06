"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
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
    setIssuedDate(initial?.issueDate?.slice(0, 10) || today());
    setExpirationDate(initial?.expiryDate?.slice(0, 10) || "");
    setDescription("");
    setSkillIds(initial?.skillIds ?? []);
    setNewSkills([]);
    setCertificateImage([]);
    setError(null);
  }, [open, initial]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initial ? "Edit certificate" : "Add certificate"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Name *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Issuing organization *</Label>
            <Input
              value={issuingOrganization}
              onChange={(e) => setIssuingOrganization(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Certificate number</Label>
            <Input
              value={certificateNumber}
              onChange={(e) => setCertificateNumber(e.target.value)}
              placeholder="License or credential ID"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Issued date</Label>
            <Input
              type="date"
              value={issuedDate}
              onChange={(e) => setIssuedDate(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Expiration date</Label>
            <Input
              type="date"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
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
            existingUrls={
              initial?.imageUrl ? [initial.imageUrl] : []
            }
            files={certificateImage}
            onFilesChange={setCertificateImage}
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
              !name.trim() ||
              !issuingOrganization.trim()
            }
            onClick={() => {
              setError(null);
              mutation.mutate(
                {
                  id: initial?.id ?? null,
                  name: name.trim(),
                  issuingOrganization: issuingOrganization.trim(),
                  issuedDate,
                  expirationDate: expirationDate || null,
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
            {mutation.isPending ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
