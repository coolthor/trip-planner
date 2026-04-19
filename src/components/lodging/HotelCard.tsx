import { MapPin, CalendarDays, Clock, Map, ExternalLink, Sparkles } from 'lucide-react';
import { SoftCard } from '../ui/SoftCard';
import { Stamp } from '../ui/Stamp';
import type { Hotel } from '../../types/trip';
import type { LucideIcon } from 'lucide-react';

function Row({ icon: Ico, label, children }: { icon: LucideIcon; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <Ico size={13} className="mt-1 text-gold-600 shrink-0" />
      <div className="flex-1">
        <div className="text-[10px] tracking-widest text-sumi-500 uppercase">{label}</div>
        <div className="text-sm text-sumi-800 leading-snug">{children}</div>
      </div>
    </div>
  );
}

interface HotelCardProps {
  hotel: Hotel;
}

export function HotelCard({ hotel }: HotelCardProps) {
  return (
    <SoftCard className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] tracking-[0.3em] text-gold-600 uppercase mb-1">Lodging</div>
          <div className="font-serif-jp text-lg text-indigo2-900 font-semibold leading-tight">
            {hotel.name}
          </div>
          <div className="font-serif-jp text-xs text-sumi-500 mt-0.5">{hotel.nameJp}</div>
        </div>
        <Stamp>予約</Stamp>
      </div>

      {hotel.tag && (
        <div className="mt-3 rounded-lg bg-gold-200/40 border border-gold-400/40 px-3 py-2 text-[11px] text-gold-700 flex items-center gap-1.5">
          <Sparkles size={12} />{hotel.tag}
        </div>
      )}

      <div className="sep-wave my-4" />

      <div className="space-y-2 text-sm">
        <Row icon={MapPin} label="地址">{hotel.address}</Row>
        <Row icon={CalendarDays} label="日程">{hotel.dates} · {hotel.nights} 晚</Row>
        <Row icon={Clock} label="Check-in / out">{hotel.checkIn} / {hotel.checkOut}</Row>
      </div>

      <a
        href={hotel.map} target="_blank" rel="noreferrer"
        className="mt-4 w-full inline-flex items-center justify-center gap-1.5 text-xs text-indigo2-800 border border-washi-300 rounded-lg py-2 hover:bg-washi-200/50"
      >
        <Map size={13} />在 Google Maps 開啟<ExternalLink size={11} />
      </a>
    </SoftCard>
  );
}
