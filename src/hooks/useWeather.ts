import { useEffect, useState } from 'react';
import { fetchWeather } from '../lib/weather';
import type { Day, Weather } from '../types/trip';

export function useWeather(days: Day[]) {
  const [weatherMap, setWeatherMap] = useState<Map<string, Weather>>(new Map());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (days.length === 0) return;

    const cities = days.map(d => {
      const dateMatch = d.dateLong.match(/(\d{4})\.(\d{2})\.(\d{2})/);
      const date = dateMatch ? `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}` : '';
      return { date, city: d.city };
    }).filter(c => c.date);

    if (cities.length === 0) return;

    setLoading(true);
    fetchWeather(cities)
      .then(setWeatherMap)
      .finally(() => setLoading(false));
  }, [days]);

  function getWeather(day: Day): Weather {
    const dateMatch = day.dateLong.match(/(\d{4})\.(\d{2})\.(\d{2})/);
    const dateKey = dateMatch ? `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}` : '';
    return weatherMap.get(dateKey) ?? day.weather;
  }

  return { getWeather, loading };
}
