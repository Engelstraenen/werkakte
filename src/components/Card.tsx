import type { ReactNode } from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';

import { radius, spacing, useColors } from '@/theme';

type Props = {
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  /** Farbiger Streifen links, z. B. Projektstatus. */
  accent?: string;
  accessibilityLabel?: string;
};

export function Card({ children, onPress, style, accent, accessibilityLabel }: Props) {
  const colors = useColors();
  const base: ViewStyle = {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
    boxShadow: colors.shadow,
    borderLeftWidth: accent ? 5 : 0,
    borderLeftColor: accent,
    overflow: 'hidden',
  };
  if (!onPress) return <View style={[base, style]}>{children}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [base, { opacity: pressed ? 0.85 : 1 }, style]}
    >
      {children}
    </Pressable>
  );
}
