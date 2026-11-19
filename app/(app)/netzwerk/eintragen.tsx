import { Stack, router, useNavigation } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { useSession } from '@/features/auth/session';
import { normalizeWebsite, validateProfile, type ProfileErrors } from '@/features/network/logic';
import { useMe, useNetwork } from '@/features/network/store';
import { TradePicker } from '@/features/network/TradePicker';
import type { NetTrade } from '@/features/network/types';
import { de } from '@/i18n/de';
import { confirm } from '@/lib/notice';
import { spacing } from '@/theme';

const t = de.netzwerk;
const texts = {
  pflicht: de.anlegen.pflicht,
  email: t.fehlerEmail,
  plz: t.fehlerPlz,
  webseite: t.fehlerWebseite,
  gewerk: t.fehlerGewerk,
};

/** Eintragen ins Verzeichnis bzw. eigenen Eintrag ändern. Webseite ist freiwillig. */
export default function EintragenScreen() {
  const { session } = useSession();
  const navigation = useNavigation();
  // Zurück – oder zur Übersicht, wenn die Seite direkt per Link geöffnet wurde (kein Zurück da).
  const done = () => (navigation.canGoBack() ? router.back() : router.replace('/netzwerk'));
  const me = useMe();
  const saveProfile = useNetwork((s) => s.saveProfile);
  const removeProfile = useNetwork((s) => s.removeProfile);
  // Angemeldet: E-Mail kommt aus dem Login und ist fest. Demo/Testmodus: selbst eintragen.
  const loginEmail = session?.user.email;
  const [f, setF] = useState({
    email: me?.email ?? loginEmail ?? '',
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
  // Beim Tippen verschwindet die Fehlermeldung des Feldes, geprüft wird beim Speichern.
  const set = (key: keyof typeof f) => (value: string) => {
    setF((s) => ({ ...s, [key]: value }));
    setErrors((e) => (key in e ? { ...e, [key]: undefined } : e));
  };
  const pickTrades = (next: NetTrade[]) => {
    setTrades(next);
    setErrors((e) => ({ ...e, trades: undefined }));
  };

  function save() {
    const input = { ...f, email: f.email.trim(), trades };
    const next = validateProfile(input, texts);
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;
    saveProfile({
      ...input,
      company: f.company.trim(),
      name: f.name.trim(),
      zip: f.zip.trim(),
      city: f.city.trim(),
      phone: f.phone.trim(),
      about: f.about.trim(),
      website: normalizeWebsite(f.website) ?? undefined,
    });
    done();
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: me ? t.eintragAendern : t.eintragTitel }} />
      <TextField
        label={t.email}
        value={f.email}
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
      <Button title={me ? t.aendernSpeichern : t.speichern} onPress={save} />
      {me ? (
        <Button
          title={t.eintragLoeschen}
          variant="secondary"
          onPress={() =>
            confirm(t.eintragLoeschen, t.eintragLoeschenFrage, t.eintragLoeschenJa, () => {
              removeProfile();
              done();
            })
          }
        />
      ) : null}
    </Screen>
  );
}
