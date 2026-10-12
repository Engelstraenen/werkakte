import { plannedCosting } from './costing';
import { MoneyBar } from './MoneyBar';
import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { useDemo } from '@/features/demo/store';
import type { DocItem } from '@/features/demo/types';
import { de } from '@/i18n/de';
import { marginTone } from '@/lib/calc';
import { formatEuro } from '@/lib/money';
import { useColors } from '@/theme';

const t = de.kalk;

/** Im Angebot: Was bleibt dir, wenn alles nach Plan läuft? Nur für den Inhaber. */
export function ProfitCard({ items }: { items: DocItem[] }) {
  const colors = useColors();
  const prices = useDemo((s) => s.supplierPrices);
  const b = plannedCosting(items, prices).breakdown;
  const tone = colors[marginTone(b.marginPercent)];
  return (
    <Card accent={tone}>
      <AppText variant="small" muted>
        🔒 {t.nurInhaber}
      </AppText>
      <AppText variant="label" muted>
        {t.dirBleibenVoraus}
      </AppText>
      <AppText variant="heading" color={tone}>
        {formatEuro(b.profitCents)} · {b.marginPercent.toLocaleString('de-DE')} %
      </AppText>
      <MoneyBar b={b} />
    </Card>
  );
}
