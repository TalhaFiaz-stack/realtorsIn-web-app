import { cn } from "@/lib/utils";

/** Square RealtorsIn mark (same asset as admin login `/realtorsInIcon.svg`). */
export function RealtorsInAppIcon({
  className,
  size = 56,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-2xl p-2",
        "border border-white/70 bg-white/90 shadow-[0_4px_16px_rgba(17,47,107,0.08)]",
        "dark:border-white/10 dark:bg-card/90",
        className
      )}
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/realtorsInIcon.svg"
        alt=""
        className="h-full w-full object-contain"
      />
    </span>
  );
}
