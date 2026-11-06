"use client";

import { useEffect, useState } from "react";
import {
  IntroAddLink,
  IntroChipToggle,
  IntroField,
  IntroPhoneRow,
  IntroSelect,
} from "@/components/profile/profile-edit-intro-fields";
import { ProfileEducationDialog } from "@/components/profile/profile-education-dialog";
import { ProfilePositionDialog } from "@/components/profile/profile-position-dialog";
import { toggleListItem } from "@/features/profile/lib/edit-intro.utils";
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
import { useEditIntroForm } from "@/features/profile/hooks/use-edit-intro-form";
import {
  mutationErrorMessage,
  useUpdateIntro,
  useUpdateSocialPic,
} from "@/features/profile/hooks/use-profile-mutations";
import type { SocialProfile } from "@/features/profile/types/profile.types";
import {
  PROFILE_OPERATING_EMIRATES,
  PROFILE_PROPERTY_TYPES,
  PROFILE_USER_ROLES,
} from "@/features/profile/validators/profile.validators";

const ROLE_OPTIONS = PROFILE_USER_ROLES.filter((role) => role !== "CEO");

export function ProfileEditIntroDialog({
  open,
  onOpenChange,
  profile,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: SocialProfile;
}) {
  const mutation = useUpdateIntro();
  const reraPicMutation = useUpdateSocialPic();
  const form = useEditIntroForm(open, profile);
  const [error, setError] = useState<string | null>(null);
  const [nested, setNested] = useState<"position" | "education" | null>(null);
  const [reraImageFile, setReraImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (!open) setReraImageFile(null);
  }, [open]);

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit intro</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">
              Personal information
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <IntroField label="First name *">
                <Input
                  value={form.name}
                  onChange={(e) => form.setName(e.target.value)}
                />
              </IntroField>
              <IntroField label="Last name *">
                <Input
                  value={form.lastName}
                  onChange={(e) => form.setLastName(e.target.value)}
                />
              </IntroField>
            </div>
            <IntroField label="Username *">
              <Input
                value={form.userName}
                onChange={(e) => form.setUserName(e.target.value)}
                placeholder="username"
              />
            </IntroField>
            <IntroField label="Email *">
              <Input
                type="email"
                value={form.email}
                onChange={(e) => form.onEmailChange(e.target.value)}
                placeholder="your.email@example.com"
              />
            </IntroField>
            <IntroField label="Phone number *">
              <IntroPhoneRow
                dialCode={form.phoneDialCode}
                countryCode={form.phoneCountryCode}
                phone={form.phone}
                onDialCodeChange={form.setPhoneDialCode}
                onCountryCodeChange={form.setPhoneCountryCode}
                onPhoneChange={form.setPhone}
              />
            </IntroField>
            <IntroField label="Location *">
              <Input
                value={form.location}
                onChange={(e) => form.setLocation(e.target.value)}
                placeholder="City, country"
              />
            </IntroField>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">
              Professional details
            </h3>
            <IntroField label="Company name *">
              <Input
                value={form.company}
                onChange={(e) => form.setCompany(e.target.value)}
                placeholder="Your company name"
              />
            </IntroField>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={form.showCompany}
                onCheckedChange={(v) => form.setShowCompany(v === true)}
              />
              Show current company in my intro
            </label>
            <IntroField label="Role *">
              <IntroSelect
                value={form.userRole}
                onChange={form.setUserRole}
                placeholder="Select your role"
                options={ROLE_OPTIONS.map((role) => ({
                  value: role,
                  label: role === "Ceo" ? "CEO" : role,
                }))}
              />
            </IntroField>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={form.showRole}
                onCheckedChange={(v) => form.setShowRole(v === true)}
              />
              Show current role in my intro
            </label>
            <IntroField label="Current position">
              <IntroSelect
                value={form.positionId}
                onChange={form.setPositionId}
                placeholder="Select your current position"
                options={profile.positions.map((item) => ({
                  value: String(item.id),
                  label: item.company
                    ? `${item.title} · ${item.company}`
                    : item.title,
                }))}
              />
            </IntroField>
            <IntroAddLink
              label="Add new position"
              onClick={() => setNested("position")}
            />
            <IntroField label="Education">
              <IntroSelect
                value={form.educationId}
                onChange={form.setEducationId}
                placeholder="Select your education"
                options={profile.educations.map((item) => ({
                  value: String(item.id),
                  label: item.degree
                    ? `${item.school} · ${item.degree}`
                    : item.school,
                }))}
              />
            </IntroField>
            <IntroAddLink
              label="Add new education"
              onClick={() => setNested("education")}
            />
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">
              Description
            </h3>
            <IntroField label="Tell us about yourself (optional)">
              <Textarea
                value={form.description}
                onChange={(e) => form.setDescription(e.target.value)}
                maxLength={500}
                placeholder="Enter description here..."
              />
            </IntroField>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">
              Documents &amp; link
            </h3>
            <IntroField label="Social profile link">
              <Input
                value={form.socialProfileLinks}
                onChange={(e) => form.setSocialProfileLinks(e.target.value)}
                placeholder="Instagram, Facebook, LinkedIn URL..."
              />
            </IntroField>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">
              License &amp; practice
            </h3>
            <IntroField label="RERA registration number (BRN)">
              <Input
                value={form.reraNumber}
                onChange={(e) => form.setReraNumber(e.target.value)}
                placeholder="BRN-31847-2019"
              />
            </IntroField>
            <IntroField label="RERA certificate (image)">
              <div className="space-y-2">
                {profile.reraImageUrl && !reraImageFile ? (
                  <div className="overflow-hidden rounded-lg border border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={profile.reraImageUrl}
                      alt="Current RERA certificate"
                      className="max-h-40 w-full object-contain bg-muted"
                    />
                  </div>
                ) : null}
                {reraImageFile ? (
                  <p className="text-xs text-muted-foreground">
                    Selected: {reraImageFile.name}
                  </p>
                ) : null}
                <Input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    setReraImageFile(file);
                  }}
                />
              </div>
            </IntroField>
            <IntroField label="Agency / developer name">
              <Input
                value={form.agencyName}
                onChange={(e) => form.setAgencyName(e.target.value)}
                placeholder="Emaar Properties"
              />
            </IntroField>
            <IntroField label="ORN (office registration no.)">
              <Input
                value={form.ornNumber}
                onChange={(e) => form.setOrnNumber(e.target.value)}
                placeholder="12447"
              />
            </IntroField>
            <div className="space-y-2">
              <Label>Operating emirates</Label>
              <div className="flex flex-wrap gap-2">
                {PROFILE_OPERATING_EMIRATES.map((emirate) => (
                  <IntroChipToggle
                    key={emirate}
                    label={emirate}
                    selected={form.cities.includes(emirate)}
                    onToggle={() =>
                      form.setCities((prev) => toggleListItem(prev, emirate))
                    }
                  />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Property types</Label>
              <div className="flex flex-wrap gap-2">
                {PROFILE_PROPERTY_TYPES.map((type) => (
                  <IntroChipToggle
                    key={type}
                    label={type}
                    selected={form.propertyTypes.includes(type)}
                    onToggle={() =>
                      form.setPropertyTypes((prev) =>
                        toggleListItem(prev, type)
                      )
                    }
                  />
                ))}
              </div>
            </div>
          </section>
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
              reraPicMutation.isPending ||
              !form.canSave
            }
            onClick={() => {
              setError(null);
              mutation.mutate(form.toInput(), {
                onSuccess: () => {
                  if (!reraImageFile) {
                    onOpenChange(false);
                    return;
                  }
                  reraPicMutation.mutate(
                    {
                      socialProfileId: profile.id,
                      file: reraImageFile,
                      kind: "rera",
                    },
                    {
                      onSuccess: () => onOpenChange(false),
                      onError: (err) =>
                        setError(mutationErrorMessage(err)),
                    }
                  );
                },
                onError: (err) => setError(mutationErrorMessage(err)),
              });
            }}
          >
            {mutation.isPending || reraPicMutation.isPending
              ? "Saving…"
              : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <ProfilePositionDialog
      open={nested === "position"}
      onOpenChange={(next) => {
        if (!next) setNested(null);
      }}
      initial={null}
      skills={profile.skills}
    />
    <ProfileEducationDialog
      open={nested === "education"}
      onOpenChange={(next) => {
        if (!next) setNested(null);
      }}
      initial={null}
      skills={profile.skills}
    />
    </>
  );
}
