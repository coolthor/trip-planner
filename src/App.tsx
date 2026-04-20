import { useState, useCallback, useEffect } from 'react';
import { Pencil, Plus, X, Download, FileJson, CalendarDays, RotateCcw, Upload } from 'lucide-react';
import { Header } from './components/Header';
import { DayTabs } from './components/DayTabs';
import { DayOverview } from './components/DayOverview';
import { Timeline } from './components/timeline/Timeline';
import { HotelCard } from './components/lodging/HotelCard';
import { LuggageTracker } from './components/luggage/LuggageTracker';
import { LuggageEditor } from './components/luggage/LuggageEditor';
import { TicketsPanel } from './components/tickets/TicketsPanel';
import { TicketEditor } from './components/tickets/TicketEditor';
import { SectionHeader } from './components/ui/SectionHeader';
import { ImportPanel } from './components/ImportPanel';
import { EventEditor } from './components/EventEditor';
import { useWeather } from './hooks/useWeather';
import { exportJSON, exportICS } from './lib/export';
import { saveTrip, loadTrip, clearTrip } from './lib/storage';
import { sampleTrip } from './data/sample-trip';
import type { TripData, DayEvent, LuggageStop, Ticket } from './types/trip';

function TripMenu({ data, onReset, onImport }: { data: TripData; onReset: () => void; onImport: (data: TripData) => void }) {
  const [open, setOpen] = useState(false);

  function handleFileImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    file.text().then(text => {
      if (file.name.endsWith('.json')) {
        const parsed = JSON.parse(text) as TripData;
        if (parsed.trip && parsed.days) onImport(parsed);
      } else {
        import('./lib/ics-parser').then(({ parseICS }) => {
          onImport(parseICS(text));
        });
      }
    });
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-sumi-500 hover:bg-washi-200/60 transition"
      >
        <Download size={14} />
        選單
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-40 w-48 rounded-xl border border-washi-200 bg-washi-50 shadow-washi-lg overflow-hidden animate-fade-in-up">
            <button
              onClick={() => { exportJSON(data); setOpen(false); }}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm text-sumi-800 hover:bg-washi-200/60 transition text-left"
            >
              <FileJson size={16} className="text-gold-600" />匯出 JSON
            </button>
            <button
              onClick={() => { exportICS(data); setOpen(false); }}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm text-sumi-800 hover:bg-washi-200/60 transition text-left"
            >
              <CalendarDays size={16} className="text-gold-600" />匯出 ICS 行事曆
            </button>
            <div className="border-t border-washi-200" />
            <label className="w-full flex items-center gap-2 px-4 py-3 text-sm text-sumi-800 hover:bg-washi-200/60 transition text-left cursor-pointer">
              <Upload size={16} className="text-indigo2-800" />匯入行程
              <input type="file" accept=".ics,.ical,.json" className="hidden" onChange={handleFileImport} />
            </label>
            <div className="border-t border-washi-200" />
            <button
              onClick={() => { onReset(); setOpen(false); }}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm text-vermillion hover:bg-vermillion/5 transition text-left"
            >
              <RotateCcw size={16} />重新開始
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function TripViewer({ data, onUpdate, onReset }: { data: TripData; onUpdate: (data: TripData) => void; onReset: () => void }) {
  const [activeDay, setActiveDay] = useState(1);
  const [editing, setEditing] = useState(false);
  const [editingEvent, setEditingEvent] = useState<{ index: number; event?: DayEvent } | null>(null);
  const [editingLuggage, setEditingLuggage] = useState(false);
  const [editingTicket, setEditingTicket] = useState<{ ticket?: Ticket } | null>(null);

  const day = data.days.find(d => d.id === activeDay) ?? data.days[0];
  const stayHotel = day.stayId ? data.hotels[day.stayId] : null;

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

  const handleSaveLuggage = useCallback((route: LuggageStop[]) => {
    onUpdate({ ...data, luggageRoute: route });
    setEditingLuggage(false);
  }, [data, onUpdate]);

  const handleSaveTicket = useCallback((ticket: Ticket) => {
    const tickets = { ...data.tickets, [ticket.id]: ticket };
    onUpdate({ ...data, tickets });
    setEditingTicket(null);
  }, [data, onUpdate]);

  const handleDeleteTicket = useCallback((id: string) => {
    const { [id]: _, ...rest } = data.tickets;
    onUpdate({ ...data, tickets: rest });
    setEditingTicket(null);
  }, [data, onUpdate]);

  return (
    <div className="min-h-screen">
      <Header trip={data.trip} />
      <DayTabs days={data.days} active={activeDay} onChange={setActiveDay} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        <div className="flex items-center justify-end gap-2">
          <TripMenu data={data} onReset={onReset} onImport={onUpdate} />
        </div>

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
            {editingLuggage ? (
              <LuggageEditor
                route={data.luggageRoute}
                onSave={handleSaveLuggage}
                onCancel={() => setEditingLuggage(false)}
              />
            ) : (
              <LuggageTracker
                activeDay={activeDay}
                route={data.luggageRoute}
                onEdit={() => setEditingLuggage(true)}
              />
            )}
            <SectionHeader kanji="券" sub="Tickets" />
            {editingTicket ? (
              <TicketEditor
                ticket={editingTicket.ticket}
                totalDays={data.days.length}
                onSave={handleSaveTicket}
                onDelete={editingTicket.ticket ? () => handleDeleteTicket(editingTicket.ticket!.id) : undefined}
                onCancel={() => setEditingTicket(null)}
              />
            ) : (
              <TicketsPanel
                tickets={data.tickets}
                activeDay={activeDay}
                onEdit={(t) => setEditingTicket({ ticket: t })}
                onAdd={() => setEditingTicket({})}
              />
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
  const [tripData, setTripData] = useState<TripData | null>(() => loadTrip());

  useEffect(() => {
    if (tripData) {
      saveTrip(tripData);
    }
  }, [tripData]);

  const handleLoadSample = useCallback(() => {
    setTripData(sampleTrip);
  }, []);

  const handleReset = useCallback(() => {
    clearTrip();
    setTripData(null);
  }, []);

  if (!tripData) {
    return <ImportPanel onImport={setTripData} onLoadSample={handleLoadSample} />;
  }

  return <TripViewer data={tripData} onUpdate={setTripData} onReset={handleReset} />;
}
