import Ionicons from '@expo/vector-icons/Ionicons';
import { View } from 'react-native';

import { invoiceChecks, laborGrossCents } from './checklist';
import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { WeekStrip } from '@/features/calendar/WeekStrip';
import { company } from '@/features/demo/data';
import { useDemo } from '@/features/demo/store';
import type { Customer, Invoice } from '@/features/demo/types';
import { de } from '@/i18n/de';
import { formatEuro } from '@/lib/money';
import { spacing, useColors } from '@/theme';

const t = de.rechnung;

/** Checkliste der Pflichtangaben + Leistungsdatum wählen – nur im Entwurf. */
export function InvoiceHelp({ invoice, customer }: { invoice: Invoice; customer: Customer }) {
  const colors = useColors();
  const setServiceDate = useDemo((s) => s.setInvoiceServiceDate);
  const checks = invoiceChecks(invoice, customer, company);
  const day = new Date(invoice.serviceDate ?? invoice.date);
  return (
    <Card style={{ gap: spacing.sm }}>
      <AppText variant="title">{t.checkTitel}</AppText>
      {checks.map((c) => {
        const icon = c.ok ? 'checkmark-circle' : c.required ? 'alert-circle' : 'bulb';
        const color = c.ok ? colors.success : c.required ? colors.primary : colors.textMuted;
        return (
          <View key={c.key} style={{ gap: spacing.xs }}>
            <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' }}>
              <Ionicons name={icon} size={22} color={color} />
              <AppText style={{ flex: 1 }} muted={c.ok && !c.required}>
                {c.key === 'lohn' && !c.ok ? t.lohnFehlt : t.check[c.key]}
              </AppText>
            </View>
            {c.key === 'leistungsdatum' ? (
              <WeekStrip
                selected={day}
                onSelect={(d) => setServiceDate(invoice.id, d.toISOString())}
              />
            ) : null}
          </View>
        );
      })}
    </Card>
  );
}

/** Pflicht-Hinweise, die auf Privatrechnungen gedruckt werden (auch nach dem Versand sichtbar). */
export function InvoiceNotes({ invoice, customer }: { invoice: Invoice; customer: Customer }) {
  if (customer.type !== 'privat') return null;
  const labor = laborGrossCents(invoice.items);
  return (
    <Card style={{ gap: spacing.xs }}>
      <AppText variant="small" muted>
        {t.hinweise}
      </AppText>
      {labor > 0 ? <AppText>{t.lohnText(formatEuro(labor))}</AppText> : null}
      <AppText>{t.aufbewahrungText}</AppText>
    </Card>
  );
}
