import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { AddButton } from '@/components/AddButton';
import { AppText } from '@/components/AppText';
import { Chips } from '@/components/Chips';
import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { AppointmentCard } from '@/features/calendar/AppointmentCard';
import { WeekStrip } from '@/features/calendar/WeekStrip';
import { appointmentsOn } from '@/features/demo/selectors';
import { de } from '@/i18n/de';
import { addDays, formatDayLong, startOfWeek } from '@/lib/date';
import { spacing } from '@/theme';
import { useStamm } from '@/features/demo/stamm';

type Mode = 'tag' | 'woche';

export default function KalenderScreen() {
  useStamm((s) => s.appointments); // neu angelegte Termine sofort anzeigen
  const [day, setDay] = useState(new Date());
  const [mode, setMode] = useState<Mode>('tag');
  const now = new Date();
  const days =
    mode === 'tag' ? [day] : Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(day), i));

  return (
    <Screen
      title={de.tabs.kalender}
      right={<AddButton label={de.anlegen.termin} onPress={() => router.push('/termin-neu')} />}
      header={
        <>
          <Chips
            segmented
            options={[
              { value: 'tag', label: de.kalender.tag },
              { value: 'woche', label: de.kalender.woche },
            ]}
            value={mode}
            onChange={setMode}
          />
          <WeekStrip selected={day} onSelect={setDay} />
        </>
      }
    >
      {days.map((d) => {
        const list = appointmentsOn(d);
        if (mode === 'woche' && list.length === 0) return null;
        return (
          <View key={d.toDateString()} style={{ gap: spacing.sm }}>
            <AppText variant="title">{formatDayLong(d)}</AppText>
            {list.length === 0 ? (
              <EmptyState icon="calendar-clear-outline" text={de.kalender.keineTermine} />
            ) : (
              list.map((a) => <AppointmentCard key={a.id} appointment={a} now={now} />)
            )}
          </View>
        );
      })}
    </Screen>
  );
}
