import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import type { DocItem } from '@/features/demo/types';
import { de } from '@/i18n/de';
import { documentTotals, formatEuro, formatQty, lineTotalCents } from '@/lib/money';
import { spacing, useColors } from '@/theme';

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <AppText variant={strong ? 'title' : 'body'} muted={!strong}>
        {label}
      </AppText>
      <AppText variant={strong ? 'title' : 'label'}>{value}</AppText>
    </View>
  );
}

/** Positionen + Summenblock (netto, MwSt je Satz, brutto). */
export function DocItems({
  items,
  kleinunternehmer,
}: {
  items: DocItem[];
  kleinunternehmer: boolean;
}) {
  const colors = useColors();
  const totals = documentTotals(items, kleinunternehmer);
  return (
    <>
      <Card style={{ paddingVertical: spacing.sm }}>
        <AppText variant="small" muted>
          {de.beleg.positionen} ({items.length})
        </AppText>
        {items.map((it, i) => (
          <View
            key={it.id}
            style={{
              flexDirection: 'row',
              gap: spacing.sm,
              paddingVertical: spacing.sm,
              borderTopWidth: 1,
              borderTopColor: colors.surface,
            }}
          >
            <AppText variant="small" muted style={{ width: 22 }}>
              {i + 1}.
            </AppText>
            <View style={{ flex: 1, gap: 2 }}>
              <AppText variant="label">{it.name}</AppText>
              <AppText variant="small" muted>
                {formatQty(it.qtyMilli)} {it.unit} × {formatEuro(it.unitPriceCents)}
                {it.discountPercent ? ` · ${de.beleg.rabatt(it.discountPercent)}` : ''}
              </AppText>
            </View>
            <AppText variant="label">{formatEuro(lineTotalCents(it))}</AppText>
          </View>
        ))}
      </Card>
      <Card>
        <Row label={de.beleg.netto} value={formatEuro(totals.netCents)} />
        {totals.vat.map((v) => (
          <Row key={v.rate} label={de.beleg.mwst(v.rate)} value={formatEuro(v.vatCents)} />
        ))}
        <View style={{ height: 1, backgroundColor: colors.border, marginVertical: spacing.xs }} />
        <Row label={de.beleg.brutto} value={formatEuro(totals.grossCents)} strong />
      </Card>
    </>
  );
}
