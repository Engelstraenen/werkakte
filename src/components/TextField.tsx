import { TextInput, View, type TextInputProps } from 'react-native';

import { AppText } from './AppText';
import { fontSize, radius, spacing, touch, useColors } from '@/theme';

type Props = TextInputProps & { label: string; error?: string };

export function TextField({ label, error, style, ...rest }: Props) {
  const colors = useColors();
  return (
    <View style={{ gap: spacing.xs }}>
      <AppText style={{ fontWeight: '600' }}>{label}</AppText>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.textMuted}
        style={[
          {
            minHeight: touch.main,
            borderWidth: 2,
            borderColor: error ? colors.danger : colors.border,
            borderRadius: radius.md,
            paddingHorizontal: spacing.md,
            fontSize: fontSize.body,
            color: colors.text,
            backgroundColor: colors.background,
          },
          style,
        ]}
        {...rest}
      />
      {error ? <AppText style={{ color: colors.danger }}>{error}</AppText> : null}
    </View>
  );
}
