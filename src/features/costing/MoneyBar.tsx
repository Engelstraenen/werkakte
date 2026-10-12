import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { de } from '@/i18n/de';
import type { CostBreakdown } from '@/lib/calc';
import { formatEuro } from '@/lib/money';
import { fonts, radius, spacing, useColors } from '@/theme';

const t = de.kalk;

/** Ein Balken = die Einnahmen. Farbig aufgeteilt in Material, Arbeit, Fixkosten und was übrig bleibt. */
export function MoneyBar({ b }: { b: CostBreakdown }) {
  const colors = useColors();
  const total = Math.max(b.revenueCents, b.costCents, 1);
  const parts = [
    { label: t.material, cents: b.materialCents, color: colors.info },
    { label: t.arbeit, cents: b.laborCents, color: colors.warning },
    { label: t.fixkosten, cents: b.overheadCents, color: colors.neutral },
    {
      label: b.profitCents >= 0 ? t.gewinn : t.verlust,
      cents: Math.abs(b.profitCents),
      color: b.profitCents >= 0 ? colors.success : colors.danger,
    },
  ];
  return (
    <View style={{ gap: spacing.sm }}>
      <View
        style={{
          flexDirection: 'row',
          height: 28,
          borderRadius: radius.sm,
          overflow: 'hidden',
          backgroundColor: colors.surface,
        }}
      >
        {parts.map((p) =>
          p.cents > 0 ? (
            <View key={p.label} style={{ flex: p.cents / total, backgroundColor: p.color }} />
          ) : null,
        )}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: spacing.md, rowGap: 4 }}>
        {parts.map((p) => (
          <View key={p.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: p.color }} />
            <AppText variant="small">
              {p.label}{' '}
              <AppText variant="small" style={{ fontFamily: fonts.bodyBold }}>
                {formatEuro(p.cents)}
              </AppText>
            </AppText>
          </View>
        ))}
      </View>
    </View>
  );
}
