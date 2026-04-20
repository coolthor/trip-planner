import { useState } from 'react';
import { MapPin, Calendar, Users, Sparkles } from 'lucide-react';
import { SoftCard } from './ui/SoftCard';
import { Stamp } from './ui/Stamp';
import type { TripData, Day } from '../types/trip';

const WEEKDAYS_ZH = ['日', '一', '二', '三', '四', '五', '六'];
const WEEKDAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatDate(d: Date): string {
  return `${d.getMonth() + 1}/${d.getDate()}（${WEEKDAYS_ZH[d.getDay()]}）`;
}

function formatDateLong(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day} ${WEEKDAYS_EN[d.getDay()]}`;
}

interface CreateTripFormProps {
  onCreate: (data: TripData) => void;
  onBack: () => void;
}

export function CreateTripForm({ onCreate, onBack }: CreateTripFormProps) {
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [travelers, setTravelers] = useState(2);

  function getDayCount(): number {
    if (!startDate || !endDate) return 0;
    const s = new Date(startDate);
    const e = new Date(endDate);
    const diff = Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 0;
  }

  const dayCount = getDayCount();
  const tripName = destination && dayCount > 0
    ? `${destination} · ${dayCount}日之旅`
    : '';

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!destination.trim() || dayCount <= 0) return;

    const start = new Date(startDate);
    const end = new Date(endDate);

    const days: Day[] = [];
    for (let i = 0; i < dayCount; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      days.push({
        id: i + 1,
        date: formatDate(d),
        dateLong: formatDateLong(d),
        city: destination.trim(),
        weather: { icon: 'Cloud', label: '—', temp: '—' },
        summary: i === 0 ? `抵達${destination.trim()}` : i === dayCount - 1 ? '歸途' : `第 ${i + 1} 天`,
        events: [],
        stayId: null,
      });
    }

    const data: TripData = {
      trip: {
        title: tripName,
        subtitle: `${formatDateLong(start)} — ${formatDateLong(end)}`,
        dateRange: `${start.toLocaleDateString('zh-TW')} – ${end.toLocaleDateString('zh-TW')}`,
        travelers: `${travelers} 人`,
      },
      hotels: {},
      days,
      tickets: {},
      luggageRoute: days.map((_d, i) => ({
        day: i + 1,
        loc: '隨身',
        state: 'withYou' as const,
      })),
    };

    onCreate(data);
  }

  return (
    <SoftCard className="p-6 sm:p-8 max-w-lg w-full animate-fade-in-up">
      <div className="flex items-center gap-2 mb-6">
        <Stamp>旅</Stamp>
        <div className="font-serif-jp text-xl text-indigo2-900 font-semibold">開啟新旅程</div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-[10px] tracking-widest text-sumi-500 uppercase flex items-center gap-1.5 mb-1.5">
            <MapPin size={12} />目的地
          </label>
          <input
            type="text"
            value={destination}
            onChange={e => setDestination(e.target.value)}
            placeholder="例：北九州、京都、沖繩"
            className="w-full rounded-lg border border-washi-300 bg-washi-50 px-3 py-2.5 text-sm text-sumi-800 font-serif-jp focus:outline-none focus:ring-2 focus:ring-gold-400/60"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] tracking-widest text-sumi-500 uppercase flex items-center gap-1.5 mb-1.5">
              <Calendar size={12} />出發日
            </label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full rounded-lg border border-washi-300 bg-washi-50 px-3 py-2.5 text-sm text-sumi-800 focus:outline-none focus:ring-2 focus:ring-gold-400/60"
            />
          </div>
          <div>
            <label className="text-[10px] tracking-widest text-sumi-500 uppercase flex items-center gap-1.5 mb-1.5">
              <Calendar size={12} />回程日
            </label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              min={startDate}
              className="w-full rounded-lg border border-washi-300 bg-washi-50 px-3 py-2.5 text-sm text-sumi-800 focus:outline-none focus:ring-2 focus:ring-gold-400/60"
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] tracking-widest text-sumi-500 uppercase flex items-center gap-1.5 mb-1.5">
            <Users size={12} />人數
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setTravelers(Math.max(1, travelers - 1))}
              className="w-9 h-9 rounded-lg border border-washi-300 text-sumi-700 hover:bg-washi-200/60 transition"
            >
              −
            </button>
            <span className="font-serif-jp text-lg text-indigo2-900 w-8 text-center">{travelers}</span>
            <button
              type="button"
              onClick={() => setTravelers(travelers + 1)}
              className="w-9 h-9 rounded-lg border border-washi-300 text-sumi-700 hover:bg-washi-200/60 transition"
            >
              +
            </button>
            <span className="text-xs text-sumi-500">人</span>
          </div>
        </div>

        {tripName && (
          <div className="rounded-xl bg-indigo2-800 text-washi-50 p-4 animate-fade-in-up">
            <div className="text-[10px] tracking-[0.3em] text-gold-400 uppercase">Preview</div>
            <div className="font-serif-jp text-xl font-semibold mt-1">{tripName}</div>
            <div className="text-xs text-washi-200/80 mt-1">
              {formatDateLong(new Date(startDate))} — {formatDateLong(new Date(endDate))} · {travelers} 人 · {dayCount - 1} 晚
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={!destination.trim() || dayCount <= 0}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo2-800 text-washi-50 text-sm hover:bg-indigo2-700 transition shadow-washi disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Sparkles size={16} />建立行程
          </button>
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2.5 rounded-xl border border-washi-300 text-sm text-sumi-700 hover:bg-washi-200/50 transition"
          >
            返回
          </button>
        </div>
      </form>
    </SoftCard>
  );
}
