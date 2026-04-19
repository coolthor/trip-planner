import { Truck } from 'lucide-react';
import { SoftCard } from '../ui/SoftCard';
import { Stamp } from '../ui/Stamp';
import { getIcon } from '../icons';
import type { LuggageStop, LuggageState } from '../../types/trip';

const LUG_STATES: Record<LuggageState, { label: string; icon: string; tone: string }> = {
  atHotel:   { label: '在酒店',  icon: 'Home',         tone: 'text-indigo2-800 bg-indigo2-800/10 border-indigo2-800/20' },
  withYou:   { label: '隨身',    icon: 'Luggage',      tone: 'text-sumi-700 bg-washi-200/70 border-washi-300' },
  inTransit: { label: '運送中',  icon: 'Truck',        tone: 'text-gold-700 bg-gold-200/50 border-gold-400/40' },
  delivered: { label: '已送達',  icon: 'PackageCheck', tone: 'text-onsen bg-onsen/10 border-onsen/25' },
};

interface LuggageTrackerProps {
  activeDay: number;
  route: LuggageStop[];
}

export function LuggageTracker({ activeDay, route }: LuggageTrackerProps) {
  const current = route.find(r => r.day === activeDay) ?? route[0];
  const S = LUG_STATES[current.state];
  const CurIco = getIcon(S.icon);

  return (
    <SoftCard className="p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-[10px] tracking-[0.3em] text-gold-600 uppercase">Luggage</div>
          <div className="font-serif-jp text-lg text-indigo2-900 font-semibold">行李狀態</div>
        </div>
        <Stamp>荷物</Stamp>
      </div>

      <div className={`rounded-xl border px-4 py-3 flex items-center gap-3 ${S.tone}`}>
        <div className="w-10 h-10 rounded-lg bg-washi-50 flex items-center justify-center">
          <CurIco size={20} />
        </div>
        <div>
          <div className="text-[10px] tracking-widest uppercase opacity-70">目前 · Day {activeDay}</div>
          <div className="font-serif-jp text-base font-medium">{S.label}</div>
          <div className="text-xs opacity-80 mt-0.5">{current.loc}</div>
          {current.sub && <div className="text-[11px] opacity-70 mt-0.5">{current.sub}</div>}
        </div>
      </div>

      <div className="mt-5">
        <div className="text-[10px] tracking-widest text-sumi-500 uppercase mb-2">9 日路線</div>
        <div className="grid grid-cols-9 gap-1">
          {route.map((r) => {
            const s = LUG_STATES[r.state];
            const Ico = getIcon(s.icon);
            const isActive = r.day === activeDay;
            return (
              <div key={r.day} className={`flex flex-col items-center ${isActive ? '' : 'opacity-60'}`}>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${s.tone} ${isActive ? 'ring-2 ring-gold-400/60 ring-offset-2 ring-offset-washi-50' : ''}`}>
                  <Ico size={13} />
                </div>
                <div className="font-serif-jp text-[10px] text-sumi-500 mt-1">D{r.day}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="sep-wave my-4" />
      <div className="rounded-lg bg-washi-50 border border-washi-200 p-3">
        <div className="flex items-center gap-1.5 text-[11px] text-gold-700 tracking-widest uppercase">
          <Truck size={12} />行李寄送 · 5/10
        </div>
        <div className="mt-2 flex items-center gap-2 text-sm">
          <div className="font-serif-jp text-sumi-800">戴衣提別府</div>
          <div className="flex-1 h-0.5 lug-line" />
          <Truck size={14} className="text-gold-600" />
          <div className="flex-1 h-0.5 lug-line" />
          <div className="font-serif-jp text-sumi-800">Oriental 天神</div>
        </div>
        <div className="text-[11px] text-sumi-500 mt-1">早上 check out 前辦理 · 5/11 下午送達</div>
      </div>
    </SoftCard>
  );
}
