"use client";

import { useState } from "react";
import { FeedSuggestionSection } from "@/components/feed/feed-suggestion-section";
import { EventCard } from "@/components/events/event-card";
import type { SocialEvent } from "@/features/events/types/event.types";

export function FeedEventsSuggestionsRow({ events }: { events: SocialEvent[] }) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || events.length === 0) return null;

  return (
    <FeedSuggestionSection
      title="Upcoming events"
      showAllHref="/events"
      onDismiss={() => setDismissed(true)}
    >
      {events.map((event) => (
        <div
          key={event.id}
          className="w-[min(72vw,17.5rem)] shrink-0 snap-start"
        >
          <EventCard event={event} variant="compact" />
        </div>
      ))}
    </FeedSuggestionSection>
  );
}
