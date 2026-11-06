"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/states/error-state";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Digest only — never log tokens or PII.
    if (error.digest) {
      console.error("App route error digest:", error.digest);
    }
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[50dvh] max-w-lg items-center px-4 py-16">
      <ErrorState
        title="Something went wrong"
        description="This page hit an unexpected error. You can try again or go back to Home."
        onRetry={reset}
        className="w-full"
      />
    </div>
  );
}
