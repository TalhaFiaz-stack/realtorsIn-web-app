import Link from "next/link";
import { RealtorsInAppIcon } from "@/components/brand/realtorsin-app-icon";
import { cn } from "@/lib/utils";

export function AuthBrandHeader({
  title,
  description,
  className,
}: {
  title: string;
  description: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-6 text-center", className)}>
      <Link href="/" className="mb-5 inline-flex justify-center" aria-label="Home">
        <RealtorsInAppIcon size={68} />
      </Link>
      <h1 className="text-[22px] font-bold tracking-tight text-foreground">
        {title}
      </h1>
      <p className="auth-brand-subtitle mt-1 text-sm">{description}</p>
    </div>
  );
}
