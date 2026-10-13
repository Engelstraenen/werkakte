// shortcut: Prototyp-Daten im Speicher (gehen beim Neuladen verloren); ab Phase 1 SQLite + Sync.
import { create } from 'zustand';

import { invoiceFromQuote } from '@/features/invoices/fromQuote';
import { formatNumber, type NumberFormat } from '@/lib/numbering';

import * as seed from './data';
import type {
  DocItem,
  Invoice,
  MaterialRequest,
  Media,
  MediaTag,
  Note,
  Project,
  ProjectCost,
  ProjectStatus,
  Quote,
  Reminders,
  SendSettings,
  SupplierPrice,
  RunningTimer,
} from './types';

const now = () => new Date().toISOString();
const newId = (prefix: string) => `${prefix}${Date.now().toString(36)}`;

type DemoState = {
  projects: Project[];
  media: Media[];
  notes: Note[];
  quotes: Quote[];
  invoices: Invoice[];
  /** Laufende Zeiten je Mitarbeiter-ID. */
  timers: Record<string, RunningTimer>;
  /** Wer im Projekt mitarbeitet (= wer dort Zeit erfassen darf). */
  setTeam: (projectId: string, memberIds: string[]) => void;
  sending: SendSettings;
  reminders: Reminders;
  setSending: (patch: Partial<SendSettings>) => void;
  setReminders: (patch: Partial<Reminders>) => void;
  acceptQuote: (quoteId: string) => void;
  createInvoice: (quoteId: string) => string;
  /** Versenden: Rechnungen bekommen erst jetzt ihre Nummer; danach gesperrt. */
  sendDoc: (docId: string) => void;
  markPaid: (invoiceId: string) => void;
  numbering: { angebot: NumberFormat; rechnung: NumberFormat };
  setNumbering: (kind: 'angebot' | 'rechnung', format: NumberFormat) => void;
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
  resolveProblem: (mediaId: string) => void;
  materialRequests: MaterialRequest[];
  addMaterialRequest: (
    r: Pick<MaterialRequest, 'projectId' | 'text' | 'quantity' | 'urgent'>,
  ) => void;
  setMaterialStatus: (id: string, status: MaterialRequest['status']) => void;
  addQuote: (projectId: string) => string;
  duplicateQuote: (fromQuoteId: string, projectId: string) => string;
  setQuoteItems: (quoteId: string, items: DocItem[]) => void;
  /**
   * Startet die Zeit einer Person in einem Projekt – nur wenn sie zum Projekt-Team gehört.
   * Läuft ihre Zeit schon woanders, wird die vorher gestoppt und gespeichert.
   */
  startTimer: (projectId: string, memberId?: string) => boolean;
  /** Stoppt die Zeit einer Person und speichert sie als Stunden im Projekt. */
  stopTimer: (memberId?: string) => void;
};

const in30Days = () => new Date(Date.now() + 30 * 86400000).toISOString();

const touch = (projects: Project[], id: string, patch: Partial<Project> = {}) =>
  projects.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: now() } : p));

