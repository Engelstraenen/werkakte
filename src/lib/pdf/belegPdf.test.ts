import { bytesToBase64 } from './base64';
import { belegFileName, buildBelegPdf, pdfSafe } from './belegPdf';
import { company, customers } from '@/features/demo/data';

const items = Array.from({ length: 40 }, (_, i) => ({
  id: `i${i}`,
  name: `Position ${i + 1} – Heizkörper tauschen inkl. Ventile, Thermostatkopf und Entlüften „Bad“`,
  unit: 'Stk',
  qtyMilli: 1000,
  unitPriceCents: 42000,
  vatRate: 19 as const,
}));

test('PDF wird erzeugt, auch mit vielen Positionen (mehrere Seiten)', async () => {
  const bytes = await buildBelegPdf({
    title: 'Rechnung',
    number: 'R-2026-0012',
    isInvoice: true,
    date: '2026-11-19T00:00:00.000Z',
    dueDate: '2026-12-03T00:00:00.000Z',
    serviceDate: '2026-11-18T00:00:00.000Z',
    company,
    customer: customers[0]!,
    projectTitle: 'Badsanierung OG',
    projectAddress: 'Lindenallee 4, 76133 Karlsruhe',
    items,
    notes: [
      'Sie sind gesetzlich verpflichtet, diese Rechnung zwei Jahre aufzubewahren (§ 14b UStG).',
    ],
  });
  const head = String.fromCharCode(...bytes.slice(0, 5));
  expect(head).toBe('%PDF-');
  expect(bytes.length).toBeGreaterThan(3000);
});

test('Zeichen außerhalb der PDF-Schrift werden ersetzt statt abzustürzen', () => {
  expect(pdfSafe('Größe → 1 000 €')).toBe('Größe -> 1 000 €');
  expect(pdfSafe('Emoji 🔥')).toBe('Emoji ??');
});

test('Dateiname ohne Umlaute und Sonderzeichen', () => {
  expect(belegFileName('Rechnung', 'R-2026-0012', 'Peter Müller')).toBe(
    'Rechnung_R-2026-0012_Peter_Mueller.pdf',
  );
  expect(belegFileName('Angebot', '', 'Bäckerei Krämer')).toBe(
    'Angebot_Entwurf_Baeckerei_Kraemer.pdf',
  );
});

test('Base64 wie btoa', () => {
  const b = new Uint8Array([77, 97, 110, 0, 255]);
  expect(bytesToBase64(b)).toBe(btoa(String.fromCharCode(...b)));
});
