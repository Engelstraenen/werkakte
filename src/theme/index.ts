import { IBMPlexMono_500Medium } from '@expo-google-fonts/ibm-plex-mono';
import { IBMPlexSans_400Regular, IBMPlexSans_600SemiBold } from '@expo-google-fonts/ibm-plex-sans';
import {
  IBMPlexSansCondensed_600SemiBold,
  IBMPlexSansCondensed_700Bold,
} from '@expo-google-fonts/ibm-plex-sans-condensed';
import * as SecureStore from 'expo-secure-store';
import { Platform, useColorScheme } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// Design „Bauplan Ruhig“ (siehe docs/ENTSCHEIDUNGEN.md): ruhige Flächen, eine Aktionsfarbe (Blau),
// Signalfarben nur für Status (immer mit Wort). Kontrast: Text mind. 7:1, Aktionen mind. 4.5:1.

// Hell (Standard): leicht getöntes Weiß, weiße Karten, zarte Ränder, Raster kaum sichtbar.
const light = {
  background: '#F4F7FB',
  grid: 'rgba(59, 130, 246, 0.045)',
  card: '#FFFFFF',
  surface: '#EDF2F9',
  text: '#0F1F3D',
  textMuted: '#46597A',
  border: '#D3DDEB',
  /** Hauptaktion (Buttons, aktiver Tab). */
  primary: '#1D4ED8',
  primarySoft: '#E3ECFF',
  onPrimary: '#FFFFFF',
  /** Plus-Button, Abschnitts-Balken. */
  accent: '#1D4ED8',
  onAccent: '#FFFFFF',
  danger: '#B42318',
  success: '#15803D',
  warning: '#9A5B00',
  info: '#1D4ED8',
  neutral: '#46597A',
  /** Text auf farbigen Status-Flächen (Grün/Rot/Gelb …). */
  onTone: '#FFFFFF',
  tabBar: '#FFFFFF',
  shadow: '0px 1px 2px rgba(15, 31, 61, 0.06), 0px 4px 14px rgba(15, 31, 61, 0.07)',
};

// Dunkel: dieselbe Ruhe – dunkles Blaugrau statt Schwarz, gebrochenes Weiß statt Reinweiß,
// gedämpfte Farben (blenden nicht), Karten heller als der Grund.
const dark: typeof light = {
  background: '#0E1525',
  grid: 'rgba(148, 163, 184, 0.035)',
  card: '#172036',
  surface: '#1F2A44',
  text: '#E7ECF5',
  textMuted: '#A7B3C8',
  border: '#2B3857',
  primary: '#7AA2FF',
  primarySoft: '#1E2D52',
  onPrimary: '#0E1525',
  accent: '#7AA2FF',
  onAccent: '#0E1525',
  danger: '#F2877A',
  success: '#5CC98C',
  warning: '#E3B341',
  info: '#7AA2FF',
  neutral: '#A7B3C8',
  onTone: '#0E1525',
  tabBar: '#121A2C',
  shadow: '0px 4px 14px rgba(0, 0, 0, 0.35)',
};

export type Colors = typeof light;
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

export type Appearance = 'hell' | 'dunkel' | 'automatisch';

const palettes = { hell: light, dunkel: dark } as const;

// Web: localStorage, Handy: SecureStore – Darstellung bleibt nach Neustart erhalten.
const appearanceStorage = createJSONStorage(() =>
  Platform.OS === 'web'
    ? globalThis.localStorage
    : {
        getItem: (k: string) => SecureStore.getItemAsync(k),
        setItem: (k: string, v: string) => SecureStore.setItemAsync(k, v),
        removeItem: (k: string) => SecureStore.deleteItemAsync(k),
      },
);

type AppearanceState = { mode: Appearance; setMode: (mode: Appearance) => void };

/** Darstellung (Mehr › Darstellung). Standard: hell. */
export const useAppearance = create<AppearanceState>()(
  persist((set) => ({ mode: 'hell', setMode: (mode) => set({ mode }) }), {
    name: 'appearance',
    storage: appearanceStorage,
    // v0 kannte noch „ruhig“ (jetzt = hell) und „hell“ mit blauen Linien.
    version: 1,
    migrate: (old) => {
      const mode = (old as { mode?: string } | undefined)?.mode;
      return {
        mode: mode === 'dunkel' || mode === 'automatisch' ? mode : 'hell',
      } as AppearanceState;
    },
  }),
);

function useResolved(): keyof typeof palettes {
  const system = useColorScheme();
  const mode = useAppearance((s) => s.mode);
  if (mode === 'automatisch') return system === 'dark' ? 'dunkel' : 'hell';
  return mode;
}

export function useScheme(): 'light' | 'dark' {
  return useResolved() === 'dunkel' ? 'dark' : 'light';
}

export function useColors(): Colors {
  return palettes[useResolved()];
}

/** Hintergrund mit 15 % Deckkraft für Badges und Icon-Kreise. */
export const soft = (hex: string) => `${hex}26`;
