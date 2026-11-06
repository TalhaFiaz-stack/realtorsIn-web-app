import { JobFormScreen } from "@/components/jobs/job-form-screen";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  return { title: `Edit job ${id}` };
}

export default async function EditJobPage({ params }: Props) {
  const { id } = await params;
  const jobId = Number(id);
  return <JobFormScreen jobId={jobId} />;
}
