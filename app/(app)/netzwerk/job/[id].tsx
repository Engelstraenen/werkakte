import { Stack, router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Badge } from '@/components/Badge';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { IconCircle } from '@/components/IconCircle';
import { ListRow } from '@/components/ListRow';
import { Screen } from '@/components/Screen';
import { useDemo } from '@/features/demo/store';
import { OwnerPanel, ReceiverPanel } from '@/features/network/JobPanels';
import { useNetwork } from '@/features/network/store';
import { tradeIcon, tradeLabel } from '@/features/network/trades';
import type { ReferralStatus } from '@/features/network/types';
import { de } from '@/i18n/de';
import { formatRelative } from '@/lib/date';
import { openRoute } from '@/lib/links';
import { spacing, type Tone } from '@/theme';

const t = de.netzwerk;
const status: Record<ReferralStatus, { label: string; tone: Tone }> = {
  offen: { label: t.statusOffen, tone: 'primary' },
  vergeben: { label: t.statusVergeben, tone: 'success' },
  zurueckgezogen: { label: t.statusZurueck, tone: 'neutral' },
};

/** Ein weitergegebener Job: was, wo, wann, von wem – und was ich damit tun kann. */
export default function JobScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const r = useNetwork((s) => s.referrals.find((x) => x.id === id));
  const meId = useNetwork((s) => s.meId);
  const from = useNetwork((s) => s.craftsmen.find((c) => c.id === r?.fromId));
  const to = useNetwork((s) => s.craftsmen.find((c) => c.id === r?.toId));
  const project = useDemo((s) => s.projects.find((p) => p.id === r?.projectId));
  if (!r || !from) return <EmptyState icon="alert-circle" text={t.fuerDichLeer} />;
  const mine = r.fromId === meId;

  return (
    <Screen>
      <Stack.Screen options={{ title: t.jobTitelKurz }} />
      <Card style={{ gap: spacing.md }}>
        <View style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'center' }}>
          <IconCircle name={tradeIcon(r.trade)} tone="primary" size={52} />
          <View style={{ flex: 1, gap: 2 }}>
            <AppText variant="mono">{`${t.gesucht}: ${tradeLabel(r.trade)}`}</AppText>
            <AppText variant="heading">{r.title}</AppText>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }}>
          <Badge label={status[r.status].label} tone={status[r.status].tone} />
          {to ? <Badge label={`${t.direktAn} ${to.id === meId ? 'dich' : to.company}`} /> : null}
          <Badge label={formatRelative(r.createdAt)} />
        </View>
        {r.details ? <AppText>{r.details}</AppText> : null}
      </Card>

      <Card style={{ paddingVertical: 4 }}>
        <ListRow
          title={`${r.zip} ${r.city}`}
          subtitle={t.wo}
          left={<IconCircle name="location" tone="info" size={40} />}
          onPress={() => openRoute(`${r.zip} ${r.city}`).catch(() => undefined)}
        />
        {r.when ? (
          <ListRow
            divider
            title={r.when}
            subtitle={t.wannKurz}
            left={<IconCircle name="time" tone="warning" size={40} />}
          />
        ) : null}
        <ListRow
          divider
          title={mine ? t.vonDir : from.company}
          subtitle={mine ? undefined : `${t.von} · ${from.name}`}
          left={<IconCircle name="business" tone="neutral" size={40} />}
          onPress={mine ? undefined : () => router.push(`/netzwerk/handwerker/${from.id}`)}
        />
        {mine && project ? (
          <ListRow
            divider
            title={project.title}
            subtitle={t.ausProjekt}
            left={<IconCircle name="folder-open" tone="success" size={40} />}
            onPress={() => router.push(`/projekt/${project.id}`)}
          />
        ) : null}
      </Card>

      {mine ? <OwnerPanel referral={r} /> : <ReceiverPanel referral={r} from={from} />}
    </Screen>
  );
}
