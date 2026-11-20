import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

/** Nur App-interne Pfade wie „/netzwerk/eintragen“ (kein „//fremde-seite.de“). */
export const safeNext = (next?: string) =>
  next && next.startsWith('/') && !next.startsWith('//') ? next : undefined;

/**
 * Ziel des Magic Links. Web: echte Adresse inkl. Unterpfad der Live-Demo (/werkakte),
 * Expo Go: exp://…/--/login-callback, eigener Build: werkakte://login-callback.
 * `next` = wohin es nach der Anmeldung geht.
 */
export function callbackUrl(next?: string): string {
  const target = safeNext(next);
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const base = (Constants.expoConfig?.experiments?.baseUrl ?? '').replace(/\/$/, '');
    const query = target ? `?next=${encodeURIComponent(target)}` : '';
    return `${window.location.origin}${base}/login-callback${query}`;
  }
  return Linking.createURL(
    'login-callback',
    target ? { queryParams: { next: target } } : undefined,
  );
}
