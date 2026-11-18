import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

import { isDemoBuild } from './demo';
import { secureStorage } from './secure-storage';

// Live-Demo: kein Backend, Platzhalter werden nie angefragt (Anmeldung ist dort abgeschaltet).
const url =
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? (isDemoBuild ? 'https://demo.invalid' : undefined);
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? (isDemoBuild ? 'demo' : undefined);

if (!url || !anonKey) {
  throw new Error(
    'EXPO_PUBLIC_SUPABASE_URL oder EXPO_PUBLIC_SUPABASE_ANON_KEY fehlt. Lege eine .env nach .env.example an.',
  );
}

export const supabaseUrl = url;
export const supabaseAnonKey = anonKey;

export const supabase = createClient(url, anonKey, {
  auth: {
    // Web (nur Vorschau) nutzt localStorage, SecureStore gibt es dort nicht.
    storage: Platform.OS === 'web' ? undefined : secureStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
  },
});

// Token nur im Vordergrund erneuern (Empfehlung von Supabase für React Native).
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}
