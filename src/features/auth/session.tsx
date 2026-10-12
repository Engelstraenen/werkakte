import type { Session } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { supabase } from '@/lib/supabase';

// Testmodus über Neuladen hinweg merken (nur Entwicklung).
const DEV_KEY = 'devMode';
const devStore =
  Platform.OS === 'web'
    ? {
        get: async () => globalThis.localStorage?.getItem(DEV_KEY) ?? null,
        set: async (on: boolean) =>
          on
            ? globalThis.localStorage?.setItem(DEV_KEY, '1')
            : globalThis.localStorage?.removeItem(DEV_KEY),
      }
    : {
        get: () => SecureStore.getItemAsync(DEV_KEY),
        set: (on: boolean) =>
          on ? SecureStore.setItemAsync(DEV_KEY, '1') : SecureStore.deleteItemAsync(DEV_KEY),
      };

type SessionState = { session: Session | null; loading: boolean };
type SessionContextValue = SessionState & {
  /** Nur Entwicklung: App ohne Anmeldung ansehen. */
  devMode: boolean;
  setDevMode: (on: boolean) => void;
};

const SessionContext = createContext<SessionContextValue>({
  session: null,
  loading: true,
  devMode: false,
  setDevMode: () => {},
});

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>({ session: null, loading: true });
  const [devMode, setDevModeState] = useState(false);
  const [devLoaded, setDevLoaded] = useState(!__DEV__);

  useEffect(() => {
    if (!__DEV__) return;
    devStore
      .get()
      .then((v) => setDevModeState(v === '1'))
      .catch(() => undefined)
      .finally(() => setDevLoaded(true));
  }, []);

  const setDevMode = (on: boolean) => {
    setDevModeState(on);
    devStore.set(on).catch(() => undefined);
  };

  useEffect(() => {
    // onAuthStateChange meldet beim Abonnieren sofort INITIAL_SESSION mit der gespeicherten Session.
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({ session, loading: false });
    });
    return () => data.subscription.unsubscribe();
  }, []);

  return (
    <SessionContext.Provider
      value={{
        ...state,
        loading: state.loading || !devLoaded,
        devMode: __DEV__ && devMode,
        setDevMode,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => useContext(SessionContext);
