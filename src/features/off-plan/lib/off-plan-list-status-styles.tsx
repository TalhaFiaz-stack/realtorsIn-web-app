import { cn } from "@/lib/utils";

/** Mobile `OffPlanListItem` status chip colors (light theme). */
export function offPlanListStatusChipClass(label: string | null | undefined): string {
  const key = (label ?? "").trim().toLowerCase();
  switch (key) {
    case "announced":
      return "bg-[#eff6ff] text-[#1d4ed8]";
    case "on sale":
      return "bg-[#f0f9ff] text-[#0369a1]";
    case "out of stock":
    case "sold out":
      return "bg-[#fef2f2] text-[#b91c1c]";
    case "pre sale":
    case "presale":
      return "bg-[#f1f5f9] text-[#1e293b]";
    case "under construction":
      return "bg-[#eff6ff] text-[#1d4ed8]";
    case "completed":
      return "bg-[#ecfdf5] text-[#047857]";
    default:
      return "bg-muted text-foreground";
  }
}

export function OffPlanStatusChip({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full truncate rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        offPlanListStatusChipClass(label),
        className
      )}
    >
      {label}
    </span>
  );
}
