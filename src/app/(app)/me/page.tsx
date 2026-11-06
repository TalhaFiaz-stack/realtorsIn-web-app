import { ProfileScreen } from "@/components/profile/profile-screen";

export const metadata = { title: "Profile" };

export default function MePage() {
  return (
    <div className="w-full pb-6">
      <ProfileScreen />
    </div>
  );
}
