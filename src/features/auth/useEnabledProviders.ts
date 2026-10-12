import { useQuery } from '@tanstack/react-query';

import { supabaseAnonKey, supabaseUrl } from '@/lib/supabase';

/** Welche Login-Anbieter in Supabase eingeschaltet sind – nur deren Buttons zeigen. */
export function useEnabledProviders() {
  return useQuery({
    queryKey: ['auth-providers'],
    queryFn: async () => {
      const res = await fetch(`${supabaseUrl}/auth/v1/settings`, {
        headers: { apikey: supabaseAnonKey },
      });
      if (!res.ok) throw new Error(`auth/settings ${res.status}`);
      const json = (await res.json()) as { external?: Record<string, boolean> };
      return json.external ?? {};
    },
    staleTime: Infinity,
  });
}
