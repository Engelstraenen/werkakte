// shortcut: Prototyp-Daten im Speicher (gehen beim Neuladen verloren); ab Phase 1 SQLite + Sync.
import { create } from 'zustand';

import * as seed from './data';
import type { Media, MediaTag, Note, Project, ProjectStatus, Quote, Timer } from './types';

const now = () => new Date().toISOString();
const newId = (prefix: string) => `${prefix}${Date.now().toString(36)}`;

type DemoState = {
  projects: Project[];
  media: Media[];
  notes: Note[];
  quotes: Quote[];
  timer: Timer;
  addProject: (p: Pick<Project, 'title' | 'customerId' | 'street' | 'zipCity'>) => string;
  setStatus: (projectId: string, status: ProjectStatus) => void;
  addNote: (projectId: string, text: string) => void;
  addPhoto: (projectId: string, tag: MediaTag, note: string) => void;
  addQuote: (projectId: string) => string;
  startTimer: (projectId: string) => void;
  stopTimer: () => void;
};

const touch = (projects: Project[], id: string, patch: Partial<Project> = {}) =>
  projects.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: now() } : p));

export const useDemo = create<DemoState>((set, get) => ({
  projects: seed.projects,
  media: seed.media,
  notes: seed.notes,
  quotes: seed.quotes,
  timer: null,

  addProject: (p) => {
    const id = newId('p');
    set((s) => ({
      projects: [
        { ...p, id, status: 'anfrage', memberIds: [seed.CURRENT_MEMBER_ID], updatedAt: now() },
        ...s.projects,
      ],
    }));
    return id;
  },
  setStatus: (projectId, status) =>
    set((s) => ({ projects: touch(s.projects, projectId, { status }) })),
  addNote: (projectId, text) =>
    set((s) => ({
      notes: [
        {
          id: newId('n'),
          projectId,
          kind: 'text',
          text,
          createdAt: now(),
          authorId: seed.CURRENT_MEMBER_ID,
        },
        ...s.notes,
      ],
      projects: touch(s.projects, projectId),
    })),
  addPhoto: (projectId, tag, note) =>
    set((s) => {
      // Ohne Kamera im Prototyp: eines der Beispielfotos wiederverwenden.
      const sample = seed.media[s.media.length % seed.media.length]!;
      return {
        media: [
          {
            id: newId('f'),
            projectId,
            source: sample.source,
            tag,
            note,
            takenAt: now(),
            authorId: seed.CURRENT_MEMBER_ID,
          },
          ...s.media,
        ],
        projects: touch(s.projects, projectId),
      };
    }),
  addQuote: (projectId) => {
    const id = newId('q');
    const number = `A-2026-${String(45 + get().quotes.length - seed.quotes.length).padStart(4, '0')}`;
    const due = new Date(Date.now() + 30 * 86400000).toISOString();
    const items = seed.catalog
      .filter((c) => c.id === 'k1' || c.id === 'k4')
      .map((c, i) => ({ ...c, id: `${id}-${i}`, qtyMilli: c.id === 'k1' ? 8000 : 1000 }));
    set((s) => ({
      quotes: [
        { id, projectId, number, date: now(), validUntil: due, status: 'entwurf', items },
        ...s.quotes,
      ],
      projects: touch(s.projects, projectId),
    }));
    return id;
  },
  startTimer: (projectId) => set({ timer: { projectId, startedAt: now() } }),
  stopTimer: () => set({ timer: null }),
}));
