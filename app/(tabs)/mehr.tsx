import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { useSession } from '@/features/auth/session';
import { de } from '@/i18n/de';
import { supabase } from '@/lib/supabase';

export default function MehrScreen() {
  const { session, devMode, setDevMode } = useSession();
  return (
    <Screen>
      <AppText muted>{de.mehr.angemeldetAls}</AppText>
      <AppText style={{ fontWeight: '700' }}>{session?.user.email ?? de.mehr.testmodus}</AppText>
      <Button
        title={de.mehr.abmelden}
        variant="secondary"
        onPress={() => (devMode ? setDevMode(false) : supabase.auth.signOut({ scope: 'local' }))}
      />
    </Screen>
  );
}
