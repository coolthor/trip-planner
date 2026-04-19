import { useState } from 'react';
import { TrainFront, Info, ChevronDown, Armchair } from 'lucide-react';
import { SoftCard } from '../ui/SoftCard';
import { Stamp } from '../ui/Stamp';
import type { TrainInfo } from '../../types/trip';

interface TrainCardProps {
  train: TrainInfo;
  title: string;
  time: string;
}

function DetailItem({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <div className="text-[10px] tracking-[0.3em] text-gold-400/90 uppercase">{label}</div>
      <div className="font-serif-jp text-washi-50 text-sm mt-1">{value}</div>
      {sub && <div className="text-[10px] text-washi-200/60 mt-0.5">{sub}</div>}
    </div>
  );
}

export function TrainCard({ train, time }: TrainCardProps) {
  const [open, setOpen] = useState(train.highlight ?? false);

  return (
    <SoftCard className={`overflow-hidden ${train.highlight ? 'ring-1 ring-gold-400/60' : ''}`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full text-left p-4 sm:p-5 flex items-start gap-3 sm:gap-4"
      >
        <div className="flex flex-col items-center w-12 shrink-0">
          <div className="font-serif-jp text-sumi-900 text-[15px] leading-none">{time}</div>
          <div className="mt-1 text-[10px] tracking-widest text-gold-700">列車</div>
        </div>
        <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-indigo2-800 text-washi-50">
          <TrainFront size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-serif-jp text-[17px] text-indigo2-900 font-semibold">{train.name}</span>
            {train.series && <Stamp className="bg-indigo2-800 border-indigo2-800">{train.series}</Stamp>}
            {train.highlight && <Stamp className="bg-gold-600 border-gold-600">絕景</Stamp>}
          </div>
          <div className="mt-2 flex items-center gap-2 text-sm text-sumi-800">
            <span className="font-serif-jp">{train.from}</span>
            <span className="text-sumi-500">{train.depart}</span>
            <span className="mx-1 flex-1 h-px bg-washi-300 relative">
              <span className="absolute left-1/2 -translate-x-1/2 -top-1.5 text-gold-600 text-[10px]">━▶</span>
            </span>
            <span className="text-sumi-500">{train.arrive}</span>
            <span className="font-serif-jp">{train.to}</span>
          </div>
          <div className="mt-2 flex items-center gap-3 text-xs text-sumi-500">
            <span className="flex items-center gap-1"><Armchair size={13} />{train.seat}</span>
            {train.car && <span>· {train.car}</span>}
          </div>
        </div>
        <ChevronDown
          size={18}
          className={`text-sumi-500 mt-1 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="px-5 pb-5 animate-fade-in-up">
          <div className="rounded-xl bg-indigo2-900 text-washi-50 p-4 relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-gold-500/10" />
            <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-4">
              <DetailItem label="列車" value={train.name} sub={train.nameRoman} />
              <DetailItem label="車��" value={train.car || '—'} sub={train.series || ''} />
              <DetailItem label="座位" value={train.seat} />
              <DetailItem label="月台" value={train.platform || '—'} />
            </div>
            <div className="relative mt-4 pt-4 border-t border-washi-50/10">
              <div className="flex items-center gap-3 text-washi-100">
                <div className="font-serif-jp text-2xl">{train.depart}</div>
                <div className="text-sm tracking-widest">{train.from}</div>
                <div className="flex-1 h-px bg-washi-50/20" />
                <TrainFront size={14} className="text-gold-400" />
                <div className="flex-1 h-px bg-washi-50/20" />
                <div className="text-sm tracking-widest">{train.to}</div>
                <div className="font-serif-jp text-2xl">{train.arrive}</div>
              </div>
            </div>
            {train.note && (
              <div className="relative mt-3 text-xs text-washi-200/80 flex items-start gap-1.5">
                <Info size={12} className="mt-0.5 shrink-0" />
                <span>{train.note}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </SoftCard>
  );
}
