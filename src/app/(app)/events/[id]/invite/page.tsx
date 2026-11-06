import { EventInviteScreen } from "@/components/events/event-invite-screen";

type Props = { params: Promise<{ id: string }> };

export default async function EventInvitePage({ params }: Props) {
  const { id } = await params;
  return <EventInviteScreen eventId={Number(id)} />;
}
