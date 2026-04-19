import { Hotel as HotelIcon, MapPin, Clock, Map, ExternalLink } from 'lucide-react';
import { SoftCard } from '../ui/SoftCard';
import type { Hotel } from '../../types/trip';

interface HotelInlineProps {
  time: string;
  title: string;
  hotel: Hotel;
}

export function HotelInline({ time, title, hotel }: HotelInlineProps) {
  return (
    <SoftCard className="p-4 flex items-start gap-3">
      <div className="flex flex-col items-center w-12 shrink-0">
        <div className="font-serif-jp text-sumi-900 text-[15px] leading-none">{time}</div>
        <div className="mt-1 text-[10px] tracking-widest text-indigo2-800">住宿</div>
      </div>
      <div className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center bg-indigo2-800/10 text-indigo2-800">
        <HotelIcon size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-medium text-sumi-900">{title}</div>
        <div className="font-serif-jp text-xs text-sumi-500 mt-0.5">{hotel.nameJp}</div>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-sumi-500">
          <span className="flex items-center gap-1"><MapPin size={11} />{hotel.address}</span>
          <span className="flex items-center gap-1">
            <Clock size={11} />Check {title.toLowerCase().includes('out') ? 'out' : 'in'} {title.toLowerCase().includes('out') ? hotel.checkOut : hotel.checkIn}
          </span>
        </div>
        <a
          href={hotel.map} target="_blank" rel="noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-[11px] text-gold-700 hover:text-gold-500"
        >
          <Map size={12} />Google Maps<ExternalLink size={10} />
        </a>
      </div>
    </SoftCard>
  );
}
