import type { Company, Customer, DocItem, Invoice } from '@/features/demo/types';
import { documentTotals, lineTotalCents } from '@/lib/money';

/**
 * E-Rechnung im Format XRechnung 3.0 (UBL 2.1, EN 16931) für Rechnungen an Firmenkunden.
 * Pflicht im B2B-Verkehr (Empfang seit 2025, Versand je nach Umsatz ab 2027/2028).
 * Vor Livegang mit dem offiziellen KoSIT-Validator prüfen lassen.
 */

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const amt = (cents: number) => (cents / 100).toFixed(2);
const qty = (milli: number) => String(milli / 1000);
const day = (iso: string) => iso.slice(0, 10);

/** Einheiten → UN/ECE Rec. 20 (Pflicht-Codeliste der E-Rechnung). */
export function unitCode(unit: string): string {
  const u = unit.toLowerCase().replace(/\.$/, '');
  if (/^(std|h|stunde)/.test(u)) return 'HUR';
  if (/^(m²|m2|qm)$/.test(u)) return 'MTK';
  if (/^(m³|m3)$/.test(u)) return 'MTQ';
  if (/^(m|lfm)$/.test(u)) return 'MTR';
  if (u === 'kg') return 'KGM';
  if (/^(l|liter)$/.test(u)) return 'LTR';
  if (/^(pausch|psch)/.test(u)) return 'LS';
  if (u === 'paar') return 'PR';
  if (/^(sack|eimer|stk|stück)/.test(u)) return 'H87';
  return 'C62';
}

/** „76133 Karlsruhe“ → PLZ + Ort. */
export function splitZipCity(zipCity: string): { zip: string; city: string } {
  const m = zipCity.trim().match(/^(\d{4,5})\s+(.+)$/);
  return m ? { zip: m[1]!, city: m[2]! } : { zip: '', city: zipCity.trim() };
}

const address = (street: string, zipCity: string) => {
  const { zip, city } = splitZipCity(zipCity);
  return `<cac:PostalAddress><cbc:StreetName>${esc(street)}</cbc:StreetName><cbc:CityName>${esc(city)}</cbc:CityName><cbc:PostalZone>${esc(zip)}</cbc:PostalZone><cac:Country><cbc:IdentificationCode>DE</cbc:IdentificationCode></cac:Country></cac:PostalAddress>`;
};

const taxCategory = (rate: number, klein: boolean) =>
  klein
    ? '<cbc:ID>E</cbc:ID><cbc:Percent>0</cbc:Percent>'
    : `<cbc:ID>S</cbc:ID><cbc:Percent>${rate}</cbc:Percent>`;

function line(it: DocItem, n: number, klein: boolean) {
  return `<cac:InvoiceLine><cbc:ID>${n}</cbc:ID><cbc:InvoicedQuantity unitCode="${unitCode(it.unit)}">${qty(it.qtyMilli)}</cbc:InvoicedQuantity><cbc:LineExtensionAmount currencyID="EUR">${amt(lineTotalCents(it))}</cbc:LineExtensionAmount><cac:Item><cbc:Name>${esc(it.name)}</cbc:Name><cac:ClassifiedTaxCategory>${taxCategory(it.vatRate, klein)}<cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme></cac:ClassifiedTaxCategory></cac:Item><cac:Price><cbc:PriceAmount currencyID="EUR">${it.discountPercent ? (lineTotalCents(it) / (it.qtyMilli / 1000) / 100).toFixed(4) : amt(it.unitPriceCents)}</cbc:PriceAmount></cac:Price></cac:InvoiceLine>`;
}

export type XRechnungInput = {
  invoice: Invoice;
  company: Company;
  customer: Customer;
  /** Käuferreferenz (BT-10, Pflicht in XRechnung): Bestellnummer oder Bauvorhaben. */
  buyerReference: string;
};

