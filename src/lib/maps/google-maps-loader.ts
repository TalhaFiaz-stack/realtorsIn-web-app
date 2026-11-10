/**
 * One Google Maps JS loader config for the whole app. `useJsApiLoader` throws
 * if two callers use the same id with different options, so the off-plan map
 * and the Places address inputs must share these exact values.
 */
export const GOOGLE_MAPS_LOADER_ID = "realtorsin-google-maps";

/** Stable reference — a new array each render would re-trigger the loader. */
export const GOOGLE_MAPS_LIBRARIES: ("places")[] = ["places"];
