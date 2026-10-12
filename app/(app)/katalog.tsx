import { Stack } from 'expo-router';
import { useState } from 'react';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { Chips } from '@/components/Chips';
import { IconCircle } from '@/components/IconCircle';
import { ListRow } from '@/components/ListRow';
import { Screen } from '@/components/Screen';
import { catalog } from '@/features/demo/data';
import { de } from '@/i18n/de';
import { formatEuro } from '@/lib/money';

type Filter = 'alle' | 'arbeit' | 'material';

export default function KatalogScreen() {
  const [filter, setFilter] = useState<Filter>('alle');
  const list = catalog.filter((c) => filter === 'alle' || c.type === filter);
  return (
    <Screen>
      <Stack.Screen options={{ title: de.mehr.katalog }} />
      <Chips
        segmented
        options={[
          { value: 'alle', label: de.projekte.alle },
          { value: 'arbeit', label: de.mehr.arbeit },
          { value: 'material', label: de.mehr.material },
        ]}
        value={filter}
        onChange={setFilter}
      />
      <Card style={{ paddingVertical: 4 }}>
        {list.map((c, i) => (
          <ListRow
            key={c.id}
            divider={i > 0}
            title={c.name}
            subtitle={`${c.type === 'arbeit' ? de.mehr.arbeit : de.mehr.material} · ${c.vatRate} % MwSt`}
            left={
              <IconCircle
                name={c.type === 'arbeit' ? 'hammer' : 'cube'}
                tone={c.type === 'arbeit' ? 'primary' : 'info'}
                size={40}
              />
            }
            right={
              <AppText variant="label">
                {formatEuro(c.unitPriceCents)} / {c.unit}
              </AppText>
            }
          />
        ))}
      </Card>
    </Screen>
  );
}
