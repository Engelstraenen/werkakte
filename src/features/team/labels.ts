import { de } from '@/i18n/de';
import type { Tone } from '@/theme';

import type { ApplicantStatus, WeekStatus } from './types';

const t = de.team;

export const statusLabel: Record<ApplicantStatus, string> = {
  neu: t.statusNeu,
  angerufen: t.statusAngerufen,
  probearbeiten: t.statusProbe,
  zusage: t.statusZusage,
  absage: t.statusAbsage,
};

export const statusTone: Record<ApplicantStatus, Tone> = {
  neu: 'primary',
  angerufen: 'info',
  probearbeiten: 'warning',
  zusage: 'success',
  absage: 'neutral',
};

export const weekLabel: Record<WeekStatus, string> = {
  offen: t.weekOffen,
  abgeschlossen: t.weekAbgeschlossen,
  abgezeichnet: t.weekAbgezeichnet,
};

export const weekTone: Record<WeekStatus, Tone> = {
  offen: 'neutral',
  abgeschlossen: 'info',
  abgezeichnet: 'success',
};
