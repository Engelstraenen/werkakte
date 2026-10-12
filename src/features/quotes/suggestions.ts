import type { CatalogItem, DocItem, Quote } from '@/features/demo/types';

export type Suggestion = Pick<
  DocItem,
  'name' | 'unit' | 'unitPriceCents' | 'vatRate' | 'catalogId'
> & {
  uses: number;
};

/**
 * Vorschläge beim Tippen einer Position: Katalog + alles, was in früheren Angeboten stand.
 * Wortanfang vor Treffer mitten im Wort, danach häufig benutzte zuerst.
 */
export function suggest(
  query: string,
  catalog: CatalogItem[],
  quotes: Quote[],
  limit = 6,
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
  for (const quote of quotes) {
    for (const it of quote.items) {
      const key = it.name.toLowerCase();
      const known = byName.get(key);
      if (known) known.uses += 1;
      else byName.set(key, { ...it, uses: 1 });
    }
  }
  const startsWord = (name: string) => name.split(/[\s\-/×]+/).some((w) => w.startsWith(q));
  return [...byName.entries()]
    .filter(([key]) => key.includes(q))
    .sort(
      ([a, x], [b, y]) =>
        Number(startsWord(b)) - Number(startsWord(a)) || y.uses - x.uses || a.localeCompare(b),
    )
    .slice(0, limit)
    .map(([, s]) => s);
}
