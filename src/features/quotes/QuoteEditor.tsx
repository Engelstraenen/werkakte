import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { DocTotals } from './DocItems';
import { ItemEdit } from './ItemEdit';
import { suggest, type Suggestion } from './suggestions';
import { tradeWords } from './trades';
import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { ListRow } from '@/components/ListRow';
import { SearchField } from '@/components/SearchField';
import { company } from '@/features/demo/data';
import { useStamm } from '@/features/demo/stamm';
import { useDemo } from '@/features/demo/store';
import type { DocItem, Invoice, Quote } from '@/features/demo/types';
import { de } from '@/i18n/de';
import { formatEuro, formatQty, lineTotalCents, parseQty } from '@/lib/money';
import { fonts, fontSize, radius, spacing, touch, useColors } from '@/theme';

const t = de.editor;
const newItemId = (docId: string) => `${docId}-${Date.now()}`;

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

/** Angebot oder Rechnung im Entwurf frei bearbeiten: Positionen aus Katalog oder frei, alles änderbar. */
export function QuoteEditor({ quote }: { quote: Quote | Invoice }) {
  const catalog = useStamm((s) => s.catalog);
  const trade = useStamm((s) => s.trade);
  const colors = useColors();
  const { quotes, setQuoteItems, setInvoiceItems } = useDemo();
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<string>();
  const items = quote.items;
  const update = (next: DocItem[]) =>
    'validUntil' in quote ? setQuoteItems(quote.id, next) : setInvoiceItems(quote.id, next);
  const suggestions = suggest(query, catalog, quotes, 6, tradeWords(trade));
  const words = tradeWords(trade);
  // Schnellknöpfe: Arbeitsstunde + Anfahrt des Gewerks, dazu Material frei.
  const quick: Suggestion[] = [
    words.find((w) => w.unit === 'Std')!,
    words.find((w) => /anfahrt/i.test(w.name))!,
    { name: 'Material', unit: 'pauschal', unitPriceCents: 0, vatRate: 19, uses: 0, hint: true },
  ];
  const addItem = (s: Suggestion) => {
    const id = newItemId(quote.id);
    const { uses: _uses, hint, ...rest } = s;
    update([...items, { ...rest, id, qtyMilli: 1000 }]);
    setQuery('');
    if (hint) setEditing(id); // Richtwert → gleich Preis prüfen lassen
  };

  return (
    <>
      <Card style={{ paddingVertical: spacing.sm }}>
        <AppText variant="small" muted>
          {de.beleg.positionen} ({items.length}) · {de.beleg.preiseNetto} · {t.hinweis}
        </AppText>
        {items.length === 0 ? (
          <AppText muted style={{ paddingVertical: spacing.md }}>
            {t.leer}
          </AppText>
        ) : null}
        {items.map((it) =>
          editing === it.id ? (
            <ItemEdit
              key={it.id}
              item={it}
              onDone={(next) => {
                update(items.map((x) => (x.id === it.id ? next : x)));
                setEditing(undefined);
              }}
            />
          ) : (
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
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${de.anlegen.positionBearbeiten}: ${it.name}`}
                onPress={() => setEditing(it.id)}
                style={{ flex: 1, gap: 2, minHeight: touch.min, justifyContent: 'center' }}
              >
                <AppText variant="label">{it.name}</AppText>
                <AppText variant="small" muted>
                  {it.unit} × {formatEuro(it.unitPriceCents)} = {formatEuro(lineTotalCents(it))}{' '}
                  netto
                </AppText>
              </Pressable>
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
          ),
        )}
      </Card>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        {quick.map((s) => (
          <Pressable
            key={s.name}
            accessibilityRole="button"
            onPress={() => addItem(s)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              minHeight: touch.min,
              paddingHorizontal: spacing.md,
              borderRadius: radius.md,
              borderWidth: 2,
              borderColor: colors.border,
            }}
          >
            <Ionicons name="add" size={20} color={colors.primary} />
            <AppText variant="label">{s.name}</AppText>
          </Pressable>
        ))}
      </View>
      <SearchField value={query} onChange={setQuery} placeholder={t.hinzufuegen} />
      {suggestions.length || query.trim() ? (
        <Card style={{ paddingVertical: 4 }}>
          {suggestions.map((s, i) => (
            <ListRow
              key={s.name}
              divider={i > 0}
              left={<Ionicons name="add-circle" size={28} color={colors.primary} />}
              title={s.name}
              subtitle={`${formatEuro(s.unitPriceCents)} netto / ${s.unit}${s.hint ? ` · ${t.richtwert}` : s.uses ? ` · ${t.genutzt(s.uses)}` : ''}`}
              onPress={() => addItem(s)}
            />
          ))}
          {query.trim() ? (
            <ListRow
              divider={suggestions.length > 0}
              left={<Ionicons name="create" size={26} color={colors.primary} />}
              title={t.eigene(query.trim())}
              subtitle={de.anlegen.positionHinzu}
              onPress={() => {
                const id = `${quote.id}-${Date.now()}`;
                update([
                  ...items,
                  {
                    id,
                    name: query.trim(),
                    unit: 'Stk',
                    qtyMilli: 1000,
                    unitPriceCents: 0,
                    vatRate: 19,
                  },
                ]);
                setQuery('');
                setEditing(id);
              }}
            />
          ) : null}
        </Card>
      ) : null}

      <DocTotals items={items} kleinunternehmer={company.kleinunternehmer} />
    </>
  );
}
