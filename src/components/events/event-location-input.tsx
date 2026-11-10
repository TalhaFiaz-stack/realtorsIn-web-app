"use client";

import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Autocomplete, useJsApiLoader } from "@react-google-maps/api";
import { MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { fetchGoogleMapsKeyClient } from "@/features/maps/services/google-maps.client";
import {
  GOOGLE_MAPS_LIBRARIES,
  GOOGLE_MAPS_LOADER_ID,
} from "@/lib/maps/google-maps-loader";

export type EventPlace = {
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
 * Event address with Google Places autocomplete — mobile `EventFormFields`
 * uses the same Places search and fills city / country / coordinates.
 * Falls back to a plain text field if Maps can't load.
 */
export function EventLocationInput({
  value,
  onTextChange,
  onPlaceSelect,
  id,
}: {
  value: string;
  onTextChange: (text: string) => void;
  onPlaceSelect: (place: EventPlace) => void;
  id?: string;
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
        placeholder="Search address or place"
        autoComplete="off"
      />
    </div>
  );

  if (!apiKey) return input;
  return (
    <PlacesAutocomplete apiKey={apiKey} onPlaceSelect={onPlaceSelect}>
      {input}
    </PlacesAutocomplete>
  );
}

function PlacesAutocomplete({
  apiKey,
  onPlaceSelect,
  children,
}: {
  apiKey: string;
  onPlaceSelect: (place: EventPlace) => void;
  children: React.ReactElement;
}) {
  const ref = useRef<google.maps.places.Autocomplete | null>(null);
  const { isLoaded, loadError } = useJsApiLoader({
    id: GOOGLE_MAPS_LOADER_ID,
    googleMapsApiKey: apiKey,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  if (!isLoaded || loadError) return children;

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
