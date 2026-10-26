export type Punkt = { lat: number; lon: number };

/** Odległość w linii prostej (km), wzór haversine. */
export function odlegloscKm(a: Punkt, b: Punkt) {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLon = (b.lon - a.lon) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

/** 0.35 → „350 m”, 1.24 → „1,2 km”, 12.6 → „13 km” */
export function opisOdleglosci(km: number) {
  if (km < 1) return `${Math.max(50, Math.round((km * 1000) / 50) * 50)} m`;
  if (km < 10) return `${km.toFixed(1).replace(".", ",")} km`;
  return `${Math.round(km)} km`;
}
