import { Pencil, Trash2 } from 'lucide-react';
import { SoftCard } from '../ui/SoftCard';
import { TrainCard } from '../transport/TrainCard';
import { HotelInline } from '../lodging/HotelInline';
import { getIcon } from '../icons';
import type { Day, DayEvent, Hotel, EventKind } from '../../types/trip';

const kindStyles: Record<EventKind, { dot: string; chip: string; tint: string }> = {
  plane:   { dot: 'bg-indigo2-800',  chip: '抵 / 離',  tint: 'text-indigo2-800' },
  train:   { dot: 'bg-gold-600',      chip: '列車',     tint: 'text-gold-700' },
  move:    { dot: 'bg-sumi-500',      chip: '移動',     tint: 'text-sumi-700' },
  hotel:   { dot: 'bg-indigo2-700',   chip: '住宿',     tint: 'text-indigo2-800' },
  food:    { dot: 'bg-vermillion',    chip: '食',       tint: 'text-vermillion' },
  sight:   { dot: 'bg-gold-500',      chip: '景',       tint: 'text-gold-700' },
  bath:    { dot: 'bg-onsen',         chip: '湯',       tint: 'text-onsen' },
  walk:    { dot: 'bg-sumi-300',      chip: '散策',     tint: 'text-sumi-700' },
  luggage: { dot: 'bg-gold-400',      chip: '行李',     tint: 'text-gold-700' },
};

interface TimelineProps {
  day: Day;
  hotels: Record<string, Hotel>;
  editing?: boolean;
  onEditEvent?: (index: number, event: DayEvent) => void;
  onDeleteEvent?: (index: number) => void;
}

function EventActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex gap-1 shrink-0 ml-2">
      <button
        onClick={onEdit}
        className="p-1.5 rounded-lg text-sumi-500 hover:text-indigo2-800 hover:bg-washi-200/60 transition"
      >
        <Pencil size={14} />
      </button>
      <button
        onClick={onDelete}
        className="p-1.5 rounded-lg text-sumi-500 hover:text-vermillion hover:bg-vermillion/10 transition"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

export function Timeline({ day, hotels, editing, onEditEvent, onDeleteEvent }: TimelineProps) {
  return (
    <div className="relative pl-6 sm:pl-8">
      <div className="absolute left-[11px] sm:left-[15px] top-2 bottom-2 w-px bg-gradient-to-b from-gold-400/60 via-washi-300 to-gold-400/20" />

      <div className="space-y-3">
        {day.events.map((ev, idx) => {
          const Ico = getIcon(ev.icon);
          const style = kindStyles[ev.kind] ?? kindStyles.move;

          if (ev.kind === 'train' && ev.train) {
            return (
              <div key={idx} className="relative animate-fade-in-up group">
                <div className={`absolute -left-[18px] sm:-left-[22px] top-5 w-3 h-3 rounded-full ${style.dot} timeline-dot`} />
                <div className="flex items-start gap-1">
                  <div className="flex-1 min-w-0">
                    <TrainCard train={ev.train} title={ev.title} time={ev.time} />
                  </div>
                  {editing && onEditEvent && onDeleteEvent && (
                    <EventActions
                      onEdit={() => onEditEvent(idx, ev)}
                      onDelete={() => onDeleteEvent(idx)}
                    />
                  )}
                </div>
              </div>
            );
          }

          if (ev.kind === 'hotel' && ev.hotelId && hotels[ev.hotelId]) {
            return (
              <div key={idx} className="relative animate-fade-in-up group">
                <div className={`absolute -left-[18px] sm:-left-[22px] top-5 w-3 h-3 rounded-full ${style.dot} timeline-dot`} />
                <div className="flex items-start gap-1">
                  <div className="flex-1 min-w-0">
                    <HotelInline time={ev.time} title={ev.title} hotel={hotels[ev.hotelId]} />
                  </div>
                  {editing && onEditEvent && onDeleteEvent && (
                    <EventActions
                      onEdit={() => onEditEvent(idx, ev)}
                      onDelete={() => onDeleteEvent(idx)}
                    />
                  )}
                </div>
              </div>
            );
          }

          return (
            <div key={idx} className="relative animate-fade-in-up group">
              <div className={`absolute -left-[18px] sm:-left-[22px] top-5 w-3 h-3 rounded-full ${style.dot} timeline-dot`} />
              <SoftCard className="p-4 flex items-start gap-3 hover:shadow-washi-lg transition-shadow">
                <div className="flex flex-col items-center w-12 shrink-0">
                  <div className="font-serif-jp text-sumi-800 text-[15px] leading-none">{ev.time}</div>
                  <div className={`mt-1 text-[10px] tracking-widest ${style.tint}`}>{style.chip}</div>
                </div>
                <div className={`shrink-0 mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center bg-washi-200/60 ${style.tint}`}>
                  <Ico size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sumi-900 leading-snug">{ev.title}</div>
                  {ev.note && <div className="text-xs text-sumi-500 mt-1 leading-relaxed">{ev.note}</div>}
                </div>
                {editing && onEditEvent && onDeleteEvent && (
                  <EventActions
                    onEdit={() => onEditEvent(idx, ev)}
                    onDelete={() => onDeleteEvent(idx)}
                  />
                )}
              </SoftCard>
            </div>
          );
        })}
      </div>
    </div>
  );
}
