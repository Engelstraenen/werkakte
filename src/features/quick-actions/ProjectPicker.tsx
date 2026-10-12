import { Card } from '@/components/Card';
import { IconCircle } from '@/components/IconCircle';
import { ListRow } from '@/components/ListRow';
import { customerOf } from '@/features/demo/selectors';
import { CURRENT_MEMBER_ID } from '@/features/demo/data';
import { useDemo } from '@/features/demo/store';

/** Auswahl eines laufenden Projekts (nicht abgeschlossen/bezahlt), zuletzt bearbeitete zuerst. */
export function ProjectPicker({
  onPick,
  onlyMine,
}: {
  onPick: (projectId: string) => void;
  /** Nur Projekte, in deren Team ich bin (z. B. für Zeit starten). */
  onlyMine?: boolean;
}) {
  const projects = useDemo((s) => s.projects)
    .filter((p) => p.status !== 'bezahlt' && p.status !== 'abgeschlossen')
    .filter((p) => !onlyMine || p.memberIds.includes(CURRENT_MEMBER_ID))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return (
    <Card style={{ paddingVertical: 4 }}>
      {projects.map((p, i) => (
        <ListRow
          key={p.id}
          divider={i > 0}
          title={p.title}
          subtitle={`${customerOf(p).name} · ${p.street}`}
          left={<IconCircle name="folder-open" size={40} />}
          onPress={() => onPick(p.id)}
        />
      ))}
    </Card>
  );
}
