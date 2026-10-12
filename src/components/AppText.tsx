import { Text, type TextProps, type TextStyle } from 'react-native';

import { fonts, fontSize, useColors } from '@/theme';

type Variant = 'small' | 'body' | 'label' | 'title' | 'heading' | 'display' | 'mono';
type Props = TextProps & { variant?: Variant; muted?: boolean; color?: string };

// Schrift-Datei statt fontWeight: eigene Schriften brauchen je Stärke eine eigene Datei.
const styles: Record<Variant, TextStyle> = {
  small: { fontFamily: fonts.body, fontSize: fontSize.small },
  body: { fontFamily: fonts.body, fontSize: fontSize.body },
  label: { fontFamily: fonts.bodyBold, fontSize: fontSize.body },
  title: { fontFamily: fonts.heading, fontSize: fontSize.title },
  heading: { fontFamily: fonts.heading, fontSize: fontSize.heading, letterSpacing: -0.3 },
  display: { fontFamily: fonts.heading, fontSize: fontSize.display, letterSpacing: -0.5 },
  /** Technische Beschriftung wie auf einem Plan: Datum, Uhrzeit, Abschnitts-Labels. */
  mono: { fontFamily: fonts.mono, fontSize: 12.5, letterSpacing: 1, textTransform: 'uppercase' },
};

export function AppText({ variant = 'body', muted, color, style, ...rest }: Props) {
  const colors = useColors();
  return (
    <Text
      style={[
        styles[variant],
        { color: color ?? (muted || variant === 'mono' ? colors.textMuted : colors.text) },
        style,
      ]}
      {...rest}
    />
  );
}
