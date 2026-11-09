"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  GoogleMap,
  OverlayView,
  Polygon,
  useJsApiLoader,
} from "@react-google-maps/api";
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

const DEFAULT_CENTER = { lat: 25.2048, lng: 55.2708 };
const DEFAULT_ZOOM = 10;
const MAP_CONTAINER_STYLE = { width: "100%", height: "100%" };

function districtPaths(
  district: OffPlanDistrict
): google.maps.LatLngLiteral[] | null {
  const ring = getDistrictPolygonRing(district);
  if (!ring) return null;
  return ring.map(([lng, lat]) => ({ lat, lng }));
}

function clusterSize(count: number): number {
  if (count >= 500) return 52;
  if (count >= 100) return 46;
  if (count >= 50) return 42;
  if (count >= 10) return 38;
  return 36;
}

/** Rough UAE box — ignores projects with bad coordinates when fitting the view. */
const UAE_BOUNDS = { minLat: 22.4, maxLat: 26.5, minLng: 51.0, maxLng: 56.6 };

function inUae(lat: number, lng: number): boolean {
  return (
    lat >= UAE_BOUNDS.minLat &&
    lat <= UAE_BOUNDS.maxLat &&
    lng >= UAE_BOUNDS.minLng &&
    lng <= UAE_BOUNDS.maxLng
  );
}

/**
 * Fit the view to the projects once per result set, and never after the
 * user has moved the map. Outliers outside the UAE are ignored (one bad
 * coordinate used to zoom the map out to Iran/Oman).
 */
function FitProjectsBounds({
  map,
  projects,
}: {
  map: google.maps.Map;
  projects: OffPlanProjectSummary[];
}) {
  const userMovedRef = useRef(false);
  const fittedKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const listeners = [
      map.addListener("dragstart", () => {
        userMovedRef.current = true;
      }),
      map.addListener("zoom_changed", () => {
        // Programmatic fitBounds also zooms; only count it once fitted.
        if (fittedKeyRef.current) userMovedRef.current = true;
      }),
    ];
    return () => listeners.forEach((l) => l.remove());
  }, [map]);

  useEffect(() => {
    if (!map || typeof google === "undefined" || userMovedRef.current) return;
    const points = projects.filter(
      (p) => p.lat != null && p.lng != null && inUae(p.lat, p.lng)
    );
    const key = `${points.length}:${points[0]?.id ?? ""}:${points.at(-1)?.id ?? ""}`;
    if (fittedKeyRef.current === key) return;
    fittedKeyRef.current = null;
    const bounds = new google.maps.LatLngBounds();
    if (points.length >= 2) {
      // Fit the central 90% so a few far-off projects don't zoom the view out.
      const lats = points.map((p) => p.lat!).sort((x, y) => x - y);
      const lngs = points.map((p) => p.lng!).sort((x, y) => x - y);
      const lo = Math.floor((points.length - 1) * 0.05);
      const hi = Math.ceil((points.length - 1) * 0.95);
      bounds.extend({ lat: lats[lo], lng: lngs[lo] });
      bounds.extend({ lat: lats[hi], lng: lngs[hi] });
    } else {
      bounds.extend({ lat: UAE_BOUNDS.minLat, lng: UAE_BOUNDS.minLng });
      bounds.extend({ lat: UAE_BOUNDS.maxLat, lng: UAE_BOUNDS.maxLng });
    }
    map.fitBounds(bounds, 56);
    // Mark fitted after the zoom event fired by fitBounds settles.
    const once = google.maps.event.addListenerOnce(map, "idle", () => {
      fittedKeyRef.current = key;
    });
    return () => once.remove();
  }, [map, projects]);
  return null;
}

