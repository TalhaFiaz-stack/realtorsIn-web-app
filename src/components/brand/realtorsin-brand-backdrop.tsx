import { cn } from "@/lib/utils";

/** Soft theme blobs — matches admin login atmosphere. */
export function RealtorsInBrandBackdrop({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className
      )}
      aria-hidden
    >
      <div className="realtorsin-brand-blob absolute -end-16 -top-16 h-52 w-52 opacity-50" />
      <div className="realtorsin-brand-blob-pink absolute -bottom-20 -start-20 h-56 w-56 opacity-40" />
      <div className="realtorsin-brand-blob-purple absolute end-0 top-1/3 h-44 w-44 opacity-35" />
    </div>
  );
}
