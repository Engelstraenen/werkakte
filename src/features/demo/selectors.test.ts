import { invoices, materialRequests, media, projects, quotes } from './data';
import { openTasks } from './selectors';

test('leitet überfällige Rechnung, Nachfassen, Entwurf, Mangel und Anfrage ab', () => {
  const texts = openTasks(projects, quotes, invoices, media, materialRequests).map((t) => t.text);
  const overdue = invoices.find((i) => i.id === 'r1')!;
  expect(texts).toContain(`Rechnung ${overdue.number} überfällig`);
  expect(texts).toContain('Angebot A-2026-0041 nachfassen');
  expect(texts).toContain('Angebot A-2026-0044 fertigstellen');
  expect(texts.some((t) => t.startsWith('Problem:'))).toBe(true);
  expect(texts).toContain('Material bestellen: Randdämmstreifen 8 mm (2 Rollen)');
  // bereits bestellte Anfrage erzeugt keine Aufgabe
  expect(texts.some((t) => t.includes('Fugenmasse'))).toBe(false);
  expect(texts).toContain('Neue Anfrage – Termin vereinbaren');
  // Abschlagsrechnung ist noch nicht fällig.
  expect(texts.some((t) => t.includes('R-2026-0029'))).toBe(false);
});
