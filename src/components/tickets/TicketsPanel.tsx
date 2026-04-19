import { SoftCard } from '../ui/SoftCard';
import { Stamp } from '../ui/Stamp';
import { TicketCard } from './TicketCard';
import type { Ticket } from '../../types/trip';

interface TicketsPanelProps {
  tickets: Record<string, Ticket>;
  activeDay: number;
}

export function TicketsPanel({ tickets, activeDay }: TicketsPanelProps) {
  return (
    <SoftCard className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-[10px] tracking-[0.3em] text-gold-600 uppercase">Tickets</div>
          <div className="font-serif-jp text-lg text-indigo2-900 font-semibold">票券</div>
        </div>
        <Stamp>切符</Stamp>
      </div>
      <div className="space-y-3">
        {Object.values(tickets).map(t => (
          <TicketCard key={t.id} ticket={t} activeDay={activeDay} />
        ))}
      </div>
    </SoftCard>
  );
}
