import Ionicons from '@expo/vector-icons/Ionicons';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Linking, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Avatar } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { region, websiteHost } from '@/features/network/logic';
import { useMe, useNetwork } from '@/features/network/store';
import { tradeLabel } from '@/features/network/trades';
import { de } from '@/i18n/de';
import { formatDate } from '@/lib/date';
import { call, mail } from '@/lib/links';
import { spacing, useColors } from '@/theme';

const t = de.netzwerk;

/** Eintrag eines Betriebs: Webseite, Kontakt, Job zuschieben. */
export default function HandwerkerScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const c = useNetwork((s) => s.craftsmen.find((x) => x.id === id));
  const me = useMe();
  if (!c) return <EmptyState icon="alert-circle" text={t.keineTreffer} />;
  const isMe = me?.id === c.id;
  const near = me && !isMe && region(me.zip) === region(c.zip);

  return (
    <Screen>
      <Stack.Screen options={{ title: c.company }} />
      <Card style={{ alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.lg }}>
        <Avatar name={c.company} size={72} />
        <AppText variant="heading" style={{ textAlign: 'center' }}>
          {c.company}
        </AppText>
        {c.name ? <AppText muted>{c.name}</AppText> : null}
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: spacing.xs,
            justifyContent: 'center',
          }}
        >
          {c.trades.map((tr) => (
            <Badge key={tr} label={tradeLabel(tr)} tone="primary" />
          ))}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
          <Ionicons name="location-outline" size={16} color={colors.textMuted} />
          <AppText variant="small" muted>
            {`${c.zip} ${c.city}${near ? ` · ${t.ausDerGegend}` : ''}`}
          </AppText>
        </View>
      </Card>

      {c.about ? (
        <Card>
          <AppText>{c.about}</AppText>
        </Card>
      ) : null}

      {c.website ? (
        <Button
          title={`${t.webseiteOeffnen}: ${websiteHost(c.website)}`}
          icon={<Ionicons name="globe-outline" size={22} color={colors.onPrimary} />}
          onPress={() => Linking.openURL(c.website!).catch(() => undefined)}
        />
      ) : (
        <AppText variant="small" muted>
          {t.ohneWebseite}
        </AppText>
      )}

      {isMe ? (
        <Button
          title={t.bearbeiten}
          variant="secondary"
          onPress={() => router.push('/netzwerk/eintragen')}
        />
      ) : (
        <>
          {me ? (
            <Button
              title={t.jobZuschieben}
              variant={c.website ? 'secondary' : 'primary'}
              icon={
                <Ionicons
                  name="swap-horizontal"
                  size={22}
                  color={c.website ? colors.primary : colors.onPrimary}
                />
              }
              onPress={() => router.push({ pathname: '/netzwerk/job-neu', params: { toId: c.id } })}
            />
          ) : null}
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            {c.phone ? (
              <View style={{ flex: 1 }}>
                <Button title={t.anrufen} variant="secondary" onPress={() => call(c.phone)} />
              </View>
            ) : null}
            {c.email ? (
              <View style={{ flex: 1 }}>
                <Button title={t.mailen} variant="secondary" onPress={() => mail(c.email)} />
              </View>
            ) : null}
          </View>
        </>
      )}

      <AppText variant="mono" style={{ textAlign: 'center' }}>
        {`${t.dabeiSeit} ${formatDate(c.createdAt)}`}
      </AppText>
    </Screen>
  );
}
