import { Pressable, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Avatar } from '@/components/Avatar';
import { members } from '@/features/demo/data';
import { useDemo } from '@/features/demo/store';
import type { Project } from '@/features/demo/types';
import { de } from '@/i18n/de';
import { radius, spacing, touch, useColors } from '@/theme';

/** Wer gehört zum Projekt (= darf es sehen und dort Zeit erfassen). Nur für den Inhaber. */
export function TeamEditor({ project }: { project: Project }) {
  const colors = useColors();
  const { timers, setTeam, stopTimer } = useDemo();

  function toggle(id: string) {
    const inTeam = project.memberIds.includes(id);
    if (inTeam && project.memberIds.length === 1) return; // mindestens eine Person
    if (inTeam && timers[id]?.projectId === project.id) stopTimer(id); // Zeit vorher sichern
    setTeam(
      project.id,
      inTeam ? project.memberIds.filter((m) => m !== id) : [...project.memberIds, id],
    );
  }

  return (
    <View style={{ gap: spacing.xs }}>
      <AppText variant="small" muted>
        {de.zeit.teamHinweis}
      </AppText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        {members.map((m) => {
          const on = project.memberIds.includes(m.id);
          return (
            <Pressable
              key={m.id}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: on }}
              onPress={() => toggle(m.id)}
              style={{
                minHeight: touch.min,
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.xs,
                paddingRight: spacing.md,
                paddingLeft: 4,
                borderRadius: radius.full,
                borderWidth: 2,
                borderColor: on ? colors.success : colors.border,
                backgroundColor: on ? colors.card : colors.surface,
                opacity: on ? 1 : 0.7,
              }}
            >
              <Avatar name={m.name} size={36} />
              <AppText variant="label">
                {on ? '✓ ' : ''}
                {m.name.split(' ')[0]}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
