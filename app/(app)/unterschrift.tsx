import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { company } from '@/features/demo/data';
import { customerOf, docTotal } from '@/features/demo/selectors';
import { useDemo } from '@/features/demo/store';
import { SignaturePad } from '@/features/signature/SignaturePad';
import { de } from '@/i18n/de';
import { formatEuro } from '@/lib/money';
import { notice } from '@/lib/notice';
import { spacing } from '@/theme';

const t = de.unterschrift;

/** Kunde unterschreibt das Angebot direkt auf dem Handy → Auftrag erteilt. */
export default function UnterschriftScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const quote = useDemo((s) => s.quotes.find((q) => q.id === id));
  const project = useDemo((s) => s.projects.find((p) => p.id === quote?.projectId));
  const signQuote = useDemo((s) => s.signQuote);
  const customer = project ? customerOf(project) : undefined;
  const [name, setName] = useState(customer?.contact ?? customer?.name ?? '');
  const [paths, setPaths] = useState<string[]>([]);
  const [pad, setPad] = useState(0);
  if (!quote || !project || !customer)
    return <EmptyState icon="alert-circle" text={de.akte.keineBelege} />;

  function save() {
    if (!paths.length) return notice(t.titel, t.fehlt);
    signQuote(quote!.id, { paths, name: name.trim() || customer!.name });
    notice(t.titel, t.danke);
    router.back();
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: t.titel }} />
      <Card style={{ gap: spacing.xs }}>
        <AppText variant="small" muted>
          {customer.name}
        </AppText>
        <AppText variant="heading">{formatEuro(docTotal(quote))}</AppText>
        <AppText>{t.auftrag(company.name, quote.number, formatEuro(docTotal(quote)))}</AppText>
      </Card>
      <TextField label={t.name} value={name} onChangeText={setName} />
      <View style={{ gap: spacing.xs }}>
        <AppText variant="label">{t.feld}</AppText>
        <SignaturePad key={pad} onChange={setPaths} />
      </View>
      <Button
        title={t.loeschen}
        variant="secondary"
        onPress={() => {
          setPaths([]);
          setPad((n) => n + 1);
        }}
      />
      <Button title={t.fertig} onPress={save} disabled={!paths.length} />
    </Screen>
  );
}
