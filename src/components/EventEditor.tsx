import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { SoftCard } from './ui/SoftCard';
import type { DayEvent, EventKind } from '../types/trip';

const EVENT_KINDS: { value: EventKind; label: string }[] = [
  { value: 'sight', label: '景點' },
  { value: 'food', label: '餐飲' },
  { value: 'move', label: '移動' },
  { value: 'train', label: '列車' },
  { value: 'hotel', label: '住宿' },
  { value: 'plane', label: '航班' },
  { value: 'bath', label: '溫泉' },
  { value: 'walk', label: '散策' },
  { value: 'luggage', label: '行李' },
];

const KIND_TO_ICON: Record<EventKind, string> = {
  sight: 'Camera', food: 'Utensils', move: 'Train', train: 'Train',
  hotel: 'Hotel', plane: 'Plane', bath: 'Bath', walk: 'Footprints',
  luggage: 'Truck',
};

interface EventEditorProps {
  event?: DayEvent;
  onSave: (event: DayEvent) => void;
  onCancel: () => void;
}

export function EventEditor({ event, onSave, onCancel }: EventEditorProps) {
  const [time, setTime] = useState(event?.time ?? '12:00');
  const [kind, setKind] = useState<EventKind>(event?.kind ?? 'sight');
  const [title, setTitle] = useState(event?.title ?? '');
  const [note, setNote] = useState(event?.note ?? '');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      time,
      kind,
      title: title.trim(),
      note: note.trim() || undefined,
      icon: KIND_TO_ICON[kind],
    });
  }

  return (
    <SoftCard className="p-5 animate-fade-in-up">
      <div className="flex items-center justify-between mb-4">
        <div className="font-serif-jp text-lg text-indigo2-900 font-semibold">
          {event ? '編輯事件' : '新增事件'}
        </div>
        <button onClick={onCancel} className="text-sumi-500 hover:text-sumi-800 transition">
          <X size={18} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] tracking-widest text-sumi-500 uppercase block mb-1">時間</label>
            <input
              type="time"
              value={time}
              onChange={e => setTime(e.target.value)}
              className="w-full rounded-lg border border-washi-300 bg-washi-50 px-3 py-2 text-sm text-sumi-800 font-serif-jp focus:outline-none focus:ring-2 focus:ring-gold-400/60"
            />
          </div>
          <div>
            <label className="text-[10px] tracking-widest text-sumi-500 uppercase block mb-1">類型</label>
            <select
              value={kind}
              onChange={e => setKind(e.target.value as EventKind)}
              className="w-full rounded-lg border border-washi-300 bg-washi-50 px-3 py-2 text-sm text-sumi-800 focus:outline-none focus:ring-2 focus:ring-gold-400/60"
            >
              {EVENT_KINDS.map(k => (
                <option key={k.value} value={k.value}>{k.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-[10px] tracking-widest text-sumi-500 uppercase block mb-1">標題</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="例：太宰府天滿宮"
            className="w-full rounded-lg border border-washi-300 bg-washi-50 px-3 py-2 text-sm text-sumi-800 focus:outline-none focus:ring-2 focus:ring-gold-400/60"
          />
        </div>

        <div>
          <label className="text-[10px] tracking-widest text-sumi-500 uppercase block mb-1">備註（可選）</label>
          <input
            type="text"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="例：門票 ¥400"
            className="w-full rounded-lg border border-washi-300 bg-washi-50 px-3 py-2 text-sm text-sumi-800 focus:outline-none focus:ring-2 focus:ring-gold-400/60"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo2-800 text-washi-50 text-sm hover:bg-indigo2-700 transition shadow-washi"
          >
            <Plus size={16} />
            {event ? '儲存' : '新增'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-washi-300 text-sm text-sumi-700 hover:bg-washi-200/50 transition"
          >
            取消
          </button>
        </div>
      </form>
    </SoftCard>
  );
}
