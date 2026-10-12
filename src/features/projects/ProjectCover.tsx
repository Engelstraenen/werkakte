import Ionicons from '@expo/vector-icons/Ionicons';
import { Image, View } from 'react-native';

import { statusTone } from './status';
import { coverOf } from '@/features/demo/selectors';
import { useDemo } from '@/features/demo/store';
import type { Project } from '@/features/demo/types';
import { soft, spacing, useColors } from '@/theme';

/**
 * Titelbild oben in der Karte (randlos). Ohne Foto: farbige Fläche mit Symbol,
 * damit man ähnliche Projekte trotzdem auseinanderhält.
 */
export function ProjectCover({ project, height }: { project: Project; height: number }) {
  const colors = useColors();
  const cover = useDemo((s) => coverOf(project, s.media));
  const bleed = {
    marginHorizontal: -spacing.md,
    marginTop: -spacing.md,
    marginBottom: spacing.xs,
    height,
  };
  if (cover) {
    return (
      <Image
        source={cover.source}
        accessibilityLabel={cover.note}
        resizeMode="cover"
        style={[bleed, { width: undefined }]}
      />
    );
  }
  const tone = colors[statusTone[project.status]];
  return (
    <View
      style={[
        bleed,
        { backgroundColor: soft(tone), alignItems: 'center', justifyContent: 'center' },
      ]}
    >
      <Ionicons name="home-outline" size={height * 0.4} color={tone} />
    </View>
  );
}
