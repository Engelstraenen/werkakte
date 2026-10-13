import { router } from 'expo-router';

import { AppText } from '@/components/AppText';
import { Avatar } from '@/components/Avatar';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { Section } from '@/components/Section';
import { AppointmentCard } from '@/features/calendar/AppointmentCard';
import { CURRENT_MEMBER_ID } from '@/features/demo/data';
import { appointmentsOn, memberById, openTasks } from '@/features/demo/selectors';
import { useDemo } from '@/features/demo/store';
import { ProjectCard } from '@/features/projects/ProjectCard';
import { TaskList } from '@/features/today/TaskList';
import { TimerCard } from '@/features/today/TimerCard';
import { de } from '@/i18n/de';
import { formatDayLong } from '@/lib/date';

const greeting = (h: number) => (h < 11 ? de.heute.morgen : h < 18 ? de.heute.tag : de.heute.abend);

export default function HeuteScreen() {
  const { projects, quotes, invoices, media, materialRequests, reminders } = useDemo();
  const now = new Date();
  const me = memberById(CURRENT_MEMBER_ID);
  const today = appointmentsOn(now);
  const tasks = openTasks(
    projects,
    quotes,
    invoices,
    media,
    materialRequests,
    reminders.followUp ? reminders.followUpDays : Infinity,
  );
  const recent = [...projects].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 3);

  return (
    <Screen
      subtitle={formatDayLong(now)}
      title={`${greeting(now.getHours())}, ${me.name.split(' ')[0]}`}
      right={<Avatar name={me.name} size={48} />}
    >
      <TimerCard />

      <Section title={`${de.heute.termine} (${today.length})`}>
        {today.length === 0 ? (
          <Card>
            <AppText muted>{de.heute.keineTermine}</AppText>
          </Card>
        ) : (
          today.map((a) => <AppointmentCard key={a.id} appointment={a} now={now} />)
        )}
      </Section>

      <Section title={`${de.heute.aufgaben} (${tasks.length})`}>
        <TaskList tasks={tasks} />
      </Section>

      <Section
        title={de.heute.zuletzt}
        action={{ label: de.heute.alle, onPress: () => router.navigate('/projekte') }}
      >
        {recent.map((p) => (
          <ProjectCard key={p.id} project={p} />
        ))}
      </Section>
    </Screen>
  );
}
