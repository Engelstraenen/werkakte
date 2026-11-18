import type { PDFFont, PDFPage } from 'pdf-lib';

import type { Company, Customer, DocItem } from '@/features/demo/types';
import { formatDate } from '@/lib/date';
import { documentTotals, formatEuro, formatQty, lineTotalCents } from '@/lib/money';

/** Alles, was auf ein Angebot / eine Rechnung gedruckt wird (§ 14 UStG). */
export type BelegPdfInput = {
  title: string;
  number: string;
  isInvoice: boolean;
  date: string;
  validUntil?: string;
  dueDate?: string;
  serviceDate?: string;
  company: Company;
  customer: Customer;
  projectTitle: string;
  projectAddress: string;
  items: DocItem[];
  /** Pflicht- und Zusatzhinweise (§ 35a, Aufbewahrung, § 19 …), je ein Absatz. */
  notes: string[];
  signedAt?: string;
  signature?: { paths: string[]; name: string };
  /** Brief statt Positionen (Zahlungserinnerung/Mahnung): eigene Eckdaten, Beträge, Absätze. */
  letter?: { meta: [string, string][]; amounts: [string, string][]; paragraphs: string[] };
};

const A4: [number, number] = [595.28, 841.89];
const M = 50; // Rand

// Standard-Schrift kann nur WinAnsi: alles andere ersetzen, statt beim Erzeugen abzubrechen.
const ALLOWED = /[^\n\x20-\x7E\xA0-\xFF€„“”‚‘’–—…•™]/g;
export const pdfSafe = (s: string) =>
  s.replace(/[  ]/g, ' ').replace(/→/g, '->').replace(ALLOWED, '?');

function wrap(text: string, font: PDFFont, size: number, width: number): string[] {
  const lines: string[] = [];
  for (const para of pdfSafe(text).split('\n')) {
    let line = '';
    for (const word of para.split(' ')) {
      const next = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(next, size) <= width) line = next;
      else {
        if (line) lines.push(line);
        line = word;
      }
    }
    lines.push(line);
  }
  return lines;
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
const loadPdfLib = () => require('pdf-lib/cjs/index') as typeof import('pdf-lib');
type Fontkit = Parameters<import('pdf-lib').PDFDocument['registerFontkit']>[0];
// eslint-disable-next-line @typescript-eslint/no-require-imports
const loadFontkit = () => require('@pdf-lib/fontkit/dist/fontkit.umd.js') as Fontkit;

