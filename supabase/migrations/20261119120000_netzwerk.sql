-- Handwerker-Netzwerk (19.11.2026): Verzeichnis + Jobs zuschieben, firmenübergreifend.
-- Anders als Firmendaten (company_id, offline-first) gehört das Netzwerk allen angemeldeten Betrieben:
-- Daten werden online gelesen (TanStack Query), nicht über die Outbox synchronisiert.
-- Region: EU – Frankfurt. Soft Delete über deleted_at, Löschen des Kontos löscht den Eintrag (on delete cascade).

-- ---------------------------------------------------------------------------
-- Hilfsfunktion updated_at
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Eintrag im Verzeichnis: eine Login-E-Mail = ein Eintrag
-- ---------------------------------------------------------------------------
create table public.network_profile (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique default auth.uid() references auth.users (id) on delete cascade,
  -- Login-E-Mail aus Supabase Auth (Policy prüft, dass sie zum Login passt).
  email text not null default (auth.jwt() ->> 'email'),
  company text not null check (length(trim(company)) between 1 and 120),
  name text not null default '' check (length(name) <= 120),
  trades text[] not null check (
    cardinality(trades) between 1 and 13
    and trades <@ array[
      'rohbau', 'zimmerer', 'dach', 'elektro', 'shk', 'fenster', 'trockenbau',
      'estrich', 'fliesen', 'maler', 'schreiner', 'boden', 'garten'
    ]
  ),
  zip text not null check (zip ~ '^[0-9]{5}$'),
  city text not null check (length(trim(city)) between 1 and 80),
  phone text not null default '' check (length(phone) <= 40),
  -- Freiwillig. Nur http(s), damit kein javascript: o. Ä. verlinkt werden kann.
  website text check (website is null or website ~* '^https?://[^\s/]+\.[a-z]{2,}'),
  about text not null default '' check (length(about) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index network_profile_trades_idx on public.network_profile using gin (trades);
create index network_profile_region_idx on public.network_profile (left(zip, 2));
create trigger network_profile_updated_at
  before update on public.network_profile
  for each row execute function public.set_updated_at();

-- Mein Eintrag (für Policies). security definer, damit die Policy nicht rekursiv auf RLS läuft.
create or replace function public.my_network_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.network_profile
  where user_id = auth.uid() and deleted_at is null
$$;

-- ---------------------------------------------------------------------------
-- Weitergegebener Job
-- ---------------------------------------------------------------------------
create table public.job_referral (
  id uuid primary key default gen_random_uuid(),
  from_profile_id uuid not null default public.my_network_profile_id()
    references public.network_profile (id) on delete cascade,
  trade text not null check (
    trade in (
      'rohbau', 'zimmerer', 'dach', 'elektro', 'shk', 'fenster', 'trockenbau',
      'estrich', 'fliesen', 'maler', 'schreiner', 'boden', 'garten'
    )
  ),
  title text not null check (length(trim(title)) between 1 and 140),
  details text not null default '' check (length(details) <= 2000),
  zip text not null check (zip ~ '^[0-9]{5}$'),
  city text not null check (length(trim(city)) between 1 and 80),
  when_text text not null default '' check (length(when_text) <= 120),
  -- Direkt an einen Betrieb; null = an alle des Gewerks.
  to_profile_id uuid references public.network_profile (id) on delete set null,
  -- Eigene Projektakte des Absenders (ohne Fremdschlüssel: project liegt im Firmenbereich).
  project_id uuid,
  status text not null default 'offen' check (status in ('offen', 'vergeben', 'zurueckgezogen')),
  taken_by_profile_id uuid references public.network_profile (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  check ((status = 'vergeben') = (taken_by_profile_id is not null))
);

create index job_referral_open_idx on public.job_referral (trade, left(zip, 2)) where status = 'offen';
create index job_referral_from_idx on public.job_referral (from_profile_id);
create trigger job_referral_updated_at
  before update on public.job_referral
  for each row execute function public.set_updated_at();

-- „Mach ich“ eines Betriebs zu einem Job
create table public.job_interest (
  referral_id uuid not null references public.job_referral (id) on delete cascade,
  profile_id uuid not null default public.my_network_profile_id()
    references public.network_profile (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (referral_id, profile_id)
);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.network_profile enable row level security;
alter table public.job_referral enable row level security;
alter table public.job_interest enable row level security;

-- Verzeichnis: alle angemeldeten Betriebe sehen alle Einträge (Kontakt ist der Sinn des Netzwerks).
create policy "Verzeichnis lesen" on public.network_profile
  for select to authenticated
  using (deleted_at is null or user_id = auth.uid());

create policy "Eigenen Eintrag anlegen" on public.network_profile
  for insert to authenticated
  with check (user_id = auth.uid() and email = (auth.jwt() ->> 'email'));

create policy "Eigenen Eintrag ändern" on public.network_profile
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid() and email = (auth.jwt() ->> 'email'));

create policy "Eigenen Eintrag löschen" on public.network_profile
  for delete to authenticated
  using (user_id = auth.uid());

-- Jobs: offene Jobs an alle sind für alle Eingetragenen sichtbar (Filter nach Gewerk/Gegend macht die App);
-- direkte Jobs nur Absender und Empfänger; vergebene nur Absender und der Betrieb, der ihn hat.
create policy "Jobs lesen" on public.job_referral
  for select to authenticated
  using (
    deleted_at is null and (
      from_profile_id = public.my_network_profile_id()
      or to_profile_id = public.my_network_profile_id()
      or taken_by_profile_id = public.my_network_profile_id()
      or (status = 'offen' and to_profile_id is null and public.my_network_profile_id() is not null)
    )
  );

create policy "Job weitergeben" on public.job_referral
  for insert to authenticated
  with check (
    from_profile_id = public.my_network_profile_id()
    and status = 'offen'
    and taken_by_profile_id is null
  );

-- Nur der Absender vergibt oder zieht zurück. Vergeben nur an jemanden, der „Mach ich“ getippt hat
-- oder dem der Job direkt zugeschoben wurde.
create policy "Eigenen Job ändern" on public.job_referral
  for update to authenticated
  using (from_profile_id = public.my_network_profile_id())
  with check (
    from_profile_id = public.my_network_profile_id()
    and (
      taken_by_profile_id is null
      or taken_by_profile_id = to_profile_id
      or exists (
        select 1 from public.job_interest i
        where i.referral_id = job_referral.id
          and i.profile_id = job_referral.taken_by_profile_id
      )
    )
  );

-- Interesse: sieht der Betrieb selbst und der Absender des Jobs.
create policy "Interesse lesen" on public.job_interest
  for select to authenticated
  using (
    profile_id = public.my_network_profile_id()
    or exists (
      select 1 from public.job_referral r
      where r.id = job_interest.referral_id and r.from_profile_id = public.my_network_profile_id()
    )
  );

-- „Mach ich“ nur für offene Jobs, die ich sehen darf, und nicht für eigene.
create policy "Mach ich" on public.job_interest
  for insert to authenticated
  with check (
    profile_id = public.my_network_profile_id()
    and exists (
      select 1 from public.job_referral r
      where r.id = job_interest.referral_id
        and r.status = 'offen'
        and r.deleted_at is null
        and r.from_profile_id <> public.my_network_profile_id()
        and (r.to_profile_id is null or r.to_profile_id = public.my_network_profile_id())
    )
  );

create policy "Doch nicht" on public.job_interest
  for delete to authenticated
  using (profile_id = public.my_network_profile_id());

-- ---------------------------------------------------------------------------
-- Öffentliches Portfolio (Webseite, ohne Login): nur Betrieb, Gewerke, Ort, Webseite, Text.
-- Keine E-Mail, kein Telefon – sonst sammeln Spammer die Adressen ein.
-- Bewusst ohne security_invoker: Die Sicht zeigt nur diese Spalten, die Tabelle bleibt für anon zu.
-- ---------------------------------------------------------------------------
create view public.network_directory as
  select id, company, trades, zip, city, website, about, created_at
  from public.network_profile
  where deleted_at is null;

revoke all on public.network_directory from anon, authenticated;
grant select on public.network_directory to anon, authenticated;
