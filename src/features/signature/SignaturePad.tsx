import { useRef, useState } from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { radius, useColors } from '@/theme';

export const PAD_W = 320;
export const PAD_H = 160;

/**
 * Unterschriftenfeld: Finger (oder Maus) zeichnet Linien. Ergebnis sind SVG-Pfade in
 * Feld-Koordinaten (320 × 160) – klein, verlustfrei, direkt ins PDF übernehmbar.
 */
export function SignaturePad({ onChange }: { onChange: (paths: string[]) => void }) {
  const colors = useColors();
  const [paths, setPaths] = useState<string[]>([]);
  const current = useRef('');
  const done = useRef<string[]>([]);
  const scale = useRef(1);
  const pt = (x: number, y: number) =>
    `${Math.round((x / scale.current) * 10) / 10},${Math.round((y / scale.current) * 10) / 10}`;

  type Touch = { nativeEvent: { locationX: number; locationY: number } };
  const start = (e: Touch) => {
    current.current = `M${pt(e.nativeEvent.locationX, e.nativeEvent.locationY)}`;
    setPaths([...done.current, current.current]);
  };
  const move = (e: Touch) => {
    current.current += ` L${pt(e.nativeEvent.locationX, e.nativeEvent.locationY)}`;
    setPaths([...done.current, current.current]);
  };
  const end = () => {
    done.current = [...done.current, current.current];
    setPaths(done.current);
    onChange(done.current);
  };

  return (
    <View
      onLayout={(e) => (scale.current = e.nativeEvent.layout.width / PAD_W)}
      style={{
        width: '100%',
        aspectRatio: PAD_W / PAD_H,
        borderRadius: radius.md,
        borderWidth: 2,
        borderColor: colors.border,
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
      }}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderTerminationRequest={() => false}
      onResponderGrant={start}
      onResponderMove={move}
      onResponderRelease={end}
    >
      <Svg width="100%" height="100%" viewBox={`0 0 ${PAD_W} ${PAD_H}`} pointerEvents="none">
        <Path
          d={`M20,${PAD_H - 30} L${PAD_W - 20},${PAD_H - 30}`}
          stroke="#C8C8C8"
          strokeWidth={1}
        />
        {paths.map((d, i) => (
          <Path
            key={i}
            d={d}
            stroke="#0E0E0E"
            strokeWidth={2.4}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </Svg>
    </View>
  );
}
