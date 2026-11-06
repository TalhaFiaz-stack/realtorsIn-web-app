import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function InlineLoader({ className }: { className?: string }) {
  return (
    <LoaderCircle
      aria-hidden
      className={cn("h-5 w-5 animate-spin text-current", className)}
    />
  );
}
