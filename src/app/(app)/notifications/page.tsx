import { NotificationsScreen } from "@/components/notifications/notifications-screen";

export const metadata = { title: "Notifications" };

export default function NotificationsPage() {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-3 pb-6">
      <header className="space-y-1 px-1">
        <h1 className="text-xl font-semibold tracking-tight">Notifications</h1>
        <p className="text-sm text-muted-foreground">
          Updates from your network and activity.
        </p>
      </header>
      <NotificationsScreen />
    </div>
  );
}
