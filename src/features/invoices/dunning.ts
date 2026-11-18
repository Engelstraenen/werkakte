import type { Company, Invoice } from '@/features/demo/types';
import { formatDate } from '@/lib/date';
import { documentTotals, formatEuro } from '@/lib/money';

/** Mahnstufen: 1 freundliche Zahlungserinnerung, 2 Mahnung, 3 letzte Mahnung. */
export type DunningLevel = 1 | 2 | 3;
export type Dunning = { level: DunningLevel; sentAt: string; deadline: string };

export const DUNNING_TITLE: Record<DunningLevel, string> = {
  1: 'Zahlungserinnerung',
  2: '1. Mahnung',
  3: 'Letzte Mahnung',
};

/** Neue Zahlungsfrist je Stufe (Tage ab heute). */
const DAYS: Record<DunningLevel, number> = { 1: 7, 2: 7, 3: 10 };

export const nextDunningLevel = (inv: Invoice): DunningLevel | null => {
  const last = inv.dunning?.at(-1)?.level ?? 0;
  return last >= 3 ? null : ((last + 1) as DunningLevel);
};

/** Tage seit Fälligkeit (0 = noch nicht überfällig). */
export const daysOverdue = (inv: Invoice, now = new Date()) =>
  Math.max(0, Math.floor((now.getTime() - new Date(inv.dueDate).getTime()) / 86400000));

export function newDunning(level: DunningLevel, now = new Date()): Dunning {
  return {
    level,
    sentAt: now.toISOString(),
    deadline: new Date(now.getTime() + DAYS[level] * 86400000).toISOString(),
  };
}

/** Brieftext der Stufe – sachlich, rechtlich unkritisch (keine Gebühren ohne Vereinbarung). */
export function dunningLetter(inv: Invoice, d: Dunning, company: Pick<Company, 'iban' | 'name'>) {
  const open = formatEuro(documentTotals(inv.items).grossCents);
  const ref = `unsere Rechnung ${inv.number} vom ${formatDate(inv.sentAt ?? inv.date)}`;
  const pay = `Bitte überweisen Sie ${open} bis zum ${formatDate(d.deadline)} auf ${company.iban} (Verwendungszweck: ${inv.number}).`;
  const paragraphs =
    d.level === 1
      ? [
          'Sehr geehrte Damen und Herren,',
          `sicher ist es Ihrer Aufmerksamkeit entgangen: ${ref} war am ${formatDate(inv.dueDate)} fällig. Bis heute konnten wir keinen Zahlungseingang feststellen.`,
          pay,
          'Sollten Sie inzwischen bezahlt haben, betrachten Sie dieses Schreiben bitte als gegenstandslos.',
          `Mit freundlichen Grüßen\n${company.name}`,
        ]
      : d.level === 2
        ? [
            'Sehr geehrte Damen und Herren,',
            `trotz unserer Zahlungserinnerung ist ${ref} noch offen. Sie befinden sich damit in Zahlungsverzug.`,
            pay,
            `Mit freundlichen Grüßen\n${company.name}`,
          ]
        : [
            'Sehr geehrte Damen und Herren,',
            `${ref} ist trotz Erinnerung und Mahnung weiterhin nicht bezahlt.`,
            `${pay} Geht bis dahin keine Zahlung ein, werden wir ohne weitere Ankündigung einen gerichtlichen Mahnbescheid beantragen. Die dadurch entstehenden Kosten gehen zu Ihren Lasten.`,
            `Mit freundlichen Grüßen\n${company.name}`,
          ];
  return {
    meta: [
      ['Zu Rechnung', inv.number],
      ['Rechnungsdatum', formatDate(inv.sentAt ?? inv.date)],
      ['Datum', formatDate(d.sentAt)],
      ['Neue Frist', formatDate(d.deadline)],
    ] as [string, string][],
    amounts: [
      ['Rechnungsbetrag', open],
      ['Offener Betrag', open],
    ] as [string, string][],
    paragraphs,
  };
}
