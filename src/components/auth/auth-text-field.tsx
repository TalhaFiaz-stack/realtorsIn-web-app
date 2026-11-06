"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function AuthTextField({
  id,
  name,
  type = "text",
  icon: Icon,
  value,
  onChange,
  placeholder,
  disabled,
  autoComplete,
  inputMode,
  className,
}: {
  id: string;
  name?: string;
  type?: string;
  icon: LucideIcon;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <div className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2">
        <Icon className="h-[18px] w-[18px] text-muted-foreground/70" />
      </div>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete}
        inputMode={inputMode}
        className="auth-field-input w-full pe-4 ps-11"
      />
    </div>
  );
}
