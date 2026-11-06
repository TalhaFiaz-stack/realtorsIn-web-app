"use client";

import { ErrorState } from "@/components/states/error-state";

export default function AuthenticatedSegmentError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-lg py-10">
      <ErrorState
        title="Unable to load this page"
        description="Please try again. If the problem continues, sign out and back in."
        onRetry={reset}
      />
    </div>
  );
}
