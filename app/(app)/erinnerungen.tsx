import { Stack } from 'expo-router';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { Chips } from '@/components/Chips';
import { Screen } from '@/components/Screen';
import { ToggleRow } from '@/components/ToggleRow';
import { useDemo } from '@/features/demo/store';
import { de } from '@/i18n/de';
import { spacing } from '@/theme';

const t = de.erinnerungen;
const dayOptions = [3, 5, 7, 14].map((d) => ({ value: String(d), label: `${d} ${t.tage}` }));
const hourOptions = [16, 17, 18, 19].map((h) => ({ value: String(h), label: `${h}:00` }));

export default function ErinnerungenScreen() {
  const r = useDemo((s) => s.reminders);
  const set = useDemo((s) => s.setReminders);
  return (
    <Screen>
      <Stack.Screen options={{ title: t.titel }} />
      <AppText muted>{t.hinweis}</AppText>
      <Card>
        <ToggleRow
          title={t.nachfassen}
          subtitle={t.nachfassenNach(r.followUpDays)}
          value={r.followUp}
          onChange={(v) => set({ followUp: v })}
        />
        {r.followUp ? (
          <View style={{ gap: spacing.xs }}>
            <Chips
              options={dayOptions}
              value={String(r.followUpDays)}
              onChange={(v) => set({ followUpDays: Number(v) })}
            />
          </View>
        ) : null}
      </Card>
      <Card>
        <ToggleRow
          title={t.ueberfaellig}
          subtitle={t.ueberfaelligText}
          value={r.overdue}
          onChange={(v) => set({ overdue: v })}
        />
      </Card>
      <Card>
        <ToggleRow
          title={t.tagesabschluss}
          subtitle={t.tagesabschlussText(r.wrapUpHour)}
          value={r.dailyWrapUp}
          onChange={(v) => set({ dailyWrapUp: v })}
        />
        {r.dailyWrapUp ? (
          <Chips
            options={hourOptions}
            value={String(r.wrapUpHour)}
            onChange={(v) => set({ wrapUpHour: Number(v) })}
          />
        ) : null}
      </Card>
      <Card>
        <ToggleRow
          title={t.einstempeln}
          subtitle={t.einstempelnText}
          value={r.autoClockIn}
          onChange={(v) => set({ autoClockIn: v })}
        />
        <AppText variant="small" muted>
          {t.einstempelnRecht}
        </AppText>
      </Card>
    </Screen>
  );
}
