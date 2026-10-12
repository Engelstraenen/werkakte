import { View } from 'react-native';

import { plannedCosting } from './costing';
import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { company } from '@/features/demo/data';
import { useDemo } from '@/features/demo/store';
import type { DocItem } from '@/features/demo/types';
import { de } from '@/i18n/de';
import { marginTone } from '@/lib/calc';
import { formatEuro } from '@/lib/money';
import { spacing, useColors } from '@/theme';

const t = de.kalk;

/** Vorkalkulation direkt im Angebot – nur für den Inhaber. */
export function ProfitCard({ items }: { items: DocItem[] }) {
  const colors = useColors();
  const prices = useDemo((s) => s.supplierPrices);
  const b = plannedCosting(items, prices).breakdown;
  const tone = colors[marginTone(b.marginPercent)];
  const line = (label: string, cents: number) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <AppText muted>{label}</AppText>
      <AppText variant="label">{formatEuro(cents)}</AppText>
    </View>
  );
  return (
    <Card accent={tone}>
      <AppText variant="small" muted>
        🔒 {t.nurInhaber}
      </AppText>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm }}>
        <AppText variant="title" style={{ flex: 1 }}>
          {t.gewinnVoraus}
        </AppText>
        <AppText variant="title" color={tone}>
          {formatEuro(b.profitCents)}
        </AppText>
      </View>
      <AppText variant="label" color={tone}>
        {b.marginPercent.toLocaleString('de-DE')} % vom Erlös
      </AppText>
      {line(t.material, b.materialCents)}
      {line(t.lohn, b.laborCents)}
      {line(t.betrieb(company.overheadPercent), b.overheadCents)}
    </Card>
  );
}
