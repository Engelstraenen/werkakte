import { Linking } from 'react-native';

/** Öffnet die Navigation (Google Maps bzw. Karten-App) zur Adresse. */
export const openRoute = (address: string) =>
  Linking.openURL(
    `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`,
  );

export const call = (phone: string) => Linking.openURL(`tel:${phone.replace(/\s/g, '')}`);
export const mail = (email: string) => Linking.openURL(`mailto:${email}`);
