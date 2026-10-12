import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { completeSignIn } from '@/features/auth/completeSignIn';
import { de } from '@/i18n/de';

// Ziel von Magic Link und OAuth-Redirect (Android): tauscht den PKCE-Code gegen eine Session.
export default function LoginCallbackScreen() {
  const { code } = useLocalSearchParams<{ code?: string }>();
  const [failed, setFailed] = useState(!code);

  useEffect(() => {
    if (!code) return;
    completeSignIn(code).then((ok) => {
      if (ok) router.replace('/');
      else setFailed(true);
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
