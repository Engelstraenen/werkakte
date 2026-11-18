import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Chips } from '@/components/Chips';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { WeekStrip } from '@/features/calendar/WeekStrip';
import { CURRENT_MEMBER_ID } from '@/features/demo/data';
import { parseTime, useStamm } from '@/features/demo/stamm';
import { useDemo } from '@/features/demo/store';
import { de } from '@/i18n/de';
import { radius, spacing, useColors } from '@/theme';

const t = de.anlegen;

const at = (day: Date, minutes: number) => {
  const d = new Date(day);
  d.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
  return d.toISOString();
};

/** Termin anlegen – aus dem Kalender (Projekt wählen) oder aus dem Projekt (?projectId=…). */
export default function TerminNeuScreen() {
  const colors = useColors();
  const params = useLocalSearchParams<{ projectId?: string }>();
  const projects = useDemo((s) => s.projects);
  const members = useStamm((s) => s.members);
  const addAppointment = useStamm((s) => s.addAppointment);
  const [projectId, setProjectId] = useState(params.projectId ?? projects[0]?.id ?? '');
  const [title, setTitle] = useState('');
  const [day, setDay] = useState(new Date());
  const [from, setFrom] = useState('08:00');
  const [to, setTo] = useState('12:00');
  const [who, setWho] = useState<string[]>([CURRENT_MEMBER_ID]);
  const [errors, setErrors] = useState<{ title?: string; time?: string }>({});

  function save() {
    const start = parseTime(from);
    const end = parseTime(to);
    const next = {
      title: title.trim() ? undefined : t.pflicht,
      time: start === null || end === null || end <= start ? t.zeitFalsch : undefined,
    };
    setErrors(next);
    if (next.title || next.time || start === null || end === null || !projectId) return;
    addAppointment({
      projectId,
      title: title.trim(),
      start: at(day, start),
      end: at(day, end),
      memberIds: who,
    });
    router.back();
  }

  const toggle = (id: string) =>
    setWho((w) => (w.includes(id) ? w.filter((x) => x !== id) : [...w, id]));

  return (
    <Screen>
      <Stack.Screen options={{ title: t.termin }} />
      {!params.projectId ? (
        <View style={{ gap: spacing.xs }}>
          <AppText variant="label">{t.projekt}</AppText>
          <Chips
            options={projects.map((p) => ({ value: p.id, label: p.title }))}
            value={projectId}
            onChange={setProjectId}
          />
        </View>
      ) : null}
      <TextField
        label={t.terminTitel}
        placeholder={t.terminBeispiel}
        value={title}
        onChangeText={setTitle}
        error={errors.title}
        autoFocus
      />
      <View style={{ gap: spacing.xs }}>
        <AppText variant="label">{t.tag}</AppText>
        <WeekStrip selected={day} onSelect={setDay} />
      </View>
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <View style={{ flex: 1 }}>
          <TextField label={t.von} value={from} onChangeText={setFrom} error={errors.time} />
        </View>
        <View style={{ flex: 1 }}>
          <TextField label={t.bis} value={to} onChangeText={setTo} />
        </View>
      </View>
      <View style={{ gap: spacing.xs }}>
        <AppText variant="label">{t.wer}</AppText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {members.map((m) => {
            const on = who.includes(m.id);
            return (
              <Pressable
                key={m.id}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: on }}
                onPress={() => toggle(m.id)}
                style={{
                  paddingHorizontal: spacing.md,
                  minHeight: 44,
                  justifyContent: 'center',
                  borderRadius: radius.md,
                  borderWidth: 2,
                  borderColor: on ? colors.primary : colors.border,
                  backgroundColor: on ? colors.primary : colors.card,
                }}
              >
                <AppText variant="label" color={on ? colors.onPrimary : colors.text}>
                  {m.name}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </View>
      <Button title={de.neu.anlegen} onPress={save} />
    </Screen>
  );
}
