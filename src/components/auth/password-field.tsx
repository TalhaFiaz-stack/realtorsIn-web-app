"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PasswordField({
  id,
  name,
  value,
  onChange,
  disabled,
  autoComplete = "current-password",
  placeholder = "Enter your password",
  className,
  inputClassName,
  variant = "default",
}: {
  id: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  autoComplete?: string;
  placeholder?: string;
  /** Wrapper (layout only). */
  className?: string;
  /** Applied to the `<input>` — use for validation borders, not rings on the wrapper. */
  inputClassName?: string;
  variant?: "default" | "auth";
}) {
  const [visible, setVisible] = useState(false);
  const isAuth = variant === "auth";

  return (
    <div className={cn("relative", className)}>
      {isAuth ? (
        <div className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2">
          <Lock className="h-[18px] w-[18px] text-muted-foreground/70" />
        </div>
      ) : null}
      {isAuth ? (
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className={cn(
            "auth-field-input w-full pe-12 ps-11",
            inputClassName
          )}
        />
      ) : (
        <Input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className={cn(
            "h-11 rounded-lg border-input bg-background pe-11 shadow-sm",
            inputClassName
          )}
        />
      )}
      {isAuth ? (
        <button
          type="button"
          tabIndex={-1}
          className="absolute end-4 top-1/2 -translate-y-1/2 text-muted-foreground/70 transition-colors hover:text-foreground disabled:opacity-50"
          aria-label={visible ? "Hide password" : "Show password"}
          onClick={() => setVisible((v) => !v)}
          disabled={disabled}
        >
          {visible ? (
            <EyeOff className="h-[18px] w-[18px]" />
          ) : (
            <Eye className="h-[18px] w-[18px]" />
          )}
        </button>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          tabIndex={-1}
          className="absolute end-0.5 top-1/2 h-9 w-9 -translate-y-1/2 text-muted-foreground hover:bg-transparent hover:text-foreground"
          aria-label={visible ? "Hide password" : "Show password"}
          onClick={() => setVisible((v) => !v)}
          disabled={disabled}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      )}
    </div>
  );
}
