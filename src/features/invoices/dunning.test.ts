import { daysOverdue, dunningLetter, newDunning, nextDunningLevel } from './dunning';
import type { Invoice } from '@/features/demo/types';

const inv: Invoice = {
  id: 'r',
  projectId: 'p',
  number: 'R-2026-0007',
  date: '2026-10-01T00:00:00.000Z',
  sentAt: '2026-10-01T00:00:00.000Z',
  dueDate: '2026-10-15T00:00:00.000Z',
  type: 'einzel',
  status: 'versendet',
  items: [{ id: 'i', name: 'X', unit: 'Stk', qtyMilli: 1000, unitPriceCents: 10000, vatRate: 19 }],
};

test('Stufen 1 → 2 → 3, danach keine weitere', () => {
  expect(nextDunningLevel(inv)).toBe(1);
  const d1 = { ...inv, dunning: [newDunning(1)] };
  expect(nextDunningLevel(d1)).toBe(2);
  const d3 = { ...inv, dunning: [newDunning(1), newDunning(2), newDunning(3)] };
  expect(nextDunningLevel(d3)).toBeNull();
});

test('Überfällig in Tagen', () => {
  expect(daysOverdue(inv, new Date('2026-10-25T12:00:00.000Z'))).toBe(10);
  expect(daysOverdue(inv, new Date('2026-10-01T00:00:00.000Z'))).toBe(0);
});

test('Frist: 7 Tage bei Erinnerung, Brief nennt offenen Betrag brutto', () => {
  const d = newDunning(1, new Date('2026-11-01T00:00:00.000Z'));
  expect(d.deadline).toBe('2026-11-08T00:00:00.000Z');
  const l = dunningLetter(inv, d, { iban: 'DE00', name: 'Firma' });
  expect(l.amounts[1]![1]).toContain('119,00');
  expect(l.paragraphs.join(' ')).toContain('R-2026-0007');
});
