import { Stack, router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { Section } from '@/components/Section';
import { offersFor } from '@/features/costing/costing';
import { catalog } from '@/features/demo/data';
import { isOwner, supplierById } from '@/features/demo/selectors';
import { useDemo } from '@/features/demo/store';
import { OnlineSearch } from '@/features/purchasing/OnlineSearch';
import { PriceList } from '@/features/purchasing/PriceList';
import { de } from '@/i18n/de';
import { bestOffer, savingsPercent } from '@/lib/calc';
import { formatEuro } from '@/lib/money';
import { spacing, useColors } from '@/theme';

const t = de.einkauf;

function Figure({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View style={{ flex: 1 }}>
      <AppText variant="small" muted>
        {label}
      </AppText>
      <AppText variant="title" color={color}>
        {value}
      </AppText>
    </View>
  );
}

export default function ArtikelScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = catalog.find((c) => c.id === id);
  const prices = useDemo((s) => s.supplierPrices);
  if (!item) return <EmptyState icon="alert-circle" text={t.keinPreis} />;

  const offers = offersFor(item.id, prices);
  const best = bestOffer(offers);
  const markup = best
    ? Math.round(((item.unitPriceCents - best.priceCents) * 100) / best.priceCents)
    : 0;

  return (
    <Screen>
      <Stack.Screen options={{ title: item.name }} />
      <Card>
        <Badge
          label={item.type === 'material' ? de.mehr.material : de.mehr.arbeit}
          tone={item.type === 'material' ? 'info' : 'primary'}
        />
        <AppText variant="heading">{item.name}</AppText>
        <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.xs }}>
          <Figure label={t.vk} value={`${formatEuro(item.unitPriceCents)} / ${item.unit}`} />
          {isOwner() && item.type === 'material' && best ? (
            <Figure label={t.ek} value={formatEuro(best.priceCents)} color={colors.success} />
          ) : null}
          {isOwner() && item.type === 'arbeit' ? (
            <Figure label={t.internKosten} value={formatEuro(item.internalCostCents ?? 0)} />
          ) : null}
        </View>
        {isOwner() && item.type === 'material' && best ? (
          <AppText muted>
            {t.aufschlag} {markup} % · {supplierById(best.supplierId).name}
            {offers.length > 1 ? ` · ${t.sparen(savingsPercent(offers, best.priceCents))}` : ''}
          </AppText>
        ) : null}
      </Card>

      {item.type === 'material' ? (
        <>
          <Section title={t.lieferanten}>
            {isOwner() ? <PriceList offers={offers} unit={item.unit} /> : null}
            <Button
              title={t.preisEintragen}
              onPress={() =>
                router.push({ pathname: '/preis-neu', params: { catalogItemId: item.id } })
              }
            />
          </Section>
          <Section title={t.onlineSuchen}>
            <OnlineSearch query={item.name} />
          </Section>
        </>
      ) : null}
    </Screen>
  );
}
