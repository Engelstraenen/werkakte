import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Image, Pressable, View } from 'react-native';

import { tagTone } from './status';
import { AppText } from '@/components/AppText';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { isOpenProblem, memberById } from '@/features/demo/selectors';
import { useDemo } from '@/features/demo/store';
import type { Media, Note } from '@/features/demo/types';
import { de } from '@/i18n/de';
import { formatDate, formatDayShort, formatTime } from '@/lib/date';
import { radius, spacing, useColors } from '@/theme';

type Entry = { at: string; media?: Media; note?: Note };

/** Doku als Zeitleiste: Fotos und Notizen nach Tag, neueste oben. Offene Probleme rot. */
export function DocTimeline({ projectId }: { projectId: string }) {
  const colors = useColors();
  const { media, notes, resolveProblem } = useDemo();
  const entries: Entry[] = [
    ...media.filter((m) => m.projectId === projectId).map((m) => ({ at: m.takenAt, media: m })),
    ...notes.filter((n) => n.projectId === projectId).map((n) => ({ at: n.createdAt, note: n })),
  ].sort((a, b) => b.at.localeCompare(a.at));

  if (!entries.length) return <EmptyState icon="images-outline" text={de.akte.keineDoku} />;

  const days = new Map<string, Entry[]>();
  for (const e of entries) {
    const key = new Date(e.at).toDateString();
    days.set(key, [...(days.get(key) ?? []), e]);
  }

  return [...days.values()].map((dayEntries) => (
    <View key={dayEntries[0]!.at} style={{ gap: spacing.sm }}>
      <AppText variant="mono">{formatDayShort(new Date(dayEntries[0]!.at))}</AppText>
      {dayEntries.map(({ at, media: m, note: n }) => {
        const author = memberById((m ?? n)!.authorId).name;
        const open = m ? isOpenProblem(m) : false;
        return (
          <Card key={(m ?? n)!.id} accent={open ? colors.danger : undefined}>
            {m ? (
              <Pressable
                accessibilityRole="imagebutton"
                accessibilityLabel={m.note}
                onPress={() => router.push({ pathname: '/foto/[id]', params: { id: m.id } })}
                style={{ borderRadius: radius.sm, overflow: 'hidden', aspectRatio: 4 / 3 }}
              >
                <Image
                  source={m.source}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              </Pressable>
            ) : null}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              {m ? (
                <Badge
                  label={open ? `! ${de.akte.problem}` : de.tag[m.tag]}
                  tone={tagTone[m.tag]}
                />
              ) : (
                <Ionicons
                  name={n!.kind === 'sprache' ? 'mic' : 'create-outline'}
                  size={20}
                  color={colors.textMuted}
                />
              )}
              <AppText variant="small" muted style={{ flex: 1, textAlign: 'right' }}>
                {author} · {formatTime(at)}
              </AppText>
            </View>
            <AppText>{m ? m.note : n!.text}</AppText>
            {open ? (
              <Button
                title={de.akte.erledigt}
                variant="secondary"
                onPress={() => resolveProblem(m!.id)}
              />
            ) : m?.resolvedAt ? (
              <AppText variant="small" color={colors.success}>
                ✓ {de.akte.erledigtAm(formatDate(m.resolvedAt))}
              </AppText>
            ) : null}
          </Card>
        );
      })}
    </View>
  ));
}
