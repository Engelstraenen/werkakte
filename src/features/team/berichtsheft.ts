// Digitales Berichtsheft: baut aus den Tageseinträgen (Zeiten + Fotos aus den Projekten) Wochen,
// so wie sie im Ausbildungsnachweis stehen. Reine Funktionen, ohne UI – getestet in berichtsheft.test.ts.
import type { WorkLogEntry } from './types';

export type ReportDay = {
  date: string;
  place: 'betrieb' | 'berufsschule';
  minutes: number;
  tasks: string[];
  photos: number;
};

export type ReportWeek = {
  /** Schlüssel „JJJJ-KW“, z. B. „2026-47“. */
  key: string;
  year: number;
  week: number;
  /** Montag der Woche (ISO-Datum). */
  monday: string;
  days: ReportDay[];
  minutesBetrieb: number;
  minutesSchule: number;
};

/** ISO-Kalenderwoche (Montag = erster Tag, Woche mit dem 4. Januar = KW 1). */
export function isoWeek(date: Date): { year: number; week: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { year: d.getUTCFullYear(), week };
}

function mondayOf(date: Date): string {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay() || 7;
  d.setDate(d.getDate() - day + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const dayKey = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/** Gruppiert Einträge einer Person nach Woche und Tag, neueste Woche zuerst. */
export function buildWeeks(entries: WorkLogEntry[], memberId: string): ReportWeek[] {
  const weeks = new Map<string, ReportWeek>();
  for (const e of entries.filter((x) => x.memberId === memberId)) {
    const date = new Date(e.date);
    const { year, week } = isoWeek(date);
    const key = `${year}-${String(week).padStart(2, '0')}`;
    if (!weeks.has(key)) {
      weeks.set(key, {
        key,
        year,
        week,
        monday: mondayOf(date),
        days: [],
        minutesBetrieb: 0,
        minutesSchule: 0,
      });
    }
    const w = weeks.get(key)!;
    const dk = dayKey(e.date);
    let day = w.days.find((d) => dayKey(d.date) === dk);
    if (!day) {
      day = { date: e.date, place: e.place, minutes: 0, tasks: [], photos: 0 };
      w.days.push(day);
    }
    day.minutes += e.minutes;
    day.photos += e.photos;
    if (e.task) day.tasks.push(e.task);
    if (e.place === 'berufsschule') {
      day.place = 'berufsschule';
      w.minutesSchule += e.minutes;
    } else w.minutesBetrieb += e.minutes;
  }
  const list = [...weeks.values()];
  list.forEach((w) => w.days.sort((a, b) => a.date.localeCompare(b.date)));
  return list.sort((a, b) => b.key.localeCompare(a.key));
}

/** „7,5 Std.“ */
export const formatHours = (minutes: number) =>
  `${(Math.round((minutes / 60) * 10) / 10).toLocaleString('de-DE')} Std.`;

/** Text einer Woche zum Teilen/Ausdrucken (bis das PDF-Template kommt). */
export function weekAsText(w: ReportWeek, name: string, beruf: string): string {
  const lines = [`Ausbildungsnachweis KW ${w.week}/${w.year} – ${name}, ${beruf}`, ''];
  for (const d of w.days) {
    const label = new Date(d.date).toLocaleDateString('de-DE', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
    });
    lines.push(
      `${label} · ${d.place === 'berufsschule' ? 'Berufsschule' : 'Betrieb'} · ${formatHours(d.minutes)}`,
    );
    d.tasks.forEach((t) => lines.push(`  – ${t}`));
  }
  lines.push(
    '',
    `Betrieb: ${formatHours(w.minutesBetrieb)} · Berufsschule: ${formatHours(w.minutesSchule)}`,
  );
  return lines.join('\n');
}
