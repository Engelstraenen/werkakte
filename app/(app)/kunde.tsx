import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { Button } from '@/components/Button';
import { Chips } from '@/components/Chips';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { useStamm } from '@/features/demo/stamm';
import type { Customer } from '@/features/demo/types';
import { de } from '@/i18n/de';
import { call } from '@/lib/links';

const t = de.anlegen;

/** Kunde anlegen (ohne id) oder bearbeiten (?id=…). */
export default function KundeScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const existing = useStamm((s) => s.customers.find((c) => c.id === id));
  const addCustomer = useStamm((s) => s.addCustomer);
  const updateCustomer = useStamm((s) => s.updateCustomer);
  const [type, setType] = useState<Customer['type']>(existing?.type ?? 'privat');
  const [name, setName] = useState(existing?.name ?? '');
  const [contact, setContact] = useState(existing?.contact ?? '');
  const [street, setStreet] = useState(existing?.street ?? '');
  const [zipCity, setZipCity] = useState(existing?.zipCity ?? '');
  const [phone, setPhone] = useState(existing?.phone ?? '');
  const [email, setEmail] = useState(existing?.email ?? '');
  const [error, setError] = useState<string>();

  function save() {
    if (!name.trim()) return setError(t.pflicht);
    const data = {
      type,
      name: name.trim(),
      contact: contact.trim() || undefined,
      street: street.trim(),
      zipCity: zipCity.trim(),
      phone: phone.trim(),
      email: email.trim(),
    };
    if (existing) updateCustomer(existing.id, data);
    else addCustomer(data);
    router.back();
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: existing ? t.kundeBearbeiten : t.kunde }} />
      {existing && existing.phone ? (
        <Button title={`${t.anrufen}: ${existing.phone}`} onPress={() => call(existing.phone)} />
      ) : null}
      <Chips
        segmented
        options={[
          { value: 'privat', label: t.privat },
          { value: 'gewerblich', label: t.gewerblich },
        ]}
        value={type}
        onChange={setType}
      />
      <TextField
        label={t.name}
        placeholder={t.nameBeispiel}
        value={name}
        onChangeText={(v) => {
          setName(v);
          setError(undefined);
        }}
        error={error}
        autoFocus={!existing}
      />
      {type === 'gewerblich' ? (
        <TextField label={t.ansprechpartner} value={contact} onChangeText={setContact} />
      ) : null}
      <TextField label={de.neu.strasse} value={street} onChangeText={setStreet} />
      <TextField label={de.neu.ort} value={zipCity} onChangeText={setZipCity} />
      <TextField label={t.telefon} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <TextField
        label={t.email}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Button title={existing ? t.speichern : de.neu.anlegen} onPress={save} />
    </Screen>
  );
}
