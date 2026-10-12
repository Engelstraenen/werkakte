import { router } from 'expo-router';
import { Image, Pressable, View } from 'react-native';

import { tagTone } from './status';
import { AppText } from '@/components/AppText';
import type { Media } from '@/features/demo/types';
import { de } from '@/i18n/de';
import { radius, spacing, useColors } from '@/theme';

export function PhotoGrid({ media }: { media: Media[] }) {
  const colors = useColors();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
      {media.map((m) => (
        <Pressable
          key={m.id}
          accessibilityRole="imagebutton"
          accessibilityLabel={`${de.tag[m.tag]}: ${m.note}`}
          onPress={() => router.push({ pathname: '/foto/[id]', params: { id: m.id } })}
          style={{ width: '48.5%', aspectRatio: 1, borderRadius: radius.md, overflow: 'hidden' }}
        >
          <Image source={m.source} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          <View
            style={{
              position: 'absolute',
              left: spacing.sm,
              top: spacing.sm,
              backgroundColor: colors[tagTone[m.tag]],
              borderRadius: radius.full,
              paddingHorizontal: 10,
              paddingVertical: 3,
            }}
          >
            <AppText variant="small" color="#FFFFFF" style={{ fontWeight: '800' }}>
              {de.tag[m.tag]}
            </AppText>
          </View>
        </Pressable>
      ))}
    </View>
  );
}