/** Erzeugt das PDF (A4) als Bytes – funktioniert auf iPhone, Android und im Browser. */
export async function buildBelegPdf(
  input: BelegPdfInput,
  /** IBM Plex (Hausschrift, eingebettet). Ohne: Helvetica – nur für Tests. */
  fonts?: { regular: Uint8Array; bold: Uint8Array },
): Promise<Uint8Array> {
  // CommonJS-Fassung: Die ESM-Fassung bricht in Metro (tslib-Interop). require() im Funktionsrumpf
  // wird erst beim ersten PDF ausgeführt – der App-Start bleibt schlank.
  const lib = loadPdfLib();
  const { PDFDocument, StandardFonts, rgb } = lib;
  const ORANGE = rgb(1, 0.357, 0.122); // #FF5B1F
  const DARK = rgb(0.055, 0.055, 0.055);
  const GREY = rgb(0.42, 0.42, 0.42);
  const doc = await PDFDocument.create();
  doc.setTitle(pdfSafe(`${input.title} ${input.number}`.trim()));
  doc.setAuthor(pdfSafe(input.company.name));
  doc.setCreator('Werkakte');
  if (fonts) doc.registerFontkit(loadFontkit());
  const font = await doc.embedFont(fonts ? fonts.regular : StandardFonts.Helvetica, {
    subset: true,
  });
  const bold = await doc.embedFont(fonts ? fonts.bold : StandardFonts.HelveticaBold, {
    subset: true,
  });
  const c = input.company;

  let page: PDFPage = doc.addPage(A4);
  let y = A4[1] - M;
  const text = (s: string, x: number, yy: number, size = 9.5, f = font, color = DARK) =>
    page.drawText(pdfSafe(s), { x, y: yy, size, font: f, color });
  const right = (s: string, xRight: number, yy: number, size = 9.5, f = font) =>
    text(s, xRight - f.widthOfTextAtSize(pdfSafe(s), size), yy, size, f);

  // Kopf: Firma rechts, oranger Balken links.
  page.drawRectangle({ x: M, y: y - 34, width: 6, height: 34, color: ORANGE });
  text(c.name, M + 16, y - 14, 16, bold);
  text(c.owner, M + 16, y - 30, 8.5, font, GREY);
  [c.street, c.zipCity, c.phone, c.email].forEach((l, i) =>
    right(l, A4[0] - M, y - 8 - i * 11, 8.5),
  );
  y -= 90;

  // Anschrift Kunde (Absenderzeile klein darüber).
  text(`${c.name} · ${c.street} · ${c.zipCity}`, M, y, 7, font, GREY);
  const cu = input.customer;
  [cu.name, cu.contact ?? '', cu.street, cu.zipCity]
    .filter(Boolean)
    .forEach((l, i) => text(l, M, y - 16 - i * 13, 10.5));

  // Eckdaten rechts.
  const meta: [string, string][] = input.letter?.meta ?? [
    [input.isInvoice ? 'Rechnungsnummer' : 'Angebotsnummer', input.number || 'ENTWURF'],
    ['Datum', formatDate(input.date)],
  ];
  if (!input.letter && input.serviceDate)
    meta.push(['Leistungsdatum', formatDate(input.serviceDate)]);
  if (!input.letter && input.validUntil) meta.push(['Gültig bis', formatDate(input.validUntil)]);
  if (!input.letter && input.dueDate) meta.push(['Zahlbar bis', formatDate(input.dueDate)]);
  meta.forEach(([k, v], i) => {
    text(k, 360, y - 16 - i * 13, 9, font, GREY);
    right(v, A4[0] - M, y - 16 - i * 13, 9.5, bold);
  });
  y -= 30 + Math.max(4, meta.length) * 13 + 24;

  text(input.title, M, y, 18, bold);
  y -= 16;
  text(`Bauvorhaben: ${input.projectTitle}, ${input.projectAddress}`, M, y, 9.5, font, GREY);
  y -= 26;

  if (input.letter) return finishLetter();

  // Tabelle.
  const col = { pos: M, desc: M + 24, qty: 360, unit: 366, price: 470, sum: A4[0] - M };
  const header = () => {
    page.drawRectangle({
      x: M,
      y: y - 5,
      width: A4[0] - 2 * M,
      height: 18,
      color: rgb(0.95, 0.94, 0.92),
    });
    text('Pos.', col.pos + 2, y, 8.5, bold);
    text('Leistung / Material', col.desc, y, 8.5, bold);
    right('Menge', col.qty, y, 8.5, bold);
    text('Einh.', col.unit, y, 8.5, bold);
    right('Einzelpreis', col.price, y, 8.5, bold);
    right('Gesamt netto', col.sum, y, 8.5, bold);
    y -= 20;
  };
  const newPage = () => {
    page = doc.addPage(A4);
    y = A4[1] - M - 10;
    header();
  };
  header();
  input.items.forEach((it, i) => {
    const lines = wrap(it.name, font, 9.5, col.qty - col.desc - 60);
    if (y - lines.length * 12 < 150) newPage();
    text(`${i + 1}.`, col.pos + 2, y);
    lines.forEach((l, n) => text(l, col.desc, y - n * 12));
    right(formatQty(it.qtyMilli), col.qty, y);
    text(it.unit, col.unit, y);
    right(formatEuro(it.unitPriceCents), col.price, y);
    right(formatEuro(lineTotalCents(it)), col.sum, y);
    y -= lines.length * 12 + 6;
    page.drawLine({
      start: { x: M, y: y + 2 },
      end: { x: A4[0] - M, y: y + 2 },
      thickness: 0.4,
      color: rgb(0.85, 0.85, 0.85),
    });
    y -= 6;
  });

  // Summen.
  const totals = documentTotals(input.items, c.kleinunternehmer);
  if (y < 200) newPage();
  y -= 6;
  const sumRow = (k: string, v: string, strong = false) => {
    text(k, 340, y, strong ? 11 : 9.5, strong ? bold : font);
    right(v, A4[0] - M, y, strong ? 11 : 9.5, strong ? bold : font);
    y -= strong ? 18 : 14;
  };
  sumRow('Summe netto', formatEuro(totals.netCents));
  totals.vat.forEach((v) => sumRow(`zzgl. MwSt ${v.rate} %`, formatEuro(v.vatCents)));
  page.drawLine({
    start: { x: 340, y: y + 9 },
    end: { x: A4[0] - M, y: y + 9 },
    thickness: 0.8,
    color: DARK,
  });
  y -= 2;
  sumRow(
    c.kleinunternehmer ? 'Gesamtbetrag' : 'Gesamtbetrag (brutto)',
    formatEuro(totals.grossCents),
    true,
  );
  y -= 10;

  // Zahlung / Gültigkeit + Hinweise.
  const paras = [
    input.isInvoice && input.dueDate
      ? `Bitte überweisen Sie ${formatEuro(totals.grossCents)} bis zum ${formatDate(input.dueDate)} auf ${c.iban}. Verwendungszweck: ${input.number || 'Rechnungsnummer'}.`
      : input.validUntil
        ? `Dieses Angebot gilt bis zum ${formatDate(input.validUntil)}. Wir freuen uns auf Ihren Auftrag.`
        : '',
    ...input.notes,
    input.signedAt
      ? `Auftrag erteilt und vom Kunden unterschrieben am ${formatDate(input.signedAt)}.`
      : '',
  ].filter(Boolean);
  for (const p of paras) {
    const lines = wrap(p, font, 9, A4[0] - 2 * M);
    if (y - lines.length * 12 < 80) newPage();
    lines.forEach((l) => {
      text(l, M, y, 9);
      y -= 12;
    });
    y -= 6;
  }

  // Unterschrift des Kunden (Pfade aus dem 320 × 160-Feld, verkleinert auf 160 × 80 pt).
  if (input.signature?.paths.length) {
    if (y < 190) newPage();
    y -= 4;
    for (const d of input.signature.paths)
      page.drawSvgPath(d, { x: M, y, scale: 0.5, borderColor: DARK, borderWidth: 1.4 });
    y -= 70;
    page.drawLine({ start: { x: M, y }, end: { x: M + 180, y }, thickness: 0.6, color: GREY });
    y -= 11;
    text(
      `${input.signature.name}${input.signedAt ? `, ${formatDate(input.signedAt)}` : ''}`,
      M,
      y,
      8.5,
      font,
      GREY,
    );
    y -= 16;
  }

  return finish();

  function finish() {
    // Fußzeile auf jeder Seite.
    const pages = doc.getPages();
    pages.forEach((p, i) => {
      const foot = [
        `${c.name} · ${c.street} · ${c.zipCity} · Tel. ${c.phone} · ${c.email}`,
        `Steuernummer ${c.taxNumber} · IBAN ${c.iban}${c.kleinunternehmer ? ' · Kleinunternehmer § 19 UStG' : ''}`,
      ];
      p.drawLine({
        start: { x: M, y: 52 },
        end: { x: A4[0] - M, y: 52 },
        thickness: 0.4,
        color: GREY,
      });
      foot.forEach((l, n) =>
        p.drawText(pdfSafe(l), { x: M, y: 40 - n * 10, size: 7, font, color: GREY }),
      );
      const label = `Seite ${i + 1} von ${pages.length}`;
      p.drawText(label, {
        x: A4[0] - M - font.widthOfTextAtSize(label, 7),
        y: 40,
        size: 7,
        font,
        color: GREY,
      });
    });

    return doc.save();
  }

  function finishLetter() {
    const l = input.letter!;
    for (const [k, v] of l.amounts) {
      const strong = k === l.amounts[l.amounts.length - 1]![0];
      text(k, M, y, strong ? 11 : 9.5, strong ? bold : font);
      right(v, A4[0] - M, y, strong ? 11 : 9.5, strong ? bold : font);
      y -= strong ? 22 : 15;
    }
    y -= 6;
    for (const p of l.paragraphs) {
      wrap(p, font, 10, A4[0] - 2 * M).forEach((line) => {
        text(line, M, y, 10);
        y -= 14;
      });
      y -= 8;
    }
    return finish();
  }
}

/** Dateiname wie ihn Steuerberater mögen: Rechnung_R-2026-0012_Mueller.pdf */
export function belegFileName(title: string, number: string, customer: string): string {
  const clean = (s: string) =>
    s
      .replace(/ä/g, 'ae')
      .replace(/ö/g, 'oe')
      .replace(/ü/g, 'ue')
      .replace(/Ä/g, 'Ae')
      .replace(/Ö/g, 'Oe')
      .replace(/Ü/g, 'Ue')
      .replace(/ß/g, 'ss')
      .replace(/[^A-Za-z0-9-]+/g, '_')
      .replace(/^_+|_+$/g, '');
  return `${clean(title)}_${clean(number || 'Entwurf')}_${clean(customer).slice(0, 40)}.pdf`;
}
