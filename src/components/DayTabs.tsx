import type { Day } from '../types/trip';

interface DayTabsProps {
  days: Day[];
  active: number;
  onChange: (id: number) => void;
}

export function DayTabs({ days, active, onChange }: DayTabsProps) {
  return (
    <div className="sticky top-0 z-30 bg-washi-100/85 backdrop-blur border-b border-washi-200/80">
      <div className="max-w-5xl mx-auto px-2 sm:px-6">
        <div className="tab-scroll overflow-x-auto">
          <div className="flex gap-1 sm:gap-2 py-3 min-w-max">
            {days.map((d) => {
              const isActive = d.id === active;
              return (
                <button
                  key={d.id}
                  onClick={() => onChange(d.id)}
                  className={`relative shrink-0 px-3 sm:px-4 py-2 rounded-xl transition-all text-left
                    ${isActive
                      ? 'tab-active bg-indigo2-800 text-washi-50 shadow-washi'
                      : 'text-sumi-700 hover:bg-washi-200/60'}
                  `}
                >
                  <div className={`font-serif-jp text-[11px] tracking-widest ${isActive ? 'text-gold-200' : 'text-sumi-500'}`}>
                    DAY {String(d.id).padStart(2, '0')}
                  </div>
                  <div className="font-serif-jp text-sm sm:text-base font-medium leading-tight">
                    {d.date}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
