import { useColorScheme } from 'react-native';

// Hoher Kontrast für Sonnenlicht: Text mind. 7:1, Primär- und Statusfarben mind. 4.5:1 zur Karte.
const light = {
  background: '#F2F3F5',
  card: '#FFFFFF',
  surface: '#E9EBEF',
  text: '#0F172A',
  textMuted: '#475569',
  border: '#CBD5E1',
  primary: '#C2410C',
  primarySoft: '#FFEDD5',
  onPrimary: '#FFFFFF',
  danger: '#B91C1C',
  success: '#15803D',
  warning: '#B45309',
  info: '#1D4ED8',
  neutral: '#475569',
  shadow: '0px 2px 10px rgba(15, 23, 42, 0.08)',
};

const dark: typeof light = {
  background: '#000000',
  card: '#1C1C1F',
  surface: '#2A2A2E',
  text: '#F8FAFC',
  textMuted: '#CBD5E1',
  border: '#3F3F46',
  primary: '#FB923C',
  primarySoft: '#431407',
  onPrimary: '#000000',
  danger: '#F87171',
  success: '#4ADE80',
  warning: '#FBBF24',
  info: '#60A5FA',
  neutral: '#A1A1AA',
  shadow: '0px 0px 0px rgba(0, 0, 0, 0)',
};

export type Colors = typeof light;
export type Tone = 'primary' | 'danger' | 'success' | 'warning' | 'info' | 'neutral';

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;
export const fontSize = {
  small: 14,
  body: 17,
  title: 20,
  heading: 26,
  display: 32,
} as const;
export const radius = { sm: 8, md: 14, lg: 20, full: 999 } as const;
/** Mindestgrößen für Touch-Ziele (pt), siehe CLAUDE.md §3. */
export const touch = { min: 48, main: 56 } as const;

export function useColors(): Colors {
  return useColorScheme() === 'dark' ? dark : light;
}

/** Hintergrund mit 12 % Deckkraft für Badges und Icon-Kreise. */
export const soft = (hex: string) => `${hex}1F`;
