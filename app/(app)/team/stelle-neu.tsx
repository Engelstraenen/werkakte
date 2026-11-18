import { Stack, router } from 'expo-router';
import { useState } from 'react';

import { Button } from '@/components/Button';
import { Chips } from '@/components/Chips';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { useTeam } from '@/features/team/store';
import type { JobKind } from '@/features/team/types';
import { de } from '@/i18n/de';

const t = de.anlegen;
const kinds: { value: JobKind; label: string; short: string }[] = [
  { value: 'fachkraft', label: 'Fachkraft', short: 'Monteur/in' },
  { value: 'ausbildung', label: 'Ausbildung', short: 'Azubi' },
  { value: 'quereinstieg', label: 'Quereinstieg', short: 'Quereinstieg' },
  { value: 'kundendienst', label: 'Kundendienst', short: 'Kundendienst' },
];

export default function StelleNeuScreen() {
  const addJob = useTeam((s) => s.addJob);
  const [kind, setKind] = useState<JobKind>('fachkraft');
  const [title, setTitle] = useState('');
  const [salary, setSalary] = useState('');
  const [hours, setHours] = useState('');
  const [errors, setErrors] = useState<{ title?: string; salary?: string }>({});

  function save() {
    const next = {
      title: title.trim() ? undefined : t.pflicht,
      salary: salary.trim() ? undefined : t.pflicht,
    };
    setErrors(next);
    if (next.title || next.salary) return;
    addJob({
      kind,
      title: title.trim(),
      short: kinds.find((k) => k.value === kind)!.short,
      salary: salary.trim(),
      hours: hours.trim(),
    });
    router.back();
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: t.stelle }} />
      <Chips options={kinds} value={kind} onChange={setKind} />
      <TextField
        label={t.stelleTitel}
        placeholder={t.stelleBeispiel}
        value={title}
        onChangeText={setTitle}
        error={errors.title}
        autoFocus
      />
      <TextField
        label={t.gehalt}
        placeholder={t.gehaltBeispiel}
        value={salary}
        onChangeText={setSalary}
        error={errors.salary}
      />
      <TextField label={t.arbeitszeit} value={hours} onChangeText={setHours} />
      <Button title={de.neu.anlegen} onPress={save} />
    </Screen>
  );
}
