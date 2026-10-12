import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { projectMinutes } from '@/features/demo/selectors';
import { useDemo } from '@/features/demo/store';
import { de } from '@/i18n/de';
import { formatDuration, formatHours } from '@/lib/date';
import { radius, spacing, touch, useColors } from '@/theme';

const t = de.zeit;

/** Großer Start/Stopp-Button im Projekt. Stoppen speichert die Zeit als Stunden im Projekt. */
export function ProjectTimer({ projectId }: { projectId: string }) {
  const colors = useColors();
  const { timer, projectCosts, startTimer, stopTimer } = useDemo();
  const running = !!timer && timer.projectId === projectId;
  const startedAt = timer ? new Date(timer.startedAt).getTime() : 0;
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(id);
  }, [running]);

  const color = running ? colors.danger : colors.success;
  return (
    <View style={{ gap: spacing.xs }}>
      <Pressable
        accessibilityRole="button"
        onPress={() => (running ? stopTimer() : startTimer(projectId))}
        style={({ pressed }) => ({
          minHeight: touch.main + 8,
          borderRadius: radius.md,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing.sm,
          backgroundColor: color,
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <Ionicons name={running ? 'stop' : 'play'} size={24} color="#FFFFFF" />
        <AppText variant="title" color="#FFFFFF">
          {running ? `${t.stoppen} · ${formatDuration(now - startedAt)}` : t.starten}
        </AppText>
      </Pressable>
      <AppText variant="small" muted style={{ textAlign: 'center' }}>
        {t.bisher(formatHours(projectMinutes(projectId, projectCosts)))}
        {running ? ` · ${t.hinweis}` : ''}
      </AppText>
    </View>
  );
}
