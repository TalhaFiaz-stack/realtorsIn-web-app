"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatProfileDateRange } from "@/features/profile/lib/map-profile";
import type {
  ProfileCertificate,
  ProfileEducation,
  ProfilePosition,
  ProfileSkill,
  SocialProfile,
} from "@/features/profile/types/profile.types";

export type ProfileAboutPanelVariant = "full" | "about" | "skills" | "resume";

export type ProfileAboutActions = {
  onEditAbout: () => void;
  onAddPosition: () => void;
  onEditPosition: (item: ProfilePosition) => void;
  onDeletePosition: (id: number) => void;
  onAddEducation: () => void;
  onEditEducation: (item: ProfileEducation) => void;
  onDeleteEducation: (id: number) => void;
  onAddSkill: () => void;
  onEditSkill: (item: ProfileSkill) => void;
  onDeleteSkill: (id: number) => void;
  onAddCertificate: () => void;
  onEditCertificate: (item: ProfileCertificate) => void;
  onDeleteCertificate: (id: number) => void;
  deletingId?: string | null;
};

export function ProfileAboutPanel({
  profile,
  actions,
  variant = "full",
}: {
  profile: SocialProfile;
  actions?: ProfileAboutActions;
  variant?: ProfileAboutPanelVariant;
}) {
  const editable = Boolean(profile.isOwn && actions);
  const topSkills = profile.skills.filter((skill) =>
    profile.topSkillIds.includes(skill.id)
  );
  const otherSkills = profile.skills.filter(
    (skill) => !profile.topSkillIds.includes(skill.id)
  );

  const showAbout = variant === "full" || variant === "about";
  const showResume = variant === "full" || variant === "resume";
  const showSkills = variant === "full" || variant === "skills";

  return (
    <div className="space-y-3">
      {showAbout ? (
      <Section
        title="About"
        onEdit={editable ? actions?.onEditAbout : undefined}
      >
        {profile.aboutText ? (
          <div className="space-y-3">
            <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-foreground">
              {profile.aboutText}
            </p>
            {topSkills.length > 0 ? (
              <button
                type="button"
                className="locale-text flex w-full items-start gap-3 rounded-xl border border-border bg-muted/40 px-3 py-3 text-start transition hover:bg-muted/70"
                onClick={editable ? actions?.onEditAbout : undefined}
                disabled={!editable}
              >
                <span className="mt-0.5 text-primary" aria-hidden>
                  ◆
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-foreground">
                    Top skills
                  </span>
                  <span className="block text-sm text-muted-foreground">
                    {topSkills.map((skill) => skill.name).join(", ")}
                  </span>
                </span>
              </button>
            ) : null}
          </div>
        ) : (
          <Empty
            text="No about summary yet."
            actionLabel={editable ? "Add about" : undefined}
            onAction={actions?.onEditAbout}
          />
        )}
      </Section>
      ) : null}

      {showResume ? (
      <>
      <Section
        title="Experience"
        onAdd={editable ? actions?.onAddPosition : undefined}
      >
        {profile.positions.length === 0 ? (
          <Empty
            text="No experience added yet."
            actionLabel={editable ? "Add experience" : undefined}
            onAction={actions?.onAddPosition}
          />
        ) : (
          <ul className="space-y-4">
            {profile.positions.map((item) => (
              <li
                key={item.id}
                className="border-b border-border pb-4 last:border-0 last:pb-0"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">{item.title}</p>
                    {item.company ? (
                      <p className="text-sm text-foreground">{item.company}</p>
                    ) : null}
                    <p className="text-sm text-muted-foreground">
                      {formatProfileDateRange(
                        item.startDate,
                        item.endDate,
                        "Present"
                      )}
                      {item.employmentType ? ` · ${item.employmentType}` : ""}
                      {item.jobType ? ` · ${item.jobType}` : ""}
                    </p>
                    {item.location ? (
                      <p className="text-sm text-muted-foreground">
                        {item.location}
                      </p>
                    ) : null}
                    {item.description ? (
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                        {item.description}
                      </p>
                    ) : null}
                  </div>
                  {editable ? (
                    <RowActions
                      onEdit={() => actions?.onEditPosition(item)}
                      onDelete={() => actions?.onDeletePosition(item.id)}
                      deleting={actions?.deletingId === `position-${item.id}`}
                    />
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section
        title="Education"
        onAdd={editable ? actions?.onAddEducation : undefined}
      >
        {profile.educations.length === 0 ? (
          <Empty
            text="No education added yet."
            actionLabel={editable ? "Add education" : undefined}
            onAction={actions?.onAddEducation}
          />
        ) : (
          <ul className="space-y-4">
            {profile.educations.map((item) => (
              <li
                key={item.id}
                className="border-b border-border pb-4 last:border-0 last:pb-0"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">{item.school}</p>
                    <p className="text-sm text-foreground">
                      {item.degree}
                      {item.fieldOfStudy ? `, ${item.fieldOfStudy}` : ""}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatProfileDateRange(
                        item.startDate,
                        item.endDate,
                        "Present"
                      )}
                    </p>
                    {item.description ? (
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
                        {item.description}
                      </p>
                    ) : null}
                  </div>
                  {editable ? (
                    <RowActions
                      onEdit={() => actions?.onEditEducation(item)}
                      onDelete={() => actions?.onDeleteEducation(item.id)}
                      deleting={actions?.deletingId === `education-${item.id}`}
                    />
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section
        title="Certificates"
        onAdd={editable ? actions?.onAddCertificate : undefined}
      >
        {profile.certificates.length === 0 ? (
          <Empty
            text="No certificates added yet."
            actionLabel={editable ? "Add certificate" : undefined}
            onAction={actions?.onAddCertificate}
          />
        ) : (
          <ul className="space-y-3">
            {profile.certificates.map((item) => (
              <li key={item.id} className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{item.name}</p>
                  {item.authority ? (
                    <p className="text-sm text-muted-foreground">
                      {item.authority}
                    </p>
                  ) : null}
                </div>
                {editable ? (
                  <RowActions
                    onEdit={() => actions?.onEditCertificate(item)}
                    onDelete={() => actions?.onDeleteCertificate(item.id)}
                    deleting={
                      actions?.deletingId === `certificate-${item.id}`
                    }
                  />
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Section>
      </>
      ) : null}

      {showSkills ? (
      <Section
        title={
          profile.skills.length > 1
            ? `Skills (${profile.skills.length})`
            : "Skills"
        }
        onAdd={editable ? actions?.onAddSkill : undefined}
      >
        {profile.skills.length === 0 ? (
          <Empty
            text="No skills added yet."
            actionLabel={editable ? "Add skill" : undefined}
            onAction={actions?.onAddSkill}
          />
        ) : (
          <div className="space-y-4">
            {topSkills.length > 0 ? (
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Top skills
                </p>
                <SkillList
                  skills={topSkills}
                  editable={editable}
                  positions={profile.positions}
                  educations={profile.educations}
                  onEdit={actions?.onEditSkill}
                  onDelete={actions?.onDeleteSkill}
                  deletingId={actions?.deletingId}
                />
              </div>
            ) : null}
            {otherSkills.length > 0 ? (
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {topSkills.length > 0 ? "More skills" : "Skills"}
                </p>
                <SkillList
                  skills={otherSkills}
                  editable={editable}
                  positions={profile.positions}
                  educations={profile.educations}
                  onEdit={actions?.onEditSkill}
                  onDelete={actions?.onDeleteSkill}
                  deletingId={actions?.deletingId}
                />
              </div>
            ) : null}
          </div>
        )}
      </Section>
      ) : null}
    </div>
  );
}

function Section({
  title,
  children,
  onEdit,
  onAdd,
}: {
  title: string;
  children: React.ReactNode;
  onEdit?: () => void;
  onAdd?: () => void;
}) {
  return (
    <section className="rounded-[var(--radius)] border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <div className="flex items-center gap-1">
          {onAdd ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onAdd}
              aria-label={`Add ${title}`}
            >
              <Plus className="h-4 w-4" />
            </Button>
          ) : null}
          {onEdit ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onEdit}
              aria-label={`Edit ${title}`}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      </div>
      {children}
    </section>
  );
}

function Empty({
  text,
  actionLabel,
  onAction,
}: {
  text: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">{text}</p>
      {actionLabel && onAction ? (
        <Button type="button" variant="outline" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

function RowActions({
  onEdit,
  onDelete,
  deleting,
}: {
  onEdit: () => void;
  onDelete: () => void;
  deleting?: boolean;
}) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={onEdit}
        aria-label="Edit"
      >
        <Pencil className="h-3.5 w-3.5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-destructive"
        onClick={onDelete}
        disabled={deleting}
        aria-label="Delete"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

function SkillList({
  skills,
  editable,
  positions,
  educations,
  onEdit,
  onDelete,
  deletingId,
}: {
  skills: ProfileSkill[];
  editable: boolean;
  positions: ProfilePosition[];
  educations: ProfileEducation[];
  onEdit?: (item: ProfileSkill) => void;
  onDelete?: (id: number) => void;
  deletingId?: string | null;
}) {
  return (
    <ul className="space-y-2">
      {skills.map((skill) => {
        const linkedPositions = positions.filter((item) =>
          skill.positionIds.includes(item.id)
        );
        const linkedEducations = educations.filter((item) =>
          skill.educationIds.includes(item.id)
        );
        return (
          <li
            key={skill.id}
            className="rounded-xl border border-border bg-card px-3 py-2.5"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm text-foreground">
                  <span className="font-medium">{skill.name}</span>
                  {skill.proficiencyLevel ? (
                    <span className="text-muted-foreground">
                      {" "}
                      · {skill.proficiencyLevel}
                    </span>
                  ) : null}
                </p>
                {skill.yearsOfExperience != null ? (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {skill.yearsOfExperience} yr
                    {skill.yearsOfExperience === 1 ? "" : "s"} experience
                  </p>
                ) : null}
                {linkedPositions.length > 0 ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Position:{" "}
                    {linkedPositions
                      .map((item) => item.title)
                      .join(", ")}
                  </p>
                ) : null}
                {linkedEducations.length > 0 ? (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Education:{" "}
                    {linkedEducations
                      .map((item) => item.school)
                      .join(", ")}
                  </p>
                ) : null}
              </div>
              {editable ? (
                <RowActions
                  onEdit={() => onEdit?.(skill)}
                  onDelete={() => onDelete?.(skill.id)}
                  deleting={deletingId === `skill-${skill.id}`}
                />
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
