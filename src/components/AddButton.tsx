import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable } from 'react-native';

import { radius, touch, useColors } from '@/theme';

/** Orangefarbenes Plus zum Anlegen – oben rechts in jeder Liste (Kopfleiste oder Seitentitel). */
export function AddButton({ label, onPress }: { label: string; onPress: () => void }) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => ({
        width: touch.min,
        height: touch.min,
        borderRadius: radius.md,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <Ionicons name="add" size={30} color={colors.onPrimary} />
    </Pressable>
  );
}
