import { Stack, router } from 'expo-router';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Avatar } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { ListRow } from '@/components/ListRow';
import { Screen } from '@/components/Screen';
import { Section } from '@/components/Section';
import { azubis, jobs } from '@/features/team/data';
import { JobShareList } from '@/features/team/JobShareList';
import { statusLabel, statusTone } from '@/features/team/labels';
import { bonusesDue, useTeam } from '@/features/team/store';
import { de } from '@/i18n/de';
import { spacing, useColors } from '@/theme';

const t = de.team;

function Stat({ value, label }: { value: string; label: string }) {
  const colors = useColors();
  return (
    <Card style={{ flex: 1, gap: 2 }}>
      <AppText variant="display" color={colors.primary}>
        {value}
      </AppText>
      <AppText variant="small" muted>
        {label}
      </AppText>
    </Card>
  );
}

export default function TeamScreen() {
  const applicants = useTeam((s) => s.applicants);
  const shares = useTeam((s) => s.shares);
  const fresh = applicants.filter((a) => a.status === 'neu').length;
  const totalShares = Object.values(shares).reduce((a, b) => a + b, 0);
  const due = Object.values(bonusesDue(applicants)).reduce((a, b) => a + b, 0);
  const sorted = [...applicants].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return (
    <Screen>
      <Stack.Screen options={{ title: t.titel }} />
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <Stat value={String(jobs.filter((j) => j.open).length)} label={t.offeneStellen} />
        <Stat value={String(fresh)} label={t.neueBewerbungen} />
        <Stat value={String(totalShares)} label={t.geteilt} />
      </View>
      {due > 0 && <Badge label={`${due} × ${t.praemieOffen}`} tone="success" />}

      <Section title={t.bewerbungen}>
        <Card style={{ paddingVertical: 4 }}>
          {sorted.length === 0 && <EmptyState icon="person-add" text={t.keineBewerbungen} />}
          {sorted.map((a, i) => (
            <ListRow
              key={a.id}
              divider={i > 0}
              title={a.name}
              subtitle={`${jobs.find((j) => j.id === a.jobId)?.short ?? ''} · ${statusLabel[a.status]}`}
              left={<Avatar name={a.name} />}
              right={
                a.status === 'neu' ? (
                  <Badge label={statusLabel[a.status]} tone={statusTone[a.status]} />
                ) : undefined
              }
              onPress={() => router.push(`/team/bewerber/${a.id}`)}
            />
          ))}
        </Card>
      </Section>

      <Section title={t.stellen}>
        <JobShareList />
      </Section>

      <Section title={t.azubis}>
        <Card style={{ paddingVertical: 4 }}>
          {azubis.map((z, i) => (
            <ListRow
              key={z.id}
              divider={i > 0}
              title={z.name}
              subtitle={`${z.lehrjahr}. ${t.lehrjahr} · ${t.berichtsheft}`}
              left={<Avatar name={z.name} />}
              onPress={() => router.push(`/team/berichtsheft/${z.id}`)}
            />
          ))}
        </Card>
      </Section>
    </Screen>
  );
}
