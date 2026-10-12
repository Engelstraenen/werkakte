import { Stack } from 'expo-router';

import { Card } from '@/components/Card';
import { ListRow } from '@/components/ListRow';
import { Screen } from '@/components/Screen';
import { company } from '@/features/demo/data';
import { de } from '@/i18n/de';

export default function FirmaScreen() {
  const rows: [string, string][] = [
    [company.name, company.owner],
    [company.street, company.zipCity],
    [company.phone, company.email],
    [de.mehr.steuernummer, company.taxNumber],
    [de.mehr.iban, company.iban],
    [de.mehr.kleinunternehmer, company.kleinunternehmer ? de.mehr.ja : de.mehr.nein],
  ];
  return (
    <Screen>
      <Stack.Screen options={{ title: de.mehr.firma }} />
      <Card style={{ paddingVertical: 4 }}>
        {rows.map(([title, subtitle], i) => (
          <ListRow key={title} divider={i > 0} title={title} subtitle={subtitle} />
        ))}
      </Card>
    </Screen>
  );
}
