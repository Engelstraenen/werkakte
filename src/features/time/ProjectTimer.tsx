import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, View } from 'react-native';

import { useNow } from './useNow';
import { AppText } from '@/components/AppText';
import { Avatar } from '@/components/Avatar';
import { CURRENT_MEMBER_ID } from '@/features/demo/data';
import { isOwner, memberById, projectMinutes } from '@/features/demo/selectors';
import { useDemo } from '@/features/demo/store';
import type { Project } from '@/features/demo/types';
import { de } from '@/i18n/de';
import { formatDuration, formatHours } from '@/lib/date';
import { radius, spacing, touch, useColors } from '@/theme';

const t = de.zeit;

/**
 * Zeit pro Person im Projekt. Inhaber sieht und bedient das ganze Team,
 * Mitarbeiter nur die eigene Zeile. Stoppen speichert die Stunden im Projekt.
 */
export function ProjectTimer({ project }: { project: Project }) {
  const colors = useColors();
  const { timers, projects, projectCosts, startTimer, stopTimer } = useDemo();
  const now = useNow(Object.keys(timers).length > 0);
  const visible = isOwner()
    ? project.memberIds
    : project.memberIds.filter((id) => id === CURRENT_MEMBER_ID);
  // Eigene Zeile zuerst.
  const rows = [...visible].sort(
    (a, b) => Number(b === CURRENT_MEMBER_ID) - Number(a === CURRENT_MEMBER_ID),
  );

  return (
    <View style={{ gap: spacing.xs }}>
      {rows.map((memberId) => {
        const member = memberById(memberId);
        const timer = timers[memberId];
        const here = timer?.projectId === project.id;
        const elsewhere =
          timer && !here ? projects.find((p) => p.id === timer.projectId) : undefined;
        const color = here ? colors.danger : colors.success;
        return (
          <View
            key={memberId}
            style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}
          >
            <Avatar name={member.name} size={36} />
            <View style={{ flex: 1 }}>
              <AppText variant="label" numberOfLines={1}>
                {memberId === CURRENT_MEMBER_ID ? t.ich : member.name.split(' ')[0]}
              </AppText>
              <AppText variant="small" muted numberOfLines={1}>
                {here
                  ? `${t.laeuft} ${formatDuration(now - new Date(timer.startedAt).getTime())}`
                  : elsewhere
                    ? t.woanders(elsewhere.title)
                    : t.aus}
              </AppText>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${here ? t.stoppen : t.starten}: ${member.name}`}
              onPress={() => (here ? stopTimer(memberId) : startTimer(project.id, memberId))}
              style={({ pressed }) => ({
                minWidth: 112,
                minHeight: touch.main,
                borderRadius: radius.md,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                paddingHorizontal: spacing.md,
                backgroundColor: color,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <Ionicons name={here ? 'stop' : 'play'} size={20} color={colors.onTone} />
              <AppText variant="label" color={colors.onTone}>
                {here ? t.stopp : t.start}
              </AppText>
            </Pressable>
          </View>
        );
      })}
      <AppText variant="small" muted style={{ textAlign: 'center' }}>
        {t.bisher(formatHours(projectMinutes(project.id, projectCosts)))}
      </AppText>
    </View>
  );
}
