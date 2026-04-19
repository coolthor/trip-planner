import ICAL from 'ical.js';
import type { Day, DayEvent, EventKind, Hotel, TripData } from '../types/trip';

interface ParsedEvent {
  title: string;
  start: Date;
  end: Date;
  location?: string;
  description?: string;
}

function parseICSText(text: string): ParsedEvent[] {
  const jcalData = ICAL.parse(text);
  const comp = new ICAL.Component(jcalData);
  const vevents = comp.getAllSubcomponents('vevent');

  return vevents.map(ve => {
    const event = new ICAL.Event(ve);
    return {
      title: event.summary ?? '',
      start: event.startDate.toJSDate(),
      end: event.endDate.toJSDate(),
      location: event.location ?? undefined,
      description: event.description ?? undefined,
    };
  }).sort((a, b) => a.start.getTime() - b.start.getTime());
}

function categorizeEvent(ev: ParsedEvent): EventKind {
  const t = (ev.title + ' ' + (ev.description ?? '')).toLowerCase();
  if (/hotel|check.?in|check.?out|hostel|airbnb|旅館|酒店|民宿/.test(t)) return 'hotel';
  if (/train|列車|新幹線|特急|sonic|ソニック|ゆふいん/.test(t)) return 'train';
  if (/flight|plane|飛機|空港|airport/.test(t)) return 'plane';
  if (/luggage|行李|寄送|配送/.test(t)) return 'luggage';
  if (/bath|温泉|風呂|onsen/.test(t)) return 'bath';
  if (/eat|food|restaurant|dinner|lunch|breakfast|餐|食|ramen|ラーメン/.test(t)) return 'food';
  if (/temple|shrine|museum|sight|景|神社|寺|観光|地獄/.test(t)) return 'sight';
  if (/walk|散策|stroll/.test(t)) return 'walk';
  return 'move';
}

function kindToIcon(kind: EventKind): string {
  const map: Record<EventKind, string> = {
    plane: 'Plane', train: 'Train', move: 'Train', hotel: 'Hotel',
    food: 'Utensils', sight: 'Camera', bath: 'Bath', walk: 'Footprints',
    luggage: 'Truck',
  };
  return map[kind];
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(d: Date): string {
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  return `${m}/${day}（${weekdays[d.getDay()]}）`;
}

function formatDateLong(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
  return `${y}.${m}.${day} ${weekday}`;
}

export function parseICS(icsText: string): TripData {
  const events = parseICSText(icsText);

  if (events.length === 0) {
    throw new Error('No events found in ICS file');
  }

  const dayMap = new Map<string, ParsedEvent[]>();
  for (const ev of events) {
    const key = ev.start.toISOString().slice(0, 10);
    const list = dayMap.get(key) ?? [];
    list.push(ev);
    dayMap.set(key, list);
  }

  const sortedDates = [...dayMap.keys()].sort();
  const hotels: Record<string, Hotel> = {};
  let hotelIdx = 0;

  const days: Day[] = sortedDates.map((dateStr, i) => {
    const dayEvents = dayMap.get(dateStr)!;
    const firstEvent = dayEvents[0];
    const dayDate = firstEvent.start;

    const dayEventsTyped: DayEvent[] = dayEvents.map(ev => {
      const kind = categorizeEvent(ev);

      if (kind === 'hotel') {
        const id = `hotel_${hotelIdx++}`;
        hotels[id] = {
          id,
          name: ev.title,
          nameJp: '',
          city: ev.location ?? '',
          address: ev.location ?? '',
          checkIn: '15:00',
          checkOut: '11:00',
          nights: 1,
          dates: formatDate(ev.start),
          status: 'imported',
          map: ev.location
            ? `https://maps.google.com/?q=${encodeURIComponent(ev.location)}`
            : '',
        };
        return {
          time: formatTime(ev.start),
          kind,
          title: ev.title,
          note: ev.description,
          icon: kindToIcon(kind),
          hotelId: id,
        };
      }

      return {
        time: formatTime(ev.start),
        kind,
        title: ev.title,
        note: ev.description ?? ev.location,
        icon: kindToIcon(kind),
      };
    });

    const hotelEvent = dayEventsTyped.find(e => e.hotelId);

    return {
      id: i + 1,
      date: formatDate(dayDate),
      dateLong: formatDateLong(dayDate),
      city: dayEvents[0].location?.split(',')[0] ?? '',
      weather: { icon: 'Cloud', label: '—', temp: '—' },
      summary: dayEvents[0].title,
      events: dayEventsTyped,
      stayId: hotelEvent?.hotelId ?? null,
    };
  });

  const firstDate = new Date(sortedDates[0]);
  const lastDate = new Date(sortedDates[sortedDates.length - 1]);

  return {
    trip: {
      title: `${days.length} 日旅行`,
      subtitle: `${formatDateLong(firstDate)} — ${formatDateLong(lastDate)}`,
      dateRange: `${firstDate.toLocaleDateString('zh-TW')} – ${lastDate.toLocaleDateString('zh-TW')}`,
      travelers: '',
    },
    hotels,
    days,
    tickets: {},
    luggageRoute: days.map((_d, i) => ({
      day: i + 1,
      loc: '隨身',
      state: 'withYou' as const,
    })),
  };
}
