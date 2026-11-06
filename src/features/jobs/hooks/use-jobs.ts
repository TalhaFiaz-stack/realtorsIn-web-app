"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  applyForJobRequest,
  changeJobStatusRequest,
  fetchJobByIdRequest,
  fetchJobsPageRequest,
} from "@/features/jobs/services/jobs.client";
import type {
  JobPost,
  JobsHubTab,
  JobsListPage,
} from "@/features/jobs/types/job.types";
import { ApiError } from "@/lib/api/errors";

export function jobsQueryKey(
  tab: JobsHubTab,
  search?: string,
  postedStatus?: string
) {
  return ["jobs", tab, search ?? "", postedStatus ?? "All"] as const;
}

export function jobDetailQueryKey(id: number) {
  return ["jobs", "detail", id] as const;
}

export function jobsErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}

export function useJobsList(
  tab: JobsHubTab,
  search?: string,
  geo?: { lat: number; lng: number } | null,
  postedStatus?: string
) {
  return useInfiniteQuery({
    queryKey: [
      ...jobsQueryKey(tab, search, postedStatus),
      geo?.lat ?? "",
      geo?.lng ?? "",
    ] as const,
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      fetchJobsPageRequest(
        tab,
        pageParam,
        search,
        signal,
        geo ?? undefined,
        tab === "posted" ? postedStatus : undefined
      ),
    getNextPageParam: (last) =>
      last.page < last.totalPages ? last.page + 1 : undefined,
    select: (data) => ({
      pages: data.pages,
      jobs: data.pages.flatMap((p) => p.jobs),
    }),
  });
}

export function useJobDetail(jobId: number) {
  return useQuery({
    queryKey: jobDetailQueryKey(jobId),
    queryFn: ({ signal }) => fetchJobByIdRequest(jobId, signal),
    select: (data) => data.job,
    enabled: Number.isFinite(jobId) && jobId > 0,
  });
}

export function useApplyForJob(jobId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof applyForJobRequest>[1]) =>
      applyForJobRequest(jobId, data),
    onSuccess: () => {
      queryClient.setQueryData(jobDetailQueryKey(jobId), (current: JobPost | undefined) =>
        current
          ? {
              ...current,
              hasApplied: true,
              applicationStatus: current.applicationStatus ?? "pending",
            }
          : current
      );
      void queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}

type JobsInfiniteCache = {
  pages: JobsListPage[];
  pageParams: unknown[];
};

function patchJobStatusInJobsCaches(
  queryClient: ReturnType<typeof useQueryClient>,
  jobId: number,
  status: string
) {
  queryClient.setQueriesData<JobsInfiniteCache>({ queryKey: ["jobs"] }, (current) => {
    if (!current?.pages) return current;
    return {
      ...current,
      pages: current.pages.map((page) => ({
        ...page,
        jobs: page.jobs.map((job) =>
          job.id === jobId ? { ...job, status } : job
        ),
      })),
    };
  });
  queryClient.setQueryData(jobDetailQueryKey(jobId), (current: JobPost | undefined) =>
    current ? { ...current, status } : current
  );
}

export function useChangeJobStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ jobId, status }: { jobId: number; status: string }) =>
      changeJobStatusRequest(jobId, status),
    onMutate: async ({ jobId, status }) => {
      await queryClient.cancelQueries({ queryKey: ["jobs"] });
      const previousLists = queryClient.getQueriesData<JobsInfiniteCache>({
        queryKey: ["jobs"],
      });
      const previousDetail = queryClient.getQueryData<JobPost>(
        jobDetailQueryKey(jobId)
      );
      patchJobStatusInJobsCaches(queryClient, jobId, status);
      return { previousLists, previousDetail, jobId };
    },
    onError: (_err, _vars, ctx) => {
      ctx?.previousLists?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      if (ctx?.previousDetail != null && ctx?.jobId != null) {
        queryClient.setQueryData(jobDetailQueryKey(ctx.jobId), ctx.previousDetail);
      }
    },
    onSuccess: (_result, { jobId, status }) => {
      patchJobStatusInJobsCaches(queryClient, jobId, status);
      void queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}
