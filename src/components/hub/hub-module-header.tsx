import { RealtorsInAppIcon } from "@/components/brand/realtorsin-app-icon";

export function HubModuleHeader({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <RealtorsInAppIcon size={36} className="shrink-0 shadow-sm" />
      <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0">
          <h1 className="text-lg font-semibold leading-none tracking-tight text-foreground">
            {title}
          </h1>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
            RealtorsIn
          </span>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </div>
  );
}
