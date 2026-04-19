import { useState, useCallback } from 'react';
import { Pencil, Plus, X } from 'lucide-react';
import { Header } from './components/Header';
import { DayTabs } from './components/DayTabs';
import { DayOverview } from './components/DayOverview';
import { Timeline } from './components/timeline/Timeline';
import { HotelCard } from './components/lodging/HotelCard';
import { LuggageTracker } from './components/luggage/LuggageTracker';
import { TicketsPanel } from './components/tickets/TicketsPanel';
import { SectionHeader } from './components/ui/SectionHeader';
import { ImportPanel } from './components/ImportPanel';
import { EventEditor } from './components/EventEditor';
import { useWeather } from './hooks/useWeather';
import { sampleTrip } from './data/sample-trip';
import type { TripData, DayEvent } from './types/trip';

function TripViewer({ data, onUpdate }: { data: TripData; onUpdate: (data: TripData) => void }) {
  const [activeDay, setActiveDay] = useState(1);
  const [editing, setEditing] = useState(false);
  const [editingEvent, setEditingEvent] = useState<{ index: number; event?: DayEvent } | null>(null);

  const day = data.days.find(d => d.id === activeDay) ?? data.days[0];
  const stayHotel = day.stayId ? data.hotels[day.stayId] : null;
  const hasTickets = Object.keys(data.tickets).length > 0;

  const { getWeather, loading: weatherLoading } = useWeather(data.days);

  const updateDayEvents = useCallback((dayId: number, events: DayEvent[]) => {
    onUpdate({
      ...data,
      days: data.days.map(d => d.id === dayId ? { ...d, events } : d),
    });
  }, [data, onUpdate]);

  const handleAddEvent = useCallback((event: DayEvent) => {
    const events = [...day.events, event].sort((a, b) => a.time.localeCompare(b.time));
    updateDayEvents(day.id, events);
    setEditingEvent(null);
  }, [day, updateDayEvents]);

  const handleEditEvent = useCallback((index: number, event: DayEvent) => {
    const events = day.events.map((e, i) => i === index ? event : e).sort((a, b) => a.time.localeCompare(b.time));
    updateDayEvents(day.id, events);
    setEditingEvent(null);
  }, [day, updateDayEvents]);

  const handleDeleteEvent = useCallback((index: number) => {
    const events = day.events.filter((_, i) => i !== index);
    updateDayEvents(day.id, events);
  }, [day, updateDayEvents]);

  return (
    <div className="min-h-screen">
      <Header trip={data.trip} />
      <DayTabs days={data.days} active={activeDay} onChange={setActiveDay} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        <DayOverview
          day={day}
          hotel={stayHotel}
          liveWeather={getWeather(day)}
          weatherLoading={weatherLoading}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <SectionHeader kanji="行程" sub="Itinerary" />
              <button
                onClick={() => setEditing(e => !e)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition
                  ${editing
                    ? 'bg-gold-500 text-washi-50 shadow-washi'
                    : 'text-sumi-500 hover:bg-washi-200/60'
                  }`}
              >
                {editing ? <X size={14} /> : <Pencil size={14} />}
                {editing ? '完成' : '編輯'}
              </button>
            </div>

            <Timeline
              day={day}
              hotels={data.hotels}
              editing={editing}
              onEditEvent={(idx, ev) => setEditingEvent({ index: idx, event: ev })}
              onDeleteEvent={handleDeleteEvent}
            />

            {editing && !editingEvent && (
              <button
                onClick={() => setEditingEvent({ index: -1 })}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-washi-300 text-sm text-sumi-500 hover:border-gold-400 hover:text-gold-700 transition"
              >
                <Plus size={16} />
                新增事件
              </button>
            )}

            {editingEvent && (
              <EventEditor
                event={editingEvent.index >= 0 ? editingEvent.event : undefined}
                onSave={(ev) => {
                  if (editingEvent.index >= 0) {
                    handleEditEvent(editingEvent.index, ev);
                  } else {
                    handleAddEvent(ev);
                  }
                }}
                onCancel={() => setEditingEvent(null)}
              />
            )}
          </div>

          <aside className="space-y-5 lg:sticky lg:top-[88px] self-start">
            {stayHotel && (
              <>
                <SectionHeader kanji="宿" sub="Stay" />
                <HotelCard hotel={stayHotel} />
              </>
            )}
            <SectionHeader kanji="荷" sub="Luggage" />
            <LuggageTracker activeDay={activeDay} route={data.luggageRoute} />
            {hasTickets && (
              <>
                <SectionHeader kanji="券" sub="Tickets" />
                <TicketsPanel tickets={data.tickets} activeDay={activeDay} />
              </>
            )}
          </aside>
        </div>

        <footer className="pt-8 pb-4 text-center">
          <div className="sep-wave max-w-md mx-auto mb-3" />
          <div className="font-serif-jp text-sumi-500 text-xs tracking-[0.3em]">
            良 い 旅 を
          </div>
        </footer>
      </main>
    </div>
  );
}

export default function App() {
  const [tripData, setTripData] = useState<TripData | null>(null);

  const handleLoadSample = useCallback(() => {
    setTripData(sampleTrip);
  }, []);

  if (!tripData) {
    return <ImportPanel onImport={setTripData} onLoadSample={handleLoadSample} />;
  }

  return <TripViewer data={tripData} onUpdate={setTripData} />;
}
