// Demo-Daten für Team & Nachwuchs. Daten relativ zu heute, damit die Demo immer frisch aussieht.
import type { Applicant, Azubi, JobOpening, WorkLogEntry } from './types';

function at(dayOffset: number, hour: number, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

/** Basis der Karriereseite, auf die der Job-Link zeigt (Demo-Webseite). */
export const CAREER_URL = 'https://warmherz.example/jobs.html';

export const jobs: JobOpening[] = [
  {
    id: 'j1',
    slug: 'monteur-waermepumpe',
    kind: 'fachkraft',
    short: 'Monteur/in',
    title: 'Anlagenmechaniker/in SHK',
    salary: '3.400 – 4.100 €',
    hours: '38 Std, Fr ab 13 Uhr frei',
    open: true,
  },
  {
    id: 'j2',
    slug: 'ausbildung-shk',
    kind: 'ausbildung',
    short: 'Azubi',
    title: 'Azubi Anlagenmechaniker/in',
    salary: '1.050 € im 1. Jahr',
    hours: 'Start August 2027',
    open: true,
  },
  {
    id: 'j3',
    slug: 'quereinstieg',
    kind: 'quereinstieg',
    short: 'Quereinstieg',
    title: 'Quereinsteiger/in Wärmepumpe',
    salary: 'ab 3.100 €',
    hours: '6 Monate bezahlte Einarbeitung',
    open: true,
  },
  {
    id: 'j4',
    slug: 'kundendienst',
    kind: 'kundendienst',
    short: 'Kundendienst',
    title: 'Kundendienst-Techniker/in',
    salary: '3.600 – 4.400 €',
    hours: 'Bereitschaft extra bezahlt',
    open: true,
  },
];

export const applicants: Applicant[] = [
  {
    id: 'b1',
    name: 'Jonas Becker',
    phone: '0176 555 12 34',
    jobId: 'j1',
    source: { kind: 'empfehlung', memberId: 'm2' },
    status: 'neu',
    createdAt: at(0, 7, 42),
    answers: [
      { question: 'Was machst du gerade?', answer: 'Gesell/in' },
      { question: 'Was reizt dich bei uns am meisten?', answer: 'Monteur/in' },
      { question: 'Wann darf der Chef anrufen?', answer: 'Ab 17 Uhr' },
    ],
    notes: [],
  },
  {
    id: 'b2',
    name: 'Emma Schulz',
    phone: '0152 444 88 21',
    jobId: 'j2',
    source: { kind: 'webseite' },
    status: 'angerufen',
    createdAt: at(-1, 19, 5),
    answers: [
      { question: 'Was machst du gerade?', answer: 'Schule' },
      { question: 'Was reizt dich bei uns am meisten?', answer: 'Ausbildung' },
      { question: 'Wann darf der Chef anrufen?', answer: 'Mittags' },
    ],
    notes: [
      {
        id: 'n1',
        text: 'Sehr motiviert. Praktikum in den Osterferien angeboten.',
        createdAt: at(0, 12, 30),
      },
    ],
  },
  {
    id: 'b3',
    name: 'Dennis Wolf',
    phone: '0160 777 34 90',
    jobId: 'j3',
    source: { kind: 'webseite' },
    status: 'probearbeiten',
    createdAt: at(-4, 21, 12),
    answers: [
      { question: 'Was machst du gerade?', answer: 'Was ganz anderes' },
      { question: 'Was reizt dich bei uns am meisten?', answer: 'Quereinstieg' },
      { question: 'Wann darf der Chef anrufen?', answer: 'Vormittags' },
    ],
    notes: [
      {
        id: 'n2',
        text: 'KFZ-Mechatroniker, 8 Jahre. Probearbeiten Donnerstag mit Lukas.',
        createdAt: at(-2, 9, 0),
      },
    ],
  },
];

export const azubis: Azubi[] = [
  {
    id: 'a1',
    name: 'Lea Krüger',
    phone: '0157 222 90 18',
    lehrjahr: 2,
    beruf: 'Anlagenmechanikerin SHK',
    ausbilderId: 'm1',
  },
];

/** Tageseinträge der letzten zwei Wochen – so, wie sie aus Zeiten und Fotos entstehen. */
const plan: [number, string | undefined, 'betrieb' | 'berufsschule', number, string, number][] = [
  [-13, 'p1', 'betrieb', 480, 'Vorwandelement gesetzt, Abflussrohre verlegt', 3],
  [-12, 'p1', 'betrieb', 480, 'Kupferrohre für Waschtisch verpresst', 2],
  [-11, undefined, 'berufsschule', 480, 'Lernfeld 6: Trinkwasseranlagen', 0],
  [-10, 'p7', 'betrieb', 450, 'Randdämmstreifen verlegt, Verteiler montiert', 4],
  [-9, 'p7', 'betrieb', 300, 'Heizkreise gespült, Druckprobe mit Mehmet', 1],
  [-6, 'p1', 'betrieb', 480, 'Fliesenschnitt vorbereitet, Silikonfugen gezogen', 2],
  [-5, 'p1', 'betrieb', 480, 'Spiegelschrank montiert, Undichtigkeit gemeldet', 3],
  [-4, undefined, 'berufsschule', 480, 'Lernfeld 7: Wärmepumpen-Grundlagen', 0],
  [-3, 'p7', 'betrieb', 480, 'Fußbodenheizung Verkaufsraum: Rohre eingelegt', 5],
  [-2, 'p7', 'betrieb', 360, 'Verteiler angeschlossen, Heizkreise beschriftet', 2],
];
export const workLog: WorkLogEntry[] = plan.map(
  ([d, projectId, place, minutes, task, photos], i) => ({
    id: `w${i + 1}`,
    memberId: 'a1',
    date: at(d, 16),
    projectId,
    place,
    minutes,
    task,
    photos,
  }),
);

/** Prämie pro erfolgreicher Empfehlung (Mitarbeiter wirbt Mitarbeiter). */
export const REFERRAL_BONUS_CENTS = 100000;
