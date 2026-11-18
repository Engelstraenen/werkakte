import { buildInvoice, invoiceOptions } from './build';
import type { Invoice, Quote } from '@/features/demo/types';

const quote = (net: number, status: Quote['status'] = 'angenommen'): Quote => ({
  id: 'q1',
  projectId: 'p1',
  number: 'A-1',
  date: '2026-11-01T00:00:00.000Z',
  validUntil: '2026-12-01T00:00:00.000Z',
  status,
  items: [
    { id: 'i1', name: 'Wärmepumpe', unit: 'Stk', qtyMilli: 1000, unitPriceCents: net, vatRate: 19 },
  ],
});

const abschlag: Invoice = {
  id: 'r1',
  projectId: 'p1',
  quoteId: 'q1',
  number: 'R-1',
  date: '2026-11-02T00:00:00.000Z',
  dueDate: '2026-11-16T00:00:00.000Z',
  type: 'abschlag',
  status: 'bezahlt',
  items: [
    {
      id: 'a',
      name: 'Abschlag',
      unit: 'pauschal',
      qtyMilli: 1000,
      unitPriceCents: 600000,
      vatRate: 19,
    },
  ],
};

test('großer Auftrag ohne Abschlag → Abschlag vorab empfohlen (30 %)', () => {
  const [first, second] = invoiceOptions([quote(2000000)], []);
  expect(first).toEqual({ kind: 'abschlag', recommended: true, cents: 600000 });
  expect(second!.kind).toBe('einzel');
  expect(second!.recommended).toBe(false);
});

test('kleiner Auftrag → gleich Gesamtrechnung empfohlen', () => {
  const opts = invoiceOptions([quote(80000)], []);
  expect(opts.find((o) => o.recommended)!.kind).toBe('einzel');
});

test('Abschlag schon verschickt → Schlussrechnung empfohlen, zieht ihn ab', () => {
  const opts = invoiceOptions([quote(2000000)], [abschlag]);
  expect(opts[0]).toEqual({ kind: 'schluss', recommended: true, cents: 600000 });
  const inv = buildInvoice('schluss', 'p1', [quote(2000000)], [abschlag], 'r2');
  expect(inv.type).toBe('schluss');
  expect(inv.items.map((i) => i.unitPriceCents)).toEqual([2000000, -600000]);
  expect(inv.number).toBe('');
});

test('Abschlag ohne Angebot → eine Zeile zum Ausfüllen', () => {
  const inv = buildInvoice('abschlag', 'p1', [], [], 'r3');
  expect(inv.items).toHaveLength(1);
  expect(inv.items[0]!.unitPriceCents).toBe(0);
  expect(inv.items[0]!.name).toContain('1. Abschlag');
});

test('Entwurfs-Angebote zählen nicht als Grundlage', () => {
  const inv = buildInvoice('einzel', 'p1', [quote(50000, 'entwurf')], [], 'r4');
  expect(inv.items).toEqual([]);
});

test('Abschlag-Prozent wählbar: 50 % von 20.000 € = 10.000 €', () => {
  const inv = buildInvoice('abschlag', 'p1', [quote(2000000)], [], 'r5', new Date(), 50);
  expect(inv.items[0]!.unitPriceCents).toBe(1000000);
  expect(inv.items[0]!.name).toContain('(50 %)');
});
