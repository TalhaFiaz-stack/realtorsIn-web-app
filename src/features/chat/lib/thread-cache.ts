import type { QueryClient } from "@tanstack/react-query";
import type { ChatMessage, MessagesPage } from "@/features/chat/types/chat.types";

export type InfiniteMessages = {
  pages: MessagesPage[];
  pageParams: unknown[];
};

export function threadQueryKey(conversationId: number) {
  return ["chat", "messages", conversationId] as const;
}

/** Append to the newest page (pages[0]); no-op if the id is already present. */
export function appendMessage(
  current: InfiniteMessages | undefined,
  message: ChatMessage
): InfiniteMessages | undefined {
  if (!current?.pages?.length) return current;
  const exists = current.pages.some((page) =>
    page.messages.some((item) => item.id === message.id)
  );
  if (exists) return current;
  const [first, ...rest] = current.pages;
  return {
    ...current,
    pages: [{ ...first, messages: [...(first.messages ?? []), message] }, ...rest],
  };
}

/** Put a message into the cached thread without refetching every page. */
export function appendMessageToThread(queryClient: QueryClient, message: ChatMessage) {
  queryClient.setQueryData<InfiniteMessages>(
    threadQueryKey(message.conversationId),
    (current) => appendMessage(current, message)
  );
}
