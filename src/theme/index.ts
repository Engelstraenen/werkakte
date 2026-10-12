import { IBMPlexMono_500Medium } from '@expo-google-fonts/ibm-plex-mono';
import { IBMPlexSans_400Regular, IBMPlexSans_600SemiBold } from '@expo-google-fonts/ibm-plex-sans';
import {
  IBMPlexSansCondensed_600SemiBold,
  IBMPlexSansCondensed_700Bold,
} from '@expo-google-fonts/ibm-plex-sans-condensed';
import { useColorScheme } from 'react-native';

// Design „Bauplan“ (siehe docs/ENTSCHEIDUNGEN.md): Blaupausen-Blau mit Raster, Warngelb als Akzent.
// Dunkel = Original-Blaupause. Hell = Blaupausen-Papier für pralle Sonne.
// Kontrast: Text mind. 7:1, Primär- und Statusfarben mind. 4.5:1 zur Karte.

const dark = {
  // Hintergrund dunkler, Karten heller: klare Trennung auch bei Sonne/Displayhelligkeit niedrig.
  background: '#071430',
  grid: 'rgba(255, 255, 255, 0.035)',
  card: '#1C3B6C',
  surface: '#264B82',
  text: '#F1F5FC',
  textMuted: '#B7C7E3',
  border: '#4A6FAD',
  /** Hauptaktion (Buttons, aktiver Tab). */
  primary: '#F6C445',
  primarySoft: '#3A3520',
  onPrimary: '#0D1F3C',
  /** Warngelb: Plus-Button, Markierungen – in beiden Varianten gleich. */
  accent: '#F6C445',
  onAccent: '#0D1F3C',
  danger: '#FF8A78',
  success: '#5AD198',
  warning: '#F6C445',
  info: '#8DB4FF',
  neutral: '#A9BBDA',
  /** Text auf farbigen Status-Flächen (Grün/Rot/Gelb …). */
  onTone: '#0D1F3C',
  tabBar: '#0A1830',
  shadow: '0px 6px 16px rgba(0, 0, 0, 0.45)',
};

const light: typeof dark = {
  background: '#DDE6F3',
  grid: 'rgba(29, 78, 216, 0.06)',
  card: '#FFFFFF',
  surface: '#DCE6F5',
  text: '#0D1F3C',
  textMuted: '#3B5276',
  border: '#8FA5C9',
  primary: '#1D4ED8',
  primarySoft: '#DCE6FF',
  onPrimary: '#FFFFFF',
  accent: '#F6C445',
  onAccent: '#0D1F3C',
  danger: '#B42318',
  success: '#15803D',
  warning: '#9A5B00',
  info: '#1D4ED8',
  neutral: '#3B5276',
  onTone: '#FFFFFF',
  tabBar: '#FFFFFF',
  shadow: '0px 3px 10px rgba(13, 31, 60, 0.14)',
};

export type Colors = typeof dark;
export type Tone = 'primary' | 'danger' | 'success' | 'warning' | 'info' | 'neutral';

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;
export const fontSize = {
  small: 14,
  body: 17,
  title: 21,
  heading: 27,
  display: 33,
} as const;
/** Kanten eher eckig – technisch wie ein Plan. */
export const radius = { sm: 4, md: 8, lg: 12, full: 999 } as const;
/** Mindestgrößen für Touch-Ziele (pt), siehe CLAUDE.md §3. */
export const touch = { min: 48, main: 56 } as const;

/** Schriften: Fließtext normal breit (gut lesbar), Überschriften schmal, Beschriftungen Mono. */
export const fonts = {
  body: 'IBMPlexSans_400Regular',
  bodyBold: 'IBMPlexSans_600SemiBold',
  heading: 'IBMPlexSansCondensed_700Bold',
  headingMedium: 'IBMPlexSansCondensed_600SemiBold',
  mono: 'IBMPlexMono_500Medium',
} as const;

export const fontFiles = {
  IBMPlexSans_400Regular,
  IBMPlexSans_600SemiBold,
  IBMPlexSansCondensed_600SemiBold,
  IBMPlexSansCondensed_700Bold,
  IBMPlexMono_500Medium,
};

export function useColors(): Colors {
  return useColorScheme() === 'light' ? light : dark;
}

/** Hintergrund mit 15 % Deckkraft für Badges und Icon-Kreise. */
export const soft = (hex: string) => `${hex}26`;
