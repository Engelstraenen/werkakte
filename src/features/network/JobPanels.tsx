import { router } from 'expo-router';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Section } from '@/components/Section';
import { de } from '@/i18n/de';
import { call, mail } from '@/lib/links';
import { confirm, notice } from '@/lib/notice';
import { spacing } from '@/theme';

import { useAdoptReferral } from './adopt';
import { CraftsmanRow } from './CraftsmanRow';
import { useNetwork } from './store';
import type { Craftsman, Referral } from './types';

const t = de.netzwerk;

/** Aktion ausführen; schlägt sie fehl (z. B. kein Netz), kurzer Hinweis statt stillem Nichts. */
const act = (task: () => Promise<unknown>) => {
  task().catch(() => notice(t.titel, de.fehler.allgemein));
};

/** Absender: sieht, wer „Mach ich“ getippt hat, vergibt oder zieht zurück. */
export function OwnerPanel({ referral: r }: { referral: Referral }) {
  const craftsmen = useNetwork((s) => s.craftsmen);
  const assign = useNetwork((s) => s.assign);
  const withdraw = useNetwork((s) => s.withdraw);
  const interested = r.interested
    .map((id) => craftsmen.find((c) => c.id === id))
    .filter((c): c is Craftsman => !!c);
  const taken = craftsmen.find((c) => c.id === r.takenById);

  if (r.status === 'vergeben' && taken)
    return (
      <Section title={t.vergebenAn}>
        <Card style={{ paddingVertical: 4 }}>
          <CraftsmanRow craftsman={taken} />
        </Card>
      </Section>
    );
  if (r.status !== 'offen') return null;

  return (
    <>
      <Section title={`${t.interessiert} (${interested.length})`}>
        {interested.length === 0 ? (
          <Card>
            <AppText muted>{t.keinInteresse}</AppText>
          </Card>
        ) : (
          interested.map((c) => (
            <Card key={c.id} style={{ gap: spacing.sm }}>
              <CraftsmanRow craftsman={c} />
              <Button
                title={`${t.vergeben}: ${c.company}`}
                onPress={() =>
                  confirm(t.vergeben, t.vergebenFrage, t.vergeben, () =>
                    act(() => assign(r.id, c.id)),
                  )
                }
              />
            </Card>
          ))
        )}
      </Section>
      <Button
        title={t.zurueckziehen}
        variant="secondary"
        onPress={() =>
          confirm(t.zurueckziehen, t.zurueckziehenFrage, t.zurueckziehen, () =>
            act(() => withdraw(r.id)),
          )
        }
      />
    </>
  );
}

/** Empfänger: „Mach ich“ tippen; ist der Job vergeben, Absender anrufen und Akte anlegen. */
export function ReceiverPanel({ referral: r, from }: { referral: Referral; from: Craftsman }) {
  const meId = useNetwork((s) => s.meId);
  const toggleInterest = useNetwork((s) => s.toggleInterest);
  const projectId = useNetwork((s) => s.adopted[r.id]);
  const adopt = useAdoptReferral();

  if (!meId)
    return r.status === 'offen' ? (
      <Card style={{ gap: spacing.md }}>
        <AppText>{t.erstEintragen}</AppText>
        <Button title={t.eintragen} onPress={() => router.push('/netzwerk/eintragen')} />
      </Card>
    ) : null;

  const contact = (
    <View style={{ flexDirection: 'row', gap: spacing.sm }}>
      {from.phone ? (
        <View style={{ flex: 1 }}>
          <Button title={t.anrufen} variant="secondary" onPress={() => call(from.phone)} />
        </View>
      ) : null}
      <View style={{ flex: 1 }}>
        <Button title={t.mailen} variant="secondary" onPress={() => mail(from.email)} />
      </View>
    </View>
  );

  if (r.status === 'vergeben' && r.takenById === meId)
    return (
      <>
        <Button
          title={projectId ? t.zurAkte : t.alsProjekt}
          onPress={() => {
            const id = adopt(r, from);
            if (!projectId) notice(t.alsProjekt, t.alsProjektFertig);
            router.push(`/projekt/${id}`);
          }}
        />
        {contact}
      </>
    );
  if (r.status !== 'offen') return null;

  const mine = r.interested.includes(meId);
  return (
    <>
      <Button
        title={mine ? t.machIchZurueck : t.machIch}
        variant={mine ? 'secondary' : 'primary'}
        onPress={() => act(() => toggleInterest(r.id))}
      />
      <AppText variant="small" muted>
        {t.machIchHinweis}
      </AppText>
      {contact}
    </>
  );
}
