// Browser: Auf dem Handy das Teilen-Menü (WhatsApp, Mail, Dateien), sonst Download.
export async function savePdf(bytes: Uint8Array, fileName: string): Promise<string> {
  return download(bytes, fileName, 'application/pdf');
}

async function download(bytes: Uint8Array, fileName: string, type: string): Promise<string> {
  const blob = new Blob([bytes as BlobPart], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
  return fileName;
}

export async function sharePdf(bytes: Uint8Array, fileName: string): Promise<void> {
  return shareFile(bytes, fileName, 'application/pdf');
}

export async function shareFile(bytes: Uint8Array, fileName: string, type: string) {
  const file = new File([bytes as BlobPart], fileName, { type });
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  if (nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file], title: fileName });
      return;
    } catch (e) {
      if ((e as Error).name === 'AbortError') return; // Nutzer hat abgebrochen
    }
  }
  await download(bytes, fileName, type);
}
