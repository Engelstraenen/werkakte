import { useColorScheme } from 'react-native';

// Hoher Kontrast für Sonnenlicht: Text mind. 7:1, Primärfarbe mind. 4.5:1 zum Hintergrund.
const light = {
  background: '#FFFFFF',
  surface: '#F0F0F0',
  text: '#111111',
  textMuted: '#4A4A4A',
  border: '#767676',
  primary: '#C2410C',
  onPrimary: '#FFFFFF',
  danger: '#B91C1C',
};

const dark: typeof light = {
  background: '#000000',
  surface: '#1C1C1E',
  text: '#FFFFFF',
  textMuted: '#C7C7C7',
  border: '#8E8E93',
  primary: '#FB923C',
  onPrimary: '#000000',
  danger: '#F87171',
};

export type Colors = typeof light;

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;
export const fontSize = { small: 14, body: 18, title: 24, heading: 30 } as const;
export const radius = { md: 12, full: 999 } as const;
/** Mindestgrößen für Touch-Ziele (pt), siehe CLAUDE.md §3. */
export const touch = { min: 48, main: 56 } as const;

export function useColors(): Colors {
  return useColorScheme() === 'dark' ? dark : light;
}
