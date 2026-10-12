import Ionicons from '@expo/vector-icons/Ionicons';
import { Stack, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { company, invoices } from '@/features/demo/data';
import { customerOf } from '@/features/demo/selectors';
import { useDemo } from '@/features/demo/store';
import { DocItems } from '@/features/quotes/DocItems';
import { de } from '@/i18n/de';
import { formatDate } from '@/lib/date';
import { notice } from '@/lib/notice';
import { spacing, useColors } from '@/theme';

const soon = (phase: number) => () => notice(de.prototyp.titel, de.prototyp.bald(phase));

export default function BelegScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const quote = useDemo((s) => s.quotes.find((q) => q.id === id));
  const doc = quote ?? invoices.find((i) => i.id === id);
  const project = useDemo((s) => s.projects.find((p) => p.id === doc?.projectId));
  if (!doc || !project) return <EmptyState icon="alert-circle" text={de.akte.keineBelege} />;

  const customer = customerOf(project);
  const isQuote = 'validUntil' in doc;
  const kind = isQuote
    ? de.beleg.angebot
    : doc.type === 'abschlag'
      ? de.beleg.abschlag
      : de.beleg.rechnung;
  const locked = !isQuote && doc.status !== 'entwurf';

  return (
    <Screen>
      <Stack.Screen options={{ title: `${kind} ${doc.number}` }} />
      <Card>
        <AppText variant="small" muted>
          {company.name}
        </AppText>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <AppText variant="heading" style={{ flex: 1 }}>
            {kind}
          </AppText>
          <Badge
            label={de.belegStatus[doc.status]}
            tone={doc.status === 'entwurf' ? 'neutral' : 'success'}
          />
        </View>
        <AppText variant="label">{doc.number}</AppText>
        <View style={{ gap: 2, marginTop: spacing.xs }}>
          <AppText>{customer.name}</AppText>
          <AppText muted>
            {customer.street}, {customer.zipCity}
          </AppText>
          <AppText muted>{project.title}</AppText>
        </View>
        <View style={{ flexDirection: 'row', gap: spacing.lg, marginTop: spacing.xs }}>
          <View>
            <AppText variant="small" muted>
              {de.beleg.datum}
            </AppText>
            <AppText variant="label">{formatDate(doc.date)}</AppText>
          </View>
          <View>
            <AppText variant="small" muted>
              {isQuote ? de.beleg.gueltigBis : de.beleg.faellig}
            </AppText>
            <AppText variant="label">{formatDate(isQuote ? doc.validUntil : doc.dueDate)}</AppText>
          </View>
        </View>
      </Card>

      <DocItems items={doc.items} kleinunternehmer={company.kleinunternehmer} />

      {isQuote && doc.signedAt ? (
        <Card style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="checkmark-circle" size={28} color={colors.success} />
          <AppText variant="label" style={{ flex: 1 }}>
            {de.beleg.unterschrieben(formatDate(doc.signedAt))}
          </AppText>
        </Card>
      ) : null}
      {locked ? (
        <Card style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="lock-closed" size={24} color={colors.textMuted} />
          <AppText variant="small" muted style={{ flex: 1 }}>
            {de.beleg.gesperrt}
          </AppText>
        </Card>
      ) : null}

      <Button title={de.beleg.pdfTeilen} onPress={soon(4)} />
      {isQuote && !doc.signedAt ? (
        <Button title={de.beleg.unterschreiben} variant="secondary" onPress={soon(4)} />
      ) : null}
      {isQuote && doc.status === 'angenommen' ? (
        <Button title={de.beleg.inRechnung} variant="secondary" onPress={soon(5)} />
      ) : null}
    </Screen>
  );
}
