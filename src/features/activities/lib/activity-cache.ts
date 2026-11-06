import type { QueryClient } from "@tanstack/react-query";

export const activityQueryPrefix = ["activities"] as const;

export function invalidateActivityQueries(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: activityQueryPrefix });
}
