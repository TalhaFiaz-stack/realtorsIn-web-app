"use client";

import { usePathname } from "next/navigation";
import { MessagesWorkspace } from "@/components/chat/messages-workspace";
import { conversationIdFromPath } from "@/features/chat/lib/conversation-id-from-path";

export function MessagesLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const conversationId = conversationIdFromPath(pathname);

  return (
    <>
      <MessagesWorkspace conversationId={conversationId} />
      {children}
    </>
  );
}
