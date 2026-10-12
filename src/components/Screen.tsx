import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from './AppText';
import { BlueprintGrid } from './BlueprintGrid';
import { spacing, useColors } from '@/theme';

type Props = {
  children: ReactNode;
  /** Großer Titel oben (für Tab-Screens ohne Kopfleiste). */
  title?: string;
  subtitle?: string;
  /** Element rechts neben dem Titel, z. B. ein Avatar. */
  right?: ReactNode;
  /** Bereich unter dem Titel, der beim Scrollen mitläuft (z. B. Suche). */
  header?: ReactNode;
};

export function Screen({ children, title, subtitle, right, header }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <BlueprintGrid />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: spacing.md,
          paddingTop: title ? insets.top + spacing.md : spacing.md,
          paddingBottom: spacing.xl,
          gap: spacing.md,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {title ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <View style={{ flex: 1 }}>
              {subtitle ? <AppText variant="mono">{subtitle}</AppText> : null}
              <AppText variant="display">{title}</AppText>
            </View>
            {right}
          </View>
        ) : null}
        {header}
        {children}
      </ScrollView>
    </View>
  );
}
