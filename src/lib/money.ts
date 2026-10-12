// Geld immer in Cent (Integer), Mengen in Tausendsteln (Integer) – nie Floats (CLAUDE.md §7).

export type VatRate = 19 | 7 | 0;

export type LineItem = {
  qtyMilli: number;
  unitPriceCents: number;
  vatRate: VatRate;
  discountPercent?: number;
};

export type Totals = {
  netCents: number;
  vat: { rate: VatRate; baseCents: number; vatCents: number }[];
  grossCents: number;
};

const euro = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });
const qty = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 3 });

export const formatEuro = (cents: number) => euro.format(cents / 100);
export const formatQty = (qtyMilli: number) => qty.format(qtyMilli / 1000);

export function lineTotalCents(item: LineItem): number {
  const gross = Math.round((item.qtyMilli * item.unitPriceCents) / 1000);
  const discount = item.discountPercent ? Math.round((gross * item.discountPercent) / 100) : 0;
  return gross - discount;
}

/** MwSt wird pro Steuersatz auf die Summe berechnet (nicht pro Zeile), wie auf Rechnungen üblich. */
export function documentTotals(items: LineItem[], kleinunternehmer = false): Totals {
  const byRate = new Map<VatRate, number>();
  for (const item of items) {
    const rate = kleinunternehmer ? 0 : item.vatRate;
    byRate.set(rate, (byRate.get(rate) ?? 0) + lineTotalCents(item));
  }
  const vat = [...byRate]
    .filter(([rate]) => rate > 0)
    .sort(([a], [b]) => b - a)
    .map(([rate, baseCents]) => ({
      rate,
      baseCents,
      vatCents: Math.round((baseCents * rate) / 100),
    }));
  const netCents = [...byRate.values()].reduce((a, b) => a + b, 0);
  const grossCents = netCents + vat.reduce((a, v) => a + v.vatCents, 0);
  return { netCents, vat, grossCents };
}
