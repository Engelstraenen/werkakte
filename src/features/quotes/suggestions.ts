import type { CatalogItem, DocItem, Quote } from '@/features/demo/types';

export type Suggestion = Pick<
  DocItem,
  'name' | 'unit' | 'unitPriceCents' | 'vatRate' | 'catalogId'
> & {
  uses: number;
  /** Vorschlag aus dem Gewerk (Richtwert), nicht aus dem eigenen Katalog. */
  hint?: boolean;
};

/**
 * Vorschläge beim Tippen einer Position: Katalog + alles, was in früheren Angeboten stand.
 * Name beginnt mit der Eingabe > Wortanfang > Treffer mitten im Wort, danach häufig benutzte zuerst.
 * `extra` = Gewerk-Wörter (z. B. Schreiner: „Sp“ → Sperrholzplatte), nur wenn nicht schon im Katalog.
 */
export function suggest(
  query: string,
  catalog: CatalogItem[],
  quotes: Quote[],
  limit = 6,
  extra: Suggestion[] = [],
): Suggestion[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const byName = new Map<string, Suggestion>();
  for (const c of catalog) {
    byName.set(c.name.toLowerCase(), {
      name: c.name,
      unit: c.unit,
      unitPriceCents: c.unitPriceCents,
      vatRate: c.vatRate,
      catalogId: c.id,
      uses: 0,
    });
  }
  for (const w of extra) {
    const key = w.name.toLowerCase();
    if (!byName.has(key)) byName.set(key, { ...w });
  }
  for (const quote of quotes) {
    for (const it of quote.items) {
      const key = it.name.toLowerCase();
      const known = byName.get(key);
      if (known) {
        known.uses += 1;
        // Gewerk-Wort schon selbst benutzt → eigener Preis statt Richtwert.
        if (known.hint) Object.assign(known, { ...it, uses: known.uses, hint: false });
      } else byName.set(key, { ...it, uses: 1 });
    }
  }
  const startsWord = (name: string) => name.split(/[\s\-/×]+/).some((w) => w.startsWith(q));
  return [...byName.entries()]
    .filter(([key]) => key.includes(q))
    .sort(
      ([a, x], [b, y]) =>
        Number(b.startsWith(q)) - Number(a.startsWith(q)) ||
        Number(startsWord(b)) - Number(startsWord(a)) ||
        y.uses - x.uses ||
        a.localeCompare(b),
    )
    .slice(0, limit)
    .map(([, s]) => s);
}
