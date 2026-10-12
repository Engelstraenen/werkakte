import { projectCosting } from './costing';
import { projectCosts, quotes, supplierPrices } from '@/features/demo/data';

test('Badsanierung: Soll aus Angebot, Ist aus erfassten Kosten', () => {
  const { soll, ist } = projectCosting('p1', quotes, supplierPrices, projectCosts);
  // Erlös = Netto des angenommenen Angebots A-2026-0037
  expect(soll?.breakdown.revenueCents).toBe(607115);
  expect(soll?.breakdown.materialCents).toBe(160095);
  expect(soll?.breakdown.laborCents).toBe(229600);
  expect(soll?.minutes).toBe(56 * 60);
  expect(soll?.breakdown.marginPercent).toBe(24.3);

  expect(ist?.breakdown.materialCents).toBe(183740);
  expect(ist?.breakdown.laborCents).toBe(268200);
  expect(ist?.minutes).toBe(62 * 60);
  expect(ist?.breakdown.marginPercent).toBe(12.2);
});

test('Ohne Angebot dienen Rechnungen als Soll; ohne Kosten kein Ist', () => {
  const p3 = projectCosting('p3', quotes, supplierPrices, projectCosts);
  expect(p3.soll?.breakdown.revenueCents).toBe(37220);
  expect(p3.ist?.breakdown.profitCents).toBeGreaterThan(0);
  expect(projectCosting('p2', quotes, supplierPrices, projectCosts).ist).toBeUndefined();
  expect(projectCosting('p6', quotes, supplierPrices, projectCosts).soll).toBeUndefined();
});
