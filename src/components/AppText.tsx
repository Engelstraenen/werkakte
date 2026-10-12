import { Text, type TextProps } from 'react-native';

import { fontSize, useColors } from '@/theme';

type Props = TextProps & { variant?: 'body' | 'title' | 'heading'; muted?: boolean };

export function AppText({ variant = 'body', muted, style, ...rest }: Props) {
  const colors = useColors();
  return (
    <Text
      style={[
        {
          color: muted ? colors.textMuted : colors.text,
          fontSize: fontSize[variant],
          fontWeight: variant === 'body' ? '400' : '700',
        },
        style,
      ]}
      {...rest}
    />
  );
}
