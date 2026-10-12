import { bestOffer, breakdown, laborCents, marginTone, savingsPercent } from './calc';

test('Kosten gegen Erlös mit Betriebskosten-Zuschlag', () => {
  const b = breakdown({
    revenueCents: 100000,
    materialCents: 30000,
    laborCents: 40000,
    overheadPercent: 10,
  });
  expect(b.overheadCents).toBe(7000);
  expect(b.costCents).toBe(77000);
  expect(b.profitCents).toBe(23000);
  expect(b.marginPercent).toBe(23);
  expect(marginTone(b.marginPercent)).toBe('success');
});

test('Verlust und Ampel', () => {
  const b = breakdown({
    revenueCents: 10000,
    materialCents: 9000,
    laborCents: 2000,
    overheadPercent: 0,
  });
  expect(b.profitCents).toBe(-1000);
  expect(b.marginPercent).toBe(-10);
  expect(marginTone(b.marginPercent)).toBe('danger');
  expect(marginTone(8)).toBe('warning');
  expect(
    breakdown({ revenueCents: 0, materialCents: 0, laborCents: 0, overheadPercent: 10 })
      .marginPercent,
  ).toBe(0);
});

test('Lohnkosten aus Minuten', () => {
  expect(laborCents(90, 4200)).toBe(6300);
  expect(laborCents(1, 4000)).toBe(67);
});

test('Empfehlung nimmt günstigsten aktuellen Preis, veraltete nur notfalls', () => {
  const now = new Date('2026-10-12T12:00:00Z');
  const fresh = '2026-10-01T00:00:00Z';
  const old = '2026-01-01T00:00:00Z';
  const offers = [
    { supplierId: 'a', priceCents: 1790, updatedAt: fresh },
    { supplierId: 'b', priceCents: 1949, updatedAt: fresh },
    { supplierId: 'c', priceCents: 1680, updatedAt: old },
  ];
  expect(bestOffer(offers, now)).toMatchObject({ supplierId: 'a', outdated: false });
  expect(bestOffer([offers[2]!], now)).toMatchObject({ supplierId: 'c', outdated: true });
  expect(bestOffer([], now)).toBeUndefined();
  expect(savingsPercent(offers, 1790)).toBe(8);
});
