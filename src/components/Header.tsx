import { CalendarDays, Users, Moon } from 'lucide-react';
import { Stamp } from './ui/Stamp';
import type { Trip, Day } from '../types/trip';

interface HeaderProps {
  trip: Trip;
  days: Day[];
}

function getUniqueCities(days: Day[]): string {
  const seen = new Set<string>();
  const cities: string[] = [];
  for (const d of days) {
    const city = d.city.split(/[→·/]/).map(s => s.trim())[0];
    if (city && !seen.has(city)) {
      seen.add(city);
      cities.push(city);
    }
  }
  return cities.join(' — ');
}

export function Header({ trip, days }: HeaderProps) {
  const titleParts = trip.title.split(/\s*[·]\s*/);
  const cities = getUniqueCities(days);
  const nights = days.length > 0 ? days.length - 1 : 0;

  return (
    <header className="relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-indigo2-800/[0.04]" />
        <div className="absolute -bottom-20 -right-10 w-64 h-64 rounded-full bg-gold-400/[0.09]" />
      </div>

      <div className="relative px-5 sm:px-8 pt-8 pb-6 max-w-5xl mx-auto">
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Stamp>旅</Stamp>
              <span className="text-[11px] tracking-[0.3em] text-sumi-500 uppercase">Trip Planner</span>
            </div>
            <h1 className="font-serif-jp text-[30px] sm:text-[40px] leading-tight text-indigo2-900 font-semibold">
              {titleParts[0]}
              {titleParts[1] && <> <span className="text-gold-600">·</span> {titleParts[1]}</>}
            </h1>
            {cities && (
              <p className="mt-2 font-serif-jp text-sumi-700 text-sm sm:text-base tracking-wide">
                {cities}
              </p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-sumi-500">
              <span className="flex items-center gap-1.5"><CalendarDays size={14} />{trip.subtitle}</span>
              {trip.travelers && <span className="flex items-center gap-1.5"><Users size={14} />{trip.travelers}</span>}
              <span className="flex items-center gap-1.5"><Moon size={14} />{nights} 晚</span>
            </div>
          </div>
        </div>
      </div>
      <div className="sep-wave max-w-5xl mx-auto" />
    </header>
  );
}
