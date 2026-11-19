import { router } from 'expo-router';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { IconCircle } from '@/components/IconCircle';
import { de } from '@/i18n/de';
import { spacing } from '@/theme';

import { referralsForMe } from './logic';
import { useMe, useNetwork } from './store';
import { tradeLabel } from './trades';

/** Hinweis auf „Heute“, wenn im Netzwerk Jobs für mich offen sind. Sonst nichts. */
export function NetworkTodayCard() {
  const me = useMe();
  const referrals = useNetwork((s) => s.referrals);
  if (!me) return null;
  const open = referralsForMe(me, referrals).filter((r) => !r.interested.includes(me.id));
  const first = open[0];
  if (!first) return null;
  return (
    <Card
      onPress={() => router.push('/netzwerk')}
      accessibilityLabel={`${de.netzwerk.heuteKarte}: ${open.length}`}
      style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}
    >
      <IconCircle name="swap-horizontal" tone="primary" size={44} />
      <View style={{ flex: 1, gap: 2 }}>
        <AppText variant="label">{`${de.netzwerk.heuteKarte} (${open.length})`}</AppText>
        <AppText variant="small" muted numberOfLines={1}>
          {`${tradeLabel(first.trade)}: ${first.title}`}
        </AppText>
      </View>
    </Card>
  );
}
