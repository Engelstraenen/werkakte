import { Stack } from 'expo-router';

import { useColors } from '@/theme';

/** Alle Screens nach der Anmeldung. Detail-Screens bekommen eine Kopfleiste mit Zurück-Pfeil. */
export default function AppLayout() {
  const colors = useColors();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.primary,
        headerTitleStyle: { color: colors.text, fontWeight: '700', fontSize: 18 },
        headerShadowVisible: false,
        headerBackButtonDisplayMode: 'minimal',
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="neu/[art]" options={{ presentation: 'modal' }} />
      <Stack.Screen name="foto/[id]" options={{ presentation: 'modal', title: '' }} />
    </Stack>
  );
}
