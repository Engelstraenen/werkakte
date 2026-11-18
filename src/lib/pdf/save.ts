// iPhone/Android: PDF dauerhaft im App-Ordner „Belege“ ablegen, dann Teilen-Menü öffnen
// (WhatsApp, Mail, „In Dateien sichern“, AirDrop …).
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

import { bytesToBase64 } from './base64';

export async function savePdf(bytes: Uint8Array, fileName: string): Promise<string> {
  return saveFile(bytes, fileName);
}

async function saveFile(bytes: Uint8Array, fileName: string): Promise<string> {
  const dir = `${FileSystem.documentDirectory}belege/`;
  await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  const uri = dir + fileName;
  await FileSystem.writeAsStringAsync(uri, bytesToBase64(bytes), {
    encoding: FileSystem.EncodingType.Base64,
  });
  return uri;
}

export async function sharePdf(bytes: Uint8Array, fileName: string): Promise<void> {
  return shareFile(bytes, fileName, 'application/pdf');
}

export async function shareFile(bytes: Uint8Array, fileName: string, mimeType: string) {
  const uri = await saveFile(bytes, fileName);
  if (await Sharing.isAvailableAsync())
    await Sharing.shareAsync(uri, {
      mimeType,
      UTI: mimeType === 'application/pdf' ? 'com.adobe.pdf' : 'public.xml',
    });
}
