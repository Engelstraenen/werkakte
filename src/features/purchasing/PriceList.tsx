import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Badge } from '@/components/Badge';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { ListRow } from '@/components/ListRow';
import { Avatar } from '@/components/Avatar';
import { supplierById } from '@/features/demo/selectors';
import type { SupplierPrice } from '@/features/demo/types';
import { de } from '@/i18n/de';
import { bestOffer, isOutdated } from '@/lib/calc';
import { formatRelative } from '@/lib/date';
import { formatEuro } from '@/lib/money';

const t = de.einkauf;

/** Alle Lieferantenpreise eines Artikels, günstigster aktueller oben mit "Empfehlung". */
export function PriceList({ offers, unit }: { offers: SupplierPrice[]; unit: string }) {
  if (offers.length === 0) return <EmptyState icon="pricetag-outline" text={t.keinPreis} />;
  const best = bestOffer(offers);
  const sorted = [...offers].sort((a, b) => a.priceCents - b.priceCents);
  return (
    <Card style={{ paddingVertical: 4 }}>
      {sorted.map((o, i) => {
        const supplier = supplierById(o.supplierId);
        const outdated = isOutdated(o.updatedAt);
        return (
          <ListRow
            key={o.id}
            divider={i > 0}
            left={<Avatar name={supplier.name} size={40} />}
            title={supplier.name}
            subtitle={outdated ? t.veraltet : t.stand(formatRelative(o.updatedAt))}
            right={
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <AppText variant="label">
                  {formatEuro(o.priceCents)} / {unit}
                </AppText>
                {o.id === best?.id ? (
                  <Badge label={t.empfehlung} tone="success" align="flex-end" />
                ) : outdated ? (
                  <Badge label="!" tone="warning" align="flex-end" />
                ) : null}
              </View>
            }
          />
        );
      })}
    </Card>
  );
}
