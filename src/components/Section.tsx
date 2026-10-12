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
    <View style={{ gap: spacing.sm, marginTop: spacing.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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
