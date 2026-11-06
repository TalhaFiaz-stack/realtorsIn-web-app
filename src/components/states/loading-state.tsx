import { InlineLoader } from "@/components/states/inline-loader";
import { cn } from "@/lib/utils";

export function LoadingState({
  label = "Loading",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={cn(
        "flex min-h-40 flex-col items-center justify-center gap-3 text-muted-foreground",
        className
      )}
    >
      <InlineLoader className="text-primary" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
