// shortcut: Prototyp im Speicher (wie features/demo/store); später SQLite + Sync, Bewerber nur für Inhaber (RLS).
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { persistOptions } from '@/lib/persist';

import * as seed from './data';
import type { Applicant, ApplicantStatus, JobOpening, WeekStatus } from './types';

type TeamState = {
  jobs: JobOpening[];
  applicants: Applicant[];
  addJob: (j: Omit<JobOpening, 'id' | 'slug' | 'open'>) => string;
  addApplicant: (a: Pick<Applicant, 'name' | 'phone' | 'jobId' | 'source'>) => string;
  /** Status je Berichtsheft-Woche, Schlüssel „azubiId:JJJJ-KW“. */
  weekStatus: Record<string, WeekStatus>;
  /** Wie oft jemand einen Job-Link geteilt hat, je Mitarbeiter-ID. */
  shares: Record<string, number>;
  setApplicantStatus: (id: string, status: ApplicantStatus) => void;
  addApplicantNote: (id: string, text: string) => void;
  setWeekStatus: (azubiId: string, weekKey: string, status: WeekStatus) => void;
  countShare: (memberId: string) => void;
};

const now = () => new Date().toISOString();
const newId = (p: string) => `${p}${Date.now().toString(36)}`;
/** „Anlagenmechaniker/in SHK“ → „anlagenmechaniker-in-shk“ (für den Link auf der Webseite). */
export const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export const useTeam = create<TeamState>()(
  persist(
    (set) => ({
      jobs: seed.jobs,
      applicants: seed.applicants,
      addJob: (j) => {
        const id = newId('j');
        set((s) => ({ jobs: [...s.jobs, { ...j, id, slug: slugify(j.title), open: true }] }));
        return id;
      },
      addApplicant: (a) => {
        const id = newId('b');
        set((s) => ({
          applicants: [
            ...s.applicants,
            { ...a, id, status: 'neu', createdAt: now(), answers: [], notes: [] },
          ],
        }));
        return id;
      },
      weekStatus: {},
      shares: { m2: 3, m3: 1 },
      setApplicantStatus: (id, status) =>
        set((s) => ({ applicants: s.applicants.map((a) => (a.id === id ? { ...a, status } : a)) })),
      addApplicantNote: (id, text) =>
        set((s) => ({
          applicants: s.applicants.map((a) =>
            a.id === id
              ? {
                  ...a,
                  notes: [
                    ...a.notes,
                    { id: `n${Date.now().toString(36)}`, text, createdAt: now() },
                  ],
                }
              : a,
          ),
        })),
      setWeekStatus: (azubiId, weekKey, status) =>
        set((s) => ({ weekStatus: { ...s.weekStatus, [`${azubiId}:${weekKey}`]: status } })),
      countShare: (memberId) =>
        set((s) => ({ shares: { ...s.shares, [memberId]: (s.shares[memberId] ?? 0) + 1 } })),
    }),
    persistOptions<TeamState>('team'),
  ),
);

/** Empfehlungen, die zu einer Zusage geführt haben = fällige Prämien, je Mitarbeiter. */
export function bonusesDue(applicants: Applicant[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const a of applicants) {
    if (a.source.kind === 'empfehlung' && a.status === 'zusage') {
      out[a.source.memberId] = (out[a.source.memberId] ?? 0) + 1;
    }
  }
  return out;
}
