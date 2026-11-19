import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { radius, spacing, useColors } from '@/theme';

import { netTrades } from './trades';
import type { NetTrade } from './types';

type Props = {
  value: NetTrade[];
  onChange: (value: NetTrade[]) => void;
  /** false: genau ein Gewerk (z. B. „Wen brauchst du?“). */
  multi?: boolean;
  error?: string;
};

/** Gewerke als große Kacheln zum Antippen, umbrechend statt seitlich scrollen. */
export function TradePicker({ value, onChange, multi = true, error }: Props) {
  const colors = useColors();
  const toggle = (t: NetTrade) => {
    if (!multi) return onChange([t]);
    onChange(value.includes(t) ? value.filter((v) => v !== t) : [...value, t]);
  };
  return (
    <View style={{ gap: spacing.xs }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        {netTrades.map((t) => {
          const active = value.includes(t.value);
          return (
            <Pressable
              key={t.value}
              accessibilityRole={multi ? 'checkbox' : 'radio'}
              accessibilityState={{ checked: active }}
              onPress={() => toggle(t.value)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.xs,
                minHeight: 48,
                paddingHorizontal: spacing.md,
                borderRadius: radius.md,
                borderWidth: 1,
                borderColor: active ? colors.primary : colors.border,
                backgroundColor: active ? colors.primary : colors.card,
              }}
            >
              <Ionicons
                name={t.icon}
                size={18}
                color={active ? colors.onPrimary : colors.primary}
              />
              <AppText variant="label" color={active ? colors.onPrimary : colors.text}>
                {t.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
      {error ? (
        <AppText variant="small" color={colors.danger}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}
