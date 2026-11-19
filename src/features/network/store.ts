// shortcut: Prototyp im Gerätespeicher (wie features/team/store). Live gehören Verzeichnis und Jobs in
// Supabase (firmenübergreifend, nicht offline-first): supabase/migrations/20261119120000_netzwerk.sql.
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { persistOptions } from '@/lib/persist';

import * as seed from './data';
import type { ProfileInput } from './logic';
import type { Craftsman, Referral } from './types';

export type ReferralInput = Pick<
  Referral,
  'trade' | 'title' | 'details' | 'zip' | 'city' | 'when' | 'toId' | 'projectId'
>;

type NetworkState = {
  /** Mein Eintrag im Verzeichnis; null = noch nicht eingetragen. */
  meId: string | null;
  craftsmen: Craftsman[];
  referrals: Referral[];
  /** Eintragen (erstes Mal) oder eigenen Eintrag ändern. */
  saveProfile: (p: ProfileInput) => string;
  /** Eintrag löschen (DSGVO): Profil weg, eigene offene Jobs zurückgezogen. */
  removeProfile: () => void;
  addReferral: (r: ReferralInput) => string;
  /** „Mach ich“ antippen bzw. zurücknehmen. */
  toggleInterest: (referralId: string) => void;
  /** Absender vergibt den Job an einen Betrieb. */
  assign: (referralId: string, craftsmanId: string) => void;
  withdraw: (referralId: string) => void;
  /** Zugeschobene Jobs, die ich als eigene Projektakte angelegt habe: Job-ID → Projekt-ID. */
  adopted: Record<string, string>;
  markAdopted: (referralId: string, projectId: string) => void;
};

const now = () => new Date().toISOString();
const newId = (p: string) =>
  `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

export const useNetwork = create<NetworkState>()(
  persist((set, get) => {
    const updateReferral = (id: string, fn: (r: Referral) => Referral) =>
      set((s) => ({ referrals: s.referrals.map((r) => (r.id === id ? fn(r) : r)) }));
    return {
      meId: null,
      craftsmen: seed.craftsmen,
      referrals: seed.referrals,
      saveProfile: (p) => {
        const { meId } = get();
        if (meId) {
          set((s) => ({
            craftsmen: s.craftsmen.map((c) => (c.id === meId ? { ...c, ...p } : c)),
          }));
          return meId;
        }
        const id = newId('h');
        set((s) => ({ meId: id, craftsmen: [...s.craftsmen, { ...p, id, createdAt: now() }] }));
        return id;
      },
      removeProfile: () => {
        const { meId } = get();
        if (!meId) return;
        set((s) => ({
          meId: null,
          craftsmen: s.craftsmen.filter((c) => c.id !== meId),
          referrals: s.referrals.map((r) => ({
            ...r,
            interested: r.interested.filter((i) => i !== meId),
            status: r.fromId === meId && r.status === 'offen' ? 'zurueckgezogen' : r.status,
          })),
        }));
      },
      addReferral: (r) => {
        const { meId } = get();
        if (!meId) throw new Error('Erst ins Netzwerk eintragen.');
        const id = newId('r');
        set((s) => ({
          referrals: [
            ...s.referrals,
            { ...r, id, fromId: meId, interested: [], status: 'offen', createdAt: now() },
          ],
        }));
        return id;
      },
      toggleInterest: (referralId) => {
        const { meId } = get();
        if (!meId) return;
        updateReferral(referralId, (r) => ({
          ...r,
          interested: r.interested.includes(meId)
            ? r.interested.filter((i) => i !== meId)
            : [...r.interested, meId],
        }));
      },
      assign: (referralId, craftsmanId) =>
        updateReferral(referralId, (r) => ({ ...r, status: 'vergeben', takenById: craftsmanId })),
      withdraw: (referralId) =>
        updateReferral(referralId, (r) => ({ ...r, status: 'zurueckgezogen' })),
      adopted: {},
      markAdopted: (referralId, projectId) =>
        set((s) => ({ adopted: { ...s.adopted, [referralId]: projectId } })),
    };
  }, persistOptions<NetworkState>('netzwerk')),
);

/** Mein Eintrag (oder undefined, wenn nicht eingetragen). */
export const useMe = () => useNetwork((s) => s.craftsmen.find((c) => c.id === s.meId));
