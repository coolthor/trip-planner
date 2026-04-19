import type { TripData } from '../types/trip';

const STORAGE_KEY = 'trip-planner:data';

export function saveTrip(data: TripData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // quota exceeded or private browsing — silently skip
  }
}

export function loadTrip(): TripData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as TripData;
  } catch {
    return null;
  }
}

export function clearTrip(): void {
  localStorage.removeItem(STORAGE_KEY);
}
