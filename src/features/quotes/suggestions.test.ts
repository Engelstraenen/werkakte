import { suggest } from './suggestions';
import { catalog, quotes } from '@/features/demo/data';
import type { Quote } from '@/features/demo/types';

test('Wortanfang zuerst, häufig benutzte vor selten benutzten', () => {
  const names = suggest('flie', catalog, quotes).map((s) => s.name);
  expect(names).toEqual([
    'Fliesenkleber flexibel 25 kg', // Wortanfang
    'Wandfliese 30×60 weiß matt', // in 3 Angeboten
    'Bodenfliese Feinsteinzeug 60×60', // in 2 Angeboten
  ]);
});

test('Freitext aus alten Angeboten wird gelernt', () => {
  const custom: Quote = {
    id: 'x',
    projectId: 'p1',
    number: 'A-X',
    date: '2026-01-01',
    validUntil: '2026-02-01',
    status: 'versendet',
    items: [
      {
        id: 'x1',
        name: 'Farbe Dispersion weiß 10 l',
        unit: 'Eimer',
        qtyMilli: 2000,
        unitPriceCents: 5490,
        vatRate: 19,
      },
    ],
  };
  const [first] = suggest('f', catalog, [custom]);
  expect(first).toMatchObject({ name: 'Farbe Dispersion weiß 10 l', unit: 'Eimer', uses: 1 });
  expect(suggest('', catalog, quotes)).toEqual([]);
});
