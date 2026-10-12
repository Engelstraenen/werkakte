import Ionicons from '@expo/vector-icons/Ionicons';
import { Linking, View } from 'react-native';

import { Button } from '@/components/Button';
import { de } from '@/i18n/de';
import { spacing, useColors } from '@/theme';

const q = encodeURIComponent;
export const googleShoppingUrl = (query: string) =>
  `https://www.google.com/search?tbm=shop&q=${q(query)}`;
export const idealoUrl = (query: string) =>
  `https://www.idealo.de/preisvergleich/MainSearchProductCategory.html?q=${q(query)}`;

/** Online-Preissuche: öffnet die Suche mit dem Begriff (keine Schnittstelle nötig). */
export function OnlineSearch({ query }: { query: string }) {
  const colors = useColors();
  return (
    <View style={{ flexDirection: 'row', gap: spacing.sm }}>
      <View style={{ flex: 1 }}>
        <Button
          title={de.einkauf.google}
          variant="secondary"
          icon={<Ionicons name="logo-google" size={20} color={colors.text} />}
          onPress={() => Linking.openURL(googleShoppingUrl(query))}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Button
          title={de.einkauf.idealo}
          variant="secondary"
          icon={<Ionicons name="pricetags-outline" size={20} color={colors.text} />}
          onPress={() => Linking.openURL(idealoUrl(query))}
        />
      </View>
    </View>
  );
}
