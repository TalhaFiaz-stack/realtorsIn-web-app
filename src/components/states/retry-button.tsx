"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RetryButton({
  onRetry,
  label = "Try again",
}: {
  onRetry: () => void;
  label?: string;
}) {
  return (
    <Button type="button" variant="outline" onClick={onRetry}>
      <RefreshCw className="h-4 w-4" aria-hidden />
      {label}
    </Button>
  );
}
