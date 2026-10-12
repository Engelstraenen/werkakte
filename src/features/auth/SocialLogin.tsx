import Ionicons from '@expo/vector-icons/Ionicons';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useEffect, useState, type ComponentProps } from 'react';
import { Platform, View, useColorScheme } from 'react-native';

import { useEnabledProviders } from './useEnabledProviders';
import { useSocialLogin, type OAuthProvider } from './useSocialLogin';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { de } from '@/i18n/de';
import { radius, spacing, touch, useColors } from '@/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];
const browserProviders: { id: OAuthProvider; label: string; icon: IconName }[] = [
  { id: 'google', label: de.login.mitGoogle, icon: 'logo-google' },
  { id: 'azure', label: de.login.mitMicrosoft, icon: 'logo-microsoft' },
  { id: 'facebook', label: de.login.mitFacebook, icon: 'logo-facebook' },
];

export function SocialLogin() {
  const colors = useColors();
  const scheme = useColorScheme();
  const { busy, error, signInWithBrowser, signInWithApple } = useSocialLogin();
  const [nativeApple, setNativeApple] = useState(false);
  // Offline oder Fehler → keine Anbieter-Buttons, E-Mail geht immer.
  const { data: enabled = {} } = useEnabledProviders();
  const visible = browserProviders.filter((p) => enabled[p.id]);

  useEffect(() => {
    if (Platform.OS === 'ios') AppleAuthentication.isAvailableAsync().then(setNativeApple);
  }, []);

  const providerButton = (id: OAuthProvider, label: string, icon: IconName) => (
    <Button
      key={id}
      title={label}
      variant="secondary"
      icon={<Ionicons name={icon} size={22} color={colors.text} />}
      loading={busy === id}
      disabled={busy !== undefined}
      onPress={() => signInWithBrowser(id)}
    />
  );

  if (!enabled.apple && visible.length === 0) return null;

  return (
    <View style={{ gap: spacing.sm }}>
      {!enabled.apple ? null : nativeApple ? (
        // Apple schreibt auf iOS den eigenen Button vor (Human Interface Guidelines).
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
          buttonStyle={
            scheme === 'dark'
              ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
              : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
          }
          cornerRadius={radius.md}
          style={{ height: touch.main }}
          onPress={signInWithApple}
        />
      ) : (
        providerButton('apple', de.login.mitApple, 'logo-apple')
      )}
      {visible.map((p) => providerButton(p.id, p.label, p.icon))}
      {error ? <AppText style={{ color: colors.danger }}>{error}</AppText> : null}
      <AppText muted style={{ textAlign: 'center' }}>
        {de.login.oderEmail}
      </AppText>
    </View>
  );
}
