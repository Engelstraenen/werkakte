import { Stack, router } from 'expo-router';
import { useState } from 'react';

import { Button } from '@/components/Button';
import { Chips } from '@/components/Chips';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { parseEuroToCents, useStamm } from '@/features/demo/stamm';
import type { Member } from '@/features/demo/types';
import { de } from '@/i18n/de';

const t = de.anlegen;

export default function MitarbeiterNeuScreen() {
  const addMember = useStamm((s) => s.addMember);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<Member['role']>('mitarbeiter');
  const [cost, setCost] = useState('40,00');
  const [errors, setErrors] = useState<{ name?: string; cost?: string }>({});

  function save() {
    const hourlyCostCents = parseEuroToCents(cost);
    const next = {
      name: name.trim() ? undefined : t.pflicht,
      cost: hourlyCostCents === null ? t.preisFalsch : undefined,
    };
    setErrors(next);
    if (next.name || hourlyCostCents === null) return;
    addMember({ name: name.trim(), phone: phone.trim(), role, hourlyCostCents });
    router.back();
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: t.mitarbeiter }} />
      <TextField label={t.name} value={name} onChangeText={setName} error={errors.name} autoFocus />
      <TextField label={t.telefon} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <Chips
        segmented
        options={[
          { value: 'mitarbeiter', label: de.mehr.mitarbeiterRolle },
          { value: 'inhaber', label: de.mehr.inhaber },
        ]}
        value={role}
        onChange={setRole}
      />
      <TextField
        label={t.stundenkosten}
        value={cost}
        onChangeText={setCost}
        keyboardType="decimal-pad"
        error={errors.cost}
      />
      <Button title={de.neu.anlegen} onPress={save} />
    </Screen>
  );
}
