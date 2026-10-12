const time = new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit' });
const dayShort = new Intl.DateTimeFormat('de-DE', {
  weekday: 'short',
  day: '2-digit',
  month: '2-digit',
});
const dayLong = new Intl.DateTimeFormat('de-DE', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});
const date = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

export const formatTime = (iso: string) => time.format(new Date(iso));
export const formatDayShort = (d: Date) => dayShort.format(d);
export const formatDayLong = (d: Date) => dayLong.format(d);
export const formatDate = (iso: string) => date.format(new Date(iso));

export const isSameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

export function startOfDay(d: Date): Date {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
}

export function addDays(d: Date, days: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + days);
  return r;
}

/** Montag der Woche von d. */
export const startOfWeek = (d: Date) => addDays(startOfDay(d), -((d.getDay() + 6) % 7));

/** "vor 5 Min.", "vor 3 Std.", "gestern", sonst Datum. */
export function formatRelative(iso: string, now = new Date()): string {
  const diffMin = Math.round((now.getTime() - new Date(iso).getTime()) / 60000);
  if (diffMin < 1) return 'gerade eben';
  if (diffMin < 60) return `vor ${diffMin} Min.`;
  if (diffMin < 60 * 24 && isSameDay(now, new Date(iso)))
    return `vor ${Math.round(diffMin / 60)} Std.`;
  if (isSameDay(addDays(now, -1), new Date(iso))) return 'gestern';
  return formatDate(iso);
}

/** "1:05 Std." aus Millisekunden. */
export function formatDuration(ms: number): string {
  const totalMin = Math.max(0, Math.floor(ms / 60000));
  return `${Math.floor(totalMin / 60)}:${String(totalMin % 60).padStart(2, '0')} Std.`;
}

/** "45 Min.", "3,5 Std." bzw. "62 Std." aus Minuten. */
export const formatHours = (minutes: number) =>
  minutes < 60
    ? `${minutes} Min.`
    : `${(Math.round(minutes / 6) / 10).toLocaleString('de-DE')} Std.`;
