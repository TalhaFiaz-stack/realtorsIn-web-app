/** Match mobile `Api.js`: `{baseURL}/api/{endpoint}`. */
export function remApiPath(path: string): string {
  const trimmed = path.replace(/^\/+/, "");
  if (trimmed.toLowerCase().startsWith("api/")) {
    return `/${trimmed}`;
  }
  return `/api/${trimmed}`;
}
