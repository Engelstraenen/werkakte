// shortcut: Prototyp-Daten im Speicher (gehen beim Neuladen verloren); ab Phase 1 SQLite + Sync.
import { create } from 'zustand';

import * as seed from './data';
import type {
  DocItem,
  Media,
  MediaTag,
  Note,
  Project,
  ProjectCost,
  ProjectStatus,
  Quote,
  SupplierPrice,
  Timer,
} from './types';

const now = () => new Date().toISOString();
const newId = (prefix: string) => `${prefix}${Date.now().toString(36)}`;

type DemoState = {
  projects: Project[];
  media: Media[];
  notes: Note[];
  quotes: Quote[];
  timer: Timer;
  supplierPrices: SupplierPrice[];
  projectCosts: ProjectCost[];
  addSupplierPrice: (catalogItemId: string, supplierId: string, priceCents: number) => void;
  addMaterialCost: (
    projectId: string,
    text: string,
    amountCents: number,
    supplierId?: string,
  ) => void;
  addHours: (projectId: string, memberId: string, minutes: number) => void;
  addProject: (p: Pick<Project, 'title' | 'customerId' | 'street' | 'zipCity'>) => string;
  setStatus: (projectId: string, status: ProjectStatus) => void;
  setCover: (projectId: string, mediaId: string) => void;
  addNote: (projectId: string, text: string) => void;
  addPhoto: (projectId: string, tag: MediaTag, note: string) => void;
  addQuote: (projectId: string) => string;
  duplicateQuote: (fromQuoteId: string, projectId: string) => string;
  setQuoteItems: (quoteId: string, items: DocItem[]) => void;
  startTimer: (projectId: string) => void;
  stopTimer: () => void;
};

const nextQuoteNumber = (quotes: Quote[]) =>
  `A-2026-${String(45 + quotes.length - seed.quotes.length).padStart(4, '0')}`;
const in30Days = () => new Date(Date.now() + 30 * 86400000).toISOString();

const touch = (projects: Project[], id: string, patch: Partial<Project> = {}) =>
  projects.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: now() } : p));

export const useDemo = create<DemoState>((set, get) => ({
  projects: seed.projects,
  media: seed.media,
  notes: seed.notes,
  quotes: seed.quotes,
  timer: null,
  supplierPrices: seed.supplierPrices,
  projectCosts: seed.projectCosts,

  // Neuer Preis ersetzt den alten desselben Lieferanten für diesen Artikel.
  addSupplierPrice: (catalogItemId, supplierId, priceCents) =>
    set((s) => ({
      supplierPrices: [
        { id: newId('sp'), catalogItemId, supplierId, priceCents, updatedAt: now() },
        ...s.supplierPrices.filter(
          (p) => !(p.catalogItemId === catalogItemId && p.supplierId === supplierId),
        ),
      ],
    })),
  addMaterialCost: (projectId, text, amountCents, supplierId) =>
    set((s) => ({
      projectCosts: [
        {
          id: newId('pc'),
          projectId,
          kind: 'material',
          date: now(),
          text,
          amountCents,
          supplierId,
        },
        ...s.projectCosts,
      ],
      projects: touch(s.projects, projectId),
    })),
  addHours: (projectId, memberId, minutes) =>
    set((s) => ({
      projectCosts: [
        { id: newId('h'), projectId, kind: 'stunden', date: now(), memberId, minutes },
        ...s.projectCosts,
      ],
      projects: touch(s.projects, projectId),
    })),

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
  setCover: (projectId, mediaId) =>
    set((s) => ({ projects: touch(s.projects, projectId, { coverMediaId: mediaId }) })),
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
    const number = nextQuoteNumber(get().quotes);
    const due = in30Days();
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
  duplicateQuote: (fromQuoteId, projectId) => {
    const from = get().quotes.find((q) => q.id === fromQuoteId)!;
    const id = newId('q');
    const items = from.items.map((it, i) => ({ ...it, id: `${id}-${i}` }));
    set((s) => ({
      quotes: [
        {
          id,
          projectId,
          number: nextQuoteNumber(s.quotes),
          date: now(),
          validUntil: in30Days(),
          status: 'entwurf',
          items,
        },
        ...s.quotes,
      ],
      projects: touch(s.projects, projectId),
    }));
    return id;
  },
  setQuoteItems: (quoteId, items) =>
    set((s) => ({ quotes: s.quotes.map((q) => (q.id === quoteId ? { ...q, items } : q)) })),
  startTimer: (projectId) => set({ timer: { projectId, startedAt: now() } }),
  stopTimer: () => set({ timer: null }),
}));
