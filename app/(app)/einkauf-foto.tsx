import Ionicons from '@expo/vector-icons/Ionicons';
import { Stack, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { catalog } from '@/features/demo/data';
import { OnlineSearch } from '@/features/purchasing/OnlineSearch';
import { de } from '@/i18n/de';
import { radius, spacing, useColors } from '@/theme';

const t = de.einkauf;
// shortcut: Prototyp zeigt nur den Ablauf; echte KI-Erkennung kommt in Version 1.x.
const sample = require('../../assets/demo/f08.jpg');
const recognized = catalog.find((c) => c.id === 'k12')!;

type Step = 'aufnahme' | 'erkennen' | 'erkannt';

export default function EinkaufFotoScreen() {
  const colors = useColors();
  const [step, setStep] = useState<Step>('aufnahme');

  useEffect(() => {
    if (step !== 'erkennen') return;
    const id = setTimeout(() => setStep('erkannt'), 1500);
    return () => clearTimeout(id);
  }, [step]);

  return (
    <Screen>
      <Stack.Screen options={{ title: t.fotoTitel }} />
      <AppText muted>{t.fotoHinweis}</AppText>
      {step === 'aufnahme' ? (
        <>
          <View
            style={{
              aspectRatio: 4 / 3,
              borderRadius: radius.md,
              borderWidth: 3,
              borderStyle: 'dashed',
              borderColor: colors.border,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="camera-outline" size={64} color={colors.textMuted} />
          </View>
          <Button title={t.fotoAufnehmen} onPress={() => setStep('erkennen')} />
        </>
      ) : (
        <>
          <Image
            source={sample}
            style={{ width: '100%', aspectRatio: 4 / 3, borderRadius: radius.md }}
          />
          {step === 'erkennen' ? (
            <Card style={{ flexDirection: 'row', alignItems: 'center' }}>
              <ActivityIndicator color={colors.primary} />
              <AppText variant="label">{t.fotoErkennt}</AppText>
            </Card>
          ) : (
            <>
              <Card>
                <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                  <Badge label={t.fotoErkannt} tone="success" />
                  <Badge label={t.fotoSicherheit(87)} tone="neutral" />
                </View>
                <AppText variant="title">{recognized.name}</AppText>
              </Card>
              <Button
                title={t.fotoPreise}
                onPress={() =>
                  router.replace({ pathname: '/artikel/[id]', params: { id: recognized.id } })
                }
              />
              <OnlineSearch query={recognized.name} />
            </>
          )}
        </>
      )}
    </Screen>
  );
}
