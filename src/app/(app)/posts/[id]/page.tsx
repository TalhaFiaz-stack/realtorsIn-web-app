import { notFound } from "next/navigation";
import { PostDetailScreen } from "@/components/feed/post-detail-screen";
import { requireMember } from "@/lib/auth/require-member";

export const metadata = { title: "Post" };

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function PostDetailPage({ params }: PageProps) {
  const { id } = await params;
  const postId = Number(id);
  if (!Number.isFinite(postId) || postId <= 0) {
    notFound();
  }
  const member = await requireMember({ nextPath: `/posts/${postId}` });
  const viewerName =
    member.fullName || member.name || member.userName || "you";
  return (
    <div className="px-4 py-2 md:px-0">
      <PostDetailScreen
        postId={postId}
        viewerName={viewerName}
        viewerAvatarUrl={member.avatarUrl}
      />
    </div>
  );
}
