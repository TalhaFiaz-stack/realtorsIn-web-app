import { ProfileScreen } from "@/components/profile/profile-screen";

type Props = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: Props) {
  const { username } = await params;
  return { title: `@${username} — Posts` };
}

export default async function UserPostsPage({ params }: Props) {
  const { username } = await params;
  return (
    <div className="w-full pb-6">
      <ProfileScreen username={username} defaultTab="posts" />
    </div>
  );
}
