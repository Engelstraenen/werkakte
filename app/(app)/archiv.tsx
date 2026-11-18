import { Stack } from 'expo-router';
import { useState } from 'react';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { Chips } from '@/components/Chips';
import { EmptyState } from '@/components/EmptyState';
import { IconCircle } from '@/components/IconCircle';
import { ListRow } from '@/components/ListRow';
import { Screen } from '@/components/Screen';
import { customerOf, docTotal } from '@/features/demo/selectors';
import { useDemo } from '@/features/demo/store';
import type { Invoice, Quote } from '@/features/demo/types';
import { shareBeleg } from '@/features/invoices/belegExport';
import { de } from '@/i18n/de';
import { formatDate } from '@/lib/date';
import { formatEuro } from '@/lib/money';
import { notice } from '@/lib/notice';

const t = de.archiv;
type Filter = 'rechnungen' | 'angebote';

/** Ablage aller versendeten Belege – unveränderbar, PDF jederzeit neu teilen. */
export default function ArchivScreen() {
  const { quotes, invoices, projects, sending } = useDemo();
  const [filter, setFilter] = useState<Filter>('rechnungen');
  const docs: (Quote | Invoice)[] = (filter === 'rechnungen' ? invoices : quotes)
    .filter((d) => d.status !== 'entwurf')
    .sort((a, b) => (b.sentAt ?? b.date).localeCompare(a.sentAt ?? a.date));

  const open = (doc: Quote | Invoice) => {
    const project = projects.find((p) => p.id === doc.projectId);
    if (project) shareBeleg(doc, project).catch(() => notice(de.pdf.teilen, de.pdf.fehler));
  };

  return (
    <Screen>
      <Stack.Screen options={{ title: t.titel }} />
      <AppText muted>{t.hinweis(sending.myEmail)}</AppText>
      <Chips
        segmented
        options={[
          { value: 'rechnungen', label: t.rechnungen },
          { value: 'angebote', label: t.angebote },
        ]}
        value={filter}
        onChange={setFilter}
      />
      {docs.length === 0 ? (
        <EmptyState icon="archive-outline" text={t.leer} />
      ) : (
        <Card style={{ paddingVertical: 4 }}>
          {docs.map((d, i) => {
            const project = projects.find((p) => p.id === d.projectId);
            return (
              <ListRow
                key={d.id}
                divider={i > 0}
                title={`${d.number} · ${project ? customerOf(project).name : ''}`}
                subtitle={`${formatEuro(docTotal(d))} · ${t.versendet(formatDate(d.sentAt ?? d.date))}`}
                left={<IconCircle name="document-text" size={40} />}
                onPress={() => open(d)}
              />
            );
          })}
        </Card>
      )}
    </Screen>
  );
}
