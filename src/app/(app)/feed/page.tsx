import { Suspense } from "react";
import { FeedScreen } from "@/components/feed/feed-screen";
import { FeedSkeleton } from "@/components/feed/feed-skeleton";
import { requireMember } from "@/lib/auth/require-member";

export const metadata = { title: "Home" };

export default async function FeedPage() {
  const member = await requireMember({ nextPath: "/feed" });
  const displayName =
    member.fullName ||
    member.name ||
    member.userName ||
    "there";

  return (
    <div className="w-full max-w-2xl pb-6">
      <Suspense fallback={<FeedSkeleton count={4} />}>
        <FeedScreen
          composerDisplayName={displayName}
          composerAvatarUrl={member.avatarUrl}
        />
      </Suspense>
    </div>
  );
}
