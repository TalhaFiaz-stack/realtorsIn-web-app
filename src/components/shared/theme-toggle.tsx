"use client";

import { useEffect, useState } from "react";
import { Check, Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type ThemeChoice = "light" | "dark" | "system";

const OPTIONS: {
  value: ThemeChoice;
  label: string;
  icon: typeof Sun;
}[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const active = (mounted ? theme : "system") as ThemeChoice;

  const triggerButton = (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn(className)}
      aria-label="Theme appearance"
    >
      {mounted && resolvedTheme === "dark" ? (
        <Moon className="h-4 w-4" aria-hidden />
      ) : (
        <Sun className="h-4 w-4" aria-hidden />
      )}
    </Button>
  );

  if (!mounted) {
    return triggerButton;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{triggerButton}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Appearance
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {OPTIONS.map(({ value, label, icon: Icon }) => {
          const selected = active === value;
          return (
            <DropdownMenuItem
              key={value}
              onClick={() => setTheme(value)}
              className="flex cursor-pointer items-center gap-2"
            >
              <Icon className="h-4 w-4 text-muted-foreground" aria-hidden />
              <span className="flex-1">{label}</span>
              {selected ? (
                <Check className="h-4 w-4 text-primary" aria-hidden />
              ) : (
                <span className="h-4 w-4" aria-hidden />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
