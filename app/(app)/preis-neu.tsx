import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Chips } from '@/components/Chips';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { catalog, suppliers } from '@/features/demo/data';
import { useDemo } from '@/features/demo/store';
import { de } from '@/i18n/de';
import { parseEuro } from '@/lib/money';
import { spacing } from '@/theme';

export default function PreisNeuScreen() {
  const { catalogItemId } = useLocalSearchParams<{ catalogItemId: string }>();
  const item = catalog.find((c) => c.id === catalogItemId);
  const addSupplierPrice = useDemo((s) => s.addSupplierPrice);
  const [supplierId, setSupplierId] = useState(suppliers[0]!.id);
  const [price, setPrice] = useState('');
  const [error, setError] = useState<string>();

  function save() {
    const cents = parseEuro(price);
    if (cents === undefined || cents === 0) return setError(de.kalk.ungueltig);
    addSupplierPrice(catalogItemId, supplierId, cents);
    router.back();
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: de.einkauf.preisEintragen }} />
      <AppText variant="title">
        {item?.name} ({item?.unit})
      </AppText>
      <View style={{ gap: spacing.xs }}>
        <AppText variant="label">{de.kalk.lieferant}</AppText>
        <Chips
          options={suppliers.map((s) => ({ value: s.id, label: s.name }))}
          value={supplierId}
          onChange={setSupplierId}
        />
      </View>
      <TextField
        label={de.einkauf.preisFeld}
        value={price}
        onChangeText={setPrice}
        keyboardType="decimal-pad"
        placeholder="0,00"
        error={error}
        autoFocus
      />
      <Button title={de.neu.speichern} onPress={save} />
    </Screen>
  );
}
