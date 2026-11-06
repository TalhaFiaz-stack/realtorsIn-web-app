import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api/errors";

function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError) {
    if (
      error.code === "UNAUTHORIZED" ||
      error.code === "SESSION_EXPIRED" ||
      error.code === "FORBIDDEN" ||
      error.code === "VALIDATION"
    ) {
      return false;
    }
    if (!error.isRetryable) {
      return false;
    }
  }
  return failureCount < 2;
}

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry: shouldRetry,
      },
      mutations: {
        retry: false,
      },
    },
  });
}
