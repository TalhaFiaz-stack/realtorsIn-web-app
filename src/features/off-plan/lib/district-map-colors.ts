export function generatePastelColor(index: number, total = 60): string {
  const hue = Math.floor((360 / total) * index);
  return `hsla(${hue}, 70%, 65%, 0.35)`;
}

export function generateStrokeColor(index: number, total = 60): string {
  const hue = Math.floor((360 / total) * index);
  return `hsl(${hue}, 70%, 40%)`;
}

export function buildDistrictColorMap(
  districtNames: string[]
): Record<string, { fill: string; stroke: string }> {
  const map: Record<string, { fill: string; stroke: string }> = {};
  let i = 0;
  districtNames.forEach((name) => {
    const key = name.toLowerCase().trim();
    if (!key || map[key]) return;
    map[key] = {
      fill: generatePastelColor(i),
      stroke: generateStrokeColor(i),
    };
    i += 1;
  });
  return map;
}
