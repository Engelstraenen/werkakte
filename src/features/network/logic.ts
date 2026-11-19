import { emailSchema } from '@/features/auth/validation';

import { tradeLabel } from './trades';
import type { Craftsman, NetTrade, Referral } from './types';

/**
 * Webseite aus der Eingabe machen: „www.kaya-elektro.de“ → „https://www.kaya-elektro.de“.
 * Leer → undefined (Webseite ist freiwillig). Ungültig → null.
 */
export function normalizeWebsite(input: string): string | undefined | null {
  const raw = input.trim();
  if (!raw) return undefined;
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  const match = /^(https?):\/\/([^/\s?#]+)([^\s]*)$/i.exec(withScheme);
  if (!match) return null;
  const [, scheme = '', hostRaw = '', rest = ''] = match;
  const host = hostRaw.toLowerCase();
  // Mindestens „name.de“: Punkt, Endung aus Buchstaben, keine Leerzeichen oder Sonderzeichen.
  if (!/^([a-z0-9äöüß-]+\.)+[a-z]{2,}(:\d+)?$/.test(host)) return null;
  const path = rest === '/' ? '' : rest;
  return `${scheme.toLowerCase()}://${host}${path}`;
}

/** Für die Anzeige: „https://www.kaya-elektro.de/“ → „kaya-elektro.de“. */
export const websiteHost = (url: string) =>
  url
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/\/$/, '');

export const isEmail = (email: string) => emailSchema.safeParse(email.trim()).success;
export const isZip = (zip: string) => /^\d{5}$/.test(zip.trim());

/** PLZ-Gebiet (erste zwei Ziffern) – reicht für „in deiner Gegend“, ohne Ortung. */
export const region = (zip: string) => zip.trim().slice(0, 2);

export type ProfileInput = Omit<Craftsman, 'id' | 'createdAt'>;
export type ProfileErrors = Partial<
  Record<'email' | 'company' | 'trades' | 'zip' | 'city' | 'website', string>
>;

/** Prüft die Eingabe beim Eintragen. Gibt Fehlertexte je Feld zurück (leer = alles gut). */
export function validateProfile(
  p: Omit<ProfileInput, 'website'> & { website: string },
  texts: { pflicht: string; email: string; plz: string; webseite: string; gewerk: string },
): ProfileErrors {
  const e: ProfileErrors = {};
  if (!isEmail(p.email)) e.email = texts.email;
  if (!p.company.trim()) e.company = texts.pflicht;
  if (p.trades.length === 0) e.trades = texts.gewerk;
  if (!isZip(p.zip)) e.zip = texts.plz;
  if (!p.city.trim()) e.city = texts.pflicht;
  if (normalizeWebsite(p.website) === null) e.website = texts.webseite;
  return e;
}

/**
 * Jobs, die zu mir passen: offen, nicht von mir, und entweder direkt an mich
 * oder an alle meines Gewerks in meinem PLZ-Gebiet.
 */
export function referralsForMe(me: Craftsman, all: Referral[]): Referral[] {
  return all
    .filter((r) => r.status === 'offen' && r.fromId !== me.id)
    .filter((r) =>
      r.toId ? r.toId === me.id : me.trades.includes(r.trade) && region(r.zip) === region(me.zip),
    )
    .sort(newestFirst);
}

/** Jobs, die mir zugeschoben und an mich vergeben wurden. */
export const referralsTakenByMe = (me: Craftsman, all: Referral[]) =>
  all.filter((r) => r.status === 'vergeben' && r.takenById === me.id).sort(newestFirst);

export const referralsFromMe = (me: Craftsman, all: Referral[]) =>
  all.filter((r) => r.fromId === me.id).sort(newestFirst);

export const newestFirst = (a: { createdAt: string }, b: { createdAt: string }) =>
  b.createdAt.localeCompare(a.createdAt);

/** Suche im Verzeichnis: Firma, Name, Ort, PLZ oder Gewerk. */
export function searchCraftsmen(
  list: Craftsman[],
  query: string,
  trade: NetTrade | 'alle',
): Craftsman[] {
  const q = query.trim().toLowerCase();
  return list
    .filter((c) => trade === 'alle' || c.trades.includes(trade))
    .filter(
      (c) =>
        !q ||
        [c.company, c.name, c.city, c.zip, ...c.trades.map(tradeLabel)]
          .join(' ')
          .toLowerCase()
          .includes(q),
    )
    .sort((a, b) => a.company.localeCompare(b.company, 'de'));
}
