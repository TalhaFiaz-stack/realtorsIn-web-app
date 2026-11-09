import { NotificationsScreen } from "@/components/notifications/notifications-screen";

export const metadata = { title: "Notifications" };

export default function NotificationsPage() {
  return (
    <div className="mx-auto w-full max-w-2xl pb-6">
      <NotificationsScreen />
    </div>
  );
}
