import type { Company, Customer, DocItem, Invoice } from '@/features/demo/types';
import { isLabor } from '@/features/quotes/trades';
import { lineTotalCents } from '@/lib/money';

/**
 * Pflichtangaben einer Rechnung (§ 14 Abs. 4 UStG) als Checkliste – damit der Handwerker
 * weiß, was drauf muss, und nichts vergisst. `required` = ohne das kein Versand.
 */
export type CheckKey =
  | 'kunde'
  | 'leistungsdatum'
  | 'positionen'
  | 'preise'
  | 'steuernummer'
  | 'nummer'
  | 'aufbewahrung'
  | 'lohn';

export type Check = { key: CheckKey; ok: boolean; required: boolean };

/** Arbeitskosten brutto – Privatkunden können 20 % davon absetzen (§ 35a EStG). */
export function laborGrossCents(items: DocItem[]): number {
  return items
    .filter((it) => it.unitPriceCents > 0 && isLabor(it.name, it.unit))
    .reduce((sum, it) => sum + Math.round((lineTotalCents(it) * (100 + it.vatRate)) / 100), 0);
}

export function invoiceChecks(
  invoice: Invoice,
  customer: Customer,
  company: Pick<Company, 'taxNumber'>,
): Check[] {
  const checks: Check[] = [
    { key: 'kunde', ok: !!customer.street.trim() && !!customer.zipCity.trim(), required: true },
    { key: 'leistungsdatum', ok: !!invoice.serviceDate, required: true },
    { key: 'positionen', ok: invoice.items.length > 0, required: true },
    {
      key: 'preise',
      ok: invoice.items.length > 0 && invoice.items.every((it) => it.unitPriceCents !== 0),
      required: true,
    },
    { key: 'steuernummer', ok: !!company.taxNumber.trim(), required: true },
    { key: 'nummer', ok: true, required: false },
  ];
  if (customer.type === 'privat') {
    checks.push({ key: 'aufbewahrung', ok: true, required: false });
    checks.push({ key: 'lohn', ok: laborGrossCents(invoice.items) > 0, required: false });
  }
  return checks;
}

export const missingRequired = (checks: Check[]) => checks.filter((c) => c.required && !c.ok);
