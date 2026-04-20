import ICAL from 'ical.js';
import type { Day, DayEvent, EventKind, Hotel, TripData, Ticket, LuggageStop, TrainInfo } from '../types/trip';

interface ParsedEvent {
  title: string;
  start: Date;
  end: Date;
  location?: string;
  description?: string;
  kind?: EventKind;
  icon?: string;
  hotelId?: string;
  train?: TrainInfo;
}

interface TripMeta {
  trip?: TripData['trip'];
  hotels?: Record<string, Hotel>;
  tickets?: Record<string, Ticket>;
  luggageRoute?: LuggageStop[];
  dayStays?: Record<number, string>;
  dayTickets?: Record<number, string>;
}

function tryDecodeBase64Json<T>(encoded: string): T | null {
  try {
    return JSON.parse(decodeURIComponent(atob(encoded))) as T;
  } catch {
    return null;
  }
}

function parseICSRich(text: string): { events: ParsedEvent[]; meta: TripMeta } {
  const jcalData = ICAL.parse(text);
  const comp = new ICAL.Component(jcalData);
  const vevents = comp.getAllSubcomponents('vevent');

  const meta: TripMeta = { dayStays: {}, dayTickets: {} };

  const tripDataProp = comp.getFirstPropertyValue('x-trip-data') as string | null;
  if (tripDataProp) {
    const decoded = tryDecodeBase64Json<{
      trip?: TripData['trip'];
      hotels?: Record<string, Hotel>;
      tickets?: Record<string, Ticket>;
      luggageRoute?: LuggageStop[];
    }>(tripDataProp);
    if (decoded) {
      meta.trip = decoded.trip;
      meta.hotels = decoded.hotels;
      meta.tickets = decoded.tickets;
      meta.luggageRoute = decoded.luggageRoute;
    }
  }

  for (const prop of comp.getAllProperties()) {
    const name = prop.name;
    const dayStayMatch = name.match(/^x-day-(\d+)-stay$/);
    if (dayStayMatch) {
      meta.dayStays![Number(dayStayMatch[1])] = prop.getFirstValue() as string;
    }
    const dayTicketMatch = name.match(/^x-day-(\d+)-ticket$/);
    if (dayTicketMatch) {
      meta.dayTickets![Number(dayTicketMatch[1])] = prop.getFirstValue() as string;
    }
  }

  const events: ParsedEvent[] = vevents.map(ve => {
    const event = new ICAL.Event(ve);
    const category = ve.getFirstPropertyValue('categories') as string | null;
    const iconProp = ve.getFirstPropertyValue('x-event-icon') as string | null;
    const hotelIdProp = ve.getFirstPropertyValue('x-hotel-id') as string | null;
    const trainDataProp = ve.getFirstPropertyValue('x-train-data') as string | null;

    const parsed: ParsedEvent = {
      title: event.summary ?? '',
      start: event.startDate.toJSDate(),
      end: event.endDate.toJSDate(),
      location: event.location ?? undefined,
      description: event.description ?? undefined,
    };

    if (category) parsed.kind = category as EventKind;
    if (iconProp) parsed.icon = iconProp;
    if (hotelIdProp) parsed.hotelId = hotelIdProp;
    if (trainDataProp) {
      parsed.train = tryDecodeBase64Json<TrainInfo>(trainDataProp) ?? undefined;
    }

    return parsed;
  }).sort((a, b) => a.start.getTime() - b.start.getTime());

  return { events, meta };
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
  const { events, meta } = parseICSRich(icsText);

  if (events.length === 0) {
    throw new Error('No events found in ICS file');
  }

  const hasMeta = !!meta.trip;

  const dayMap = new Map<string, ParsedEvent[]>();
  for (const ev of events) {
    const key = ev.start.toISOString().slice(0, 10);
    const list = dayMap.get(key) ?? [];
    list.push(ev);
    dayMap.set(key, list);
  }

  const sortedDates = [...dayMap.keys()].sort();
  const hotels: Record<string, Hotel> = hasMeta ? { ...meta.hotels! } : {};
  let hotelIdx = 0;

  const days: Day[] = sortedDates.map((dateStr, i) => {
    const dayEvents = dayMap.get(dateStr)!;
    const firstEvent = dayEvents[0];
    const dayDate = firstEvent.start;
    const dayId = i + 1;

    const dayEventsTyped: DayEvent[] = dayEvents.map(ev => {
      const kind = ev.kind ?? categorizeEvent(ev);
      const icon = ev.icon ?? kindToIcon(kind);

      if (ev.hotelId && hasMeta) {
        return {
          time: formatTime(ev.start),
          kind,
          title: ev.title,
          note: ev.description,
          icon,
          hotelId: ev.hotelId,
          train: ev.train,
        };
      }

      if (kind === 'hotel' && !hasMeta) {
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
          icon,
          hotelId: id,
        };
      }

      return {
        time: formatTime(ev.start),
        kind,
        title: ev.title,
        note: ev.description ?? ev.location,
        icon,
        train: ev.train,
      };
    });

    const stayId = meta.dayStays?.[dayId]
      ?? dayEventsTyped.find(e => e.hotelId)?.hotelId
      ?? null;

    return {
      id: dayId,
      date: formatDate(dayDate),
      dateLong: formatDateLong(dayDate),
      city: dayEvents[0].location?.split(',')[0] ?? '',
      weather: { icon: 'Cloud', label: '—', temp: '—' },
      summary: dayEvents[0].title,
      events: dayEventsTyped,
      stayId,
      ticketId: meta.dayTickets?.[dayId],
    };
  });

  const firstDate = new Date(sortedDates[0]);
  const lastDate = new Date(sortedDates[sortedDates.length - 1]);

  return {
    trip: meta.trip ?? {
      title: `${days.length} 日旅行`,
      subtitle: `${formatDateLong(firstDate)} — ${formatDateLong(lastDate)}`,
      dateRange: `${firstDate.toLocaleDateString('zh-TW')} – ${lastDate.toLocaleDateString('zh-TW')}`,
      travelers: '',
    },
    hotels,
    days,
    tickets: meta.tickets ?? {},
    luggageRoute: meta.luggageRoute ?? days.map((_d, i) => ({
      day: i + 1,
      loc: '隨身',
      state: 'withYou' as const,
    })),
  };
}
