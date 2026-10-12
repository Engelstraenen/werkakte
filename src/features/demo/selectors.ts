import { appointments, CURRENT_MEMBER_ID, customers, members, suppliers } from './data';
import type { Invoice, Media, Project, ProjectCost, ProjectStatus, Quote } from './types';

import { isSameDay } from '@/lib/date';
import { documentTotals } from '@/lib/money';

export const customerOf = (p: Project) => customers.find((c) => c.id === p.customerId)!;
export const memberById = (id: string) => members.find((m) => m.id === id)!;
export const supplierById = (id: string) => suppliers.find((s) => s.id === id)!;
/** Einkaufspreise, Kosten und Gewinn sieht nur der Inhaber. */
export const isOwner = () => memberById(CURRENT_MEMBER_ID).role === 'inhaber';
export const appointmentsOn = (day: Date) =>
  appointments
    .filter((a) => isSameDay(new Date(a.start), day))
    .sort((a, b) => a.start.localeCompare(b.start));

export const docTotal = (d: Quote | Invoice) => documentTotals(d.items).grossCents;

export const statusOrder: ProjectStatus[] = [
  'anfrage',
  'angebot',
  'beauftragt',
  'in_arbeit',
  'abgeschlossen',
  'bezahlt',
];

export type Task = {
  id: string;
  projectId: string;
  text: string;
  tone: 'danger' | 'warning' | 'info';
};

/** Offene Aufgaben werden aus den Daten abgeleitet – kein eigenes Aufgaben-Modul im MVP. */
export function openTasks(
  projects: Project[],
  quotes: Quote[],
  invoices: Invoice[],
  media: Media[],
  followUpDays = 7,
  now = new Date(),
): Task[] {
  const tasks: Task[] = [];
  for (const inv of invoices) {
    if (inv.status === 'versendet' && new Date(inv.dueDate) < now)
      tasks.push({
        id: `t-${inv.id}`,
        projectId: inv.projectId,
        text: `Rechnung ${inv.number} überfällig`,
        tone: 'danger',
      });
  }
  for (const q of quotes) {
    const ageDays = (now.getTime() - new Date(q.date).getTime()) / 86400000;
    if (q.status === 'versendet' && ageDays > followUpDays)
      tasks.push({
        id: `t-${q.id}`,
        projectId: q.projectId,
        text: `Angebot ${q.number} nachfassen`,
        tone: 'warning',
      });
    if (q.status === 'entwurf')
      tasks.push({
        id: `t-${q.id}`,
        projectId: q.projectId,
        text: `Angebot ${q.number} fertigstellen`,
        tone: 'info',
      });
  }
  const active = new Set(projects.filter((p) => p.status === 'in_arbeit').map((p) => p.id));
  for (const m of media) {
    if (m.tag === 'mangel' && active.has(m.projectId))
      tasks.push({
        id: `t-${m.id}`,
        projectId: m.projectId,
        text: `Mangel klären: ${m.note}`,
        tone: 'warning',
      });
  }
  for (const p of projects) {
    if (p.status === 'anfrage')
      tasks.push({
        id: `t-${p.id}`,
        projectId: p.id,
        text: 'Neue Anfrage – Termin vereinbaren',
        tone: 'info',
      });
  }
  return tasks;
}

/** Titelbild: selbst gewählt, sonst neuestes Nachher-Foto, sonst neuestes Foto. */
export function coverOf(project: Project, media: Media[]): Media | undefined {
  const own = media
    .filter((m) => m.projectId === project.id)
    .sort((a, b) => b.takenAt.localeCompare(a.takenAt));
  return (
    own.find((m) => m.id === project.coverMediaId) ?? own.find((m) => m.tag === 'nachher') ?? own[0]
  );
}

/** Alle erfassten Minuten eines Projekts (Zeit-Button + von Hand eingetragen). */
export const projectMinutes = (projectId: string, costs: ProjectCost[]) =>
  costs.reduce(
    (sum, c) => (c.projectId === projectId && c.kind === 'stunden' ? sum + c.minutes : sum),
    0,
  );
