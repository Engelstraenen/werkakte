// Foto aufnehmen oder aus der Galerie wählen, verkleinern und dauerhaft ablegen.
// iPhone/Android: Datei im App-Ordner „medien“. Browser: verkleinertes Bild als data-URL.
// Ab Phase 3: Upload in Supabase Storage (privater Bucket), offline zuerst lokal.
import * as FileSystem from 'expo-file-system/legacy';
import { SaveFormat, manipulateAsync } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

export type PhotoSource = 'kamera' | 'galerie';
const WEB = Platform.OS === 'web';

export async function pickPhoto(from: PhotoSource): Promise<string | null> {
  if (!WEB) {
    const perm =
      from === 'kamera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return null;
  }
  const options: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.9 };
  const res =
    from === 'kamera'
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);
  const uri = res.canceled ? undefined : res.assets[0]?.uri;
  if (!uri) return null;

  // Verkleinern: scharf genug für Doku, klein genug für Speicher und Upload.
  const small = await manipulateAsync(uri, [{ resize: { width: WEB ? 1200 : 1600 } }], {
    compress: WEB ? 0.6 : 0.7,
    format: SaveFormat.JPEG,
    base64: WEB,
  });
  if (WEB) return `data:image/jpeg;base64,${small.base64}`;

  const dir = `${FileSystem.documentDirectory}medien/`;
  await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  const target = `${dir}${Date.now().toString(36)}.jpg`;
  await FileSystem.copyAsync({ from: small.uri, to: target });
  return target;
}