export const useDemo = create<DemoState>((set, get) => {
  /** Nächste Angebotsnummer vergeben und Zähler erhöhen. */
  const takeQuoteNumber = () => {
    const f = get().numbering.angebot;
    set((s) => ({ numbering: { ...s.numbering, angebot: { ...f, next: f.next + 1 } } }));
    return formatNumber(f);
  };
  const takeInvoiceNumber = () => {
    const f = get().numbering.rechnung;
    set((s) => ({ numbering: { ...s.numbering, rechnung: { ...f, next: f.next + 1 } } }));
    return formatNumber(f);
  };
  return {
    projects: seed.projects,
    media: seed.media,
    notes: seed.notes,
    quotes: seed.quotes,
    invoices: seed.invoices,
    timers: {
      m2: { projectId: 'p1', startedAt: new Date(Date.now() - 65 * 60000).toISOString() },
      m3: { projectId: 'p7', startedAt: new Date(Date.now() - 95 * 60000).toISOString() },
    },
    setTeam: (projectId, memberIds) =>
      set((s) => ({ projects: touch(s.projects, projectId, { memberIds }) })),
    sending: {
      copyToMe: true,
      myEmail: seed.company.email,
      toDatev: true,
      datevEmail: 'weber-belege@upload.example',
      materialRecipients: [seed.CURRENT_MEMBER_ID],
      purchasingEmail: '',
    },
    reminders: {
      followUp: true,
      followUpDays: 7,
      overdue: true,
      dailyWrapUp: true,
      wrapUpHour: 17,
      autoClockIn: false,
    },
    setSending: (patch) => set((s) => ({ sending: { ...s.sending, ...patch } })),
    setReminders: (patch) => set((s) => ({ reminders: { ...s.reminders, ...patch } })),
    acceptQuote: (quoteId) =>
      set((s) => {
        const q = s.quotes.find((x) => x.id === quoteId)!;
        return {
          quotes: s.quotes.map((x) =>
            x.id === quoteId ? { ...x, status: 'angenommen' as const } : x,
          ),
          projects: touch(s.projects, q.projectId, { status: 'beauftragt' }),
        };
      }),
    createInvoice: (quoteId) => {
      const id = newId('r');
      const quote = get().quotes.find((q) => q.id === quoteId)!;
      const invoice = invoiceFromQuote(quote, get().invoices, id);
      set((s) => ({
        invoices: [invoice, ...s.invoices],
        projects: touch(s.projects, quote.projectId),
      }));
      return id;
    },
    sendDoc: (docId) => {
      const inv = get().invoices.find((i) => i.id === docId);
      if (inv) {
        if (inv.status !== 'entwurf') return;
        const number = takeInvoiceNumber();
        set((s) => ({
          invoices: s.invoices.map((i) =>
            i.id === docId
              ? { ...i, number, status: 'versendet' as const, date: now(), sentAt: now() }
              : i,
          ),
        }));
        return;
      }
      set((s) => ({
        quotes: s.quotes.map((q) =>
          q.id === docId && q.status === 'entwurf'
            ? { ...q, status: 'versendet' as const, sentAt: now() }
            : q,
        ),
      }));
    },
    markPaid: (invoiceId) =>
      set((s) => ({
        invoices: s.invoices.map((i) =>
          i.id === invoiceId ? { ...i, status: 'bezahlt' as const } : i,
        ),
      })),
    numbering: {
      angebot: { prefix: 'A-{Jahr}-', next: 45, digits: 4, suffix: '' },
      rechnung: { prefix: 'R-{Jahr}-', next: 30, digits: 4, suffix: '' },
    },
    setNumbering: (kind, format) => set((s) => ({ numbering: { ...s.numbering, [kind]: format } })),
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
    resolveProblem: (mediaId) =>
      set((s) => ({
        media: s.media.map((m) => (m.id === mediaId ? { ...m, resolvedAt: now() } : m)),
      })),
    materialRequests: seed.materialRequests,
    addMaterialRequest: (r) =>
      set((s) => ({
        materialRequests: [
          {
            ...r,
            id: newId('mr'),
            memberId: seed.CURRENT_MEMBER_ID,
            status: 'offen',
            createdAt: now(),
          },
          ...s.materialRequests,
        ],
        projects: touch(s.projects, r.projectId),
      })),
    setMaterialStatus: (id, status) =>
      set((s) => ({
        materialRequests: s.materialRequests.map((r) => (r.id === id ? { ...r, status } : r)),
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
      const number = takeQuoteNumber();
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
      const number = takeQuoteNumber();
      set((s) => ({
        quotes: [
          {
            id,
            projectId,
            number,
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
    startTimer: (projectId, memberId = seed.CURRENT_MEMBER_ID) => {
      const project = get().projects.find((p) => p.id === projectId);
      if (!project?.memberIds.includes(memberId)) return false;
      if (get().timers[memberId]) get().stopTimer(memberId);
      set((s) => ({ timers: { ...s.timers, [memberId]: { projectId, startedAt: now() } } }));
      return true;
    },
    stopTimer: (memberId = seed.CURRENT_MEMBER_ID) => {
      const timer = get().timers[memberId];
      if (!timer) return;
      const minutes = Math.max(
        1,
        Math.round((Date.now() - new Date(timer.startedAt).getTime()) / 60000),
      );
      set((s) => {
        const { [memberId]: _stopped, ...rest } = s.timers;
        return { timers: rest };
      });
      get().addHours(timer.projectId, memberId, minutes);
    },
  };
});
