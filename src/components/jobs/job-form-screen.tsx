"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShellBackLink } from "@/components/navigation/shell-back-link";
import { ShellBackRow } from "@/components/navigation/shell-back-row";
import { ImagePlus, X } from "lucide-react";
import { JobSkillsPicker } from "@/components/jobs/job-skills-picker";
import { JobsListGridShimmer } from "@/components/jobs/job-shimmers";
import { ErrorState } from "@/components/states/error-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  EMPLOYMENT_TYPE_OPTIONS,
  EXPERIENCE_LEVEL_OPTIONS,
  JOB_TYPE_OPTIONS,
  MAX_JOB_IMAGES,
  SALARY_CURRENCY_OPTIONS,
} from "@/features/jobs/constants/jobs.constants";
import { useJobMutations } from "@/features/jobs/hooks/use-job-mutations";
import { jobsErrorMessage, useJobDetail } from "@/features/jobs/hooks/use-jobs";
import { useSkillsCatalog } from "@/features/jobs/hooks/use-skills-catalog";
import { buildJobFormData } from "@/features/jobs/lib/build-job-form-data";
import type { JobFormImage, JobFormValues } from "@/features/jobs/types/job-form.types";
import { RemoteImg } from "@/components/shared/remote-img";
import { showAppToast } from "@/lib/toast/app-toast";

const EMPTY: JobFormValues = {
  title: "",
  description: "",
  company: "",
  location: "",
  latLng: "",
  employmentType: "Full-time",
  jobType: "On-site",
  experienceLevel: "",
  salaryMin: "",
  salaryMax: "",
  salaryCurrency: "AED",
  requirements: "",
  benefits: "",
  applicationEmail: "",
  applicationUrl: "",
  status: "active",
  skillIds: [],
  customSkills: [],
};

function imagesFromJob(
  job: NonNullable<ReturnType<typeof useJobDetail>["data"]>
): JobFormImage[] {
  return job.images.map((img, i) => ({
    key: `remote-${i}`,
    url: img.url,
    isLocal: false,
  }));
}

function hydrateSkills(
  job: NonNullable<ReturnType<typeof useJobDetail>["data"]>,
  catalog: { id: number; name: string }[]
) {
  const skillIds: number[] = [];
  const customSkills: string[] = [];
  const byName = new Map(
    catalog.map((s) => [s.name.toLowerCase(), s.id])
  );
  job.skills.forEach((label) => {
    const id = byName.get(label.toLowerCase());
    if (id != null) skillIds.push(id);
    else customSkills.push(label);
  });
  return { skillIds, customSkills };
}

