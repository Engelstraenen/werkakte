import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useFonts } from 'expo-font';

import { SessionProvider, useSession } from '@/features/auth/session';
import { fontFiles, useColors, useScheme } from '@/theme';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  const scheme = useScheme();
  const colors = useColors();
  const base = scheme === 'light' ? DefaultTheme : DarkTheme;
  // Navigations-Hintergründe in Bauplan-Farben, damit beim Wechseln nichts weiß aufblitzt.
  const navTheme = {
    ...base,
    colors: {
      ...base.colors,
      background: colors.background,
      card: colors.tabBar,
      text: colors.text,
      border: colors.border,
      primary: colors.primary,
    },
  };
  return (
    <ThemeProvider value={navTheme}>
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <StatusBar style={scheme === 'light' ? 'dark' : 'light'} />
          <RootStack />
        </SessionProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

function RootStack() {
  const { session, loading: sessionLoading, devMode } = useSession();
  // Schriften liegen in der App (offline), Laden dauert nur einen Moment.
  const [fontsLoaded, fontError] = useFonts(fontFiles);
  const loading = sessionLoading || (!fontsLoaded && !fontError);
  const signedIn = !!session || devMode;

  useEffect(() => {
    if (!loading) SplashScreen.hideAsync();
  }, [loading]);

  if (loading) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={signedIn}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
      <Stack.Protected guard={!signedIn}>
        <Stack.Screen name="login" />
      </Stack.Protected>
      <Stack.Screen name="login-callback" />
    </Stack>
  );
}
