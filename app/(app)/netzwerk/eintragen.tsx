import { Stack, router, useNavigation } from 'expo-router';
import { ActivityIndicator } from 'react-native';

import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { useSession } from '@/features/auth/session';
import { NetworkLogin } from '@/features/network/NetworkLogin';
import { ProfileForm } from '@/features/network/ProfileForm';
import { useMe, useNetwork } from '@/features/network/store';
import { de } from '@/i18n/de';
import { isDemoBuild } from '@/lib/demo';
import { supabase } from '@/lib/supabase';

const t = de.netzwerk;

/**
 * Eintragen ins Verzeichnis bzw. eigenen Eintrag ändern.
 * Live (Supabase): ohne Anmeldung zuerst E-Mail bestätigen, die E-Mail ist danach fest.
 */
export default function EintragenScreen() {
  const { session } = useSession();
  const navigation = useNavigation();
  const me = useMe();
  const live = useNetwork((s) => s.live);
  const loaded = useNetwork((s) => s.loaded);
  // Zurück – oder zur Übersicht, wenn die Seite direkt per Link geöffnet wurde (kein Zurück da).
  const done = () => (navigation.canGoBack() ? router.back() : router.replace('/netzwerk'));
  const needsLogin = live && !session;

  return (
    <Screen>
      <Stack.Screen options={{ title: me ? t.eintragAendern : t.eintragTitel }} />
      {needsLogin ? (
        <NetworkLogin />
      ) : live && !loaded ? (
        <ActivityIndicator size="large" accessibilityLabel={t.laedt} />
      ) : (
        // key: Formular neu befüllen, sobald der eigene Eintrag aus Supabase da ist.
        <ProfileForm key={me?.id ?? 'neu'} me={me} loginEmail={session?.user.email} onDone={done} />
      )}
      {/* Nur Live-Demo: dort meldet man sich ausschließlich fürs Netzwerk an. */}
      {isDemoBuild && live && session ? (
        <Button
          title={t.abmelden}
          variant="secondary"
          onPress={() => supabase.auth.signOut({ scope: 'local' }).catch(() => undefined)}
        />
      ) : null}
    </Screen>
  );
}
