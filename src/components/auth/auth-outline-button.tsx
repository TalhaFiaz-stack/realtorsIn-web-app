import Link from "next/link";
import { cn } from "@/lib/utils";

export function AuthOutlineButton({
  children,
  className,
  href,
  onClick,
  type = "button",
  disabled,
}: {
  children: React.ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
  type?: "button";
  disabled?: boolean;
}) {
  const classes = cn("auth-outline-btn", className);

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
