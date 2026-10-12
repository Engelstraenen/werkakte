import { Pressable, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { appointmentsOn } from '@/features/demo/selectors';
import { addDays, isSameDay, startOfWeek } from '@/lib/date';
import { radius, spacing, useColors } from '@/theme';

const weekday = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

/** Wochenleiste Mo–So; Punkt = Tag mit Terminen. */
export function WeekStrip({ selected, onSelect }: { selected: Date; onSelect: (d: Date) => void }) {
  const colors = useColors();
  const monday = startOfWeek(selected);
  const today = new Date();
  return (
    <View style={{ flexDirection: 'row', gap: 4 }}>
      {weekday.map((label, i) => {
        const day = addDays(monday, i);
        const active = isSameDay(day, selected);
        const isToday = isSameDay(day, today);
        const busy = appointmentsOn(day).length > 0;
        return (
          <Pressable
            key={label}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onSelect(day)}
            style={{
              flex: 1,
              minHeight: 72,
              borderRadius: radius.md,
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              backgroundColor: active ? colors.primary : colors.card,
              borderWidth: isToday && !active ? 2 : 0,
              borderColor: colors.primary,
            }}
          >
            <AppText variant="small" color={active ? colors.onPrimary : colors.textMuted}>
              {label}
            </AppText>
            <AppText variant="title" color={active ? colors.onPrimary : colors.text}>
              {day.getDate()}
            </AppText>
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                marginTop: spacing.xs / 2,
                backgroundColor: busy
                  ? active
                    ? colors.onPrimary
                    : colors.primary
                  : 'transparent',
              }}
            />
          </Pressable>
        );
      })}
    </View>
  );
}
