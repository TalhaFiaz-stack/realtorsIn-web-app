/** Aligns with mobile `MapLegend.js` marker semantics. */
export function offPlanMarkerColors(projectStatus: string | null): {
  fill: string;
  stroke: string;
} {
  const s = (projectStatus ?? "").toLowerCase();
  if (s.includes("out of stock") || s.includes("sold")) {
    return { fill: "#ff4444", stroke: "#b91c1c" };
  }
  if (s.includes("pre sale") || s.includes("pending")) {
    return { fill: "#707070", stroke: "#404040" };
  }
  if (s.includes("announce")) {
    return { fill: "#87ebe6", stroke: "#0d9488" };
  }
  if (s.includes("on sale") || s.includes("sale")) {
    return { fill: "#4473ff", stroke: "#1d4ed8" };
  }
  return { fill: "#4473ff", stroke: "#1d4ed8" };
}

export const OFF_PLAN_MAP_LEGEND = [
  { label: "Announced", color: "#87ebe6" },
  { label: "On Sale", color: "#4473ff" },
  { label: "Out Of Stock", color: "#ff4444" },
  { label: "Pre Sale", color: "#707070" },
] as const;
