import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { TextField } from '@/components/TextField';
import { useLogin } from '@/features/auth/useLogin';
import { de } from '@/i18n/de';
import { spacing } from '@/theme';

const t = de.netzwerk;

/**
 * Live-Netzwerk ohne Anmeldung: erst die E-Mail bestätigen (Link oder Code per Mail),
 * dann ausfüllen. So gehört jeder Eintrag zu einer echten E-Mail-Adresse.
 */
export function NetworkLogin() {
  const login = useLogin('/netzwerk/eintragen');
  if (login.sent)
    return (
      <Card style={{ gap: spacing.md }}>
        <AppText variant="title">{t.mailUnterwegs}</AppText>
        <AppText muted>{`${t.mailUnterwegsText} ${login.email.trim().toLowerCase()}`}</AppText>
        <TextField
          label={de.login.codeLabel}
          value={login.code}
          onChangeText={login.setCode}
          keyboardType="number-pad"
          autoComplete="one-time-code"
          textContentType="oneTimeCode"
          maxLength={10}
          error={login.error}
        />
        <Button
          title={de.login.codeBestaetigen}
          onPress={login.verifyCode}
          loading={login.loading}
        />
        <Button title={de.login.andereEmail} variant="secondary" onPress={login.reset} />
      </Card>
    );
  return (
    <Card style={{ gap: spacing.md }}>
      <AppText variant="title">{t.schritt1}</AppText>
      <AppText muted>{t.schritt1Text}</AppText>
      <TextField
        label={t.email}
        value={login.email}
        onChangeText={login.setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        error={login.error}
        onSubmitEditing={login.sendLink}
      />
      <Button title={t.mailSenden} onPress={login.sendLink} loading={login.loading} />
    </Card>
  );
}
