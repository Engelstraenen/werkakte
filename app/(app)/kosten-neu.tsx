import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Chips } from '@/components/Chips';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { members, suppliers } from '@/features/demo/data';
import { useDemo } from '@/features/demo/store';
import { de } from '@/i18n/de';
import { parseEuro } from '@/lib/money';
import { spacing } from '@/theme';

const t = de.kalk;

/** Ist-Kosten von Hand erfassen: Material (Betrag + Lieferant) oder Stunden (wer + wie viele). */
export default function KostenNeuScreen() {
  const { projectId, kind } = useLocalSearchParams<{
    projectId: string;
    kind: 'material' | 'stunden';
  }>();
  const { addMaterialCost, addHours } = useDemo();
  const [text, setText] = useState('');
  const [amount, setAmount] = useState('');
  const [supplierId, setSupplierId] = useState(suppliers[0]!.id);
  const [memberId, setMemberId] = useState(members[0]!.id);
  const [error, setError] = useState<string>();

  function save() {
    if (kind === 'material') {
      const cents = parseEuro(amount);
      if (!text.trim()) return setError(de.neu.pflicht);
      if (cents === undefined) return setError(t.ungueltig);
      addMaterialCost(projectId, text.trim(), cents, supplierId);
    } else {
      const h = Number(amount.replace(',', '.'));
      if (!(h > 0 && h <= 24)) return setError(t.ungueltig);
      addHours(projectId, memberId, Math.round(h * 60));
    }
    router.back();
  }

  return (
    <Screen>
      <Stack.Screen
        options={{ title: kind === 'material' ? t.materialEintragen : t.stundenEintragen }}
      />
      {kind === 'material' ? (
        <>
          <TextField
            label={t.wofuer}
            placeholder={t.wofuerBeispiel}
            value={text}
            onChangeText={setText}
            autoFocus
          />
          <View style={{ gap: spacing.xs }}>
            <AppText style={{ fontWeight: '600' }}>{t.lieferant}</AppText>
            <Chips
              options={suppliers.map((s) => ({ value: s.id, label: s.name }))}
              value={supplierId}
              onChange={setSupplierId}
            />
          </View>
          <TextField
            label={t.betrag}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            placeholder="0,00"
            error={error}
          />
        </>
      ) : (
        <>
          <View style={{ gap: spacing.xs }}>
            <AppText style={{ fontWeight: '600' }}>{t.wer}</AppText>
            <Chips
              options={members.map((m) => ({ value: m.id, label: m.name }))}
              value={memberId}
              onChange={setMemberId}
            />
          </View>
          <TextField
            label={t.wieviele}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            placeholder="8"
            error={error}
            autoFocus
          />
        </>
      )}
      <Button title={de.neu.speichern} onPress={save} />
    </Screen>
  );
}
