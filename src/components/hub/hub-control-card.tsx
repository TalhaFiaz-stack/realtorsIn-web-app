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
        "overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm",
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
    <div className="border-b border-border/60 px-4 py-3">{children}</div>
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
