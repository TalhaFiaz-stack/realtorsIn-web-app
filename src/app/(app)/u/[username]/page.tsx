import { ProfileScreen } from "@/components/profile/profile-screen";

export const metadata = { title: "Profile" };

type Props = { params: Promise<{ username: string }> };

export default async function UserHandleProfilePage({ params }: Props) {
  const { username } = await params;
  const handle = decodeURIComponent(username || "").trim().replace(/^@/, "");

  return (
    <div className="w-full pb-6">
      <ProfileScreen username={handle} />
    </div>
  );
}
