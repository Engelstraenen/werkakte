import { Stack, router } from 'expo-router';
import { useState } from 'react';

import { Button } from '@/components/Button';
import { Chips } from '@/components/Chips';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { useStamm } from '@/features/demo/stamm';
import type { Supplier } from '@/features/demo/types';
import { de } from '@/i18n/de';

const t = de.anlegen;

export default function LieferantNeuScreen() {
  const addSupplier = useStamm((s) => s.addSupplier);
  const [name, setName] = useState('');
  const [kind, setKind] = useState<Supplier['kind']>('grosshandel');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string>();

  function save() {
    if (!name.trim()) return setError(t.pflicht);
    addSupplier({ name: name.trim(), kind, phone: phone.trim() || undefined });
    router.back();
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: t.lieferant }} />
      <TextField label={t.name} value={name} onChangeText={setName} error={error} autoFocus />
      <Chips
        segmented
        options={[
          { value: 'grosshandel', label: t.grosshandel },
          { value: 'baumarkt', label: t.baumarkt },
          { value: 'online', label: t.online },
        ]}
        value={kind}
        onChange={setKind}
      />
      <TextField label={t.telefon} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <Button title={de.neu.anlegen} onPress={save} />
    </Screen>
  );
}
