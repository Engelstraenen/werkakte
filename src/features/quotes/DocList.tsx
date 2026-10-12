import { router } from 'expo-router';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Badge } from '@/components/Badge';
import { Card } from '@/components/Card';
import { IconCircle } from '@/components/IconCircle';
import { ListRow } from '@/components/ListRow';
import { docTotal } from '@/features/demo/selectors';
import type { Invoice, Quote } from '@/features/demo/types';
import { de } from '@/i18n/de';
import { formatDate } from '@/lib/date';
import { formatEuro } from '@/lib/money';
import type { Tone } from '@/theme';

const statusTone: Record<string, Tone> = {
  entwurf: 'neutral',
  versendet: 'warning',
  angenommen: 'success',
  abgelehnt: 'danger',
  bezahlt: 'success',
};

const typeLabel = (d: Quote | Invoice) =>
  'validUntil' in d
    ? de.beleg.angebot
    : d.type === 'abschlag'
      ? de.beleg.abschlag
      : d.type === 'schluss'
        ? de.beleg.schluss
        : de.beleg.rechnung;

export function DocList({ docs }: { docs: (Quote | Invoice)[] }) {
  return (
    <Card style={{ paddingVertical: 4 }}>
      {docs.map((d, i) => (
        <ListRow
          key={d.id}
          divider={i > 0}
          title={d.number}
          subtitle={`${typeLabel(d)}\n${formatDate(d.date)}`}
          left={
            <IconCircle
              name={'validUntil' in d ? 'document-text' : 'receipt'}
              tone={'validUntil' in d ? 'primary' : 'info'}
              size={40}
            />
          }
          right={
            <View style={{ alignItems: 'flex-end', gap: 4 }}>
              <AppText variant="label">{formatEuro(docTotal(d))}</AppText>
              <Badge
                label={de.belegStatus[d.status]}
                tone={statusTone[d.status]}
                align="flex-end"
              />
            </View>
          }
          onPress={() => router.push({ pathname: '/beleg/[id]', params: { id: d.id } })}
        />
      ))}
    </Card>
  );
}
