import { Pressable, Switch, View } from 'react-native';

import { AppText } from './AppText';
import { spacing, touch, useColors } from '@/theme';

type Props = {
  title: string;
  subtitle?: string;
  value: boolean;
  onChange: (value: boolean) => void;
  divider?: boolean;
  disabled?: boolean;
};

/** Ganze Zeile antippbar (große Fläche, auch mit Handschuhen). */
export function ToggleRow({ title, subtitle, value, onChange, divider, disabled }: Props) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled}
      onPress={() => onChange(!value)}
      style={{
        minHeight: touch.main,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingVertical: spacing.sm,
        borderTopWidth: divider ? 1 : 0,
        borderTopColor: colors.surface,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <View style={{ flex: 1, gap: 2 }}>
        <AppText variant="label">{title}</AppText>
        {subtitle ? (
          <AppText variant="small" muted>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        trackColor={{ true: colors.success, false: colors.border }}
      />
    </Pressable>
  );
}
