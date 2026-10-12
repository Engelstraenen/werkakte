import Ionicons from '@expo/vector-icons/Ionicons';
import { Image, View, type ViewStyle } from 'react-native';

import { statusTone } from './status';
import { coverOf } from '@/features/demo/selectors';
import { useDemo } from '@/features/demo/store';
import type { Project } from '@/features/demo/types';
import { radius, soft, spacing, useColors } from '@/theme';

/** Titelbild oder – ohne Foto – farbige Fläche mit Haus-Symbol in Statusfarbe. */
function Cover({
  project,
  style,
  iconSize,
}: {
  project: Project;
  style: ViewStyle;
  iconSize: number;
}) {
  const colors = useColors();
  const cover = useDemo((s) => coverOf(project, s.media));
  if (cover) {
    // Rahmen bestimmt die Größe, Bild füllt ihn (aspectRatio direkt am Image greift im Web nicht).
    return (
      <View style={[style, { overflow: 'hidden' }]}>
        <Image
          source={cover.source}
          accessibilityLabel={cover.note}
          resizeMode="cover"
          style={{ width: '100%', height: '100%' }}
        />
      </View>
    );
  }
  const tone = colors[statusTone[project.status]];
  return (
    <View
      style={[
        style,
        { backgroundColor: soft(tone), alignItems: 'center', justifyContent: 'center' },
      ]}
    >
      <Ionicons name="home-outline" size={iconSize} color={tone} />
    </View>
  );
}

/** Fast quadratisches Bild rechts in der Projektliste. */
export function ProjectThumb({ project, size }: { project: Project; size: number }) {
  return (
    <Cover
      project={project}
      iconSize={size * 0.4}
      style={{ width: size, height: size * 1.05, borderRadius: radius.md, overflow: 'hidden' }}
    />
  );
}

/** Großes Bild oben in der Projektakte (4:3, randlos), damit wenig abgeschnitten wird. */
export function ProjectHero({ project }: { project: Project }) {
  return (
    <View
      style={{ marginHorizontal: -spacing.md, marginTop: -spacing.md, marginBottom: spacing.xs }}
    >
      <Cover project={project} iconSize={72} style={{ width: '100%', aspectRatio: 4 / 3 }} />
    </View>
  );
}
