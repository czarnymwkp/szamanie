export type Point = { lat: number; lon: number };

/** Odległość w linii prostej (km), wzór haversine. */
export function distanceKm(a: Point, b: Point) {
  const toRad = Math.PI / 180;
  const deltaLat = (b.lat - a.lat) * toRad;
  const deltaLon = (b.lon - a.lon) * toRad;
  const h = Math.sin(deltaLat / 2) ** 2 + Math.cos(a.lat * toRad) * Math.cos(b.lat * toRad) * Math.sin(deltaLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

/** 0.35 → „350 m”, 1.24 → „1,2 km”, 12.6 → „13 km” */
export function distanceDescription(km: number) {
  if (km < 1) return `${Math.max(50, Math.round((km * 1000) / 50) * 50)} m`;
  if (km < 10) return `${km.toFixed(1).replace(".", ",")} km`;
  return `${Math.round(km)} km`;
}
