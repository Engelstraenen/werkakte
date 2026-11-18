import { Stack, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { Section } from '@/components/Section';
import { useDemo } from '@/features/demo/store';
import { buildWeeks, formatHours, weekAsText, type ReportWeek } from '@/features/team/berichtsheft';
import { azubis, workLog } from '@/features/team/data';
import { weekLabel, weekTone } from '@/features/team/labels';
import { shareText } from '@/features/team/share';
import { useTeam } from '@/features/team/store';
import { de } from '@/i18n/de';
import { spacing, useColors } from '@/theme';

const t = de.team;

function WeekCard({ w, azubiId }: { w: ReportWeek; azubiId: string }) {
  const colors = useColors();
  const projects = useDemo((s) => s.projects);
  const status = useTeam((s) => s.weekStatus[`${azubiId}:${w.key}`] ?? 'offen');
  const setStatus = useTeam((s) => s.setWeekStatus);
  const azubi = azubis.find((z) => z.id === azubiId)!;
  const projectTitle = (date: string) =>
    projects.find((p) => p.id === workLog.find((e) => e.date === date)?.projectId)?.title;
  return (
    <Card style={{ gap: spacing.sm + 4 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <AppText variant="heading">
          {t.woche} {w.week}
        </AppText>
        <Badge label={weekLabel[status]} tone={weekTone[status]} />
      </View>
      <AppText variant="mono">
        {t.betrieb} {formatHours(w.minutesBetrieb)} · {t.berufsschule}{' '}
        {formatHours(w.minutesSchule)}
      </AppText>
      {w.days.map((d) => (
        <View
          key={d.date}
          style={{
            gap: 2,
            borderLeftWidth: 3,
            borderLeftColor: d.place === 'berufsschule' ? colors.info : colors.primary,
            paddingLeft: spacing.sm + 2,
          }}
        >
          <AppText variant="label">
            {new Date(d.date).toLocaleDateString('de-DE', {
              weekday: 'long',
              day: '2-digit',
              month: '2-digit',
            })}
            {' · '}
            {d.place === 'berufsschule' ? t.berufsschule : (projectTitle(d.date) ?? t.betrieb)}
          </AppText>
          {d.tasks.map((task) => (
            <AppText key={task}>{task}</AppText>
          ))}
          <AppText variant="small" muted>
            {formatHours(d.minutes)}
            {d.photos > 0 ? ` · ${d.photos} ${t.fotos}` : ''}
          </AppText>
        </View>
      ))}
      {status === 'offen' && (
        <Button
          title={t.wocheAbschliessen}
          onPress={() => setStatus(azubiId, w.key, 'abgeschlossen')}
        />
      )}
      {status === 'abgeschlossen' && (
        <Button title={t.abzeichnen} onPress={() => setStatus(azubiId, w.key, 'abgezeichnet')} />
      )}
      <Button
        title={t.alsTextTeilen}
        variant="secondary"
        onPress={() => shareText(weekAsText(w, azubi.name, azubi.beruf))}
      />
    </Card>
  );
}

export default function BerichtsheftScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const azubi = azubis.find((z) => z.id === id);
  const weeks = useMemo(() => (azubi ? buildWeeks(workLog, azubi.id) : []), [azubi]);
  if (!azubi) return <EmptyState icon="school" text="–" />;
  return (
    <Screen>
      <Stack.Screen options={{ title: `${t.berichtsheft} · ${azubi.name}` }} />
      <AppText muted>{t.berichtsheftHinweis}</AppText>
      <Section title={`${azubi.beruf}, ${azubi.lehrjahr}. ${t.lehrjahr}`}>
        {weeks.map((w) => (
          <WeekCard key={w.key} w={w} azubiId={azubi.id} />
        ))}
      </Section>
    </Screen>
  );
}
