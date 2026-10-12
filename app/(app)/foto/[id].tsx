import { router, useLocalSearchParams } from 'expo-router';
import { Image, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { coverOf, memberById } from '@/features/demo/selectors';
import { useDemo } from '@/features/demo/store';
import { tagTone } from '@/features/projects/status';
import { de } from '@/i18n/de';
import { formatDate, formatTime } from '@/lib/date';
import { radius, spacing } from '@/theme';

export default function FotoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const photo = useDemo((s) => s.media.find((m) => m.id === id));
  const project = useDemo((s) => s.projects.find((p) => p.id === photo?.projectId));
  const media = useDemo((s) => s.media);
  const setCover = useDemo((s) => s.setCover);
  if (!photo || !project) return <EmptyState icon="image-outline" text={de.akte.keineFotos} />;

  return (
    <Screen>
      <Image
        source={photo.source}
        accessibilityLabel={photo.note}
        style={{ width: '100%', aspectRatio: 4 / 3, borderRadius: radius.md }}
        resizeMode="cover"
      />
      <Badge label={de.tag[photo.tag]} tone={tagTone[photo.tag]} />
      <AppText variant="title">{photo.note}</AppText>
      <View style={{ gap: 2 }}>
        <AppText muted>
          {memberById(photo.authorId).name} · {formatDate(photo.takenAt)},{' '}
          {formatTime(photo.takenAt)} Uhr
        </AppText>
        <AppText muted>{project.title}</AppText>
      </View>
      {coverOf(project, media)?.id === photo.id ? (
        <AppText variant="label" muted>
          ★ {de.akte.istTitelbild}
        </AppText>
      ) : (
        <Button title={de.akte.alsTitelbild} onPress={() => setCover(project.id, photo.id)} />
      )}
      <View style={{ marginTop: spacing.sm }}>
        <Button
          title={de.schnellaktion.schliessen}
          variant="secondary"
          onPress={() => router.back()}
        />
      </View>
    </Screen>
  );
}
