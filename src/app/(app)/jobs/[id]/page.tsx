import { JobDetailScreen } from "@/components/jobs/job-detail-screen";

export const metadata = { title: "Job" };

type Props = { params: Promise<{ id: string }> };

export default async function JobDetailPage({ params }: Props) {
  const { id } = await params;
  return <JobDetailScreen jobId={Number(id)} />;
}
