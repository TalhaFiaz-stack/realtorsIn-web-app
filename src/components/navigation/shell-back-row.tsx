import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Aligns back pills for RTL locales (`html.locale-rtl` in globals.css). */
export function ShellBackRow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("shell-back-row", className)}>{children}</div>;
}
