import { EventFormScreen } from "@/components/events/event-form-screen";

type Props = { params: Promise<{ id: string }> };

export default async function EditEventPage({ params }: Props) {
  const { id } = await params;
  return <EventFormScreen eventId={Number(id)} />;
}
