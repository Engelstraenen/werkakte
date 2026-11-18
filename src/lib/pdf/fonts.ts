// Hausschrift IBM Plex fürs PDF laden (wie App und Website). iPhone/Android: Datei aus dem App-Paket.
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';

import { base64ToBytes } from './base64';

export type PdfFonts = { regular: Uint8Array; bold: Uint8Array };

async function read(mod: number): Promise<Uint8Array> {
  const asset = await Asset.fromModule(mod).downloadAsync();
  const b64 = await FileSystem.readAsStringAsync(asset.localUri ?? asset.uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return base64ToBytes(b64);
}

let cache: Promise<PdfFonts> | undefined;
export function loadPdfFonts(): Promise<PdfFonts> {
  cache ??= Promise.all([
    read(require('@expo-google-fonts/ibm-plex-sans/400Regular/IBMPlexSans_400Regular.ttf')),
    read(require('@expo-google-fonts/ibm-plex-sans/600SemiBold/IBMPlexSans_600SemiBold.ttf')),
  ]).then(([regular, bold]) => ({ regular, bold }));
  return cache;
}
