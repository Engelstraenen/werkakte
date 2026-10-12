import { documentTotals, formatEuro, lineTotalCents, parseEuro, parseQty } from './money';

const nbsp = (s: string) => s.replace(/ /g, ' ');

test('Zeilensumme mit Menge in Tausendsteln und Rabatt', () => {
  expect(lineTotalCents({ qtyMilli: 2500, unitPriceCents: 4590, vatRate: 19 })).toBe(11475);
  expect(
    lineTotalCents({ qtyMilli: 1000, unitPriceCents: 10000, vatRate: 19, discountPercent: 10 }),
  ).toBe(9000);
  // 0,333 × 1,00 € = 0,333 € → kaufmännisch 0,33 €
  expect(lineTotalCents({ qtyMilli: 333, unitPriceCents: 100, vatRate: 19 })).toBe(33);
});

test('Summen mit 19 % und 7 %', () => {
  const t = documentTotals([
    { qtyMilli: 1000, unitPriceCents: 10000, vatRate: 19 },
    { qtyMilli: 2000, unitPriceCents: 5000, vatRate: 7 },
  ]);
  expect(t.netCents).toBe(20000);
  expect(t.vat).toEqual([
    { rate: 19, baseCents: 10000, vatCents: 1900 },
    { rate: 7, baseCents: 10000, vatCents: 700 },
  ]);
  expect(t.grossCents).toBe(22600);
});

test('Kleinunternehmer: keine MwSt', () => {
  const t = documentTotals([{ qtyMilli: 1000, unitPriceCents: 10000, vatRate: 19 }], true);
  expect(t.vat).toEqual([]);
  expect(t.grossCents).toBe(10000);
});

test('Euro-Format', () => {
  expect(nbsp(formatEuro(123456))).toBe('1.234,56 €');
});

test('Euro-Eingabe parsen', () => {
  expect(parseEuro('12,50')).toBe(1250);
  expect(parseEuro('1.234,5 €')).toBe(123450);
  expect(parseEuro('12.50')).toBe(1250);
  expect(parseEuro('7')).toBe(700);
  expect(parseEuro('1.234')).toBe(123400);
  expect(parseEuro('abc')).toBeUndefined();
  expect(parseEuro('')).toBeUndefined();
});

test('Menge parsen', () => {
  expect(parseQty('2,5')).toBe(2500);
  expect(parseQty('24')).toBe(24000);
  expect(parseQty('0')).toBeUndefined();
  expect(parseQty('x')).toBeUndefined();
});
