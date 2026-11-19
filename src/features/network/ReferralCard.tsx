import { router } from 'expo-router';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Badge } from '@/components/Badge';
import { Card } from '@/components/Card';
import { IconCircle } from '@/components/IconCircle';
import { de } from '@/i18n/de';
import { spacing, type Tone } from '@/theme';

import { useNetwork } from './store';
import { tradeIcon, tradeLabel } from './trades';
import type { Referral } from './types';

const t = de.netzwerk;

function badgeFor(r: Referral, meId: string | null): { label: string; tone: Tone } | null {
  if (r.status === 'zurueckgezogen') return { label: t.statusZurueck, tone: 'neutral' };
  if (r.status === 'vergeben')
    return r.takenById === meId
      ? { label: t.dirVergeben, tone: 'success' }
      : { label: t.statusVergeben, tone: 'neutral' };
  if (meId && r.interested.includes(meId)) return { label: t.duWillst, tone: 'success' };
  if (meId && r.toId === meId) return { label: t.direkt, tone: 'primary' };
  if (r.fromId === meId && r.interested.length > 0)
    return { label: `${r.interested.length} × ${t.machIch}`, tone: 'primary' };
  return null;
}

/** Karte für einen weitergegebenen Job: Gewerk, was, wo, wann, von wem. */
export function ReferralCard({ referral: r }: { referral: Referral }) {
  const meId = useNetwork((s) => s.meId);
  const from = useNetwork((s) => s.craftsmen.find((c) => c.id === r.fromId));
  const to = useNetwork((s) => s.craftsmen.find((c) => c.id === r.toId));
  const badge = badgeFor(r, meId);
  return (
    <Card
      onPress={() => router.push(`/netzwerk/job/${r.id}`)}
      accessibilityLabel={`${tradeLabel(r.trade)}: ${r.title}`}
      style={{ gap: spacing.sm }}
    >
      <View style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' }}>
        <IconCircle name={tradeIcon(r.trade)} tone="primary" size={44} />
        <View style={{ flex: 1, gap: 2 }}>
          <AppText variant="mono">{tradeLabel(r.trade)}</AppText>
          <AppText variant="title" numberOfLines={2}>
            {r.title}
          </AppText>
          <AppText variant="small" muted>
            {[`${r.zip} ${r.city}`, r.when].filter(Boolean).join(' · ')}
          </AppText>
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <AppText variant="small" muted style={{ flex: 1 }} numberOfLines={1}>
          {r.fromId === meId
            ? to
              ? `${t.direktAn} ${to.company}`
              : t.anAlle
            : `${t.von} ${from?.company ?? '–'}`}
        </AppText>
        {badge ? <Badge label={badge.label} tone={badge.tone} /> : null}
      </View>
    </Card>
  );
}
