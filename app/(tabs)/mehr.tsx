import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { useSession } from '@/features/auth/session';
import { de } from '@/i18n/de';
import { supabase } from '@/lib/supabase';

export default function MehrScreen() {
  const { session } = useSession();
  return (
    <Screen>
      <AppText muted>{de.mehr.angemeldetAls}</AppText>
      <AppText style={{ fontWeight: '700' }}>{session?.user.email}</AppText>
      <Button
        title={de.mehr.abmelden}
        variant="secondary"
        onPress={() => supabase.auth.signOut({ scope: 'local' })}
      />
    </Screen>
  );
}
