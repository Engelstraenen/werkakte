import { Stack } from 'expo-router';
import { Pressable, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { ListRow } from '@/components/ListRow';
import { Screen } from '@/components/Screen';
import { company } from '@/features/demo/data';
import { useStamm } from '@/features/demo/stamm';
import { tradeLabels, type Trade } from '@/features/quotes/trades';
import { de } from '@/i18n/de';
import { radius, useColors } from '@/theme';

export default function FirmaScreen() {
  const colors = useColors();
  const trade = useStamm((s) => s.trade);
  const setTrade = useStamm((s) => s.setTrade);
  const rows: [string, string][] = [
    [company.name, company.owner],
    [company.street, company.zipCity],
    [company.phone, company.email],
    [de.mehr.steuernummer, company.taxNumber],
    [de.mehr.iban, company.iban],
    [de.mehr.kleinunternehmer, company.kleinunternehmer ? de.mehr.ja : de.mehr.nein],
  ];
  return (
    <Screen>
      <Stack.Screen options={{ title: de.mehr.firma }} />
      <Card style={{ gap: 8 }}>
        <AppText variant="label">{de.mehr.gewerk}</AppText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {(Object.keys(tradeLabels) as Trade[]).map((v) => {
            const on = v === trade;
            return (
              <Pressable
                key={v}
                accessibilityRole="radio"
                accessibilityState={{ selected: on }}
                onPress={() => setTrade(v)}
                style={{
                  minHeight: 44,
                  paddingHorizontal: 14,
                  justifyContent: 'center',
                  borderRadius: radius.md,
                  borderWidth: 2,
                  borderColor: on ? colors.primary : colors.border,
                  backgroundColor: on ? colors.primary : 'transparent',
                }}
              >
                <AppText variant="label" color={on ? colors.onPrimary : colors.text}>
                  {tradeLabels[v]}
                </AppText>
              </Pressable>
            );
          })}
        </View>
        <AppText variant="small" muted>
          {de.mehr.gewerkHinweis}
        </AppText>
      </Card>
      <Card style={{ paddingVertical: 4 }}>
        {rows.map(([title, subtitle], i) => (
          <ListRow key={title} divider={i > 0} title={title} subtitle={subtitle} />
        ))}
      </Card>
    </Screen>
  );
}
