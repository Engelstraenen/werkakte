import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Image, View } from 'react-native';

import { pickPhoto, type PhotoSource } from './pickPhoto';
import { Button } from '@/components/Button';
import { de } from '@/i18n/de';
import { radius, spacing, useColors } from '@/theme';

const t = de.neu;

/** Zwei große Knöpfe (Kamera / Galerie), danach Vorschau mit „Anderes Foto“. */
export function PhotoCapture({ uri, onChange }: { uri?: string; onChange: (uri: string) => void }) {
  const colors = useColors();
  const [busy, setBusy] = useState<PhotoSource>();
  async function take(from: PhotoSource) {
    setBusy(from);
    try {
      const next = await pickPhoto(from);
      if (next) onChange(next);
    } finally {
      setBusy(undefined);
    }
  }
  if (uri)
    return (
      <View style={{ gap: spacing.sm }}>
        <Image
          source={{ uri }}
          accessibilityIgnoresInvertColors
          style={{ width: '100%', aspectRatio: 4 / 3, borderRadius: radius.md }}
          resizeMode="cover"
        />
        <Button title={t.anderesFoto} variant="secondary" onPress={() => take('kamera')} />
      </View>
    );
  return (
    <View style={{ gap: spacing.sm }}>
      <Button
        title={t.kamera}
        loading={busy === 'kamera'}
        icon={<Ionicons name="camera" size={22} color={colors.onPrimary} />}
        onPress={() => take('kamera')}
      />
      <Button
        title={t.galerie}
        variant="secondary"
        loading={busy === 'galerie'}
        icon={<Ionicons name="images-outline" size={22} color={colors.text} />}
        onPress={() => take('galerie')}
      />
    </View>
  );
}
