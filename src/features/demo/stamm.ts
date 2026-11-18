// shortcut: Stammdaten im Speicher (Prototyp) – Kunden, Artikel, Lieferanten, Mitarbeiter, Termine.
// Vorher feste Listen aus data.ts; jetzt anlegen und ändern möglich (19.11.2026, „überall ein Plus“).
// Ab Phase 1: Tabellen customer, catalog_item, supplier, member, appointment in SQLite + Sync.
import { create } from 'zustand';

import * as seed from './data';
import type { Appointment, CatalogItem, Customer, Member, Supplier } from './types';
import type { Trade } from '@/features/quotes/trades';

const newId = (prefix: string) =>
  `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

type StammState = {
  /** Gewerk des Betriebs – steuert Wortvorschläge in Angebot und Rechnung. */
  trade: Trade;
  setTrade: (trade: Trade) => void;
  customers: Customer[];
  catalog: CatalogItem[];
  suppliers: Supplier[];
  members: Member[];
  appointments: Appointment[];
  addCustomer: (c: Omit<Customer, 'id'>) => string;
  updateCustomer: (id: string, patch: Partial<Omit<Customer, 'id'>>) => void;
  addCatalogItem: (c: Omit<CatalogItem, 'id'>) => string;
  updateCatalogItem: (id: string, patch: Partial<Omit<CatalogItem, 'id'>>) => void;
  addSupplier: (s: Omit<Supplier, 'id'>) => string;
  addMember: (m: Omit<Member, 'id'>) => string;
  updateMember: (id: string, patch: Partial<Omit<Member, 'id'>>) => void;
  addAppointment: (a: Omit<Appointment, 'id'>) => string;
  removeAppointment: (id: string) => void;
};

export const useStamm = create<StammState>((set) => ({
  trade: 'shk',
  setTrade: (trade) => set({ trade }),
  customers: seed.customers,
  catalog: seed.catalog,
  suppliers: seed.suppliers,
  members: seed.members,
  appointments: seed.appointments,
  addCustomer: (c) => {
    const id = newId('c');
    set((s) => ({ customers: [...s.customers, { ...c, id }] }));
    return id;
  },
  updateCustomer: (id, patch) =>
    set((s) => ({ customers: s.customers.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),
  addCatalogItem: (c) => {
    const id = newId('k');
    set((s) => ({ catalog: [...s.catalog, { ...c, id }] }));
    return id;
  },
  updateCatalogItem: (id, patch) =>
    set((s) => ({ catalog: s.catalog.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),
  addSupplier: (sup) => {
    const id = newId('s');
    set((s) => ({ suppliers: [...s.suppliers, { ...sup, id }] }));
    return id;
  },
  addMember: (m) => {
    const id = newId('m');
    set((s) => ({ members: [...s.members, { ...m, id }] }));
    return id;
  },
  updateMember: (id, patch) =>
    set((s) => ({ members: s.members.map((m) => (m.id === id ? { ...m, ...patch } : m)) })),
  addAppointment: (a) => {
    const id = newId('t');
    set((s) => ({ appointments: [...s.appointments, { ...a, id }] }));
    return id;
  },
  removeAppointment: (id) =>
    set((s) => ({ appointments: s.appointments.filter((a) => a.id !== id) })),
}));

/** Euro-Eingabe („68,50“ oder „68.5“) in Cent; null bei ungültiger Eingabe. */
export function parseEuroToCents(text: string): number | null {
  const clean = text
    .replace(/[€\s]/g, '')
    .replace(/\.(?=\d{3}(\D|$))/g, '')
    .replace(',', '.');
  if (!clean) return null;
  const n = Number(clean);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : null;
}

/** „08:30“ → Minuten seit Mitternacht; null bei ungültiger Uhrzeit. */
export function parseTime(text: string): number | null {
  const m = text.trim().match(/^(\d{1,2})[:.]?(\d{2})?$/);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2] ?? '0');
  return h < 24 && min < 60 ? h * 60 + min : null;
}
