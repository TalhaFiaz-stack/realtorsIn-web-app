"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Lock } from "lucide-react";
import { PasswordField } from "@/components/auth/password-field";
import { PasswordRequirementsPanel } from "@/components/settings/password-requirements-panel";
import { updatePasswordRequest } from "@/features/settings/services/settings.client";
import { isPasswordStrong } from "@/features/settings/lib/password-strength";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { showAppToast } from "@/lib/toast/app-toast";
import { SettingsFormSkeleton } from "@/components/settings/settings-detail-skeleton";
import { cn } from "@/lib/utils";

export function SecuritySettingsScreen() {
  const [hydrated, setHydrated] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [confirmTouched, setConfirmTouched] = useState(false);
  const passwordTouched = password.length > 0;

  useEffect(() => {
    setHydrated(true);
  }, []);

  const mutation = useMutation({
    mutationFn: () => updatePasswordRequest(password),
    onSuccess: (data) => {
      showAppToast.success(
        "Password updated",
        data.message || "Use your new password the next time you sign in."
      );
      setPassword("");
      setConfirm("");
      setConfirmTouched(false);
    },
    onError: (error) => {
      showAppToast.fromError(error, "Could not update password");
    },
  });

  const passwordsMatch = password === confirm && confirm.length > 0;
  const passwordValid = isPasswordStrong(password);
  const canSubmit =
    passwordValid && passwordsMatch && !mutation.isPending;

  if (!hydrated) {
    return <SettingsFormSkeleton />;
  }

  return (
    <div className="space-y-6">
      <header className="rounded-lg border border-border bg-card p-5 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Lock className="h-6 w-6 text-primary" aria-hidden />
        </div>
        <h2 className="mt-3 text-lg font-semibold">Security settings</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a strong password to protect your account. It should be unique
          and not easily guessable — same rules as the mobile app.
        </p>
      </header>

      <form
        className="space-y-4 rounded-lg border border-border bg-card p-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (!canSubmit) return;
          mutation.mutate();
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="new-password">New password</Label>
          <PasswordField
            id="new-password"
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            placeholder="Enter new password"
            disabled={mutation.isPending}
            inputClassName={cn(
              passwordTouched &&
                !passwordValid &&
                "border-destructive focus-visible:ring-destructive/20",
              passwordTouched &&
                passwordValid &&
                "border-success focus-visible:ring-success/25"
            )}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm password</Label>
          <PasswordField
            id="confirm-password"
            value={confirm}
            onChange={(value) => {
              setConfirm(value);
              setConfirmTouched(true);
            }}
            autoComplete="new-password"
            placeholder="Confirm new password"
            disabled={mutation.isPending}
            inputClassName={cn(
              confirmTouched &&
                confirm.length > 0 &&
                !passwordsMatch &&
                "border-destructive focus-visible:ring-destructive/20",
              confirmTouched &&
                passwordsMatch &&
                "border-success focus-visible:ring-success/25"
            )}
          />
          {confirmTouched && confirm.length > 0 ? (
            <p
              className={cn(
                "text-xs",
                passwordsMatch ? "text-success" : "text-destructive"
              )}
            >
              {passwordsMatch
                ? "Passwords match"
                : "Passwords do not match"}
            </p>
          ) : null}
        </div>
        <Button type="submit" disabled={!canSubmit}>
          {mutation.isPending ? "Saving…" : "Save password"}
        </Button>
      </form>

      <PasswordRequirementsPanel
        password={password}
        showRequirements={passwordTouched || password.length > 0}
      />
    </div>
  );
}
