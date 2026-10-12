// Kalkulation: Kosten gegen Erlös. Alles in Cent (Integer).

export type CostBreakdown = {
  revenueCents: number;
  materialCents: number;
  laborCents: number;
  overheadCents: number;
  costCents: number;
  profitCents: number;
  /** Gewinn in % vom Erlös, eine Nachkommastelle. */
  marginPercent: number;
};

export function breakdown(input: {
  revenueCents: number;
  materialCents: number;
  laborCents: number;
  overheadPercent: number;
}): CostBreakdown {
  const { revenueCents, materialCents, laborCents, overheadPercent } = input;
  const overheadCents = Math.round(((materialCents + laborCents) * overheadPercent) / 100);
  const costCents = materialCents + laborCents + overheadCents;
  const profitCents = revenueCents - costCents;
  const marginPercent = revenueCents ? Math.round((profitCents * 1000) / revenueCents) / 10 : 0;
  return {
    revenueCents,
    materialCents,
    laborCents,
    overheadCents,
    costCents,
    profitCents,
    marginPercent,
  };
}

/** Ampel: ab 15 % grün, ab 5 % gelb, darunter rot. */
export const marginTone = (marginPercent: number) =>
  marginPercent >= 15 ? 'success' : marginPercent >= 5 ? 'warning' : 'danger';

export const laborCents = (minutes: number, hourlyCostCents: number) =>
  Math.round((minutes * hourlyCostCents) / 60);

export type PriceOffer = { supplierId: string; priceCents: number; updatedAt: string };

/** Preise älter als 90 Tage gelten als veraltet. */
export const isOutdated = (updatedAt: string, now = new Date()) =>
  now.getTime() - new Date(updatedAt).getTime() > 90 * 86400000;

/**
 * Empfehlung: günstigster aktueller Preis. Nur wenn alle Preise veraltet sind,
 * wird der günstigste veraltete genommen (und als veraltet markiert).
 */
export function bestOffer<T extends PriceOffer>(offers: T[], now = new Date()) {
  if (offers.length === 0) return undefined;
  const current = offers.filter((o) => !isOutdated(o.updatedAt, now));
  const pool = current.length ? current : offers;
  const best = pool.reduce((a, b) => (b.priceCents < a.priceCents ? b : a));
  return { ...best, outdated: current.length === 0 };
}

/** Ersparnis in % des besten gegenüber dem teuersten Angebot. */
export function savingsPercent(offers: PriceOffer[], bestCents: number): number {
  const max = Math.max(...offers.map((o) => o.priceCents));
  return max > 0 ? Math.round(((max - bestCents) * 100) / max) : 0;
}
