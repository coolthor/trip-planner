import { useState, useMemo } from 'react';
import { X, Plus } from 'lucide-react';
import { SoftCard } from './ui/SoftCard';
import type { DayEvent, EventKind, Hotel, Day } from '../types/trip';

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

const INPUT_CLS = 'w-full rounded-lg border border-washi-300 bg-washi-50 px-3 py-2 text-sm text-sumi-800 focus:outline-none focus:ring-2 focus:ring-gold-400/60';

export interface EventSavePayload {
  event: DayEvent;
  hotel?: Hotel;
  setAsStay?: boolean;
  stayDayIds?: number[];
  checkOutEvent?: { dayId: number; event: DayEvent };
}

interface EventEditorProps {
  event?: DayEvent;
  existingHotel?: Hotel;
  days: Day[];
  currentDayId: number;
  onSave: (payload: EventSavePayload) => void;
  onCancel: () => void;
}

export function EventEditor({ event, existingHotel, days, currentDayId, onSave, onCancel }: EventEditorProps) {
  const [time, setTime] = useState(event?.time ?? '15:00');
  const [kind, setKind] = useState<EventKind>(event?.kind ?? 'sight');
  const [title, setTitle] = useState(event?.title ?? '');
  const [note, setNote] = useState(event?.note ?? '');

  const [hotelName, setHotelName] = useState(existingHotel?.name ?? '');
  const [hotelNameJp, setHotelNameJp] = useState(existingHotel?.nameJp ?? '');
  const [hotelAddress, setHotelAddress] = useState(existingHotel?.address ?? '');
  const [hotelCheckIn, setHotelCheckIn] = useState(existingHotel?.checkIn ?? '15:00');
  const [hotelCheckOut, setHotelCheckOut] = useState(existingHotel?.checkOut ?? '11:00');
  const [checkInDay, setCheckInDay] = useState(currentDayId);
  const [checkOutDay, setCheckOutDay] = useState(() => {
    if (existingHotel?.nights) return Math.min(currentDayId + existingHotel.nights, days[days.length - 1].id);
    return Math.min(currentDayId + 1, days[days.length - 1].id);
  });

  const isHotel = kind === 'hotel';

  const nights = useMemo(() => {
    return Math.max(0, checkOutDay - checkInDay);
  }, [checkInDay, checkOutDay]);

  const stayDayIds = useMemo(() => {
    const ids: number[] = [];
    for (let d = checkInDay; d < checkOutDay; d++) {
      ids.push(d);
    }
    return ids;
  }, [checkInDay, checkOutDay]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isHotel ? !hotelName.trim() : !title.trim()) return;

    const hotelId = isHotel ? (existingHotel?.id ?? `hotel_${Date.now()}`) : undefined;

    const checkInDayData = days.find(d => d.id === checkInDay);
    const checkOutDayData = days.find(d => d.id === checkOutDay);

    const payload: EventSavePayload = {
      event: {
        time: isHotel ? hotelCheckIn : time,
        kind,
        title: isHotel ? `Check in · ${hotelName.trim() || title.trim()}` : title.trim(),
        note: note.trim() || undefined,
        icon: KIND_TO_ICON[kind],
        hotelId,
      },
    };

    if (isHotel && hotelName.trim()) {
      const ciDay = checkInDayData ? checkInDayData.date : '';
      const coDay = checkOutDayData ? checkOutDayData.date : '';

      payload.hotel = {
        id: hotelId!,
        name: hotelName.trim(),
        nameJp: hotelNameJp.trim(),
        city: '',
        address: hotelAddress.trim(),
        checkIn: hotelCheckIn,
        checkOut: hotelCheckOut,
        nights,
        dates: `${ciDay} – ${coDay}`,
        status: 'booked',
        map: hotelAddress.trim()
          ? `https://maps.google.com/?q=${encodeURIComponent(hotelAddress.trim())}`
          : '',
      };
      payload.setAsStay = true;
      payload.stayDayIds = stayDayIds;

      if (checkOutDay !== checkInDay && checkOutDayData) {
        payload.checkOutEvent = {
          dayId: checkOutDay,
          event: {
            time: hotelCheckOut,
            kind: 'hotel',
            title: `Check out · ${hotelName.trim()}`,
            icon: 'Hotel',
            hotelId: hotelId!,
          },
        };
      }
    }

    onSave(payload);
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
        {!isHotel && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] tracking-widest text-sumi-500 uppercase block mb-1">時間</label>
              <input type="time" value={time} onChange={e => setTime(e.target.value)} className={`${INPUT_CLS} font-serif-jp`} />
            </div>
            <div>
              <label className="text-[10px] tracking-widest text-sumi-500 uppercase block mb-1">類型</label>
              <select value={kind} onChange={e => setKind(e.target.value as EventKind)} className={INPUT_CLS}>
                {EVENT_KINDS.map(k => (
                  <option key={k.value} value={k.value}>{k.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {isHotel ? (
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-[10px] tracking-widest text-sumi-500 uppercase">類型</label>
              <select value={kind} onChange={e => setKind(e.target.value as EventKind)} className="rounded-lg border border-washi-300 bg-washi-50 px-2 py-1 text-xs text-sumi-800 focus:outline-none">
                {EVENT_KINDS.map(k => (
                  <option key={k.value} value={k.value}>{k.label}</option>
                ))}
              </select>
            </div>

            <div className="rounded-xl border border-gold-400/40 bg-gold-200/20 p-4 space-y-3">
              <div className="text-[10px] tracking-widest text-gold-700 uppercase">飯店資訊</div>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-[10px] tracking-widest text-sumi-500 uppercase block mb-1">飯店名稱</label>
                  <input type="text" value={hotelName} onChange={e => setHotelName(e.target.value)} placeholder="例：Hotel Granvia Kyoto" className={INPUT_CLS} />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] tracking-widest text-sumi-500 uppercase block mb-1">日文名（可選）</label>
                  <input type="text" value={hotelNameJp} onChange={e => setHotelNameJp(e.target.value)} placeholder="例：ホテルグランヴィア京都" className={INPUT_CLS} />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] tracking-widest text-sumi-500 uppercase block mb-1">地址</label>
                  <input type="text" value={hotelAddress} onChange={e => setHotelAddress(e.target.value)} placeholder="例：京都市下京区烏丸通塩小路下ル" className={INPUT_CLS} />
                </div>
                <div>
                  <label className="text-[10px] tracking-widest text-sumi-500 uppercase block mb-1">入住日</label>
                  <select value={checkInDay} onChange={e => { const v = Number(e.target.value); setCheckInDay(v); if (checkOutDay <= v) setCheckOutDay(v + 1); }} className={INPUT_CLS}>
                    {days.map(d => <option key={d.id} value={d.id}>Day {d.id} · {d.date}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] tracking-widest text-sumi-500 uppercase block mb-1">退房日</label>
                  <select value={checkOutDay} onChange={e => setCheckOutDay(Number(e.target.value))} className={INPUT_CLS}>
                    {days.filter(d => d.id > checkInDay).map(d => <option key={d.id} value={d.id}>Day {d.id} · {d.date}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] tracking-widest text-sumi-500 uppercase block mb-1">Check-in 時間</label>
                  <input type="time" value={hotelCheckIn} onChange={e => setHotelCheckIn(e.target.value)} className={`${INPUT_CLS} font-serif-jp`} />
                </div>
                <div>
                  <label className="text-[10px] tracking-widest text-sumi-500 uppercase block mb-1">Check-out 時間</label>
                  <input type="time" value={hotelCheckOut} onChange={e => setHotelCheckOut(e.target.value)} className={`${INPUT_CLS} font-serif-jp`} />
                </div>
              </div>
              {nights > 0 && (
                <div className="rounded-lg bg-indigo2-800 text-washi-50 px-3 py-2 text-xs text-center font-serif-jp">
                  {hotelName || '—'} · {nights} 晚（Day {checkInDay} → Day {checkOutDay}）
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            <label className="text-[10px] tracking-widest text-sumi-500 uppercase block mb-1">標題</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="例：太宰府天滿宮" className={INPUT_CLS} />
          </div>
        )}

        {!isHotel && (
          <div>
            <label className="text-[10px] tracking-widest text-sumi-500 uppercase block mb-1">備註（可選）</label>
            <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="例：門票 ¥400" className={INPUT_CLS} />
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={isHotel ? !hotelName.trim() : !title.trim()}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo2-800 text-washi-50 text-sm hover:bg-indigo2-700 transition shadow-washi disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus size={16} />
            {event ? '儲存' : '新增'}
          </button>
          <button type="button" onClick={onCancel} className="px-4 py-2.5 rounded-xl border border-washi-300 text-sm text-sumi-700 hover:bg-washi-200/50 transition">
            取消
          </button>
        </div>
      </form>
    </SoftCard>
  );
}
