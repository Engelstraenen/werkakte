import Ionicons from '@expo/vector-icons/Ionicons';
import { Stack, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Avatar } from '@/components/Avatar';
import { Card } from '@/components/Card';
import { ListRow } from '@/components/ListRow';
import { Screen } from '@/components/Screen';
import { SearchField } from '@/components/SearchField';
import { Section } from '@/components/Section';
import { offersFor } from '@/features/costing/costing';
import { catalog, suppliers } from '@/features/demo/data';
import { isOwner, supplierById } from '@/features/demo/selectors';
import { useDemo } from '@/features/demo/store';
import { OnlineSearch } from '@/features/purchasing/OnlineSearch';
import { de } from '@/i18n/de';
import { bestOffer, savingsPercent } from '@/lib/calc';
import { formatEuro } from '@/lib/money';
import { radius, spacing, touch, useColors } from '@/theme';

const t = de.einkauf;

export default function EinkaufScreen() {
  const colors = useColors();
  const prices = useDemo((s) => s.supplierPrices);
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const items = catalog.filter((c) => c.type === 'material' && c.name.toLowerCase().includes(q));

  return (
    <Screen>
      <Stack.Screen options={{ title: t.titel }} />
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <View style={{ flex: 1 }}>
          <SearchField value={query} onChange={setQuery} placeholder={t.suche} />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t.fotoSuche}
          onPress={() => router.push('/einkauf-foto')}
          style={{
            width: touch.main,
            height: touch.main,
            borderRadius: radius.md,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.primary,
          }}
        >
          <Ionicons name="camera" size={26} color={colors.onPrimary} />
        </Pressable>
      </View>

      {q && items.length === 0 ? (
        <Card>
          <AppText>{t.keinTreffer(query.trim())}</AppText>
          <OnlineSearch query={query.trim()} />
        </Card>
      ) : null}

      {items.length ? (
        <Section title={t.material}>
          <Card style={{ paddingVertical: 4 }}>
            {items.map((c, i) => {
              const offers = offersFor(c.id, prices);
              const best = bestOffer(offers);
              const subtitle = !best
                ? t.keinPreis
                : `${supplierById(best.supplierId).name}${offers.length > 1 ? ` · ${t.sparen(savingsPercent(offers, best.priceCents))}` : ''}`;
              return (
                <ListRow
                  key={c.id}
                  divider={i > 0}
                  title={c.name}
                  subtitle={isOwner() ? subtitle : undefined}
                  right={
                    isOwner() && best ? (
                      <AppText variant="label" color={colors.success}>
                        {formatEuro(best.priceCents)}
                      </AppText>
                    ) : null
                  }
                  onPress={() => router.push({ pathname: '/artikel/[id]', params: { id: c.id } })}
                />
              );
            })}
          </Card>
        </Section>
      ) : null}

      <Section title={t.lieferanten}>
        <Card style={{ paddingVertical: 4 }}>
          {suppliers.map((s, i) => (
            <ListRow
              key={s.id}
              divider={i > 0}
              left={<Avatar name={s.name} size={40} />}
              title={s.name}
              subtitle={t[s.kind]}
            />
          ))}
        </Card>
      </Section>
    </Screen>
  );
}
