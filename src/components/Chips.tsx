import { useRef } from 'react';
import { Pressable, ScrollView } from 'react-native';

import { AppText } from './AppText';
import { radius, spacing, useColors } from '@/theme';

type Option<T extends string> = { value: T; label: string };
type Props<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  /** true: Leiste über volle Breite (Reiter), false: scrollbare Filter-Chips. */
  segmented?: boolean;
};

export function Chips<T extends string>({ options, value, onChange, segmented }: Props<T>) {
  const colors = useColors();
  const scroll = useRef<ScrollView>(null);
  return (
    <ScrollView
      ref={scroll}
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ flexGrow: 0, marginHorizontal: segmented ? 0 : -spacing.md }}
      contentContainerStyle={{
        gap: spacing.sm,
        paddingHorizontal: segmented ? 0 : spacing.md,
        flexGrow: segmented ? 1 : 0,
      }}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(o.value)}
            // Aktiven Chip sichtbar halten, auch wenn er rechts außerhalb liegt.
            onLayout={
              active
                ? (e) =>
                    scroll.current?.scrollTo({
                      x: Math.max(0, e.nativeEvent.layout.x - spacing.xl),
                      animated: false,
                    })
                : undefined
            }
            style={{
              flexGrow: segmented ? 1 : 0,
              minHeight: 48,
              paddingHorizontal: spacing.md,
              borderRadius: radius.full,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: active ? colors.text : colors.card,
              borderWidth: 1,
              borderColor: active ? colors.text : colors.border,
            }}
          >
            <AppText variant="label" color={active ? colors.card : colors.text}>
              {o.label}
            </AppText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
