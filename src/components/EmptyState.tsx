import { View } from 'react-native';

import { AppText } from './AppText';
import { IconCircle, type IconName } from './IconCircle';
import { spacing } from '@/theme';

export function EmptyState({ icon, text }: { icon: IconName; text: string }) {
  return (
    <View style={{ alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xl }}>
      <IconCircle name={icon} tone="neutral" size={56} />
      <AppText muted style={{ textAlign: 'center' }}>
        {text}
      </AppText>
    </View>
  );
}