function MapLayers({
  map,
  projects,
  districts,
  selectedDistrictId,
  selectedProjectId,
  onSelectProject,
  selectedProject,
}: {
  map: google.maps.Map;
  projects: OffPlanProjectSummary[];
  districts: OffPlanDistrict[];
  selectedDistrictId?: string;
  selectedProjectId: string | null;
  onSelectProject: (id: string | null) => void;
  selectedProject?: OffPlanProjectSummary | null;
}) {
  const [region, setRegion] = useState<MapRegion>({
    latitude: DEFAULT_CENTER.lat,
    longitude: DEFAULT_CENTER.lng,
    latitudeDelta: 0.3,
    longitudeDelta: 0.3,
  });

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

  useEffect(() => {
    const sync = () => {
      const bounds = map.getBounds();
      if (!bounds) return;
      const ne = bounds.getNorthEast();
      const sw = bounds.getSouthWest();
      setRegion({
        latitude: (ne.lat() + sw.lat()) / 2,
        longitude: (ne.lng() + sw.lng()) / 2,
        latitudeDelta: Math.abs(ne.lat() - sw.lat()),
        longitudeDelta: Math.abs(ne.lng() - sw.lng()),
      });
    };
    sync();
    const idle = map.addListener("idle", sync);
    return () => {
      google.maps.event.removeListener(idle);
    };
  }, [map]);

  useEffect(() => {
    if (!selectedProject?.lat || !selectedProject?.lng) return;
    map.panTo({ lat: selectedProject.lat, lng: selectedProject.lng });
    const zoom = map.getZoom() ?? DEFAULT_ZOOM;
    if (zoom < 13) map.setZoom(13);
  }, [map, selectedProject]);

  const handleClusterClick = useCallback(
    (cluster: (typeof clusters)[0]) => {
      const next = getClusterBounds(cluster);
      if (!next) return;
      map.panTo({ lat: next.latitude, lng: next.longitude });
      map.setZoom(Math.min((map.getZoom() ?? DEFAULT_ZOOM) + 2, 15));
    },
    [map]
  );

  return (
    <>
      <FitProjectsBounds map={map} projects={projects} />
      {visibleDistricts.map((district) => {
        const paths = districtPaths(district);
        if (!paths) return null;
        const colors =
          districtColors[district.title.toLowerCase().trim()] ??
          districtColors[district.title];
        return (
          <Polygon
            key={district.id}
            paths={paths}
            options={{
              strokeColor: colors?.stroke ?? "#334155",
              fillColor: colors?.fill ?? "#3b82f6",
              fillOpacity: 0.35,
              strokeWeight: 2,
              clickable: false,
            }}
          />
        );
      })}

      {clusters.map((cluster) => {
        const size = clusterSize(cluster.count);
        return (
          <OverlayView
            key={cluster.id}
            position={{ lat: cluster.latitude, lng: cluster.longitude }}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            getPixelPositionOffset={(w, h) => ({
              x: -(w || size) / 2,
              y: -(h || size) / 2,
            })}
          >
            <button
              type="button"
              className="off-plan-map-cluster cursor-pointer border-0 p-0"
              style={{
                width: size,
                height: size,
                fontSize: cluster.count >= 100 ? 11 : 12,
              }}
              onClick={() => handleClusterClick(cluster)}
              aria-label={`${cluster.count} projects`}
            >
              <div className="off-plan-map-cluster-inner">{cluster.count}</div>
            </button>
          </OverlayView>
        );
      })}

      {markers.map((project) => {
        if (project.lat == null || project.lng == null) return null;
        const selected = selectedProjectId === project.id;
        const ring = offPlanMarkerColors(project.projectStatus).fill;
        const size = selected ? 28 : 22;
        return (
          <OverlayView
            key={project.id}
            position={{ lat: project.lat, lng: project.lng }}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            getPixelPositionOffset={() => ({ x: -size / 2, y: -size / 2 })}
          >
            <button
              type="button"
              className="cursor-pointer border-0 bg-transparent p-0"
              onClick={() => onSelectProject(selected ? null : project.id)}
              aria-label={project.title}
            >
              <div
                style={{
                  width: size,
                  height: size,
                  borderRadius: 9999,
                  border: `2px solid ${ring}`,
                  overflow: "hidden",
                  padding: 1,
                  background: "#fff",
                  boxShadow: "0 1px 4px rgba(0,0,0,.25)",
                }}
              >
                {project.developerImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={project.developerImage}
                    alt=""
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full rounded-full bg-muted" />
                )}
              </div>
            </button>
          </OverlayView>
        );
      })}

    </>
  );
}

export function OffPlanGoogleMapView({
  apiKey,
  projects,
  districts,
  selectedDistrictId,
  selectedProjectId,
  onSelectProject,
  selectedProject,
  onOpenProject,
  className,
  overlayStart,
}: {
  apiKey: string;
  projects: OffPlanProjectSummary[];
  districts: OffPlanDistrict[];
  selectedDistrictId?: string;
  selectedProjectId: string | null;
  onSelectProject: (id: string | null) => void;
  selectedProject?: OffPlanProjectSummary | null;
  onOpenProject?: () => void;
  className?: string;
  overlayStart?: React.ReactNode;
}) {
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: "realtorsin-google-maps",
    googleMapsApiKey: apiKey,
  });

  if (loadError) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center text-sm text-muted-foreground">
        Unable to load Google Maps. Check the API key in admin settings.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex h-full items-center justify-center bg-muted text-sm text-muted-foreground">
        Loading map…
      </div>
    );
  }

  const popupProject =
    selectedProject ??
    (selectedProjectId
      ? projects.find((p) => p.id === selectedProjectId) ?? null
      : null);

  return (
    <div
      className={cn(
        "relative isolate h-[min(70vh,520px)] w-full overflow-hidden rounded-xl border border-border",
        className
      )}
    >
      <OffPlanMapTopStart leading={overlayStart} />
      <GoogleMap
        mapContainerStyle={MAP_CONTAINER_STYLE}
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        onLoad={setMapInstance}
        onUnmount={() => setMapInstance(null)}
        options={{
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        }}
      >
        {mapInstance ? (
          <MapLayers
            map={mapInstance}
            projects={projects}
            districts={districts}
            selectedDistrictId={selectedDistrictId}
            selectedProjectId={selectedProjectId}
            onSelectProject={onSelectProject}
            selectedProject={selectedProject}
          />
        ) : null}
      </GoogleMap>
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
