import Ionicons from '@expo/vector-icons/Ionicons';
import { Stack, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Badge } from '@/components/Badge';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { company } from '@/features/demo/data';
import { customerOf, isOwner } from '@/features/demo/selectors';
import { ProfitCard } from '@/features/costing/ProfitCard';
import { DocActions } from '@/features/invoices/DocActions';
import { useDemo } from '@/features/demo/store';
import { DocItems } from '@/features/quotes/DocItems';
import { QuoteEditor } from '@/features/quotes/QuoteEditor';
import { de } from '@/i18n/de';
import { formatDate } from '@/lib/date';
import { spacing, useColors } from '@/theme';

export default function BelegScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const quote = useDemo((s) => s.quotes.find((q) => q.id === id));
  const invoice = useDemo((s) => s.invoices.find((i) => i.id === id));
  const doc = quote ?? invoice;
  const project = useDemo((s) => s.projects.find((p) => p.id === doc?.projectId));
  if (!doc || !project) return <EmptyState icon="alert-circle" text={de.akte.keineBelege} />;

  const customer = customerOf(project);
  const isQuote = 'validUntil' in doc;
  const kind = isQuote
    ? de.beleg.angebot
    : doc.type === 'abschlag'
      ? de.beleg.abschlag
      : doc.type === 'schluss'
        ? de.beleg.schluss
        : de.beleg.rechnung;
  const number = doc.number || de.ablauf.entwurfNummer;
  const eInvoice = !isQuote && customer.type === 'gewerblich';
  const locked = !isQuote && doc.status !== 'entwurf';

  return (
    <Screen>
      <Stack.Screen options={{ title: `${kind} ${doc.number}`.trim() }} />
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
            tone={
              doc.status === 'entwurf'
                ? 'neutral'
                : doc.status === 'versendet'
                  ? 'warning'
                  : 'success'
            }
          />
        </View>
        <AppText variant="label">{number}</AppText>
        {eInvoice ? <Badge label={de.senden.eRechnung} tone="info" /> : null}
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

      {isQuote && doc.status === 'entwurf' ? (
        <QuoteEditor quote={doc} />
      ) : (
        <DocItems items={doc.items} kleinunternehmer={company.kleinunternehmer} />
      )}
      {isQuote && isOwner() ? <ProfitCard items={doc.items} /> : null}

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

      <DocActions doc={doc} />
    </Screen>
  );
}
