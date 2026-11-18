import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Chips } from '@/components/Chips';
import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { Section } from '@/components/Section';
import { TextField } from '@/components/TextField';
import { members } from '@/features/demo/data';
import { jobs } from '@/features/team/data';
import { statusLabel } from '@/features/team/labels';
import { useTeam } from '@/features/team/store';
import type { Applicant, ApplicantStatus } from '@/features/team/types';
import { de } from '@/i18n/de';
import { call } from '@/lib/links';
import { spacing } from '@/theme';

const t = de.team;
const statuses: ApplicantStatus[] = ['neu', 'angerufen', 'probearbeiten', 'zusage', 'absage'];

function sourceText(a: Applicant) {
  if (a.source.kind === 'webseite') return t.quelleWebseite;
  if (a.source.kind === 'foto-check') return t.quelleFoto;
  const { memberId } = a.source;
  return `${t.quelleEmpfehlung} ${members.find((m) => m.id === memberId)?.name ?? '–'} (Prämie 1.000 €)`;
}

const when = (iso: string) =>
  new Date(iso).toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

export default function BewerberScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const a = useTeam((s) => s.applicants.find((x) => x.id === id));
  const setStatus = useTeam((s) => s.setApplicantStatus);
  const addNote = useTeam((s) => s.addApplicantNote);
  const [note, setNote] = useState('');
  if (!a) return <EmptyState icon="person" text="–" />;
  const job = jobs.find((j) => j.id === a.jobId);
  return (
    <Screen>
      <Stack.Screen options={{ title: t.akte }} />
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <Avatar name={a.name} size={56} />
        <View style={{ flex: 1, gap: 2 }}>
          <AppText variant="heading">{a.name}</AppText>
          <AppText muted>{job?.title}</AppText>
          <AppText variant="mono">{when(a.createdAt)}</AppText>
        </View>
      </Card>
      <Button title={`${t.anrufen}: ${a.phone}`} onPress={() => call(a.phone)} />

      <Section title={t.status}>
        <Chips
          options={statuses.map((s) => ({ value: s, label: statusLabel[s] }))}
          value={a.status}
          onChange={(s) => setStatus(a.id, s)}
        />
      </Section>

      <Section title={t.quelle}>
        <Card>
          <AppText>{sourceText(a)}</AppText>
        </Card>
      </Section>

      <Section title={t.antworten}>
        <Card style={{ gap: spacing.sm }}>
          {a.answers.map((x) => (
            <View key={x.question} style={{ gap: 2 }}>
              <AppText variant="small" muted>
                {x.question}
              </AppText>
              <AppText variant="label">{x.answer}</AppText>
            </View>
          ))}
        </Card>
      </Section>

      <Section title={t.notizen}>
        {a.notes.map((n) => (
          <Card key={n.id} style={{ gap: 4 }}>
            <AppText variant="mono">{when(n.createdAt)}</AppText>
            <AppText>{n.text}</AppText>
          </Card>
        ))}
        <TextField
          label={t.notizen}
          value={note}
          onChangeText={setNote}
          placeholder={t.notizPlatzhalter}
          multiline
        />
        <Button
          title={t.notizSpeichern}
          variant="secondary"
          disabled={!note.trim()}
          onPress={() => {
            addNote(a.id, note.trim());
            setNote('');
          }}
        />
      </Section>
    </Screen>
  );
}