export function JobFormScreen({ jobId }: { jobId?: number }) {
  const router = useRouter();
  const isEdit = Boolean(jobId);
  const detailQuery = useJobDetail(jobId ?? 0);
  const catalogQuery = useSkillsCatalog();
  const { create, update } = useJobMutations(jobId);

  const [values, setValues] = useState<JobFormValues>(EMPTY);
  const [images, setImages] = useState<JobFormImage[]>([]);

  const catalog = catalogQuery.data ?? [];

  const initial = useMemo(() => {
    const job = detailQuery.data;
    if (!job) return EMPTY;
    const skills = hydrateSkills(job, catalog);
    return {
      ...EMPTY,
      title: job.title,
      description: job.description,
      company: job.company ?? "",
      location: job.location,
      employmentType: job.employmentType,
      jobType: job.jobType,
      experienceLevel: job.experienceLevel,
      salaryMin: job.salaryMin != null ? String(job.salaryMin) : "",
      salaryMax: job.salaryMax != null ? String(job.salaryMax) : "",
      salaryCurrency: job.salaryCurrency,
      requirements: job.requirements,
      benefits: job.benefits,
      applicationEmail: job.applicationEmail,
      applicationUrl: job.applicationUrl,
      status: job.status,
      skillIds: skills.skillIds,
      customSkills: skills.customSkills,
    };
  }, [catalog, detailQuery.data]);

  useEffect(() => {
    if (!isEdit || !detailQuery.data) return;
    setValues(initial);
    setImages(imagesFromJob(detailQuery.data));
  }, [isEdit, detailQuery.data, initial]);

  function setField<K extends keyof JobFormValues>(
    key: K,
    value: JobFormValues[K]
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function onPickFiles(files: FileList | null) {
    if (!files?.length) return;
    const next: JobFormImage[] = [];
    Array.from(files).forEach((file, i) => {
      if (images.length + next.length >= MAX_JOB_IMAGES) return;
      next.push({
        key: `local-${Date.now()}-${i}`,
        isLocal: true,
        file,
        url: URL.createObjectURL(file),
      });
    });
    setImages((prev) => [...prev, ...next].slice(0, MAX_JOB_IMAGES));
  }

  function removeImage(key: string) {
    setImages((prev) => prev.filter((img) => img.key !== key));
  }

  async function submit() {
    const needsLocation = values.jobType !== "Remote";
    if (!values.title.trim()) {
      showAppToast.error("Job title is required");
      return;
    }
    if (!values.description.trim()) {
      showAppToast.error("Description is required");
      return;
    }
    if (needsLocation && !values.location.trim()) {
      showAppToast.error("Job location is required for on-site roles");
      return;
    }

    const form = buildJobFormData(
      {
        title: values.title.trim(),
        description: values.description.trim(),
        company: values.company.trim() || undefined,
        location: values.location.trim() || undefined,
        lat_lng: values.latLng.trim() || undefined,
        employment_type: values.employmentType,
        job_type: values.jobType,
        experience_level: values.experienceLevel || undefined,
        salary_min: values.salaryMin || undefined,
        salary_max: values.salaryMax || undefined,
        salary_currency: values.salaryCurrency,
        requirements: values.requirements.trim() || undefined,
        benefits: values.benefits.trim() || undefined,
        application_email: values.applicationEmail.trim() || undefined,
        application_url: values.applicationUrl.trim() || undefined,
        status: values.status || "active",
        skills_ids: values.skillIds,
        new_skills: values.customSkills,
      },
      images,
      isEdit && jobId ? { jobId } : undefined
    );

    try {
      if (isEdit && jobId) {
        const res = await update.mutateAsync(form);
        showAppToast.success("Job updated");
        router.push(`/jobs/${res.job.id}`);
      } else {
        const res = await create.mutateAsync(form);
        showAppToast.success("Job posted");
        router.push(`/jobs/${res.job.id}`);
      }
    } catch (error) {
      showAppToast.fromError(error, "Could not save job");
    }
  }

  const pending = create.isPending || update.isPending;

  if (isEdit && detailQuery.isLoading) {
    return (
      <div className="w-full max-w-2xl pb-10">
        <JobsListGridShimmer count={2} />
      </div>
    );
  }

  if (isEdit && (detailQuery.isError || !detailQuery.data)) {
    return (
      <div className="w-full max-w-2xl pb-10">
        <ErrorState
          title="Could not load job"
          description={jobsErrorMessage(detailQuery.error)}
          onRetry={() => void detailQuery.refetch()}
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl space-y-6 pb-12">
      <ShellBackRow>
        <ShellBackLink
          href={isEdit && jobId ? `/jobs/${jobId}` : "/jobs"}
          label={isEdit ? "Job" : "Jobs"}
        />
      </ShellBackRow>

      <header className="text-start">
        <h1 className="locale-text text-xl font-semibold tracking-tight">
          {isEdit ? "Edit job post" : "Create job post"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Broker card verification is required to publish jobs (same as mobile).
        </p>
      </header>

      <div className="space-y-4 rounded-xl border border-border/80 bg-card p-4 shadow-sm">
        <div className="space-y-2">
          <Label htmlFor="job-title">Job title *</Label>
          <Input
            id="job-title"
            value={values.title}
            onChange={(e) => setField("title", e.target.value)}
            placeholder="Senior real estate agent"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="job-desc">Description *</Label>
          <Textarea
            id="job-desc"
            rows={5}
            className="resize-none"
            value={values.description}
            onChange={(e) => setField("description", e.target.value)}
            placeholder="Role, responsibilities, and what makes this opportunity stand out…"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Employment type</Label>
            <Select
              value={values.employmentType}
              onValueChange={(v) => setField("employmentType", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EMPLOYMENT_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Workplace</Label>
            <Select
              value={values.jobType}
              onValueChange={(v) => setField("jobType", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {JOB_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="job-company">Company</Label>
          <Input
            id="job-company"
            value={values.company}
            onChange={(e) => setField("company", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="job-location">
            Location {values.jobType !== "Remote" ? "*" : ""}
          </Label>
          <Input
            id="job-location"
            value={values.location}
            onChange={(e) => setField("location", e.target.value)}
            placeholder="City or area"
          />
        </div>
        <div className="space-y-2">
          <Label>Experience level</Label>
          <Select
            value={values.experienceLevel || "none"}
            onValueChange={(v) =>
              setField("experienceLevel", v === "none" ? "" : v)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Not specified</SelectItem>
              {EXPERIENCE_LEVEL_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2 sm:col-span-1">
            <Label>Currency</Label>
            <Select
              value={values.salaryCurrency}
              onValueChange={(v) => setField("salaryCurrency", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SALARY_CURRENCY_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="salary-min">Salary min</Label>
            <Input
              id="salary-min"
              inputMode="numeric"
              value={values.salaryMin}
              onChange={(e) => setField("salaryMin", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="salary-max">Salary max</Label>
            <Input
              id="salary-max"
              inputMode="numeric"
              value={values.salaryMax}
              onChange={(e) => setField("salaryMax", e.target.value)}
            />
          </div>
        </div>
        <JobSkillsPicker
          skillIds={values.skillIds}
          customSkills={values.customSkills}
          onSkillIdsChange={(ids) => setField("skillIds", ids)}
          onCustomSkillsChange={(names) => setField("customSkills", names)}
        />
        <div className="space-y-2">
          <Label htmlFor="job-req">Requirements</Label>
          <Textarea
            id="job-req"
            rows={3}
            className="resize-none"
            value={values.requirements}
            onChange={(e) => setField("requirements", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="job-ben">Benefits</Label>
          <Textarea
            id="job-ben"
            rows={3}
            className="resize-none"
            value={values.benefits}
            onChange={(e) => setField("benefits", e.target.value)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="app-email">Application email</Label>
            <Input
              id="app-email"
              type="email"
              value={values.applicationEmail}
              onChange={(e) => setField("applicationEmail", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="app-url">Application URL</Label>
            <Input
              id="app-url"
              value={values.applicationUrl}
              onChange={(e) => setField("applicationUrl", e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Images</Label>
          <div className="flex flex-wrap gap-2">
            {images.map((img) => (
              <div
                key={img.key}
                className="relative h-20 w-28 overflow-hidden rounded-md border border-border"
              >
                <RemoteImg
                  src={img.url}
                  alt=""
                  wrapperClassName="absolute inset-0"
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  className="absolute right-1 top-1 rounded-full bg-background/90 p-0.5 shadow"
                  onClick={() => removeImage(img.key)}
                  aria-label="Remove image"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            {images.length < MAX_JOB_IMAGES ? (
              <label className="flex h-20 w-28 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-border text-xs text-muted-foreground hover:bg-muted/40">
                <ImagePlus className="mb-1 h-5 w-5" />
                Add
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  multiple
                  onChange={(e) => {
                    onPickFiles(e.target.files);
                    e.target.value = "";
                  }}
                />
              </label>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" asChild>
          <Link href={isEdit && jobId ? `/jobs/${jobId}` : "/jobs"}>
            Cancel
          </Link>
        </Button>
        <Button
          type="button"
          disabled={pending}
          onClick={() => void submit()}
        >
          {pending ? "Saving…" : isEdit ? "Update job" : "Post job"}
        </Button>
      </div>
    </div>
  );
}
