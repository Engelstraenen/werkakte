import { buildXRechnung, splitZipCity, unitCode } from './xrechnung';
import { company, customers } from '@/features/demo/data';
import type { Invoice } from '@/features/demo/types';

const firma = customers.find((c) => c.type === 'gewerblich')!;
const inv: Invoice = {
  id: 'r',
  projectId: 'p',
  number: 'R-2026-0031',
  date: '2026-11-19T09:00:00.000Z',
  sentAt: '2026-11-19T09:00:00.000Z',
  dueDate: '2026-12-03T00:00:00.000Z',
  serviceDate: '2026-11-18T00:00:00.000Z',
  type: 'schluss',
  status: 'versendet',
  items: [
    {
      id: 'a',
      name: 'Brennwerttherme & Zubehör',
      unit: 'Stk.',
      qtyMilli: 1000,
      unitPriceCents: 389000,
      vatRate: 19,
    },
    {
      id: 'b',
      name: 'Monteurstunde',
      unit: 'Std.',
      qtyMilli: 16000,
      unitPriceCents: 6800,
      vatRate: 19,
    },
    {
      id: 'c',
      name: 'abzüglich Abschlag R-2026-0020',
      unit: 'pauschal',
      qtyMilli: 1000,
      unitPriceCents: -100000,
      vatRate: 19,
    },
  ],
};

test('Einheiten und Anschrift', () => {
  expect(unitCode('Std.')).toBe('HUR');
  expect(unitCode('m²')).toBe('MTK');
  expect(unitCode('pauschal')).toBe('LS');
  expect(splitZipCity('76133 Karlsruhe')).toEqual({ zip: '76133', city: 'Karlsruhe' });
});

test('XRechnung: Pflichtfelder, Summen, Abzug als negative Menge, Sonderzeichen maskiert', () => {
  const xml = buildXRechnung({
    invoice: inv,
    company,
    customer: firma,
    buyerReference: 'Heizungstausch',
  });
  expect(xml).toContain('urn:xeinkauf.de:kosit:xrechnung_3.0');
  expect(xml).toContain('<cbc:ID>R-2026-0031</cbc:ID>');
  expect(xml).toContain('<cbc:InvoiceTypeCode>380</cbc:InvoiceTypeCode>');
  expect(xml).toContain('Brennwerttherme &amp; Zubehör');
  // 3.890 + 1.088 − 1.000 = 3.978 netto, 755,82 MwSt, 4.733,82 brutto
  expect(xml).toContain(
    '<cbc:LineExtensionAmount currencyID="EUR">3978.00</cbc:LineExtensionAmount>',
  );
  expect(xml).toContain('<cbc:TaxAmount currencyID="EUR">755.82</cbc:TaxAmount>');
  expect(xml).toContain('<cbc:PayableAmount currencyID="EUR">4733.82</cbc:PayableAmount>');
  expect(xml).toContain('<cbc:InvoicedQuantity unitCode="LS">-1</cbc:InvoicedQuantity>');
  expect(xml).toContain('<cbc:PriceAmount currencyID="EUR">1000.00</cbc:PriceAmount>');
  expect(xml).toContain('<cbc:ID>FC</cbc:ID>');
  expect(xml).toContain('<cbc:ActualDeliveryDate>2026-11-18</cbc:ActualDeliveryDate>');
});
