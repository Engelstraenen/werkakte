import { router } from 'expo-router';

import { Card } from '@/components/Card';
import { IconCircle } from '@/components/IconCircle';
import { ListRow } from '@/components/ListRow';
import { customerOf, type Task } from '@/features/demo/selectors';
import { useDemo } from '@/features/demo/store';

const icon = { danger: 'alert-circle', warning: 'flag', info: 'chatbubble-ellipses' } as const;

export function TaskList({ tasks }: { tasks: Task[] }) {
  const projects = useDemo((s) => s.projects);
  return (
    <Card style={{ paddingVertical: 4 }}>
      {tasks.map((t, i) => {
        const project = projects.find((p) => p.id === t.projectId)!;
        return (
          <ListRow
            key={t.id}
            divider={i > 0}
            title={t.text}
            subtitle={`${project.title} · ${customerOf(project).name}`}
            left={<IconCircle name={icon[t.tone]} tone={t.tone} size={40} />}
            onPress={() => router.push({ pathname: '/projekt/[id]', params: { id: project.id } })}
          />
        );
      })}
    </Card>
  );
}
