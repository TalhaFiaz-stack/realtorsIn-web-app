"use client";

import Link from "next/link";
import { Repeat2 } from "lucide-react";
import {
  Avatar,
  AvatarImage,
  AvatarPlaceholderFallback,
} from "@/components/ui/avatar";
import type { PostRepostUser } from "@/features/feed/types/post.types";

function formatRepostersLabel(reposters: PostRepostUser[]): string {
  if (reposters.length === 0) return "Reposted";
  const names = reposters.slice(0, 2).map((r) => r.reposterName);
  const suffix =
    reposters.length > 2 ? ` +${reposters.length - 2} others` : "";
  return `${names.join(", ")}${suffix} reposted`;
}

export function PostRepostBanner({
  reposters,
}: {
  reposters: PostRepostUser[];
}) {
  if (reposters.length === 0) {
    return (
      <div className="flex items-center gap-2 px-4 pb-1 pt-3 text-[13px] font-medium text-muted-foreground">
        <Repeat2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
        <span>Reposted</span>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2.5 px-4 pb-1 pt-3">
      <Repeat2
        className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400"
        aria-hidden
      />
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <div className="flex shrink-0 -space-x-2">
          {reposters.slice(0, 2).map((r) => (
            <Avatar key={r.reposterId} className="h-6 w-6 border-2 border-card">
              {r.reposterImage ? (
                <AvatarImage src={r.reposterImage} alt="" />
              ) : null}
              <AvatarPlaceholderFallback />
            </Avatar>
          ))}
        </div>
        <p className="min-w-0 text-[13px] font-medium leading-snug text-muted-foreground">
          {reposters.slice(0, 2).map((r, index) => (
            <span key={r.reposterId}>
              {index > 0 ? ", " : null}
              {r.reposterUserName ? (
                <Link
                  href={`/u/${r.reposterUserName}`}
                  className="font-semibold text-foreground hover:underline"
                >
                  {r.reposterName}
                </Link>
              ) : (
                <span className="font-semibold text-foreground">
                  {r.reposterName}
                </span>
              )}
            </span>
          ))}
          {reposters.length > 2 ? (
            <span>{` +${reposters.length - 2} others`}</span>
          ) : null}{" "}
          reposted
        </p>
      </div>
    </div>
  );
}

export { formatRepostersLabel };
