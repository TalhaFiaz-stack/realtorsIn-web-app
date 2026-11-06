"use client";

import { useState } from "react";
import { FeedSuggestionSection } from "@/components/feed/feed-suggestion-section";
import { JobCard } from "@/components/jobs/job-card";
import type { JobPost } from "@/features/jobs/types/job.types";

export function FeedJobsSuggestionsRow({ jobs }: { jobs: JobPost[] }) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || jobs.length === 0) return null;

  return (
    <FeedSuggestionSection
      title="Recommended jobs"
      showAllHref="/jobs"
      onDismiss={() => setDismissed(true)}
    >
      {jobs.map((job) => (
        <div
          key={job.id}
          className="w-[min(78vw,20rem)] shrink-0 snap-start"
        >
          <JobCard job={job} />
        </div>
      ))}
    </FeedSuggestionSection>
  );
}
