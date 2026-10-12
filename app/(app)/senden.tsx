import Ionicons from '@expo/vector-icons/Ionicons';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { ToggleRow } from '@/components/ToggleRow';
import { customerOf } from '@/features/demo/selectors';
import { useDemo } from '@/features/demo/store';
import { de } from '@/i18n/de';
import { notice } from '@/lib/notice';
import { formatNumber } from '@/lib/numbering';
import { spacing, useColors } from '@/theme';

const t = de.senden;

export default function SendenScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { quotes, invoices, projects, sending, numbering, sendDoc } = useDemo();
  const quote = quotes.find((q) => q.id === id);
  const invoice = invoices.find((i) => i.id === id);
  const doc = quote ?? invoice;
  const project = projects.find((p) => p.id === doc?.projectId);
  const [copy, setCopy] = useState(sending.copyToMe);
  const [datev, setDatev] = useState(sending.toDatev && !!sending.datevEmail);
  if (!doc || !project) return <EmptyState icon="alert-circle" text={de.akte.keineBelege} />;

  const customer = customerOf(project);
  const eInvoice = !!invoice && customer.type === 'gewerblich';
  const recipients = [
    customer.email,
    copy && sending.myEmail,
    invoice && datev && sending.datevEmail,
  ].filter((x): x is string => !!x);

  function send() {
    sendDoc(doc!.id);
    notice(t.gesendet, `${t.gesendetAn(recipients.join(', '))}\n\n${t.prototyp}`);
    router.back();
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: t.titel }} />
      <Card>
        <AppText variant="small" muted>
          {t.an} ({t.kunde})
        </AppText>
        <AppText variant="title">{customer.name}</AppText>
        <AppText muted>{customer.email}</AppText>
        <ToggleRow
          title={t.kopie}
          subtitle={sending.myEmail}
          value={copy}
          onChange={setCopy}
          divider
        />
        {invoice ? (
          <ToggleRow
            title={t.datev}
            subtitle={sending.datevEmail || t.datevFehlt}
            value={datev}
            onChange={setDatev}
            disabled={!sending.datevEmail}
            divider
          />
        ) : null}
      </Card>

      <Card>
        <AppText variant="small" muted>
          {t.anhang}
        </AppText>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <Badge label={t.pdf} tone="info" />
          {eInvoice ? <Badge label={t.eRechnung} tone="success" /> : null}
        </View>
        {eInvoice ? (
          <AppText variant="small" muted>
            {t.eRechnungGrund}
          </AppText>
        ) : null}
      </Card>

      {invoice ? (
        <Card>
          <AppText variant="small" muted>
            {t.nummer}
          </AppText>
          <AppText variant="heading">{invoice.number || formatNumber(numbering.rechnung)}</AppText>
          <AppText variant="small" muted>
            {t.nummerHinweis}
          </AppText>
          <AppText variant="label" style={{ marginTop: spacing.sm }}>
            {t.pruefung}
          </AppText>
          {t.pflicht.map((p) => (
            <View key={p} style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'center' }}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <AppText variant="small">{p}</AppText>
            </View>
          ))}
        </Card>
      ) : null}

      <AppText variant="small" muted>
        {t.offline}
      </AppText>
      <Button
        title={t.jetztSenden}
        icon={<Ionicons name="paper-plane" size={20} color={colors.onPrimary} />}
        onPress={send}
      />
      <Button
        title={t.teilen}
        variant="secondary"
        onPress={() => notice(de.prototyp.titel, de.prototyp.bald(4))}
      />
    </Screen>
  );
}
