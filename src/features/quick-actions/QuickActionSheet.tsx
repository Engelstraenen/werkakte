import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Alert, Modal, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { de } from '@/i18n/de';
import { radius, spacing, touch, useColors } from '@/theme';

const t = de.schnellaktion;
const actions: { label: string; icon: ComponentProps<typeof Ionicons>['name'] }[] = [
  { label: t.foto, icon: 'camera' },
  { label: t.notiz, icon: 'mic' },
  { label: t.angebot, icon: 'document-text' },
  { label: t.projekt, icon: 'folder-open' },
  { label: t.zeit, icon: 'timer' },
];

export function QuickActionSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        accessibilityLabel={t.schliessen}
        onPress={onClose}
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
      />
      <View
        style={{
          backgroundColor: colors.background,
          borderTopLeftRadius: radius.md * 2,
          borderTopRightRadius: radius.md * 2,
          padding: spacing.md,
          paddingBottom: spacing.md + insets.bottom,
          gap: spacing.sm,
        }}
      >
        <AppText variant="title" style={{ marginBottom: spacing.sm }}>
          {t.titel}
        </AppText>
        {actions.map((a) => (
          <Pressable
            key={a.label}
            accessibilityRole="button"
            // Funktionen kommen in späteren Phasen.
            onPress={() => Alert.alert(a.label, t.bald)}
            style={({ pressed }) => ({
              minHeight: touch.main,
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.md,
              paddingHorizontal: spacing.md,
              borderRadius: radius.md,
              backgroundColor: colors.surface,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Ionicons name={a.icon} size={28} color={colors.primary} />
            <AppText style={{ fontWeight: '600' }}>{a.label}</AppText>
          </Pressable>
        ))}
        <Button title={t.schliessen} variant="secondary" onPress={onClose} />
      </View>
    </Modal>
  );
}
