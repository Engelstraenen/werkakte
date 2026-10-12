import type { DocItem, Invoice, Quote } from '@/features/demo/types';
import { documentTotals } from '@/lib/money';

/**
 * Rechnung aus angenommenem Angebot. Gab es schon Abschlagsrechnungen, wird es eine
 * Schlussrechnung: alle Angebotspositionen, danach je Abschlag eine Minus-Zeile (netto).
 */
export function invoiceFromQuote(
  quote: Quote,
  existing: Invoice[],
  id: string,
  now = new Date(),
): Invoice {
  const abschlaege = existing.filter(
    (i) => i.quoteId === quote.id && i.type === 'abschlag' && i.status !== 'entwurf',
  );
  const items: DocItem[] = quote.items.map((it, n) => ({ ...it, id: `${id}-${n}` }));
  for (const a of abschlaege) {
    items.push({
      id: `${id}-abzug-${a.id}`,
      name: `abzüglich Abschlag ${a.number}`,
      unit: 'pausch.',
      qtyMilli: 1000,
      unitPriceCents: -documentTotals(a.items).netCents,
      vatRate: 19,
    });
  }
  const due = new Date(now.getTime() + 14 * 86400000);
  return {
    id,
    projectId: quote.projectId,
    quoteId: quote.id,
    number: '', // wird erst beim Versenden vergeben (lückenlos)
    date: now.toISOString(),
    dueDate: due.toISOString(),
    type: abschlaege.length ? 'schluss' : 'einzel',
    status: 'entwurf',
    items,
  };
}
