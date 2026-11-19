import type { IconName } from '@/components/IconCircle';

import type { NetTrade } from './types';

/** Reihenfolge = grobe Bau-Reihenfolge, so findet man sein Gewerk schnell. */
export const netTrades: { value: NetTrade; label: string; icon: IconName }[] = [
  { value: 'rohbau', label: 'Maurer / Rohbau', icon: 'cube' },
  { value: 'zimmerer', label: 'Zimmerer', icon: 'git-network' },
  { value: 'dach', label: 'Dachdecker', icon: 'home' },
  { value: 'elektro', label: 'Elektriker', icon: 'flash' },
  { value: 'shk', label: 'Gas-Wasser / Heizung', icon: 'water' },
  { value: 'fenster', label: 'Fenster / Türen', icon: 'browsers' },
  { value: 'trockenbau', label: 'Trockenbau', icon: 'grid' },
  { value: 'estrich', label: 'Estrich', icon: 'layers' },
  { value: 'fliesen', label: 'Fliesenleger', icon: 'apps' },
  { value: 'maler', label: 'Maler', icon: 'color-palette' },
  { value: 'schreiner', label: 'Schreiner / Tischler', icon: 'hammer' },
  { value: 'boden', label: 'Bodenleger', icon: 'reorder-four' },
  { value: 'garten', label: 'Garten- / Landschaftsbau', icon: 'leaf' },
];

const byValue = Object.fromEntries(netTrades.map((t) => [t.value, t])) as Record<
  NetTrade,
  (typeof netTrades)[number]
>;

export const tradeLabel = (t: NetTrade) => byValue[t].label;
export const tradeIcon = (t: NetTrade) => byValue[t].icon;
export const tradesText = (list: NetTrade[]) => list.map(tradeLabel).join(', ');
