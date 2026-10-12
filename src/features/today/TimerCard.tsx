import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { IconCircle } from '@/components/IconCircle';
import { useDemo } from '@/features/demo/store';
import { de } from '@/i18n/de';
import { formatDuration } from '@/lib/date';
import { spacing } from '@/theme';

/** Laufende Arbeitszeit; nur sichtbar, wenn eine Zeit gestartet wurde. */
export function TimerCard() {
  const timer = useDemo((s) => s.timer);
  const stop = useDemo((s) => s.stopTimer);
  const project = useDemo((s) => s.projects.find((p) => p.id === timer?.projectId));
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!timer) return;
    const id = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(id);
  }, [timer]);

  if (!timer || !project) return null;
  return (
    <Card>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <IconCircle name="timer" tone="success" />
        <View style={{ flex: 1 }}>
          <AppText variant="small" muted>
            {de.heute.zeitLaeuft} · {project.title}
          </AppText>
          <AppText variant="heading">
            {formatDuration(now - new Date(timer.startedAt).getTime())}
          </AppText>
        </View>
      </View>
      <Button title={de.heute.stoppen} variant="secondary" onPress={stop} />
    </Card>
  );
}
