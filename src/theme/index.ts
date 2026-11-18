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

// Design „Signal“ (18.11.2026, siehe docs/ENTSCHEIDUNGEN.md): gleiche Farbwelt wie die Webseiten von
// PROJEKT EX – Schwarz, Weiß, EINE Aktionsfarbe Signal-Orange. Signalfarben nur für Status (immer mit Wort).
// Kontrast geprüft: Text mind. 7:1, Aktionen mind. 4.5:1 (sonnenlesbar auf der Baustelle).

// Dunkel (Standard): fast Schwarz, Karten etwas heller, Signal-Orange #FF5B1F.
// Weiß auf #FF5B1F hätte nur 3,1:1 – deshalb schwarze Schrift auf Orange (6,2:1).
const dark = {
  background: '#0E0E0E',
  grid: 'rgba(255, 255, 255, 0.03)',
  card: '#1A1A1A',
  surface: '#232323',
  text: '#FFFFFF',
  textMuted: '#A3A3A3',
  border: '#2E2E2E',
  /** Hauptaktion (Buttons, aktiver Tab). */
  primary: '#FF5B1F',
  primarySoft: '#3A1D12',
  onPrimary: '#0E0E0E',
  /** Plus-Button, Abschnitts-Balken. */
  accent: '#FF5B1F',
  onAccent: '#0E0E0E',
  danger: '#F97066',
  success: '#4ADE80',
  warning: '#FACC15',
  info: '#7EC8E3',
  neutral: '#A3A3A3',
  /** Text auf farbigen Status-Flächen (Grün/Rot/Gelb …). */
  onTone: '#0E0E0E',
  tabBar: '#121212',
  shadow: '0px 4px 14px rgba(0, 0, 0, 0.45)',
};

// Hell: warmes Papier-Weiß wie die hellen Abschnitte der Webseite, weiße Karten.
// Orange etwas dunkler (#C2410C), damit weiße Schrift und Orange-Text auf Weiß 5,2:1 erreichen.
const light: typeof dark = {
  background: '#F2EFEA',
  grid: 'rgba(14, 14, 14, 0.03)',
  card: '#FFFFFF',
  surface: '#E9E5DE',
  text: '#0E0E0E',
  textMuted: '#5C5750',
  border: '#DCD7CF',
  primary: '#C2410C',
  primarySoft: '#FBE3D8',
  onPrimary: '#FFFFFF',
  accent: '#C2410C',
  onAccent: '#FFFFFF',
  danger: '#B42318',
  success: '#15803D',
  warning: '#9A5B00',
  info: '#0E7490',
  neutral: '#5C5750',
  onTone: '#FFFFFF',
  tabBar: '#FFFFFF',
  shadow: '0px 1px 2px rgba(14, 14, 14, 0.06), 0px 4px 14px rgba(14, 14, 14, 0.07)',
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

/** Darstellung (Mehr › Darstellung). Standard: dunkel (Design „Signal“). */
export const useAppearance = create<AppearanceState>()(
  persist((set) => ({ mode: 'dunkel', setMode: (mode) => set({ mode }) }), {
    name: 'appearance',
    storage: appearanceStorage,
    // v2 (18.11.2026): neues Design „Signal“ – alle starten einmal in Dunkel, „automatisch“ bleibt erhalten.
    version: 2,
    migrate: (old) => {
      const mode = (old as { mode?: string } | undefined)?.mode;
      return { mode: mode === 'automatisch' ? 'automatisch' : 'dunkel' } as AppearanceState;
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
