"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Autocomplete, useJsApiLoader } from "@react-google-maps/api";
import { MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { fetchGoogleMapsKeyClient } from "@/features/maps/services/google-maps.client";
import {
  GOOGLE_MAPS_LIBRARIES,
  GOOGLE_MAPS_LOADER_ID,
} from "@/lib/maps/google-maps-loader";

export type PlacePick = {
  address: string;
  city: string;
  country: string;
  latitude: string;
  longitude: string;
};

function component(
  place: google.maps.places.PlaceResult,
  ...types: string[]
): string {
  const match = place.address_components?.find((c) =>
    types.some((t) => c.types.includes(t))
  );
  return match?.long_name ?? "";
}

/**
 * Address / place search with Google Places autocomplete — same as mobile
 * `LocationInput` (events, jobs). Fills address, city, country and
 * coordinates. Falls back to a plain text field if Maps can't load;
 * `onPlacesReady` tells the parent whether suggestions are available.
 */
export function PlaceAutocompleteInput({
  value,
  onTextChange,
  onPlaceSelect,
  onPlacesReady,
  id,
  placeholder = "Search address or place",
}: {
  value: string;
  onTextChange: (text: string) => void;
  onPlaceSelect: (place: PlacePick) => void;
  onPlacesReady?: (ready: boolean) => void;
  id?: string;
  placeholder?: string;
}) {
  const keyQuery = useQuery({
    queryKey: ["google-maps", "key"],
    queryFn: ({ signal }) => fetchGoogleMapsKeyClient(signal),
    staleTime: 60 * 60_000,
  });
  const apiKey = keyQuery.data?.googleMapsKey ?? "";

  const input = (
    <div className="relative">
      <MapPin
        className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        id={id}
        className="ps-9"
        value={value}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
      />
    </div>
  );

  if (!apiKey) return input;
  return (
    <PlacesAutocomplete apiKey={apiKey} onPlaceSelect={onPlaceSelect} onPlacesReady={onPlacesReady}>
      {input}
    </PlacesAutocomplete>
  );
}

function PlacesAutocomplete({
  apiKey,
  onPlaceSelect,
  onPlacesReady,
  children,
}: {
  apiKey: string;
  onPlaceSelect: (place: PlacePick) => void;
  onPlacesReady?: (ready: boolean) => void;
  children: React.ReactElement;
}) {
  const ref = useRef<google.maps.places.Autocomplete | null>(null);
  const { isLoaded, loadError } = useJsApiLoader({
    id: GOOGLE_MAPS_LOADER_ID,
    googleMapsApiKey: apiKey,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  const ready = isLoaded && !loadError;
  useEffect(() => {
    onPlacesReady?.(ready);
  }, [ready, onPlacesReady]);

  if (!ready) return children;

  return (
    <Autocomplete
      onLoad={(instance) => {
        ref.current = instance;
      }}
      options={{ fields: ["formatted_address", "name", "geometry", "address_components"] }}
      onPlaceChanged={() => {
        const place = ref.current?.getPlace();
        if (!place) return;
        const lat = place.geometry?.location?.lat();
        const lng = place.geometry?.location?.lng();
        const address =
          place.formatted_address || place.name || "";
        onPlaceSelect({
          address,
          city:
            component(place, "locality") ||
            component(place, "administrative_area_level_1"),
          country: component(place, "country"),
          latitude: lat != null ? String(lat) : "",
          longitude: lng != null ? String(lng) : "",
        });
      }}
    >
      {children}
    </Autocomplete>
  );
}
