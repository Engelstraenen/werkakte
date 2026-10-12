import type { MediaTag, ProjectStatus } from '@/features/demo/types';
import type { Tone } from '@/theme';

export const statusTone: Record<ProjectStatus, Tone> = {
  anfrage: 'info',
  angebot: 'warning',
  beauftragt: 'primary',
  in_arbeit: 'primary',
  abgeschlossen: 'success',
  bezahlt: 'neutral',
};

export const tagTone: Record<MediaTag, Tone> = {
  vorher: 'info',
  nachher: 'success',
  mangel: 'danger',
  sonstiges: 'neutral',
};
