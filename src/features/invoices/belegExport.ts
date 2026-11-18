import { Platform } from 'react-native';

import { laborGrossCents } from './checklist';
import { DUNNING_TITLE, dunningLetter } from './dunning';
import { company } from '@/features/demo/data';
import { customerOf } from '@/features/demo/selectors';
import { useDemo } from '@/features/demo/store';
import type { Invoice, Project, Quote } from '@/features/demo/types';
import { de } from '@/i18n/de';
import { buildBelegPdf, belegFileName, type BelegPdfInput } from '@/lib/pdf/belegPdf';
import { loadPdfFonts } from '@/lib/pdf/fonts';
import { savePdf, sharePdf } from '@/lib/pdf/save';
import { formatEuro } from '@/lib/money';

const title = (doc: Quote | Invoice) =>
  'validUntil' in doc
    ? de.beleg.angebot
    : doc.type === 'abschlag'
      ? de.beleg.abschlag
      : doc.type === 'schluss'
        ? de.beleg.schluss
        : de.beleg.rechnung;

/** Druckdaten eines Belegs inkl. aller Pflicht-Hinweise. */
export function belegInput(doc: Quote | Invoice, project: Project): BelegPdfInput {
  const customer = customerOf(project);
  const isInvoice = !('validUntil' in doc);
  const notes: string[] = [];
  if (company.kleinunternehmer) notes.push(de.beleg.kleinHinweis);
  if (isInvoice && customer.type === 'privat') {
    const labor = laborGrossCents(doc.items);
    if (labor > 0) notes.push(de.rechnung.lohnText(formatEuro(labor)));
    notes.push(de.rechnung.aufbewahrungText);
  }
  if (isInvoice && customer.type === 'gewerblich') notes.push(de.pdf.eRechnungHinweis);
  return {
    title: title(doc),
    number: doc.number,
    isInvoice,
    date: doc.date,
    validUntil: isInvoice ? undefined : doc.validUntil,
    dueDate: isInvoice ? doc.dueDate : undefined,
    serviceDate: isInvoice ? (doc.serviceDate ?? doc.date) : undefined,
    company,
    customer,
    projectTitle: project.title,
    projectAddress: `${project.street}, ${project.zipCity}`,
    items: doc.items,
    notes,
    signedAt: isInvoice ? undefined : doc.signedAt,
    signature: isInvoice ? undefined : doc.signature,
  };
}

export const belegName = (doc: Quote | Invoice, project: Project) =>
  belegFileName(title(doc), doc.number, customerOf(project).name);

/** PDF erzeugen und teilen (WhatsApp, Mail, Dateien) – auf dem Handy wird es zusätzlich abgelegt. */
export async function shareBeleg(doc: Quote | Invoice, project: Project): Promise<void> {
  const bytes = await buildBelegPdf(belegInput(doc, project), await loadPdfFonts());
  await sharePdf(bytes, belegName(doc, project));
}

/**
 * Nach dem Versenden: PDF auf dem Handy im App-Ordner „Belege“ ablegen (offline verfügbar).
 * Im Browser nicht – dort liegt der Beleg im Belegarchiv und wird bei Bedarf neu erzeugt.
 */
export function archiveOnDevice(docId: string): void {
  if (Platform.OS === 'web') return;
  const s = useDemo.getState();
  const doc = s.quotes.find((q) => q.id === docId) ?? s.invoices.find((i) => i.id === docId);
  const project = s.projects.find((p) => p.id === doc?.projectId);
  if (!doc || !project) return;
  loadPdfFonts()
    .then((fonts) => buildBelegPdf(belegInput(doc, project), fonts))
    .then((bytes) => savePdf(bytes, belegName(doc, project)))
    .catch(() => undefined); // Ablage ist zusätzlich – Fehler blockieren den Versand nicht
}

/** Zahlungserinnerung / Mahnung als PDF erzeugen und teilen. */
export async function shareDunning(
  inv: Invoice,
  project: Project,
  d: NonNullable<Invoice['dunning']>[number],
): Promise<void> {
  const base = belegInput(inv, project);
  const bytes = await buildBelegPdf(
    { ...base, title: DUNNING_TITLE[d.level], letter: dunningLetter(inv, d, company) },
    await loadPdfFonts(),
  );
  await sharePdf(
    bytes,
    belegFileName(DUNNING_TITLE[d.level], inv.number, customerOf(project).name),
  );
}
