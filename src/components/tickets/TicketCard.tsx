import { CalendarDays } from 'lucide-react';
import type { Ticket } from '../../types/trip';

interface TicketCardProps {
  ticket: Ticket;
  activeDay: number;
}

export function TicketCard({ ticket, activeDay }: TicketCardProps) {
  const inUse = ticket.useDays.includes(activeDay);
  const isIndigo = ticket.color === 'indigo';

  return (
    <div className={`relative rounded-2xl overflow-hidden border shadow-washi transition
      ${isIndigo ? 'bg-indigo2-900 text-washi-50 border-indigo2-700' : 'bg-gold-200/40 text-sumi-900 border-gold-400/50'}`}>
      <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px border-l border-dashed border-current opacity-20" />
      <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-washi-100" />
      <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-washi-100" />

      <div className="p-4 flex">
        <div className="flex-1 pr-4">
          <div className={`text-[10px] tracking-[0.3em] uppercase ${isIndigo ? 'text-gold-400' : 'text-gold-700'}`}>
            {isIndigo ? 'JR Kyushu · 5-Day' : 'Dazaifu · Yanagawa'}
          </div>
          <div className="font-serif-jp text-[17px] font-semibold mt-1 leading-tight">{ticket.name}</div>
          <div className="font-serif-jp text-[11px] opacity-70 mt-0.5">{ticket.nameJp}</div>
          <div className="mt-3 flex items-center gap-2 text-xs opacity-80">
            <CalendarDays size={12} />{ticket.validity}
          </div>
          <div className="mt-1 text-[11px] opacity-70 leading-relaxed">{ticket.note}</div>
        </div>
        <div className="w-20 shrink-0 pl-4 flex flex-col items-center justify-center text-center">
          <div className={`text-[10px] tracking-widest uppercase ${isIndigo ? 'text-gold-400' : 'text-gold-700'}`}>Qty</div>
          <div className="font-serif-jp text-3xl font-semibold">×{ticket.qty}</div>
          {inUse && (
            <div className={`mt-2 text-[10px] tracking-widest px-2 py-0.5 rounded-full border
              ${isIndigo ? 'border-gold-400 text-gold-400' : 'border-gold-700 text-gold-700'}`}>
              使用中
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
