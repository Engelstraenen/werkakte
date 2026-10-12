// Nummernkreise für Angebote und Rechnungen, vom Betrieb selbst festgelegt.

export type NumberFormat = {
  prefix: string;
  /** Nächste zu vergebende Zahl. */
  next: number;
  /** Mindestanzahl Stellen, mit führenden Nullen aufgefüllt (1 = keine Nullen). */
  digits: number;
  suffix: string;
};

/** Platzhalter für die aktuelle Jahreszahl in Präfix/Suffix. */
export const YEAR = '{Jahr}';

const fill = (text: string, date: Date) => text.split(YEAR).join(String(date.getFullYear()));

export const formatNumber = (f: NumberFormat, n = f.next, date = new Date()) =>
  `${fill(f.prefix, date)}${String(n).padStart(Math.max(1, f.digits), '0')}${fill(f.suffix, date)}`;

export type NumberingError = 'zahl' | 'kleiner' | 'stellen' | 'leer';

/** Prüft eine Änderung. Die Zahl darf nicht sinken – sonst drohen doppelte Nummern (§ 14 UStG). */
export function validateNumbering(
  next: NumberFormat,
  current: NumberFormat,
): NumberingError | undefined {
  if (!Number.isInteger(next.next) || next.next < 1) return 'zahl';
  if (next.next < current.next) return 'kleiner';
  if (!Number.isInteger(next.digits) || next.digits < 1 || next.digits > 8) return 'stellen';
  if (!formatNumber(next).trim()) return 'leer';
  return undefined;
}
