import { Stack, router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Chips } from '@/components/Chips';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { useStamm } from '@/features/demo/stamm';
import { useTeam } from '@/features/team/store';
import { de } from '@/i18n/de';
import { spacing } from '@/theme';

const t = de.anlegen;

/** Bewerbung von Hand eintragen (Anruf, E-Mail, persönlich) – wird eine Bewerber-Akte. */
export default function BewerberNeuScreen() {
  const jobs = useTeam((s) => s.jobs);
  const addApplicant = useTeam((s) => s.addApplicant);
  const members = useStamm((s) => s.members);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [jobId, setJobId] = useState(jobs[0]?.id ?? '');
  const [referrer, setReferrer] = useState('niemand');
  const [error, setError] = useState<string>();

  function save() {
    if (!name.trim()) return setError(t.pflicht);
    const id = addApplicant({
      name: name.trim(),
      phone: phone.trim(),
      jobId,
      source:
        referrer === 'niemand' ? { kind: 'webseite' } : { kind: 'empfehlung', memberId: referrer },
    });
    router.replace({ pathname: '/team/bewerber/[id]', params: { id } });
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: t.bewerber }} />
      <AppText muted>{t.bewerberHinweis}</AppText>
      <TextField label={t.name} value={name} onChangeText={setName} error={error} autoFocus />
      <TextField label={t.telefon} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <View style={{ gap: spacing.xs }}>
        <AppText variant="label">{t.stelleTitel}</AppText>
        <Chips
          options={jobs.map((j) => ({ value: j.id, label: j.short }))}
          value={jobId}
          onChange={setJobId}
        />
      </View>
      <View style={{ gap: spacing.xs }}>
        <AppText variant="label">{t.empfohlenVon}</AppText>
        <Chips
          options={[
            { value: 'niemand', label: t.niemand },
            ...members.map((m) => ({ value: m.id, label: m.name })),
          ]}
          value={referrer}
          onChange={setReferrer}
        />
      </View>
      <Button title={de.neu.anlegen} onPress={save} />
    </Screen>
  );
}
