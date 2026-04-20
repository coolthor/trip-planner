import { Pencil, Plus } from 'lucide-react';
import { SoftCard } from '../ui/SoftCard';
import { Stamp } from '../ui/Stamp';
import { TicketCard } from './TicketCard';
import type { Ticket } from '../../types/trip';

interface TicketsPanelProps {
  tickets: Record<string, Ticket>;
  activeDay: number;
  onEdit?: (ticket: Ticket) => void;
  onAdd?: () => void;
}

export function TicketsPanel({ tickets, activeDay, onEdit, onAdd }: TicketsPanelProps) {
  return (
    <SoftCard className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-[10px] tracking-[0.3em] text-gold-600 uppercase">Tickets</div>
          <div className="font-serif-jp text-lg text-indigo2-900 font-semibold">票券</div>
        </div>
        <div className="flex items-center gap-2">
          {onAdd && (
            <button
              onClick={onAdd}
              className="p-1.5 rounded-lg text-sumi-500 hover:text-indigo2-800 hover:bg-washi-200/60 transition"
            >
              <Plus size={14} />
            </button>
          )}
          <Stamp>切符</Stamp>
        </div>
      </div>
      <div className="space-y-3">
        {Object.values(tickets).map(t => (
          <div key={t.id} className="relative group">
            <TicketCard ticket={t} activeDay={activeDay} />
            {onEdit && (
              <button
                onClick={() => onEdit(t)}
                className="absolute top-3 right-8 p-1.5 rounded-lg bg-washi-50/80 text-sumi-500 hover:text-indigo2-800 opacity-0 group-hover:opacity-100 transition"
              >
                <Pencil size={12} />
              </button>
            )}
          </div>
        ))}
        {Object.keys(tickets).length === 0 && onAdd && (
          <button
            onClick={onAdd}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-washi-300 text-sm text-sumi-500 hover:border-gold-400 hover:text-gold-700 transition"
          >
            <Plus size={16} />新增票券
          </button>
        )}
      </div>
    </SoftCard>
  );
}
