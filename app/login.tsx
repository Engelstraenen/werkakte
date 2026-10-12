import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Logo } from '@/components/Logo';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { useSession } from '@/features/auth/session';
import { SocialLogin } from '@/features/auth/SocialLogin';
import { useLogin } from '@/features/auth/useLogin';
import { de } from '@/i18n/de';
import { spacing, useColors } from '@/theme';

const t = de.login;

export default function LoginScreen() {
  const colors = useColors();
  const login = useLogin();
  const { setDevMode } = useSession();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Screen>
          <View style={{ gap: spacing.sm, marginTop: spacing.lg, marginBottom: spacing.md }}>
            <Logo size={56} />
            <AppText variant="mono">{de.app.claim}</AppText>
          </View>
          <AppText variant="heading">{t.titel}</AppText>
          {__DEV__ ? (
            <Button title={t.testmodus} variant="secondary" onPress={() => setDevMode(true)} />
          ) : null}
          {login.sent ? null : <SocialLogin />}
          {login.sent ? (
            <>
              <AppText>{t.gesendet}</AppText>
              <TextField
                label={t.codeLabel}
                value={login.code}
                onChangeText={login.setCode}
                keyboardType="number-pad"
                autoComplete="one-time-code"
                textContentType="oneTimeCode"
                maxLength={10}
                error={login.error}
              />
              <Button
                title={t.codeBestaetigen}
                onPress={login.verifyCode}
                loading={login.loading}
              />
              <Button title={t.andereEmail} variant="secondary" onPress={login.reset} />
            </>
          ) : (
            <>
              <TextField
                label={t.emailLabel}
                value={login.email}
                onChangeText={login.setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
                error={login.error}
                onSubmitEditing={login.sendLink}
              />
              <Button title={t.linkSenden} onPress={login.sendLink} loading={login.loading} />
            </>
          )}
        </Screen>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
