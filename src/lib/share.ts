import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import type { TripData } from '../types/trip';

export function encodeTrip(data: TripData): string {
  const json = JSON.stringify(data);
  const compressed = compressToEncodedURIComponent(json);
  return `${window.location.origin}${window.location.pathname}#trip=${compressed}`;
}

export function decodeTrip(hash: string): TripData | null {
  if (!hash.startsWith('#trip=')) return null;
  try {
    const compressed = hash.slice(6);
    const json = decompressFromEncodedURIComponent(compressed);
    if (!json) return null;
    const data = JSON.parse(json) as TripData;
    if (!data.trip || !data.days) return null;
    return data;
  } catch {
    return null;
  }
}

export async function copyShareURL(data: TripData): Promise<boolean> {
  const url = encodeTrip(data);
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    return false;
  }
}
