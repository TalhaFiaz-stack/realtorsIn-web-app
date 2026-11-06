import { RealtorsInBrandBackdrop } from "@/components/brand/realtorsin-brand-backdrop";
import { cn } from "@/lib/utils";

export function AuthPageShell({
  children,
  header,
  centered = true,
  className,
  cardClassName,
}: {
  children: React.ReactNode;
  header?: React.ReactNode;
  centered?: boolean;
  className?: string;
  cardClassName?: string;
}) {
  const year = new Date().getFullYear();

  return (
    <div className="realtorsin-brand-gradient relative min-h-dvh overflow-hidden">
      <RealtorsInBrandBackdrop />

      <div
        className={cn(
          "relative z-10 mx-auto flex w-full max-w-[520px] flex-col px-4 sm:px-6",
          centered ? "min-h-dvh justify-center py-12" : "min-h-dvh py-8",
          className
        )}
      >
        {header}
        <div
          className={cn(
            "realtorsin-auth-card rounded-3xl p-8 sm:p-10",
            cardClassName
          )}
        >
          {children}
        </div>
        <p className="mt-8 text-center text-xs text-muted-foreground/80">
          © {year} Realtor&apos;s In
        </p>
      </div>
    </div>
  );
}
