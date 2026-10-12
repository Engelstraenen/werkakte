import { Stack } from 'expo-router';

import { AppText } from '@/components/AppText';
import { Screen } from '@/components/Screen';
import { NumberingForm } from '@/features/settings/NumberingForm';
import { de } from '@/i18n/de';

export default function NummernkreiseScreen() {
  return (
    <Screen>
      <Stack.Screen options={{ title: de.nummern.titel }} />
      <AppText muted>{de.nummern.hinweis}</AppText>
      <NumberingForm kind="angebot" />
      <NumberingForm kind="rechnung" />
    </Screen>
  );
}
