import { cn } from "@/lib/utils";

export function HubControlCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-xl border border-border/70 bg-card shadow-[0_1px_2px_rgba(16,24,40,0.04)]",
        className
      )}
    >
      {children}
    </section>
  );
}

export function HubControlCardHeader({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="px-4 pb-1 pt-4">{children}</div>
  );
}

export function HubControlCardBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("space-y-3 p-4", className)}>{children}</div>;
}
