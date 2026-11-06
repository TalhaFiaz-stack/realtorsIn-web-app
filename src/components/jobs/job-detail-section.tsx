import type { ReactNode } from "react";

export function JobDetailSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="scroll-mt-20">
      <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {title}
      </h2>
      <div className="mt-3 text-[15px] leading-[1.65] text-foreground">
        {children}
      </div>
    </section>
  );
}
