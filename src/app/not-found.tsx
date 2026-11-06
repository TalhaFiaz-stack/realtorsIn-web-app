import { ShellBackLink } from "@/components/navigation/shell-back-link";
import { ShellBackRow } from "@/components/navigation/shell-back-row";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
      <p className="text-sm text-muted-foreground">
        The page you requested does not exist or is no longer available.
      </p>
      <ShellBackRow className="justify-center">
        <ShellBackLink href="/feed" label="Home" />
      </ShellBackRow>
    </main>
  );
}
