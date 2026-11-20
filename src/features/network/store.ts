// Handwerker-Netzwerk: zwei Betriebsarten mit derselben Oberfläche.
// - lokal (kein Supabase eingerichtet, Tests): Beispiel-Betriebe im Gerätespeicher.
// - live (EXPO_PUBLIC_SUPABASE_URL gesetzt): Verzeichnis und Jobs kommen aus Supabase (remote.ts),
//   firmenübergreifend und online statt offline-first. Der Speicher ist dann nur die Anzeige-Kopie;
//   NetworkSync (TanStack Query) lädt regelmäßig nach, jede Aktion schreibt erst in Supabase und lädt dann neu.
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { isSupabaseConfigured } from '@/lib/supabase';
import { persistOptions } from '@/lib/persist';

import * as seed from './data';
import type { ProfileInput } from './logic';
import * as remote from './remote';
import type { Craftsman, Referral } from './types';

export type ReferralInput = Pick<
  Referral,
  'trade' | 'title' | 'details' | 'zip' | 'city' | 'when' | 'toId' | 'projectId'
>;

type NetworkState = {
  /** true = Supabase (echte Betriebe), false = Beispieldaten auf dem Gerät. */
  live: boolean;
  /** Angemeldetes Supabase-Konto (nur live). */
  userId: string | null;
  /** Live: erster Ladevorgang fertig. */
  loaded: boolean;
  /** Mein Eintrag im Verzeichnis; null = noch nicht eingetragen. */
  meId: string | null;
  craftsmen: Craftsman[];
  referrals: Referral[];
  /** Live: Stand aus Supabase holen (für das angegebene oder aktuelle Konto). */
  refresh: (userId?: string | null) => Promise<void>;
  /** Eintragen (erstes Mal) oder eigenen Eintrag ändern. */
  saveProfile: (p: ProfileInput) => Promise<string>;
  /** Eintrag löschen (DSGVO): Profil weg, eigene offene Jobs zurückgezogen bzw. gelöscht. */
  removeProfile: () => Promise<void>;
  addReferral: (r: ReferralInput) => Promise<string>;
  /** „Mach ich“ antippen bzw. zurücknehmen. */
  toggleInterest: (referralId: string) => Promise<void>;
  /** Absender vergibt den Job an einen Betrieb. */
  assign: (referralId: string, craftsmanId: string) => Promise<void>;
  withdraw: (referralId: string) => Promise<void>;
  /** Zugeschobene Jobs, die ich als eigene Projektakte angelegt habe: Job-ID → Projekt-ID. */
  adopted: Record<string, string>;
  markAdopted: (referralId: string, projectId: string) => void;
};

const now = () => new Date().toISOString();
const newId = (p: string) =>
  `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

export const useNetwork = create<NetworkState>()(
  persist(
    (set, get) => {
      const updateReferral = (id: string, fn: (r: Referral) => Referral): void => {
        set((s) => ({ referrals: s.referrals.map((r) => (r.id === id ? fn(r) : r)) }));
      };
      /** Live: in Supabase schreiben, dann neu laden. Lokal: Speicher direkt ändern. */
      const write = async <T>(live: () => Promise<T>, local: () => T): Promise<T> => {
        if (!get().live) return local();
        const result = await live();
        await get().refresh();
        return result;
      };
      const requireMe = () => {
        const { meId } = get();
        if (!meId) throw new Error('Erst ins Netzwerk eintragen.');
        return meId;
      };
      const live = isSupabaseConfigured;
      return {
        live,
        userId: null,
        loaded: !live,
        meId: null,
        craftsmen: live ? [] : seed.craftsmen,
        referrals: live ? [] : seed.referrals,
        refresh: async (userId) => {
          if (!get().live) return;
          const uid = userId === undefined ? get().userId : userId;
          const snap = await remote.loadSnapshot(uid);
          set({ ...snap, userId: uid, loaded: true });
        },
        saveProfile: (p) =>
          write(
            () => remote.saveProfile(get().meId, p),
            () => {
              const { meId } = get();
              if (meId) {
                set((s) => ({
                  craftsmen: s.craftsmen.map((c) => (c.id === meId ? { ...c, ...p } : c)),
                }));
                return meId;
              }
              const id = newId('h');
              set((s) => ({
                meId: id,
                craftsmen: [...s.craftsmen, { ...p, id, createdAt: now() }],
              }));
              return id;
            },
          ),
        removeProfile: async () => {
          const { meId } = get();
          if (!meId) return;
          await write(
            () => remote.removeProfile(meId),
            () =>
              set((s) => ({
                meId: null,
                craftsmen: s.craftsmen.filter((c) => c.id !== meId),
                referrals: s.referrals.map((r) => ({
                  ...r,
                  interested: r.interested.filter((i) => i !== meId),
                  status: r.fromId === meId && r.status === 'offen' ? 'zurueckgezogen' : r.status,
                })),
              })),
          );
        },
        addReferral: (r) => {
          const meId = requireMe();
          return write(
            () => remote.addReferral(r),
            () => {
              const id = newId('r');
              set((s) => ({
                referrals: [
                  ...s.referrals,
                  { ...r, id, fromId: meId, interested: [], status: 'offen', createdAt: now() },
                ],
              }));
              return id;
            },
          );
        },
        toggleInterest: async (referralId) => {
          const { meId } = get();
          if (!meId) return;
          const on = !get()
            .referrals.find((r) => r.id === referralId)
            ?.interested.includes(meId);
          await write(
            () => remote.setInterest(referralId, on, meId),
            () =>
              updateReferral(referralId, (r) => ({
                ...r,
                interested: on ? [...r.interested, meId] : r.interested.filter((i) => i !== meId),
              })),
          );
        },
        assign: (referralId, craftsmanId) =>
          write(
            () => remote.assign(referralId, craftsmanId),
            () =>
              updateReferral(referralId, (r) => ({
                ...r,
                status: 'vergeben',
                takenById: craftsmanId,
              })),
          ),
        withdraw: (referralId) =>
          write(
            () => remote.withdraw(referralId),
            () => updateReferral(referralId, (r) => ({ ...r, status: 'zurueckgezogen' })),
          ),
        adopted: {},
        markAdopted: (referralId, projectId) =>
          set((s) => ({ adopted: { ...s.adopted, [referralId]: projectId } })),
      };
    },
    persistOptions<NetworkState>('netzwerk', {
      // Live liegt alles in Supabase; auf dem Gerät bleibt nur, welche Jobs schon Akten sind.
      partialize: (s) =>
        (s.live
          ? { adopted: s.adopted }
          : {
              meId: s.meId,
              craftsmen: s.craftsmen,
              referrals: s.referrals,
              adopted: s.adopted,
            }) as Partial<NetworkState>,
    }),
  ),
);

/** Mein Eintrag (oder undefined, wenn nicht eingetragen). */
export const useMe = () => useNetwork((s) => s.craftsmen.find((c) => c.id === s.meId));
