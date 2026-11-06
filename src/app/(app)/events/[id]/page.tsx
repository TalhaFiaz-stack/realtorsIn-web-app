import { EventDetailScreen } from "@/components/events/event-detail-screen";

export const metadata = { title: "Event" };

type Props = { params: Promise<{ id: string }> };

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params;
  const eventId = Number(id);
  return <EventDetailScreen eventId={eventId} />;
}
