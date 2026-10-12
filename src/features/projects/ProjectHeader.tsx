import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, View } from 'react-native';

import { ProjectCover } from './ProjectCover';
import { statusTone } from './status';
import { AppText } from '@/components/AppText';
import { AvatarStack } from '@/components/Avatar';
import { Card } from '@/components/Card';
import { Chips } from '@/components/Chips';
import type { IconName } from '@/components/IconCircle';
import { customerOf, memberById, statusOrder } from '@/features/demo/selectors';
import { useDemo } from '@/features/demo/store';
import type { Project } from '@/features/demo/types';
import { de } from '@/i18n/de';
import { call, mail, openRoute } from '@/lib/links';
import { radius, soft, spacing, touch, useColors } from '@/theme';

function QuickButton({
  icon,
  label,
  onPress,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
}) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        minHeight: touch.main + 8,
        borderRadius: radius.md,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        backgroundColor: soft(colors.primary),
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Ionicons name={icon} size={24} color={colors.primary} />
      <AppText variant="small" color={colors.primary} style={{ fontWeight: '700' }}>
        {label}
      </AppText>
    </Pressable>
  );
}

export function ProjectHeader({ project }: { project: Project }) {
  const colors = useColors();
  const setStatus = useDemo((s) => s.setStatus);
  const customer = customerOf(project);
  const address = `${project.street}, ${project.zipCity}`;

  return (
    <>
      <Card accent={colors[statusTone[project.status]]}>
        <ProjectCover project={project} height={190} />
        <AppText variant="heading">{project.title}</AppText>
        <View style={{ gap: 2 }}>
          <AppText variant="label">
            {customer.name}
            {customer.contact ? ` · ${customer.contact}` : ''}
          </AppText>
          <AppText muted>{address}</AppText>
        </View>
        <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs }}>
          <QuickButton
            icon="navigate"
            label={de.akte.navigation}
            onPress={() => openRoute(address)}
          />
          <QuickButton icon="call" label={de.akte.anrufen} onPress={() => call(customer.phone)} />
          <QuickButton icon="mail" label={de.akte.mail} onPress={() => mail(customer.email)} />
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
            marginTop: spacing.xs,
          }}
        >
          <AppText variant="small" muted>
            {de.akte.team}
          </AppText>
          <AvatarStack names={project.memberIds.map((id) => memberById(id).name)} size={30} />
          <AppText variant="small" muted style={{ flex: 1 }} numberOfLines={1}>
            {project.memberIds.map((id) => memberById(id).name.split(' ')[0]).join(', ')}
          </AppText>
        </View>
      </Card>
      <View style={{ gap: spacing.xs }}>
        <AppText variant="small" muted>
          {de.akte.status}
        </AppText>
        <Chips
          options={statusOrder.map((s) => ({ value: s, label: de.status[s] }))}
          value={project.status}
          onChange={(s) => setStatus(project.id, s)}
        />
      </View>
    </>
  );
}
