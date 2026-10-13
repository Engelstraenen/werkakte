import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { ToggleRow } from '@/components/ToggleRow';
import { memberById } from '@/features/demo/selectors';
import { useDemo } from '@/features/demo/store';
import { ProjectPicker } from '@/features/quick-actions/ProjectPicker';
import { de } from '@/i18n/de';
import { notice } from '@/lib/notice';

const t = de.material;

/** Mitarbeiter meldet: Material wird knapp → Push + E-Mail an Chef/Einkauf. */
export default function MaterialNeuScreen() {
  const params = useLocalSearchParams<{ projectId?: string }>();
  const [projectId, setProjectId] = useState(params.projectId);
  const { addMaterialRequest, sending } = useDemo();
  const [text, setText] = useState('');
  const [quantity, setQuantity] = useState('');
  const [urgent, setUrgent] = useState(false);
  const [error, setError] = useState<string>();

  function send() {
    if (!projectId) return;
    if (!text.trim()) return setError(de.neu.pflicht);
    addMaterialRequest({ projectId, text: text.trim(), quantity: quantity.trim() || '–', urgent });
    const to = [
      ...sending.materialRecipients.map((id) => memberById(id).name),
      sending.purchasingEmail,
    ].filter(Boolean);
    notice(t.gesendet, `${t.gesendetAn(to.join(', '))}\n\n${de.senden.prototyp}`);
    router.back();
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: t.titel }} />
      {!projectId ? (
        <>
          <AppText variant="title">{de.neu.welchesProjekt}</AppText>
          <ProjectPicker onPick={setProjectId} onlyMine />
        </>
      ) : (
        <>
          <TextField
            label={t.was}
            placeholder={t.wasBeispiel}
            value={text}
            onChangeText={setText}
            error={error}
            autoFocus
          />
          <TextField
            label={t.menge}
            placeholder={t.mengeBeispiel}
            value={quantity}
            onChangeText={setQuantity}
          />
          <Card>
            <ToggleRow
              title={t.dringend}
              subtitle={t.dringendText}
              value={urgent}
              onChange={setUrgent}
            />
          </Card>
          <Button title={t.senden} onPress={send} />
        </>
      )}
    </Screen>
  );
}
