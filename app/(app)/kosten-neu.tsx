import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Chips } from '@/components/Chips';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { CURRENT_MEMBER_ID, members, suppliers } from '@/features/demo/data';
import { useDemo } from '@/features/demo/store';
import { de } from '@/i18n/de';
import { parseEuro } from '@/lib/money';
import { fonts, radius, spacing, useColors } from '@/theme';

const t = de.kalk;
const quickHours = [1, 2, 4, 8];

/** Kosten von Hand: Material = Betrag eintippen; Stunden = Schnelltaste antippen. */
export default function KostenNeuScreen() {
  const colors = useColors();
  const { projectId, kind } = useLocalSearchParams<{
    projectId: string;
    kind: 'material' | 'stunden';
  }>();
  const { addMaterialCost, addHours } = useDemo();
  const [amount, setAmount] = useState('');
  const [text, setText] = useState('');
  const [supplierId, setSupplierId] = useState('keiner');
  const [memberId, setMemberId] = useState(CURRENT_MEMBER_ID);
  const [error, setError] = useState<string>();

  const saveHours = (h: number) => {
    addHours(projectId, memberId, Math.round(h * 60));
    router.back();
  };

  function save() {
    if (kind === 'material') {
      const cents = parseEuro(amount);
      if (!cents) return setError(t.ungueltig);
      addMaterialCost(
        projectId,
        text.trim() || t.wofuerStandard,
        cents,
        supplierId === 'keiner' ? undefined : supplierId,
      );
      router.back();
    } else {
      const h = Number(amount.replace(',', '.'));
      if (!(h > 0 && h <= 24)) return setError(t.ungueltig);
      saveHours(h);
    }
  }

  if (kind === 'stunden') {
    return (
      <Screen>
        <Stack.Screen options={{ title: t.stundenEintragen }} />
        <View style={{ gap: spacing.xs }}>
          <AppText variant="label">{t.wer}</AppText>
          <Chips
            options={members.map((m) => ({ value: m.id, label: m.name }))}
            value={memberId}
            onChange={setMemberId}
          />
        </View>
        <AppText variant="label">{t.wieviele}</AppText>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {quickHours.map((h) => (
            <Pressable
              key={h}
              accessibilityRole="button"
              onPress={() => saveHours(h)}
              style={({ pressed }) => ({
                flex: 1,
                height: 72,
                borderRadius: radius.md,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.primary,
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <AppText variant="heading" color={colors.onPrimary}>
                {h}
              </AppText>
              <AppText variant="small" color={colors.onPrimary}>
                Std.
              </AppText>
            </Pressable>
          ))}
        </View>
        <TextField
          label={t.andere}
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          placeholder="z. B. 3,5"
          error={error}
        />
        {amount ? <Button title={de.neu.speichern} onPress={save} /> : null}
      </Screen>
    );
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: t.materialEintragen }} />
      <TextField
        label={t.betrag}
        value={amount}
        onChangeText={setAmount}
        keyboardType="decimal-pad"
        placeholder="0,00"
        error={error}
        autoFocus
        style={{ fontSize: 28, fontFamily: fonts.heading, minHeight: 72 }}
      />
      <TextField
        label={t.wofuer}
        placeholder={t.wofuerBeispiel}
        value={text}
        onChangeText={setText}
      />
      <View style={{ gap: spacing.xs }}>
        <AppText variant="label">{t.lieferant}</AppText>
        <Chips
          options={[
            { value: 'keiner', label: '–' },
            ...suppliers.map((s) => ({ value: s.id, label: s.name })),
          ]}
          value={supplierId}
          onChange={setSupplierId}
        />
      </View>
      <Button title={de.neu.speichern} onPress={save} />
    </Screen>
  );
}
