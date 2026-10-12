import * as SecureStore from 'expo-secure-store';

// SecureStore warnt ab 2048 Byte pro Wert; eine Supabase-Session ist oft größer → in Stücke teilen.
const CHUNK_SIZE = 1800;
const countKey = (key: string) => `${key}.n`;
const chunkKey = (key: string, i: number) => `${key}.${i}`;

async function removeItem(key: string): Promise<void> {
  const count = Number(await SecureStore.getItemAsync(countKey(key))) || 0;
  await Promise.all(
    Array.from({ length: count }, (_, i) => SecureStore.deleteItemAsync(chunkKey(key, i))),
  );
  await SecureStore.deleteItemAsync(countKey(key));
}

async function getItem(key: string): Promise<string | null> {
  const count = Number(await SecureStore.getItemAsync(countKey(key))) || 0;
  if (count === 0) return null;
  const parts = await Promise.all(
    Array.from({ length: count }, (_, i) => SecureStore.getItemAsync(chunkKey(key, i))),
  );
  return parts.some((p) => p === null) ? null : parts.join('');
}

async function setItem(key: string, value: string): Promise<void> {
  await removeItem(key);
  const count = Math.ceil(value.length / CHUNK_SIZE);
  await Promise.all(
    Array.from({ length: count }, (_, i) =>
      SecureStore.setItemAsync(chunkKey(key, i), value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE)),
    ),
  );
  // Zähler zuletzt schreiben: bricht die App vorher ab, gilt der Wert als nicht vorhanden.
  await SecureStore.setItemAsync(countKey(key), String(count));
}

export const secureStorage = { getItem, setItem, removeItem };
