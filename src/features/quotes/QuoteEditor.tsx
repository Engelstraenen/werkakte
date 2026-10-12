import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { DocTotals } from './DocItems';
import { suggest } from './suggestions';
import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { ListRow } from '@/components/ListRow';
import { SearchField } from '@/components/SearchField';
import { catalog, company } from '@/features/demo/data';
import { useDemo } from '@/features/demo/store';
import type { DocItem, Quote } from '@/features/demo/types';
import { de } from '@/i18n/de';
import { formatEuro, formatQty, lineTotalCents, parseQty } from '@/lib/money';
import { fonts, fontSize, radius, spacing, touch, useColors } from '@/theme';

const t = de.editor;

function QtyInput({ item, onChange }: { item: DocItem; onChange: (qtyMilli: number) => void }) {
  const colors = useColors();
  const [text, setText] = useState(formatQty(item.qtyMilli));
  return (
    <TextInput
      accessibilityLabel={`${t.menge} ${item.name}`}
      value={text}
      onChangeText={setText}
      onEndEditing={() => {
        const q = parseQty(text);
        if (q) onChange(q);
        else setText(formatQty(item.qtyMilli));
      }}
      onBlur={() => {
        const q = parseQty(text);
        if (q) onChange(q);
      }}
      keyboardType="decimal-pad"
      selectTextOnFocus
      style={{
        width: 72,
        minHeight: touch.min,
        borderWidth: 2,
        borderColor: colors.border,
        borderRadius: radius.sm,
        textAlign: 'center',
        fontSize: fontSize.body,
        fontFamily: fonts.bodyBold,
        color: colors.text,
        backgroundColor: colors.card,
      }}
    />
  );
}

/** Angebot im Entwurf bearbeiten: Mengen ändern, Positionen löschen, neue per Vorschlag hinzufügen. */
export function QuoteEditor({ quote }: { quote: Quote }) {
  const colors = useColors();
  const { quotes, setQuoteItems } = useDemo();
  const [query, setQuery] = useState('');
  const items = quote.items;
  const update = (next: DocItem[]) => setQuoteItems(quote.id, next);
  const suggestions = suggest(query, catalog, quotes);

  return (
    <>
      <Card style={{ paddingVertical: spacing.sm }}>
        <AppText variant="small" muted>
          {de.beleg.positionen} ({items.length}) · {t.hinweis}
        </AppText>
        {items.map((it) => (
          <View
            key={it.id}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.sm,
              paddingVertical: spacing.sm,
              borderTopWidth: 1,
              borderTopColor: colors.surface,
            }}
          >
            <View style={{ flex: 1, gap: 2 }}>
              <AppText variant="label">{it.name}</AppText>
              <AppText variant="small" muted>
                {it.unit} × {formatEuro(it.unitPriceCents)} = {formatEuro(lineTotalCents(it))}
              </AppText>
            </View>
            <QtyInput
              item={it}
              onChange={(qtyMilli) =>
                update(items.map((x) => (x.id === it.id ? { ...x, qtyMilli } : x)))
              }
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${t.entfernen}: ${it.name}`}
              onPress={() => update(items.filter((x) => x.id !== it.id))}
              hitSlop={8}
              style={{
                width: touch.min,
                height: touch.min,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="trash-outline" size={22} color={colors.danger} />
            </Pressable>
          </View>
        ))}
      </Card>

      <SearchField value={query} onChange={setQuery} placeholder={t.hinzufuegen} />
      {suggestions.length ? (
        <Card style={{ paddingVertical: 4 }}>
          {suggestions.map((s, i) => (
            <ListRow
              key={s.name}
              divider={i > 0}
              left={<Ionicons name="add-circle" size={28} color={colors.primary} />}
              title={s.name}
              subtitle={`${formatEuro(s.unitPriceCents)} / ${s.unit}${s.uses ? ` · ${t.genutzt(s.uses)}` : ''}`}
              onPress={() => {
                update([...items, { ...s, id: `${quote.id}-${Date.now()}`, qtyMilli: 1000 }]);
                setQuery('');
              }}
            />
          ))}
        </Card>
      ) : null}

      <DocTotals items={items} kleinunternehmer={company.kleinunternehmer} />
    </>
  );
}
