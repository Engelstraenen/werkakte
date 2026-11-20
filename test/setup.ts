// Gerätespeicher in Tests: Speicher-Attrappe statt echtem AsyncStorage.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Kein echtes Supabase in Tests: Netzwerk läuft im lokalen Modus. Einzelne Tests überschreiben das.
jest.mock('@/lib/supabase', () => ({
  supabase: {},
  isSupabaseConfigured: false,
  supabaseUrl: 'https://test.invalid',
  supabaseAnonKey: 'test',
}));
