import { EventAttendeesScreen } from "@/components/events/event-attendees-screen";

type Props = { params: Promise<{ id: string }> };

export default async function EventAttendeesPage({ params }: Props) {
  const { id } = await params;
  return <EventAttendeesScreen eventId={Number(id)} />;
}
