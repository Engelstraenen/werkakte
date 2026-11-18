// Job-Link teilen: jeder Mitarbeiter teilt seinen persönlichen Link (Empfehlung = Prämie).
import { Linking, Platform, Share } from 'react-native';

import { CAREER_URL } from './data';
import type { JobOpening } from './types';

/** Persönlicher Link: Stelle + wer geteilt hat (für die Prämie). */
export function jobLink(job: JobOpening, memberId: string): string {
  return `${CAREER_URL}?stelle=${encodeURIComponent(job.slug)}&von=${encodeURIComponent(memberId)}`;
}

/** Kurzer Text für WhatsApp & Co. – du-Form, so wie Kollegen schreiben. */
export function jobMessage(job: JobOpening, memberId: string, company: string): string {
  return [
    `Wir suchen Verstärkung bei ${company}: ${job.title}.`,
    `${job.salary} · ${job.hours}.`,
    'Bewerben geht in 60 Sekunden, ohne Lebenslauf:',
    jobLink(job, memberId),
  ].join('\n');
}

/**
 * Teilt den Text über das Teilen-Menü des Handys. Im Browser ohne Teilen-Funktion
 * öffnet sich WhatsApp mit dem fertigen Text.
 */
export async function shareText(message: string): Promise<'geteilt' | 'whatsapp'> {
  const webShare =
    Platform.OS === 'web' && typeof navigator !== 'undefined' && 'share' in navigator;
  if (Platform.OS !== 'web' || webShare) {
    try {
      await Share.share({ message });
      return 'geteilt';
    } catch {
      // Nutzer hat abgebrochen oder Teilen geht nicht – dann WhatsApp.
    }
  }
  await Linking.openURL(`https://wa.me/?text=${encodeURIComponent(message)}`);
  return 'whatsapp';
}
