import { router } from 'expo-router';
import { Modal, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { IconCircle, type IconName } from '@/components/IconCircle';
import { useDemo } from '@/features/demo/store';
import { de } from '@/i18n/de';
import { radius, spacing, useColors, type Tone } from '@/theme';

const t = de.schnellaktion;
type Art = 'foto' | 'notiz' | 'angebot' | 'projekt' | 'zeit';
const tiles: { art: Art; label: string; icon: IconName; tone: Tone }[] = [
  { art: 'foto', label: t.foto, icon: 'camera', tone: 'primary' },
  { art: 'notiz', label: t.notiz, icon: 'mic', tone: 'info' },
  { art: 'angebot', label: t.angebot, icon: 'document-text', tone: 'warning' },
  { art: 'projekt', label: t.projekt, icon: 'folder-open', tone: 'success' },
];

export function QuickActionSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const timer = useDemo((s) => s.timer);
  const stopTimer = useDemo((s) => s.stopTimer);
  const running = useDemo((s) => s.projects.find((p) => p.id === s.timer?.projectId));

  const open = (art: Art) => {
    onClose();
    router.push({ pathname: '/neu/[art]', params: { art } });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        accessibilityLabel={t.schliessen}
        onPress={onClose}
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' }}
      />
      <View
        style={{
          backgroundColor: colors.background,
          borderTopLeftRadius: radius.lg,
          borderTopRightRadius: radius.lg,
          padding: spacing.md,
          paddingBottom: spacing.md + insets.bottom,
          gap: spacing.md,
        }}
      >
        <View
          style={{
            alignSelf: 'center',
            width: 40,
            height: 5,
            borderRadius: 3,
            backgroundColor: colors.border,
          }}
        />
        <AppText variant="heading">{t.titel}</AppText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {tiles.map((tile) => (
            <Pressable
              key={tile.art}
              accessibilityRole="button"
              onPress={() => open(tile.art)}
              style={({ pressed }) => ({
                width: '48.5%',
                minHeight: 112,
                padding: spacing.md,
                borderRadius: radius.md,
                backgroundColor: colors.card,
                boxShadow: colors.shadow,
                justifyContent: 'space-between',
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <IconCircle name={tile.icon} tone={tile.tone} size={48} />
              <AppText variant="title">{tile.label}</AppText>
            </Pressable>
          ))}
        </View>
        <Button
          title={timer && running ? `${t.zeitStoppen} · ${running.title}` : t.zeit}
          onPress={() => (timer ? (stopTimer(), onClose()) : open('zeit'))}
        />
        <Button title={t.schliessen} variant="secondary" onPress={onClose} />
      </View>
    </Modal>
  );
}
