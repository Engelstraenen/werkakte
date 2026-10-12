import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { ProjectTimer } from './ProjectTimer';
import { TeamEditor } from './TeamEditor';
import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { isOwner } from '@/features/demo/selectors';
import type { Project } from '@/features/demo/types';
import { de } from '@/i18n/de';
import { useColors } from '@/theme';

/** Zeit erfassen pro Person + (für den Inhaber) festlegen, wer im Projekt-Team ist. */
export function TimeTeamCard({ project }: { project: Project }) {
  const colors = useColors();
  const [editing, setEditing] = useState(false);
  return (
    <Card>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <AppText variant="title" style={{ flex: 1 }}>
          {de.akte.zeitTeam}
        </AppText>
        {isOwner() ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => setEditing(!editing)}
            hitSlop={12}
            style={{ minHeight: 48, justifyContent: 'center' }}
          >
            <AppText variant="label" color={colors.primary}>
              {editing ? de.zeit.fertig : de.zeit.teamBearbeiten}
            </AppText>
          </Pressable>
        ) : null}
      </View>
      {editing ? <TeamEditor project={project} /> : null}
      <ProjectTimer project={project} />
    </Card>
  );
}
