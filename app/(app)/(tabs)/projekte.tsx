import { useState } from 'react';

import { AppText } from '@/components/AppText';
import { Chips } from '@/components/Chips';
import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { SearchField } from '@/components/SearchField';
import { customerOf, statusOrder } from '@/features/demo/selectors';
import { useDemo } from '@/features/demo/store';
import type { ProjectStatus } from '@/features/demo/types';
import { ProjectCard } from '@/features/projects/ProjectCard';
import { de } from '@/i18n/de';

type Filter = ProjectStatus | 'alle';
const filters: { value: Filter; label: string }[] = [
  { value: 'alle', label: de.projekte.alle },
  ...statusOrder.map((s) => ({ value: s, label: de.status[s] })),
];

export default function ProjekteScreen() {
  const projects = useDemo((s) => s.projects);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('alle');

  const q = query.trim().toLowerCase();
  const visible = projects
    .filter((p) => filter === 'alle' || p.status === filter)
    .filter((p) =>
      [p.title, p.street, p.zipCity, customerOf(p).name].some((s) => s.toLowerCase().includes(q)),
    )
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return (
    <Screen
      title={de.tabs.projekte}
      header={
        <>
          <SearchField value={query} onChange={setQuery} placeholder={de.projekte.suche} />
          <Chips options={filters} value={filter} onChange={setFilter} />
          <AppText muted>{de.projekte.anzahl(visible.length)}</AppText>
        </>
      }
    >
      {visible.length === 0 ? (
        <EmptyState icon="folder-open-outline" text={de.projekte.keine} />
      ) : (
        visible.map((p) => <ProjectCard key={p.id} project={p} />)
      )}
    </Screen>
  );
}
