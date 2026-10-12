import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, TextInput, View } from 'react-native';

import { fontSize, radius, spacing, touch, useColors } from '@/theme';

type Props = { value: string; onChange: (text: string) => void; placeholder: string };

export function SearchField({ value, onChange, placeholder }: Props) {
  const colors = useColors();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        minHeight: touch.main,
        paddingHorizontal: spacing.md,
        borderRadius: radius.md,
        backgroundColor: colors.card,
        boxShadow: colors.shadow,
      }}
    >
      <Ionicons name="search" size={22} color={colors.textMuted} />
      <TextInput
        accessibilityLabel={placeholder}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        returnKeyType="search"
        style={{ flex: 1, fontSize: fontSize.body, color: colors.text, minHeight: touch.main }}
      />
      {value ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Suche leeren"
          onPress={() => onChange('')}
          hitSlop={12}
        >
          <Ionicons name="close-circle" size={22} color={colors.textMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}
