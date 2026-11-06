"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ShellBackLink } from "@/components/navigation/shell-back-link";
import { ShellBackRow } from "@/components/navigation/shell-back-row";
import { JobDetailBody } from "@/components/jobs/job-detail-body";
import { JobCardSkeleton } from "@/components/jobs/job-shimmers";
import { ErrorState } from "@/components/states/error-state";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

      <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Apply to {loadedJob.title}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Your profile may be shared with the poster. Add optional contact
            details below.
          </p>
          <div className="space-y-3">
            <Textarea
              placeholder="Cover letter (optional)"
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <Input
              type="email"
              placeholder="Contact email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
            />
            <Input
              placeholder="Contact phone"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setApplyOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={apply.isPending}
              onClick={() => void submitApply()}
            >
              {apply.isPending ? "Submitting…" : "Submit application"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
