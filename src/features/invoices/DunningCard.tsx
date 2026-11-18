import { View } from 'react-native';

import { shareDunning } from './belegExport';
import { DUNNING_TITLE, daysOverdue } from './dunning';
import { AppText } from '@/components/AppText';
import { Badge } from '@/components/Badge';
import { Card } from '@/components/Card';
import { ListRow } from '@/components/ListRow';
import type { Invoice, Project } from '@/features/demo/types';
import { de } from '@/i18n/de';
import { formatDate } from '@/lib/date';
import { notice } from '@/lib/notice';
import { spacing } from '@/theme';

const a = de.ablauf;

/** Offene Rechnung: wie lange überfällig + Verlauf der Erinnerungen/Mahnungen. */
export function DunningCard({ invoice, project }: { invoice: Invoice; project: Project }) {
  if (invoice.status !== 'versendet') return null;
  const days = daysOverdue(invoice);
  const list = invoice.dunning ?? [];
  return (
    <Card style={{ gap: spacing.xs }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <AppText variant="label" style={{ flex: 1 }}>
          {a.mahnVerlauf}
        </AppText>
        <Badge label={a.ueberfaellig(days)} tone={days > 0 ? 'danger' : 'neutral'} />
      </View>
      {list.map((d, i) => (
        <ListRow
          key={d.sentAt}
          divider={i > 0}
          title={a.mahnZeile(DUNNING_TITLE[d.level], formatDate(d.sentAt), formatDate(d.deadline))}
          subtitle={a.mahnErneut}
          onPress={() =>
            shareDunning(invoice, project, d).catch(() => notice(de.pdf.teilen, de.pdf.fehler))
          }
        />
      ))}
    </Card>
  );
}