export function buildXRechnung({
  invoice: inv,
  company: c,
  customer: cu,
  buyerReference,
}: XRechnungInput): string {
  const klein = c.kleinunternehmer;
  // Negative Abzugszeilen (Schlussrechnung) sind erlaubt; Preis muss aber ≥ 0 sein → Menge negativ.
  const items = inv.items.map((it) =>
    it.unitPriceCents < 0
      ? { ...it, qtyMilli: -it.qtyMilli, unitPriceCents: -it.unitPriceCents }
      : it,
  );
  const totals = documentTotals(items, klein);
  const subtotals = klein
    ? `<cac:TaxSubtotal><cbc:TaxableAmount currencyID="EUR">${amt(totals.netCents)}</cbc:TaxableAmount><cbc:TaxAmount currencyID="EUR">0.00</cbc:TaxAmount><cac:TaxCategory><cbc:ID>E</cbc:ID><cbc:Percent>0</cbc:Percent><cbc:TaxExemptionReason>Kleinunternehmer gemäß § 19 UStG</cbc:TaxExemptionReason><cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme></cac:TaxCategory></cac:TaxSubtotal>`
    : totals.vat
        .map(
          (v) =>
            `<cac:TaxSubtotal><cbc:TaxableAmount currencyID="EUR">${amt(v.baseCents)}</cbc:TaxableAmount><cbc:TaxAmount currencyID="EUR">${amt(v.vatCents)}</cbc:TaxAmount><cac:TaxCategory><cbc:ID>S</cbc:ID><cbc:Percent>${v.rate}</cbc:Percent><cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme></cac:TaxCategory></cac:TaxSubtotal>`,
        )
        .join('');
  const taxCents = totals.grossCents - totals.netCents;

  return `<?xml version="1.0" encoding="UTF-8"?>
<ubl:Invoice xmlns:ubl="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2" xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
<cbc:CustomizationID>urn:cen.eu:en16931:2017#compliant#urn:xeinkauf.de:kosit:xrechnung_3.0</cbc:CustomizationID>
<cbc:ProfileID>urn:fdc:peppol.eu:2017:poacc:billing:01:1.0</cbc:ProfileID>
<cbc:ID>${esc(inv.number)}</cbc:ID>
<cbc:IssueDate>${day(inv.sentAt ?? inv.date)}</cbc:IssueDate>
<cbc:DueDate>${day(inv.dueDate)}</cbc:DueDate>
<cbc:InvoiceTypeCode>${inv.type === 'abschlag' ? '326' : '380'}</cbc:InvoiceTypeCode>
<cbc:DocumentCurrencyCode>EUR</cbc:DocumentCurrencyCode>
<cbc:BuyerReference>${esc(buyerReference)}</cbc:BuyerReference>
<cac:AccountingSupplierParty><cac:Party><cbc:EndpointID schemeID="EM">${esc(c.email)}</cbc:EndpointID><cac:PartyName><cbc:Name>${esc(c.name)}</cbc:Name></cac:PartyName>${address(c.street, c.zipCity)}<cac:PartyTaxScheme><cbc:CompanyID>${esc(c.taxNumber)}</cbc:CompanyID><cac:TaxScheme><cbc:ID>FC</cbc:ID></cac:TaxScheme></cac:PartyTaxScheme><cac:PartyLegalEntity><cbc:RegistrationName>${esc(c.name)}</cbc:RegistrationName></cac:PartyLegalEntity><cac:Contact><cbc:Name>${esc(c.owner.split(',')[0]!)}</cbc:Name><cbc:Telephone>${esc(c.phone)}</cbc:Telephone><cbc:ElectronicMail>${esc(c.email)}</cbc:ElectronicMail></cac:Contact></cac:Party></cac:AccountingSupplierParty>
<cac:AccountingCustomerParty><cac:Party><cbc:EndpointID schemeID="EM">${esc(cu.email)}</cbc:EndpointID><cac:PartyName><cbc:Name>${esc(cu.name)}</cbc:Name></cac:PartyName>${address(cu.street, cu.zipCity)}<cac:PartyLegalEntity><cbc:RegistrationName>${esc(cu.name)}</cbc:RegistrationName></cac:PartyLegalEntity>${cu.contact ? `<cac:Contact><cbc:Name>${esc(cu.contact)}</cbc:Name></cac:Contact>` : ''}</cac:Party></cac:AccountingCustomerParty>
<cac:Delivery><cbc:ActualDeliveryDate>${day(inv.serviceDate ?? inv.date)}</cbc:ActualDeliveryDate></cac:Delivery>
<cac:PaymentMeans><cbc:PaymentMeansCode>58</cbc:PaymentMeansCode><cbc:PaymentID>${esc(inv.number)}</cbc:PaymentID><cac:PayeeFinancialAccount><cbc:ID>${esc(c.iban.replace(/\s/g, ''))}</cbc:ID></cac:PayeeFinancialAccount></cac:PaymentMeans>
<cac:PaymentTerms><cbc:Note>Zahlbar ohne Abzug bis ${day(inv.dueDate)}.</cbc:Note></cac:PaymentTerms>
<cac:TaxTotal><cbc:TaxAmount currencyID="EUR">${amt(taxCents)}</cbc:TaxAmount>${subtotals}</cac:TaxTotal>
<cac:LegalMonetaryTotal><cbc:LineExtensionAmount currencyID="EUR">${amt(totals.netCents)}</cbc:LineExtensionAmount><cbc:TaxExclusiveAmount currencyID="EUR">${amt(totals.netCents)}</cbc:TaxExclusiveAmount><cbc:TaxInclusiveAmount currencyID="EUR">${amt(totals.grossCents)}</cbc:TaxInclusiveAmount><cbc:PayableAmount currencyID="EUR">${amt(totals.grossCents)}</cbc:PayableAmount></cac:LegalMonetaryTotal>
${items.map((it, i) => line(it, i + 1, klein)).join('\n')}
</ubl:Invoice>
`;
}

export const xrechnungFileName = (number: string) =>
  `XRechnung_${number.replace(/[^A-Za-z0-9-]/g, '_')}.xml`;
