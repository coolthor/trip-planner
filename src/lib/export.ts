import type { TripData } from '../types/trip';

export function exportJSON(data: TripData) {
  const json = JSON.stringify(data, null, 2);
  download(json, `${slugify(data.trip.title)}.json`, 'application/json');
}

export function exportICS(data: TripData) {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//TripPlanner//EN',
    `X-WR-CALNAME:${data.trip.title}`,
  ];

  for (const day of data.days) {
    const dateMatch = day.dateLong.match(/(\d{4})\.(\d{2})\.(\d{2})/);
    if (!dateMatch) continue;
    const dateStr = `${dateMatch[1]}${dateMatch[2]}${dateMatch[3]}`;

    for (const ev of day.events) {
      const timeClean = ev.time.replace(/[^0-9:]/g, '');
      const [h, m] = timeClean.split(':').map(Number);
      if (isNaN(h) || isNaN(m)) continue;

      const dtstart = `${dateStr}T${pad(h)}${pad(m)}00`;
      const dtend = `${dateStr}T${pad(h + 1)}${pad(m)}00`;

      lines.push('BEGIN:VEVENT');
      lines.push(`DTSTART;TZID=Asia/Tokyo:${dtstart}`);
      lines.push(`DTEND;TZID=Asia/Tokyo:${dtend}`);
      lines.push(`SUMMARY:${escICS(ev.title)}`);
      if (ev.note) lines.push(`DESCRIPTION:${escICS(ev.note)}`);
      if (ev.hotelId && data.hotels[ev.hotelId]) {
        lines.push(`LOCATION:${escICS(data.hotels[ev.hotelId].address)}`);
      }
      lines.push(`UID:${dateStr}-${pad(h)}${pad(m)}-${Math.random().toString(36).slice(2, 8)}@tripplanner`);
      lines.push('END:VEVENT');
    }
  }

  lines.push('END:VCALENDAR');
  download(lines.join('\r\n'), `${slugify(data.trip.title)}.ics`, 'text/calendar');
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function escICS(s: string): string {
  return s.replace(/[\\;,\n]/g, c => c === '\n' ? '\\n' : `\\${c}`);
}

function slugify(s: string): string {
  return s.replace(/[·\s]+/g, '-').replace(/[^\w\u4e00-\u9fff-]/g, '').slice(0, 50) || 'trip';
}

function download(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
