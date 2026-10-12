import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { AppText } from './AppText';
import { spacing, useColors } from '@/theme';

type Props = {
  title: string;
  action?: { label: string; onPress: () => void };
  children: ReactNode;
};

/** Überschrift + Inhalt, optional mit Link rechts ("Alle"). */
export function Section({ title, action, children }: Props) {
  const colors = useColors();
  return (
    <View style={{ gap: spacing.sm + 4, marginTop: spacing.lg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        {/* Gelber Balken wie eine Markierung auf dem Plan: trennt Abschnitte deutlich. */}
        <View style={{ width: 5, height: 24, borderRadius: 2, backgroundColor: colors.accent }} />
        <AppText variant="title" style={{ flex: 1 }}>
          {title}
        </AppText>
        {action ? (
          <Pressable
            accessibilityRole="button"
            onPress={action.onPress}
            hitSlop={12}
            style={{ minHeight: 48, justifyContent: 'center' }}
          >
            <AppText variant="label" color={colors.primary}>
              {action.label}
            </AppText>
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  );
}
