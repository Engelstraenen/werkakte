import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Avatar } from '@/components/Avatar';
import { Card } from '@/components/Card';
import { CURRENT_MEMBER_ID } from '@/features/demo/data';
import { isOwner, memberById } from '@/features/demo/selectors';
import { useDemo } from '@/features/demo/store';
import { useNow } from '@/features/time/useNow';
import { de } from '@/i18n/de';
import { formatDuration } from '@/lib/date';
import { radius, spacing, touch, useColors } from '@/theme';

/** "Gerade im Einsatz": wer arbeitet wo und wie lange schon. Inhaber sieht alle, sonst nur sich. */
export function TimerCard() {
  const colors = useColors();
  const { timers, projects, stopTimer } = useDemo();
  const now = useNow(true);
  const running = Object.entries(timers).filter(([id]) => isOwner() || id === CURRENT_MEMBER_ID);
  if (running.length === 0) return null;

  return (
    <Card>
      <AppText variant="mono">● {de.zeit.imEinsatz}</AppText>
      {running.map(([memberId, timer]) => {
        const project = projects.find((p) => p.id === timer.projectId)!;
        const member = memberById(memberId);
        return (
          <View
            key={memberId}
            style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}
          >
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push({ pathname: '/projekt/[id]', params: { id: project.id } })}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.sm,
                minHeight: touch.min,
              }}
            >
              <Avatar name={member.name} size={36} />
              <View style={{ flex: 1 }}>
                <AppText variant="label" numberOfLines={1}>
                  {memberId === CURRENT_MEMBER_ID ? de.zeit.ich : member.name.split(' ')[0]} ·{' '}
                  {formatDuration(now - new Date(timer.startedAt).getTime())}
                </AppText>
                <AppText variant="small" muted numberOfLines={1}>
                  {project.title}
                </AppText>
              </View>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${de.zeit.stoppen}: ${member.name}`}
              onPress={() => stopTimer(memberId)}
              style={{
                minHeight: touch.min,
                paddingHorizontal: spacing.md,
                borderRadius: radius.md,
                justifyContent: 'center',
                backgroundColor: colors.danger,
              }}
            >
              <AppText variant="label" color={colors.onTone}>
                {de.zeit.stopp}
              </AppText>
            </Pressable>
          </View>
        );
      })}
    </Card>
  );
}
