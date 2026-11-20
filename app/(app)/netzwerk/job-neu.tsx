import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Chips } from '@/components/Chips';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { useDemo } from '@/features/demo/store';
import { isZip } from '@/features/network/logic';
import { useMe, useNetwork } from '@/features/network/store';
import { TradePicker } from '@/features/network/TradePicker';
import type { NetTrade } from '@/features/network/types';
import { de } from '@/i18n/de';
import { notice } from '@/lib/notice';
import { spacing } from '@/theme';

const t = de.netzwerk;
type Target = 'alle' | 'direkt';

/** „76131 Karlsruhe“ → PLZ und Ort. */
const splitZipCity = (zipCity: string) => {
  const m = /^(\d{5})\s+(.+)$/.exec(zipCity.trim());
  return m ? { zip: m[1], city: m[2] } : { zip: '', city: zipCity.trim() };
};

function NotRegistered() {
  return (
    <Card style={{ gap: spacing.md }}>
      <AppText>{t.erstEintragen}</AppText>
      <Button title={t.eintragen} onPress={() => router.replace('/netzwerk/eintragen')} />
    </Card>
  );
}

/** Job an ein anderes Gewerk weitergeben – an alle in der Gegend oder direkt an einen Betrieb. */
export default function JobNeuScreen() {
  const { toId, projectId } = useLocalSearchParams<{ toId?: string; projectId?: string }>();
  const me = useMe();
  const to = useNetwork((s) => s.craftsmen.find((c) => c.id === toId));
  const addReferral = useNetwork((s) => s.addReferral);
  const project = useDemo((s) => s.projects.find((p) => p.id === projectId));
  const place = project ? splitZipCity(project.zipCity) : null;

  const [trade, setTrade] = useState<NetTrade[]>(to?.trades.slice(0, 1) ?? []);
  const [target, setTarget] = useState<Target>(to ? 'direkt' : 'alle');
  const [title, setTitle] = useState(project?.title ?? '');
  const [details, setDetails] = useState('');
  const [zip, setZip] = useState(place?.zip ?? me?.zip ?? '');
  const [city, setCity] = useState(place?.city ?? me?.city ?? '');
  const [when, setWhen] = useState('');
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<'trade' | 'title' | 'zip' | 'city', string>>>(
    {},
  );

  if (!me) {
    return (
      <Screen>
        <Stack.Screen options={{ title: t.jobNeuTitel }} />
        <NotRegistered />
      </Screen>
    );
  }

  async function send() {
    const picked = trade[0];
    const next = {
      trade: picked ? undefined : t.fehlerGewerk,
      title: title.trim() ? undefined : de.anlegen.pflicht,
      zip: isZip(zip) ? undefined : t.fehlerPlz,
      city: city.trim() ? undefined : de.anlegen.pflicht,
    };
    setErrors(next);
    if (!picked || Object.values(next).some(Boolean)) return;
    setBusy(true);
    const id = await addReferral({
      trade: picked,
      title: title.trim(),
      details: details.trim(),
      zip: zip.trim(),
      city: city.trim(),
      when: when.trim(),
      toId: target === 'direkt' && to ? to.id : undefined,
      projectId: project?.id,
    }).catch(() => null);
    setBusy(false);
    if (!id) return notice(t.jobNeuTitel, de.fehler.allgemein);
    notice(t.jobNeuTitel, t.gesendet);
    router.replace(`/netzwerk/job/${id}`);
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: t.jobNeuTitel }} />
      {project ? <AppText variant="mono">{`${t.ausProjekt}: ${project.title}`}</AppText> : null}
      {to ? (
        <>
          <AppText variant="label">{t.anWen}</AppText>
          <Chips
            segmented
            options={[
              { value: 'direkt', label: `${t.direktAn} ${to.company}` },
              { value: 'alle', label: t.anAlle },
            ]}
            value={target}
            onChange={setTarget}
          />
        </>
      ) : null}
      <AppText variant="label">{t.welchesGewerk}</AppText>
      <TradePicker multi={false} value={trade} onChange={setTrade} error={errors.trade} />
      <TextField
        label={t.jobTitel}
        placeholder={t.jobTitelBeispiel}
        value={title}
        onChangeText={setTitle}
        error={errors.title}
      />
      <TextField
        label={t.details}
        placeholder={t.detailsBeispiel}
        value={details}
        onChangeText={setDetails}
        multiline
        style={{ minHeight: 96, paddingTop: spacing.sm, textAlignVertical: 'top' }}
      />
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <View style={{ width: 110 }}>
          <TextField
            label={t.plz}
            value={zip}
            onChangeText={setZip}
            keyboardType="number-pad"
            maxLength={5}
            error={errors.zip}
          />
        </View>
        <View style={{ flex: 1 }}>
          <TextField label={t.ort} value={city} onChangeText={setCity} error={errors.city} />
        </View>
      </View>
      <TextField label={t.wann} placeholder={t.wannBeispiel} value={when} onChangeText={setWhen} />
      <Button title={t.absenden} onPress={send} loading={busy} />
    </Screen>
  );
}
