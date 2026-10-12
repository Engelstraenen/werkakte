import * as AppleAuthentication from 'expo-apple-authentication';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';

import { completeSignIn } from './completeSignIn';
import { de } from '@/i18n/de';
import { supabase } from '@/lib/supabase';

export type OAuthProvider = 'apple' | 'google' | 'azure' | 'facebook';

const isCanceled = (e: unknown) =>
  typeof e === 'object' && e !== null && 'code' in e && e.code === 'ERR_REQUEST_CANCELED';

export function useSocialLogin() {
  const [busy, setBusy] = useState<OAuthProvider>();
  const [error, setError] = useState<string>();

  async function run(provider: OAuthProvider, task: () => Promise<boolean>) {
    setBusy(provider);
    setError(undefined);
    const ok = await task().catch((e: unknown) => isCanceled(e));
    setBusy(undefined);
    if (!ok) setError(de.fehler.allgemein);
  }

  /** Google, Microsoft, Facebook und Apple auf Android: Anmeldung im Browser-Fenster. */
  const signInWithBrowser = (provider: OAuthProvider) =>
    run(provider, async () => {
      const redirectTo = Linking.createURL('login-callback');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        // Microsoft liefert die E-Mail nur mit diesem Scope.
        options: {
          redirectTo,
          skipBrowserRedirect: true,
          scopes: provider === 'azure' ? 'email' : undefined,
        },
      });
      if (error) return false;
      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
      if (result.type !== 'success') return true; // abgebrochen → kein Fehler anzeigen
      const code = new URL(result.url).searchParams.get('code');
      return code ? completeSignIn(code) : false;
    });

  /** Apple auf dem iPhone: nativer Dialog. Abbrechen ist kein Fehler. */
  const signInWithApple = () =>
    run('apple', async () => {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (!credential.identityToken) return false;
      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
      });
      return !error;
    });

  return { busy, error, signInWithBrowser, signInWithApple };
}
