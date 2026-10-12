import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { de } from '@/i18n/de';
import { supabase } from '@/lib/supabase';

// Ziel des Magic Links: tauscht den PKCE-Code gegen eine Session.
export default function LoginCallbackScreen() {
  const { code } = useLocalSearchParams<{ code?: string }>();
  const [failed, setFailed] = useState(!code);

  useEffect(() => {
    if (!code) return;
    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) setFailed(true);
      else router.replace('/');
    });
  }, [code]);

  return (
    <Screen>
      {failed ? (
        <>
          <AppText>{de.login.linkFehler}</AppText>
          <Button title={de.login.titel} onPress={() => router.replace('/login')} />
        </>
      ) : (
        <ActivityIndicator size="large" />
      )}
    </Screen>
  );
}
