import { useState } from 'react';
import { X, Save } from 'lucide-react';
import { SoftCard } from '../ui/SoftCard';
import { getIcon } from '../icons';
import type { LuggageStop, LuggageState } from '../../types/trip';

const STATES: { value: LuggageState; label: string; icon: string }[] = [
  { value: 'atHotel', label: '在酒店', icon: 'Home' },
  { value: 'withYou', label: '隨身', icon: 'Luggage' },
  { value: 'inTransit', label: '運送中', icon: 'Truck' },
  { value: 'delivered', label: '已送達', icon: 'PackageCheck' },
];

interface LuggageEditorProps {
  route: LuggageStop[];
  onSave: (route: LuggageStop[]) => void;
  onCancel: () => void;
}

export function LuggageEditor({ route, onSave, onCancel }: LuggageEditorProps) {
  const [draft, setDraft] = useState<LuggageStop[]>(route.map(r => ({ ...r })));

  function updateStop(day: number, field: keyof LuggageStop, value: string) {
    setDraft(prev => prev.map(r =>
      r.day === day ? { ...r, [field]: value } : r
    ));
  }

  return (
    <SoftCard className="p-5 animate-fade-in-up">
      <div className="flex items-center justify-between mb-4">
        <div className="font-serif-jp text-lg text-indigo2-900 font-semibold">編輯行李路線</div>
        <button onClick={onCancel} className="text-sumi-500 hover:text-sumi-800 transition">
          <X size={18} />
        </button>
      </div>

      <div className="space-y-3">
        {draft.map(stop => {
          const stateInfo = STATES.find(s => s.value === stop.state)!;
          const Ico = getIcon(stateInfo.icon);
          return (
            <div key={stop.day} className="flex items-center gap-3 p-3 rounded-xl bg-washi-50 border border-washi-200">
              <div className="font-serif-jp text-sm text-sumi-700 w-8 shrink-0">D{stop.day}</div>
              <Ico size={16} className="text-gold-600 shrink-0" />
              <select
                value={stop.state}
                onChange={e => updateStop(stop.day, 'state', e.target.value)}
                className="rounded-lg border border-washi-300 bg-washi-50 px-2 py-1 text-xs text-sumi-800 focus:outline-none focus:ring-2 focus:ring-gold-400/60"
              >
                {STATES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <input
                type="text"
                value={stop.loc}
                onChange={e => updateStop(stop.day, 'loc', e.target.value)}
                placeholder="位置"
                className="flex-1 min-w-0 rounded-lg border border-washi-300 bg-washi-50 px-2 py-1 text-xs text-sumi-800 focus:outline-none focus:ring-2 focus:ring-gold-400/60"
              />
              <input
                type="text"
                value={stop.sub ?? ''}
                onChange={e => updateStop(stop.day, 'sub', e.target.value || '')}
                placeholder="備註"
                className="w-24 rounded-lg border border-washi-300 bg-washi-50 px-2 py-1 text-xs text-sumi-500 focus:outline-none focus:ring-2 focus:ring-gold-400/60"
              />
            </div>
          );
        })}
      </div>

      <div className="flex gap-2 pt-4">
        <button
          onClick={() => onSave(draft)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo2-800 text-washi-50 text-sm hover:bg-indigo2-700 transition shadow-washi"
        >
          <Save size={16} />儲存
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2.5 rounded-xl border border-washi-300 text-sm text-sumi-700 hover:bg-washi-200/50 transition"
        >
          取消
        </button>
      </div>
    </SoftCard>
  );
}
