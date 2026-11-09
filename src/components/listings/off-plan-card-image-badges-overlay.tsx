import { OffPlanStatusChip } from "@/features/off-plan/lib/off-plan-list-status-styles";
import type { OffPlanCardImageBadges } from "@/features/off-plan/lib/off-plan-card-image-badges";
import { cn } from "@/lib/utils";

type Props = {
  badges: OffPlanCardImageBadges;
  saleStatusFill: string;
  variant?: "grid" | "map";
  shareSlot?: React.ReactNode;
};

export function OffPlanCardImageBadgesOverlay({
  badges,
  saleStatusFill,
  variant = "grid",
  shareSlot,
}: Props) {
  const isMap = variant === "map";
  const saleOnDark = saleStatusFill === "#87ebe6";

  return (
    <>
      <div
        className={cn(
          "absolute z-[1] flex flex-col items-start gap-1",
          isMap
            ? "start-1.5 top-1.5 max-w-[calc(100%-0.5rem)]"
            : "start-2.5 top-2.5 max-w-[calc(100%-0.5rem)]",
          shareSlot || badges.completedLabel
            ? isMap
              ? "pe-14"
              : "pe-[4.25rem]"
            : "pe-2"
        )}
      >
        {badges.saleStatus ? (
          <span
            className={cn(
              "inline-flex w-fit max-w-full whitespace-normal rounded-md font-bold uppercase leading-tight shadow-sm backdrop-blur-sm",
              isMap
                ? "px-1.5 py-0.5 text-[10px] tracking-wide"
                : "px-2 py-0.5 text-[10px] tracking-wide",
              saleOnDark ? "text-gray-900" : "text-white"
            )}
            style={{ backgroundColor: saleStatusFill }}
          >
            {badges.saleStatus}
          </span>
        ) : null}
        {badges.secondaryStatus ? (
          <OffPlanStatusChip
            label={badges.secondaryStatus}
            className={cn(
              "w-fit max-w-full whitespace-normal text-start leading-tight shadow-sm backdrop-blur-[2px]",
              isMap && "px-1.5 py-0.5 text-[9px]"
            )}
          />
        ) : null}
      </div>

      {badges.completedLabel || shareSlot ? (
        <div
          className={cn(
            "absolute z-[2] flex flex-col items-end gap-1",
            isMap ? "end-1.5 top-1.5" : "end-2 top-2"
          )}
        >
          {badges.completedLabel ? (
            <OffPlanStatusChip
              label={badges.completedLabel}
              className={cn(
                "w-fit whitespace-nowrap bg-emerald-500/95 text-white shadow-sm backdrop-blur-[2px]",
                isMap && "px-1.5 py-0.5 text-[9px]"
              )}
            />
          ) : null}
          {shareSlot}
        </div>
      ) : null}
    </>
  );
}
