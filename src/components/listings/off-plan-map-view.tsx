"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Polygon,
  Marker,
  Tooltip,
  useMap,
  useMapEvents,
} from "react-leaflet";
import type { LatLngBoundsExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import "./off-plan-map.css";
import { OffPlanMapTopStart } from "@/components/listings/off-plan-map-legend";
import { OffPlanMapPopupCard } from "@/components/listings/off-plan-map-popup-card";
import type { OffPlanDistrict, OffPlanProjectSummary } from "@/features/off-plan/types/off-plan.types";
import { buildDistrictColorMap } from "@/features/off-plan/lib/district-map-colors";
import {
  districtsForMapView,
  getDistrictPolygonRing,
} from "@/features/off-plan/lib/off-plan-district-polygons";
import { offPlanMarkerColors } from "@/features/off-plan/lib/off-plan-map-status-colors";
import {
  clusterOffPlanProjects,
  getClusterBounds,
  type MapRegion,
} from "@/features/off-plan/lib/map-clustering";
import { cn } from "@/lib/utils";

const DEFAULT_CENTER: [number, number] = [25.2048, 55.2708];
const DEFAULT_ZOOM = 10;

function deltaFromZoom(zoom: number): number {
  return 360 / Math.pow(2, zoom);
}

function clusterDivIcon(count: number): L.DivIcon {
  let size = 36;
  if (count >= 500) size = 52;
  else if (count >= 100) size = 46;
  else if (count >= 50) size = 42;
  else if (count >= 10) size = 38;

  const fontSize = count >= 100 ? 11 : 12;
  return L.divIcon({
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<div class="off-plan-map-cluster" style="width:${size}px;height:${size}px;font-size:${fontSize}px"><div class="off-plan-map-cluster-inner">${count}</div></div>`,
  });
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

/** Mobile `MapMarker.js`: developer logo in a ring colored by project status. */
function projectMarkerDivIcon(
  project: OffPlanProjectSummary,
  selected: boolean
): L.DivIcon {
  const size = selected ? 28 : 22;
  const ring = offPlanMarkerColors(project.projectStatus).fill;
  const inner = project.developerImage
    ? `<img src="${escapeAttr(project.developerImage)}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:9999px" />`
    : `<div style="width:100%;height:100%;border-radius:9999px;background:#f1f1f1"></div>`;
  return L.divIcon({
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<div style="width:${size}px;height:${size}px;border-radius:9999px;border:2px solid ${ring};overflow:hidden;padding:1px;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.25)">${inner}</div>`,
  });
}

function MapRegionTracker({
  onRegionChange,
}: {
  onRegionChange: (region: MapRegion) => void;
}) {
  useMapEvents({
    moveend: (e) => {
      const map = e.target;
      const center = map.getCenter();
      const zoom = map.getZoom();
      const delta = deltaFromZoom(zoom);
      onRegionChange({
        latitude: center.lat,
        longitude: center.lng,
        latitudeDelta: delta,
        longitudeDelta: delta,
      });
    },
    zoomend: (e) => {
      const map = e.target;
      const center = map.getCenter();
      const zoom = map.getZoom();
      const delta = deltaFromZoom(zoom);
      onRegionChange({
        latitude: center.lat,
        longitude: center.lng,
        latitudeDelta: delta,
        longitudeDelta: delta,
      });
    },
  });
  return null;
}

function FlyToProject({
  project,
}: {
  project: OffPlanProjectSummary | null;
}) {
  const map = useMap();
  useEffect(() => {
    if (!project?.lat || !project?.lng) return;
    map.flyTo([project.lat, project.lng], Math.max(map.getZoom(), 13), {
      duration: 0.35,
    });
  }, [project, map]);
  return null;
}

function FlyToRegion({ region }: { region: MapRegion | null }) {
  const map = useMap();
  useEffect(() => {
    if (!region) return;
    const zoom = Math.min(map.getZoom() + 2, 15);
    map.flyTo([region.latitude, region.longitude], zoom, { duration: 0.35 });
  }, [region, map]);
  return null;
}

function polygonLatLngs(district: OffPlanDistrict): [number, number][] | null {
  const ring = getDistrictPolygonRing(district);
  if (!ring) return null;
  return ring.map(([lng, lat]) => [lat, lng] as [number, number]);
}

export function OffPlanMapView({
  projects,
  districts,
  selectedDistrictId,
  selectedProjectId,
  onSelectProject,
  onClusterClick,
  selectedProject,
  onOpenProject,
  className,
  overlayStart,
}: {
  projects: OffPlanProjectSummary[];
  districts: OffPlanDistrict[];
  selectedDistrictId?: string;
  selectedProjectId: string | null;
  onSelectProject: (id: string | null) => void;
  onClusterClick?: (bounds: MapRegion) => void;
  selectedProject?: OffPlanProjectSummary | null;
  onOpenProject?: () => void;
  className?: string;
  overlayStart?: React.ReactNode;
}) {
  const [region, setRegion] = useState<MapRegion>({
    latitude: DEFAULT_CENTER[0],
    longitude: DEFAULT_CENTER[1],
    latitudeDelta: 0.3,
    longitudeDelta: 0.3,
  });
  const [flyTarget, setFlyTarget] = useState<MapRegion | null>(null);

  const visibleDistricts = useMemo(
    () => districtsForMapView(districts, projects, selectedDistrictId),
    [districts, projects, selectedDistrictId]
  );

  const districtColors = useMemo(() => {
    const names = projects
      .map((p) => p.districtName)
      .filter((n): n is string => Boolean(n));
    return buildDistrictColorMap(names.length ? names : visibleDistricts.map((d) => d.title));
  }, [projects, visibleDistricts]);

  const { clusters, markers } = useMemo(
    () => clusterOffPlanProjects(projects, region),
    [projects, region]
  );

  const bounds = useMemo((): LatLngBoundsExpression | undefined => {
    const coords = projects
      .filter((p) => p.lat != null && p.lng != null)
      .map((p) => [p.lat!, p.lng!] as [number, number]);
    if (coords.length < 2) return undefined;
    return coords;
  }, [projects]);

  const handleClusterClick = useCallback(
    (cluster: (typeof clusters)[0]) => {
      const next = getClusterBounds(cluster);
      if (next) {
        setFlyTarget(next);
        onClusterClick?.(next);
      }
    },
    [onClusterClick]
  );

  const popupProject =
    selectedProject ??
    (selectedProjectId
      ? projects.find((p) => p.id === selectedProjectId) ?? null
      : null);

  return (
    <div
      className={cn(
        "off-plan-map-leaflet relative isolate h-[min(70vh,520px)] w-full overflow-hidden rounded-xl border border-border",
        className
      )}
    >
      <OffPlanMapTopStart leading={overlayStart} />
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        className="h-full w-full"
        scrollWheelZoom
        bounds={bounds}
        boundsOptions={{ padding: [24, 24] }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapRegionTracker onRegionChange={setRegion} />
        {flyTarget ? <FlyToRegion region={flyTarget} /> : null}
        {popupProject ? <FlyToProject project={popupProject} /> : null}

        {visibleDistricts.map((district) => {
          const latlngs = polygonLatLngs(district);
          if (!latlngs) return null;
          const colors =
            districtColors[district.title.toLowerCase().trim()] ??
            districtColors[district.title];
          return (
            <Polygon
              key={district.id}
              positions={latlngs}
              pathOptions={{
                color: colors?.stroke ?? "#334155",
                fillColor: colors?.fill ?? "rgba(59,130,246,0.2)",
                fillOpacity: 0.35,
                weight: 2,
              }}
            />
          );
        })}

        {clusters.map((cluster) => (
          <Marker
            key={cluster.id}
            position={[cluster.latitude, cluster.longitude]}
            icon={clusterDivIcon(cluster.count)}
            eventHandlers={{
              click: () => handleClusterClick(cluster),
            }}
          />
        ))}

        {markers.map((project) => {
          if (project.lat == null || project.lng == null) return null;
          const selected = selectedProjectId === project.id;
          return (
            <Marker
              key={project.id}
              position={[project.lat, project.lng]}
              zIndexOffset={selected ? 1000 : 0}
              icon={projectMarkerDivIcon(project, selected)}
              eventHandlers={{
                click: () =>
                  onSelectProject(selected ? null : project.id),
              }}
            >
              <Tooltip direction="top" offset={[0, -8]}>
                {project.title}
              </Tooltip>
            </Marker>
          );
        })}
      </MapContainer>

      {popupProject && onOpenProject ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-4 z-[1001] flex justify-center px-3">
          <OffPlanMapPopupCard
            project={popupProject}
            onClose={() => onSelectProject(null)}
            onOpen={onOpenProject}
          />
        </div>
      ) : null}
    </div>
  );
}
