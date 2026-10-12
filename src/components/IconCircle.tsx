import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { View } from 'react-native';

import { soft, useColors, type Tone } from '@/theme';

export type IconName = ComponentProps<typeof Ionicons>['name'];

export function IconCircle({
  name,
  tone = 'primary',
  size = 44,
}: {
  name: IconName;
  tone?: Tone;
  size?: number;
}) {
  const colors = useColors();
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: soft(colors[tone]),
      }}
    >
      <Ionicons name={name} size={size * 0.5} color={colors[tone]} />
    </View>
  );
}
