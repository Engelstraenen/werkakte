import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/Button';
import { Chips } from '@/components/Chips';
import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { AppointmentCard } from '@/features/calendar/AppointmentCard';
import { appointments } from '@/features/demo/data';
import { isOwner } from '@/features/demo/selectors';
import { CostingView } from '@/features/costing/CostingView';
import { useDemo } from '@/features/demo/store';
import { DocTimeline } from '@/features/projects/DocTimeline';
import { MaterialList } from '@/features/projects/MaterialList';
import { ProjectHeader } from '@/features/projects/ProjectHeader';
import { DocList } from '@/features/quotes/DocList';
import { de } from '@/i18n/de';
import { spacing } from '@/theme';

type Tab = 'doku' | 'material' | 'belege' | 'termine' | 'kalkulation';

export default function ProjektScreen() {
  const { id, tab } = useLocalSearchParams<{ id: string; tab?: Tab }>();
  const project = useDemo((s) => s.projects.find((p) => p.id === id));
  const allMedia = useDemo((s) => s.media);
  const allNotes = useDemo((s) => s.notes);
  const allMaterial = useDemo((s) => s.materialRequests);
  const allQuotes = useDemo((s) => s.quotes);
  const allInvoices = useDemo((s) => s.invoices);
  const [active, setActive] = useState<Tab>(tab ?? 'doku');

  if (!project) return <EmptyState icon="alert-circle" text={de.projekte.keine} />;

  const media = allMedia.filter((m) => m.projectId === id);
  const notes = allNotes.filter((n) => n.projectId === id);
  const material = allMaterial.filter((r) => r.projectId === id);
  const docs = [
    ...allQuotes.filter((q) => q.projectId === id),
    ...allInvoices.filter((i) => i.projectId === id),
  ];
  const dates = appointments
    .filter((a) => a.projectId === id)
    .sort((a, b) => a.start.localeCompare(b.start));

  const tabs: { value: Tab; label: string }[] = [
    { value: 'doku', label: `${de.akte.doku} ${media.length + notes.length}` },
    { value: 'material', label: `${de.akte.material} ${material.length}` },
    { value: 'belege', label: `${de.akte.belege} ${docs.length}` },
    { value: 'termine', label: `${de.akte.termine} ${dates.length}` },
  ];
  if (isOwner()) tabs.push({ value: 'kalkulation', label: de.akte.kalkulation });
  const add = (art: 'foto' | 'notiz' | 'angebot', tag?: 'mangel' | 'sonstiges') =>
    router.push({ pathname: '/neu/[art]', params: { art, projectId: project.id, tag } });

  return (
    <Screen>
      <Stack.Screen options={{ title: project.title }} />
      <ProjectHeader project={project} />
      <Chips options={tabs} value={active} onChange={setActive} />

      {active === 'doku' ? (
        <>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <View style={{ flex: 1 }}>
              <Button title={de.akte.fortschritt} onPress={() => add('foto', 'sonstiges')} />
            </View>
            <View style={{ flex: 1 }}>
              <Button
                title={de.akte.problemMelden}
                variant="secondary"
                onPress={() => add('foto', 'mangel')}
              />
            </View>
          </View>
          <Button title={de.akte.notizHinzu} variant="secondary" onPress={() => add('notiz')} />
          <DocTimeline projectId={project.id} />
        </>
      ) : null}

      {active === 'material' ? (
        <>
          <Button
            title={de.akte.materialAnfragen}
            onPress={() =>
              router.push({ pathname: '/material-neu', params: { projectId: project.id } })
            }
          />
          <MaterialList projectId={project.id} />
        </>
      ) : null}

      {active === 'belege' ? (
        <>
          <Button title={de.akte.angebotHinzu} onPress={() => add('angebot')} />
          {docs.length ? (
            <DocList docs={docs} />
          ) : (
            <EmptyState icon="document-text-outline" text={de.akte.keineBelege} />
          )}
        </>
      ) : null}

      {active === 'termine' ? (
        dates.length ? (
          dates.map((a) => <AppointmentCard key={a.id} appointment={a} />)
        ) : (
          <EmptyState icon="calendar-outline" text={de.akte.keineTermine} />
        )
      ) : null}
      {active === 'kalkulation' ? <CostingView projectId={project.id} /> : null}
    </Screen>
  );
}
