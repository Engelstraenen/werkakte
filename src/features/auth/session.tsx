import type { Session } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { supabase } from '@/lib/supabase';

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
  const [devMode, setDevMode] = useState(false);

  useEffect(() => {
    // onAuthStateChange meldet beim Abonnieren sofort INITIAL_SESSION mit der gespeicherten Session.
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({ session, loading: false });
    });
    return () => data.subscription.unsubscribe();
  }, []);

  return (
    <SessionContext.Provider value={{ ...state, devMode: __DEV__ && devMode, setDevMode }}>
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => useContext(SessionContext);
