import { CreatePostPageClient } from "@/components/feed/create-post-page-client";
import { requireMember } from "@/lib/auth/require-member";

export const metadata = { title: "Create" };

export default async function CreatePage() {
  const member = await requireMember({ nextPath: "/create" });
  const displayName =
    member.fullName || member.name || member.userName || "Member";

  return (
    <CreatePostPageClient
      displayName={displayName}
      avatarUrl={member.avatarUrl}
    />
  );
}
