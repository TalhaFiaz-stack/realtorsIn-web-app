"use client";

import { MapContainer, Marker, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./off-plan-detail-leaflet.css";

const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export type OffPlanDetailLocationMapInnerProps = {
  lat: number;
  lng: number;
  label: string;
  thumbnail?: string | null;
};

export function OffPlanDetailLocationMapInner({
  lat,
  lng,
  label,
}: OffPlanDetailLocationMapInnerProps) {
  return (
    <div className="off-plan-detail-leaflet-map relative isolate z-0 overflow-hidden rounded-lg">
      <MapContainer
        center={[lat, lng]}
        zoom={13}
        scrollWheelZoom={false}
        className="relative z-0 h-52 w-full md:h-60"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]} icon={markerIcon} title={label} />
      </MapContainer>
    </div>
  );
}
