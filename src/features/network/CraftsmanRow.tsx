import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';

import { Avatar } from '@/components/Avatar';
import { ListRow } from '@/components/ListRow';
import { useColors } from '@/theme';

import { tradesText } from './trades';
import type { Craftsman } from './types';

/** Zeile im Verzeichnis. Globus = hat eine Webseite verlinkt. */
export function CraftsmanRow({
  craftsman: c,
  divider,
}: {
  craftsman: Craftsman;
  divider?: boolean;
}) {
  const colors = useColors();
  return (
    <ListRow
      divider={divider}
      title={c.company}
      subtitle={`${tradesText(c.trades)} · ${c.city}`}
      left={<Avatar name={c.company} />}
      right={
        c.website ? <Ionicons name="globe-outline" size={20} color={colors.primary} /> : undefined
      }
      onPress={() => router.push(`/netzwerk/handwerker/${c.id}`)}
    />
  );
}
