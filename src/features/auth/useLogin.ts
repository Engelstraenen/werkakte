import * as Linking from 'expo-linking';
import { useState } from 'react';

import { emailSchema, otpSchema } from './validation';
import { de } from '@/i18n/de';
import { supabase } from '@/lib/supabase';

export function useLogin() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  async function run(task: () => Promise<{ error: unknown }>) {
    setLoading(true);
    setError(undefined);
    const result = await task().catch((e: unknown) => ({ error: e }));
    setLoading(false);
    if (result.error) setError(de.fehler.allgemein);
    return !result.error;
  }

  async function sendLink() {
    const trimmed = email.trim().toLowerCase();
    if (!emailSchema.safeParse(trimmed).success) return setError(de.login.emailUngueltig);
    const ok = await run(() =>
      supabase.auth.signInWithOtp({
        email: trimmed,
        // Expo Go: exp://…/--/login-callback, eigener Build: handwerkerapp://login-callback
        options: { emailRedirectTo: Linking.createURL('login-callback') },
      }),
    );
    if (ok) setSent(true);
  }

  async function verifyCode() {
    const trimmed = code.trim();
    if (!otpSchema.safeParse(trimmed).success) return setError(de.login.codeUngueltig);
    // Bei Erfolg wechselt die Session → das Auth-Gate im Root-Layout leitet weiter.
    await run(() =>
      supabase.auth.verifyOtp({ email: email.trim().toLowerCase(), token: trimmed, type: 'email' }),
    );
  }

  function reset() {
    setSent(false);
    setCode('');
    setError(undefined);
  }

  return { email, setEmail, code, setCode, sent, error, loading, sendLink, verifyCode, reset };
}
