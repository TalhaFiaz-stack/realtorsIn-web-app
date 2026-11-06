"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createJobRequest,
  deleteJobRequest,
  updateJobRequest,
} from "@/features/jobs/services/jobs.client";

export function useJobMutations(jobId?: number) {
  const queryClient = useQueryClient();

  function invalidate() {
    void queryClient.invalidateQueries({ queryKey: ["jobs"] });
  }

  const create = useMutation({
    mutationFn: createJobRequest,
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: (form: FormData) => {
      if (!jobId) throw new Error("Missing job id");
      return updateJobRequest(jobId, form);
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: () => {
      if (!jobId) throw new Error("Missing job id");
      return deleteJobRequest(jobId);
    },
    onSuccess: invalidate,
  });

  return { create, update, remove };
}

export function useDeleteJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (jobId: number) => deleteJobRequest(jobId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}
