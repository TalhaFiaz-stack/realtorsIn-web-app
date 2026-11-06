import { MessagesLayoutClient } from "@/app/(app)/messages/messages-layout-client";

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MessagesLayoutClient>{children}</MessagesLayoutClient>;
}
