import { invoiceFromQuote } from './fromQuote';
import { invoices, quotes } from '@/features/demo/data';
import { documentTotals } from '@/lib/money';

test('Schlussrechnung zieht versendeten Abschlag ab', () => {
  const q3 = quotes.find((q) => q.id === 'q3')!;
  const inv = invoiceFromQuote(q3, invoices, 'neu');
  expect(inv.type).toBe('schluss');
  expect(inv.number).toBe('');
  expect(inv.status).toBe('entwurf');
  expect(inv.items).toHaveLength(q3.items.length + 1);
  // 6.071,15 € Angebot − 2.428,46 € Abschlag = 3.642,69 € netto
  expect(documentTotals(inv.items).netCents).toBe(607115 - 242846);
});

test('Ohne Abschlag: Einzelrechnung mit allen Positionen', () => {
  const q4 = quotes.find((q) => q.id === 'q4')!;
  const inv = invoiceFromQuote(q4, invoices, 'neu');
  expect(inv.type).toBe('einzel');
  expect(documentTotals(inv.items).netCents).toBe(documentTotals(q4.items).netCents);
});
