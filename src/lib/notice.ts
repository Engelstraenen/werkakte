import { Alert, Platform } from 'react-native';

/** Kurzer Hinweis-Dialog; Alert.alert tut im Web nichts. */
export function notice(title: string, message: string) {
  if (Platform.OS === 'web') window.alert(`${title}\n\n${message}`);
  else Alert.alert(title, message);
}
