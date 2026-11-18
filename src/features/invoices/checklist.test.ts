import { invoiceChecks, laborGrossCents, missingRequired } from './checklist';
import type { Customer, Invoice } from '@/features/demo/types';

const privat: Customer = {
  id: 'c',
  type: 'privat',
  name: 'Familie Test',
  street: 'Weg 1',
  zipCity: '33602 Bielefeld',
  phone: '',
  email: '',
};
const draft = (items: Invoice['items'], serviceDate?: string): Invoice => ({
  id: 'r',
  projectId: 'p',
  number: '',
  date: '2026-11-19T00:00:00.000Z',
  dueDate: '2026-12-03T00:00:00.000Z',
  serviceDate,
  type: 'einzel',
  status: 'entwurf',
  items,
});
const std = {
  id: 'a',
  name: 'Monteurstunde',
  unit: 'Std',
  qtyMilli: 2000,
  unitPriceCents: 6800,
  vatRate: 19 as const,
};

test('leere Rechnung: Positionen, Preise und Leistungsdatum fehlen', () => {
  const missing = missingRequired(invoiceChecks(draft([]), privat, { taxNumber: '1/2/3' }));
  expect(missing.map((c) => c.key)).toEqual(['leistungsdatum', 'positionen', 'preise']);
});

test('Position ohne Preis blockiert den Versand', () => {
  const zero = { ...std, unitPriceCents: 0 };
  const missing = missingRequired(invoiceChecks(draft([zero], 'x'), privat, { taxNumber: '1' }));
  expect(missing.map((c) => c.key)).toEqual(['preise']);
});

test('Privatkunde: Arbeitskosten brutto für § 35a', () => {
  expect(laborGrossCents([std])).toBe(16184); // 2 × 68 € = 136 € + 19 %
  const keys = invoiceChecks(draft([std], 'x'), privat, { taxNumber: '1' }).map((c) => c.key);
  expect(keys).toContain('aufbewahrung');
  expect(keys).toContain('lohn');
});

test('Firmenkunde: keine Privat-Hinweise', () => {
  const keys = invoiceChecks(
    draft([std], 'x'),
    { ...privat, type: 'gewerblich' },
    { taxNumber: '1' },
  ).map((c) => c.key);
  expect(keys).not.toContain('aufbewahrung');
});
