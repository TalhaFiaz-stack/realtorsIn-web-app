import { MutualConnectionsScreen } from "@/components/network/mutual-connections-screen";

export const metadata = { title: "Mutual connections" };

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ name?: string }>;
};

export default async function MutualConnectionsPage({
  params,
  searchParams,
}: Props) {
  const { id } = await params;
  const { name } = await searchParams;
  const remUserId = Number(id);

  if (!Number.isFinite(remUserId) || remUserId <= 0) {
    return (
      <p className="text-sm text-destructive">Invalid member id for mutual list.</p>
    );
  }

  return (
    <MutualConnectionsScreen
      remUserId={remUserId}
      subjectName={name}
    />
  );
}
