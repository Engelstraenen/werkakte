import { catalog, company, invoices, members } from '@/features/demo/data';
import type { DocItem, ProjectCost, Quote, SupplierPrice } from '@/features/demo/types';
import { bestOffer, breakdown, laborCents, type CostBreakdown } from '@/lib/calc';
import { documentTotals } from '@/lib/money';

export type Costing = { breakdown: CostBreakdown; minutes: number };

export const offersFor = (catalogItemId: string, prices: SupplierPrice[]) =>
  prices.filter((p) => p.catalogItemId === catalogItemId);

/** Vorkalkulation: Material zum besten Einkaufspreis, Arbeit zu internen Kosten. */
export function plannedCosting(items: DocItem[], prices: SupplierPrice[]): Costing {
  let material = 0;
  let labor = 0;
  let minutes = 0;
  for (const it of items) {
    const c = catalog.find((k) => k.id === it.catalogId);
    if (!c) continue; // Freitext/Abschlag ohne Katalogbezug: keine Kosten bekannt
    if (c.type === 'material') {
      const best = bestOffer(offersFor(c.id, prices));
      material += best ? Math.round((it.qtyMilli * best.priceCents) / 1000) : 0;
    } else {
      labor += Math.round((it.qtyMilli * (c.internalCostCents ?? 0)) / 1000);
      if (c.unit === 'Std.') minutes += Math.round((it.qtyMilli * 60) / 1000);
    }
  }
  const revenueCents = documentTotals(items, company.kleinunternehmer).netCents;
  return {
    breakdown: breakdown({
      revenueCents,
      materialCents: material,
      laborCents: labor,
      overheadPercent: company.overheadPercent,
    }),
    minutes,
  };
}

/** Nachkalkulation: von Hand erfasste Material-Kosten und Stunden. */
export function actualCosting(costs: ProjectCost[], revenueCents: number): Costing {
  let material = 0;
  let labor = 0;
  let minutes = 0;
  for (const c of costs) {
    if (c.kind === 'material') material += c.amountCents;
    else {
      const m = members.find((x) => x.id === c.memberId);
      labor += laborCents(c.minutes, m?.hourlyCostCents ?? 0);
      minutes += c.minutes;
    }
  }
  return {
    breakdown: breakdown({
      revenueCents,
      materialCents: material,
      laborCents: labor,
      overheadPercent: company.overheadPercent,
    }),
    minutes,
  };
}

/** Soll-Grundlage: angenommenes Angebot, sonst neuestes Angebot, sonst Rechnungen (ohne Abschläge). */
export function revenueItems(projectId: string, quotes: Quote[]): DocItem[] | undefined {
  const own = quotes
    .filter((q) => q.projectId === projectId)
    .sort((a, b) => b.date.localeCompare(a.date));
  const quote = own.find((q) => q.status === 'angenommen') ?? own[0];
  if (quote) return quote.items;
  const inv = invoices.filter((i) => i.projectId === projectId && i.type !== 'abschlag');
  return inv.length ? inv.flatMap((i) => i.items) : undefined;
}

export function projectCosting(
  projectId: string,
  quotes: Quote[],
  prices: SupplierPrice[],
  costs: ProjectCost[],
) {
  const items = revenueItems(projectId, quotes);
  const soll = items ? plannedCosting(items, prices) : undefined;
  const own = costs.filter((c) => c.projectId === projectId);
  const ist = own.length ? actualCosting(own, soll?.breakdown.revenueCents ?? 0) : undefined;
  return { soll, ist };
}
