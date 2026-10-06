/** Static logistics knowledge base: Uzbek cities with coordinates and per-km freight rates. */

export interface City {
  id: string;
  name: string;
  nameRu: string;
  lat: number;
  lon: number;
}

export const CITIES: City[] = [
  { id: "tashkent", name: "Toshkent", nameRu: "Ташкент", lat: 41.2995, lon: 69.2401 },
  { id: "samarkand", name: "Samarqand", nameRu: "Самарканд", lat: 39.6542, lon: 66.9597 },
  { id: "bukhara", name: "Buxoro", nameRu: "Бухара", lat: 39.7747, lon: 64.4286 },
  { id: "fergana", name: "Farg‘ona", nameRu: "Фергана", lat: 40.3864, lon: 71.7841 },
  { id: "namangan", name: "Namangan", nameRu: "Наманган", lat: 40.9983, lon: 71.6726 },
  { id: "andijan", name: "Andijon", nameRu: "Андижан", lat: 40.7821, lon: 72.3442 },
  { id: "nukus", name: "Nukus", nameRu: "Нукус", lat: 42.4619, lon: 59.6162 },
  { id: "urgench", name: "Urganch", nameRu: "Ургенч", lat: 41.5511, lon: 60.6253 },
  { id: "karshi", name: "Qarshi", nameRu: "Карши", lat: 38.8603, lon: 65.7967 },
  { id: "termiz", name: "Termiz", nameRu: "Термез", lat: 37.2242, lon: 67.2783 },
  { id: "jizzakh", name: "Jizzax", nameRu: "Джизак", lat: 40.1158, lon: 67.8422 },
  { id: "guliston", name: "Guliston", nameRu: "Гулистан", lat: 40.4837, lon: 68.7843 },
];

const R = 6371;

export function haversineKm(a: City, b: City): number {
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s)));
}

/**
 * Nearest-neighbour route starting from Tashkent. Returns an ordered city list
 * (first element = depot) plus total round-trip km.
 */
export function optimizeRoute(destinations: City[]): { order: City[]; totalKm: number } {
  const from = CITIES.find((c) => c.id === "tashkent") ?? destinations[0];
  const pool = [...destinations].filter((c) => c.id !== from.id);
  if (pool.length === 0) return { order: [from], totalKm: 0 };

  const order: City[] = [from];
  let current = from;
  while (pool.length > 0) {
    let bestIdx = 0;
    let bestKm = Infinity;
    pool.forEach((c, i) => {
      const d = haversineKm(current, c);
      if (d < bestKm) {
        bestKm = d;
        bestIdx = i;
      }
    });
    const next = pool.splice(bestIdx, 1)[0];
    order.push(next);
    current = next;
  }
  // Return to depot.
  const totalKm =
    order.slice(1).reduce((s, c, i) => s + haversineKm(order[i], c), 0) +
    haversineKm(order[order.length - 1], from);
  return { order, totalKm };
}

export interface CargoEstimate {
  weightKg: number;
  volumeM3: number;
  distanceKm: number;
  baseKm: number; // UZS per km
  weightFactor: number; // UZS per kg
  volumeFactor: number; // UZS per m3
  costUZS: number;
  etaHours: number;
}

const BASE_KM_UZS = 4200; // per km
const WEIGHT_KG_UZS = 650; // per kg
const VOLUME_M3_UZS = 9500; // per m3
const AVG_SPEED_KMH = 65;

export function estimateCargo(input: {
  weightKg: number;
  volumeM3: number;
  distanceKm: number;
}): CargoEstimate {
  const baseKm = Math.max(50, input.distanceKm) * BASE_KM_UZS;
  const weightFactor = Math.max(0, input.weightKg) * WEIGHT_KG_UZS;
  const volumeFactor = Math.max(0, input.volumeM3) * VOLUME_M3_UZS;
  const costUZS = baseKm + weightFactor + volumeFactor;
  const etaHours = Math.max(1, Math.round((input.distanceKm / AVG_SPEED_KMH) * 10) / 10);
  return {
    weightKg: Math.max(0, input.weightKg),
    volumeM3: Math.max(0, input.volumeM3),
    distanceKm: Math.max(50, input.distanceKm),
    baseKm,
    weightFactor,
    volumeFactor,
    costUZS,
    etaHours,
  };
}

export interface RouteReport {
  order: City[];
  legs: { from: string; to: string; km: number }[];
  totalKm: number;
  date: string;
}

export function buildRouteReport(order: City[], totalKm: number): RouteReport {
  const legs = order.slice(1).map((c, i) => ({
    from: order[i].name,
    to: c.name,
    km: haversineKm(order[i], c),
  }));
  const back = haversineKm(order[order.length - 1], order[0]);
  legs.push({ from: order[order.length - 1].name, to: `${order[0].name} (qaytish)`, km: back });
  return { order, legs, totalKm, date: new Date().toISOString() };
}