import { Stack, router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Chips } from '@/components/Chips';
import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { SearchField } from '@/components/SearchField';
import { Section } from '@/components/Section';
import { CraftsmanRow } from '@/features/network/CraftsmanRow';
import {
  newestFirst,
  referralsForMe,
  referralsFromMe,
  referralsTakenByMe,
  searchCraftsmen,
  websiteHost,
} from '@/features/network/logic';
import { ReferralCard } from '@/features/network/ReferralCard';
import { useMe, useNetwork } from '@/features/network/store';
import { netTrades, tradesText } from '@/features/network/trades';
import type { Craftsman, NetTrade, Referral } from '@/features/network/types';
import { shareText } from '@/features/team/share';
import { de } from '@/i18n/de';
import { spacing, useColors } from '@/theme';

const t = de.netzwerk;
type Tab = 'jobs' | 'handwerker';

function Hero() {
  const colors = useColors();
  return (
    <Card accent={colors.primary} style={{ gap: spacing.md }}>
      <AppText variant="heading">{t.heroTitel}</AppText>
      <AppText muted>{t.heroText}</AppText>
      <Button title={t.eintragen} onPress={() => router.push('/netzwerk/eintragen')} />
      <AppText variant="small" muted>
        {t.kostenlos}
      </AppText>
    </Card>
  );
}

function MyEntry({ me }: { me: Craftsman }) {
  const colors = useColors();
  return (
    <Card
      onPress={() => router.push('/netzwerk/eintragen')}
      accessibilityLabel={`${t.meinEintrag}: ${me.company}, ${t.bearbeiten}`}
      style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}
    >
      <Avatar name={me.company} size={48} />
      <View style={{ flex: 1, gap: 2 }}>
        <AppText variant="mono">{t.meinEintrag}</AppText>
        <AppText variant="title" numberOfLines={1}>
          {me.company}
        </AppText>
        <AppText variant="small" muted numberOfLines={1}>
          {`${tradesText(me.trades)} · ${me.website ? websiteHost(me.website) : t.ohneWebseite}`}
        </AppText>
      </View>
      <AppText variant="label" color={colors.primary}>
        {t.bearbeiten}
      </AppText>
    </Card>
  );
}

function JobList({ items, empty }: { items: Referral[]; empty?: string }) {
  if (items.length === 0 && empty)
    return (
      <Card>
        <AppText muted>{empty}</AppText>
      </Card>
    );
  return (
    <>
      {items.map((r) => (
        <ReferralCard key={r.id} referral={r} />
      ))}
    </>
  );
}

function JobsTab({ me }: { me?: Craftsman }) {
  const referrals = useNetwork((s) => s.referrals);
  if (!me) {
    const open = referrals.filter((r) => r.status === 'offen').sort(newestFirst);
    return (
      <Section title={`${t.alleJobs} (${open.length})`}>
        <JobList items={open} />
      </Section>
    );
  }
  const forMe = referralsForMe(me, referrals);
  const taken = referralsTakenByMe(me, referrals);
  const fromMe = referralsFromMe(me, referrals);
  return (
    <>
      <Button title={t.jobWeitergeben} onPress={() => router.push('/netzwerk/job-neu')} />
      <Section title={`${t.fuerDich} (${forMe.length})`}>
        <JobList items={forMe} empty={t.fuerDichLeer} />
      </Section>
      {taken.length > 0 && (
        <Section title={`${t.zugeschoben} (${taken.length})`}>
          <JobList items={taken} />
        </Section>
      )}
      <Section
        title={t.vonDir}
        onAdd={{ label: t.jobWeitergeben, onPress: () => router.push('/netzwerk/job-neu') }}
      >
        <JobList items={fromMe} empty={t.vonDirLeer} />
      </Section>
    </>
  );
}

function DirectoryTab() {
  const craftsmen = useNetwork((s) => s.craftsmen);
  const [query, setQuery] = useState('');
  const [trade, setTrade] = useState<NetTrade | 'alle'>('alle');
  const found = searchCraftsmen(craftsmen, query, trade);
  return (
    <>
      <SearchField value={query} onChange={setQuery} placeholder={t.suchen} />
      <Chips
        options={[{ value: 'alle' as const, label: t.alleGewerke }, ...netTrades]}
        value={trade}
        onChange={setTrade}
      />
      <Card style={{ paddingVertical: 4 }}>
        {found.length === 0 && <EmptyState icon="people-outline" text={t.keineTreffer} />}
        {found.map((c, i) => (
          <CraftsmanRow key={c.id} craftsman={c} divider={i > 0} />
        ))}
      </Card>
      <Button
        title={t.einladen}
        variant="secondary"
        onPress={() => shareText(t.einladenText).catch(() => undefined)}
      />
    </>
  );
}

export default function NetzwerkScreen() {
  const me = useMe();
  const count = useNetwork((s) => s.craftsmen.length);
  const [tab, setTab] = useState<Tab>('jobs');
  return (
    <Screen>
      <Stack.Screen options={{ title: t.titel }} />
      {me ? <MyEntry me={me} /> : <Hero />}
      <Chips
        segmented
        options={[
          { value: 'jobs', label: t.reiterJobs },
          { value: 'handwerker', label: `${t.reiterHandwerker} ${count}` },
        ]}
        value={tab}
        onChange={setTab}
      />
      {tab === 'jobs' ? <JobsTab me={me} /> : <DirectoryTab />}
    </Screen>
  );
}
