import { MapPin, Moon } from 'lucide-react';
import { SoftCard } from './ui/SoftCard';
import { getIcon } from './icons';
import type { Day, Hotel, Weather } from '../types/trip';

const KANJI_NUMS = ['〇','一','二','三','四','五','六','七','八','九'];

interface DayOverviewProps {
  day: Day;
  hotel: Hotel | null;
  liveWeather?: Weather;
  weatherLoading?: boolean;
}

function WeatherPill({ weather }: { weather: Day['weather'] }) {
  const WIcon = getIcon(weather.icon);
  return (
    <div className="flex items-center gap-2 rounded-full border border-washi-200 bg-washi-50 px-3 py-1">
      <WIcon size={14} className="text-gold-600" />
      <span className="text-xs text-sumi-700">{weather.label}</span>
      <span className="text-xs text-sumi-500">· {weather.temp}</span>
    </div>
  );
}

export function DayOverview({ day, hotel, liveWeather, weatherLoading }: DayOverviewProps) {
  const weather = liveWeather ?? day.weather;
  return (
    <SoftCard className="p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1">
            <span className="font-serif-jp text-xs tracking-[0.35em] text-gold-600 whitespace-nowrap">
              第 {KANJI_NUMS[day.id]} 日
            </span>
            <span className="text-[10px] text-sumi-500 tracking-widest whitespace-nowrap">{day.dateLong}</span>
          </div>
          <h2 className="font-serif-jp text-2xl sm:text-3xl text-indigo2-900 font-semibold">
            {day.summary}
          </h2>
          <div className="mt-2 flex items-center gap-2 text-sm text-sumi-700">
            <MapPin size={14} className="text-gold-600" />
            <span className="font-serif-jp tracking-wide">{day.city}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          {weatherLoading ? (
            <div className="flex items-center gap-2 rounded-full border border-washi-200 bg-washi-50 px-3 py-1">
              <span className="text-xs text-sumi-500 animate-pulse">天氣載入中...</span>
            </div>
          ) : (
            <WeatherPill weather={weather} />
          )}
          {hotel && (
            <div className="text-[11px] text-sumi-500 flex items-center gap-1 whitespace-nowrap">
              <Moon size={12} />今晚留宿 · {hotel.city}
            </div>
          )}
        </div>
      </div>
    </SoftCard>
  );
}
