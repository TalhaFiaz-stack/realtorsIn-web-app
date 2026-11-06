import type { InfluencerStatus } from "@/features/influencer/types/influencer.types";

export type InfluencerFirstVideoPrompt = {
  status: InfluencerStatus;
};

type Listener = (payload: InfluencerFirstVideoPrompt) => void;

const listeners = new Set<Listener>();

export function subscribeInfluencerFirstVideoPrompt(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function emitInfluencerFirstVideoPrompt(payload: InfluencerFirstVideoPrompt): void {
  for (const listener of listeners) {
    listener(payload);
  }
}
