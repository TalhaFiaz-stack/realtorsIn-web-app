"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  cancelEventRequest,
  createEventRequest,
  deleteEventRequest,
  inviteToEventRequest,
  publishEventRequest,
  updateEventRequest,
} from "@/features/events/services/events.client";

export function useEventMutations(eventId?: number) {
  const queryClient = useQueryClient();

  function invalidate() {
    void queryClient.invalidateQueries({ queryKey: ["events"] });
  }

  const create = useMutation({
    mutationFn: createEventRequest,
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: (form: FormData) => {
      if (!eventId) throw new Error("Missing event id");
      return updateEventRequest(eventId, form);
    },
    onSuccess: invalidate,
  });

  const publish = useMutation({
    mutationFn: () => {
      if (!eventId) throw new Error("Missing event id");
      return publishEventRequest(eventId);
    },
    onSuccess: invalidate,
  });

  const cancel = useMutation({
    mutationFn: (note?: string) => {
      if (!eventId) throw new Error("Missing event id");
      return cancelEventRequest(eventId, note);
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: () => {
      if (!eventId) throw new Error("Missing event id");
      return deleteEventRequest(eventId);
    },
    onSuccess: invalidate,
  });

  const invite = useMutation({
    mutationFn: (inviteeIds: number[]) => {
      if (!eventId) throw new Error("Missing event id");
      return inviteToEventRequest(eventId, inviteeIds);
    },
  });

  return { create, update, publish, cancel, remove, invite };
}
