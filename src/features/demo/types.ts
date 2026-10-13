// Datenmodell nach CLAUDE.md §5. Im Prototyp nur im Speicher; ab Phase 1 aus SQLite.
import type { ImageSourcePropType } from 'react-native';

import type { LineItem } from '@/lib/money';

export type ProjectStatus =
  'anfrage' | 'angebot' | 'beauftragt' | 'in_arbeit' | 'abgeschlossen' | 'bezahlt';

export type Company = {
  name: string;
  owner: string;
  street: string;
  zipCity: string;
  phone: string;
  email: string;
  taxNumber: string;
  iban: string;
  kleinunternehmer: boolean;
  /** Betriebskosten-Zuschlag in % auf Material + Lohn (Fahrzeug, Werkstatt, Büro …). */
  overheadPercent: number;
};

export type Member = {
  id: string;
  name: string;
  role: 'inhaber' | 'mitarbeiter';
  phone: string;
  /** Interne Kosten pro Stunde (Lohn + Lohnnebenkosten), nur für Inhaber sichtbar. */
  hourlyCostCents: number;
};

export type Customer = {
  id: string;
  type: 'privat' | 'gewerblich';
  name: string;
  contact?: string;
  street: string;
  zipCity: string;
  phone: string;
  email: string;
};

export type CatalogItem = {
  id: string;
  name: string;
  unit: string;
  unitPriceCents: number;
  vatRate: 19 | 7;
  type: 'material' | 'arbeit';
  /** Nur Arbeit: interne Kosten pro Einheit für die Vorkalkulation. Material-EK kommt aus Lieferantenpreisen. */
  internalCostCents?: number;
};

export type Supplier = {
  id: string;
  name: string;
  kind: 'grosshandel' | 'baumarkt' | 'online';
  phone?: string;
};

/** Einkaufspreis (netto) eines Artikels bei einem Lieferanten, von Hand eingetragen. */
export type SupplierPrice = {
  id: string;
  catalogItemId: string;
  supplierId: string;
  priceCents: number;
  updatedAt: string;
};

/** Ist-Kosten eines Projekts, von Hand erfasst (Nachkalkulation). */
export type ProjectCost =
  | {
      id: string;
      projectId: string;
      kind: 'material';
      date: string;
      text: string;
      amountCents: number;
      supplierId?: string;
    }
  | {
      id: string;
      projectId: string;
      kind: 'stunden';
      date: string;
      memberId: string;
      minutes: number;
    };

export type Project = {
  id: string;
  customerId: string;
  title: string;
  street: string;
  zipCity: string;
  status: ProjectStatus;
  memberIds: string[];
  updatedAt: string;
  /** Selbst gewähltes Titelbild; sonst automatisch (siehe coverOf). */
  coverMediaId?: string;
};

export type MediaTag = 'vorher' | 'nachher' | 'mangel' | 'sonstiges';

export type Media = {
  id: string;
  projectId: string;
  source: ImageSourcePropType;
  tag: MediaTag;
  note: string;
  takenAt: string;
  authorId: string;
  /** Nur Problem-Fotos: wann erledigt. Offen = rotes Ausrufezeichen am Projekt. */
  resolvedAt?: string;
};

export type Note = {
  id: string;
  projectId: string;
  kind: 'text' | 'sprache';
  text: string;
  durationSec?: number;
  createdAt: string;
  authorId: string;
};

export type Appointment = {
  id: string;
  projectId: string;
  title: string;
  start: string;
  end: string;
  memberIds: string[];
};

export type DocItem = LineItem & { id: string; name: string; unit: string; catalogId?: string };

export type Quote = {
  id: string;
  projectId: string;
  number: string;
  date: string;
  validUntil: string;
  status: 'entwurf' | 'versendet' | 'angenommen' | 'abgelehnt';
  items: DocItem[];
  signedAt?: string;
  sentAt?: string;
};

export type Invoice = {
  id: string;
  projectId: string;
  quoteId?: string;
  number: string;
  date: string;
  dueDate: string;
  type: 'abschlag' | 'schluss' | 'einzel';
  status: 'entwurf' | 'versendet' | 'bezahlt';
  items: DocItem[];
  sentAt?: string;
};

/** Laufende Zeit einer Person (pro Person höchstens eine). */
export type RunningTimer = { projectId: string; startedAt: string };

export type SendSettings = {
  copyToMe: boolean;
  myEmail: string;
  /** Rechnungen automatisch an die DATEV-Upload-Mail-Adresse des Steuerberaters. */
  toDatev: boolean;
  datevEmail: string;
  /** Wer Materialanfragen bekommt (Push + E-Mail), Mitarbeiter-IDs. */
  materialRecipients: string[];
  /** Optional: E-Mail des Einkaufs (z. B. Einkaufsleiter ohne App-Zugang). */
  purchasingEmail: string;
};

export type Reminders = {
  followUp: boolean;
  followUpDays: number;
  overdue: boolean;
  dailyWrapUp: boolean;
  wrapUpHour: number;
  /** Automatisch einstempeln an der Baustelle (Standort-Zaun). Standard aus – braucht Einwilligung. */
  autoClockIn: boolean;
};

/** Materialanfrage aus dem Projekt („wird knapp, bitte nachbestellen“). */
export type MaterialRequest = {
  id: string;
  projectId: string;
  memberId: string;
  text: string;
  quantity: string;
  urgent: boolean;
  status: 'offen' | 'bestellt' | 'erledigt';
  createdAt: string;
};
