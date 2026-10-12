import Ionicons from '@expo/vector-icons/Ionicons';
import Tabs from 'expo-router/js-tabs';
import { useState, type ComponentProps } from 'react';
import { Pressable, View, type ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { QuickActionSheet } from '@/features/quick-actions/QuickActionSheet';
import { de } from '@/i18n/de';
import { fonts, spacing, touch, useColors } from '@/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];
const icon = (name: IconName) =>
  function TabIcon({ color, size }: { color: ColorValue; size: number }) {
    return <Ionicons name={name} color={color} size={size} />;
  };

export default function TabLayout() {
  const colors = useColors();
  const [sheetOpen, setSheetOpen] = useState(false);
  const insets = useSafeAreaInsets();

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: {
            backgroundColor: colors.tabBar,
            borderTopColor: colors.border,
            // Platz für den 56-pt-Mittelbutton und große Touch-Ziele.
            height: 68 + insets.bottom,
            paddingTop: spacing.xs,
            paddingBottom: spacing.xs + insets.bottom,
          },
          tabBarLabelStyle: { fontSize: 13, fontFamily: fonts.headingMedium },
          headerShown: false,
        }}
      >
        <Tabs.Screen name="index" options={{ title: de.tabs.heute, tabBarIcon: icon('today') }} />
        <Tabs.Screen
          name="projekte"
          options={{ title: de.tabs.projekte, tabBarIcon: icon('folder-open') }}
        />
        <Tabs.Screen
          name="neu"
          options={{
            title: de.tabs.neu,
            // Kein eigener Screen: der Mittelbutton öffnet nur die Schnellaktionen.
            tabBarButton: () => (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={de.schnellaktion.titel}
                onPress={() => setSheetOpen(true)}
                style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
              >
                {/* Gelbe Raute wie ein Warnschild – das Bauplan-Markenzeichen. */}
                <View
                  style={{
                    width: touch.main - 6,
                    height: touch.main - 6,
                    borderRadius: 10,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: colors.accent,
                    transform: [{ rotate: '45deg' }],
                  }}
                >
                  <View style={{ transform: [{ rotate: '-45deg' }] }}>
                    <Ionicons name="add" size={34} color={colors.onAccent} />
                  </View>
                </View>
              </Pressable>
            ),
          }}
        />
        <Tabs.Screen
          name="kalender"
          options={{ title: de.tabs.kalender, tabBarIcon: icon('calendar') }}
        />
        <Tabs.Screen name="mehr" options={{ title: de.tabs.mehr, tabBarIcon: icon('menu') }} />
      </Tabs>
      <QuickActionSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} />
    </>
  );
}
