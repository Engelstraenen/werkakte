import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Chips } from '@/components/Chips';
import { TextField } from '@/components/TextField';
import { customers } from '@/features/demo/data';
import { useDemo } from '@/features/demo/store';
import { de } from '@/i18n/de';
import { spacing } from '@/theme';

const t = de.neu;

export function NewProjectForm() {
  const addProject = useDemo((s) => s.addProject);
  const [title, setTitle] = useState('');
  const [customerId, setCustomerId] = useState(customers[0]!.id);
  const customer = customers.find((c) => c.id === customerId)!;
  const [street, setStreet] = useState(customer.street);
  const [zipCity, setZipCity] = useState(customer.zipCity);
  const [error, setError] = useState<string>();

  function pickCustomer(id: string) {
    const c = customers.find((x) => x.id === id)!;
    setCustomerId(id);
    // Baustelle ist meist die Kundenadresse – vorbelegen, änderbar.
    setStreet(c.street);
    setZipCity(c.zipCity);
  }

  function save() {
    if (!title.trim()) return setError(t.pflicht);
    const id = addProject({ title: title.trim(), customerId, street, zipCity });
    router.replace({ pathname: '/projekt/[id]', params: { id } });
  }

  return (
    <>
      <TextField
        label={t.titel}
        placeholder={t.titelBeispiel}
        value={title}
        onChangeText={setTitle}
        error={error}
        autoFocus
      />
      <View style={{ gap: spacing.xs }}>
        <AppText variant="label">{t.kunde}</AppText>
        <Chips
          options={customers.map((c) => ({ value: c.id, label: c.name }))}
          value={customerId}
          onChange={pickCustomer}
        />
      </View>
      <TextField label={t.strasse} value={street} onChangeText={setStreet} />
      <TextField label={t.ort} value={zipCity} onChangeText={setZipCity} />
      <Button title={t.anlegen} onPress={save} />
    </>
  );
}
