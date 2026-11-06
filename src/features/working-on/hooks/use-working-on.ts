"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchWorkingOnRequest,
  removeWorkingOnProjectRequest,
  removeWorkingOnPropertyRequest,
} from "@/features/working-on/services/working-on.client";
import { ApiError } from "@/lib/api/errors";

export function workingOnErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return "Something went wrong";
}

export function useWorkingOn() {
  return useQuery({
    queryKey: ["profile", "working-on"],
    queryFn: ({ signal }) => fetchWorkingOnRequest(signal),
    select: (res) => res.data,
  });
}

export function useRemoveWorkingOnProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeWorkingOnProjectRequest,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["profile", "working-on"] });
    },
  });
}

export function useRemoveWorkingOnProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeWorkingOnPropertyRequest,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["profile", "working-on"] });
    },
  });
}
