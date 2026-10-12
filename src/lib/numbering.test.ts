import { formatNumber, validateNumbering, type NumberFormat } from './numbering';

const d = new Date('2026-10-12T12:00:00Z');
const base: NumberFormat = { prefix: 'R-{Jahr}-', next: 31, digits: 4, suffix: '' };

test('Format mit Jahr, führenden Nullen und Suffix', () => {
  expect(formatNumber(base, undefined, d)).toBe('R-2026-0031');
  expect(formatNumber({ prefix: 'RE', next: 7, digits: 1, suffix: '/KA' }, undefined, d)).toBe(
    'RE7/KA',
  );
  expect(
    formatNumber({ prefix: '', next: 12345, digits: 3, suffix: '-{Jahr}' }, undefined, d),
  ).toBe('12345-2026');
});

test('Zahl darf nicht sinken, Stellen 1–8', () => {
  expect(validateNumbering({ ...base, next: 40 }, base)).toBeUndefined();
  expect(validateNumbering({ ...base, next: 30 }, base)).toBe('kleiner');
  expect(validateNumbering({ ...base, next: 0 }, base)).toBe('zahl');
  expect(validateNumbering({ ...base, digits: 9 }, base)).toBe('stellen');
});
