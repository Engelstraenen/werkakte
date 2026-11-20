import { useQuery } from '@tanstack/react-query';

import { useSession } from '@/features/auth/session';

import { useNetwork } from './store';

/**
 * Live-Netzwerk: hält Verzeichnis und Jobs aktuell (beim Start, bei Anmeldung/Abmeldung,
 * beim Zurückkommen in die App und jede Minute). Lokal ohne Supabase tut es nichts.
 */
export function NetworkSync() {
  const { session } = useSession();
  const live = useNetwork((s) => s.live);
  const userId = session?.user.id ?? null;
  useQuery({
    queryKey: ['netzwerk', userId],
    queryFn: async () => {
      await useNetwork.getState().refresh(userId);
      return Date.now();
    },
    enabled: live,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });
  return null;
}
