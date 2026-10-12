import { secureStorage } from './secure-storage';

const mockStore = new Map<string, string>();

jest.mock('expo-secure-store', () => ({
  getItemAsync: async (k: string) => mockStore.get(k) ?? null,
  setItemAsync: async (k: string, v: string) => void mockStore.set(k, v),
  deleteItemAsync: async (k: string) => void mockStore.delete(k),
}));

beforeEach(() => mockStore.clear());

test('speichert große Werte in Stücken und liest sie wieder', async () => {
  const value = 'x'.repeat(4000) + 'ende';
  await secureStorage.setItem('session', value);
  expect(mockStore.get('session.n')).toBe('3');
  expect(await secureStorage.getItem('session')).toBe(value);
});

test('überschreiben entfernt alte Stücke', async () => {
  await secureStorage.setItem('session', 'x'.repeat(4000));
  await secureStorage.setItem('session', 'kurz');
  expect(await secureStorage.getItem('session')).toBe('kurz');
  expect(mockStore.has('session.1')).toBe(false);
});

test('fehlender Wert und Löschen', async () => {
  expect(await secureStorage.getItem('fehlt')).toBeNull();
  await secureStorage.setItem('session', 'abc');
  await secureStorage.removeItem('session');
  expect(await secureStorage.getItem('session')).toBeNull();
  expect(mockStore.size).toBe(0);
});
