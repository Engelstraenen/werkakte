import Ionicons from '@expo/vector-icons/Ionicons';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Avatar } from '@/components/Avatar';
import { Card } from '@/components/Card';
import { memberById } from '@/features/demo/selectors';
import type { Note } from '@/features/demo/types';
import { de } from '@/i18n/de';
import { formatRelative } from '@/lib/date';
import { radius, soft, spacing, useColors } from '@/theme';

export function NoteList({ notes }: { notes: Note[] }) {
  const colors = useColors();
  return notes.map((n) => {
    const author = memberById(n.authorId);
    return (
      <Card key={n.id}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <Avatar name={author.name} size={32} />
          <AppText variant="label" style={{ flex: 1 }}>
            {author.name}
          </AppText>
          <AppText variant="small" muted>
            {formatRelative(n.createdAt)}
          </AppText>
        </View>
        {n.kind === 'sprache' ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.sm,
              backgroundColor: soft(colors.info),
              borderRadius: radius.sm,
              padding: spacing.sm,
            }}
          >
            <Ionicons name="play-circle" size={32} color={colors.info} />
            <AppText variant="label" color={colors.info}>
              {de.akte.sprachnotiz} · 0:{String(n.durationSec ?? 0).padStart(2, '0')}
            </AppText>
          </View>
        ) : null}
        <AppText>{n.text}</AppText>
      </Card>
    );
  });
}
