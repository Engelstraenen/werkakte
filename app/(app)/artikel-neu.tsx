import { Stack, router } from 'expo-router';
import { useState } from 'react';

import { Button } from '@/components/Button';
import { Chips } from '@/components/Chips';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { parseEuroToCents, useStamm } from '@/features/demo/stamm';
import type { CatalogItem } from '@/features/demo/types';
import { de } from '@/i18n/de';

const t = de.anlegen;

/** Artikel oder Leistung für den Katalog anlegen (taucht danach im Angebot als Vorschlag auf). */
export default function ArtikelNeuScreen() {
  const addCatalogItem = useStamm((s) => s.addCatalogItem);
  const [type, setType] = useState<CatalogItem['type']>('arbeit');
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('Std.');
  const [price, setPrice] = useState('');
  const [cost, setCost] = useState('');
  const [vat, setVat] = useState<'19' | '7'>('19');
  const [errors, setErrors] = useState<{ name?: string; price?: string }>({});

  function save() {
    const unitPriceCents = parseEuroToCents(price);
    const internal = cost.trim() ? parseEuroToCents(cost) : undefined;
    const next = {
      name: name.trim() ? undefined : t.pflicht,
      price: unitPriceCents === null ? t.preisFalsch : undefined,
    };
    setErrors(next);
    if (next.name || next.price || unitPriceCents === null) return;
    addCatalogItem({
      type,
      name: name.trim(),
      unit: unit.trim() || 'Stk.',
      unitPriceCents,
      vatRate: vat === '7' ? 7 : 19,
      internalCostCents: type === 'arbeit' && internal != null ? internal : undefined,
    });
    router.back();
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: t.artikel }} />
      <Chips
        segmented
        options={[
          { value: 'arbeit', label: de.mehr.arbeit },
          { value: 'material', label: de.mehr.material },
        ]}
        value={type}
        onChange={(v) => {
          setType(v);
          if (v === 'material' && unit === 'Std.') setUnit('Stk.');
          if (v === 'arbeit' && unit === 'Stk.') setUnit('Std.');
        }}
      />
      <TextField
        label={t.bezeichnung}
        placeholder={t.bezeichnungBeispiel}
        value={name}
        onChangeText={setName}
        error={errors.name}
        autoFocus
      />
      <TextField
        label={t.einheit}
        placeholder={t.einheitBeispiel}
        value={unit}
        onChangeText={setUnit}
      />
      <TextField
        label={t.preis}
        placeholder="68,00"
        value={price}
        onChangeText={setPrice}
        keyboardType="decimal-pad"
        error={errors.price}
      />
      {type === 'arbeit' ? (
        <TextField
          label={t.interneKosten}
          placeholder="42,00"
          value={cost}
          onChangeText={setCost}
          keyboardType="decimal-pad"
        />
      ) : null}
      <Chips
        segmented
        options={[
          { value: '19', label: `19 % ${t.mwst}` },
          { value: '7', label: `7 % ${t.mwst}` },
        ]}
        value={vat}
        onChange={setVat}
      />
      <Button title={de.neu.anlegen} onPress={save} />
    </Screen>
  );
}
