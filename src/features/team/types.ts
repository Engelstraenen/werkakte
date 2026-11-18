// Team & Nachwuchs (18.11.2026, siehe docs/ENTSCHEIDUNGEN.md). Im Prototyp im Speicher; später Tabellen
// job_opening, applicant, applicant_note, report_week (Drizzle + Supabase + RLS, nur Inhaber sieht Bewerber).

export type JobKind = 'fachkraft' | 'ausbildung' | 'quereinstieg' | 'kundendienst';

/** Offene Stelle, wie sie auf der Karriereseite der Webseite steht. */
export type JobOpening = {
  id: string;
  slug: string;
  kind: JobKind;
  title: string;
  /** Kurzname für Listen, z. B. „Monteur/in“. */
  short: string;
  /** Gehalt offen genannt, z. B. „3.400 – 4.100 €“. */
  salary: string;
  hours: string;
  open: boolean;
};

export type ApplicantStatus = 'neu' | 'angerufen' | 'probearbeiten' | 'zusage' | 'absage';

/** Woher die Bewerbung kam. Empfehlung = Job-Link eines Mitarbeiters (Prämie). */
export type ApplicantSource =
  { kind: 'webseite' } | { kind: 'foto-check' } | { kind: 'empfehlung'; memberId: string };

/** Bewerber-Akte: eine Bewerbung = eine Akte, wie ein Auftrag. */
export type Applicant = {
  id: string;
  name: string;
  phone: string;
  jobId: string;
  source: ApplicantSource;
  /** Antworten aus dem 60-Sekunden-Chat der Webseite. */
  answers: { question: string; answer: string }[];
  status: ApplicantStatus;
  createdAt: string;
  notes: { id: string; text: string; createdAt: string }[];
};

/** Ein Tageseintrag der Azubi: kommt automatisch aus Zeiten und Fotos der Projekte. */
export type WorkLogEntry = {
  id: string;
  memberId: string;
  date: string;
  /** Projekt aus der Werkakte oder Berufsschule. */
  projectId?: string;
  place: 'betrieb' | 'berufsschule';
  minutes: number;
  task: string;
  photos: number;
};

export type Azubi = {
  id: string;
  name: string;
  phone: string;
  lehrjahr: number;
  beruf: string;
  ausbilderId: string;
};

/** Status einer Berichtsheft-Woche: Azubi schließt ab, Ausbilder zeichnet ab. */
export type WeekStatus = 'offen' | 'abgeschlossen' | 'abgezeichnet';
