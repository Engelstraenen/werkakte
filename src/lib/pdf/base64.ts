const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/** Bytes → Base64 ohne Node-Buffer (läuft in Hermes und im Browser). */
export function bytesToBase64(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i]!;
    const b = bytes[i + 1];
    const c = bytes[i + 2];
    out += CHARS[a >> 2];
    out += CHARS[((a & 3) << 4) | ((b ?? 0) >> 4)];
    out += b === undefined ? '=' : CHARS[((b & 15) << 2) | ((c ?? 0) >> 6)];
    out += c === undefined ? '=' : CHARS[c & 63];
  }
  return out;
}
