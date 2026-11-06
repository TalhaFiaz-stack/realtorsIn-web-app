import { notFound } from "next/navigation";
import { ProfileScreen } from "@/components/profile/profile-screen";

export const metadata = { title: "Profile" };

type Props = { params: Promise<{ id: string }> };

export default async function UserIdProfilePage({ params }: Props) {
  const { id } = await params;
  const socialProfileId = Number(id);
  if (!Number.isFinite(socialProfileId) || socialProfileId <= 0) {
    notFound();
  }

  return (
    <div className="w-full pb-6">
      <ProfileScreen userId={socialProfileId} />
    </div>
  );
}
