import type { DocItem, Invoice, Quote } from '@/features/demo/types';
import { documentTotals } from '@/lib/money';

export type InvoiceKind = Invoice['type'];

export type InvoiceOption = {
  kind: InvoiceKind;
  recommended: boolean;
  /** Netto-Betrag, um den es geht (Abschlag: Vorschlag, Schluss: Summe der Abzüge). */
  cents: number;
};

/** Ab diesem Auftragswert (netto) empfiehlt die App einen Abschlag vorab fürs Material. */
export const ABSCHLAG_AB_CENTS = 500000;
export const ABSCHLAG_PROZENT = 30;
/** Wählbare Abschlagshöhen (Material + Vorbereitung schwanken je Auftrag stark). */
export const ABSCHLAG_STUFEN = [20, 30, 40, 50] as const;

/** Abschlag in Cent aus dem Angebot (netto). */
export const abschlagCents = (quotes: Quote[], percent = ABSCHLAG_PROZENT) => {
  const quote = baseQuote(quotes);
  return quote ? Math.round((documentTotals(quote.items).netCents * percent) / 100) : 0;
};

/** Angebot, nach dem abgerechnet wird: angenommen vor versendet, das neueste zuerst. */
export function baseQuote(quotes: Quote[]): Quote | undefined {
  const pick = (s: Quote['status']) =>
    quotes.filter((q) => q.status === s).sort((a, b) => b.date.localeCompare(a.date))[0];
  return pick('angenommen') ?? pick('versendet');
}

const sentAbschlaege = (invoices: Invoice[]) =>
  invoices.filter((i) => i.type === 'abschlag' && i.status !== 'entwurf');

/**
 * Was für eine Rechnung passt jetzt? Die App erkennt es aus dem Projekt:
 * - Abschlag schon verschickt → Schlussrechnung (zieht ihn ab), weiterer Abschlag möglich.
 * - Sonst: großer Auftrag → Abschlag vorab fürs Material, kleiner Auftrag → gleich Gesamtrechnung.
 */
export function invoiceOptions(quotes: Quote[], invoices: Invoice[]): InvoiceOption[] {
  const quote = baseQuote(quotes);
  const net = quote ? documentTotals(quote.items).netCents : 0;
  const abschlag = Math.round((net * ABSCHLAG_PROZENT) / 100);
  const done = sentAbschlaege(invoices);
  if (done.length) {
    const paid = done.reduce((sum, i) => sum + documentTotals(i.items).netCents, 0);
    return [
      { kind: 'schluss', recommended: true, cents: paid },
      { kind: 'abschlag', recommended: false, cents: abschlag },
    ];
  }
  const big = net >= ABSCHLAG_AB_CENTS;
  return [
    { kind: 'abschlag', recommended: big, cents: abschlag },
    { kind: 'einzel', recommended: !big, cents: net },
  ];
}

/** Rechnungsentwurf der gewählten Art. Nummer kommt erst beim Versenden (lückenlos). */
export function buildInvoice(
  kind: InvoiceKind,
  projectId: string,
  quotes: Quote[],
  invoices: Invoice[],
  id: string,
  now = new Date(),
  percent: number = ABSCHLAG_PROZENT,
): Invoice {
  const quote = baseQuote(quotes);
  const done = sentAbschlaege(invoices);
  let items: DocItem[] = [];
  if (kind === 'abschlag') {
    const n = done.length + 1;
    items = [
      {
        id: `${id}-0`,
        name: quote
          ? `${n}. Abschlag (${percent} %) zum Angebot ${quote.number} – Material und Vorbereitung`
          : `${n}. Abschlag – Material und Vorbereitung`,
        unit: 'pauschal',
        qtyMilli: 1000,
        unitPriceCents: abschlagCents(quotes, percent),
        vatRate: 19,
      },
    ];
  } else {
    items = (quote?.items ?? []).map((it, i) => ({ ...it, id: `${id}-${i}` }));
    if (kind === 'schluss')
      for (const a of done)
        items.push({
          id: `${id}-abzug-${a.id}`,
          name: `abzüglich Abschlag ${a.number}`,
          unit: 'pauschal',
          qtyMilli: 1000,
          unitPriceCents: -documentTotals(a.items).netCents,
          vatRate: 19,
        });
  }
  return {
    id,
    projectId,
    quoteId: quote?.id,
    number: '',
    date: now.toISOString(),
    serviceDate: now.toISOString(),
    dueDate: new Date(now.getTime() + 14 * 86400000).toISOString(),
    type: kind,
    status: 'entwurf',
    items,
  };
}
