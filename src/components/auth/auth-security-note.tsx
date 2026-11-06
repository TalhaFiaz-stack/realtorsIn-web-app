import { Lock } from "lucide-react";

export function AuthSecurityNote() {
  return (
    <div className="mt-5 text-center">
      <div className="flex items-center justify-center gap-1.5">
        <Lock className="h-3 w-3 text-muted-foreground/70" />
        <p className="text-xs text-muted-foreground/80">
          Secured with end-to-end encryption
        </p>
      </div>
    </div>
  );
}
