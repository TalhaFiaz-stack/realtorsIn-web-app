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
  // Links (suggestion cards, rail) pass the member's social profile id —
  // the same `userId` used everywhere else in the web app.
  const socialProfileId = Number(id);

  if (!Number.isFinite(socialProfileId) || socialProfileId <= 0) {
    return (
      <p className="text-sm text-destructive">Invalid member id for mutual list.</p>
    );
  }

  return (
    <MutualConnectionsScreen
      socialProfileId={socialProfileId}
      subjectName={name}
    />
  );
}
