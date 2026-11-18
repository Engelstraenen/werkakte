import { useState } from 'react';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Chips } from '@/components/Chips';
import { TextField } from '@/components/TextField';
import type { DocItem } from '@/features/demo/types';
import { de } from '@/i18n/de';
import { parseEuro, type VatRate } from '@/lib/money';
import { radius, spacing, useColors } from '@/theme';

const t = de.anlegen;
const units = ['Std', 'Stk', 'm', 'm²', 'pauschal'];
const toInput = (cents: number) => (cents / 100).toFixed(2).replace('.', ',');

/** Eine Angebotsposition frei ändern: Text, Einheit, Einzelpreis, MwSt. */
export function ItemEdit({ item, onDone }: { item: DocItem; onDone: (next: DocItem) => void }) {
  const colors = useColors();
  const [name, setName] = useState(item.name);
  const [unit, setUnit] = useState(item.unit);
  const [price, setPrice] = useState(toInput(item.unitPriceCents));
  const [vat, setVat] = useState<VatRate>(item.vatRate);
  const [errors, setErrors] = useState<{ name?: string; price?: string }>({});

  function done() {
    const cents = parseEuro(price);
    const next = {
      name: name.trim() ? undefined : t.pflicht,
      price: cents === undefined ? t.preisFalsch : undefined,
    };
    setErrors(next);
    if (next.name || cents === undefined) return;
    onDone({ ...item, name: name.trim(), unit, unitPriceCents: cents, vatRate: vat });
  }

  return (
    <View
      style={{
        gap: spacing.sm,
        padding: spacing.md,
        marginVertical: spacing.sm,
        borderRadius: radius.md,
        borderWidth: 2,
        borderColor: colors.primary,
        backgroundColor: colors.card,
      }}
    >
      <AppText variant="label">{t.positionBearbeiten}</AppText>
      <TextField
        label={t.positionText}
        value={name}
        onChangeText={setName}
        error={errors.name}
        multiline
        autoFocus
      />
      <Chips
        options={[...new Set([unit, ...units])].map((u) => ({ value: u, label: u }))}
        value={unit}
        onChange={setUnit}
      />
      <TextField
        label={t.einzelpreis}
        value={price}
        onChangeText={setPrice}
        keyboardType="decimal-pad"
        error={errors.price}
        selectTextOnFocus
      />
      <Chips
        segmented
        options={['19', '7', '0'].map((v) => ({ value: v, label: `${v} %` }))}
        value={String(vat)}
        onChange={(v) => setVat(Number(v) as VatRate)}
      />
      <Button title={t.fertig} onPress={done} />
    </View>
  );
}
