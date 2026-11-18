// Browser: Schriftdatei über ihre Asset-URL laden.
import { Asset } from 'expo-asset';

export type PdfFonts = { regular: Uint8Array; bold: Uint8Array };

async function read(mod: number): Promise<Uint8Array> {
  const res = await fetch(Asset.fromModule(mod).uri);
  return new Uint8Array(await res.arrayBuffer());
}

let cache: Promise<PdfFonts> | undefined;
export function loadPdfFonts(): Promise<PdfFonts> {
  cache ??= Promise.all([
    read(require('@expo-google-fonts/ibm-plex-sans/400Regular/IBMPlexSans_400Regular.ttf')),
    read(require('@expo-google-fonts/ibm-plex-sans/600SemiBold/IBMPlexSans_600SemiBold.ttf')),
  ]).then(([regular, bold]) => ({ regular, bold }));
  return cache;
}
