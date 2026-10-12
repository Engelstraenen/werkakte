import { Stack } from 'expo-router';
import { useState } from 'react';

import { Avatar } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import { Card } from '@/components/Card';
import { ListRow } from '@/components/ListRow';
import { Screen } from '@/components/Screen';
import { SearchField } from '@/components/SearchField';
import { customers } from '@/features/demo/data';
import { de } from '@/i18n/de';
import { call } from '@/lib/links';

export default function KundenScreen() {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const list = customers.filter((c) => `${c.name} ${c.zipCity}`.toLowerCase().includes(q));
  return (
    <Screen>
      <Stack.Screen options={{ title: de.mehr.kunden }} />
      <SearchField value={query} onChange={setQuery} placeholder={de.projekte.suche} />
      <Card style={{ paddingVertical: 4 }}>
        {list.map((c, i) => (
          <ListRow
            key={c.id}
            divider={i > 0}
            title={c.name}
            subtitle={`${c.street}, ${c.zipCity}\n${c.phone}`}
            left={<Avatar name={c.name} />}
            right={
              <Badge
                label={c.type === 'privat' ? de.mehr.privat : de.mehr.gewerblich}
                tone={c.type === 'privat' ? 'neutral' : 'info'}
              />
            }
            onPress={() => call(c.phone)}
          />
        ))}
      </Card>
    </Screen>
  );
}
