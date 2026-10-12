import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';

import { fontSize, radius, spacing, touch, useColors } from '@/theme';

type Props = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
};

export function Button({ title, onPress, variant = 'primary', loading, disabled, icon }: Props) {
  const colors = useColors();
  const primary = variant === 'primary';
  const inactive = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      onPress={onPress}
      disabled={inactive}
      style={({ pressed }) => ({
        minHeight: touch.main,
        borderRadius: radius.md,
        paddingHorizontal: spacing.lg,
        flexDirection: 'row',
        gap: spacing.sm,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: primary ? colors.primary : 'transparent',
        borderWidth: primary ? 0 : 2,
        borderColor: colors.border,
        opacity: inactive ? 0.5 : pressed ? 0.8 : 1,
      })}
    >
      {loading ? (
        <ActivityIndicator color={primary ? colors.onPrimary : colors.text} />
      ) : (
        <>
          {icon}
          <Text
            style={{
              color: primary ? colors.onPrimary : colors.text,
              fontSize: fontSize.body,
              fontWeight: '700',
            }}
          >
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}
