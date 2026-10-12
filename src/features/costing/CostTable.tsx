import { View } from 'react-native';

import type { Costing } from './costing';
import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { company } from '@/features/demo/data';
import { de } from '@/i18n/de';
import { formatHours } from '@/lib/date';
import { formatEuro } from '@/lib/money';
import { spacing } from '@/theme';

const t = de.kalk;

function Row({
  label,
  soll,
  ist,
  strong,
}: {
  label: string;
  soll?: string;
  ist?: string;
  strong?: boolean;
}) {
  const v = strong ? 'label' : 'body';
  return (
    <View style={{ flexDirection: 'row', gap: spacing.sm, paddingVertical: 4 }}>
      <AppText variant={v} muted={!strong} style={{ flex: 1.3 }}>
        {label}
      </AppText>
      <AppText variant={v} style={{ flex: 1, textAlign: 'right' }}>
        {soll ?? '–'}
      </AppText>
      <AppText variant={v} style={{ flex: 1, textAlign: 'right' }}>
        {ist ?? '–'}
      </AppText>
    </View>
  );
}

/** Ausführliche Gegenüberstellung – nur auf Wunsch ("Details anzeigen"). */
export function CostTable({ soll, ist }: { soll?: Costing; ist?: Costing }) {
  const e = (c: Costing | undefined, key: keyof Costing['breakdown']) =>
    c ? formatEuro(c.breakdown[key]) : undefined;
  const h = (c?: Costing) => (c ? formatHours(c.minutes) : undefined);
  return (
    <Card>
      <Row label={t.posten} soll={t.soll} ist={t.ist} strong />
      <Row label={t.einnahmen} soll={e(soll, 'revenueCents')} ist={e(ist, 'revenueCents')} />
      <Row label={t.material} soll={e(soll, 'materialCents')} ist={e(ist, 'materialCents')} />
      <Row label={t.arbeit} soll={e(soll, 'laborCents')} ist={e(ist, 'laborCents')} />
      <Row
        label={`${t.fixkosten} (${company.overheadPercent} %)`}
        soll={e(soll, 'overheadCents')}
        ist={e(ist, 'overheadCents')}
      />
      <Row label={t.kosten} soll={e(soll, 'costCents')} ist={e(ist, 'costCents')} strong />
      <Row label={t.gewinn} soll={e(soll, 'profitCents')} ist={e(ist, 'profitCents')} strong />
      <Row label={t.stunden} soll={h(soll)} ist={h(ist)} />
    </Card>
  );
}
