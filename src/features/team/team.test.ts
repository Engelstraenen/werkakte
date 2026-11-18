import { buildWeeks, formatHours, isoWeek, weekAsText } from './berichtsheft';
import { applicants, jobs } from './data';
import { jobLink, jobMessage } from './share';
import { bonusesDue } from './store';
import type { WorkLogEntry } from './types';

const entry = (
  date: string,
  place: WorkLogEntry['place'],
  minutes: number,
  task: string,
): WorkLogEntry => ({
  id: date + task,
  memberId: 'a1',
  date,
  place,
  minutes,
  task,
  photos: 1,
});

describe('Berichtsheft', () => {
  it('rechnet ISO-Kalenderwochen richtig (auch über den Jahreswechsel)', () => {
    expect(isoWeek(new Date(2026, 10, 18))).toEqual({ year: 2026, week: 47 });
    expect(isoWeek(new Date(2027, 0, 1))).toEqual({ year: 2026, week: 53 });
    expect(isoWeek(new Date(2025, 11, 29))).toEqual({ year: 2026, week: 1 });
  });

  it('gruppiert nach Woche und Tag, Berufsschule getrennt gezählt', () => {
    const weeks = buildWeeks(
      [
        entry('2026-11-16T15:00:00', 'betrieb', 240, 'Rohre verpresst'),
        entry('2026-11-16T17:00:00', 'betrieb', 240, 'Druckprobe'),
        entry('2026-11-17T15:00:00', 'berufsschule', 480, 'Lernfeld 7'),
        entry('2026-11-10T15:00:00', 'betrieb', 450, 'Verteiler montiert'),
      ],
      'a1',
    );
    expect(weeks.map((w) => w.week)).toEqual([47, 46]);
    const kw47 = weeks[0]!;
    expect(kw47.days).toHaveLength(2);
    expect(kw47.days[0]!.tasks).toEqual(['Rohre verpresst', 'Druckprobe']);
    expect(kw47.minutesBetrieb).toBe(480);
    expect(kw47.minutesSchule).toBe(480);
    expect(weekAsText(kw47, 'Lea Krüger', 'Anlagenmechanikerin SHK')).toContain('KW 47/2026');
  });

  it('formatiert Stunden deutsch', () => {
    expect(formatHours(450)).toBe('7,5 Std.');
  });
});

describe('Job-Link & Prämie', () => {
  it('enthält Stelle und wer geteilt hat', () => {
    expect(jobLink(jobs[0]!, 'm2')).toBe(
      'https://warmherz.example/jobs.html?stelle=monteur-waermepumpe&von=m2',
    );
    expect(jobMessage(jobs[0]!, 'm2', 'Weber Bad & Heizung')).toContain('60 Sekunden');
  });

  it('zählt nur Empfehlungen mit Zusage als fällige Prämie', () => {
    expect(bonusesDue(applicants)).toEqual({});
    const zugesagt = applicants.map((a) =>
      a.id === 'b1' ? { ...a, status: 'zusage' as const } : a,
    );
    expect(bonusesDue(zugesagt)).toEqual({ m2: 1 });
  });
});
