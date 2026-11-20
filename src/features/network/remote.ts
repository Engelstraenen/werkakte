// Handwerker-Netzwerk live: Supabase-Tabellen network_profile, job_referral, job_interest
// (supabase/migrations/20261119120000_netzwerk.sql). Zugriffsregeln (RLS) liegen in der Datenbank,
// hier nur Lesen/Schreiben und Umwandeln zwischen Tabellenzeilen und App-Typen.
import { supabase } from '@/lib/supabase';

import type { ProfileInput } from './logic';
import type { Craftsman, NetTrade, Referral, ReferralStatus } from './types';

export type ProfileRow = {
  id: string;
  email?: string | null;
  company: string;
  name?: string | null;
  trades: string[];
  zip: string;
  city: string;
  phone?: string | null;
  website: string | null;
  about: string | null;
  created_at: string;
};

export type ReferralRow = {
  id: string;
  from_profile_id: string;
  trade: string;
  title: string;
  details: string;
  zip: string;
  city: string;
  when_text: string;
  to_profile_id: string | null;
  project_id: string | null;
  status: string;
  taken_by_profile_id: string | null;
  created_at: string;
};

export type InterestRow = { referral_id: string; profile_id: string };

export type Snapshot = { meId: string | null; craftsmen: Craftsman[]; referrals: Referral[] };

/** Zeile aus network_profile oder der öffentlichen Sicht (ohne E-Mail/Telefon) → Craftsman. */
export const toCraftsman = (r: ProfileRow): Craftsman => ({
  id: r.id,
  email: r.email ?? '',
  company: r.company,
  name: r.name ?? '',
  trades: r.trades as NetTrade[],
  zip: r.zip,
  city: r.city,
  phone: r.phone ?? '',
  website: r.website ?? undefined,
  about: r.about ?? '',
  createdAt: r.created_at,
});

export const toReferral = (r: ReferralRow, interests: InterestRow[]): Referral => ({
  id: r.id,
  fromId: r.from_profile_id,
  trade: r.trade as NetTrade,
  title: r.title,
  details: r.details,
  zip: r.zip,
  city: r.city,
  when: r.when_text,
  toId: r.to_profile_id ?? undefined,
  projectId: r.project_id ?? undefined,
  interested: interests.filter((i) => i.referral_id === r.id).map((i) => i.profile_id),
  status: r.status as ReferralStatus,
  takenById: r.taken_by_profile_id ?? undefined,
  createdAt: r.created_at,
});

/** App-Eingabe → Spalten für insert/update (user_id, email kommen in der Datenbank aus dem Login). */
export const profileColumns = (p: ProfileInput) => ({
  company: p.company,
  name: p.name,
  trades: p.trades,
  zip: p.zip,
  city: p.city,
  phone: p.phone,
  website: p.website ?? null,
  about: p.about,
});

function check<T>(res: { data: T; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data;
}

/**
 * Alles laden, was ich sehen darf. Ohne Anmeldung nur das öffentliche Verzeichnis
 * (Sicht network_directory: ohne E-Mail und Telefon), keine Jobs.
 */
export async function loadSnapshot(userId: string | null): Promise<Snapshot> {
  if (!userId) {
    const rows = check(
      await supabase.from('network_directory').select('*').order('company').limit(500),
    ) as ProfileRow[];
    return { meId: null, craftsmen: rows.map(toCraftsman), referrals: [] };
  }
  const [profiles, referrals, interests] = await Promise.all([
    supabase.from('network_profile').select('*').is('deleted_at', null).order('company').limit(500),
    supabase
      .from('job_referral')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(300),
    supabase.from('job_interest').select('referral_id, profile_id'),
  ]);
  const rows = check(profiles) as (ProfileRow & { user_id: string })[];
  const ints = check(interests) as InterestRow[];
  return {
    meId: rows.find((r) => r.user_id === userId)?.id ?? null,
    craftsmen: rows.map(toCraftsman),
    referrals: (check(referrals) as ReferralRow[]).map((r) => toReferral(r, ints)),
  };
}

export async function saveProfile(meId: string | null, p: ProfileInput): Promise<string> {
  if (meId) {
    check(await supabase.from('network_profile').update(profileColumns(p)).eq('id', meId));
    return meId;
  }
  const row = check(
    await supabase.from('network_profile').insert(profileColumns(p)).select('id').single(),
  ) as { id: string };
  return row.id;
}

/** Eintrag löschen (DSGVO): eigene Jobs und „Mach ich“ verschwinden mit (on delete cascade). */
export async function removeProfile(meId: string): Promise<void> {
  check(await supabase.from('network_profile').delete().eq('id', meId));
}

export async function addReferral(r: {
  trade: NetTrade;
  title: string;
  details: string;
  zip: string;
  city: string;
  when: string;
  toId?: string;
  projectId?: string;
}): Promise<string> {
  const row = check(
    await supabase
      .from('job_referral')
      .insert({
        trade: r.trade,
        title: r.title,
        details: r.details,
        zip: r.zip,
        city: r.city,
        when_text: r.when,
        to_profile_id: r.toId ?? null,
        project_id: r.projectId ?? null,
      })
      .select('id')
      .single(),
  ) as { id: string };
  return row.id;
}

export async function setInterest(referralId: string, on: boolean, meId: string): Promise<void> {
  if (on) check(await supabase.from('job_interest').insert({ referral_id: referralId }));
  else
    check(
      await supabase
        .from('job_interest')
        .delete()
        .eq('referral_id', referralId)
        .eq('profile_id', meId),
    );
}

export async function assign(referralId: string, craftsmanId: string): Promise<void> {
  check(
    await supabase
      .from('job_referral')
      .update({ status: 'vergeben', taken_by_profile_id: craftsmanId })
      .eq('id', referralId),
  );
}

export async function withdraw(referralId: string): Promise<void> {
  check(
    await supabase.from('job_referral').update({ status: 'zurueckgezogen' }).eq('id', referralId),
  );
}
