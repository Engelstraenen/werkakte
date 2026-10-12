import type { ReactNode } from 'react';
import { ScrollView } from 'react-native';

import { spacing, useColors } from '@/theme';

export function Screen({ children }: { children: ReactNode }) {
  const colors = useColors();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: spacing.md, gap: spacing.md }}
      keyboardShouldPersistTaps="handled"
      contentInsetAdjustmentBehavior="automatic"
    >
      {children}
    </ScrollView>
  );
}
