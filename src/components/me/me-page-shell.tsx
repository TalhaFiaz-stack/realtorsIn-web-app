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

export function MePageShell({
  title,
  description,
  backHref = "/me",
  backLabel = "Profile",
  children,
}: Props) {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 pb-8">
      <header className="space-y-3">
        <ShellBackRow>
          <ShellBackLink href={backHref} label={backLabel} />
        </ShellBackRow>
        <div className="space-y-0.5 px-0.5 text-start">
          <h1 className="locale-text text-xl font-semibold tracking-tight">
            {title}
          </h1>
          {description ? (
            <p className="locale-text text-sm text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
      </header>
      {children}
    </div>
  );
}
