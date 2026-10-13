import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { View } from 'react-native';

import { ProjectThumb } from './ProjectCover';
import { statusTone } from './status';
import { AppText } from '@/components/AppText';
import { AvatarStack } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import { Card } from '@/components/Card';
import { customerOf, memberById, openProblemCount } from '@/features/demo/selectors';
import { useDemo } from '@/features/demo/store';
import type { Project } from '@/features/demo/types';
import { de } from '@/i18n/de';
import { formatRelative } from '@/lib/date';
import { spacing, useColors } from '@/theme';

export function ProjectCard({ project }: { project: Project }) {
  const colors = useColors();
  const customer = customerOf(project);
  const tone = statusTone[project.status];
  const problems = useDemo((s) => openProblemCount(project.id, s.media));
  return (
    <Card
      accent={colors[tone]}
      accessibilityLabel={`${project.title}, ${customer.name}`}
      onPress={() => router.push({ pathname: '/projekt/[id]', params: { id: project.id } })}
    >
      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        <View style={{ flex: 1, gap: spacing.xs }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
            <Badge label={de.status[project.status]} tone={tone} />
            {problems ? (
              <Badge label={`! ${de.akte.problemeOffen(problems)}`} tone="danger" />
            ) : null}
          </View>
          <AppText variant="title" numberOfLines={2}>
            {project.title}
          </AppText>
          <AppText muted numberOfLines={1}>
            {customer.name}
          </AppText>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
            <Ionicons name="location-outline" size={16} color={colors.textMuted} />
            <AppText variant="small" muted style={{ flex: 1 }} numberOfLines={2}>
              {project.street}, {project.zipCity}
            </AppText>
          </View>
        </View>
        <ProjectThumb project={project} size={116} />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <AvatarStack names={project.memberIds.map((id) => memberById(id).name)} size={28} />
        <AppText variant="small" muted style={{ flex: 1, textAlign: 'right' }}>
          {formatRelative(project.updatedAt)}
        </AppText>
      </View>
    </Card>
  );
}
