import { CalendarDays, Users, Moon } from 'lucide-react';
import { Stamp } from './ui/Stamp';
import type { Trip } from '../types/trip';

interface HeaderProps {
  trip: Trip;
}

export function Header({ trip }: HeaderProps) {
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
              <span className="text-[11px] tracking-[0.3em] text-sumi-500 uppercase">Kyushu · Spring 2026</span>
            </div>
            <h1 className="font-serif-jp text-[30px] sm:text-[40px] leading-tight text-indigo2-900 font-semibold whitespace-nowrap">
              {trip.title.split(' · ')[0]} <span className="text-gold-600">·</span> {trip.title.split(' · ')[1]}
            </h1>
            <p className="mt-2 font-serif-jp text-sumi-700 text-sm sm:text-base tracking-wide">
              福岡 — 別府 — 由布院 — 天神
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-sumi-500">
              <span className="flex items-center gap-1.5"><CalendarDays size={14} />{trip.subtitle}</span>
              <span className="flex items-center gap-1.5"><Users size={14} />{trip.travelers}</span>
              <span className="flex items-center gap-1.5"><Moon size={14} />8 晚</span>
            </div>
          </div>
          <div className="hidden md:flex flex-col items-end gap-1 shrink-0">
            <div className="font-serif-jp text-indigo2-800 text-xl whitespace-nowrap">二〇二六</div>
            <div className="font-serif-jp text-sumi-500 text-xs tracking-widest whitespace-nowrap">令和八年 · 皐月</div>
          </div>
        </div>
      </div>
      <div className="sep-wave max-w-5xl mx-auto" />
    </header>
  );
}
