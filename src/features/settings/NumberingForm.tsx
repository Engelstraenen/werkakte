import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { TextField } from '@/components/TextField';
import { useDemo } from '@/features/demo/store';
import { de } from '@/i18n/de';
import { formatNumber, validateNumbering, YEAR, type NumberFormat } from '@/lib/numbering';
import { radius, soft, spacing, useColors } from '@/theme';

const t = de.nummern;

/** Präfix, Zahl, Stellen, Suffix für einen Nummernkreis – mit Vorschau. */
export function NumberingForm({ kind }: { kind: 'angebot' | 'rechnung' }) {
  const colors = useColors();
  const current = useDemo((s) => s.numbering[kind]);
  const setNumbering = useDemo((s) => s.setNumbering);
  const [prefix, setPrefix] = useState(current.prefix);
  const [next, setNext] = useState(String(current.next));
  const [digits, setDigits] = useState(String(current.digits));
  const [suffix, setSuffix] = useState(current.suffix);
  const [message, setMessage] = useState<string>();

  const draft: NumberFormat = { prefix, next: Number(next), digits: Number(digits), suffix };
  const error = validateNumbering(draft, current);
  const errorText = !error
    ? undefined
    : error === 'kleiner'
      ? t.fehler.kleiner(current.next)
      : t.fehler[error];
  const changed = JSON.stringify(draft) !== JSON.stringify(current);

  return (
    <Card>
      <AppText variant="title">{kind === 'angebot' ? t.angebote : t.rechnungen}</AppText>
      <View
        style={{
          backgroundColor: soft(colors.primary),
          borderRadius: radius.sm,
          padding: spacing.md,
          gap: 2,
        }}
      >
        <AppText variant="small" muted>
          {t.vorschau}
        </AppText>
        <AppText variant="heading" color={colors.primary}>
          {error ? '–' : formatNumber(draft)}
        </AppText>
      </View>
      <TextField
        label={t.praefix}
        value={prefix}
        onChangeText={setPrefix}
        autoCapitalize="characters"
      />
      <Pressable
        accessibilityRole="button"
        onPress={() => setPrefix(prefix + YEAR)}
        style={{ minHeight: 48, justifyContent: 'center' }}
      >
        <AppText variant="label" color={colors.primary}>
          {t.jahr}
        </AppText>
      </Pressable>
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <View style={{ flex: 1 }}>
          <TextField label={t.zahl} value={next} onChangeText={setNext} keyboardType="number-pad" />
        </View>
        <View style={{ flex: 1 }}>
          <TextField
            label={t.stellen}
            value={digits}
            onChangeText={setDigits}
            keyboardType="number-pad"
          />
        </View>
      </View>
      <TextField
        label={t.suffix}
        value={suffix}
        onChangeText={setSuffix}
        autoCapitalize="characters"
      />
      {errorText ? <AppText color={colors.danger}>{errorText}</AppText> : null}
      {message && !changed ? <AppText color={colors.success}>✓ {message}</AppText> : null}
      <Button
        title={de.neu.speichern}
        disabled={!!error || !changed}
        onPress={() => {
          setNumbering(kind, draft);
          setMessage(t.gespeichert);
        }}
      />
    </Card>
  );
}
