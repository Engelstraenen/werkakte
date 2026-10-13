import { Stack } from 'expo-router';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { ToggleRow } from '@/components/ToggleRow';
import { members } from '@/features/demo/data';
import { useDemo } from '@/features/demo/store';
import { de } from '@/i18n/de';

const t = de.versand;

export default function VersandScreen() {
  const sending = useDemo((s) => s.sending);
  const setSending = useDemo((s) => s.setSending);
  return (
    <Screen>
      <Stack.Screen options={{ title: t.titel }} />
      <AppText muted>{t.hinweis}</AppText>
      <Card>
        <ToggleRow
          title={t.kopie}
          value={sending.copyToMe}
          onChange={(v) => setSending({ copyToMe: v })}
        />
        <TextField
          label={t.meineMail}
          value={sending.myEmail}
          onChangeText={(v) => setSending({ myEmail: v })}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </Card>
      <Card>
        <ToggleRow
          title={t.datev}
          value={sending.toDatev}
          onChange={(v) => setSending({ toDatev: v })}
        />
        <TextField
          label={t.datevMail}
          value={sending.datevEmail}
          onChangeText={(v) => setSending({ datevEmail: v })}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <AppText variant="small" muted>
          {t.datevHinweis}
        </AppText>
      </Card>
      <Card>
        <AppText variant="title">{de.material.empfaenger}</AppText>
        <AppText variant="small" muted>
          {de.material.empfaengerHinweis}
        </AppText>
        {members.map((m, i) => (
          <ToggleRow
            key={m.id}
            divider={i > 0}
            title={m.name}
            value={sending.materialRecipients.includes(m.id)}
            onChange={(on) =>
              setSending({
                materialRecipients: on
                  ? [...sending.materialRecipients, m.id]
                  : sending.materialRecipients.filter((x) => x !== m.id),
              })
            }
          />
        ))}
        <TextField
          label={de.material.einkaufMail}
          value={sending.purchasingEmail}
          onChangeText={(v) => setSending({ purchasingEmail: v })}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </Card>
    </Screen>
  );
}
