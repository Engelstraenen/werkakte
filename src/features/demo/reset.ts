import { useStamm } from './stamm';
import { useDemo } from './store';
import { useNetwork } from '@/features/network/store';
import { useTeam } from '@/features/team/store';
import { clearAppData } from '@/lib/persist';

/** Alles auf die Beispieldaten zurücksetzen (Gerätespeicher + aktueller Stand). */
export async function resetToSample(): Promise<void> {
  await clearAppData();
  useDemo.setState(useDemo.getInitialState(), true);
  useStamm.setState(useStamm.getInitialState(), true);
  useTeam.setState(useTeam.getInitialState(), true);
  useNetwork.setState(useNetwork.getInitialState(), true);
}
