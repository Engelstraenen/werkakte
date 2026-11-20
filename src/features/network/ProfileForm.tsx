import { useState } from 'react';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { TextField } from '@/components/TextField';
import { de } from '@/i18n/de';
import { confirm, notice } from '@/lib/notice';
import { spacing } from '@/theme';

import { normalizeWebsite, validateProfile, type ProfileErrors } from './logic';
import { useNetwork } from './store';
import { TradePicker } from './TradePicker';
import type { Craftsman, NetTrade } from './types';

const t = de.netzwerk;
const texts = {
  pflicht: de.anlegen.pflicht,
  email: t.fehlerEmail,
  plz: t.fehlerPlz,
  webseite: t.fehlerWebseite,
  gewerk: t.fehlerGewerk,
};

type Props = {
  me?: Craftsman;
  /** E-Mail aus dem Login – dann fest. Ohne Login (lokale Demo) tippt man sie selbst. */
  loginEmail?: string;
  onDone: () => void;
};

/** Eintrag ausfüllen bzw. ändern. Webseite ist freiwillig. */
export function ProfileForm({ me, loginEmail, onDone }: Props) {
  const saveProfile = useNetwork((s) => s.saveProfile);
  const removeProfile = useNetwork((s) => s.removeProfile);
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({
    email: me?.email ?? '',
    company: me?.company ?? '',
    name: me?.name ?? '',
    zip: me?.zip ?? '',
    city: me?.city ?? '',
    phone: me?.phone ?? '',
    website: me?.website ?? '',
    about: me?.about ?? '',
  });
  const [trades, setTrades] = useState<NetTrade[]>(me?.trades ?? []);
  const [errors, setErrors] = useState<ProfileErrors>({});
  const email = loginEmail ?? f.email;
  // Beim Tippen verschwindet die Fehlermeldung des Feldes, geprüft wird beim Speichern.
  const set = (key: keyof typeof f) => (value: string) => {
    setF((s) => ({ ...s, [key]: value }));
    setErrors((e) => (key in e ? { ...e, [key]: undefined } : e));
  };
  const pickTrades = (next: NetTrade[]) => {
    setTrades(next);
    setErrors((e) => ({ ...e, trades: undefined }));
  };

  async function run(task: () => Promise<unknown>) {
    setBusy(true);
    try {
      await task();
      onDone();
    } catch {
      notice(t.titel, de.fehler.allgemein);
    } finally {
      setBusy(false);
    }
  }

  function save() {
    const input = { ...f, email: email.trim(), trades };
    const next = validateProfile(input, texts);
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;
    run(() =>
      saveProfile({
        ...input,
        company: f.company.trim(),
        name: f.name.trim(),
        zip: f.zip.trim(),
        city: f.city.trim(),
        phone: f.phone.trim(),
        about: f.about.trim(),
        website: normalizeWebsite(f.website) ?? undefined,
      }),
    );
  }

  return (
    <>
      <TextField
        label={t.email}
        value={email}
        onChangeText={set('email')}
        editable={!loginEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        error={errors.email}
      />
      <AppText variant="small" muted>
        {loginEmail ? t.emailHinweisLogin : t.emailHinweisDemo}
      </AppText>
      <TextField
        label={t.firma}
        placeholder={t.firmaBeispiel}
        value={f.company}
        onChangeText={set('company')}
        error={errors.company}
      />
      <TextField
        label={t.name}
        placeholder={t.nameBeispiel}
        value={f.name}
        onChangeText={set('name')}
        autoComplete="name"
      />
      <AppText variant="label">{t.gewerke}</AppText>
      <TradePicker value={trades} onChange={pickTrades} error={errors.trades} />
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <View style={{ width: 110 }}>
          <TextField
            label={t.plz}
            value={f.zip}
            onChangeText={set('zip')}
            keyboardType="number-pad"
            maxLength={5}
            autoComplete="postal-code"
            error={errors.zip}
          />
        </View>
        <View style={{ flex: 1 }}>
          <TextField label={t.ort} value={f.city} onChangeText={set('city')} error={errors.city} />
        </View>
      </View>
      <TextField
        label={t.telefon}
        value={f.phone}
        onChangeText={set('phone')}
        keyboardType="phone-pad"
        autoComplete="tel"
      />
      <TextField
        label={t.webseite}
        placeholder={t.webseiteBeispiel}
        value={f.website}
        onChangeText={set('website')}
        keyboardType="url"
        autoCapitalize="none"
        autoCorrect={false}
        error={errors.website}
      />
      <AppText variant="small" muted>
        {t.webseiteHinweis}
      </AppText>
      <TextField
        label={t.ueberUns}
        placeholder={t.ueberUnsBeispiel}
        value={f.about}
        onChangeText={set('about')}
        multiline
        style={{ minHeight: 96, paddingTop: spacing.sm, textAlignVertical: 'top' }}
      />
      <Card>
        <AppText variant="small" muted>
          {t.sichtbar}
        </AppText>
      </Card>
      <Button title={me ? t.aendernSpeichern : t.speichern} onPress={save} loading={busy} />
      {me ? (
        <Button
          title={t.eintragLoeschen}
          variant="secondary"
          disabled={busy}
          onPress={() =>
            confirm(t.eintragLoeschen, t.eintragLoeschenFrage, t.eintragLoeschenJa, () =>
              run(removeProfile),
            )
          }
        />
      ) : null}
    </>
  );
}
