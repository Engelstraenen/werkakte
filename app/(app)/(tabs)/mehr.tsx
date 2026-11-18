import { router, type Href } from 'expo-router';

import { AppText } from '@/components/AppText';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Chips } from '@/components/Chips';
import { IconCircle, type IconName } from '@/components/IconCircle';
import { ListRow } from '@/components/ListRow';
import { Screen } from '@/components/Screen';
import { useSession } from '@/features/auth/session';
import { resetToSample } from '@/features/demo/reset';
import { company } from '@/features/demo/data';
import { useStamm } from '@/features/demo/stamm';
import { de } from '@/i18n/de';
import { isDemoBuild } from '@/lib/demo';
import { confirm } from '@/lib/notice';
import { supabase } from '@/lib/supabase';
import { useAppearance, type Tone } from '@/theme';

const t = de.mehr;
type Counts = { suppliers: number; customers: number; catalog: number; members: number };
const entriesFor = (
  n: Counts,
): { href: Href; title: string; subtitle: string; icon: IconName; tone: Tone }[] => [
  {
    href: '/einkauf',
    title: t.einkauf,
    subtitle: `${n.suppliers} Lieferanten`,
    icon: 'cart',
    tone: 'success',
  },
  {
    href: '/kunden',
    title: t.kunden,
    subtitle: `${n.customers}`,
    icon: 'people',
    tone: 'info',
  },
  {
    href: '/katalog',
    title: t.katalog,
    subtitle: `${n.catalog}`,
    icon: 'pricetags',
    tone: 'warning',
  },
  {
    href: '/archiv',
    title: de.archiv.titel,
    subtitle: de.archiv.untertitel,
    icon: 'archive',
    tone: 'neutral',
  },
  { href: '/firma', title: t.firma, subtitle: company.name, icon: 'business', tone: 'primary' },
  {
    href: '/nummernkreise',
    title: t.nummernkreise,
    subtitle: 'Angebote, Rechnungen',
    icon: 'keypad',
    tone: 'neutral',
  },
  {
    href: '/versand',
    title: t.versand,
    subtitle: 'Kopie an mich, DATEV',
    icon: 'paper-plane',
    tone: 'info',
  },
  {
    href: '/erinnerungen',
    title: t.erinnerungen,
    subtitle: 'Push-Nachrichten',
    icon: 'notifications',
    tone: 'warning',
  },
  {
    href: '/mitarbeiter',
    title: t.mitarbeiter,
    subtitle: `${n.members}`,
    icon: 'construct',
    tone: 'success',
  },
  {
    href: '/team',
    title: de.team.titel,
    subtitle: de.team.untertitel,
    icon: 'rocket',
    tone: 'primary',
  },
];

export default function MehrScreen() {
  const { session, devMode, setDevMode } = useSession();
  const appearance = useAppearance();
  const entries = entriesFor({
    suppliers: useStamm((s) => s.suppliers.length),
    customers: useStamm((s) => s.customers.length),
    catalog: useStamm((s) => s.catalog.length),
    members: useStamm((s) => s.members.length),
  });
  return (
    <Screen title={t.titel}>
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Avatar name={company.name} size={52} />
        <AppText variant="title" style={{ flex: 1 }}>
          {company.name}
        </AppText>
      </Card>
      <Card style={{ paddingVertical: 4 }}>
        {entries.map((e, i) => (
          <ListRow
            key={e.title}
            divider={i > 0}
            title={e.title}
            subtitle={e.subtitle}
            left={<IconCircle name={e.icon} tone={e.tone} size={40} />}
            onPress={() => router.push(e.href)}
          />
        ))}
      </Card>
      <Card>
        <AppText variant="mono">{t.darstellung}</AppText>
        <Chips
          segmented
          options={[
            { value: 'hell', label: t.hell },
            { value: 'dunkel', label: t.dunkel },
            { value: 'automatisch', label: t.automatisch },
          ]}
          value={appearance.mode}
          onChange={appearance.setMode}
        />
      </Card>
      <AppText muted>
        {isDemoBuild
          ? t.liveDemo
          : session
            ? `${t.angemeldetAls} ${session.user.email}`
            : t.testmodus}
      </AppText>
      <Button
        title={t.zuruecksetzen}
        variant="secondary"
        onPress={() =>
          confirm(t.zuruecksetzen, t.zuruecksetzenFrage, t.zuruecksetzenJa, () => {
            resetToSample().catch(() => undefined);
          })
        }
      />
      {isDemoBuild ? null : (
        <Button
          title={t.abmelden}
          variant="secondary"
          onPress={() => (devMode ? setDevMode(false) : supabase.auth.signOut({ scope: 'local' }))}
        />
      )}
    </Screen>
  );
}
