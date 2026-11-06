import { notFound } from "next/navigation";

export const metadata = { title: "Chat" };

type Props = { params: Promise<{ id: string }> };

export default async function ChatThreadPage({ params }: Props) {
  const { id } = await params;
  const conversationId = Number(id);
  if (!Number.isFinite(conversationId) || conversationId <= 0) {
    notFound();
  }
  return null;
}
