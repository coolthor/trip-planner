import type { Weather } from '../types/trip';

interface CityCoords {
  lat: number;
  lon: number;
}

const CITY_COORDS: Record<string, CityCoords> = {
  '福岡': { lat: 33.5904, lon: 130.4017 },
  '博多': { lat: 33.5904, lon: 130.4017 },
  '太宰府': { lat: 33.5194, lon: 130.5353 },
  '柳川': { lat: 33.1631, lon: 130.4058 },
  '別府': { lat: 33.2846, lon: 131.4914 },
  '由布院': { lat: 33.2662, lon: 131.3697 },
  '天神': { lat: 33.5904, lon: 130.4017 },
  '門司港': { lat: 33.9462, lon: 130.9613 },
  '糸島': { lat: 33.5560, lon: 130.2140 },
  '小倉': { lat: 33.8834, lon: 130.8752 },
};

const WMO_TO_ICON: Record<number, { icon: string; label: string }> = {
  0:  { icon: 'Sun',   label: '晴天' },
  1:  { icon: 'Sun',   label: '大致晴' },
  2:  { icon: 'Cloud', label: '多雲' },
  3:  { icon: 'Cloud', label: '陰天' },
  45: { icon: 'Cloud', label: '霧' },
  48: { icon: 'Cloud', label: '凍霧' },
  51: { icon: 'Cloud', label: '小雨' },
  53: { icon: 'Cloud', label: '中雨' },
  55: { icon: 'Cloud', label: '大雨' },
  61: { icon: 'Cloud', label: '小雨' },
  63: { icon: 'Cloud', label: '中雨' },
  65: { icon: 'Cloud', label: '大雨' },
  71: { icon: 'Cloud', label: '小雪' },
  73: { icon: 'Cloud', label: '中雪' },
  75: { icon: 'Cloud', label: '大雪' },
  80: { icon: 'Cloud', label: '陣雨' },
  81: { icon: 'Cloud', label: '陣雨' },
  82: { icon: 'Cloud', label: '大陣雨' },
  95: { icon: 'Cloud', label: '雷陣雨' },
};

function findCoords(city: string): CityCoords | null {
  for (const [name, coords] of Object.entries(CITY_COORDS)) {
    if (city.includes(name)) return coords;
  }
  return null;
}

interface DailyData {
  time: string[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  weather_code: number[];
}

function isWithinForecastRange(dateStr: string): boolean {
  const now = new Date();
  const target = new Date(dateStr);
  const diffDays = (target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays >= -1 && diffDays <= 16;
}

function isInPast(dateStr: string): boolean {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return new Date(dateStr) < now;
}

export async function fetchWeather(
  cities: { date: string; city: string }[]
): Promise<Map<string, Weather>> {
  const result = new Map<string, Weather>();
  if (cities.length === 0) return result;

  const allDates = cities.map(c => c.date).filter(Boolean).sort();
  if (allDates.length === 0) return result;

  const startDate = allDates[0];
  const endDate = allDates[allDates.length - 1];

  const allPast = allDates.every(d => isInPast(d));
  const allForecastable = allDates.every(d => isWithinForecastRange(d));

  if (!allPast && !allForecastable) {
    return result;
  }

  const seen = new Set<string>();
  const uniqueCoords: CityCoords[] = [];

  for (const { city } of cities) {
    const coords = findCoords(city);
    if (!coords) continue;
    const key = `${coords.lat},${coords.lon}`;
    if (seen.has(key)) continue;
    seen.add(key);
    uniqueCoords.push(coords);
  }

  for (const coords of uniqueCoords) {
    try {
      const dailyParams = 'temperature_2m_max,temperature_2m_min,weather_code';
      let url: string;

      if (allPast) {
        url = `https://archive-api.open-meteo.com/v1/archive?latitude=${coords.lat}&longitude=${coords.lon}&start_date=${startDate}&end_date=${endDate}&daily=${dailyParams}&timezone=Asia/Tokyo`;
      } else {
        url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&start_date=${startDate}&end_date=${endDate}&daily=${dailyParams}&timezone=Asia/Tokyo`;
      }

      const resp = await fetch(url);
      if (!resp.ok) continue;

      const data = await resp.json();
      const daily: DailyData = data.daily;
      if (!daily?.time) continue;

      for (let i = 0; i < daily.time.length; i++) {
        const dateStr = daily.time[i];
        if (result.has(dateStr)) continue;

        const wmo = daily.weather_code[i];
        const info = WMO_TO_ICON[wmo] ?? { icon: 'Cloud', label: `WMO ${wmo}` };
        const max = Math.round(daily.temperature_2m_max[i]);
        const min = Math.round(daily.temperature_2m_min[i]);

        result.set(dateStr, {
          icon: info.icon,
          label: info.label,
          temp: `${max}° / ${min}°`,
        });
      }
    } catch {
      // silently skip
    }
  }

  return result;
}

export async function geocodeCity(city: string): Promise<CityCoords | null> {
  const known = findCoords(city);
  if (known) return known;

  try {
    const resp = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=ja`
    );
    if (!resp.ok) return null;
    const data = await resp.json();
    if (data.results?.length > 0) {
      return { lat: data.results[0].latitude, lon: data.results[0].longitude };
    }
  } catch {
    // ignore
  }
  return null;
}
