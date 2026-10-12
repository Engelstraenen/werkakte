import { StyleSheet, View } from 'react-native';

import { useColors } from '@/theme';

const STEP = 16;
const rows = Array.from({ length: 90 }, (_, i) => i);
const cols = Array.from({ length: 50 }, (_, i) => i);

/** Feines Raster wie auf einer Blaupause – liegt fest hinter dem Inhalt. */
export function BlueprintGrid() {
  const { grid } = useColors();
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}>
      {rows.map((i) => (
        <View
          key={`r${i}`}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: i * STEP,
            height: 1,
            backgroundColor: grid,
          }}
        />
      ))}
      {cols.map((i) => (
        <View
          key={`c${i}`}
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: i * STEP,
            width: 1,
            backgroundColor: grid,
          }}
        />
      ))}
    </View>
  );
}
