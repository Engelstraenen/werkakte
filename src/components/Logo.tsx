import { View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { AppText } from './AppText';
import { de } from '@/i18n/de';
import { fonts, spacing, useColors } from '@/theme';

/** App-Icon: aufgeklappter Zollstock als „W“ auf Blaupause. */
export function LogoMark({ size = 56 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 72 72" accessibilityLabel={de.app.name}>
      <Rect
        x="1"
        y="1"
        width="70"
        height="70"
        rx="14"
        fill="#0D1F3C"
        stroke="#2B4A7E"
        strokeWidth={2}
      />
      <Path
        d="M0 18 H72 M0 36 H72 M0 54 H72 M18 0 V72 M36 0 V72 M54 0 V72"
        stroke="#FFFFFF"
        strokeOpacity={0.08}
        strokeWidth={1}
      />
      <Path
        d="M14 22 L26 46 L38 22 L50 46 L58 30"
        fill="none"
        stroke="#F6C445"
        strokeWidth={7}
        strokeLinejoin="round"
        strokeLinecap="square"
      />
      <Circle cx="26" cy="46" r="2.2" fill="#0D1F3C" />
      <Circle cx="38" cy="22" r="2.2" fill="#0D1F3C" />
      <Circle cx="50" cy="46" r="2.2" fill="#0D1F3C" />
    </Svg>
  );
}

/** Logo + Schriftzug „WERKAKTE“ mit gelbem Strich. */
export function Logo({ size = 48 }: { size?: number }) {
  const colors = useColors();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm + 4 }}>
      <LogoMark size={size} />
      <View style={{ gap: 4 }}>
        <AppText style={{ fontFamily: fonts.heading, fontSize: size * 0.62, letterSpacing: 3 }}>
          {de.app.name.toUpperCase()}
        </AppText>
        <View style={{ width: size * 0.8, height: 4, backgroundColor: colors.accent }} />
      </View>
    </View>
  );
}
