"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ShellBackLink } from "@/components/navigation/shell-back-link";
import { ShellBackRow } from "@/components/navigation/shell-back-row";
import { JobDetailBody } from "@/components/jobs/job-detail-body";
import { JobCardSkeleton } from "@/components/jobs/job-shimmers";
import { ErrorState } from "@/components/states/error-state";
import { Send } from "lucide-react";
import {
  CharCount,
  FormField,
  FormGrid,
  ProfileFormDialog,
} from "@/components/profile/profile-form-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { fetchSession } from "@/features/auth/services/auth.client";
import {
  jobsErrorMessage,
  useApplyForJob,
  useChangeJobStatus,
  useJobDetail,
} from "@/features/jobs/hooks/use-jobs";
import { useJobMutations } from "@/features/jobs/hooks/use-job-mutations";
import { useRouter } from "next/navigation";
import { useConfirm } from "@/components/common/confirm-provider";
import {
  CONFIRM_DELETE_JOB,
  confirmJobStatusChange,
} from "@/constants/confirm-copy";
import { showAppToast } from "@/lib/toast/app-toast";

export function JobDetailScreen({ jobId }: { jobId: number }) {
  const router = useRouter();
  const { confirm } = useConfirm();
  const query = useJobDetail(jobId);
  const apply = useApplyForJob(jobId);
  const statusMutation = useChangeJobStatus();
  const { remove } = useJobMutations(jobId);
  const sessionQuery = useQuery({
    queryKey: ["session"],
    queryFn: ({ signal }) => fetchSession(signal),
  });
  const [applyOpen, setApplyOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const job = query.data;

  if (query.isLoading) {
    return (
      <div className="w-full max-w-3xl pb-10">
        <JobCardSkeleton />
      </div>
    );
  }

  if (query.isError || !job) {
    return (
      <div className="w-full max-w-3xl pb-10">
        <ErrorState
          title="Could not load job"
          description={jobsErrorMessage(query.error)}
          onRetry={() => void query.refetch()}
        />
      </div>
    );
  }

  const loadedJob = job;
  const emailInvalid =
    contactEmail.trim().length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim());

  const posterName =
    [loadedJob.poster?.firstName, loadedJob.poster?.lastName]
      .filter(Boolean)
      .join(" ") ||
    loadedJob.poster?.userName ||
    "Recruiter";

  const isOwner =
    sessionQuery.data?.member?.socialProfileId != null &&
    loadedJob.socialProfileId === sessionQuery.data.member.socialProfileId;

  async function submitApply() {
    try {
      await apply.mutateAsync({
        coverLetter: coverLetter.trim() || undefined,
        contactEmail: contactEmail.trim() || undefined,
        contactPhone: contactPhone.trim() || undefined,
      });
      setApplyOpen(false);
      showAppToast.success("Application submitted");
    } catch (error) {
      showAppToast.fromError(error, "Could not apply");
    }
  }

  async function updateStatus(status: string) {
    if (status === loadedJob.status) return;
    const ok = await confirm(
      confirmJobStatusChange({
        nextStatus: status,
        jobTitle: loadedJob.title,
      })
    );
    if (!ok) return;
    try {
      await statusMutation.mutateAsync({ jobId, status });
      showAppToast.success("Status updated");
    } catch (error) {
      showAppToast.fromError(error, "Update failed");
    }
  }

  async function deleteJobPost() {
    const ok = await confirm({
      ...CONFIRM_DELETE_JOB,
      detail: loadedJob.title,
    });
    if (!ok) return;
    try {
      await remove.mutateAsync();
      showAppToast.success("Job deleted");
      router.push("/jobs");
    } catch (error) {
      showAppToast.fromError(error, "Could not delete job");
    }
  }

  return (
    <div className="w-full max-w-3xl space-y-4 pb-12">
      <ShellBackRow>
        <ShellBackLink href="/jobs" label="Jobs" />
      </ShellBackRow>

      <JobDetailBody
        job={loadedJob}
        posterName={posterName}
        isOwner={isOwner}
        onApply={() => setApplyOpen(true)}
        statusMutationPending={statusMutation.isPending}
        onStatusChange={(status) => void updateStatus(status)}
        onDelete={isOwner ? () => void deleteJobPost() : undefined}
        deletePending={remove.isPending}
      />

      <ProfileFormDialog
        open={applyOpen}
        onOpenChange={setApplyOpen}
        icon={Send}
        title={`Apply to ${loadedJob.title}`}
        description={`${posterName} will see your RealtorsIn profile with this application.`}
        size="sm"
        saving={apply.isPending}
        canSave={!emailInvalid}
        saveLabel="Submit application"
        onSave={() => void submitApply()}
      >
        <FormField
          label="Cover letter"
          htmlFor="apply-cover"
          hint={<CharCount value={coverLetter} max={2000} />}
        >
          <Textarea
            id="apply-cover"
            placeholder="Why you're a great fit for this role (optional)"
            value={coverLetter}
            maxLength={2000}
            onChange={(e) => setCoverLetter(e.target.value)}
            rows={5}
            className="resize-none"
            autoFocus
          />
        </FormField>
        <FormGrid>
          <FormField
            label="Contact email"
            htmlFor="apply-email"
            hint={emailInvalid ? <span className="text-destructive">Enter a valid email.</span> : undefined}
          >
            <Input
              id="apply-email"
              type="email"
              placeholder="you@example.com"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
            />
          </FormField>
          <FormField label="Contact phone" htmlFor="apply-phone">
            <Input
              id="apply-phone"
              type="tel"
              placeholder="+971 50 000 0000"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
            />
          </FormField>
        </FormGrid>
      </ProfileFormDialog>
    </div>
  );
}
