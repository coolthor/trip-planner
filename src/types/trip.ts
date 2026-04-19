export type EventKind =
  | 'plane' | 'train' | 'move' | 'hotel' | 'food'
  | 'sight' | 'bath' | 'walk' | 'luggage';

export type LuggageState = 'atHotel' | 'withYou' | 'inTransit' | 'delivered';

export type TicketColor = 'indigo' | 'gold';

export interface Trip {
  title: string;
  subtitle: string;
  dateRange: string;
  travelers: string;
}

export interface Hotel {
  id: string;
  name: string;
  nameJp: string;
  city: string;
  address: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  dates: string;
  status: string;
  map: string;
  tag?: string;
}

export interface TrainInfo {
  name: string;
  nameRoman: string;
  series?: string;
  seat: string;
  from: string;
  to: string;
  depart: string;
  arrive: string;
  car: string;
  platform?: string;
  note?: string;
  highlight?: boolean;
}

export interface Weather {
  icon: string;
  label: string;
  temp: string;
}

export interface DayLuggage {
  from: string;
  to: string;
  sendAt: string;
  status: LuggageState;
}

export interface DayEvent {
  time: string;
  kind: EventKind;
  title: string;
  note?: string;
  icon: string;
  train?: TrainInfo;
  hotelId?: string;
}

export interface Day {
  id: number;
  date: string;
  dateLong: string;
  city: string;
  weather: Weather;
  summary: string;
  events: DayEvent[];
  stayId: string | null;
  ticketId?: string;
  luggage?: DayLuggage;
}

export interface Ticket {
  id: string;
  name: string;
  nameJp: string;
  qty: number;
  validity: string;
  useDays: number[];
  note: string;
  color: TicketColor;
}

export interface LuggageStop {
  day: number;
  loc: string;
  state: LuggageState;
  sub?: string;
}

export interface TripData {
  trip: Trip;
  hotels: Record<string, Hotel>;
  days: Day[];
  tickets: Record<string, Ticket>;
  luggageRoute: LuggageStop[];
}
