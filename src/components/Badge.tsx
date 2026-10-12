import { View, type ViewStyle } from 'react-native';

import { AppText } from './AppText';
import { fonts, radius, soft, spacing, type Tone, useColors } from '@/theme';

type Props = { label: string; tone?: Tone; align?: ViewStyle['alignSelf'] };

export function Badge({ label, tone = 'neutral', align = 'flex-start' }: Props) {
  const colors = useColors();
  const color = colors[tone];
  return (
    <View
      style={{
        alignSelf: align,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: soft(color),
        borderRadius: radius.full,
        paddingHorizontal: 10,
        paddingVertical: spacing.xs,
      }}
    >
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
      <AppText variant="small" color={color} style={{ fontFamily: fonts.bodyBold }}>
        {label}
      </AppText>
    </View>
  );
}
