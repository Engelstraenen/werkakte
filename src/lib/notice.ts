import { Alert, Platform } from 'react-native';

/** Kurzer Hinweis-Dialog; Alert.alert tut im Web nichts. */
export function notice(title: string, message: string) {
  if (Platform.OS === 'web') window.alert(`${title}\n\n${message}`);
  else Alert.alert(title, message);
}

/** Ja/Nein-Frage; ruft onYes nur bei Zustimmung auf. */
export function confirm(title: string, message: string, yes: string, onYes: () => void) {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) onYes();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Abbrechen', style: 'cancel' },
    { text: yes, style: 'destructive', onPress: onYes },
  ]);
}
