import Ionicons from '@expo/vector-icons/Ionicons';
import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { AppText } from './AppText';
import { spacing, touch, useColors } from '@/theme';

type Props = {
  title: string;
  subtitle?: string;
  left?: ReactNode;
  right?: ReactNode;
  onPress?: () => void;
  /** Trennlinie oben (in Listen ab der 2. Zeile). */
  divider?: boolean;
};

export function ListRow({ title, subtitle, left, right, onPress, divider }: Props) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: touch.main,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingVertical: spacing.sm + 2,
        borderTopWidth: divider ? 1 : 0,
        borderTopColor: colors.surface,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      {left}
      <View style={{ flex: 1, gap: 2 }}>
        <AppText variant="label" numberOfLines={2}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="small" muted numberOfLines={2}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {right}
      {onPress ? <Ionicons name="chevron-forward" size={20} color={colors.textMuted} /> : null}
    </Pressable>
  );
}
