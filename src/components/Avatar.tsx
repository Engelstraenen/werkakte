import { View } from 'react-native';

import { AppText } from './AppText';
import { useColors } from '@/theme';

const palette = ['#C2410C', '#1D4ED8', '#15803D', '#7C3AED', '#B45309', '#0E7490'];

const initials = (name: string) =>
  name
    .replace(/^(Dr\.|Familie)\s+/, '')
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

/** Kreis mit Initialen; Farbe ist pro Name immer gleich. */
export function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  const colors = useColors();
  const hash = [...name].reduce((h, c) => h + c.charCodeAt(0), 0);
  return (
    <View
      accessibilityLabel={name}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: palette[hash % palette.length],
        borderWidth: 2,
        borderColor: colors.card,
      }}
    >
      <AppText color="#FFFFFF" style={{ fontWeight: '800', fontSize: size * 0.38 }}>
        {initials(name)}
      </AppText>
    </View>
  );
}

/** Überlappende Avatare, z. B. zugewiesene Mitarbeiter. */
export function AvatarStack({ names, size = 30 }: { names: string[]; size?: number }) {
  return (
    <View style={{ flexDirection: 'row' }}>
      {names.map((n, i) => (
        <View key={n} style={{ marginLeft: i === 0 ? 0 : -size / 3 }}>
          <Avatar name={n} size={size} />
        </View>
      ))}
    </View>
  );
}
