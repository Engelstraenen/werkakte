import { AppText } from '@/components/AppText';
import { Screen } from '@/components/Screen';
import { de } from '@/i18n/de';

export default function ProjekteScreen() {
  return (
    <Screen>
      <AppText muted>{de.platzhalter}</AppText>
    </Screen>
  );
}
