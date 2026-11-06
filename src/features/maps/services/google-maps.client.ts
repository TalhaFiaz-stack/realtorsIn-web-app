import { bffRequest } from "@/lib/api/client";

export async function fetchGoogleMapsKeyClient(signal?: AbortSignal) {
  return bffRequest<{ ok: true; googleMapsKey: string }>({
    path: "google-maps/key",
    method: "GET",
    signal,
  });
}
