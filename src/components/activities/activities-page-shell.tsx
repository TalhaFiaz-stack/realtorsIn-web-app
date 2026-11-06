import { ShellBackLink } from "@/components/navigation/shell-back-link";
import { ShellBackRow } from "@/components/navigation/shell-back-row";
import type { ReactNode } from "react";

type Props = {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  children: ReactNode;
};

export function ActivitiesPageShell({
  title,
  description,
  backHref = "/activities",
  backLabel = "My activity",
  children,
}: Props) {
  return (
    <div className="w-full max-w-2xl space-y-4 pb-8">
      <header className="space-y-3">
        <ShellBackRow>
          <ShellBackLink href={backHref} label={backLabel} />
        </ShellBackRow>
        <div className="space-y-0.5 px-0.5 text-start">
          <h1 className="locale-text text-[22px] font-semibold leading-tight tracking-tight text-foreground">
            {title}
          </h1>
          {description ? (
            <p className="locale-text text-[14px] leading-snug text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
      </header>
      {children}
    </div>
  );
}
