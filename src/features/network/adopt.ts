import { useStamm } from '@/features/demo/stamm';
import { useDemo } from '@/features/demo/store';

import { useNetwork } from './store';
import type { Craftsman, Referral } from './types';

/**
 * Zugeschobenen Job als eigene Projektakte anlegen: Absender wird Kunde (Firma),
 * Job-Details landen als erste Notiz. Gibt die Projekt-ID zurück; zweimal anlegen geht nicht.
 */
export function useAdoptReferral() {
  const customers = useStamm((s) => s.customers);
  const addCustomer = useStamm((s) => s.addCustomer);
  const addProject = useDemo((s) => s.addProject);
  const addNote = useDemo((s) => s.addNote);
  const adopted = useNetwork((s) => s.adopted);
  const markAdopted = useNetwork((s) => s.markAdopted);

  return (r: Referral, from: Craftsman): string => {
    const existing = adopted[r.id];
    if (existing) return existing;
    const customerId =
      customers.find((c) => c.email && c.email.toLowerCase() === from.email.toLowerCase())?.id ??
      addCustomer({
        type: 'gewerblich',
        name: from.company,
        contact: from.name || undefined,
        street: '',
        zipCity: `${from.zip} ${from.city}`,
        phone: from.phone,
        email: from.email,
      });
    const projectId = addProject({
      title: r.title,
      customerId,
      street: '',
      zipCity: `${r.zip} ${r.city}`,
    });
    addNote(
      projectId,
      [`Über das Handwerker-Netzwerk von ${from.company}.`, r.details, r.when && `Wann: ${r.when}`]
        .filter(Boolean)
        .join('\n'),
    );
    markAdopted(r.id, projectId);
    return projectId;
  };
}
