"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

export type ConfirmOptions = {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Destructive actions use red confirm button (delete, remove, block). */
  variant?: "default" | "destructive";
  /** Short preview so the user knows which item is affected. */
  detail?: string;
};

type ConfirmContextValue = {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
};

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

const DEFAULT_OPTIONS: Required<
  Pick<ConfirmOptions, "confirmLabel" | "cancelLabel" | "variant">
> = {
  confirmLabel: "Confirm",
  cancelLabel: "Cancel",
  variant: "default",
};

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const settle = useCallback((value: boolean) => {
    resolveRef.current?.(value);
    resolveRef.current = null;
    setOpen(false);
    setOptions(null);
  }, []);

  const confirm = useCallback((next: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
      setOptions(next);
      setOpen(true);
    });
  }, []);

  const value = useMemo(() => ({ confirm }), [confirm]);

  const merged = options
    ? { ...DEFAULT_OPTIONS, ...options }
    : null;

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      <AlertDialog
        open={open}
        onOpenChange={(next) => {
          if (!next) settle(false);
        }}
      >
        {/* Above every other layer (story viewer z-[100], sheets z-[110]) —
            a confirm opened from a full-screen overlay must not hide behind it. */}
        <AlertDialogContent className="z-[200]" overlayClassName="z-[200]">
          <AlertDialogHeader>
            <AlertDialogTitle>{merged?.title}</AlertDialogTitle>
            {merged?.description ? (
              <AlertDialogDescription>
                {merged.description}
              </AlertDialogDescription>
            ) : null}
            {merged?.detail ? (
              <p className="rounded-lg border border-border bg-muted/60 px-3 py-2 text-sm leading-snug text-foreground">
                {merged.detail}
              </p>
            ) : null}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => settle(false)}>
              {merged?.cancelLabel}
            </AlertDialogCancel>
            <AlertDialogAction
              className={cn(
                merged?.variant === "destructive" &&
                  "bg-destructive text-destructive-foreground hover:opacity-90"
              )}
              onClick={() => settle(true)}
            >
              {merged?.confirmLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error("useConfirm must be used within ConfirmProvider");
  }
  return ctx;
}
