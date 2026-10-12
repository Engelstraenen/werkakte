import { supabase } from '@/lib/supabase';

/**
 * Tauscht den PKCE-Code aus Magic Link oder OAuth gegen eine Session.
 * Auf Android landet derselbe Redirect evtl. zweimal (Browser-Ergebnis + Deep Link);
 * der zweite Tausch schlägt fehl, ist aber kein Fehler, wenn schon eine Session existiert.
 */
export async function completeSignIn(code: string): Promise<boolean> {
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (!error) return true;
  const { data } = await supabase.auth.getSession();
  return data.session !== null;
}
