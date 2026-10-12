import { invoices, media, projects, quotes } from './data';
import { openTasks } from './selectors';

test('leitet überfällige Rechnung, Nachfassen, Entwurf, Mangel und Anfrage ab', () => {
  const texts = openTasks(projects, quotes, invoices, media).map((t) => t.text);
  const overdue = invoices.find((i) => i.id === 'r1')!;
  expect(texts).toContain(`Rechnung ${overdue.number} überfällig`);
  expect(texts).toContain('Angebot A-2026-0041 nachfassen');
  expect(texts).toContain('Angebot A-2026-0044 fertigstellen');
  expect(texts.some((t) => t.startsWith('Mangel klären'))).toBe(true);
  expect(texts).toContain('Neue Anfrage – Termin vereinbaren');
  // Abschlagsrechnung ist noch nicht fällig.
  expect(texts.some((t) => t.includes('R-2026-0029'))).toBe(false);
});
