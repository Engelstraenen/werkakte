// Daten bleiben auf dem Gerät gespeichert (iPhone/Android: AsyncStorage, Browser: localStorage).
// Zwischenschritt bis SQLite + Sync (Phase 1): gleiche Stores, nur dauerhaft.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage, type PersistOptions } from 'zustand/middleware';

/** Bei Änderungen am Datenformat erhöhen: alte Daten werden dann verworfen (Beispieldaten neu). */
export const DATA_VERSION = 1;

export function persistOptions<T, P = Partial<T>>(
  name: string,
  extra?: Partial<PersistOptions<T, P>>,
): PersistOptions<T, P> {
  return {
    name: `werkakte-${name}`,
    storage: createJSONStorage(() => AsyncStorage),
    version: DATA_VERSION,
    // Anderes Format → nichts übernehmen, Beispieldaten bleiben.
    migrate: () => ({}) as P,
    ...extra,
  };
}

const KEYS = ['demo', 'stamm', 'team'].map((k) => `werkakte-${k}`);

/** Alle gespeicherten Arbeitsdaten löschen (Beispieldaten zurücksetzen). */
export const clearAppData = () => AsyncStorage.multiRemove(KEYS);
