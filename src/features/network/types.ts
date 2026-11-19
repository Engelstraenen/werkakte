// Handwerker-Netzwerk (19.11.2026, siehe docs/ENTSCHEIDUNGEN.md): Handwerker tragen sich mit ihrer E-Mail
// ein (optional mit Webseite) und schieben sich Jobs zu, die nicht ihr Gewerk sind.
// Im Prototyp im Speicher; live in Supabase (supabase/migrations/20261119120000_netzwerk.sql), firmenübergreifend.

/** Gewerke im Netzwerk – breiter als die Angebots-Gewerke, weil auf dem Bau alle zusammenkommen. */
export type NetTrade =
  | 'rohbau'
  | 'zimmerer'
  | 'dach'
  | 'elektro'
  | 'shk'
  | 'fenster'
  | 'trockenbau'
  | 'estrich'
  | 'fliesen'
  | 'maler'
  | 'schreiner'
  | 'boden'
  | 'garten';

/** Eintrag im Verzeichnis. Eine E-Mail = ein Eintrag. */
export type Craftsman = {
  id: string;
  /** Login-E-Mail (Supabase Auth). Für andere sichtbar, damit man sich direkt erreicht. */
  email: string;
  /** Betrieb, z. B. „Elektro Kaya“. */
  company: string;
  /** Ansprechpartner, z. B. „Murat Kaya“. */
  name: string;
  trades: NetTrade[];
  zip: string;
  city: string;
  phone: string;
  /** Eigene Webseite, immer mit https://. Fehlt sie, steht der Betrieb trotzdem im Verzeichnis. */
  website?: string;
  /** Ein, zwei Sätze: Was macht ihr, was nicht? */
  about: string;
  createdAt: string;
};

export type ReferralStatus = 'offen' | 'vergeben' | 'zurueckgezogen';

/** Ein Job, den ein Handwerker an ein anderes Gewerk weitergibt. */
export type Referral = {
  id: string;
  fromId: string;
  /** Welches Gewerk wird gesucht? */
  trade: NetTrade;
  title: string;
  details: string;
  zip: string;
  city: string;
  /** Freitext, z. B. „ab KW 3, ca. 2 Tage“. */
  when: string;
  /** Direkt an einen Betrieb geschoben; leer = an alle des Gewerks in der Gegend. */
  toId?: string;
  /** Aus welcher eigenen Projektakte der Job kommt (nur für den Absender sichtbar). */
  projectId?: string;
  /** Betriebe, die „Mach ich“ getippt haben. */
  interested: string[];
  status: ReferralStatus;
  /** An wen vergeben (nur bei Status „vergeben“). */
  takenById?: string;
  createdAt: string;
};
