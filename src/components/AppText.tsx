import { Text, type TextProps } from 'react-native';

import { fontSize, useColors } from '@/theme';

type Variant = 'small' | 'body' | 'label' | 'title' | 'heading' | 'display';
type Props = TextProps & { variant?: Variant; muted?: boolean; color?: string };

const styles: Record<Variant, { fontSize: number; fontWeight: '400' | '600' | '700' | '800' }> = {
  small: { fontSize: fontSize.small, fontWeight: '400' },
  body: { fontSize: fontSize.body, fontWeight: '400' },
  label: { fontSize: fontSize.body, fontWeight: '600' },
  title: { fontSize: fontSize.title, fontWeight: '700' },
  heading: { fontSize: fontSize.heading, fontWeight: '800' },
  display: { fontSize: fontSize.display, fontWeight: '800' },
};

export function AppText({ variant = 'body', muted, color, style, ...rest }: Props) {
  const colors = useColors();
  return (
    <Text
      style={[
        styles[variant],
        { color: color ?? (muted ? colors.textMuted : colors.text) },
        variant === 'display' || variant === 'heading' ? { letterSpacing: -0.5 } : null,
        style,
      ]}
      {...rest}
    />
  );
}
