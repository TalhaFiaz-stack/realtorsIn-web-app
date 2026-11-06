import type { OffPlanProjectSummary } from "@/features/off-plan/types/off-plan.types";

export type MapRegion = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

export type MarkerCluster = {
  id: string;
  latitude: number;
  longitude: number;
  count: number;
  projects: OffPlanProjectSummary[];
};

const fastDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const x = lat2 - lat1;
  const y = (lng2 - lng1) * Math.cos((lat1 * Math.PI) / 180);
  return Math.sqrt(x * x + y * y) * 111;
};

function projectCoords(p: OffPlanProjectSummary): { lat: number; lng: number } | null {
  if (p.lat == null || p.lng == null) return null;
  if (!Number.isFinite(p.lat) || !Number.isFinite(p.lng)) return null;
  return { lat: p.lat, lng: p.lng };
}

/** Port of mobile `mapClustering.js` for web map zoom (latitudeDelta). */
export function clusterOffPlanProjects(
  projects: OffPlanProjectSummary[],
  region: MapRegion | null
): { clusters: MarkerCluster[]; markers: OffPlanProjectSummary[] } {
  const markers = projects.filter((p) => projectCoords(p) != null);
  if (!markers.length) {
    return { clusters: [], markers: [] };
  }

  const latitudeDelta = region?.latitudeDelta ?? 0.3;

  if (latitudeDelta < 0.003) {
    return { clusters: [], markers };
  }

  const showOnlyClusters = latitudeDelta > 0.01;
  const clusters: MarkerCluster[] = [];
  const processed = new Set<string>();
  const clusterThreshold = latitudeDelta * 6;

  const parsed = markers
    .map((marker) => {
      const c = projectCoords(marker)!;
      return { marker, lat: c.lat, lng: c.lng };
    })
    .filter(Boolean);

  parsed.forEach(({ marker, lat, lng }, index) => {
    if (processed.has(marker.id)) return;

    const group: OffPlanProjectSummary[] = [marker];
    processed.add(marker.id);

    for (const other of parsed) {
      if (processed.has(other.marker.id)) continue;
      const d = fastDistance(lat, lng, other.lat, other.lng);
      if (d < clusterThreshold) {
        group.push(other.marker);
        processed.add(other.marker.id);
      }
    }

    if (group.length < 10) {
      group.forEach((p) => processed.delete(p.id));
      return;
    }

    const minClusterSize =
      latitudeDelta > 1
        ? 50
        : latitudeDelta > 0.5
          ? 40
          : latitudeDelta > 0.1
            ? 30
            : latitudeDelta > 0.05
              ? 20
              : latitudeDelta > 0.01
                ? 15
                : 10;

    if (group.length >= minClusterSize || showOnlyClusters) {
      const latSum = group.reduce((s, p) => s + (p.lat ?? 0), 0);
      const lngSum = group.reduce((s, p) => s + (p.lng ?? 0), 0);
      clusters.push({
        id: `cluster-${marker.id}-${index}`,
        latitude: latSum / group.length,
        longitude: lngSum / group.length,
        count: group.length,
        projects: group,
      });
    } else {
      group.forEach((p) => processed.delete(p.id));
    }
  });

  const individualMarkers = parsed
    .filter(({ marker }) => !processed.has(marker.id))
    .map(({ marker }) => marker);

  return { clusters, markers: individualMarkers };
}

export function getClusterBounds(cluster: MarkerCluster): MapRegion | null {
  const coords = cluster.projects
    .map(projectCoords)
    .filter((c): c is { lat: number; lng: number } => c != null);
  if (!coords.length) return null;

  const lats = coords.map((c) => c.lat);
  const lngs = coords.map((c) => c.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const latDelta = Math.max((maxLat - minLat) * 1.5, 0.002);
  const lngDelta = Math.max((maxLng - minLng) * 1.5, 0.002);

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: latDelta,
    longitudeDelta: lngDelta,
  };
}
