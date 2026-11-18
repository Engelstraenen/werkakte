import { Stack, router } from 'expo-router';

import { AddButton } from '@/components/AddButton';
import { Avatar } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import { Card } from '@/components/Card';
import { ListRow } from '@/components/ListRow';
import { Screen } from '@/components/Screen';
import { useStamm } from '@/features/demo/stamm';
import { de } from '@/i18n/de';
import { call } from '@/lib/links';

export default function MitarbeiterScreen() {
  const members = useStamm((s) => s.members);
  return (
    <Screen>
      <Stack.Screen
        options={{
          title: de.mehr.mitarbeiter,
          headerRight: () => (
            <AddButton
              label={de.anlegen.mitarbeiter}
              onPress={() => router.push('/mitarbeiter-neu')}
            />
          ),
        }}
      />
      <Card style={{ paddingVertical: 4 }}>
        {members.map((m, i) => (
          <ListRow
            key={m.id}
            divider={i > 0}
            title={m.name}
            subtitle={m.phone}
            left={<Avatar name={m.name} />}
            right={
              <Badge
                label={m.role === 'inhaber' ? de.mehr.inhaber : de.mehr.mitarbeiterRolle}
                tone={m.role === 'inhaber' ? 'primary' : 'neutral'}
              />
            }
            onPress={() => call(m.phone)}
          />
        ))}
      </Card>
    </Screen>
  );
}
