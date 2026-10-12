import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { AvatarStack } from '@/components/Avatar';
import { Card } from '@/components/Card';
import { customerOf, memberById } from '@/features/demo/selectors';
import { useDemo } from '@/features/demo/store';
import type { Appointment } from '@/features/demo/types';
import { de } from '@/i18n/de';
import { formatTime } from '@/lib/date';
import { openRoute } from '@/lib/links';
import { fonts, radius, soft, spacing, touch, useColors } from '@/theme';

export function AppointmentCard({ appointment, now }: { appointment: Appointment; now?: Date }) {
  const colors = useColors();
  const project = useDemo((s) => s.projects.find((p) => p.id === appointment.projectId))!;
  const customer = customerOf(project);
  const running =
    now !== undefined && new Date(appointment.start) <= now && now < new Date(appointment.end);
  const address = `${project.street}, ${project.zipCity}`;

  return (
    <Card accent={running ? colors.primary : undefined}>
      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        {/* Karte selbst nicht klickbar: Button-in-Button ist im Web ungültig. */}
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push({ pathname: '/projekt/[id]', params: { id: project.id } })}
          style={({ pressed }) => ({
            flex: 1,
            flexDirection: 'row',
            gap: spacing.md,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <View style={{ width: 58 }}>
            <AppText variant="label">{formatTime(appointment.start)}</AppText>
            <AppText variant="small" muted>
              {formatTime(appointment.end)}
            </AppText>
            {running ? (
              <AppText
                variant="small"
                color={colors.primary}
                style={{ fontFamily: fonts.bodyBold }}
              >
                {de.heute.jetzt}
              </AppText>
            ) : null}
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <AppText variant="label">{appointment.title}</AppText>
            <AppText variant="small" muted>
              {project.title} · {customer.name}
            </AppText>
            <AppText variant="small" muted numberOfLines={1}>
              {address}
            </AppText>
            <View style={{ marginTop: spacing.xs }}>
              <AvatarStack
                names={appointment.memberIds.map((id) => memberById(id).name)}
                size={26}
              />
            </View>
          </View>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${de.akte.navigation}: ${address}`}
          onPress={() => openRoute(address)}
          style={{
            width: touch.main,
            height: touch.main,
            borderRadius: radius.md,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: soft(colors.primary),
            alignSelf: 'center',
          }}
        >
          <Ionicons name="navigate" size={24} color={colors.primary} />
        </Pressable>
      </View>
    </Card>
  );
}
